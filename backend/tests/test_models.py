"""Tests for all Pydantic models and PostgreSQL-mirrored enums.

Covers:
- All 14 enum types (serialization, membership, values)
- AnimalCreate validation (valid data, future intake_date, confidence_score,
  photo_urls cap, species_detail requirement, age consistency, external_id format)
- AnimalUpdate partial-update semantics
- OrganizationCreate EIN validation and normalization
- Problem model (RFC 9457)
- PaginationMeta
- AnimalStatusUpdate
- BatchSubmitRequest
- AnimalPublicSummary / AnimalPublicDetail from_attributes

20+ test functions total.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import pytest
from pydantic import ValidationError

from app.models.animal import (
    AlteredStatus,
    AnimalCreate,
    AnimalPage,
    AnimalPublicDetail,
    AnimalPublicSummary,
    AnimalStatusUpdate,
    AnimalUpdate,
    BatchStatus,
    BatchSubmitRequest,
    CoatLength,
    FeaturedResponse,
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
from app.models.common import HealthResponse, PaginationMeta, Problem
from app.models.organization import (
    ApiKeyResponse,
    OrganizationCreate,
    OrganizationDetail,
    OrganizationPublic,
)


# ---------------------------------------------------------------------------
# Enum tests
# ---------------------------------------------------------------------------


class TestEnumSerialization:
    """Verify all 14 enum types serialize to their string values."""

    def test_species_values(self):
        assert Species.dog.value == "dog"
        assert Species.cat.value == "cat"
        assert Species.rabbit.value == "rabbit"
        assert Species.equine.value == "equine"
        assert Species.small_mammal.value == "small_mammal"
        assert Species.bird.value == "bird"
        assert Species.reptile_amphibian.value == "reptile_amphibian"
        assert Species.farm_animal.value == "farm_animal"
        assert Species.other.value == "other"
        assert len(Species) == 9

    def test_intake_type_values(self):
        assert IntakeType.stray_at_large.value == "stray_at_large"
        assert IntakeType.relinquished_by_owner.value == "relinquished_by_owner"
        assert IntakeType.owner_intended_euthanasia.value == "owner_intended_euthanasia"
        assert IntakeType.transfer_in_in_state.value == "transfer_in_in_state"
        assert IntakeType.transfer_in_out_of_state.value == "transfer_in_out_of_state"
        assert IntakeType.seized_custody.value == "seized_custody"
        assert IntakeType.born_in_care.value == "born_in_care"
        assert IntakeType.other_intake.value == "other_intake"
        assert len(IntakeType) == 8

    def test_outcome_type_values(self):
        assert OutcomeType.adoption.value == "adoption"
        assert OutcomeType.return_to_owner.value == "return_to_owner"
        assert OutcomeType.shelter_euthanasia.value == "shelter_euthanasia"
        assert len(OutcomeType) == 9

    def test_listing_status_values(self):
        assert ListingStatus.adoptable.value == "adoptable"
        assert ListingStatus.pending.value == "pending"
        assert ListingStatus.adopted.value == "adopted"
        assert ListingStatus.on_hold.value == "on_hold"
        assert ListingStatus.not_available.value == "not_available"
        assert ListingStatus.removed.value == "removed"
        assert len(ListingStatus) == 6

    def test_sex_values(self):
        assert Sex.male.value == "male"
        assert Sex.female.value == "female"
        assert Sex.unknown.value == "unknown"
        assert len(Sex) == 3

    def test_altered_status_values(self):
        assert AlteredStatus.altered.value == "altered"
        assert AlteredStatus.intact.value == "intact"
        assert AlteredStatus.unknown.value == "unknown"
        assert len(AlteredStatus) == 3

    def test_size_values(self):
        assert Size.small.value == "small"
        assert Size.medium.value == "medium"
        assert Size.large.value == "large"
        assert Size.xlarge.value == "xlarge"
        assert len(Size) == 4

    def test_coat_length_values(self):
        assert CoatLength.hairless.value == "hairless"
        assert CoatLength.short.value == "short"
        assert CoatLength.wire.value == "wire"
        assert CoatLength.curly.value == "curly"
        assert CoatLength.double.value == "double"
        assert CoatLength.unknown.value == "unknown"
        assert len(CoatLength) == 8

    def test_sac_age_group_values(self):
        assert SacAgeGroup.under_5_months.value == "under_5_months"
        assert SacAgeGroup.adult.value == "adult"
        assert SacAgeGroup.unknown.value == "unknown"
        assert len(SacAgeGroup) == 3

    def test_trit_values(self):
        assert Trit.yes.value == "yes"
        assert Trit.no.value == "no"
        assert Trit.unknown.value == "unknown"
        assert len(Trit) == 3

    def test_org_type_values(self):
        assert OrgType.municipal.value == "municipal"
        assert OrgType.humane_society.value == "humane_society"
        assert OrgType.spca.value == "spca"
        assert OrgType.rescue.value == "rescue"
        assert OrgType.foster_network.value == "foster_network"
        assert OrgType.sanctuary.value == "sanctuary"
        assert OrgType.other.value == "other"
        assert len(OrgType) == 7

    def test_verification_tier_values(self):
        assert VerificationTier.tier_0_self_asserted.value == "tier_0_self_asserted"
        assert VerificationTier.tier_1_verified.value == "tier_1_verified"
        assert VerificationTier.tier_2_trusted.value == "tier_2_trusted"
        assert len(VerificationTier) == 3

    def test_batch_status_values(self):
        assert BatchStatus.accepted.value == "accepted"
        assert BatchStatus.processing.value == "processing"
        assert BatchStatus.completed.value == "completed"
        assert BatchStatus.failed.value == "failed"
        assert len(BatchStatus) == 4

    def test_photo_status_values(self):
        assert PhotoStatus.pending.value == "pending"
        assert PhotoStatus.uploaded.value == "uploaded"
        assert PhotoStatus.validated.value == "validated"
        assert PhotoStatus.rejected.value == "rejected"
        assert len(PhotoStatus) == 4

    def test_all_enums_are_str_subclass(self):
        """Every enum inherits from str so JSON serialization works natively."""
        all_enums = [
            Species, IntakeType, OutcomeType, ListingStatus, Sex,
            AlteredStatus, Size, CoatLength, SacAgeGroup, Trit,
            OrgType, VerificationTier, BatchStatus, PhotoStatus,
        ]
        for enum_cls in all_enums:
            for member in enum_cls:
                assert isinstance(member, str), (
                    f"{enum_cls.__name__}.{member.name} is not a str subclass"
                )


# ---------------------------------------------------------------------------
# AnimalCreate tests
# ---------------------------------------------------------------------------

def _valid_animal_data(**overrides) -> dict:
    """Return a minimal valid AnimalCreate dict, with optional overrides."""
    base = {
        "external_id": "EXT-001",
        "name": "Buddy",
        "species": "dog",
        "intake_date": str(date.today() - timedelta(days=30)),
    }
    base.update(overrides)
    return base


class TestAnimalCreate:

    def test_valid_minimal_data(self):
        """Minimal required fields should validate without error."""
        animal = AnimalCreate(**_valid_animal_data())
        assert animal.name == "Buddy"
        assert animal.species == Species.dog
        assert animal.status == ListingStatus.adoptable  # default
        assert animal.adoption_fee_currency == "USD"
        assert animal.special_needs is False
        assert animal.photo_urls == []

    def test_valid_full_data(self):
        """All optional fields populated should validate."""
        data = _valid_animal_data(
            species_detail=None,
            intake_type="stray_at_large",
            sex="male",
            altered="altered",
            size="large",
            primary_breed="Labrador Retriever",
            secondary_breed="Golden Retriever",
            is_mixed=True,
            primary_color="yellow",
            coat_length="short",
            age_months=36,
            sac_age_group="adult",
            weight_kg=30.0,
            description="Friendly dog",
            adoption_fee=150.0,
            good_with_dogs="yes",
            good_with_cats="unknown",
            good_with_kids="yes",
            photo_urls=["https://example.com/photo.jpg"],
            listing_url="https://example.com/buddy",
            location_postal_code="02101",
            location_city="Boston",
            location_state="MA",
            location_country="US",
            status="adoptable",
            confidence_score=0.85,
        )
        animal = AnimalCreate(**data)
        assert animal.primary_breed == "Labrador Retriever"
        assert animal.confidence_score == 0.85
        assert animal.good_with_dogs == Trit.yes

    def test_future_intake_date_rejected(self):
        """intake_date in the future should raise a validation error."""
        future_date = date.today() + timedelta(days=1)
        with pytest.raises(ValidationError, match="intake_date cannot be in the future"):
            AnimalCreate(**_valid_animal_data(intake_date=str(future_date)))

    def test_very_old_intake_date_rejected(self):
        """intake_date before 1990-01-01 should be rejected."""
        with pytest.raises(ValidationError, match="1990-01-01"):
            AnimalCreate(**_valid_animal_data(intake_date="1989-12-31"))

    def test_confidence_score_below_zero_rejected(self):
        """confidence_score < 0 should fail."""
        with pytest.raises(ValidationError):
            AnimalCreate(**_valid_animal_data(confidence_score=-0.1))

    def test_confidence_score_above_one_rejected(self):
        """confidence_score > 1 should fail."""
        with pytest.raises(ValidationError):
            AnimalCreate(**_valid_animal_data(confidence_score=1.01))

    def test_confidence_score_boundaries(self):
        """confidence_score at 0 and 1 should pass."""
        a0 = AnimalCreate(**_valid_animal_data(confidence_score=0.0))
        assert a0.confidence_score == 0.0
        a1 = AnimalCreate(**_valid_animal_data(confidence_score=1.0))
        assert a1.confidence_score == 1.0

    def test_photo_urls_over_10_rejected(self):
        """More than 10 photo_urls should fail validation."""
        urls = [f"https://example.com/photo{i}.jpg" for i in range(11)]
        with pytest.raises(ValidationError):
            AnimalCreate(**_valid_animal_data(photo_urls=urls))

    def test_photo_urls_exactly_10_allowed(self):
        """Exactly 10 photo_urls should be accepted."""
        urls = [f"https://example.com/photo{i}.jpg" for i in range(10)]
        animal = AnimalCreate(**_valid_animal_data(photo_urls=urls))
        assert len(animal.photo_urls) == 10

    def test_species_other_requires_detail(self):
        """species='other' without species_detail should fail."""
        with pytest.raises(ValidationError, match="species_detail is required"):
            AnimalCreate(**_valid_animal_data(species="other", species_detail=None))

    def test_species_other_with_detail_passes(self):
        """species='other' with species_detail provided should pass."""
        animal = AnimalCreate(**_valid_animal_data(
            species="other", species_detail="Chinchilla"
        ))
        assert animal.species_detail == "Chinchilla"

    def test_external_id_invalid_chars_rejected(self):
        """external_id with special chars should fail the regex pattern."""
        with pytest.raises(ValidationError):
            AnimalCreate(**_valid_animal_data(external_id="EXT 001!"))

    def test_external_id_valid_patterns(self):
        """external_id should accept alphanumeric, dots, colons, hyphens, underscores."""
        for ext_id in ["ABC-123", "shelter.dog:42", "A_B.C-D:E"]:
            animal = AnimalCreate(**_valid_animal_data(external_id=ext_id))
            assert animal.external_id == ext_id

    def test_age_consistency_check(self):
        """estimated_birthdate and age_months disagreeing by >60 days should fail."""
        # estimated_birthdate says the animal is ~12 months old
        bd = date.today() - timedelta(days=365)
        # but age_months says 48 -- disagreement is ~36 months
        with pytest.raises(ValidationError, match="disagree"):
            AnimalCreate(**_valid_animal_data(
                estimated_birthdate=str(bd),
                age_months=48,
            ))

    def test_age_consistency_within_tolerance(self):
        """estimated_birthdate and age_months within 60-day tolerance should pass."""
        bd = date.today() - timedelta(days=365)
        animal = AnimalCreate(**_valid_animal_data(
            estimated_birthdate=str(bd),
            age_months=12,
        ))
        assert animal.age_months == 12

    def test_location_state_must_be_two_uppercase(self):
        """location_state must be exactly 2 uppercase letters."""
        with pytest.raises(ValidationError):
            AnimalCreate(**_valid_animal_data(location_state="mass"))
        # Valid
        animal = AnimalCreate(**_valid_animal_data(location_state="MA"))
        assert animal.location_state == "MA"

    def test_weight_kg_upper_bound(self):
        """weight_kg above 1500 should fail."""
        with pytest.raises(ValidationError):
            AnimalCreate(**_valid_animal_data(weight_kg=1501))

    def test_adoption_fee_non_negative(self):
        """adoption_fee below 0 should fail."""
        with pytest.raises(ValidationError):
            AnimalCreate(**_valid_animal_data(adoption_fee=-10))


# ---------------------------------------------------------------------------
# AnimalUpdate tests
# ---------------------------------------------------------------------------


class TestAnimalUpdate:

    def test_all_fields_optional(self):
        """An empty AnimalUpdate (all None) should be valid."""
        update = AnimalUpdate()
        assert update.name is None
        assert update.species is None
        assert update.size is None
        assert update.photo_urls is None

    def test_partial_update(self):
        """Only provided fields should be set."""
        update = AnimalUpdate(name="Rex", size="medium")
        assert update.name == "Rex"
        assert update.size == Size.medium
        assert update.primary_breed is None
        assert update.species is None

    def test_photo_urls_over_10_rejected(self):
        """AnimalUpdate also enforces the 10-photo cap."""
        urls = [f"https://example.com/p{i}.jpg" for i in range(11)]
        with pytest.raises(ValidationError):
            AnimalUpdate(photo_urls=urls)

    def test_future_intake_date_rejected(self):
        """AnimalUpdate validates intake_date the same as AnimalCreate."""
        future_date = date.today() + timedelta(days=1)
        with pytest.raises(ValidationError, match="intake_date cannot be in the future"):
            AnimalUpdate(intake_date=future_date)

    def test_valid_intake_date_passes(self):
        """A past intake_date should be accepted."""
        past = date.today() - timedelta(days=10)
        update = AnimalUpdate(intake_date=past)
        assert update.intake_date == past


# ---------------------------------------------------------------------------
# AnimalStatusUpdate tests
# ---------------------------------------------------------------------------


class TestAnimalStatusUpdate:

    def test_valid_status_update(self):
        su = AnimalStatusUpdate(status="adopted", outcome_type="adoption")
        assert su.status == ListingStatus.adopted
        assert su.outcome_type == OutcomeType.adoption

    def test_status_only(self):
        su = AnimalStatusUpdate(status="on_hold")
        assert su.status == ListingStatus.on_hold
        assert su.outcome_type is None
        assert su.effective_at is None


# ---------------------------------------------------------------------------
# OrganizationCreate tests
# ---------------------------------------------------------------------------


class TestOrganizationCreate:

    def test_valid_org_with_ein(self):
        org = OrganizationCreate(
            legal_name="Happy Tails Rescue",
            ein="12-3456789",
            contact_email="admin@happytails.org",
        )
        assert org.ein == "12-3456789"
        assert org.country == "US"

    def test_ein_without_dash_normalized(self):
        """EIN submitted as 9 digits without dash should get normalized."""
        org = OrganizationCreate(
            legal_name="Test Shelter",
            ein="123456789",
            contact_email="test@shelter.org",
        )
        assert org.ein == "12-3456789"

    def test_ein_invalid_format_rejected(self):
        """EIN that doesn't match XX-XXXXXXX pattern should fail."""
        with pytest.raises(ValidationError):
            OrganizationCreate(
                legal_name="Bad Shelter",
                ein="1234",
                contact_email="bad@shelter.org",
            )

    def test_ein_optional(self):
        """EIN is not required."""
        org = OrganizationCreate(
            legal_name="No EIN Rescue",
            contact_email="noein@rescue.org",
        )
        assert org.ein is None

    def test_invalid_email_rejected(self):
        """contact_email must be a valid email address."""
        with pytest.raises(ValidationError):
            OrganizationCreate(
                legal_name="Bad Email Rescue",
                ein="12-3456789",
                contact_email="not-an-email",
            )

    def test_state_must_be_two_uppercase(self):
        """state must be exactly 2 uppercase letters."""
        with pytest.raises(ValidationError):
            OrganizationCreate(
                legal_name="State Test",
                contact_email="state@test.org",
                state="mass",
            )

    def test_legal_name_too_short(self):
        """legal_name must be at least 2 characters."""
        with pytest.raises(ValidationError):
            OrganizationCreate(
                legal_name="A",
                contact_email="a@test.org",
            )


# ---------------------------------------------------------------------------
# Problem (RFC 9457) tests
# ---------------------------------------------------------------------------


class TestProblem:

    def test_minimal_problem(self):
        p = Problem(title="Not Found", status=404)
        assert p.type == "about:blank"
        assert p.title == "Not Found"
        assert p.status == 404
        assert p.detail is None
        assert p.instance is None
        assert p.errors is None

    def test_full_problem(self):
        p = Problem(
            type="https://api.waitingthelongest.com/errors/validation",
            title="Validation Error",
            status=422,
            detail="intake_date cannot be in the future",
            instance="/v1/intake/animals",
            errors=[{"field": "intake_date", "message": "future date"}],
        )
        assert p.detail == "intake_date cannot be in the future"
        assert len(p.errors) == 1
        assert p.errors[0]["field"] == "intake_date"


# ---------------------------------------------------------------------------
# PaginationMeta tests
# ---------------------------------------------------------------------------


class TestPaginationMeta:

    def test_first_page(self):
        meta = PaginationMeta(
            total=100, page=1, per_page=20, total_pages=5,
            has_next=True, has_prev=False,
        )
        assert meta.has_next is True
        assert meta.has_prev is False
        assert meta.total_pages == 5

    def test_last_page(self):
        meta = PaginationMeta(
            total=100, page=5, per_page=20, total_pages=5,
            has_next=False, has_prev=True,
        )
        assert meta.has_next is False
        assert meta.has_prev is True

    def test_single_page(self):
        meta = PaginationMeta(
            total=3, page=1, per_page=20, total_pages=1,
            has_next=False, has_prev=False,
        )
        assert meta.has_next is False
        assert meta.has_prev is False


# ---------------------------------------------------------------------------
# BatchSubmitRequest tests
# ---------------------------------------------------------------------------


class TestBatchSubmitRequest:

    def test_valid_batch(self):
        animals = [_valid_animal_data(external_id=f"EXT-{i}") for i in range(3)]
        batch = BatchSubmitRequest(animals=[AnimalCreate(**a) for a in animals])
        assert len(batch.animals) == 3

    def test_empty_batch_rejected(self):
        """Batch with zero animals should fail (min_length=1)."""
        with pytest.raises(ValidationError):
            BatchSubmitRequest(animals=[])

    def test_batch_over_1000_rejected(self):
        """Batch with more than 1000 animals should fail (max_length=1000)."""
        animals = [
            AnimalCreate(**_valid_animal_data(external_id=f"EXT-{i}"))
            for i in range(1001)
        ]
        with pytest.raises(ValidationError):
            BatchSubmitRequest(animals=animals)


# ---------------------------------------------------------------------------
# HealthResponse tests
# ---------------------------------------------------------------------------


class TestHealthResponse:

    def test_health_response(self):
        h = HealthResponse(
            status="healthy",
            version="v1",
            database="connected",
            timestamp=datetime.now(timezone.utc),
        )
        assert h.status == "healthy"
        assert h.version == "v1"


# ---------------------------------------------------------------------------
# ApiKeyResponse tests
# ---------------------------------------------------------------------------


class TestApiKeyResponse:

    def test_api_key_response_defaults(self):
        r = ApiKeyResponse(
            api_key="wtl_abc123",
            key_prefix="wtl_abc1",
            organization_id="some-uuid",
        )
        assert r.verification_tier == VerificationTier.tier_0_self_asserted
        assert r.rate_limit_per_hour == 100


# ---------------------------------------------------------------------------
# Public summary / detail model tests
# ---------------------------------------------------------------------------


class TestPublicModels:

    def test_animal_public_summary(self, sample_dog):
        summary = AnimalPublicSummary(**sample_dog)
        assert summary.name == "Buddy"
        assert summary.days_waiting == 120
        assert summary.status == ListingStatus.adoptable
        # alias population -- shelter_name comes from org_legal_name
        assert summary.shelter_name == "Test Shelter"

    def test_animal_public_detail(self, sample_dog):
        detail = AnimalPublicDetail(**sample_dog)
        assert detail.description == "Friendly lab looking for a forever home."
        assert detail.coat_length == CoatLength.short
        assert detail.weight_kg == 30.0
        assert len(detail.photo_urls) == 2
        assert detail.shelter_name == "Test Shelter"
        assert detail.shelter_website == "https://testshelter.org"
