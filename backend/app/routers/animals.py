"""Shelter intake API — authenticated endpoints for managing animals.

All endpoints require X-API-Key authentication via the get_org dependency.
"""

from fastapi import APIRouter, Depends, HTTPException
import asyncpg

from ..database import get_db
from ..dependencies import get_org
from ..services import animal_service
from ..models.animal import AnimalCreate, AnimalUpdate

router = APIRouter(prefix="/v1/intake/animals", tags=["Intake"])


@router.post("", status_code=201)
async def create_animal(
    data: AnimalCreate,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Create or upsert a single animal listing."""
    result = await animal_service.upsert_animal(
        conn, org["id"], data.model_dump(exclude_none=False)
    )
    return result


@router.get("")
async def list_org_animals(
    page: int = 1,
    per_page: int = 20,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """List the authenticated organization's own animals."""
    rows = await conn.fetch(
        """
        SELECT * FROM animals
        WHERE organization_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        """,
        org["id"],
        per_page,
        (page - 1) * per_page,
    )
    total = await conn.fetchval(
        "SELECT COUNT(*) FROM animals WHERE organization_id = $1",
        org["id"],
    )
    return {
        "items": [animal_service._row_to_dict(r) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/{external_id}")
async def get_org_animal(
    external_id: str,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Get a specific animal by external_id within the authenticated org."""
    animal = await animal_service.get_animal_by_external_id(
        conn, org["id"], external_id
    )
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return animal


@router.put("/{external_id}")
async def update_org_animal(
    external_id: str,
    data: AnimalUpdate,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Update an animal. Only provided fields are modified."""
    result = await animal_service.update_animal(
        conn, org["id"], external_id, data.model_dump(exclude_none=True)
    )
    if not result:
        raise HTTPException(status_code=404, detail="Animal not found")
    return result


@router.delete("/{external_id}")
async def delete_org_animal(
    external_id: str,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Soft-delete an animal (set status to 'removed')."""
    result = await animal_service.update_animal(
        conn, org["id"], external_id, {"status": "removed"}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Animal not found")
    return {"status": "removed", "external_id": external_id}
