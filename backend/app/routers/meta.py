"""Health check and version metadata endpoints.

These are unauthenticated root-level endpoints used by load balancers,
monitoring systems, and API consumers to verify service availability.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
import asyncpg

from ..database import get_db
from ..config import settings
from ..models.common import HealthResponse

router = APIRouter(tags=["Meta"])


@router.get("/health", response_model=HealthResponse)
async def health_check(
    conn: asyncpg.Connection = Depends(get_db),
):
    """Health check endpoint for load balancers and monitoring.

    Verifies database connectivity by executing a simple query.
    Returns the service status, version, database state, and current timestamp.
    """
    # Verify database connectivity
    db_status = "connected"
    try:
        await conn.fetchval("SELECT 1")
    except Exception:
        db_status = "disconnected"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        version=settings.API_VERSION,
        database=db_status,
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/version")
async def get_version():
    """Return API version information.

    Provides the OpenAPI spec version and the running server version
    for client compatibility checks.
    """
    return {
        "api_version": settings.API_VERSION,
        "spec_version": "0.1.0",
        "environment": settings.ENVIRONMENT,
    }
