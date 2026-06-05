import asyncpg
from typing import AsyncIterator
from .config import settings

_pool: asyncpg.Pool | None = None


async def create_pool() -> asyncpg.Pool:
    global _pool
    _pool = await asyncpg.create_pool(
        settings.database_url,
        min_size=5,
        max_size=20,
    )
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_db() -> AsyncIterator[asyncpg.Connection]:
    """Dependency that provides a database connection from the pool."""
    if _pool is None:
        raise RuntimeError("Database pool not initialized. Call create_pool() first.")
    async with _pool.acquire() as conn:
        yield conn
