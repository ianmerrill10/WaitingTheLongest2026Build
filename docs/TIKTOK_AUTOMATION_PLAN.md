# WaitingTheLongest.com — TikTok Automation Plan
## @waitingthelongest | Autonomous Dog Advocacy Pipeline

---

## Overview

TikTok is the primary acquisition channel for WaitingTheLongest.com. Shelter dogs go viral on TikTok daily. Our edge: **we have the wait counter data** that creates emotionally irresistible content. This document covers the complete autonomous TikTok strategy — from what to post, when to post, how to generate it, and how to automate it with Jeff.

**Target:** 100K followers in 90 days via consistent, emotion-led content.

---

## Why TikTok Works for This

1. **The wait counter is made for TikTok.** "847 days, 3 hours, 22 minutes, 15 seconds" as a text overlay on a dog video is a proven emotional trigger. People stop. They share. They adopt.
2. **Animal rescue content outperforms.** TikTok's algorithm aggressively surfaces content that generates saves and shares — rescue content gets both.
3. **Zero production cost.** Shelters provide photos and video. We provide the counter, the caption, and the distribution.
4. **Virality flywheel.** A viral dog post links back to waitingthelongest.com → new visitors see other dogs → share those → more virality. Every viral video is a funnel.

---

## Content Categories

| Category | Format | Frequency | Viral Potential |
|----------|--------|-----------|-----------------|
| **Long-wait spotlight** | Slow zoom on photo, counter ticking, voice-over | Daily | Very High |
| **Success story** | Before/after: shelter → home photo | 2x/week | Extremely High |
| **Myth bust** | "3 lies about [breed]" text hook | Weekly | High |
| **Day X in shelter** | Raw video from shelter, raw counter | Daily | Very High |
| **Breed deep dive** | Why [breed] waits longest | Weekly | Medium-High |
| **Black dog content** | Dedicated spotlight, photography tips | Weekly | High |
| **Staff POV** | Voiceover as "the dog" or shelter worker | Weekly | Very High |
| **Reaction hook** | "Most people swipe past this dog..." | As available | Extremely High |

---

## Video Generation Process (Step by Step)

### Step 1: Dog Selection
**Criteria (scored 0-10):**
- Days waiting (1 point per 100 days, max 10)
- Photo quality (0-3 points)
- Breed relatability (0-2 points)
- Description quality (0-2 points)
- Location coverage gap (0-1 point — prefer underrepresented states)
- Special needs or unusual story (+1 bonus)

**Threshold:** 6+ points gets featured. Dogs scoring 8+ get priority.

### Step 2: Script Generation
Template engine selects from 12 script templates based on dog profile. Claude generates personalized copy for each dog. All scripts under 60 seconds when spoken at 140 WPM.

**Example for a 847-day pit bull named Remy:**
```
Remy has been in this shelter for 847 days.
That's over 2 years of the same kennel. The same bowl. The same 4 walls.
He came in as a stray. Nobody ever came back for him.
He's 4 years old, 65 pounds, and he just wants to lie on a couch with someone.
847 days. His counter is still ticking right now at waitingthelongest.com
The link is in our bio. His name is Remy.
```

### Step 3: Asset Preparation
- Primary photo: resize to 9:16 (1080×1920), center-crop with dogs face in upper third
- Wait counter: text overlay at bottom 20% of frame, large white text, black border
- Background: slow ken-burns zoom on photo (FFmpeg, 5% zoom over 30 seconds)
- Music: royalty-free sad/hopeful instrumental (Epidemic Sound categories: Emotional, Ambient)
- End card: logo + "link in bio" + dog's URL slug

### Step 4: Voiceover
- **Option A (automated):** Edge-TTS voice `en-US-AriaNeural` (female, warm) or `en-US-GuyNeural` (male, steady)
- **Option B (manual):** Ian records 60-second voiceover from script — always outperforms TTS
- Audio normalized to -14 LUFS, gentle reverb added for warmth

### Step 5: Assembly (FFmpeg pipeline)
```bash
# Ken-burns zoom on image
ffmpeg -loop 1 -i dog.jpg -vf "scale=1920:1080,zoompan=z='min(zoom+0.0015,1.5)':d=1200:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',crop=1080:1920" -t 60 video.mp4

# Overlay counter text
ffmpeg -i video.mp4 -vf "drawtext=fontfile=Oswald-Bold.ttf:text='${DAYS} DAYS WAITING':fontsize=64:fontcolor=white:bordercolor=black:borderw=4:x=(w-tw)/2:y=h-150" -t 60 final.mp4

# Mix voiceover
ffmpeg -i final.mp4 -i voiceover.mp3 -i music.mp3 -filter_complex "[1:a]volume=1.0[vo];[2:a]volume=0.15[bg];[vo][bg]amix=inputs=2:duration=first[aout]" -map 0:v -map "[aout]" output.mp4
```

### Step 6: Caption + Hashtags
```
Template:
Meet [NAME]. [BREED MIX], [AGE]. Waiting [X] days at [SHELTER NAME] in [CITY, STATE].

This dog has been waiting longer than most of us wait for anything.

Find them at the link in bio. Share this. It costs nothing.

#AdoptDontShop #[BREED] #RescueDog #ShelterDog #WaitingTheLongest #DogAdoption #[STATE]Rescue #LongTermShelterDog
```

**Hashtag Strategy:**
- 3-4 niche hashtags (breed, location, shelter type) — get found in specific searches
- 2-3 mid-size (#RescueDog 2B views — don't lead with this)
- 1 branded (#WaitingTheLongest — building our own tag)
- Avoid: over-stuffing, banned tags, generic #dogsoftiktok in every post

### Step 7: Posting
- **Time:** 7-9 AM EST or 7-9 PM EST (TikTok peak engagement windows)
- **Frequency:** 1 video/day minimum. 2/day during growth phase (first 60 days)
- **Location tag:** Always tag the city the dog is in — local TikTok users are most likely to adopt
- **Bio link:** Always `waitingthelongest.com` with UTM: `?utm_source=tiktok&utm_content=[DOG_ID]`

---

## Jeff Automation Integration

### Jeff-Side Module Plan: `tiktok_wtl_ceo.py`

```python
# Responsibilities:
# 1. Pull dogs from WTL API sorted by score
# 2. Select top dog(s) for today
# 3. Generate script via Claude
# 4. Pull photo from Supabase storage
# 5. Generate voiceover via Edge-TTS
# 6. Assemble video via FFmpeg
# 7. Quality gate (A/B/C/D/F scoring)
# 8. Post via Playwright → TikTok
# 9. Log to Jeff DB
# 10. Update WTL dog profile: "posted to TikTok"
```

### Scheduler Jobs (when built)
| Job | Schedule | Description |
|-----|----------|-------------|
| `wtl_tiktok_select` | 6 AM daily | Score dogs, pick top 1-2 |
| `wtl_tiktok_produce` | 6:30 AM daily | Generate script + voiceover + assemble |
| `wtl_tiktok_post` | 7 AM daily | Post to @waitingthelongest |
| `wtl_tiktok_post_pm` | 7 PM daily | Optional 2nd post during growth phase |
| `wtl_tiktok_analytics` | 8 PM daily | Pull view/share/save stats |
| `wtl_tiktok_report` | Mon 8 AM | Weekly report → Telegram |

### WTL API Endpoints Needed (for Jeff)
- `GET /api/dogs?sort=tiktok_score_desc&status=approved&not_posted=true` — pending post queue
- `PATCH /api/dogs/{id}` — update `tiktok_posted_at`, `tiktok_url`

---

## Account Setup Checklist

- [ ] @waitingthelongest TikTok account created
- [ ] Profile photo: AlertOctagon logo (coral on cream)
- [ ] Bio: "Shelter dogs ranked by how long they've been waiting. Every second counts. Link → dogs listed today"
- [ ] Bio link: `waitingthelongest.com`
- [ ] TikTok Business Account (for analytics access)
- [ ] Enable Creator tools → Analytics
- [ ] Stitch/Duet: ON (allows other creators to extend our content)
- [ ] Comment filter: moderate hate, allow animal emotion content
- [ ] Auto-reply: disabled (reply manually to adoption questions)

---

## Content Calendar Template (Week 1)

| Day | Dog | Format | Hook |
|-----|-----|--------|------|
| Mon | Longest waiting dog in DB | Counter reveal | "This dog has been waiting longer than your last 3 relationships combined" |
| Tue | Senior dog | Myth bust | "3 lies people believe about old dogs" |
| Wed | Black dog | Photography focus | "This dog disappears in every photo. That's why nobody adopts them." |
| Thu | Success story | Before/after | "847 days in a shelter. 3 weeks ago, this happened." |
| Fri | Pit bull | Breed spotlight | "He waited 2 years because of his breed. His new family doesn't care." |
| Sat | Local dog (Northeast) | Location hook | "There's a dog 12 miles from you who has been waiting 400 days" |
| Sun | Recent arrival | Raw/authentic | "She arrived Sunday. Her counter just started. Don't let it hit 100." |

---

## Engagement Playbook

### First 30 Minutes After Posting (Critical Window)
1. Reply to the first 5 comments within 2 minutes (TikTok boosts posts with fast engagement)
2. Pin a comment: "Update: [Dog's name] is still available. Direct link → [bio]"
3. Send to 3 relevant rescue TikTok accounts via DM: "Just posted about [name], feel free to stitch"

### Comment Response Templates
- Adoption question: "DM us directly OR go to [link] — search [name], there's a direct contact link to the shelter on their profile"
- "Why isn't this going viral??": Reply positively, TikTok reads sentiment in comments
- Sad reactions: "Your comment will help [name] get seen by more people. Thank you for caring."
- "I would if I could": "Sharing is just as valuable. Please share."
- Negative: Don't delete unless truly harmful. Engagement is engagement.

### Stitch + Duet Strategy
- Find large rescue accounts (50K+ followers) and stitch their content with our counter overlay
- DM active shelter TikTok accounts: offer to cross-post their dogs with our counter branding
- Create "reply to @[user]" videos when someone asks "how long has this dog been waiting"

---

## Growth Milestones

| Followers | Target Timeline | Key Metric |
|-----------|-----------------|------------|
| 1,000 | Week 2 | First viral video (100K+ views) |
| 10,000 | Month 1 | Consistent 10K+ per video |
| 50,000 | Month 2 | Inbound shelter partnerships |
| 100,000 | Month 3 | TikTok Creator Fund eligible, sponsorship conversations |
| 500,000 | Month 6 | National media attention, Humane Society partnerships |

---

## Monetization via TikTok

1. **TikTok Creator Fund** — eligible at 100K followers + 100K views/30 days
2. **TikTok LIVE** — weekly "rescue hour" with shelter guests, digital gifts
3. **TikTok Shop** — WTL merchandise (mugs, shirts: "I Adopted a Long-Waiter")
4. **Brand deals** — pet insurance, vet telehealth, dog food subscriptions will pay $500-5K/post at 100K+
5. **Shelter feature sponsorships** — "This post brought to you by [shelter]" — they pay for spotlight

---

## Cross-Platform Distribution

Every TikTok video also posts to:
- **Instagram Reels** (same video, slightly longer caption)
- **Facebook Reels** (repurpose — Facebook dog rescue communities are massive)
- **YouTube Shorts** (passive SEO benefit)
- **Twitter/X** (link to TikTok video)

Watermark policy: TikTok @waitingthelongest watermark ON for TikTok. REMOVED (via SnapTik or FFmpeg crop) for Instagram/Facebook/YouTube.

---

## Success Metrics (Tracked Weekly)

| Metric | Target | Current |
|--------|--------|---------|
| Videos posted | 7/week | 0 |
| Avg views/video | 50K | N/A |
| Follower growth | +1K/week | N/A |
| Profile link clicks | 500/week | N/A |
| Dogs adopted via TikTok | 1/week | N/A |
| Top performing content type | — | N/A |

---

## Tools Required

| Tool | Purpose | Status |
|------|---------|--------|
| FFmpeg | Video assembly, zoompan, audio mix | Available |
| Edge-TTS | Voiceover generation | Available |
| Playwright | Automated TikTok posting | Available |
| Claude API | Script generation | Available |
| WTL API | Dog data, photos, counter | Available |
| Epidemic Sound | Royalty-free music | Need subscription ($15/mo) |
| CapCut (manual) | Quick manual edits if needed | Free |

---

## Immediate Next Steps

1. **Create @waitingthelongest TikTok account** (Ian — 5 minutes)
2. **Post first manual video** — pick the longest-waiting dog in the DB, record or use TTS, post with caption template above
3. **Build `tiktok_wtl_ceo.py`** in Jeff — automation module (next dev session)
4. **Wire to scheduler** — 6 AM select, 6:30 AM produce, 7 AM post

---

*Last updated: 2026-06-16*
*WaitingTheLongest.com — Every second counts.*
