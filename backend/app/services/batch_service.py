"""
batch_service.py -- Batch animal upsert processing.

Processes batches inline (no background queue).  Each animal in the batch
is upserted via animal_service.upsert_animal.  Results are returned
immediately with created/updated/error counts.

All queries use asyncpg parameterized placeholders ($1, $2, ...).
"""

import uuid
from typing import Optional

import asyncpg

from .animal_service import upsert_animal


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

async def create_batch_job(
    conn: asyncpg.Connection,
    org_id: str,
    animals: list[dict],
) -> str:
    """Process a batch of animal upserts and return the batch_id.

    Each animal dict is passed to upsert_animal.  A batch_jobs row is
    created so the caller can reference it later via the returned UUID.
    """
    oid = uuid.UUID(org_id)

    # Create a tracking row in batch_jobs
    row = await conn.fetchrow(
        """INSERT INTO batch_jobs (organization_id, status, received)
           VALUES ($1, 'processing', $2)
           RETURNING id""",
        oid,
        len(animals),
    )
    batch_id = str(row["id"])

    # Process each animal inline
    succeeded = 0
    failed = 0

    for animal_data in animals:
        try:
            await upsert_animal(conn, org_id, dict(animal_data))
            succeeded += 1
        except Exception:
            failed += 1

    # Mark batch complete
    await conn.execute(
        """UPDATE batch_jobs
           SET status = 'completed', succeeded = $1, failed = $2
           WHERE id = $3""",
        succeeded,
        failed,
        uuid.UUID(batch_id),
    )

    return batch_id


async def process_batch(
    conn: asyncpg.Connection,
    org_id: str,
    animals: list[dict],
) -> dict:
    """Process a list of animal upserts and return a summary.

    Returns {"total": N, "created": X, "updated": Y, "errors": [...]}.
    An animal is counted as "created" when the upsert returns a row whose
    ``created_at`` equals ``updated_at`` (brand new); otherwise "updated".
    """
    total = len(animals)
    created = 0
    updated = 0
    errors: list[dict] = []

    for i, animal_data in enumerate(animals):
        try:
            result = await upsert_animal(conn, org_id, dict(animal_data))
            # Distinguish create vs update: if created_at == updated_at the
            # row was just inserted; the ON CONFLICT path sets updated_at = now()
            # which will differ from created_at on an existing row.
            if result.get("created_at") == result.get("updated_at"):
                created += 1
            else:
                updated += 1
        except Exception as exc:
            errors.append({
                "index": i,
                "external_id": animal_data.get("external_id", "unknown"),
                "error": str(exc),
            })

    return {
        "total": total,
        "created": created,
        "updated": updated,
        "errors": errors,
    }


async def get_batch_job(
    conn: asyncpg.Connection,
    batch_id: str,
) -> Optional[dict]:
    """Fetch a batch job record by its id."""
    row = await conn.fetchrow(
        "SELECT * FROM batch_jobs WHERE id = $1",
        uuid.UUID(batch_id),
    )
    return _row_to_dict(row) if row else None
