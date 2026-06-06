"""Common models shared across the API."""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Any


class Problem(BaseModel):
    """RFC 9457 Problem Details response."""

    type: str = "about:blank"
    title: str
    status: int
    detail: str | None = None
    instance: str | None = None
    errors: list[dict[str, Any]] | None = None


class PaginationMeta(BaseModel):
    """Cursor-based pagination metadata."""

    total: int
    page: int
    per_page: int
    total_pages: int
    has_next: bool
    has_prev: bool


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    database: str = "connected"
    timestamp: datetime
