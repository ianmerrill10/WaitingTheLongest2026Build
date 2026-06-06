"""Tests for the public read-only API endpoints (no auth required).

Endpoints tested:
  GET  /v1/public/dogs          — paginated dog listing with filters
  GET  /v1/public/dogs/{id}     — single dog detail
  GET  /v1/public/shelters/{id} — shelter profile
  GET  /v1/public/stats         — platform statistics
  GET  /v1/public/featured      — homepage featured dogs

All service-layer calls are patched so no real database is needed.
Service functions are module-level (not classes) and are patched at
the router module namespace.
"""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest

from tests.conftest import FAKE_ANIMAL_ID, FAKE_ORG_ID


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_dog_dict(**overrides) -> dict:
    """Return a sample dog row dict (as returned by the service layer)."""
    base = {
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
        "description": "Friendly lab.",
        "coat_length": "short",
        "weight_kg": 30.0,
        "altered": "altered",
        "photo_urls": ["https://example.com/buddy.jpg"],
        "listing_url": None,
        "intake_type": "stray_at_large",
        "location_lat": 42.36,
        "location_lng": -71.06,
        "location_postal_code": "02101",
        "location_country": "US",
        "first_listed_at": datetime(2026, 2, 1, tzinfo=timezone.utc).isoformat(),
        "organization_id": FAKE_ORG_ID,
        "org_website": "https://testshelter.org",
        "distance_miles": None,
    }
    base.update(overrides)
    return base


def _make_shelter_dict(**overrides) -> dict:
    base = {
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
        "created_at": datetime(2025, 1, 1, tzinfo=timezone.utc).isoformat(),
    }
    base.update(overrides)
    return base


# ---------------------------------------------------------------------------
# GET /v1/public/dogs
# ---------------------------------------------------------------------------


class TestListDogs:
    """Tests for the dog listing endpoint.

    The router calls animal_service.list_public_dogs(conn, ...) which
    returns a tuple of (items_list, total_count).
    """

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.public.animal_service.list_public_dogs",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_list = mock_fn
            yield

    async def test_list_dogs_returns_200(self, test_app):
        self.mock_list.return_value = ([_make_dog_dict()], 1)
        resp = await test_app.get("/v1/public/dogs")
        assert resp.status_code == 200
        body = resp.json()
        assert "items" in body
        assert "pagination" in body

    async def test_list_dogs_empty(self, test_app):
        self.mock_list.return_value = ([], 0)
        resp = await test_app.get("/v1/public/dogs")
        assert resp.status_code == 200
        body = resp.json()
        assert body["items"] == []
        assert body["pagination"]["total"] == 0

    async def test_list_dogs_pagination_meta(self, test_app):
        self.mock_list.return_value = ([_make_dog_dict()], 50)
        resp = await test_app.get("/v1/public/dogs?page=1&per_page=10")
        assert resp.status_code == 200
        pag = resp.json()["pagination"]
        assert pag["total"] == 50
        assert pag["page"] == 1
        assert pag["per_page"] == 10
        assert pag["total_pages"] == 5
        assert pag["has_next"] is True
        assert pag["has_prev"] is False

    async def test_list_dogs_last_page(self, test_app):
        self.mock_list.return_value = ([], 50)
        resp = await test_app.get("/v1/public/dogs?page=5&per_page=10")
        assert resp.status_code == 200
        pag = resp.json()["pagination"]
        assert pag["has_next"] is False
        assert pag["has_prev"] is True

    async def test_list_dogs_single_page(self, test_app):
        self.mock_list.return_value = ([_make_dog_dict()], 3)
        resp = await test_app.get("/v1/public/dogs?per_page=20")
        pag = resp.json()["pagination"]
        assert pag["total_pages"] == 1
        assert pag["has_next"] is False
        assert pag["has_prev"] is False

    async def test_list_dogs_with_breed_filter(self, test_app):
        self.mock_list.return_value = ([_make_dog_dict()], 1)
        resp = await test_app.get("/v1/public/dogs?breed=labrador")
        assert resp.status_code == 200
        # Verify the service was called with the breed filter
        self.mock_list.assert_called_once()
        _, kwargs = self.mock_list.call_args
        assert kwargs.get("breed") == "labrador"

    async def test_list_dogs_with_size_filter(self, test_app):
        self.mock_list.return_value = ([], 0)
        resp = await test_app.get("/v1/public/dogs?size=small")
        assert resp.status_code == 200

    async def test_list_dogs_with_state_filter(self, test_app):
        self.mock_list.return_value = ([_make_dog_dict()], 1)
        resp = await test_app.get("/v1/public/dogs?state=MA")
        assert resp.status_code == 200

    async def test_list_dogs_default_sort(self, test_app):
        """Default sort is days_waiting_desc."""
        self.mock_list.return_value = ([], 0)
        resp = await test_app.get("/v1/public/dogs")
        assert resp.status_code == 200
        _, kwargs = self.mock_list.call_args
        assert kwargs.get("sort") == "days_waiting_desc"

    async def test_list_dogs_name_asc_sort(self, test_app):
        """name_asc sort should be passed through."""
        self.mock_list.return_value = ([], 0)
        resp = await test_app.get("/v1/public/dogs?sort=name_asc")
        assert resp.status_code == 200
        _, kwargs = self.mock_list.call_args
        assert kwargs.get("sort") == "name_asc"


# ---------------------------------------------------------------------------
# GET /v1/public/dogs/{dog_id}
# ---------------------------------------------------------------------------


class TestGetDog:

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.public.animal_service.get_animal_by_id",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_get = mock_fn
            yield

    async def test_get_dog_found(self, test_app):
        self.mock_get.return_value = _make_dog_dict()
        resp = await test_app.get(f"/v1/public/dogs/{FAKE_ANIMAL_ID}")
        assert resp.status_code == 200
        body = resp.json()
        assert body["name"] == "Buddy"

    async def test_get_dog_not_found(self, test_app):
        self.mock_get.return_value = None
        resp = await test_app.get("/v1/public/dogs/nonexistent-id")
        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"].lower()


# ---------------------------------------------------------------------------
# GET /v1/public/shelters/{shelter_id}
# ---------------------------------------------------------------------------


class TestGetShelter:

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.public.org_service.get_organization_public",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_get = mock_fn
            yield

    async def test_get_shelter_found(self, test_app):
        self.mock_get.return_value = _make_shelter_dict()
        resp = await test_app.get(f"/v1/public/shelters/{FAKE_ORG_ID}")
        assert resp.status_code == 200
        body = resp.json()
        assert body["legal_name"] == "Test Shelter"

    async def test_get_shelter_not_found(self, test_app):
        self.mock_get.return_value = None
        resp = await test_app.get("/v1/public/shelters/nonexistent-id")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# GET /v1/public/stats
# ---------------------------------------------------------------------------


class TestGetStats:

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.public.stats_service.get_platform_stats",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_stats = mock_fn
            yield

    async def test_get_stats_200(self, test_app):
        self.mock_stats.return_value = {
            "total_dogs": 500,
            "total_shelters": 25,
            "adoptions_this_month": 30,
            "avg_wait_days": 45.2,
            "longest_wait_days": 350,
        }
        resp = await test_app.get("/v1/public/stats")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total_dogs"] == 500
        assert body["total_shelters"] == 25


# ---------------------------------------------------------------------------
# GET /v1/public/featured
# ---------------------------------------------------------------------------


class TestGetFeatured:

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.public.animal_service.get_featured_dogs",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_featured = mock_fn
            yield

    async def test_get_featured_200(self, test_app):
        dogs = [_make_dog_dict(name=f"Dog{i}") for i in range(3)]
        self.mock_featured.return_value = {
            "longest_waiting": dogs,
            "recently_added": dogs[:1],
        }
        resp = await test_app.get("/v1/public/featured")
        assert resp.status_code == 200
        body = resp.json()
        assert "longest_waiting" in body
        assert "recently_added" in body
        assert len(body["longest_waiting"]) == 3

    async def test_get_featured_empty(self, test_app):
        self.mock_featured.return_value = {
            "longest_waiting": [],
            "recently_added": [],
        }
        resp = await test_app.get("/v1/public/featured")
        assert resp.status_code == 200
        assert resp.json()["longest_waiting"] == []
        assert resp.json()["recently_added"] == []
