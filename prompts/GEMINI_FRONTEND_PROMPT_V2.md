# Gemini 3.1 Pro — Frontend V2 Prompt (Next.js Conversion)

Copy everything below the line into Gemini 3.1 Pro. This converts the existing Vite/React prototype into a proper Next.js 14 application with SEO.

---

You previously built a React frontend for **WaitingTheLongest.com** using Vite + React Router. It looks great visually, but it needs to be a **Next.js 14 App Router** application for SEO and server rendering. Convert it now.

## IMPORTANT: Output in 2 chunks

Your output will be long. Split it into **2 responses** so nothing gets truncated:

**This response (Chunk 1):** Generate these files ONLY:
- `package.json`
- `next.config.ts`
- `tailwind.config.ts` (MUST define custom colors: coral, teal, amber)
- `tsconfig.json`
- `app/layout.tsx` (root layout with Inter font, global metadata, Navbar/Footer)
- `app/page.tsx` (landing page — Server Component)
- `app/dogs/page.tsx` (browse dogs — Client Component for filters)
- `app/dogs/[id]/page.tsx` (dog detail — Server Component with generateMetadata)
- `lib/types.ts`
- `lib/api.ts`

Tell me when you're ready for Chunk 2 and I'll ask for the remaining files.

## What to convert

### Architecture changes:
- **Vite → Next.js 14** with App Router (`app/` directory, NOT `pages/`)
- **React Router → Next.js routing** (file-based routes, Link from `next/link`)
- **Server Components by default** — only use `"use client"` for interactive parts (filters, state)
- **next/image** instead of raw `<img>` tags for optimized images
- Keep ALL the visual design, Tailwind classes, and component patterns from the Vite version

### Tailwind config MUST define these custom colors:
```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FEF2F0',
          100: '#FDE5E1',
          200: '#FBCBC3',
          300: '#F9A89A',
          400: '#F08271',
          500: '#E8614D',
          600: '#D44A36',
          700: '#B33D2C',
          800: '#8F3123',
          900: '#6B2419',
        },
        teal: {
          // keep Tailwind defaults or customize to match #2A9D8F
        },
      },
    },
  },
}
```

### SEO additions (CRITICAL — this is why we're converting):
- `generateMetadata()` on every page
- Open Graph images for dog detail pages (dog photo + "X has been waiting Y days")
- JSON-LD structured data on dog detail pages
- Dynamic page titles: `"[Dog Name] — Waiting [X] Days | WaitingTheLongest.com"`
- Root metadata in `app/layout.tsx`

### Missing features to add:
1. **20 mock dogs** (you only made 12 — add 8 more with variety)
2. **All filters:** ZIP code input, breed searchable dropdown, sex radio, "good with" toggles, altered toggle
3. **Mobile hamburger menu** (you left a placeholder comment — implement it)
4. **Load More pagination** button at bottom of dog grid
5. **Share functionality** on dog detail page (copy link, open Twitter/X share)

### KEEP these from V1 (they're good):
- The DogCard component design (coral badge, photo, breed, location)
- The hero section layout and copy
- The "How it Works" 3-step section
- The dog detail page layout (big photo, stats card, sidebar)
- The shelter profile page
- The About and For Shelters pages
- Light mode everywhere, no dark themes
- lucide-react icons

## Type definitions (unchanged — copy exactly)

```typescript
// lib/types.ts — KEEP IDENTICAL to V1
interface Dog {
  id: string
  external_id: string
  name: string
  species: "dog"
  intake_date: string
  intake_age_days: number
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
```

## HARD RULES
- **LIGHT MODE ONLY.** White backgrounds. Light grays. Dark text. No dark mode. No dark themes. EVER.
- **No clip art.** Photos only. Clean silhouette placeholder if no photo.
- **"Days waiting" badge is THE most important visual element.** Make it impossible to miss.
- Generate COMPLETE files. No "// TODO", no "// similar to above", no placeholders.
- Every component must render something meaningful.
