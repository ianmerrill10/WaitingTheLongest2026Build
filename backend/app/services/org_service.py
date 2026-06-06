"""
org_service.py -- Organization CRUD and API-key management.

Public reads use the `shelters_public` view.
Writes go to the `organizations` and `api_keys` tables directly.
All queries use asyncpg parameterized placeholders ($1, $2, ...).
"""

import secrets
import uuid
from typing import Optional

import asyncpg
import bcrypt


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


def _generate_api_key() -> tuple[str, str, str]:
    """Create a new API key.

    Returns (plaintext_key, key_prefix, bcrypt_hash).
    Format: ``wtl_`` + 40 random hex characters.
    Prefix: first 12 characters of the full key (used for DB lookup).
    """
    raw_hex = secrets.token_hex(20)  # 40 hex chars
    plaintext = f"wtl_{raw_hex}"
    prefix = plaintext[:12]
    hashed = bcrypt.hashpw(plaintext.encode(), bcrypt.gensalt()).decode()
    return plaintext, prefix, hashed


# ---------------------------------------------------------------------------
# Write operations (target: organizations, api_keys TABLES)
# ---------------------------------------------------------------------------

async def create_organization(
    conn: asyncpg.Connection,
    data: dict,
) -> tuple[dict, str]:
    """Register a new organization and generate its first API key.

    Returns (org_dict, plaintext_api_key).  The plaintext key is shown
    exactly once; only the bcrypt hash is stored.
    """
    # Check EIN uniqueness (if supplied)
    if data.get("ein"):
        existing = await conn.fetchrow(
            "SELECT id FROM organizations WHERE ein = $1",
            data["ein"],
        )
        if existing:
            raise ValueError("EIN already registered")

    # Convert enum values to strings
    if hasattr(data.get("org_type"), "value"):
        data["org_type"] = data["org_type"].value

    row = await conn.fetchrow(
        """INSERT INTO organizations
               (legal_name, ein, website, contact_email, contact_phone,
                org_type, postal_code, city, state, country)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *""",
        data.get("legal_name"),
        data.get("ein"),
        data.get("website"),
        data.get("contact_email"),
        data.get("contact_phone"),
        data.get("org_type"),
        data.get("postal_code"),
        data.get("city"),
        data.get("state"),
        data.get("country", "US"),
    )
    org = _row_to_dict(row)

    # Generate API key
    plaintext_key, key_prefix, key_hash = _generate_api_key()

    await conn.execute(
        """INSERT INTO api_keys
               (organization_id, key_hash, key_prefix, tier)
           VALUES ($1, $2, $3, $4)""",
        row["id"],  # keep as UUID for the FK
        key_hash,
        key_prefix,
        "tier_0_self_asserted",
    )

    return org, plaintext_key


# ---------------------------------------------------------------------------
# Read operations
# ---------------------------------------------------------------------------

async def get_organization(
    conn: asyncpg.Connection,
    org_id: str,
) -> Optional[dict]:
    """Fetch a full organization record by id (internal/admin use, raw table)."""
    row = await conn.fetchrow(
        "SELECT * FROM organizations WHERE id = $1",
        uuid.UUID(org_id),
    )
    return _row_to_dict(row) if row else None


async def get_organization_public(
    conn: asyncpg.Connection,
    org_id: str,
) -> Optional[dict]:
    """Fetch a shelter's public profile from the shelters_public view.

    This view intentionally omits sensitive fields (ein, contact_email,
    contact_phone).
    """
    row = await conn.fetchrow(
        "SELECT * FROM shelters_public WHERE id = $1",
        uuid.UUID(org_id),
    )
    return _row_to_dict(row) if row else None


# ---------------------------------------------------------------------------
# API-key verification
# ---------------------------------------------------------------------------

async def verify_api_key(
    conn: asyncpg.Connection,
    api_key: str,
) -> Optional[dict]:
    """Authenticate an API key and return the owning organization record.

    Lookup by key_prefix (first 12 chars), then verify the full key against
    the stored bcrypt hash.  Returns the organization dict on success, or
    None if the key is invalid / inactive / expired.
    """
    prefix = api_key[:12]

    key_row = await conn.fetchrow(
        """SELECT id, organization_id, key_hash, tier, is_active, expires_at
           FROM api_keys
           WHERE key_prefix = $1""",
        prefix,
    )
    if not key_row:
        return None

    if not key_row["is_active"]:
        return None

    # Check expiry (if set)
    if key_row["expires_at"] is not None:
        from datetime import datetime, timezone
        if key_row["expires_at"] < datetime.now(timezone.utc):
            return None

    # Verify bcrypt hash
    if not bcrypt.checkpw(api_key.encode(), key_row["key_hash"].encode()):
        return None

    # Touch last_used_at
    await conn.execute(
        "UPDATE api_keys SET last_used_at = now() WHERE id = $1",
        key_row["id"],
    )

    # Fetch the organization
    org_row = await conn.fetchrow(
        "SELECT * FROM organizations WHERE id = $1",
        key_row["organization_id"],
    )
    if not org_row:
        return None

    return _row_to_dict(org_row)
