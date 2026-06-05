import uuid
import secrets
import bcrypt
import asyncpg
from ..models.organization import OrganizationCreate
from typing import Optional


class OrgService:
    def __init__(self, conn: asyncpg.Connection):
        self.conn = conn

    async def create_org(self, data: OrganizationCreate) -> dict:
        """Create a new organization and generate an API key."""
        # Check EIN uniqueness if provided
        if data.ein:
            existing = await self.conn.fetchrow("SELECT id FROM organizations WHERE ein = $1", data.ein)
            if existing:
                raise ValueError("EIN already registered")

        # Insert org
        row = await self.conn.fetchrow(
            """INSERT INTO organizations (legal_name, ein, website, contact_email, contact_phone,
                                          org_type, postal_code, state, country)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               RETURNING *""",
            data.legal_name, data.ein, data.website, data.contact_email,
            data.contact_phone, data.org_type.value, data.postal_code,
            data.state, data.country,
        )
        org = dict(row)
        for key in ("id",):
            if key in org and org[key] is not None:
                org[key] = str(org[key])

        # Generate API key
        api_key = f"wtl_{secrets.token_urlsafe(32)}"
        key_prefix = api_key[:8]
        key_hash = bcrypt.hashpw(api_key.encode(), bcrypt.gensalt()).decode()

        await self.conn.execute(
            """INSERT INTO api_keys (organization_id, key_hash, key_prefix, tier)
               VALUES ($1, $2, $3, $4)""",
            row["id"], key_hash, key_prefix, "tier_0_self_asserted",
        )

        # Include the raw API key in the response (only time it's shown)
        org["api_key"] = api_key
        return org

    async def get_org_with_animals(self, org_id: str) -> Optional[dict]:
        org = await self.conn.fetchrow("SELECT * FROM organizations WHERE id = $1", uuid.UUID(org_id))
        if not org:
            return None
        animals = await self.conn.fetch(
            """SELECT * FROM animals WHERE organization_id = $1 AND species = 'dog' AND status = 'adoptable'
               ORDER BY intake_date ASC LIMIT 50""",
            uuid.UUID(org_id),
        )
        result = dict(org)
        for key in ("id",):
            if key in result and result[key] is not None:
                result[key] = str(result[key])
        result["animals"] = [dict(a) for a in animals]
        return result
