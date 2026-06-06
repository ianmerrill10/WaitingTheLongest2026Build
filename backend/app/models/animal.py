"""Animal models and PostgreSQL-aligned enums for WaitingTheLongest.com.

Every Python enum mirrors its PostgreSQL counterpart EXACTLY -- same names,
same values, same order.  The 14 ENUM types defined in 001_initial.sql are
reproduced here so Pydantic validates incoming data against the same
controlled vocabularies enforced at the database layer.
"""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from .common import PaginationMeta


# ---------------------------------------------------------------------------
# PostgreSQL ENUM mirrors (14 types, identical order to 001_initial.sql)
# ---------------------------------------------------------------------------

class Species(str, Enum):
    """species_enum — SAC IOD species categories."""
    dog = "dog"
    cat = "cat"
    rabbit = "rabbit"
    equine = "equine"
    small_mammal = "small_mammal"
    bird = "bird"
    reptile_amphibian = "reptile_amphibian"
    farm_animal = "farm_animal"
    other = "other"


class IntakeType(str, Enum):
    """intake_type_enum — SAC IOD live-intake categories."""
    stray_at_large = "stray_at_large"
    relinquished_by_owner = "relinquished_by_owner"
    owner_intended_euthanasia = "owner_intended_euthanasia"
    transfer_in_in_state = "transfer_in_in_state"
    transfer_in_out_of_state = "transfer_in_out_of_state"
    seized_custody = "seized_custody"
    born_in_care = "born_in_care"
    other_intake = "other_intake"


class OutcomeType(str, Enum):
    """outcome_type_enum — SAC IOD outcome categories (live + non-live)."""
    adoption = "adoption"
    return_to_owner = "return_to_owner"
    transfer_out_in_state = "transfer_out_in_state"
    transfer_out_out_of_state = "transfer_out_out_of_state"
    returned_to_field = "returned_to_field"
    other_live_outcome = "other_live_outcome"
    died_in_care = "died_in_care"
    lost_in_care = "lost_in_care"
    shelter_euthanasia = "shelter_euthanasia"


class ListingStatus(str, Enum):
    """listing_status_enum — WaitingTheLongest operational status."""
    adoptable = "adoptable"
    pending = "pending"
    adopted = "adopted"
    on_hold = "on_hold"
    not_available = "not_available"
    removed = "removed"


class Sex(str, Enum):
    """sex_enum"""
    male = "male"
    female = "female"
    unknown = "unknown"


class AlteredStatus(str, Enum):
    """altered_status_enum — spay/neuter status."""
    altered = "altered"
    intact = "intact"
    unknown = "unknown"


class Size(str, Enum):
    """size_enum"""
    small = "small"
    medium = "medium"
    large = "large"
    xlarge = "xlarge"


class CoatLength(str, Enum):
    """coat_length_enum"""
    hairless = "hairless"
    short = "short"
    medium = "medium"
    long = "long"
    wire = "wire"
    curly = "curly"
    double = "double"
    unknown = "unknown"


class SacAgeGroup(str, Enum):
    """sac_age_group_enum — SAC IOD coarse age grouping."""
    under_5_months = "under_5_months"
    adult = "adult"
    unknown = "unknown"


class Trit(str, Enum):
    """trit_enum — three-valued behavioral compatibility flag."""
    yes = "yes"
    no = "no"
    unknown = "unknown"


class OrgType(str, Enum):
    """org_type_enum"""
    municipal = "municipal"
    humane_society = "humane_society"
    spca = "spca"
    rescue = "rescue"
    foster_network = "foster_network"
    sanctuary = "sanctuary"
    other = "other"


class VerificationTier(str, Enum):
    """verification_tier_enum"""
    tier_0_self_asserted = "tier_0_self_asserted"
    tier_1_verified = "tier_1_verified"
    tier_2_trusted = "tier_2_trusted"


class BatchStatus(str, Enum):
    """batch_status_enum"""
    accepted = "accepted"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class PhotoStatus(str, Enum):
    """photo_status_enum"""
    pending = "pending"
    uploaded = "uploaded"
    validated = "validated"
    rejected = "rejected"


# ---------------------------------------------------------------------------
# Intake / Write models
# ---------------------------------------------------------------------------

class AnimalCreate(BaseModel):
    """Input model for the Shelter Intake API — POST /v1/animals.

    All required fields match the AnimalSubmission schema from the OpenAPI
    spec.  Validators enforce: no future intake_date, species_detail
    required when species='other', photo_urls max 10 items, confidence_score
    0-1, and age consistency between estimated_birthdate and age_months.
    """

    external_id: str = Field(
        ..., min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$"
    )
    name: str = Field(..., min_length=1, max_length=120)
    species: Species
    species_detail: str | None = Field(None, max_length=120)
    intake_date: date
    intake_type: IntakeType | None = None
    sex: Sex | None = None
    altered: AlteredStatus | None = None
    size: Size | None = None
    primary_breed: str | None = Field(None, max_length=80)
    secondary_breed: str | None = Field(None, max_length=80)
    is_mixed: bool | None = None
    primary_color: str | None = Field(None, max_length=40)
    coat_length: CoatLength | None = None
    estimated_birthdate: date | None = None
    age_months: int | None = Field(None, ge=0, le=600)
    sac_age_group: SacAgeGroup | None = None
    weight_kg: float | None = Field(None, ge=0, le=1500)
    description: str | None = Field(None, max_length=5000)
    adoption_fee: float | None = Field(None, ge=0, le=100000)
    adoption_fee_currency: str = Field("USD", min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    special_needs: bool = False
    good_with_dogs: Trit | None = None
    good_with_cats: Trit | None = None
    good_with_kids: Trit | None = None
    photo_urls: list[str] = Field(default_factory=list, max_length=10)
    listing_url: str | None = None
    location_postal_code: str | None = Field(None, max_length=12)
    location_city: str | None = Field(None, max_length=80)
    location_state: str | None = Field(None, min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")
    location_country: str = Field("US", min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")
    status: ListingStatus = ListingStatus.adoptable
    confidence_score: float | None = Field(None, ge=0, le=1)

    @field_validator("intake_date")
    @classmethod
    def no_future_intake(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("intake_date cannot be in the future")
        if v < date(1990, 1, 1):
            raise ValueError("intake_date must be on or after 1990-01-01")
        return v

    @model_validator(mode="after")
    def species_detail_required_for_other(self) -> "AnimalCreate":
        if self.species == Species.other and not self.species_detail:
            raise ValueError("species_detail is required when species is 'other'")
        return self

    @model_validator(mode="after")
    def age_consistency(self) -> "AnimalCreate":
        if self.estimated_birthdate and self.age_months is not None:
            approx_months = (date.today() - self.estimated_birthdate).days / 30.44
            if abs(approx_months - self.age_months) > 2:
                raise ValueError(
                    "estimated_birthdate and age_months disagree by more than 60 days"
                )
        return self


class AnimalUpdate(BaseModel):
    """Partial update model — PATCH /v1/animals/{external_id}.

    All fields optional.  external_id is immutable and must NOT appear here.
    """

    name: str | None = Field(None, min_length=1, max_length=120)
    species: Species | None = None
    species_detail: str | None = Field(None, max_length=120)
    intake_date: date | None = None
    intake_type: IntakeType | None = None
    sex: Sex | None = None
    altered: AlteredStatus | None = None
    size: Size | None = None
    primary_breed: str | None = Field(None, max_length=80)
    secondary_breed: str | None = Field(None, max_length=80)
    is_mixed: bool | None = None
    primary_color: str | None = Field(None, max_length=40)
    coat_length: CoatLength | None = None
    estimated_birthdate: date | None = None
    age_months: int | None = Field(None, ge=0, le=600)
    sac_age_group: SacAgeGroup | None = None
    weight_kg: float | None = Field(None, ge=0, le=1500)
    description: str | None = Field(None, max_length=5000)
    adoption_fee: float | None = Field(None, ge=0, le=100000)
    adoption_fee_currency: str | None = Field(None, min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    special_needs: bool | None = None
    good_with_dogs: Trit | None = None
    good_with_cats: Trit | None = None
    good_with_kids: Trit | None = None
    photo_urls: list[str] | None = Field(None, max_length=10)
    listing_url: str | None = None
    location_postal_code: str | None = Field(None, max_length=12)
    location_city: str | None = Field(None, max_length=80)
    location_state: str | None = Field(None, min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")
    location_country: str | None = Field(None, min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")
    status: ListingStatus | None = None
    confidence_score: float | None = Field(None, ge=0, le=1)

    @field_validator("intake_date")
    @classmethod
    def no_future_intake(cls, v: date | None) -> date | None:
        if v is not None:
            if v > date.today():
                raise ValueError("intake_date cannot be in the future")
            if v < date(1990, 1, 1):
                raise ValueError("intake_date must be on or after 1990-01-01")
        return v


class AnimalStatusUpdate(BaseModel):
    """Body for POST /v1/animals/{external_id}/status."""

    status: ListingStatus
    outcome_type: OutcomeType | None = None
    effective_at: datetime | None = None


# ---------------------------------------------------------------------------
# Public read models (consumed by the frontend / public Read API)
# ---------------------------------------------------------------------------

class AnimalPublicSummary(BaseModel):
    """What the dog_listings VIEW returns for list / card pages.

    Compact representation for browse grids -- omits heavy fields like
    description, full photo_urls array, and location coordinates.
    """

    id: str
    name: str
    species: Species
    primary_breed: str | None = None
    secondary_breed: str | None = None
    is_mixed: bool | None = None
    sex: Sex | None = None
    size: Size | None = None
    age_months: int | None = None
    sac_age_group: SacAgeGroup | None = None
    primary_color: str | None = None
    primary_photo_url: str | None = None
    days_waiting: int
    intake_date: date
    adoption_fee: float | None = None
    good_with_dogs: Trit | None = None
    good_with_cats: Trit | None = None
    good_with_kids: Trit | None = None
    special_needs: bool = False
    location_city: str | None = None
    location_state: str | None = None
    shelter_name: str | None = Field(None, alias="org_legal_name")
    status: ListingStatus

    model_config = {"from_attributes": True, "populate_by_name": True}


class AnimalPublicDetail(BaseModel):
    """Full detail for an individual animal page.

    Extends the summary fields with description, coat_length, weight,
    altered status, full photo_urls, location coordinates, shelter metadata,
    and optional distance_miles (populated when results are geo-sorted).
    """

    # --- Summary fields (repeated so this model is self-contained) ---
    id: str
    name: str
    species: Species
    primary_breed: str | None = None
    secondary_breed: str | None = None
    is_mixed: bool | None = None
    sex: Sex | None = None
    size: Size | None = None
    age_months: int | None = None
    sac_age_group: SacAgeGroup | None = None
    primary_color: str | None = None
    primary_photo_url: str | None = None
    days_waiting: int
    intake_date: date
    adoption_fee: float | None = None
    adoption_fee_currency: str | None = None
    good_with_dogs: Trit | None = None
    good_with_cats: Trit | None = None
    good_with_kids: Trit | None = None
    special_needs: bool = False
    location_city: str | None = None
    location_state: str | None = None
    status: ListingStatus

    # --- Detail-only fields ---
    description: str | None = None
    coat_length: CoatLength | None = None
    weight_kg: float | None = None
    altered: AlteredStatus | None = None
    photo_urls: list[str] = Field(default_factory=list)
    listing_url: str | None = None
    intake_type: IntakeType | None = None
    location_lat: float | None = None
    location_lng: float | None = None
    location_postal_code: str | None = None
    location_country: str | None = None
    first_listed_at: datetime | None = None

    # --- Shelter / organization context ---
    organization_id: str | None = Field(None, alias="organization_id")
    shelter_name: str | None = Field(None, alias="org_legal_name")
    shelter_website: str | None = Field(None, alias="org_website")

    # --- Geo-sort bonus (None unless a distance query was performed) ---
    distance_miles: float | None = None

    model_config = {"from_attributes": True, "populate_by_name": True}


# ---------------------------------------------------------------------------
# Paginated responses
# ---------------------------------------------------------------------------

class AnimalPage(BaseModel):
    """Paginated list response for animal listings."""

    items: list[AnimalPublicSummary]
    pagination: PaginationMeta


class FeaturedResponse(BaseModel):
    """Featured dogs for the homepage: longest waiting + recently added."""

    longest_waiting: list[AnimalPublicSummary]
    recently_added: list[AnimalPublicSummary]


# ---------------------------------------------------------------------------
# Batch models
# ---------------------------------------------------------------------------

class BatchAnimal(BaseModel):
    """Single item in a batch submission."""

    animal: AnimalCreate
    idempotency_key: str | None = None


class BatchSubmitRequest(BaseModel):
    """POST /v1/animals/batch — up to 1000 records."""

    animals: list[AnimalCreate] = Field(..., min_length=1, max_length=1000)


class BatchJobResponse(BaseModel):
    """Status/result of an async batch job."""

    job_id: str
    status: BatchStatus
    received: int = 0
    succeeded: int = 0
    failed: int = 0
    results: list[dict] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
