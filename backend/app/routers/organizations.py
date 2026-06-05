from fastapi import APIRouter, Depends, HTTPException
from ..models.organization import OrganizationCreate, OrganizationResponse
from ..dependencies import get_org
from ..services.org_service import OrgService
from ..database import get_db
import asyncpg

router = APIRouter(prefix="/v1/organizations", tags=["Organizations"])


@router.post("", response_model=OrganizationResponse, status_code=201)
async def create_organization(
    org_data: OrganizationCreate,
    conn: asyncpg.Connection = Depends(get_db),
):
    """Public endpoint — no auth required. Creates a Tier 0 org."""
    service = OrgService(conn)
    try:
        org = await service.create_org(org_data)
        return org
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/me", response_model=OrganizationResponse)
async def get_organization_me(
    org=Depends(get_org),
):
    """Inspect authenticated org."""
    return org
