"""
stats_service.py -- Platform-wide statistics.

Delegates to the ``platform_stats()`` SQL function defined in the schema.
That function is SECURITY DEFINER and returns aggregate-only data, so it
is safe to expose to public/anonymous callers.

All queries use asyncpg parameterized placeholders ($1, $2, ...).
"""

import uuid

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


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def get_platform_stats(conn: asyncpg.Connection) -> dict:
    """Call the platform_stats() SQL function and return the result as a dict.

    The function returns a single row with columns:
      total_dogs, total_shelters, adoptions_this_month,
      avg_wait_days, longest_wait_days
    """
    row = await conn.fetchrow("SELECT * FROM platform_stats()")
    if not row:
        # Should never happen -- the function always returns one row of
        # aggregates -- but guard against it anyway.
        return {
            "total_dogs": 0,
            "total_shelters": 0,
            "adoptions_this_month": 0,
            "avg_wait_days": 0,
            "longest_wait_days": 0,
        }

    result = _row_to_dict(row)

    # Coerce numeric types to Python-native for clean JSON serialisation
    return {
        "total_dogs": int(result.get("total_dogs") or 0),
        "total_shelters": int(result.get("total_shelters") or 0),
        "adoptions_this_month": int(result.get("adoptions_this_month") or 0),
        "avg_wait_days": float(result.get("avg_wait_days") or 0),
        "longest_wait_days": int(result.get("longest_wait_days") or 0),
    }
