from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class BatchJobResponse(BaseModel):
    id: str
    organization_id: str
    status: str
    received: int
    succeeded: int
    failed: int
    results: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
