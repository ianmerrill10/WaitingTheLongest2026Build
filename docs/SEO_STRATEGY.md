# WaitingTheLongest.com — SEO Content Strategy

## Mission

Rank for every search a potential dog adopter makes before they find a dog at a shelter. Own the "long-wait" angle no one else has built content around.

---

## Keyword Tiers

### Tier 1 — High Intent, Low Competition (build these first)

These have real search volume and almost no dedicated competition:

| Keyword | Monthly Volume (est.) | Difficulty | Target Page |
|---------|----------------------|------------|-------------|
| dogs waiting the longest in shelters | 200-500 | Low | Homepage |
| longest waiting shelter dogs near me | 300-800 | Low | /dogs (geo-filtered) |
| shelter dogs waiting years to be adopted | 100-300 | Low | Blog: "The Dogs Nobody Picks" |
| adult dogs in shelters nobody wants | 500-1K | Low | /dogs?age=adult |
| black dogs in shelters longest wait | 200-500 | Low | Blog: Black Dog Syndrome |
| senior dogs in shelters too long | 300-700 | Low | /dogs?age=senior |
| overlooked dogs in shelters | 400-900 | Low | Blog: "Most Overlooked Breeds" |
| how long do dogs stay in shelters | 1K-5K | Medium | Blog: Shelter Stay Statistics |

### Tier 2 — Breed-Specific Long Wait Content

Target: `[breed] in shelter waiting` — almost zero competition per breed.

Priority breeds (historically long shelter stays):
- Pit Bull / American Staffordshire Terrier
- Chihuahua mix
- Hound mix
- Black Labrador mix
- German Shepherd mix (adults)
- Boxer mix
- American Bulldog

Template: `/breeds/[breed]` pages with: why this breed waits longer, what adopters should know, dogs currently listed.

### Tier 3 — Location Pages (medium-term)

Once we have enough dogs listed per state:

- `shelter dogs [city] waiting long time`
- `dogs up for adoption [state] longest wait`

Target 50 state pages + top 25 metro areas.

### Tier 4 — Broader Adoption Funnel

Capture people earlier in the funnel:

| Keyword | Monthly Volume | Page |
|---------|---------------|------|
| how to adopt a shelter dog | 10K-30K | Blog guide |
| what to expect adopting adult dog | 5K-15K | Blog guide |
| is it better to adopt older dog | 3K-8K | Blog post |
| adopting a dog with unknown history | 2K-6K | Blog post |
| shelter dog vs rescue dog | 3K-8K | Blog post |
| how long does dog adoption process take | 2K-5K | Blog post |

---

## Technical SEO Checklist

### Must-Have at Launch

- [ ] `sitemap.xml` auto-generated (Next.js sitemap route) — includes every `/dogs/[id]` page
- [ ] `robots.txt` — allow all crawlers, point to sitemap
- [ ] Canonical URLs on all dog pages (no duplicate `/dogs?id=X` vs `/dogs/X`)
- [ ] Open Graph + Twitter card meta tags on every dog page (✅ already built)
- [ ] Structured data (`application/ld+json`) — `Animal` schema type on dog detail pages
- [ ] `next/image` with proper `alt` text on all dog photos (✅ already built)
- [ ] Page speed: Next.js ISR (✅ 60s revalidation), image optimization (✅ Vercel CDN)
- [ ] Mobile-first responsive design (✅ Tailwind)

### Structured Data — Dog Detail Pages

Add to `/dogs/[id]/page.tsx`:

```json
{
  "@context": "https://schema.org",
  "@type": "Animal",
  "name": "[dog.name]",
  "description": "[dog.description]",
  "image": "[dog.primary_photo_url]",
  "breed": "[dog.primary_breed]",
  "contentLocation": {
    "@type": "Place",
    "name": "[dog.shelter_name]",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "[dog.location_city]",
      "addressRegion": "[dog.location_state]"
    }
  }
}
```

### Sitemap Strategy

```typescript
// frontend/src/app/sitemap.ts
// Static routes: /, /dogs, /about, /submit, /terms/submission
// Dynamic: fetch all active dog IDs from API → /dogs/[id] for each
// Frequency: dogs pages = daily, static = weekly
// Priority: dog pages = 0.8, homepage = 1.0
```

---

## Content Calendar — First 90 Days

### Month 1: Foundation

| Week | Content | Target Keyword | Format |
|------|---------|----------------|--------|
| 1 | "Why Some Dogs Wait 3+ Years in Shelters" | dogs waiting years in shelters | Long-form blog (1,500w) |
| 2 | "Black Dog Syndrome: The Bias Nobody Talks About" | black dogs shelter longest wait | Blog + infographic |
| 3 | "Senior Dogs Deserve a Second Chance" | senior dogs in shelters | Blog + featured dog profiles |
| 4 | "Pit Bulls Are the Longest Waiting Shelter Dogs in America" | pit bulls shelter wait time | Blog + data visualization |

### Month 2: Depth

| Week | Content | Target Keyword | Format |
|------|---------|----------------|--------|
| 5 | "How Long Do Dogs Actually Stay in Shelters? (Data)" | how long do dogs stay in shelters | Data-driven post, shareable stats |
| 6 | "The Dogs Nobody Picks: America's Most Overlooked Shelter Dogs" | overlooked dogs in shelters | Feature story |
| 7 | "What It's Like to Adopt a Dog Who's Been Waiting 500+ Days" | adopting long-term shelter dog | Personal stories (sourced) |
| 8 | "Chihuahua Mixes: The Most Surrendered Dog in America" | chihuahua mix shelter | Breed guide |

### Month 3: Authority Building

| Week | Content | Target Keyword | Format |
|------|---------|----------------|--------|
| 9 | "Complete Guide to Adopting an Adult Shelter Dog" | how to adopt adult shelter dog | Ultimate guide (3K+ words) |
| 10 | "The Psychology of Why We Choose Puppies" | why people choose puppies over adult dogs | Research post |
| 11 | "Shelter Dog Statistics: What the Numbers Actually Say" | shelter dog statistics | Data roundup |
| 12 | Annual "State of Long-Wait Shelter Dogs" report | shelter dog wait time statistics | Linkable asset |

---

## Link Building Strategy

### Tier 1 — Easy Wins

- **Local news stories**: Every dog that gets adopted after 500+ days = press release to local TV news. "Dog Waits 847 Days at [Shelter Name] — Finally Adopted!" → gets local news links.
- **Shelter partnerships**: Partner shelters link back from their "Featured on WaitingTheLongest" badge.
- **Reddit**: r/dogs, r/aww, r/rescuedogs — post real wait stories with photos. No spam. Genuine community participation.

### Tier 2 — Medium Effort

- **Podcast outreach**: Dog/rescue/pet adoption podcasts. We have the data angle. "We built a site that ranks dogs by how long they've been waiting — here's what the data shows."
- **Journalist outreach**: Pitch the annual "State of Long-Wait Shelter Dogs" report to AP, USA Today, Buzzfeed Animals.
- **Veterinary blogs**: Guest posts on "What happens to dogs who wait too long" — medical angle.

### Tier 3 — Long Game

- **University partnerships**: Animal behavior departments, veterinary schools. We have real longitudinal shelter wait data. That's publishable.
- **ASPCA, HSUS**: If we have 10K+ listings, we become a legitimate data source.

---

## On-Page SEO for Dog Detail Pages

Each `/dogs/[id]` page should rank for `[dog name] [breed] [city] adopt`. Ensure:

1. **Title tag**: `[Name] — [Breed] Waiting [X] Days — WaitingTheLongest.com`
2. **H1**: Dog name (✅ already)
3. **Meta description**: `Meet [Name], a [age] [breed] who has been waiting [time] at [shelter] in [city, state]. [2-sentence tease from description].`
4. **Alt text on photos**: `[Name] the [breed] waiting for adoption at [shelter name]` (✅ partially — needs shelter name appended)
5. **Internal links**: Each dog page links to: same shelter's other dogs, same breed results, same city results
6. **URL slug**: `/dogs/[uuid]` → ideally migrate to `/dogs/[name-breed-city]` when volume justifies it

---

## Social + Content Amplification

### TikTok Strategy (Primary)

- Format: "This dog has been waiting [X] days. His name is [NAME]." (face cam + dog photo)
- Hook: Always open with the wait counter. The number is the story.
- Frequency: 2-3 videos/week. Each features 1 dog.
- Goal: Each video links to the dog's profile. Profile shows `/dogs/[id]`.
- SEO benefit: TikTok videos rank in Google now. Dual distribution.

### Instagram

- Post the dog's photo with wait counter overlaid (ShareKit already built this)
- Bio link → waitingthelongest.com
- Story highlights: "Found a home!" — celebrate adoptions

### Pinterest

- Dog profiles as pins → `/dogs/[id]` as destination
- Board: "Dogs Who Found Their Forever Home" (after adoption)
- Board: "Waiting for You in [State]" — geo-targeted boards

---

## Metrics to Track (Monthly)

| Metric | Target (Month 3) | Target (Month 6) | Target (Month 12) |
|--------|-----------------|------------------|-------------------|
| Google Search Console impressions | 10K/mo | 50K/mo | 200K/mo |
| Organic clicks | 500/mo | 5K/mo | 30K/mo |
| Pages indexed | 50 | 500 | 5,000+ |
| Average position for Tier 1 keywords | Top 20 | Top 10 | Top 5 |
| Referring domains | 10 | 50 | 200 |
| Email list (from SEO traffic) | 100 | 1K | 10K |

---

## Quick Wins (Do This Week)

1. **Google Search Console**: Verify ownership → submit sitemap → monitor indexing
2. **Google Analytics 4**: Set up conversion event for "Submit a Dog" + "Email Capture"
3. **Bing Webmaster Tools**: Free, takes 5 min, indexes Bing + DuckDuckGo
4. **Add `/sitemap.xml` route** to Next.js app (10 lines of code)
5. **Add `robots.txt`** to `public/` folder
6. **Add JSON-LD Animal schema** to dog detail page template
7. **Write first blog post** — "Why Some Dogs Wait 3+ Years" — publish it, index it

---

*Last updated: 2026-06-16*
*Owner: WaitingTheLongest.com — Ian Merrill*
