from fastapi import Depends, HTTPException, Request
from fastapi.security import APIKeyHeader
from typing import Optional
import bcrypt
from .database import get_db
from .middleware.rate_limit import RateLimiter
import asyncpg

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Org rate limiter instances stored per org id
_org_rate_limiters: dict[str, RateLimiter] = {}


async def get_org(
    request: Request,
    api_key: Optional[str] = Depends(api_key_header),
    conn: asyncpg.Connection = Depends(get_db),
) -> dict:
    """Dependency that authenticates via X-API-Key and returns the org context."""
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing X-API-Key header")

    # Look up by prefix (first 8 chars)
    prefix = api_key[:8]
    row = await conn.fetchrow(
        "SELECT id, organization_id, key_hash, tier, is_active FROM api_keys WHERE key_prefix = $1",
        prefix,
    )
    if not row:
        raise HTTPException(status_code=401, detail="Invalid API key")

    if not row["is_active"]:
        raise HTTPException(status_code=403, detail="API key disabled")

    # Verify bcrypt hash
    if not bcrypt.checkpw(api_key.encode(), row["key_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Update last_used_at
    await conn.execute(
        "UPDATE api_keys SET last_used_at = now() WHERE id = $1", row["id"]
    )

    # Fetch organization
    org = await conn.fetchrow(
        "SELECT * FROM organizations WHERE id = $1", row["organization_id"]
    )
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org_dict = dict(org)
    org_id_str = str(org_dict["id"])

    # Rate limit based on org tier
    limiter = _org_rate_limiters.get(org_id_str)
    if not limiter:
        limits = {
            "tier_0_self_asserted": 60,
            "tier_1_verified": 600,
            "tier_2_trusted": 6000,
        }
        max_requests = limits.get(org_dict["verification_tier"], 60)
        limiter = RateLimiter(max_requests, 3600)
        _org_rate_limiters[org_id_str] = limiter

    if not await limiter.acquire(org_id_str):
        raise HTTPException(status_code=429, detail="Rate limit exceeded for organization")

    # Convert UUID to string for consistent handling
    org_dict["id"] = org_id_str
    return org_dict
