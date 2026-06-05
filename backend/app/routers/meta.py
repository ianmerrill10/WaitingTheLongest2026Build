from fastapi import APIRouter
from ..config import settings

router = APIRouter(prefix="/v1", tags=["Meta"])


@router.get("/healthz")
async def health():
    return {"status": "healthy"}


@router.get("/version")
async def version():
    return {
        "spec_version": "0.1.0",
        "server_version": settings.api_version,
    }
