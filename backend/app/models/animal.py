from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class Species(str, Enum):
    dog = "dog"
    cat = "cat"
    rabbit = "rabbit"
    equine = "equine"
    small_mammal = "small_mammal"
    bird = "bird"
    reptile_amphibian = "reptile_amphibian"
    farm_animal = "farm_animal"
    other = "other"


class SexEnum(str, Enum):
    male = "male"
    female = "female"
    unknown = "unknown"


class AlteredEnum(str, Enum):
    altered = "altered"
    intact = "intact"
    unknown = "unknown"


class SizeEnum(str, Enum):
    small = "small"
    medium = "medium"
    large = "large"
    xlarge = "xlarge"


class SacAgeGroupEnum(str, Enum):
    under_5_months = "under_5_months"
    adult = "adult"
    unknown = "unknown"


class YesNoUnknown(str, Enum):
    yes = "yes"
    no = "no"
    unknown = "unknown"


class StatusEnum(str, Enum):
    adoptable = "adoptable"
    pending = "pending"
    adopted = "adopted"
    on_hold = "on_hold"
    not_available = "not_available"
    removed = "removed"


class AnimalBase(BaseModel):
    external_id: str
    name: str
    species: Species
    species_detail: Optional[str] = None
    intake_date: date
    intake_type: Optional[str] = None
    sex: Optional[SexEnum] = None
    altered: Optional[AlteredEnum] = None
    size: Optional[SizeEnum] = None
    primary_breed: Optional[str] = None
    secondary_breed: Optional[str] = None
    is_mixed: Optional[bool] = None
    primary_color: Optional[str] = None
    coat_length: Optional[str] = None
    estimated_birthdate: Optional[date] = None
    age_months: Optional[int] = Field(None, ge=0)
    sac_age_group: Optional[SacAgeGroupEnum] = None
    weight_kg: Optional[float] = Field(None, ge=0)
    description: Optional[str] = Field(None, max_length=5000)
    adoption_fee: Optional[float] = None
    adoption_fee_currency: Optional[str] = Field("USD", max_length=3, min_length=3)
    special_needs: bool = False
    good_with_dogs: Optional[YesNoUnknown] = None
    good_with_cats: Optional[YesNoUnknown] = None
    good_with_kids: Optional[YesNoUnknown] = None
    photo_urls: List[str] = Field(default_factory=list)
    listing_url: Optional[str] = None
    location_postal_code: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = Field(None, max_length=2, min_length=2)
    location_country: Optional[str] = Field("US", max_length=2, min_length=2)
    status: StatusEnum = StatusEnum.adoptable

    @field_validator("intake_date")
    @classmethod
    def validate_intake_date(cls, v):
        if v > date.today():
            raise ValueError("intake_date cannot be in the future")
        if v < date(1990, 1, 1):
            raise ValueError("intake_date must be after 1990-01-01")
        return v

    @model_validator(mode="after")
    def validate_species_detail(self):
        if self.species == Species.other and not self.species_detail:
            raise ValueError("species_detail is required when species is 'other'")
        return self

    @model_validator(mode="after")
    def validate_age_consistency(self):
        if self.estimated_birthdate and self.age_months is not None:
            today = date.today()
            approx_months = (today - self.estimated_birthdate).days / 30.44
            if abs(approx_months - self.age_months) > 2:
                raise ValueError("estimated_birthdate and age_months disagree by more than 60 days")
        return self


class AnimalCreate(AnimalBase):
    pass


class AnimalUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[Species] = None
    species_detail: Optional[str] = None
    intake_date: Optional[date] = None
    intake_type: Optional[str] = None
    sex: Optional[SexEnum] = None
    altered: Optional[AlteredEnum] = None
    size: Optional[SizeEnum] = None
    primary_breed: Optional[str] = None
    secondary_breed: Optional[str] = None
    is_mixed: Optional[bool] = None
    primary_color: Optional[str] = None
    coat_length: Optional[str] = None
    estimated_birthdate: Optional[date] = None
    age_months: Optional[int] = None
    sac_age_group: Optional[SacAgeGroupEnum] = None
    weight_kg: Optional[float] = None
    description: Optional[str] = Field(None, max_length=5000)
    adoption_fee: Optional[float] = None
    adoption_fee_currency: Optional[str] = None
    special_needs: Optional[bool] = None
    good_with_dogs: Optional[YesNoUnknown] = None
    good_with_cats: Optional[YesNoUnknown] = None
    good_with_kids: Optional[YesNoUnknown] = None
    photo_urls: Optional[List[str]] = None
    listing_url: Optional[str] = None
    location_postal_code: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    status: Optional[StatusEnum] = None


class AnimalStatusUpdate(BaseModel):
    status: StatusEnum
    outcome_type: Optional[str] = None
    effective_at: Optional[datetime] = None


class AnimalResponse(BaseModel):
    id: str
    organization_id: str
    external_id: str
    name: str
    species: Species
    species_detail: Optional[str] = None
    intake_date: date
    intake_age_days: int
    confidence_score: float
    status: StatusEnum
    intake_type: Optional[str] = None
    sex: Optional[SexEnum] = None
    altered: Optional[AlteredEnum] = None
    size: Optional[SizeEnum] = None
    primary_breed: Optional[str] = None
    secondary_breed: Optional[str] = None
    is_mixed: Optional[bool] = None
    primary_color: Optional[str] = None
    coat_length: Optional[str] = None
    estimated_birthdate: Optional[date] = None
    age_months: Optional[int] = None
    sac_age_group: Optional[SacAgeGroupEnum] = None
    weight_kg: Optional[float] = None
    description: Optional[str] = None
    adoption_fee: Optional[float] = None
    adoption_fee_currency: Optional[str] = None
    special_needs: Optional[bool] = None
    good_with_dogs: Optional[YesNoUnknown] = None
    good_with_cats: Optional[YesNoUnknown] = None
    good_with_kids: Optional[YesNoUnknown] = None
    photo_urls: Optional[List[str]] = None
    listing_url: Optional[str] = None
    location_postal_code: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    first_listed_at: datetime
    last_seen_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BatchAnimal(BaseModel):
    animal: AnimalCreate
    idempotency_key: Optional[str] = None


class BatchSubmitRequest(BaseModel):
    animals: List[BatchAnimal] = Field(..., min_length=1, max_length=1000)
