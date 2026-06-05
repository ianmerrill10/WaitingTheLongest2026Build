from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from ..services.animal_service import AnimalService
from ..services.stats_service import StatsService
from ..database import get_db
import asyncpg

router = APIRouter(prefix="/v1/public", tags=["Public"])


@router.get("/dogs")
async def browse_dogs(
    sort: str = Query("days_waiting", pattern="^(days_waiting|newest|nearest)$"),
    postal_code: Optional[str] = None,
    radius_miles: Optional[int] = None,
    breed: Optional[str] = None,
    size: Optional[str] = None,
    age_group: Optional[str] = Query(None, pattern="^(puppy|adult)$"),
    sex: Optional[str] = Query(None, pattern="^(male|female)$"),
    good_with_dogs: Optional[str] = Query(None, pattern="^yes$"),
    good_with_cats: Optional[str] = Query(None, pattern="^yes$"),
    good_with_kids: Optional[str] = Query(None, pattern="^yes$"),
    special_needs: Optional[bool] = None,
    state: Optional[str] = Query(None, max_length=2, min_length=2),
    cursor: Optional[str] = None,
    limit: int = Query(20, ge=1, le=50),
    conn: asyncpg.Connection = Depends(get_db),
):
    service = AnimalService(conn, None)
    filters = {
        "breed": breed,
        "size": size.split(",") if size else None,
        "age_group": age_group,
        "sex": sex,
        "good_with_dogs": good_with_dogs,
        "good_with_cats": good_with_cats,
        "good_with_kids": good_with_kids,
        "special_needs": special_needs,
        "state": state,
    }
    dogs = await service.public_list_dogs(sort=sort, filters=filters, cursor=cursor, limit=limit)
    return dogs


@router.get("/dogs/{dog_id}")
async def dog_detail(
    dog_id: str,
    conn: asyncpg.Connection = Depends(get_db),
):
    service = AnimalService(conn, None)
    dog = await service.get_public_dog(dog_id)
    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")
    return dog


@router.get("/shelters/{shelter_id}")
async def shelter_profile(
    shelter_id: str,
    conn: asyncpg.Connection = Depends(get_db),
):
    from ..services.org_service import OrgService
    service = OrgService(conn)
    org = await service.get_org_with_animals(shelter_id)
    if not org:
        raise HTTPException(status_code=404, detail="Shelter not found")
    return org


@router.get("/stats")
async def platform_stats(
    conn: asyncpg.Connection = Depends(get_db),
):
    stats_service = StatsService(conn)
    return await stats_service.get_stats()


@router.get("/featured")
async def featured_dogs(
    conn: asyncpg.Connection = Depends(get_db),
):
    service = AnimalService(conn, None)
    return await service.get_longest_waiting_dogs(10)
