"""API key authentication and rate limiting dependencies."""
import time
from collections import defaultdict
from fastapi import Depends, HTTPException
from fastapi.security import APIKeyHeader
import asyncpg
import bcrypt

from .database import get_db
from .middleware.rate_limit import RateLimiter

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Per-org rate limiters keyed by org_id
_org_rate_limiters: dict[str, RateLimiter] = {}


async def get_org(
    api_key: str | None = Depends(api_key_header),
    conn: asyncpg.Connection = Depends(get_db),
) -> dict:
    """Authenticate via X-API-Key header and return the org context.

    Looks up by key_prefix (first 12 chars: 'wtl_' + 8 hex), verifies
    bcrypt hash, enforces per-org rate limiting, updates last_used_at.
    """
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing X-API-Key header")

    if not api_key.startswith("wtl_"):
        raise HTTPException(status_code=401, detail="Invalid API key format")

    # Prefix is first 12 chars: 'wtl_' + 8 hex chars
    prefix = api_key[:12]

    row = await conn.fetchrow(
        """
        SELECT k.id AS key_id, k.key_hash, k.tier, k.is_active,
               o.id AS org_id, o.legal_name, o.verification_tier,
               o.rate_limit_per_hour
        FROM api_keys k
        JOIN organizations o ON o.id = k.organization_id
        WHERE k.key_prefix = $1
        """,
        prefix,
    )

    if not row:
        raise HTTPException(status_code=401, detail="Invalid API key")

    if not row["is_active"]:
        raise HTTPException(status_code=403, detail="API key is deactivated")

    # Verify bcrypt hash
    if not bcrypt.checkpw(api_key.encode(), row["key_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Update last_used_at
    await conn.execute(
        "UPDATE api_keys SET last_used_at = now() WHERE id = $1",
        row["key_id"],
    )

    org_id_str = str(row["org_id"])

    # Per-org rate limiting
    limiter = _org_rate_limiters.get(org_id_str)
    if not limiter:
        limiter = RateLimiter(
            max_requests=row["rate_limit_per_hour"],
            window_seconds=3600,
        )
        _org_rate_limiters[org_id_str] = limiter

    if not await limiter.acquire(org_id_str):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded for organization",
            headers={"Retry-After": "3600"},
        )

    return {
        "id": org_id_str,
        "legal_name": row["legal_name"],
        "verification_tier": row["verification_tier"],
        "rate_limit_per_hour": row["rate_limit_per_hour"],
        "key_tier": row["tier"],
    }
