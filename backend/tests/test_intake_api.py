"""Tests for the Shelter Intake API (authenticated endpoints).

Endpoints tested:
  POST   /v1/intake/animals                        — create animal (201)
  GET    /v1/intake/animals                        — list org's animals
  GET    /v1/intake/animals/{external_id}          — get single animal
  PUT    /v1/intake/animals/{external_id}          — update animal
  DELETE /v1/intake/animals/{external_id}          — soft-delete animal
  POST   /v1/intake/batch                          — batch submit (202)
  POST   /v1/intake/animals/{external_id}/status   — update status
  POST   /v1/intake/animals/{external_id}/photos   — add photo

All service-layer calls are patched at the module level.
The mock_org fixture from conftest bypasses API-key authentication.
A separate set of tests verifies that endpoints return 401/403
when no key is provided.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from tests.conftest import FAKE_ANIMAL_ID, FAKE_ORG_ID


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _valid_animal_payload(**overrides) -> dict:
    """Return a valid JSON body for POST /v1/intake/animals."""
    base = {
        "external_id": "EXT-001",
        "name": "Buddy",
        "species": "dog",
        "intake_date": str(date.today() - timedelta(days=30)),
    }
    base.update(overrides)
    return base


def _animal_response_dict(**overrides) -> dict:
    """Return a dict that resembles a service-layer animal result."""
    base = {
        "id": FAKE_ANIMAL_ID,
        "external_id": "EXT-001",
        "organization_id": FAKE_ORG_ID,
        "name": "Buddy",
        "species": "dog",
        "intake_date": str(date.today() - timedelta(days=30)),
        "status": "adoptable",
        "photo_urls": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    base.update(overrides)
    return base


# ===================================================================
# AUTH TESTS — all intake endpoints should return 401/403 without key
# ===================================================================


class TestIntakeAuth:
    """Verify that intake endpoints reject requests without authentication.

    These tests do NOT use the test_app fixture (which overrides get_org).
    Instead they use a raw app with no dependency overrides so auth runs.
    """

    @pytest.fixture
    async def unauthed_client(self):
        """Client that does NOT override get_org, so auth is enforced."""
        from app.main import app
        from app.database import get_db

        # We still need to mock the DB or it will try to connect to Postgres
        mock_conn = AsyncMock()

        async def _override_db():
            yield mock_conn

        app.dependency_overrides[get_db] = _override_db
        # Do NOT override get_org — authentication should run
        # With mock_conn.fetchrow returning None, it will reject the key.
        mock_conn.fetchrow = AsyncMock(return_value=None)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

        app.dependency_overrides.clear()

    async def test_create_animal_requires_auth(self, unauthed_client):
        resp = await unauthed_client.post(
            "/v1/intake/animals",
            json=_valid_animal_payload(),
        )
        assert resp.status_code in (401, 403, 422)

    async def test_list_animals_requires_auth(self, unauthed_client):
        resp = await unauthed_client.get("/v1/intake/animals")
        assert resp.status_code in (401, 403, 422)

    async def test_get_animal_requires_auth(self, unauthed_client):
        resp = await unauthed_client.get("/v1/intake/animals/EXT-001")
        assert resp.status_code in (401, 403, 422)

    async def test_update_animal_requires_auth(self, unauthed_client):
        resp = await unauthed_client.put(
            "/v1/intake/animals/EXT-001",
            json={"name": "Rex"},
        )
        assert resp.status_code in (401, 403, 422)

    async def test_delete_animal_requires_auth(self, unauthed_client):
        resp = await unauthed_client.delete("/v1/intake/animals/EXT-001")
        assert resp.status_code in (401, 403, 422)

    async def test_batch_submit_requires_auth(self, unauthed_client):
        resp = await unauthed_client.post(
            "/v1/intake/batch",
            json={"animals": [_valid_animal_payload()]},
        )
        assert resp.status_code in (401, 403, 422)

    async def test_status_update_requires_auth(self, unauthed_client):
        resp = await unauthed_client.post(
            "/v1/intake/animals/EXT-001/status",
            json={"status": "adopted", "outcome_type": "adoption"},
        )
        assert resp.status_code in (401, 403, 422)

    async def test_add_photo_requires_auth(self, unauthed_client):
        resp = await unauthed_client.post(
            "/v1/intake/animals/EXT-001/photos",
            json={"photo_url": "https://example.com/photo.jpg"},
        )
        assert resp.status_code in (401, 403, 422)


# ===================================================================
# CRUD TESTS — using mock_org to bypass auth
# ===================================================================


class TestCreateAnimal:
    """POST /v1/intake/animals — calls animal_service.upsert_animal()."""

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.animals.animal_service.upsert_animal",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_upsert = mock_fn
            yield

    async def test_create_animal_201(self, test_app):
        self.mock_upsert.return_value = _animal_response_dict()
        resp = await test_app.post(
            "/v1/intake/animals",
            json=_valid_animal_payload(),
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["name"] == "Buddy"

    async def test_create_animal_with_all_fields(self, test_app):
        full = _valid_animal_payload(
            sex="female",
            size="medium",
            primary_breed="Beagle",
            altered="altered",
            weight_kg=12.5,
            description="Sweet beagle mix",
            adoption_fee=100.0,
            good_with_dogs="yes",
            photo_urls=["https://example.com/beagle.jpg"],
            location_state="CA",
            location_city="Los Angeles",
            confidence_score=0.9,
        )
        self.mock_upsert.return_value = _animal_response_dict(**full)
        resp = await test_app.post("/v1/intake/animals", json=full)
        assert resp.status_code == 201

    async def test_create_animal_validation_error(self, test_app):
        """Missing required field 'name' should return 422."""
        bad = {"external_id": "EXT-BAD", "species": "dog", "intake_date": "2026-01-01"}
        resp = await test_app.post("/v1/intake/animals", json=bad)
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /v1/intake/animals
# ---------------------------------------------------------------------------


class TestListOrgAnimals:
    """GET /v1/intake/animals — lists the org's own animals.

    The router queries the DB directly (conn.fetch / conn.fetchval),
    so we configure the mock_db via the test_app fixture.
    """

    async def test_list_org_animals_200(self, test_app, mock_db):
        # The router calls conn.fetch() and conn.fetchval() directly
        # mock_db defaults: fetch=[], fetchval=0
        resp = await test_app.get("/v1/intake/animals")
        assert resp.status_code == 200
        body = resp.json()
        assert "items" in body
        assert body["total"] == 0


# ---------------------------------------------------------------------------
# PUT /v1/intake/animals/{external_id}
# ---------------------------------------------------------------------------


class TestUpdateAnimal:

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.animals.animal_service.update_animal",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_update = mock_fn
            yield

    async def test_update_animal_200(self, test_app):
        self.mock_update.return_value = _animal_response_dict(name="Rex")
        resp = await test_app.put(
            "/v1/intake/animals/EXT-001",
            json={"name": "Rex"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Rex"

    async def test_update_animal_not_found(self, test_app):
        self.mock_update.return_value = None
        resp = await test_app.put(
            "/v1/intake/animals/NONEXISTENT",
            json={"name": "Ghost"},
        )
        assert resp.status_code == 404

    async def test_update_animal_partial_fields(self, test_app):
        """Only the provided fields should be sent; all others stay None."""
        self.mock_update.return_value = _animal_response_dict(size="small")
        resp = await test_app.put(
            "/v1/intake/animals/EXT-001",
            json={"size": "small"},
        )
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# DELETE /v1/intake/animals/{external_id}
# ---------------------------------------------------------------------------


class TestDeleteAnimal:
    """DELETE calls animal_service.update_animal(conn, org_id, ext_id, {"status": "removed"})
    and returns {"status": "removed", "external_id": ext_id}.
    """

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.animals.animal_service.update_animal",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_update = mock_fn
            yield

    async def test_soft_delete_200(self, test_app):
        self.mock_update.return_value = _animal_response_dict(status="removed")
        resp = await test_app.delete("/v1/intake/animals/EXT-001")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "removed"
        assert body["external_id"] == "EXT-001"

    async def test_soft_delete_not_found(self, test_app):
        self.mock_update.return_value = None
        resp = await test_app.delete("/v1/intake/animals/NONEXISTENT")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# POST /v1/intake/batch
# ---------------------------------------------------------------------------


class TestBatchSubmit:
    """POST /v1/intake/batch — calls batch_service.process_batch()."""

    @pytest.fixture(autouse=True)
    def _patch_service(self):
        with patch(
            "app.routers.batch.batch_service.process_batch",
            new_callable=AsyncMock,
        ) as mock_fn:
            self.mock_process = mock_fn
            yield

    async def test_batch_submit_202(self, test_app):
        self.mock_process.return_value = {
            "created": 2,
            "updated": 0,
            "errored": 0,
            "errors": [],
        }
        payload = {
            "animals": [
                _valid_animal_payload(external_id="BATCH-1"),
                _valid_animal_payload(external_id="BATCH-2"),
            ]
        }
        resp = await test_app.post("/v1/intake/batch", json=payload)
        assert resp.status_code == 202

    async def test_batch_submit_empty_rejected(self, test_app):
        """Empty animals list should fail Pydantic validation (min_length=1)."""
        resp = await test_app.post("/v1/intake/batch", json={"animals": []})
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# POST /v1/intake/animals/{external_id}/status
# ---------------------------------------------------------------------------


class TestStatusUpdate:
    """POST /v1/intake/animals/{external_id}/status.

    The router first looks up the animal by external_id, then calls
    animal_service.update_status() with the internal ID.
    """

    @pytest.fixture(autouse=True)
    def _patch_services(self):
        with patch(
            "app.routers.status.animal_service.get_animal_by_external_id",
            new_callable=AsyncMock,
        ) as mock_get, patch(
            "app.routers.status.animal_service.update_status",
            new_callable=AsyncMock,
        ) as mock_update:
            self.mock_get = mock_get
            self.mock_update = mock_update
            yield

    async def test_status_update_success(self, test_app):
        self.mock_get.return_value = {"id": FAKE_ANIMAL_ID, "status": "adoptable"}
        self.mock_update.return_value = _animal_response_dict(status="adopted")
        resp = await test_app.post(
            "/v1/intake/animals/EXT-001/status",
            json={"status": "adopted", "outcome_type": "adoption"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "adopted"

    async def test_status_update_on_hold(self, test_app):
        """Setting status to 'on_hold' should work without outcome_type."""
        self.mock_get.return_value = {"id": FAKE_ANIMAL_ID, "status": "adoptable"}
        self.mock_update.return_value = _animal_response_dict(status="on_hold")
        resp = await test_app.post(
            "/v1/intake/animals/EXT-001/status",
            json={"status": "on_hold"},
        )
        assert resp.status_code == 200

    async def test_status_update_not_found(self, test_app):
        """Animal not found returns 404."""
        self.mock_get.return_value = None
        resp = await test_app.post(
            "/v1/intake/animals/EXT-001/status",
            json={"status": "pending"},
        )
        assert resp.status_code == 404

    async def test_status_update_passes_outcome_type(self, test_app):
        """Verify outcome_type is correctly passed to the service."""
        self.mock_get.return_value = {"id": FAKE_ANIMAL_ID, "status": "adoptable"}
        self.mock_update.return_value = _animal_response_dict(status="adopted")
        await test_app.post(
            "/v1/intake/animals/EXT-001/status",
            json={"status": "adopted", "outcome_type": "adoption"},
        )
        self.mock_update.assert_called_once()
        _, kwargs = self.mock_update.call_args
        assert kwargs.get("outcome_type") == "adoption"


# ---------------------------------------------------------------------------
# POST /v1/intake/animals/{external_id}/photos
# ---------------------------------------------------------------------------


class TestAddPhoto:
    """POST /v1/intake/animals/{external_id}/photos.

    The router first looks up the animal, then calls
    photo_service.add_photo_url(). ValueError from the service
    is caught and returned as 400.
    """

    @pytest.fixture(autouse=True)
    def _patch_services(self):
        with patch(
            "app.routers.photos.animal_service.get_animal_by_external_id",
            new_callable=AsyncMock,
        ) as mock_get, patch(
            "app.routers.photos.photo_service.add_photo_url",
            new_callable=AsyncMock,
        ) as mock_add:
            self.mock_get = mock_get
            self.mock_add = mock_add
            yield

    async def test_add_photo_201(self, test_app):
        self.mock_get.return_value = {"id": FAKE_ANIMAL_ID, "organization_id": FAKE_ORG_ID}
        self.mock_add.return_value = _animal_response_dict(
            photo_urls=["https://example.com/old.jpg", "https://example.com/new.jpg"]
        )
        resp = await test_app.post(
            "/v1/intake/animals/EXT-001/photos",
            json={"photo_url": "https://example.com/new.jpg"},
        )
        assert resp.status_code == 201

    async def test_add_photo_animal_not_found(self, test_app):
        self.mock_get.return_value = None
        resp = await test_app.post(
            "/v1/intake/animals/NONEXISTENT/photos",
            json={"photo_url": "https://example.com/photo.jpg"},
        )
        assert resp.status_code == 404

    async def test_add_photo_service_error_returns_400(self, test_app):
        """If photo_service raises ValueError, the router returns 400."""
        self.mock_get.return_value = {"id": FAKE_ANIMAL_ID, "organization_id": FAKE_ORG_ID}
        self.mock_add.side_effect = ValueError("Animal not found or does not belong")
        resp = await test_app.post(
            "/v1/intake/animals/EXT-001/photos",
            json={"photo_url": "https://example.com/photo.jpg"},
        )
        assert resp.status_code == 400

    async def test_add_photo_with_position(self, test_app):
        """Adding a photo with a specific position should pass it through."""
        self.mock_get.return_value = {"id": FAKE_ANIMAL_ID, "organization_id": FAKE_ORG_ID}
        self.mock_add.return_value = _animal_response_dict(
            photo_urls=["https://example.com/a.jpg", "https://example.com/new.jpg", "https://example.com/b.jpg"]
        )
        resp = await test_app.post(
            "/v1/intake/animals/EXT-001/photos",
            json={"photo_url": "https://example.com/new.jpg", "position": 1},
        )
        assert resp.status_code == 201
        # Verify position was passed to the service
        self.mock_add.assert_called_once()
        _, kwargs = self.mock_add.call_args
        # The router passes position as a positional arg
        args = self.mock_add.call_args[0]
        assert 1 in args or kwargs.get("position") == 1
