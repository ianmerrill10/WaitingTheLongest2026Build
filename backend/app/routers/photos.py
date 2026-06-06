"""Photo management endpoints for animal listings.

Handles adding, removing, and reordering photo URLs on animal records.
All endpoints require X-API-Key authentication.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import asyncpg

from ..database import get_db
from ..dependencies import get_org
from ..services import animal_service, photo_service

router = APIRouter(prefix="/v1/intake/animals", tags=["Photos"])


class AddPhotoRequest(BaseModel):
    photo_url: str
    position: int | None = None


class RemovePhotoRequest(BaseModel):
    photo_url: str


class ReorderPhotosRequest(BaseModel):
    photo_urls: list[str]


@router.post("/{external_id}/photos", status_code=201)
async def add_photo(
    external_id: str,
    data: AddPhotoRequest,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Add a photo URL to an animal's listing."""
    animal = await animal_service.get_animal_by_external_id(
        conn, org["id"], external_id
    )
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    try:
        result = await photo_service.add_photo_url(
            conn, animal["id"], org["id"], data.photo_url, data.position
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@router.delete("/{external_id}/photos")
async def remove_photo(
    external_id: str,
    data: RemovePhotoRequest,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Remove a photo URL from an animal's listing."""
    animal = await animal_service.get_animal_by_external_id(
        conn, org["id"], external_id
    )
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    try:
        result = await photo_service.remove_photo_url(
            conn, animal["id"], org["id"], data.photo_url
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return result


@router.put("/{external_id}/photos")
async def reorder_photos(
    external_id: str,
    data: ReorderPhotosRequest,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Reorder an animal's photos by providing the full URL list in new order."""
    animal = await animal_service.get_animal_by_external_id(
        conn, org["id"], external_id
    )
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    try:
        result = await photo_service.reorder_photos(
            conn, animal["id"], org["id"], data.photo_urls
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result
