# DeepSeek V4 Pro — Backend Generation Prompt

Use this prompt at **chat.deepseek.com** in **Expert Mode** (uses V4 Pro for full reasoning power). It's completely free in the browser. No API key needed. Just paste everything below the line.

---

You are building the complete backend API server for **WaitingTheLongest.com** — a platform that surfaces shelter dogs ranked by how long they've been waiting for adoption.

The backend has TWO responsibilities:
1. **Shelter Intake API** — authenticated API where shelters submit their dogs (spec provided below)
2. **Public Read API** — unauthenticated API where the frontend reads dog listings

## Tech Stack

- **Python 3.12 + FastAPI** (async)
- **Supabase** (PostgreSQL) via `supabase-py` or raw `asyncpg`
- **Pydantic v2** for request/response validation
- **uvicorn** as ASGI server
- Well-commented code, type hints everywhere

## What to Build

### 1. Database Schema (Supabase SQL migrations)

Generate complete SQL migration files for these tables:

**organizations**
- id (UUID, PK, default gen_random_uuid())
- legal_name (text, NOT NULL)
- ein (text, nullable, unique) — US Employer ID for verification
- website (text, nullable)
- contact_email (text, NOT NULL)
- contact_phone (text, nullable)
- org_type (text, NOT NULL) — enum: municipal, humane_society, spca, rescue, foster_network, sanctuary, other
- postal_code (text, nullable)
- state (char(2), nullable)
- country (char(2), NOT NULL, default 'US')
- verification_tier (text, NOT NULL, default 'tier_0_self_asserted') — tier_0_self_asserted, tier_1_verified, tier_2_trusted
- verification_method (text, nullable) — ein_pub78, gov_domain, aggregator_confirmed, manual_review
- rate_limit_per_hour (integer, NOT NULL, default 60)
- active_listings (integer, NOT NULL, default 0)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

**api_keys**
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- key_hash (text, NOT NULL) — bcrypt hash of the actual key
- key_prefix (text, NOT NULL) — first 8 chars for identification
- tier (text, NOT NULL) — mirrors org verification_tier
- is_active (boolean, default true)
- last_used_at (timestamptz, nullable)
- created_at (timestamptz, default now())

**animals**
- id (UUID, PK, default gen_random_uuid())
- organization_id (UUID, FK → organizations, NOT NULL)
- external_id (text, NOT NULL) — org's own stable ID
- name (text, NOT NULL)
- species (text, NOT NULL) — enum: dog, cat, rabbit, equine, small_mammal, bird, reptile_amphibian, farm_animal, other
- species_detail (text, nullable) — required when species='other'
- intake_date (date, NOT NULL) — THE core field, drives ranking
- intake_type (text, nullable) — SAC IOD intake categories
- sex (text, nullable) — male, female, unknown
- altered (text, nullable) — altered, intact, unknown
- size (text, nullable) — small, medium, large, xlarge
- primary_breed (text, nullable)
- secondary_breed (text, nullable)
- is_mixed (boolean, nullable)
- primary_color (text, nullable)
- coat_length (text, nullable)
- estimated_birthdate (date, nullable)
- age_months (integer, nullable)
- sac_age_group (text, nullable) — under_5_months, adult, unknown
- weight_kg (numeric, nullable)
- description (text, nullable, max 5000 chars)
- adoption_fee (numeric, nullable)
- adoption_fee_currency (char(3), default 'USD')
- special_needs (boolean, default false)
- good_with_dogs (text, nullable) — yes, no, unknown
- good_with_cats (text, nullable)
- good_with_kids (text, nullable)
- photo_urls (jsonb, default '[]')
- listing_url (text, nullable)
- status (text, NOT NULL, default 'adoptable') — adoptable, pending, adopted, on_hold, not_available, removed
- location_postal_code (text, nullable)
- location_city (text, nullable)
- location_state (char(2), nullable)
- location_country (char(2), default 'US')
- intake_age_days (integer, generated always as (current_date - intake_date)) — THE ranking metric
- confidence_score (numeric, default 0.5)
- source (text, default 'intake_api')
- submitter_verification_tier (text)
- is_canonical (boolean, default true)
- canonical_id (UUID, nullable)
- first_listed_at (timestamptz, default now())
- last_seen_at (timestamptz, default now())
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())
- UNIQUE(organization_id, external_id) — idempotent upsert key

**status_history**
- id (UUID, PK)
- animal_id (UUID, FK → animals)
- old_status (text)
- new_status (text, NOT NULL)
- outcome_type (text, nullable) — adoption, return_to_owner, transfer_out_in_state, etc.
- effective_at (timestamptz, default now())
- created_at (timestamptz, default now())

**batch_jobs**
- id (UUID, PK)
- organization_id (UUID, FK → organizations)
- status (text, NOT NULL) — accepted, processing, completed, failed
- received (integer, default 0)
- succeeded (integer, default 0)
- failed (integer, default 0)
- results (jsonb, nullable) — per-record outcomes
- created_at (timestamptz, default now())
- completed_at (timestamptz, nullable)

**Indexes:**
- animals(intake_date ASC) WHERE status = 'adoptable' AND species = 'dog' — core ranking query
- animals(organization_id, external_id) UNIQUE — upsert key
- animals(species, status) — filter queries
- animals(location_state, status) — geo filter
- organizations(ein) WHERE ein IS NOT NULL — EIN lookup
- api_keys(key_prefix) — fast key lookup

**RLS:** Enable Row Level Security. Public SELECT on animals/organizations. All writes server-side only via service role key.

### 2. Shelter Intake API (Authenticated)

Implement these endpoints from the OpenAPI spec:

```
POST   /v1/animals                    — Submit/upsert one animal
GET    /v1/animals                    — List org's own animals (cursor paginated)
GET    /v1/animals/{external_id}      — Read back one animal
PATCH  /v1/animals/{external_id}      — Partial update (merge-patch)
DELETE /v1/animals/{external_id}      — Soft delete (withdraw listing)
POST   /v1/animals/{external_id}/status — Update status / record outcome
POST   /v1/animals/batch              — Bulk submit (up to 1000, async)
GET    /v1/batch/{job_id}             — Check batch job status
POST   /v1/uploads/photos             — Get presigned photo upload URL
POST   /v1/organizations              — Apply for org account (public, no auth)
GET    /v1/organizations/me           — Inspect authenticated org
GET    /v1/healthz                    — Liveness probe
GET    /v1/version                    — Spec + server version
```

**Auth middleware:**
- Extract X-API-Key header
- Hash and compare against api_keys table (lookup by key_prefix first, then bcrypt verify)
- Attach org context to request
- Rate limit per org tier (Tier 0: 60/hr, Tier 1: 600/hr, Tier 2: 6000/hr)

**Validation:**
- intake_date: reject future dates and dates before 1990-01-01
- All enum fields: validate against the SAC-aligned controlled vocabularies
- If species="other", require species_detail
- If estimated_birthdate AND age_months both provided, flag if they disagree by more than 60 days
- Return RFC 9457 problem+json with field-level errors array

**Idempotency:**
- Upsert keyed on (organization_id, external_id)
- Support Idempotency-Key header for network retry safety

### 3. Public Read API (No Auth)

These endpoints power the frontend:

```
GET /v1/public/dogs                  — Browse adoptable dogs
GET /v1/public/dogs/{id}             — Dog detail
GET /v1/public/shelters/{id}         — Shelter profile + their dogs
GET /v1/public/stats                 — Platform statistics
GET /v1/public/featured              — Longest-waiting dogs (top 10)
```

**GET /v1/public/dogs query params:**
- `sort` — days_waiting (default), newest, nearest
- `postal_code` + `radius_miles` — geo filter (requires PostGIS or geocoding)
- `breed` — partial match on primary_breed
- `size` — comma-separated: small,medium,large,xlarge
- `age_group` — puppy (age_months < 5 or sac_age_group='under_5_months'), adult
- `sex` — male, female
- `good_with_dogs`, `good_with_cats`, `good_with_kids` — filter for "yes" only
- `special_needs` — boolean
- `state` — 2-letter state code
- `cursor` — cursor pagination
- `limit` — 1-50, default 20

**Response:** Include the dog's organization info (legal_name, org_type, verification_tier) nested in each dog record so the frontend doesn't need a second call.

**Rate limiting:** 100 requests/minute per IP for public endpoints.

### 4. Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              — FastAPI app, CORS, lifespan
│   ├── config.py            — Settings via pydantic-settings
│   ├── database.py          — Supabase/asyncpg connection
│   ├── dependencies.py      — Auth, rate limiting, org context
│   ├── models/
│   │   ├── animal.py        — Pydantic models for animals
│   │   ├── organization.py  — Pydantic models for orgs
│   │   ├── batch.py         — Batch job models
│   │   └── common.py        — Shared types (Problem, FieldError, etc.)
│   ├── routers/
│   │   ├── animals.py       — Shelter Intake API animal routes
│   │   ├── status.py        — Status update routes
│   │   ├── batch.py         — Batch submit routes
│   │   ├── photos.py        — Photo upload routes
│   │   ├── organizations.py — Org registration/profile routes
│   │   ├── public.py        — Public Read API routes
│   │   └── meta.py          — Health + version
│   ├── services/
│   │   ├── animal_service.py    — Business logic for animals
│   │   ├── org_service.py       — Org logic + verification
│   │   ├── batch_service.py     — Async batch processing
│   │   ├── photo_service.py     — Presigned URL generation
│   │   └── stats_service.py     — Platform stats computation
│   └── middleware/
│       ├── auth.py          — API key validation
│       └── rate_limit.py    — Per-org and per-IP rate limiting
├── migrations/
│   └── 001_initial.sql      — Complete schema
├── tests/
│   ├── test_animals.py
│   ├── test_public.py
│   ├── test_organizations.py
│   └── test_batch.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml       — Local dev with Supabase
└── README.md
```

### 5. Environment Variables

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
DATABASE_URL=               # Direct PostgreSQL connection string
API_VERSION=0.1.0
CORS_ORIGINS=https://waitingthelongest.com,http://localhost:3000
PHOTO_STORAGE_BUCKET=animal-photos
```

## Important Rules

- **Dogs only for Phase 1** — filter by species='dog' in all public endpoints. The schema supports all species for future expansion.
- **intake_age_days is THE metric** — this drives everything. Sort by it. Feature it. Compute it accurately.
- **No mock data in production code** — seed scripts are separate.
- **Confidence score computation:** Based on: how many optional fields are filled (more = higher), submitter tier (Tier 2 > 1 > 0), has photos (bonus), description length (bonus). Scale 0.0-1.0.
- **Status transitions:** Track in status_history table. When status becomes 'adopted' or 'removed', require outcome_type.
- **Soft deletes only** — never hard-delete an animal record. Mark as removed, retain for statistics.

## Output

Generate ALL files with complete, working Python code. Include:
- Full SQL migration
- All FastAPI routes with proper error handling
- Pydantic models matching the OpenAPI spec exactly
- Auth middleware with API key verification
- Rate limiting
- Tests using pytest + httpx
- Dockerfile + docker-compose.yml
- requirements.txt with pinned versions
- README with setup instructions

Do not use placeholder comments. Every function should have a complete implementation.
