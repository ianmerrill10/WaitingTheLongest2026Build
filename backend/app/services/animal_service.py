"""
animal_service.py -- Data access for animal listings.

Public reads query the `dog_listings` view (never raw tables).
Writes go to the `animals` table directly.
All queries use asyncpg parameterized placeholders ($1, $2, ...).
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Optional

import asyncpg


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _row_to_dict(row: asyncpg.Record) -> dict:
    """Convert asyncpg Record to dict with UUID->str conversion."""
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, uuid.UUID):
            d[k] = str(v)
    return d


def _enum_to_str(val):
    """Convert Python enum to its string value, pass-through for plain strings."""
    if val is None:
        return None
    return val.value if hasattr(val, "value") else val


def _compute_confidence(data: dict, submitter_tier: str) -> float:
    """Score data completeness + submitter trust.  0.0-1.0 range."""
    optional_fields = [
        "sex", "altered", "size", "primary_breed", "secondary_breed",
        "primary_color", "coat_length", "estimated_birthdate", "age_months",
        "weight_kg", "description", "adoption_fee", "good_with_dogs",
        "good_with_cats", "good_with_kids", "photo_urls", "listing_url",
        "location_postal_code", "location_city", "location_state",
    ]
    filled = sum(
        1 for f in optional_fields
        if data.get(f) not in (None, "", [], False)
    )
    completeness = filled / len(optional_fields)
    tier_bonus = {
        "tier_0_self_asserted": 0.0,
        "tier_1_verified": 0.15,
        "tier_2_trusted": 0.3,
    }.get(submitter_tier, 0.0)
    photo_bonus = 0.1 if data.get("photo_urls") else 0.0
    desc_bonus = 0.1 if len(data.get("description") or "") > 100 else 0.0
    return min(completeness + tier_bonus + photo_bonus + desc_bonus, 1.0)


# ---------------------------------------------------------------------------
# Write operations (target: animals TABLE)
# ---------------------------------------------------------------------------

async def create_animal(conn: asyncpg.Connection, org_id: str, data: dict) -> dict:
    """INSERT a new animal into the animals table and return the created record."""
    # Inject server-side fields
    data["organization_id"] = uuid.UUID(org_id)

    # Convert any enum values to plain strings
    enum_fields = [
        "species", "sex", "altered", "size", "sac_age_group", "status",
        "good_with_dogs", "good_with_cats", "good_with_kids",
    ]
    for field in enum_fields:
        if field in data:
            data[field] = _enum_to_str(data[field])

    # photo_urls stays as a Python list -- asyncpg handles text[] natively
    columns = list(data.keys())
    placeholders = [f"${i + 1}" for i in range(len(columns))]
    values = [data[c] for c in columns]

    query = f"""
        INSERT INTO animals ({', '.join(columns)})
        VALUES ({', '.join(placeholders)})
        RETURNING *
    """
    row = await conn.fetchrow(query, *values)
    return _row_to_dict(row)


async def update_animal(
    conn: asyncpg.Connection,
    org_id: str,
    external_id: str,
    data: dict,
) -> Optional[dict]:
    """UPDATE an existing animal by (organization_id, external_id).

    Returns the updated record, or None if no matching row exists.
    """
    if not data:
        return None

    # Convert enums to strings
    for k, v in list(data.items()):
        data[k] = _enum_to_str(v)

    set_parts = []
    values: list = []
    for i, (col, val) in enumerate(data.items(), start=1):
        set_parts.append(f"{col} = ${i}")
        values.append(val)

    set_parts.append("updated_at = now()")

    idx_org = len(values) + 1
    idx_ext = len(values) + 2
    values.append(uuid.UUID(org_id))
    values.append(external_id)

    query = f"""
        UPDATE animals
        SET {', '.join(set_parts)}
        WHERE organization_id = ${idx_org} AND external_id = ${idx_ext}
        RETURNING *
    """
    row = await conn.fetchrow(query, *values)
    return _row_to_dict(row) if row else None


async def upsert_animal(conn: asyncpg.Connection, org_id: str, data: dict) -> dict:
    """INSERT ... ON CONFLICT (organization_id, external_id) DO UPDATE.

    Returns the created-or-updated record.
    """
    data["organization_id"] = uuid.UUID(org_id)

    # Convert enums
    enum_fields = [
        "species", "sex", "altered", "size", "sac_age_group", "status",
        "good_with_dogs", "good_with_cats", "good_with_kids",
    ]
    for field in enum_fields:
        if field in data:
            data[field] = _enum_to_str(data[field])

    columns = list(data.keys())
    placeholders = [f"${i + 1}" for i in range(len(columns))]
    values = [data[c] for c in columns]

    # On conflict, update every column except the upsert keys
    update_cols = [c for c in columns if c not in ("organization_id", "external_id")]
    update_set = ", ".join(f"{c} = EXCLUDED.{c}" for c in update_cols)
    update_set += ", updated_at = now(), last_seen_at = now()"

    query = f"""
        INSERT INTO animals ({', '.join(columns)})
        VALUES ({', '.join(placeholders)})
        ON CONFLICT (organization_id, external_id) DO UPDATE SET {update_set}
        RETURNING *
    """
    row = await conn.fetchrow(query, *values)
    return _row_to_dict(row)


async def update_status(
    conn: asyncpg.Connection,
    animal_id: str,
    org_id: str,
    new_status: str,
    outcome_type: Optional[str] = None,
    notes: Optional[str] = None,
) -> dict:
    """Change an animal's status and record the transition in status_history.

    Raises ValueError if the animal is not found or does not belong to org_id.
    """
    aid = uuid.UUID(animal_id)
    oid = uuid.UUID(org_id)

    # Fetch current status (write path reads raw table)
    old = await conn.fetchrow(
        "SELECT id, status FROM animals WHERE id = $1 AND organization_id = $2",
        aid, oid,
    )
    if not old:
        raise ValueError("Animal not found or does not belong to this organization")

    old_status = old["status"]

    # Record in status_history
    await conn.execute(
        """INSERT INTO status_history
               (animal_id, old_status, new_status, outcome_type, effective_at)
           VALUES ($1, $2, $3, $4, $5)""",
        aid,
        old_status,
        new_status,
        outcome_type,
        datetime.now(timezone.utc),
    )

    # Update the animal row
    row = await conn.fetchrow(
        "UPDATE animals SET status = $1, updated_at = now() WHERE id = $2 RETURNING *",
        new_status,
        aid,
    )
    return _row_to_dict(row)


# ---------------------------------------------------------------------------
# Read operations (target: dog_listings VIEW)
# ---------------------------------------------------------------------------

async def get_animal_by_id(
    conn: asyncpg.Connection,
    animal_id: str,
) -> Optional[dict]:
    """Fetch a single dog listing by its UUID (reads from the dog_listings view)."""
    row = await conn.fetchrow(
        "SELECT * FROM dog_listings WHERE id = $1",
        uuid.UUID(animal_id),
    )
    return _row_to_dict(row) if row else None


async def get_animal_by_external_id(
    conn: asyncpg.Connection,
    org_id: str,
    external_id: str,
) -> Optional[dict]:
    """Lookup a dog listing by org + external_id (reads from dog_listings view)."""
    row = await conn.fetchrow(
        "SELECT * FROM dog_listings WHERE organization_id = $1 AND external_id = $2",
        uuid.UUID(org_id),
        external_id,
    )
    # dog_listings view does not expose external_id; fall back to raw table
    # for the lookup key, then re-read through the view by id.
    if row is None:
        raw = await conn.fetchrow(
            "SELECT id FROM animals WHERE organization_id = $1 AND external_id = $2",
            uuid.UUID(org_id),
            external_id,
        )
        if raw is None:
            return None
        row = await conn.fetchrow(
            "SELECT * FROM dog_listings WHERE id = $1",
            raw["id"],
        )
    return _row_to_dict(row) if row else None


async def list_public_dogs(
    conn: asyncpg.Connection,
    *,
    page: int = 1,
    per_page: int = 20,
    sort: str = "days_waiting_desc",
    breed: Optional[str] = None,
    size: Optional[str] = None,
    age_group: Optional[str] = None,
    good_with_dogs: Optional[bool] = None,
    good_with_cats: Optional[bool] = None,
    good_with_kids: Optional[bool] = None,
    special_needs: Optional[bool] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_miles: Optional[float] = None,
) -> tuple[list[dict], int]:
    """Filtered, sorted, paginated listing from the dog_listings view.

    Returns (rows, total_count).  Only adoptable dogs are returned.
    When lat/lng/radius_miles are all provided, a PostGIS ST_DWithin geo
    filter is applied and a ``distance_miles`` column is added to every row.
    """
    conditions: list[str] = ["status = 'adoptable'"]
    params: list = []
    idx = 1  # next asyncpg placeholder index

    # --- optional filters ------------------------------------------------

    if breed:
        conditions.append(
            f"(primary_breed ILIKE ${idx} OR secondary_breed ILIKE ${idx})"
        )
        params.append(f"%{breed}%")
        idx += 1

    if size:
        # Accept comma-separated sizes: "small,medium"
        sizes = [s.strip() for s in size.split(",") if s.strip()]
        if sizes:
            placeholders = ", ".join(f"${idx + i}" for i in range(len(sizes)))
            conditions.append(f"size::text IN ({placeholders})")
            params.extend(sizes)
            idx += len(sizes)

    if age_group:
        if age_group == "puppy":
            conditions.append(
                "(age_months < 5 OR sac_age_group = 'under_5_months')"
            )
        elif age_group == "adult":
            conditions.append(
                "(age_months >= 5 OR sac_age_group = 'adult')"
            )

    if good_with_dogs is True:
        conditions.append("good_with_dogs = 'yes'")

    if good_with_cats is True:
        conditions.append("good_with_cats = 'yes'")

    if good_with_kids is True:
        conditions.append("good_with_kids = 'yes'")

    if special_needs is True:
        conditions.append("special_needs = true")

    if state:
        conditions.append(f"location_state = ${idx}")
        params.append(state.upper())
        idx += 1

    if city:
        conditions.append(f"location_city ILIKE ${idx}")
        params.append(f"%{city}%")
        idx += 1

    # --- geo filter (PostGIS) --------------------------------------------
    # ST_MakePoint takes (longitude, latitude) -- note the order.
    geo_active = lat is not None and lng is not None and radius_miles is not None
    geo_idx_lat: Optional[int] = None
    geo_idx_lng: Optional[int] = None

    if geo_active:
        geo_idx_lat = idx
        geo_idx_lng = idx + 1
        radius_idx = idx + 2
        conditions.append(
            f"ST_DWithin(geog, ST_MakePoint(${geo_idx_lng}, ${geo_idx_lat})::geography, ${radius_idx})"
        )
        params.extend([lat, lng, radius_miles * 1609.34])
        idx += 3

    where = " AND ".join(conditions)

    # --- sort ------------------------------------------------------------
    sort_map = {
        "days_waiting_desc": "days_waiting DESC NULLS LAST",
        "days_waiting_asc": "days_waiting ASC NULLS LAST",
        "name_asc": "name ASC",
        "recently_added": "first_listed_at DESC NULLS LAST",
        "nearest": "distance_miles ASC NULLS LAST",
    }
    order = sort_map.get(sort, "days_waiting DESC NULLS LAST")

    # --- distance column (only when lat/lng supplied) --------------------
    distance_col = ""
    if lat is not None and lng is not None:
        if geo_active:
            # Reuse the same param indices that were already appended
            distance_col = (
                f", ST_Distance(geog, ST_MakePoint(${geo_idx_lng}, ${geo_idx_lat})"
                f"::geography) / 1609.34 AS distance_miles"
            )
        else:
            # No radius filter, but still compute distance for sorting/display
            geo_idx_lat = idx
            geo_idx_lng = idx + 1
            distance_col = (
                f", ST_Distance(geog, ST_MakePoint(${geo_idx_lng}, ${geo_idx_lat})"
                f"::geography) / 1609.34 AS distance_miles"
            )
            params.extend([lat, lng])
            idx += 2

    # --- count -----------------------------------------------------------
    count_query = f"SELECT COUNT(*) FROM dog_listings WHERE {where}"
    # Count params are everything before the distance-only params (if any)
    # Distance params that are NOT part of the geo filter must not be in count
    count_params = params[:len(params)] if geo_active or (lat is None) else params[:-2]
    # Simpler: count query uses same WHERE clause as data query, so same params
    # Distance-only params (no radius) are not in WHERE, so trim them
    if (lat is not None and lng is not None) and not geo_active:
        count_params = params[:-2]
    else:
        count_params = list(params)

    total = await conn.fetchval(count_query, *count_params)

    # --- data query ------------------------------------------------------
    limit_idx = idx
    offset_idx = idx + 1
    params.extend([per_page, (page - 1) * per_page])

    data_query = f"""
        SELECT *{distance_col}
        FROM dog_listings
        WHERE {where}
        ORDER BY {order}
        LIMIT ${limit_idx} OFFSET ${offset_idx}
    """
    rows = await conn.fetch(data_query, *params)

    return [_row_to_dict(r) for r in rows], total


async def get_featured_dogs(conn: asyncpg.Connection) -> dict:
    """Return featured dogs for the homepage.

    Returns {"longest_waiting": [...top 6...], "recently_added": [...newest 6...]}.
    Both lists read from the dog_listings view, status='adoptable' only.
    """
    longest = await conn.fetch(
        """SELECT * FROM dog_listings
           WHERE status = 'adoptable'
           ORDER BY days_waiting DESC NULLS LAST
           LIMIT 6"""
    )
    recent = await conn.fetch(
        """SELECT * FROM dog_listings
           WHERE status = 'adoptable'
           ORDER BY first_listed_at DESC NULLS LAST
           LIMIT 6"""
    )
    return {
        "longest_waiting": [_row_to_dict(r) for r in longest],
        "recently_added": [_row_to_dict(r) for r in recent],
    }
