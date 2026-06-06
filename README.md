# WaitingTheLongest.com

> Every day a dog waits is a day too long.

**WaitingTheLongest.com** ranks shelter dogs by how long they've been waiting for adoption. The longest-waiting dogs are always shown first — because they deserve to be seen.

## How It Works

Unlike scrapers or aggregators, WaitingTheLongest.com provides a **free Shelter Intake API** that verified shelters, rescues, and foster organizations use to submit their dogs directly. This means:

- **Verified data** from the source — no stale scrapes or legal gray areas
- **Real-time updates** — shelters control their own listings
- **Trust** — every listing traces back to a verified organization
- **Accuracy** — shelters mark dogs adopted instantly, no ghost listings

### The Flow

1. Shelters sign up and get a free API key
2. They submit dogs (single or bulk) with intake dates
3. Dogs are ranked by `days_waiting = today - intake_date`
4. Users browse dogs sorted by longest waiting, filter by location/breed/size/age
5. Users click through to the shelter's adoption page to adopt

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   Next.js Frontend  │────▶│   FastAPI Backend     │
│   (Vercel)          │     │   (Railway/Fly.io)    │
│   Port 3000         │     │   Port 8000           │
└─────────────────────┘     └──────────┬───────────┘
                                       │
                            ┌──────────▼───────────┐
                            │   PostgreSQL + PostGIS│
                            │   (Supabase)          │
                            └──────────────────────┘
```

### Backend (Python)
- **Framework:** FastAPI + asyncpg (raw SQL, no ORM)
- **Database:** PostgreSQL 16 + PostGIS 3.4
- **Auth:** API key authentication (bcrypt hashed, wtl_ prefix)
- **Rate Limiting:** Per-IP public (100/min), per-org intake (tier-based)
- **Validation:** Pydantic v2 with 14 PostgreSQL ENUM mirrors

### Frontend (TypeScript)
- **Framework:** Next.js 14 App Router (SSR + ISR)
- **Styling:** Tailwind CSS with custom WTL design tokens
- **Icons:** lucide-react
- **SEO:** Dynamic metadata, OG tags, semantic HTML

## APIs

### Public Read API (no auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/public/dogs` | Browse dogs with filters, sorting, pagination |
| GET | `/v1/public/dogs/{id}` | Individual dog profile |
| GET | `/v1/public/shelters/{id}` | Shelter profile |
| GET | `/v1/public/stats` | Platform statistics |
| GET | `/v1/public/featured` | Featured dogs (longest waiting + newest) |

### Shelter Intake API (X-API-Key required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/intake/animals` | Create/upsert a single animal |
| GET | `/v1/intake/animals` | List org's own animals |
| PUT | `/v1/intake/animals/{id}` | Update an animal |
| DELETE | `/v1/intake/animals/{id}` | Soft-delete (set status=removed) |
| POST | `/v1/intake/batch` | Batch upsert up to 1000 animals |
| POST | `/v1/intake/animals/{id}/status` | Update adoption status |
| POST | `/v1/intake/animals/{id}/photos` | Add photo URL |

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- Python 3.12+

### Backend
```bash
cd backend

# Start PostgreSQL with PostGIS
docker compose up db -d

# Install Python deps
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run migrations
psql postgresql://wtl:wtlpass@localhost:5432/waitingthelongest < migrations/001_initial.sql
psql postgresql://wtl:wtlpass@localhost:5432/waitingthelongest < migrations/002_seed_data.sql

# Start the API
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3000

### Full Stack (Docker)
```bash
cd backend
docker compose up --build
```

## Project Structure
```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # pydantic-settings configuration
│   │   ├── database.py          # asyncpg pool management
│   │   ├── dependencies.py      # Auth + rate limiting deps
│   │   ├── models/              # Pydantic v2 models (14 enums)
│   │   ├── routers/             # 7 API routers
│   │   ├── services/            # 5 service modules
│   │   └── middleware/          # Rate limiting
│   ├── migrations/
│   │   ├── 001_initial.sql      # Schema (PostGIS, ENUMs, views, RLS)
│   │   └── 002_seed_data.sql    # 8 orgs, 50 dogs seed data
│   ├── tests/                   # pytest test suite
│   ├── Dockerfile
│   ├── docker-compose.yml       # PostGIS + app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # React components
│   │   └── lib/                 # API client + utilities
│   ├── public/                  # Static assets
│   ├── package.json
│   └── tailwind.config.ts       # WTL design tokens
├── docs/                        # Architecture + process docs
├── schemas/                     # OpenAPI specs
└── prompts/                     # AI generation prompts
```

## Design System

| Token | Hex | Usage |
|-------|-----|-------|
| `wtl-coral` | #FF6B6B | Primary CTA, accents |
| `wtl-navy` | #1A1A2E | Headings, body text |
| `wtl-cream` | #FFF8F0 | Page backgrounds |
| `wtl-sage` | #6BCB77 | Success, adopted |
| `wtl-sky` | #4D96FF | Links, info |
| `wtl-gold` | #FFD93D | Badges, highlights |
| `wtl-muted` | #8B8B8B | Secondary text |

## Scope

- **Phase 1:** Dogs only (nationwide US)
- **Future:** Cats, rabbits, other animals

## Database

The schema uses:
- **PostGIS** for real geographic queries (ST_DWithin)
- **14 PostgreSQL ENUMs** for type safety
- **Views** (`dog_listings`, `shelters_public`) for public API reads
- **Triggers** for auto-updating timestamps, geography points, listing counts
- **Row Level Security** with Supabase roles
- **Column-level grants** (EIN, contact info excluded from public)

## Key Links

- **GitHub:** https://github.com/ianmerrill10/WaitingTheLongest2026Build
- **Domain:** waitingthelongest.com

## Status

**Phase:** Initial build (June 2026)

## License

Private. All rights reserved.
