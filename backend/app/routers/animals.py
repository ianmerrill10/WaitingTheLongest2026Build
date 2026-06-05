from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from typing import List, Optional

from ..models.animal import AnimalCreate, AnimalUpdate, AnimalResponse
from ..dependencies import get_org
from ..services.animal_service import AnimalService
from ..database import get_db
import asyncpg

router = APIRouter(prefix="/v1/animals", tags=["Shelter Animals"])


@router.post("", response_model=AnimalResponse, status_code=201)
async def create_animal(
    animal: AnimalCreate,
    request: Request,
    org=Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    idempotency_key = request.headers.get("Idempotency-Key")
    service = AnimalService(conn, org)
    try:
        result = await service.upsert_animal(animal, idempotency_key)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("", response_model=List[AnimalResponse])
async def list_animals(
    cursor: Optional[str] = None,
    limit: int = 20,
    org=Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")
    service = AnimalService(conn, org)
    return await service.list_animals(cursor, limit)


@router.get("/{external_id}", response_model=AnimalResponse)
async def get_animal(
    external_id: str,
    org=Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    service = AnimalService(conn, org)
    animal = await service.get_animal(external_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return animal


@router.patch("/{external_id}", response_model=AnimalResponse)
async def update_animal(
    external_id: str,
    update: AnimalUpdate,
    org=Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    service = AnimalService(conn, org)
    try:
        animal = await service.update_animal(external_id, update)
        if not animal:
            raise HTTPException(status_code=404, detail="Animal not found")
        return animal
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.delete("/{external_id}", response_model=AnimalResponse)
async def delete_animal(
    external_id: str,
    org=Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    service = AnimalService(conn, org)
    animal = await service.soft_delete_animal(external_id)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return animal
