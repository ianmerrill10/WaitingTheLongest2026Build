"""Organization models for WaitingTheLongest.com.

Enum types (OrgType, VerificationTier) are defined in animal.py alongside
the other 12 PostgreSQL ENUMs so there is a single source of truth.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from .animal import OrgType, VerificationTier


class OrganizationCreate(BaseModel):
    """Body for POST /v1/organizations — public onboarding application.

    Validates EIN format (XX-XXXXXXX), email, and state/country codes.
    """

    legal_name: str = Field(..., min_length=2, max_length=200)
    ein: str | None = Field(None, pattern=r"^\d{2}-?\d{7}$")
    org_type: OrgType | None = None
    contact_email: EmailStr
    contact_phone: str | None = Field(None, max_length=32)
    website: str | None = None
    city: str | None = Field(None, max_length=80)
    state: str | None = Field(None, min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")
    postal_code: str | None = Field(None, max_length=12)
    country: str = Field("US", min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")

    @field_validator("ein")
    @classmethod
    def normalize_ein(cls, v: str | None) -> str | None:
        """Accept both '12-3456789' and '123456789'; store with dash."""
        if v is not None and "-" not in v and len(v) == 9:
            v = f"{v[:2]}-{v[2:]}"
        return v


class OrganizationPublic(BaseModel):
    """Public shelter profile from the shelters_public VIEW.

    Excludes sensitive fields (ein, contact_email, contact_phone).
    """

    id: str
    legal_name: str
    org_type: OrgType
    verification_tier: VerificationTier
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str = "US"
    website: str | None = None
    active_listings: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class OrganizationDetail(BaseModel):
    """Full organization profile — only for authenticated org owners.

    Extends OrganizationPublic with contact_email, contact_phone, and ein.
    """

    id: str
    legal_name: str
    org_type: OrgType
    verification_tier: VerificationTier
    verification_method: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str = "US"
    website: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    ein: str | None = None
    rate_limit_per_hour: int = 100
    active_listings: int = 0
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class ApiKeyResponse(BaseModel):
    """Returned after org creation — POST /v1/organizations.

    The api_key is shown in plaintext exactly ONCE.  The server stores only
    the bcrypt hash; this response is the caller's only chance to copy it.
    """

    api_key: str
    key_prefix: str
    organization_id: str
    verification_tier: VerificationTier = VerificationTier.tier_0_self_asserted
    rate_limit_per_hour: int = 100
