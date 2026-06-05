from pydantic import BaseModel
from typing import List, Optional


class FieldError(BaseModel):
    field: str
    message: str
    code: Optional[str] = None


class Problem(BaseModel):
    """RFC 9457 problem+json error response."""
    type: str = "about:blank"
    title: str
    status: int
    detail: str
    instance: Optional[str] = None
    errors: List[FieldError] = []
