from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from ..models.animal import BatchSubmitRequest
from ..models.batch import BatchJobResponse
from ..dependencies import get_org
from ..services.batch_service import BatchService
from ..database import get_db
import asyncpg

router = APIRouter(prefix="/v1", tags=["Batch"])


@router.post("/animals/batch", response_model=BatchJobResponse, status_code=202)
async def submit_batch(
    batch: BatchSubmitRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    org=Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    service = BatchService(conn, org)
    job = await service.create_job(batch)
    background_tasks.add_task(process_batch_job, str(job["id"]))
    return job


async def process_batch_job(job_id: str):
    """Background task to process a batch job."""
    from ..database import _pool
    if _pool is None:
        return
    async with _pool.acquire() as conn:
        service = BatchService(conn, None)
        await service.process_job(job_id)


@router.get("/batch/{job_id}", response_model=BatchJobResponse)
async def get_batch_status(
    job_id: str,
    org=Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    service = BatchService(conn, org)
    job = await service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")
    if str(job["organization_id"]) != str(org["id"]):
        raise HTTPException(status_code=403, detail="Not your batch job")
    return job
