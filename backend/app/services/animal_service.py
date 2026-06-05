import json
import uuid
from datetime import date, datetime, timezone
from typing import Optional, List
import asyncpg
from ..models.animal import AnimalCreate, AnimalUpdate, AnimalStatusUpdate


def compute_confidence(animal_dict: dict, submitter_tier: str) -> float:
    """Compute confidence score based on data completeness and submitter tier."""
    optional_fields = [
        "sex", "altered", "size", "primary_breed", "secondary_breed",
        "primary_color", "coat_length", "estimated_birthdate", "age_months",
        "weight_kg", "description", "adoption_fee", "good_with_dogs",
        "good_with_cats", "good_with_kids", "photo_urls", "listing_url",
        "location_postal_code", "location_city", "location_state",
    ]
    filled = 0
    for field in optional_fields:
        val = animal_dict.get(field)
        if val is not None and val != "" and val != [] and val is not False:
            filled += 1
    completeness = filled / len(optional_fields)
    tier_bonus = {
        "tier_0_self_asserted": 0.0,
        "tier_1_verified": 0.15,
        "tier_2_trusted": 0.3,
    }.get(submitter_tier, 0.0)
    photo_bonus = 0.1 if animal_dict.get("photo_urls") else 0.0
    desc = animal_dict.get("description") or ""
    desc_bonus = 0.1 if len(desc) > 100 else 0.0
    return min(completeness + tier_bonus + photo_bonus + desc_bonus, 1.0)


def _enum_to_str(val):
    """Convert enum values to their string representation."""
    if val is None:
        return None
    return val.value if hasattr(val, "value") else val


def _row_to_dict(row: asyncpg.Record) -> dict:
    """Convert asyncpg Record to dict, handling UUID and JSON fields."""
    d = dict(row)
    # Convert UUIDs to strings
    for key in ("id", "organization_id", "canonical_id"):
        if key in d and d[key] is not None:
            d[key] = str(d[key])
    # Parse JSONB photo_urls if it's a string
    if "photo_urls" in d and isinstance(d["photo_urls"], str):
        d["photo_urls"] = json.loads(d["photo_urls"])
    return d


class AnimalService:
    def __init__(self, conn: asyncpg.Connection, org: Optional[dict] = None):
        self.conn = conn
        self.org = org

    async def upsert_animal(self, animal: AnimalCreate, idempotency_key: Optional[str] = None) -> dict:
        data = animal.model_dump(exclude_unset=True)
        data["organization_id"] = self.org["id"]
        data["submitter_verification_tier"] = self.org["verification_tier"]
        data["confidence_score"] = compute_confidence(data, self.org["verification_tier"])

        # Convert all enum fields to their string values
        enum_fields = [
            "species", "sex", "altered", "size", "sac_age_group", "status",
            "good_with_dogs", "good_with_cats", "good_with_kids",
        ]
        for field in enum_fields:
            if field in data:
                data[field] = _enum_to_str(data[field])

        # Serialize photo_urls to JSON string for JSONB column
        if "photo_urls" in data:
            data["photo_urls"] = json.dumps(data["photo_urls"])

        # Build upsert query
        columns = list(data.keys())
        placeholders = [f"${i+1}" for i in range(len(columns))]
        values = [data[c] for c in columns]

        # Columns to update on conflict (exclude organization_id and external_id)
        update_cols = [c for c in columns if c not in ("organization_id", "external_id")]
        update_set = ", ".join(f"{c} = EXCLUDED.{c}" for c in update_cols)
        update_set += ", updated_at = now(), last_seen_at = now()"

        query = f"""
            INSERT INTO animals ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            ON CONFLICT (organization_id, external_id) DO UPDATE SET {update_set}
            RETURNING *
        """
        row = await self.conn.fetchrow(query, *values)
        return _row_to_dict(row)

    async def list_animals(self, cursor: Optional[str] = None, limit: int = 20) -> List[dict]:
        params: list = [self.org["id"]]
        query = "SELECT * FROM animals WHERE organization_id = $1"
        if cursor:
            query += " AND id > $2"
            params.append(uuid.UUID(cursor))
        query += f" ORDER BY id ASC LIMIT ${len(params) + 1}"
        params.append(limit)
        rows = await self.conn.fetch(query, *params)
        return [_row_to_dict(r) for r in rows]

    async def get_animal(self, external_id: str) -> Optional[dict]:
        row = await self.conn.fetchrow(
            "SELECT * FROM animals WHERE organization_id = $1 AND external_id = $2",
            self.org["id"], external_id,
        )
        return _row_to_dict(row) if row else None

    async def update_animal(self, external_id: str, update: AnimalUpdate) -> Optional[dict]:
        existing = await self.get_animal(external_id)
        if not existing:
            return None
        update_data = update.model_dump(exclude_unset=True)
        if not update_data:
            return existing
        # Convert enums to strings
        for k, v in update_data.items():
            update_data[k] = _enum_to_str(v) if v is not None and hasattr(v, "value") else v
        if "photo_urls" in update_data and update_data["photo_urls"] is not None:
            update_data["photo_urls"] = json.dumps(update_data["photo_urls"])

        # Build SET clause with correct parameter numbering
        set_parts = []
        values = []
        for i, (k, v) in enumerate(update_data.items()):
            set_parts.append(f"{k} = ${i + 1}")
            values.append(v)
        set_parts.append("updated_at = now()")

        idx_org = len(values) + 1
        idx_ext = len(values) + 2
        values.append(self.org["id"])
        values.append(external_id)

        query = f"""
            UPDATE animals SET {', '.join(set_parts)}
            WHERE organization_id = ${idx_org} AND external_id = ${idx_ext}
            RETURNING *
        """
        row = await self.conn.fetchrow(query, *values)
        return _row_to_dict(row) if row else None

    async def soft_delete_animal(self, external_id: str) -> Optional[dict]:
        old = await self.get_animal(external_id)
        if not old:
            return None
        row = await self.conn.fetchrow(
            "UPDATE animals SET status = 'removed', updated_at = now() WHERE organization_id = $1 AND external_id = $2 RETURNING *",
            self.org["id"], external_id,
        )
        return _row_to_dict(row) if row else None

    async def update_status(self, external_id: str, update: AnimalStatusUpdate) -> Optional[dict]:
        new_status = _enum_to_str(update.status)
        if new_status in ("adopted", "removed") and not update.outcome_type:
            raise ValueError("outcome_type required when status is 'adopted' or 'removed'")
        old = await self.get_animal(external_id)
        if not old:
            return None
        # Record status history
        await self.conn.execute(
            """INSERT INTO status_history (animal_id, old_status, new_status, outcome_type, effective_at)
               VALUES ($1, $2, $3, $4, $5)""",
            uuid.UUID(old["id"]), old["status"], new_status,
            update.outcome_type, update.effective_at or datetime.now(timezone.utc),
        )
        # Update animal
        row = await self.conn.fetchrow(
            "UPDATE animals SET status = $1, updated_at = now() WHERE id = $2 RETURNING *",
            new_status, uuid.UUID(old["id"]),
        )
        return _row_to_dict(row) if row else None

    # --- Public API methods ---

    async def public_list_dogs(
        self, sort: str, filters: dict, cursor: Optional[str] = None, limit: int = 20
    ) -> dict:
        """Build filtered query for public dog browsing."""
        where_parts = ["species = 'dog'", "status = 'adoptable'"]
        params: list = []
        idx = 1

        for key, val in filters.items():
            if val is None:
                continue
            if key == "breed":
                where_parts.append(f"primary_breed ILIKE ${idx}")
                params.append(f"%{val}%")
                idx += 1
            elif key == "size" and val:
                placeholders = ", ".join(f"${idx + i}" for i in range(len(val)))
                where_parts.append(f"size IN ({placeholders})")
                params.extend(val)
                idx += len(val)
            elif key == "age_group":
                if val == "puppy":
                    where_parts.append("(age_months < 5 OR sac_age_group = 'under_5_months')")
                elif val == "adult":
                    where_parts.append("(age_months >= 5 OR sac_age_group = 'adult')")
            elif key == "sex":
                where_parts.append(f"sex = ${idx}")
                params.append(val)
                idx += 1
            elif key in ("good_with_dogs", "good_with_cats", "good_with_kids"):
                where_parts.append(f"{key} = 'yes'")
            elif key == "special_needs" and val:
                where_parts.append(f"special_needs = ${idx}")
                params.append(val)
                idx += 1
            elif key == "state":
                where_parts.append(f"location_state = ${idx}")
                params.append(val)
                idx += 1

        # Cursor-based pagination
        if cursor:
            where_parts.append(f"id > ${idx}")
            params.append(uuid.UUID(cursor))
            idx += 1

        where_clause = " AND ".join(where_parts)

        # Sort order
        if sort == "days_waiting":
            order = "intake_date ASC"
        elif sort == "newest":
            order = "first_listed_at DESC"
        else:
            order = "intake_date ASC"

        # Get items + 1 to detect if there's a next page
        params.append(limit + 1)
        query = f"""
            SELECT a.*, o.legal_name AS org_legal_name, o.org_type AS org_type_val,
                   o.verification_tier AS org_verification_tier
            FROM animals a
            JOIN organizations o ON a.organization_id = o.id
            WHERE {where_clause}
            ORDER BY {order}
            LIMIT ${idx}
        """
        rows = await self.conn.fetch(query, *params)
        items = [_row_to_dict(r) for r in rows[:limit]]

        # Determine next cursor
        next_cursor = None
        if len(rows) > limit:
            next_cursor = items[-1]["id"]

        # Get total count
        count_query = f"SELECT COUNT(*) FROM animals WHERE {where_clause}"
        total = await self.conn.fetchval(count_query, *params[:-1])

        return {
            "items": items,
            "next_cursor": next_cursor,
            "total_count": total,
        }

    async def get_public_dog(self, dog_id: str) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """SELECT a.*, o.legal_name AS org_legal_name, o.org_type AS org_type_val,
                      o.verification_tier AS org_verification_tier
               FROM animals a
               JOIN organizations o ON a.organization_id = o.id
               WHERE a.id = $1 AND a.species = 'dog' AND a.status IN ('adoptable', 'pending')""",
            uuid.UUID(dog_id),
        )
        return _row_to_dict(row) if row else None

    async def get_longest_waiting_dogs(self, limit: int = 10) -> List[dict]:
        rows = await self.conn.fetch(
            """SELECT a.*, o.legal_name AS org_legal_name, o.org_type AS org_type_val,
                      o.verification_tier AS org_verification_tier
               FROM animals a
               JOIN organizations o ON a.organization_id = o.id
               WHERE a.species = 'dog' AND a.status = 'adoptable'
               ORDER BY a.intake_date ASC
               LIMIT $1""",
            limit,
        )
        return [_row_to_dict(r) for r in rows]
