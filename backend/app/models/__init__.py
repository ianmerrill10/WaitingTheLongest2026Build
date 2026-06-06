"""WaitingTheLongest.com — Pydantic v2 models.

Re-exports the key models so consumers can write:
    from app.models import AnimalCreate, OrganizationPublic, Problem
"""

# --- Common ---
from .common import HealthResponse, PaginationMeta, Problem

# --- Enums (all 14 PostgreSQL ENUM mirrors) ---
from .animal import (
    AlteredStatus,
    BatchStatus,
    CoatLength,
    IntakeType,
    ListingStatus,
    OrgType,
    OutcomeType,
    PhotoStatus,
    SacAgeGroup,
    Sex,
    Size,
    Species,
    Trit,
    VerificationTier,
)

# --- Animal models ---
from .animal import (
    AnimalCreate,
    AnimalPage,
    AnimalPublicDetail,
    AnimalPublicSummary,
    AnimalStatusUpdate,
    AnimalUpdate,
    BatchAnimal,
    BatchJobResponse,
    BatchSubmitRequest,
    FeaturedResponse,
)

# --- Organization models ---
from .organization import (
    ApiKeyResponse,
    OrganizationCreate,
    OrganizationDetail,
    OrganizationPublic,
)

__all__ = [
    # Common
    "Problem",
    "PaginationMeta",
    "HealthResponse",
    # Enums
    "Species",
    "IntakeType",
    "OutcomeType",
    "ListingStatus",
    "Sex",
    "AlteredStatus",
    "Size",
    "CoatLength",
    "SacAgeGroup",
    "Trit",
    "OrgType",
    "VerificationTier",
    "BatchStatus",
    "PhotoStatus",
    # Animal models
    "AnimalCreate",
    "AnimalUpdate",
    "AnimalStatusUpdate",
    "AnimalPublicSummary",
    "AnimalPublicDetail",
    "AnimalPage",
    "FeaturedResponse",
    "BatchAnimal",
    "BatchSubmitRequest",
    "BatchJobResponse",
    # Organization models
    "OrganizationCreate",
    "OrganizationPublic",
    "OrganizationDetail",
    "ApiKeyResponse",
]
