"""
photo_service.py -- Photo URL management for animal listings.

The animals table stores photo URLs in a ``text[]`` (PostgreSQL array)
column called ``photo_urls``.  This module provides helpers to append,
remove, and reorder entries in that array without touching other fields.

Write operations target the ``animals`` table directly.
All queries use asyncpg parameterized placeholders ($1, $2, ...).
"""

import uuid
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


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def add_photo_url(
    conn: asyncpg.Connection,
    animal_id: str,
    org_id: str,
    photo_url: str,
    position: Optional[int] = None,
) -> dict:
    """Append (or insert at position) a URL into the animal's photo_urls array.

    If ``position`` is None the URL is appended to the end.
    If ``position`` is provided (0-based), the URL is inserted at that index.
    Returns the updated animal record.

    Raises ValueError if the animal does not exist or does not belong to
    the given organization.
    """
    aid = uuid.UUID(animal_id)
    oid = uuid.UUID(org_id)

    if position is not None:
        # Insert at a specific position.
        # PostgreSQL arrays are 1-indexed, so we offset by 1.
        # Strategy: slice the array into before/after, concat the new URL
        # in between.
        row = await conn.fetchrow(
            """UPDATE animals
               SET photo_urls = (
                   photo_urls[:$3]          -- elements before the insertion point (1-indexed slice)
                   || ARRAY[$4]::text[]     -- the new URL
                   || photo_urls[$3 + 1:]   -- elements from the insertion point onward
               ),
               updated_at = now()
               WHERE id = $1 AND organization_id = $2
               RETURNING *""",
            aid,
            oid,
            position + 1,  # convert 0-based to 1-based
            photo_url,
        )
    else:
        # Append to the end
        row = await conn.fetchrow(
            """UPDATE animals
               SET photo_urls = array_append(photo_urls, $3),
                   updated_at = now()
               WHERE id = $1 AND organization_id = $2
               RETURNING *""",
            aid,
            oid,
            photo_url,
        )

    if not row:
        raise ValueError("Animal not found or does not belong to this organization")

    return _row_to_dict(row)


async def remove_photo_url(
    conn: asyncpg.Connection,
    animal_id: str,
    org_id: str,
    photo_url: str,
) -> dict:
    """Remove a URL from the animal's photo_urls array.

    Removes the *first* occurrence of the given URL.
    Returns the updated animal record.

    Raises ValueError if the animal does not exist or does not belong to
    the given organization.
    """
    aid = uuid.UUID(animal_id)
    oid = uuid.UUID(org_id)

    row = await conn.fetchrow(
        """UPDATE animals
           SET photo_urls = array_remove(photo_urls, $3),
               updated_at = now()
           WHERE id = $1 AND organization_id = $2
           RETURNING *""",
        aid,
        oid,
        photo_url,
    )

    if not row:
        raise ValueError("Animal not found or does not belong to this organization")

    return _row_to_dict(row)


async def reorder_photos(
    conn: asyncpg.Connection,
    animal_id: str,
    org_id: str,
    photo_urls: list[str],
) -> dict:
    """Replace the entire photo_urls array with a new ordered list.

    The caller is responsible for supplying the complete set of URLs in
    the desired order.  This is a full replacement, not a merge.
    Returns the updated animal record.

    Raises ValueError if the animal does not exist or does not belong to
    the given organization.
    """
    aid = uuid.UUID(animal_id)
    oid = uuid.UUID(org_id)

    row = await conn.fetchrow(
        """UPDATE animals
           SET photo_urls = $3,
               updated_at = now()
           WHERE id = $1 AND organization_id = $2
           RETURNING *""",
        aid,
        oid,
        photo_urls,
    )

    if not row:
        raise ValueError("Animal not found or does not belong to this organization")

    return _row_to_dict(row)
