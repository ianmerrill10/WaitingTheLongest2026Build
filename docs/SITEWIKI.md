# WaitingTheLongest.com — Site Wiki / Doc Index
## Master index of all documentation, pages, and systems

*Last updated: 2026-06-16*

---

## Live Site

| URL | Page | Status |
|-----|------|--------|
| waitingthelongest.com | Homepage (hero, stats, featured dogs) | LIVE (password-gated) |
| waitingthelongest.com/dogs | All dogs — sorted by wait time | LIVE |
| waitingthelongest.com/dogs/[id] | Dog detail + live counter + ShareKit | LIVE |
| waitingthelongest.com/submit | 5-step intake form (shareable) | LIVE |
| waitingthelongest.com/submit/success | Post-submission confirmation + share | LIVE |
| waitingthelongest.com/about | Mission + how it works | LIVE |
| waitingthelongest.com/faq | 20+ questions across 3 sections | LIVE |
| waitingthelongest.com/blog | 6 articles on long-wait dogs | LIVE |
| waitingthelongest.com/blog/[slug] | Individual blog posts | LIVE |
| waitingthelongest.com/wiki | Complete platform documentation | LIVE |
| waitingthelongest.com/terms/submission | Submission legal terms | LIVE |
| waitingthelongest.com/shelters/[id] | Shelter profile page | LIVE |
| waitingthelongest.com/admin/submissions | Admin approval queue | LIVE (auth pending) |
| waitingthelongest.com/password | Password gate (site not yet public) | LIVE |

**Password:** StopAClock2026 (internal preview only)

---

## Documentation

### Operational
| File | Purpose |
|------|---------|
| `docs/DOG_INTAKE_PROCESS.md` | Complete guide for shelters: 3-tier verification, 5-step form, SAC standards, photo tips, prohibited submissions, contacts |
| `docs/TIKTOK_AUTOMATION_PLAN.md` | Full TikTok strategy: video generation pipeline, script templates, Jeff automation module plan, growth milestones |
| `docs/SEO_STRATEGY.md` | Keyword tiers, 90-day content calendar, link building, technical SEO |

### Business
| File | Purpose |
|------|---------|
| `docs/MASTER_PLAN.md` | Vision, strategy, milestones, revenue model |
| `docs/ARCHITECTURE.md` | System design, data flow, tech stack decisions |
| `docs/MONETIZATION_PLAN.md` | 14 revenue streams: affiliates → sponsorships → premium alerts → email list |
| `docs/PATENT_ANALYSIS.md` | No utility patent (Alice fails), no design patent recommended, trademark strategy |
| `docs/SUBMISSION_LEGAL_TERMS.md` | Full legal text: content license, no-sale rule, indemnification, GDPR/CCPA |
| `docs/DATA_SOURCES_STRATEGY.md` | Data acquisition strategy: shelter APIs, scraping, partnerships |
| `docs/SAC_VOCABULARY_MAPPING.md` | Shelter Animals Count standard field mappings |

### Historical (archived)
| File | Notes |
|------|-------|
| `docs/historical/DATA_SOURCES_STRATEGY.md` | April 2026 research on RescueGroups, ShelterLuv, PetPoint |
| `docs/historical/VERIFIED_WAIT_TIME_AUDIT.md` | Verified real wait time data from earlier build |
| `docs/historical/BUSINESS_PLAN_APRIL2026.md` | 5-stream business plan (April 2026) |
| `docs/historical/INVESTMENT_REPORT.md` | 86KB investor-grade report |
| `docs/historical/COMPREHENSIVE_ANALYSIS_JAN2026.md` | Jan 2026 complete tech analysis |

---

## Frontend Structure (`frontend/src/`)

### App Pages
| Path | Description |
|------|-------------|
| `app/page.tsx` | Homepage |
| `app/dogs/page.tsx` | Dog listing with filters, sorting, pagination |
| `app/dogs/[id]/page.tsx` | Dog detail: WaitCounter + ShareKit |
| `app/shelters/[id]/page.tsx` | Shelter profile |
| `app/about/page.tsx` | About / mission |
| `app/faq/page.tsx` | FAQ (20+ questions, accordion) |
| `app/blog/page.tsx` | Blog index (6 articles) |
| `app/blog/[slug]/page.tsx` | Blog article detail |
| `app/blog/_data.ts` | Shared BLOG_POSTS constant |
| `app/wiki/page.tsx` | Platform wiki (11 sections, sticky TOC) |
| `app/submit/page.tsx` | 5-step intake form |
| `app/submit/success/page.tsx` | Post-submission confirmation |
| `app/terms/submission/page.tsx` | Submission legal terms |
| `app/admin/submissions/page.tsx` | Admin submission review queue |
| `app/password/page.tsx` | Password gate UI |

### API Routes
| Route | Handler |
|-------|---------|
| `app/api/submit/route.ts` | Dog submission → Supabase + email |
| `app/api/subscribe/route.ts` | Email list signup |
| `app/api/upload-photo/route.ts` | Photo upload → Supabase Storage |
| `app/api/auth/password/route.ts` | Password gate validation |
| `app/api/admin/submissions/route.ts` | Admin CRUD for submissions |

### Components
| Component | Description |
|-----------|-------------|
| `Header.tsx` | Sticky nav, mobile hamburger, Submit CTA — brutalist Oswald |
| `Footer.tsx` | Dark navy, @waitingthelongest social links, email capture |
| `DogCard.tsx` | Dog card: wait time header dominates, grayscale photo |
| `WaitCounter.tsx` | Live real-time counter (days/hrs/min/sec), brutalist cells |
| `StatsBar.tsx` | 4-stat dashboard strip (total, avg wait, longest, adopted) |
| `FilterBar.tsx` | Breed/size/sex/state/age filters |
| `ShareKit.tsx` | Pre-filled TikTok/IG/FB/Twitter share + copy link |
| `Pagination.tsx` | Page navigation |

### Middleware + Config
| File | Description |
|------|-------------|
| `middleware.ts` | Site-wide password gate (SITE_PASSWORD env var) |
| `tailwind.config.ts` | Brutalist palette + Oswald/Inter fonts |
| `globals.css` | btn-primary, btn-secondary, card, badge, input-field |
| `layout.tsx` | Root layout — Oswald + Inter font injection |

---

## Backend Structure (`backend/`)

### App
| File | Description |
|------|-------------|
| `app/main.py` | FastAPI entrypoint with lifespan, CORS, rate limit middleware |
| `app/config.py` | pydantic-settings (WTL_ env prefix) |
| `app/database.py` | asyncpg pool (create/close/get_db/get_pool) |
| `app/dependencies.py` | API key auth (bcrypt, per-org rate limiting) |
| `app/middleware/rate_limit.py` | Sliding window rate limiter |

### Models
| File | Description |
|------|-------------|
| `app/models/animal.py` | DogCreate, DogResponse, DogListItem, DogDetail |
| `app/models/org.py` | OrgCreate, OrgResponse |
| `app/models/common.py` | PaginationParams, Coords, etc. |

### Services
| File | Description |
|------|-------------|
| `app/services/animal.py` | Dog CRUD, listing queries, wait time calculation |
| `app/services/org.py` | Organization management |
| `app/services/batch.py` | Bulk upload processing |
| `app/services/stats.py` | platform_stats() SQL function wrapper |
| `app/services/photo.py` | Photo management, primary photo logic |

### Routers (API endpoints)
| File | Endpoints |
|------|-----------|
| `app/routers/public.py` | `GET /v1/public/dogs`, `GET /v1/public/dogs/{id}`, `GET /v1/public/stats`, `GET /v1/public/featured` |
| `app/routers/animals.py` | Shelter intake: `POST /v1/animals`, `PUT /v1/animals/{id}`, `DELETE /v1/animals/{id}` |
| `app/routers/organizations.py` | Org registration + management |
| `app/routers/batch.py` | `POST /v1/batch` (up to 1000 dogs) |
| `app/routers/photos.py` | Photo upload, reorder, delete |
| `app/routers/status.py` | `GET /health`, `GET /v1/status` |
| `app/routers/meta.py` | `GET /v1/breeds`, `GET /v1/locations` |

### Migrations
| File | Description |
|------|-------------|
| `migrations/001_initial.sql` | Base schema (PostGIS, 14 ENUMs, views, triggers, RLS) |
| `migrations/002_seed_data.sql` | 8 orgs, 50 dogs, 8 API keys, 5 adoption events |
| `migrations/003_submissions.sql` | dog_submissions + marketing_leads tables (intake portal) |

---

## Design System (as of 2026-06-16)

**Style:** Brutalist — stark, journalistic, emergency response visual language

| Token | Hex | Use |
|-------|-----|-----|
| `wtl-coral` | `#E11D48` | Alarm Red — primary CTAs, wait counter days, urgent badges |
| `wtl-navy` | `#09090B` | Pitch Graphite — headings, borders, dark elements |
| `wtl-cream` | `#FAFAFA` | Stark White — page background |
| `wtl-warm` | `#E5E5E5` | Concrete — secondary borders, dividers |
| `wtl-sage` | `#15803D` | Deep Green — success/adopted states |
| `wtl-sky` | `#2563EB` | Electric Blue — links, info |
| `wtl-gold` | `#FACC15` | Warning Yellow — alert badges, highlights |
| `wtl-muted` | `#737373` | Industrial neutral — secondary text |

**Fonts:** Oswald (display/headings, uppercase) + Inter (body) via `next/font/google`

---

## Kanban Board

Board: `wtl_build` at jeff.firstcallma.com/kanban

| ID | Title | Status |
|----|-------|--------|
| 220 | API spec designed | done |
| 221 | Backend written | done |
| 222 | Frontend built | done |
| 223 | Historical docs consolidated | done |
| 224 | Intake portal complete | done |
| 225 | NextAuth admin login | todo |
| 226 | Email alerts (Resend API key needed) | todo |
| 227 | SEO strategy doc | done |
| 228 | Privacy policy page | done |
| 229 | Premium alerts ($4.99/mo) | todo |
| 230 | Sponsored shelter profiles | todo |
| 231 | SEO strategy | done |
| 232 | TikTok rescue outreach | todo |
| 233 | Password protection deployed | done |
| 241 | Gemini design system | done |
| 242 | FAQ page | done |
| 243 | Blog (6 articles) | done |
| 244 | Social links (@waitingthelongest) | done |
| 245 | Dog intake process doc | done |
| 246 | TikTok automation plan | done |
| 247 | Site wiki | done |
| 248 | New design system (brutalist) | done |
| 249 | Google Fonts (Oswald + Inter) | done |

---

## Social Accounts

| Platform | Handle | Status |
|----------|--------|--------|
| TikTok | @waitingthelongest | Needs account creation |
| Instagram | @waitingthelongest | Needs account creation |
| Facebook | @waitingthelongest | Needs account creation |

---

## Contact Emails

| Purpose | Email |
|---------|-------|
| Shelters / partnerships | shelters@waitingthelongest.com |
| Listing updates / adoptions | shelters@waitingthelongest.com |
| Report abuse | abuse@waitingthelongest.com |
| Privacy | privacy@waitingthelongest.com |
| General | hello@waitingthelongest.com |
