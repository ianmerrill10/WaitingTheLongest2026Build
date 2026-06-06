"""Animal status transition endpoint.

Handles status changes such as adopted, transferred, on_hold, etc.
Records status history for audit and analytics.
"""

from fastapi import APIRouter, Depends, HTTPException
import asyncpg

from ..database import get_db
from ..dependencies import get_org
from ..services import animal_service
from ..models.animal import AnimalStatusUpdate

router = APIRouter(prefix="/v1/intake/animals", tags=["Status"])


@router.post("/{external_id}/status")
async def update_animal_status(
    external_id: str,
    data: AnimalStatusUpdate,
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Update an animal's status (adopted, transferred, etc.).

    For terminal statuses like 'adopted', outcome_type should be provided.
    Records the transition in status_history for auditing.
    """
    # Look up the animal by external_id to get the internal ID
    animal = await animal_service.get_animal_by_external_id(
        conn, org["id"], external_id
    )
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    result = await animal_service.update_status(
        conn,
        animal_id=animal["id"],
        org_id=org["id"],
        new_status=data.status.value,
        outcome_type=data.outcome_type.value if data.outcome_type else None,
    )
    return result
