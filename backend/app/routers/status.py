from fastapi import APIRouter, Depends, HTTPException, Request
from ..models.animal import AnimalStatusUpdate, AnimalResponse
from ..dependencies import get_org
from ..services.animal_service import AnimalService
from ..database import get_db
import asyncpg

router = APIRouter(prefix="/v1/animals", tags=["Animal Status"])


@router.post("/{external_id}/status", response_model=AnimalResponse)
async def update_status(
    external_id: str,
    update: AnimalStatusUpdate,
    org=Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    if update.status in ("adopted", "removed") and not update.outcome_type:
        raise HTTPException(
            status_code=422,
            detail="outcome_type is required when status is 'adopted' or 'removed'",
        )
    service = AnimalService(conn, org)
    try:
        animal = await service.update_status(external_id, update)
        if not animal:
            raise HTTPException(status_code=404, detail="Animal not found")
        return animal
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
