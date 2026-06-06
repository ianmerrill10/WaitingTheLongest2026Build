import asyncpg
from contextlib import asynccontextmanager
from .config import settings

# Module-level pool reference
_pool: asyncpg.Pool | None = None


async def create_pool() -> asyncpg.Pool:
    global _pool
    _pool = await asyncpg.create_pool(
        settings.DATABASE_URL,
        min_size=2,
        max_size=10,
        command_timeout=30,
    )
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def get_db() -> asyncpg.Connection:
    """FastAPI dependency that yields a connection from the pool."""
    async with _pool.acquire() as conn:
        yield conn


def get_pool() -> asyncpg.Pool:
    """Get the pool directly for background tasks."""
    return _pool
