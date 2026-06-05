# Gemini 3.1 Pro — Frontend Generation Prompt

Copy everything below the line into Gemini 3.1 Pro (AI Studio or chat). This generates the complete Next.js frontend for WaitingTheLongest.com.

---

You are building the complete frontend for **WaitingTheLongest.com** — a platform that surfaces shelter dogs ranked by how long they've been waiting for adoption. The longer a dog has been waiting, the more prominent it appears.

## Tech Stack (MANDATORY)

- **Next.js 14+** with App Router (NOT Pages Router)
- **TypeScript** (strict mode)
- **Tailwind CSS** for all styling
- **React 19** patterns (Server Components by default, "use client" only when needed)
- No component library — custom Tailwind components only

## Design System (MANDATORY)

- **LIGHT MODE ONLY.** White/light gray backgrounds, dark text. NO dark mode. NO dark themes. NO dark backgrounds anywhere. This is non-negotiable.
- **Primary color:** Warm coral/salmon (#E8614D or similar) — evokes warmth, compassion, urgency
- **Secondary color:** Soft teal (#2A9D8F) — trust, calm, nature
- **Accent:** Amber/gold (#E9C46A) — hope, attention
- **Typography:** Clean sans-serif (Inter or system font stack)
- **Emotional but not cheesy.** The design should feel like a premium editorial site (think The Dodo meets Airbnb), not a 1990s pet rescue site. Clean, modern, spacious, emotional through photography not clip art.
- **Mobile-first responsive design.** Must look great on phones.

## Pages to Build

### 1. Landing Page (`/`)

Hero section:
- Large emotional headline: something like "Meet the dogs who've been waiting the longest."
- Subtitle explaining the concept: shelters submit their dogs, ranked by days waiting
- A live counter showing total dogs on the platform and average wait time
- CTA button: "Find a Dog" → scrolls to or links to /dogs
- Below hero: 3-5 "Longest Waiting Right Now" featured dog cards with large photos, name, days waiting badge, breed, location

How it works section (3 steps):
1. "Shelters submit their dogs through our free API"
2. "We rank every dog by how long they've been waiting"
3. "You find and adopt the dog who needs you most"

Stats bar: Total dogs | Total shelters | Adoptions this month | Avg wait time

Footer with links.

### 2. Browse Dogs Page (`/dogs`)

This is the core page. Shows a grid of dog cards sorted by days waiting (longest first).

**Filter sidebar/top bar:**
- Location: ZIP code + radius slider (10/25/50/100/250 miles)
- Breed: searchable dropdown
- Size: small / medium / large / xlarge (checkboxes)
- Age: puppy (< 5 months) / adult (checkboxes)
- Sex: male / female
- Good with: dogs / cats / kids (toggle filters)
- Special needs: yes/no toggle
- Altered (spayed/neutered): yes/no

**Dog cards in grid:**
- Large photo (or placeholder silhouette if no photo)
- Prominent "X DAYS" badge (coral background, white text, large font) — this is THE differentiator
- Dog name (bold)
- Breed
- Age / Size / Sex icons
- Location (city, state)
- Shelter name
- "Meet [Name]" button → links to /dogs/[id]

**Pagination:** Cursor-based (Load More button or infinite scroll)

**Sort options:** Longest Waiting (default) | Newest | Nearest to me

### 3. Dog Detail Page (`/dogs/[id]`)

Full-width photo gallery (carousel if multiple photos).

Main info panel:
- Dog name (large heading)
- **"Waiting X days"** — very prominent, emotional. If over 365 days show "over 1 year" too
- Breed, age, size, sex, coat, color, weight
- Spayed/neutered status
- Good with dogs/cats/kids badges (green check / red x / gray unknown)
- Special needs flag if applicable
- Adoption fee (if provided)

Description section — the shelter's description of the dog.

Shelter info card:
- Shelter name, type (municipal, humane society, rescue, etc.)
- Location (city, state)
- Verification badge (Tier 0 = unverified, Tier 1 = verified checkmark, Tier 2 = trusted gold badge)
- "Visit Shelter Page" button → links to listing_url or shelter profile
- Contact info if available

"How to Adopt" CTA section:
- If listing_url exists: "Apply to Adopt [Name]" button linking to the shelter's adoption page
- If no listing_url: "Contact [Shelter Name]" with shelter info

Share buttons: copy link, Twitter/X, Facebook

### 4. Shelter Profile Page (`/shelters/[id]`)

Shelter header:
- Name, type, verification badge
- Location
- Website link
- Stats: X dogs listed, avg wait time for their dogs, X adoptions

Grid of their currently adoptable dogs (same card format as /dogs).

### 5. About Page (`/about`)

- Mission statement: why longest-waiting dogs deserve the most visibility
- How the platform works (API-first approach)
- For shelters: "Submit your dogs — it's free" with link to shelter signup/API docs
- Stats and impact

### 6. For Shelters Page (`/shelters/join`)

- Explain the free Shelter Intake API
- Benefits: visibility for their hardest-to-place dogs, analytics, verification badges
- "Apply Now" CTA (links to the org application process)
- API documentation preview
- Testimonials (placeholder for now)

## Data Fetching

The frontend fetches from the Public Read API. For now, create the fetch functions with these signatures and use placeholder/mock data so the UI renders. The backend team will implement the real API.

```typescript
// lib/api.ts

// Browse dogs — sorted by days_waiting desc by default
async function getDogs(filters: DogFilters): Promise<DogListResponse>

// Single dog detail
async function getDog(id: string): Promise<Dog>

// Shelter profile
async function getShelter(id: string): Promise<Shelter>

// Platform stats
async function getStats(): Promise<PlatformStats>

// Featured dogs (longest waiting)
async function getFeatured(): Promise<Dog[]>
```

Use these TypeScript types based on the API schema:

```typescript
interface Dog {
  id: string
  external_id: string
  name: string
  species: "dog"
  intake_date: string // ISO date
  intake_age_days: number // server-computed, THE ranking metric
  sex: "male" | "female" | "unknown"
  altered: "altered" | "intact" | "unknown"
  size: "small" | "medium" | "large" | "xlarge"
  primary_breed: string | null
  secondary_breed: string | null
  is_mixed: boolean
  primary_color: string | null
  coat_length: string | null
  age_months: number | null
  weight_kg: number | null
  description: string | null
  adoption_fee: number | null
  special_needs: boolean
  good_with_dogs: "yes" | "no" | "unknown"
  good_with_cats: "yes" | "no" | "unknown"
  good_with_kids: "yes" | "no" | "unknown"
  photo_urls: string[]
  listing_url: string | null
  status: "adoptable" | "pending"
  location: { city: string | null; state: string | null; postal_code: string | null }
  organization: { id: string; legal_name: string; org_type: string; verification_tier: string }
  confidence_score: number
}

interface DogFilters {
  postal_code?: string
  radius_miles?: number
  breed?: string
  size?: string[]
  age_group?: "puppy" | "adult"
  sex?: string
  good_with_dogs?: boolean
  good_with_cats?: boolean
  good_with_kids?: boolean
  special_needs?: boolean
  sort?: "days_waiting" | "newest" | "nearest"
  cursor?: string
  limit?: number
}

interface DogListResponse {
  items: Dog[]
  next_cursor: string | null
  total_count: number
}

interface Shelter {
  id: string
  legal_name: string
  org_type: string
  verification_tier: "tier_0_self_asserted" | "tier_1_verified" | "tier_2_trusted"
  location: { city: string | null; state: string | null; postal_code: string | null }
  website: string | null
  active_listings: number
  dogs: Dog[]
}

interface PlatformStats {
  total_dogs: number
  total_shelters: number
  adoptions_this_month: number
  avg_wait_days: number
  longest_wait_days: number
}
```

## Seed Data for Development

Create a `lib/seed-data.ts` file with 20 realistic mock dogs for development. Include variety:
- Dogs waiting 30 days to 900+ days
- Mix of breeds (Lab, Pit Bull, German Shepherd, Chihuahua, Beagle, mixed breeds)
- Mix of sizes, ages, sexes
- Various US locations (spread across states)
- Some with photos (use Unsplash dog URLs), some without
- Some with special needs
- Various good_with combinations
- Different shelters at different verification tiers

## SEO

- Proper meta tags on every page
- Open Graph tags for social sharing (dog photo + "X has been waiting Y days")
- Structured data (JSON-LD) for dog listings
- Dynamic sitemap for all dog detail pages
- Page titles: "[Dog Name] — Waiting [X] Days | WaitingTheLongest.com"

## Important Constraints

- **LIGHT MODE ONLY.** I cannot stress this enough. White backgrounds. Light grays. Dark text. No dark mode toggle. No dark theme. EVER.
- **No clip art or cartoon dogs.** Photos only. If no photo, use a clean silhouette placeholder.
- **The "days waiting" number is THE most important visual element** on every card and detail page. Make it impossible to miss.
- **Emotional but professional.** This is not a sad-puppy guilt trip site. It's a beautiful, modern platform that happens to show you who needs you most.
- **Performance:** Images lazy-loaded, minimal JS, fast LCP.
- **Accessibility:** Semantic HTML, proper ARIA labels, keyboard navigation, color contrast compliance.

## Output Format

Generate a complete Next.js 14 project with:
- `package.json` with all dependencies
- `next.config.ts`
- `tailwind.config.ts`
- `tsconfig.json`
- `app/layout.tsx` (root layout with fonts, metadata)
- `app/page.tsx` (landing page)
- `app/dogs/page.tsx` (browse page)
- `app/dogs/[id]/page.tsx` (detail page)
- `app/shelters/[id]/page.tsx` (shelter profile)
- `app/about/page.tsx`
- `app/shelters/join/page.tsx`
- `components/` directory with all reusable components
- `lib/api.ts` (API client functions)
- `lib/types.ts` (TypeScript interfaces)
- `lib/seed-data.ts` (20 mock dogs)
- `public/` directory notes for any static assets

Generate ALL files with complete, working code. Do not use placeholder comments like "// TODO" or "// implement later". Every component should render something meaningful.
