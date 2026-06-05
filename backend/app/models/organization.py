from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
from .animal import AnimalResponse


class OrgType(str, Enum):
    municipal = "municipal"
    humane_society = "humane_society"
    spca = "spca"
    rescue = "rescue"
    foster_network = "foster_network"
    sanctuary = "sanctuary"
    other = "other"


class VerificationTier(str, Enum):
    tier_0 = "tier_0_self_asserted"
    tier_1 = "tier_1_verified"
    tier_2 = "tier_2_trusted"


class OrganizationBase(BaseModel):
    id: str
    legal_name: str
    org_type: OrgType
    verification_tier: VerificationTier
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    postal_code: Optional[str] = None
    state: Optional[str] = None
    country: str
    active_listings: int
    created_at: datetime

    model_config = {"from_attributes": True}


class OrganizationCreate(BaseModel):
    legal_name: str
    ein: Optional[str] = None
    website: Optional[str] = None
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    org_type: OrgType
    postal_code: Optional[str] = None
    state: Optional[str] = None
    country: str = "US"


class OrganizationResponse(OrganizationBase):
    pass


class OrganizationWithAnimals(OrganizationBase):
    animals: List[AnimalResponse] = []
