from fastapi import APIRouter, Depends, HTTPException
from ..dependencies import get_org
from ..services.photo_service import PhotoService
from ..config import settings

router = APIRouter(prefix="/v1/uploads", tags=["Uploads"])


@router.post("/photos")
async def get_presigned_upload_url(
    filename: str,
    content_type: str = "image/jpeg",
    org=Depends(get_org),
):
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/avif"}
    if content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".avif")):
        raise HTTPException(status_code=400, detail="Invalid file extension")

    service = PhotoService(
        settings.photo_storage_url,
        settings.photo_storage_bucket,
    )
    try:
        url = await service.create_presigned_upload_url(str(org["id"]), filename, content_type)
        return {"url": url, "expires_in": 3600}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
