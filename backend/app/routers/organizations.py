"""Organization management endpoints.

POST is public (self-registration). GET requires authentication and is
scoped to the authenticated org only.
"""

from fastapi import APIRouter, Depends, HTTPException
import asyncpg

from ..database import get_db
from ..dependencies import get_org
from ..services import org_service
from ..models.organization import (
    OrganizationCreate,
    OrganizationDetail,
    OrganizationPublic,
    ApiKeyResponse,
)

router = APIRouter(prefix="/v1/organizations", tags=["Organizations"])


@router.post("", status_code=201)
async def create_organization(
    data: OrganizationCreate,
    conn: asyncpg.Connection = Depends(get_db),
):
    """Register a new organization and receive an API key.

    The API key is shown in plaintext exactly ONCE in the response.
    Store it securely — the server only keeps the bcrypt hash.
    """
    try:
        org_dict, plaintext_key = await org_service.create_organization(
            conn, data.model_dump(exclude_none=True)
        )
    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(
                status_code=409,
                detail="Organization with this EIN already exists",
            )
        raise

    return {
        "organization": OrganizationPublic(**org_dict).model_dump(),
        "api_key": ApiKeyResponse(
            api_key=plaintext_key,
            key_prefix=plaintext_key[:12],
            organization_id=org_dict["id"],
        ).model_dump(),
    }


@router.get("/me", response_model=OrganizationDetail)
async def get_my_organization(
    org: dict = Depends(get_org),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Get the authenticated organization's full profile."""
    result = await org_service.get_organization(conn, org["id"])
    if not result:
        raise HTTPException(status_code=404, detail="Organization not found")
    return result
