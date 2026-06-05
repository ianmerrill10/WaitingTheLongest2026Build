# WaitingTheLongest.com

**Find the dogs who have been waiting the longest for a home.**

WaitingTheLongest.com is a platform that surfaces shelter, rescue, ASPCA, and foster dogs across America — ranked by how long they've been waiting for adoption. The longer the wait, the higher the visibility.

## How It Works

Unlike scrapers or aggregators, WaitingTheLongest.com provides a **free Shelter Intake API** that verified shelters, rescues, and foster organizations use to submit their dogs directly. This means:

- **Verified data** from the source — no stale scrapes or legal gray areas
- **Real-time updates** — shelters control their own listings
- **Trust** — every listing traces back to a verified organization
- **Accuracy** — shelters mark dogs adopted instantly, no ghost listings

## Core Concept

1. Shelters sign up and get a free API key
2. They submit dogs (single or bulk) with intake dates
3. Dogs are ranked by `days_waiting = today - intake_date`
4. Users browse dogs sorted by longest waiting, filter by location/breed/size/age
5. Users click through to the shelter's adoption page to adopt

## Scope

- **Phase 1:** Dogs only (nationwide US)
- **Future:** Cats, rabbits, other animals as expansion

## Tech Stack

- **Frontend:** Next.js (React) — generated via Gemini 3.1 Pro
- **Backend API:** Node.js or Python FastAPI — Shelter Intake API + public read API
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (frontend), TBD (backend API)
- **AI:** Gemini 3.1 Pro (frontend generation), DeepSeek V4 Pro (backend/complex logic)

## Project Structure

```
WaitingTheLongest2026Build/
├── README.md              # This file
├── SITEWIKI.md            # Master doc index
├── docs/                  # All project documentation
│   ├── MASTER_PLAN.md     # Vision, strategy, milestones
│   ├── ARCHITECTURE.md    # System design
│   ├── API_SPEC.md        # Shelter Intake API specification
│   └── DATA_MODEL.md      # Database schema
├── prompts/               # AI generation prompts
│   ├── GEMINI_FRONTEND_PROMPT.md
│   └── DEEPSEEK_BACKEND_PROMPT.md
├── frontend/              # Next.js app (Gemini-generated)
├── backend/               # API server
└── scripts/               # Utility scripts
```

## Key Links

- **GitHub:** https://github.com/ianmerrill10/WaitingTheLongest2026Build
- **Domain:** waitingthelongest.com (TBD hosting)

## Status

**Phase:** Initial build (June 2026)
