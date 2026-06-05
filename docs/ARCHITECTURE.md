# WaitingTheLongest.com — Architecture

## System Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌───────────────┐
│  Shelter Staff   │────▶│  Shelter Intake API   │────▶│   Supabase    │
│  (API clients)   │     │  (authenticated)      │     │  (PostgreSQL) │
└─────────────────┘     └──────────────────────┘     └───────┬───────┘
                                                             │
┌─────────────────┐     ┌──────────────────────┐             │
│  Dog Adopters    │────▶│  Public Read API      │◀───────────┘
│  (website users) │     │  (no auth required)   │
└─────────────────┘     └──────────────────────┘
                              │
                        ┌─────▼─────┐
                        │  Next.js  │
                        │  Frontend │
                        │  (Vercel) │
                        └───────────┘
```

## Two APIs

### Shelter Intake API (Private)
- **Spec:** openapi.yaml (OpenAPI 3.1.0)
- **Auth:** X-API-Key header, per-organization
- **Purpose:** Shelters submit, update, and manage their animal listings
- **Endpoints:** CRUD animals, batch submit, photo upload, org management, status updates

### Public Read API (Public)
- **Auth:** None (rate-limited by IP)
- **Purpose:** Frontend reads dog listings for display
- **Endpoints:** Browse dogs, dog detail, shelter profile, platform stats

## Database (Supabase / PostgreSQL)

### Core Tables
- `organizations` — shelter/rescue accounts, verification tier, rate limits
- `api_keys` — per-org keys, tier, created_at, last_used_at
- `animals` — all submitted animals with SAC-aligned fields
- `animal_photos` — photo metadata, upload_id, URLs, perceptual hash
- `batch_jobs` — async batch processing status and per-record results
- `status_history` — audit trail of status changes per animal

### Key Indexes
- `animals(intake_date ASC)` — core ranking (longest waiting first)
- `animals(species, status)` — filter by species + adoptable
- `animals(organization_id)` — shelter's own listings
- `organizations(ein)` — EIN verification lookup

## Verification Tiers

| Tier | Name | How Earned | Rate Limit | Trust |
|------|------|-----------|------------|-------|
| 0 | Self-Asserted | Apply at /v1/organizations | Low | Listings flagged as unverified |
| 1 | Verified | EIN match (IRS Pub 78), .gov domain, or aggregator confirmed | Medium | Full visibility |
| 2 | Trusted | Track record + manual review | High | Priority support, featured eligible |

## Data Flow

1. Shelter applies → gets Tier 0 key immediately
2. Shelter submits dogs via API (single or batch)
3. Server validates against JSON Schema + SAC vocabularies
4. Server computes `intake_age_days`, `confidence_score`
5. Deduplication checks via perceptual hash (photos) and org+external_id
6. Public Read API serves adoptable dogs sorted by intake_age_days DESC
7. Frontend renders dog cards, detail pages, shelter profiles
8. Shelter updates status to "adopted" → dog removed from active listings, stats recorded

## Hosting

- **Frontend:** Vercel (Next.js)
- **Backend API:** TBD (options: Vercel serverless, Railway, Fly.io, GCP Cloud Run)
- **Database:** Supabase (managed PostgreSQL)
- **Photo Storage:** Supabase Storage or S3-compatible
- **Domain:** waitingthelongest.com
