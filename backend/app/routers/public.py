"""Public read-only API — no authentication required."""

from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg

from ..database import get_db
from ..services import animal_service, stats_service, org_service
from ..models.animal import AnimalPublicDetail, AnimalPage, FeaturedResponse
from ..models.organization import OrganizationPublic
from ..models.common import PaginationMeta

router = APIRouter(prefix="/v1/public", tags=["Public"])


@router.get("/dogs", response_model=AnimalPage)
async def list_dogs(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    sort: str = Query(
        "days_waiting_desc",
        description="Sort: days_waiting_desc, days_waiting_asc, name_asc, recently_added, nearest",
    ),
    breed: str | None = Query(None, description="Filter by breed (partial match)"),
    size: str | None = Query(None, description="Filter by size"),
    age_group: str | None = Query(None, description="Filter by SAC age group"),
    good_with_dogs: str | None = Query(None, description="Good with dogs filter"),
    good_with_cats: str | None = Query(None, description="Good with cats filter"),
    good_with_kids: str | None = Query(None, description="Good with kids filter"),
    special_needs: bool | None = Query(None, description="Filter for special needs dogs"),
    state: str | None = Query(None, min_length=2, max_length=2, description="US state code"),
    city: str | None = Query(None, description="City name"),
    lat: float | None = Query(None, ge=-90, le=90, description="Latitude for geo search"),
    lng: float | None = Query(None, ge=-180, le=180, description="Longitude for geo search"),
    radius_miles: float | None = Query(None, le=500, description="Search radius in miles"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Browse adoptable dogs with filtering, sorting, and pagination."""
    items, total = await animal_service.list_public_dogs(
        conn,
        page=page,
        per_page=per_page,
        sort=sort,
        breed=breed,
        size=size,
        age_group=age_group,
        good_with_dogs=good_with_dogs,
        good_with_cats=good_with_cats,
        good_with_kids=good_with_kids,
        special_needs=special_needs,
        state=state,
        city=city,
        lat=lat,
        lng=lng,
        radius_miles=radius_miles,
    )
    total_pages = max(1, (total + per_page - 1) // per_page)
    return AnimalPage(
        items=items,
        pagination=PaginationMeta(
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        ),
    )


@router.get("/dogs/{dog_id}", response_model=AnimalPublicDetail)
async def get_dog(dog_id: str, conn: asyncpg.Connection = Depends(get_db)):
    """Get detailed information about a specific dog."""
    dog = await animal_service.get_animal_by_id(conn, dog_id)
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    return dog


@router.get("/shelters/{shelter_id}", response_model=OrganizationPublic)
async def get_shelter(shelter_id: str, conn: asyncpg.Connection = Depends(get_db)):
    """Get a shelter's public profile."""
    shelter = await org_service.get_organization_public(conn, shelter_id)
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    return shelter


@router.get("/stats")
async def get_stats(conn: asyncpg.Connection = Depends(get_db)):
    """Get platform-wide statistics."""
    return await stats_service.get_platform_stats(conn)


@router.get("/featured", response_model=FeaturedResponse)
async def get_featured(conn: asyncpg.Connection = Depends(get_db)):
    """Get featured dogs (longest waiting + recently added) for the homepage."""
    return await animal_service.get_featured_dogs(conn)
