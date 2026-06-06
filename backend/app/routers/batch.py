"""Batch intake endpoint — accept up to 1000 animals in a single request.

Processes the batch inline via a background task and returns the job ID
immediately with a 202 Accepted status.
"""

from fastapi import APIRouter, Depends
import asyncpg

from ..database import get_db
from ..dependencies import get_org
from ..services import batch_service
from ..models.animal import BatchSubmitRequest

router = APIRouter(prefix="/v1/intake", tags=["Batch Intake"])


@router.post("/batch", status_code=202)
async def submit_batch(
    data: BatchSubmitRequest,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Submit a batch of animal records for upsert.

    Accepts up to 1000 animals and processes them inline.
    Returns counts of created, updated, and errored records.
    """
    animals_data = [a.model_dump(exclude_none=False) for a in data.animals]
    result = await batch_service.process_batch(conn, org["id"], animals_data)
    return result
