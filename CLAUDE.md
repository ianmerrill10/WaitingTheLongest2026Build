# CLAUDE.md — WaitingTheLongest2026Build

## Project Identity
- **Platform:** WaitingTheLongest.com — shelter dogs ranked by longest wait time
- **Repo:** github.com/ianmerrill10/WaitingTheLongest2026Build
- **Local path:** C:\Users\ianme\OneDrive\Desktop\WaitingTheLongest2026Build

## HARD RULES — Enforced After EVERY Change

### Rule 1: Push to GitHub After Every Change
```
cd C:\Users\ianme\OneDrive\Desktop\WaitingTheLongest2026Build
git add -A
git commit -m "feat|fix|docs: description"
git push origin main
```
NO EXCEPTIONS. A change that isn't pushed didn't happen.

### Rule 2: Update wtl_build Kanban After Every Change
Use Jeff dashboard API to update the board:
```
POST https://jeff.firstcallma.com/api/finance/kanban/wtl_build/task
Authorization: Bearer 97adbf84e928c619372d25bbeaa365363cd3f93854e03b85
Content-Type: application/json

{"title": "task name", "column_id": "done", "priority": "high"}
```
Move completed tasks: `PATCH /api/finance/kanban/wtl_build/task/{id}/move`

## Architecture
- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS (`frontend/`)
- **Backend:** FastAPI + asyncpg (`backend/`)
- **Database:** PostgreSQL 16 + PostGIS (Supabase)
- **Hosting:** Vercel (frontend) + Railway/Fly.io (backend)

## Key File Map
```
frontend/
  src/
    app/
      page.tsx                    — Homepage
      dogs/page.tsx               — Dog listing
      dogs/[id]/page.tsx          — Dog detail (WaitCounter + ShareKit)
      submit/page.tsx             — 5-step intake form (SHAREABLE LINK)
      submit/success/page.tsx     — Post-submission confirmation
      terms/submission/page.tsx   — Full legal terms
      api/submit/route.ts         — POST handler → Supabase + email
    components/
      Header.tsx                  — Nav (has Submit a Dog CTA)
      Footer.tsx                  — Legal links
      WaitCounter.tsx             — Live real-time wait counter (updates every 1s)
      ShareKit.tsx                — TikTok/IG/FB/Twitter/X share buttons
      DogCard.tsx                 — Card component
      FilterBar.tsx               — Search/filter controls
      StatsBar.tsx                — Platform stats header bar
      Pagination.tsx              — Pagination
    lib/
      api.ts                      — API client (getDog, getDogs, getStats etc.)
      utils.ts                    — Formatters and helpers
backend/
  app/                            — FastAPI application
  migrations/
    001_initial.sql               — Base schema (PostGIS, ENUMs, views, triggers, RLS)
    002_seed_data.sql             — 8 orgs, 50 dogs, 8 API keys, 5 adoptions
    003_submissions.sql           — dog_submissions + marketing_leads tables
docs/
  MASTER_PLAN.md                  — Vision, milestones, revenue
  ARCHITECTURE.md                 — System design
  PATENT_ANALYSIS.md              — No filing recommended
  MONETIZATION_PLAN.md            — 14 revenue streams
  SUBMISSION_LEGAL_TERMS.md       — Full legal text for form T&C
```

## Env Vars Required (Vercel + Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=         # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # From Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=        # From Supabase project settings (secret)
RESEND_API_KEY=                   # Optional — for email notifications
ADMIN_NOTIFY_EMAIL=               # Optional — where to send new submission alerts
```

## Deployment Path (to get shareable link)
1. Push to GitHub: `git push origin main`
2. Ian imports repo to Vercel (select `frontend/` as root directory)
3. Set env vars in Vercel dashboard
4. Vercel auto-deploys → `https://waitingthelongest.vercel.app/submit`
5. Run `backend/migrations/003_submissions.sql` against Ian's Supabase project

## Absolute Bans
- **LIGHT MODE ONLY** — never add dark themes, ever
- **Dogs only** in Phase 1
- **No scraping** — all data via Shelter Intake API
- **Owner (Ian) is INVISIBLE** — no name, face, voice on site
- **NO MOCK DATA in production** — zeros or "N/A" only
- **NEVER reference the banned third-party pet service** (see Jeff2/CLAUDE.md ABSOLUTE BANS section)

## Dev Commands
```bash
cd frontend
npm install          # install deps (run after pulling new commits)
npm run dev          # local dev server at localhost:3000
npm run build        # production build check
npm run lint         # TypeScript + ESLint check
```
