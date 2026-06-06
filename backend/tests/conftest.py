"""Test configuration and shared fixtures for WaitingTheLongest.com backend.

Uses httpx.AsyncClient with ASGITransport for async endpoint testing.
Mocks the database layer so no real PostgreSQL is required.

pytest-asyncio is configured in pyproject.toml with asyncio_mode = "auto",
so all async fixtures and tests run automatically without the
@pytest.mark.asyncio decorator.
"""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FAKE_ORG_ID = "11111111-1111-1111-1111-111111111111"
FAKE_ANIMAL_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
FAKE_API_KEY = "wtl_abc12345deadbeef0000000000000000000000000000"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def sample_org() -> dict:
    """A dict matching the shelters_public view / OrganizationPublic model."""
    return {
        "id": FAKE_ORG_ID,
        "legal_name": "Test Shelter",
        "org_type": "rescue",
        "verification_tier": "tier_1_verified",
        "city": "Boston",
        "state": "MA",
        "postal_code": "02101",
        "country": "US",
        "website": "https://testshelter.org",
        "active_listings": 12,
        "created_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
    }


@pytest.fixture
def sample_dog() -> dict:
    """A dict matching the dog_listings view / AnimalPublicSummary output."""
    return {
        "id": FAKE_ANIMAL_ID,
        "name": "Buddy",
        "species": "dog",
        "primary_breed": "Labrador Retriever",
        "secondary_breed": None,
        "is_mixed": False,
        "sex": "male",
        "size": "large",
        "age_months": 36,
        "sac_age_group": "adult",
        "primary_color": "yellow",
        "primary_photo_url": "https://example.com/buddy.jpg",
        "days_waiting": 120,
        "intake_date": "2026-02-01",
        "adoption_fee": 150.0,
        "adoption_fee_currency": "USD",
        "good_with_dogs": "yes",
        "good_with_cats": "unknown",
        "good_with_kids": "yes",
        "special_needs": False,
        "location_city": "Boston",
        "location_state": "MA",
        "org_legal_name": "Test Shelter",
        "status": "adoptable",
        "description": "Friendly lab looking for a forever home.",
        "coat_length": "short",
        "weight_kg": 30.0,
        "altered": "altered",
        "photo_urls": ["https://example.com/buddy.jpg", "https://example.com/buddy2.jpg"],
        "listing_url": "https://testshelter.org/buddy",
        "intake_type": "stray_at_large",
        "location_lat": 42.3601,
        "location_lng": -71.0589,
        "location_postal_code": "02101",
        "location_country": "US",
        "first_listed_at": datetime(2026, 2, 1, tzinfo=timezone.utc).isoformat(),
        "organization_id": FAKE_ORG_ID,
        "org_website": "https://testshelter.org",
        "distance_miles": None,
        "external_id": "EXT-001",
    }


@pytest.fixture
def mock_org() -> dict:
    """Override the get_org dependency to return a fake authenticated org dict."""
    return {
        "id": FAKE_ORG_ID,
        "legal_name": "Test Shelter",
        "verification_tier": "tier_1_verified",
        "rate_limit_per_hour": 1000,
        "key_tier": "tier_1_verified",
    }


@pytest.fixture
def mock_db():
    """Mock asyncpg connection that can be configured per test.

    Returns an AsyncMock that quacks like an asyncpg.Connection.
    Tests can set return values on .fetchrow, .fetch, .fetchval, .execute.
    """
    conn = AsyncMock()
    conn.fetchrow = AsyncMock(return_value=None)
    conn.fetch = AsyncMock(return_value=[])
    conn.fetchval = AsyncMock(return_value=0)
    conn.execute = AsyncMock(return_value=None)
    return conn


@pytest.fixture
async def test_app(mock_db, mock_org):
    """FastAPI TestClient backed by httpx.AsyncClient.

    Overrides:
    - get_db  -> yields mock_db
    - get_org -> returns mock_org (bypasses API-key auth entirely)
    """
    from app.main import app
    from app.database import get_db
    from app.dependencies import get_org

    async def _override_db():
        yield mock_db

    async def _override_org():
        return mock_org

    app.dependency_overrides[get_db] = _override_db
    app.dependency_overrides[get_org] = _override_org

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Cleanup overrides so other tests start fresh
    app.dependency_overrides.clear()
