import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Dog,
  Clock,
  Building2,
  AlertTriangle,
  Search,
  Heart,
  Share2,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Users,
  Star,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Site Wiki — WaitingTheLongest.com",
  description:
    "Complete guide to WaitingTheLongest.com — how the wait counter works, how to submit a dog, how dogs are ranked, and everything else about the platform.",
  openGraph: {
    title: "Site Wiki — WaitingTheLongest.com",
    description:
      "Complete guide to WaitingTheLongest.com — how the platform works, how to list your dog, and how to find dogs near you.",
    type: "website",
    url: "https://waitingthelongest.com/wiki",
  },
};

// ---- Section Data ----

const sections = [
  {
    id: "what-is-this",
    icon: BookOpen,
    title: "What Is WaitingTheLongest.com?",
    color: "text-wtl-coral",
    bg: "bg-wtl-coral/10 border-wtl-coral",
    content: [
      {
        heading: "The core idea",
        body: "WaitingTheLongest.com is a dog adoption discovery platform with one rule: dogs are ranked by how long they have been waiting in a shelter. The dog who has waited the longest always appears first. There is no algorithm, no paid placement, and no guesswork. Time is the only metric.",
      },
      {
        heading: "Why this approach?",
        body: "Most adoption platforms sort by \"newest first\" or by engagement. This buries the dogs who have been waiting the longest — the ones who most need visibility. A dog who arrived at a shelter 800 days ago gets pushed to page 47 while a 6-week-old puppy sits on page 1. We fix that.",
      },
      {
        heading: "Who we are",
        body: "WaitingTheLongest.com is an independent platform. We are not affiliated with any shelter, rescue network, or national animal welfare organization. We are not a rescue ourselves. We provide visibility. Adoption decisions, animal care, and logistics remain with the shelter or rescue listing the dog.",
      },
      {
        heading: "What we do NOT do",
        body: "We do not take any animals into our care. We do not process adoptions or collect adoption fees. We do not sell dogs. We are a directory and discovery tool — nothing more, nothing less.",
      },
    ],
  },
  {
    id: "wait-counter",
    icon: Clock,
    title: "The Live Wait Counter",
    color: "text-wtl-navy",
    bg: "bg-wtl-navy/10 border-wtl-navy",
    content: [
      {
        heading: "What it measures",
        body: "The wait counter shows exactly how long a dog has been in shelter or foster care — days, hours, minutes, and seconds — updating in real time. It counts from the dog's intake date (the date they physically entered the shelter) to right now.",
      },
      {
        heading: "How it works technically",
        body: "When a shelter submits a dog, they provide the intake date. Our system stores that date and calculates the elapsed time on your screen in real time using client-side JavaScript. The counter ticks every second. There is no rounding, no approximation. If a dog entered a shelter 847 days, 3 hours, 22 minutes, and 15 seconds ago — that is exactly what you see.",
      },
      {
        heading: "Why the intake date matters so much",
        body: "The intake date is the single most important field in every submission. It is the source of truth for the entire ranking system. A dog who entered a shelter on January 3rd, 2025 will show 547 days if you submit them in June 2026. That is correct — that is the real wait. We display the actual wait, not the time since we listed them.",
      },
      {
        heading: "What counts as an intake date?",
        body: "The date the dog physically entered your care — whether that's a shelter, rescue foster, or personal foster placement. If a dog was transferred from another shelter, use the date they entered your organization's care (the most recent continuous placement). If unknown, estimate conservatively — an honest shorter number is better than a fabricated longer one.",
      },
    ],
  },
  {
    id: "how-dogs-get-listed",
    icon: Dog,
    title: "How Dogs Get Listed",
    color: "text-wtl-sky",
    bg: "bg-wtl-sky/10 border-wtl-sky",
    content: [
      {
        heading: "Submission only — no scraping",
        body: "Every dog on WaitingTheLongest.com was submitted by a verified person with custody of that animal. We do not scrape other platforms or purchase data. Every listing is a direct submission. This is intentional — it ensures data quality and legal clarity.",
      },
      {
        heading: "Who can submit",
        body: "Anyone with custody of a dog who needs adoption: individual fosters, informal rescue groups, registered 501(c)(3) rescues, municipal animal shelters, and animal control agencies. There are three submitter tiers with different verification levels.",
      },
      {
        heading: "The 5-step intake form",
        body: "Submissions go through a 5-step form at waitingthelongest.com/submit. Step 1: identify yourself. Step 2: verification (email for individuals, EIN for organizations). Step 3: dog details including the intake date. Step 4: photos (1-5, max 10MB each). Step 5: legal agreement.",
      },
      {
        heading: "Review before going live",
        body: "Every submission is reviewed by a human before going live. We check the intake date for plausibility, verify photos meet minimum quality, and screen for prohibited content (price lists, breeder language, fraudulent listings). Approved listings go live within 24-72 hours depending on tier.",
      },
      {
        heading: "It is completely free",
        body: "There is no charge to list a dog. There is no premium listing. There is no pay-to-rank. The only ranking is time. A shelter with one dog and no budget has the same access as a large national rescue.",
      },
    ],
  },
  {
    id: "submitter-tiers",
    icon: Star,
    title: "Submitter Tiers",
    color: "text-wtl-gold",
    bg: "bg-wtl-gold/20 border-wtl-gold",
    content: [
      {
        heading: "Tier 0 — Individual / Self-Asserted",
        body: "Individuals fostering a dog or in an informal rescue situation. Requires email, name, and attestation checkbox. Maximum 3 submissions until verified. Approved within 48-72 hours via manual review.",
      },
      {
        heading: "Tier 1 — Registered Organization",
        body: "501(c)(3) rescues, EIN-registered shelters, and animal control agencies. Requires EIN, organization website, and contact information. Unlimited submissions with a verified badge on all listings. Approved within 24 hours.",
      },
      {
        heading: "Tier 2 — Trusted Partner",
        body: "Organizations with 6+ months on the platform and 10+ successful listings receive automatic upgrade. Benefits: instant publish (no manual review), featured placement eligibility, and API access for bulk uploads.",
      },
    ],
  },
  {
    id: "searching-and-filtering",
    icon: Search,
    title: "Searching and Filtering Dogs",
    color: "text-wtl-sage",
    bg: "bg-wtl-sage/10 border-wtl-sage",
    content: [
      {
        heading: "Default sort: longest waiting first",
        body: "The default view at /dogs always shows the longest-waiting dogs at the top. This is the core function of the platform. If you come here with no filter and browse the first page, you are seeing the dogs in the most urgent situation.",
      },
      {
        heading: "Available filters",
        body: "You can filter by breed, size (Small <20lbs, Medium 20-50lbs, Large 50-90lbs, XL 90+lbs), sex (male/female), age group (puppy, young, adult, senior), good with dogs/cats/kids, special needs, and location (state/city radius). All filters can be combined.",
      },
      {
        heading: "Sort options",
        body: "In addition to longest waiting (default), you can sort by: recently added (newest arrivals), by location (closest to you), and by size. Switching to 'recently added' lets you see new submissions that may not have long wait times yet but just entered the system.",
      },
      {
        heading: "Location search",
        body: "The location filter matches against the dog's physical location as submitted by the shelter. Enter a state abbreviation (MA, NY, CA) or a city name to narrow results. Dogs available for transport or remote adoption will be noted in their description.",
      },
    ],
  },
  {
    id: "dog-profile",
    icon: Heart,
    title: "Dog Profile Pages",
    color: "text-wtl-coral",
    bg: "bg-wtl-coral/10 border-wtl-coral",
    content: [
      {
        heading: "What you see on a dog's profile",
        body: "Each dog has a dedicated profile at waitingthelongest.com/dogs/[id]. It shows their photos, live wait counter, name, breed, age, size, sex, spay/neuter status, temperament flags (good with dogs/cats/kids), special needs, location, description from the shelter, and a direct link to the shelter's own listing if provided.",
      },
      {
        heading: "The live counter on the profile",
        body: "The wait counter on the profile page is the most prominent element. It shows days, hours, minutes, and seconds — ticking in real time. This is not decorative. It is the real elapsed time since this dog entered shelter care.",
      },
      {
        heading: "How to adopt",
        body: "We are a discovery platform, not an adoption processor. On each dog's profile, there is a direct link to the shelter's own listing page (if provided) and the shelter's contact email. Contact them directly. Ask about adoption requirements, fees, and process — these vary by organization.",
      },
      {
        heading: "When a dog gets adopted",
        body: "When a dog is adopted, the shelter emails shelters@waitingthelongest.com with the dog's name. We update the listing status to Adopted and archive the profile. Adopted dogs are celebrated, not deleted. Their profiles remain visible as success stories.",
      },
    ],
  },
  {
    id: "shelters",
    icon: Building2,
    title: "For Shelters and Rescues",
    color: "text-wtl-sky",
    bg: "bg-wtl-sky/10 border-wtl-sky",
    content: [
      {
        heading: "Why list with us",
        body: "WaitingTheLongest.com gives your longest-waiting animals targeted visibility with adopters who are specifically seeking the dogs other platforms bury. Our users come here looking for the hard cases. They know what they are getting into.",
      },
      {
        heading: "The ShareKit",
        body: "Every listed dog has a ShareKit — pre-written TikTok, Instagram, Facebook, and Twitter/X share text with the dog's name, breed, and live wait time. Staff can copy and paste these directly. The live wait counter makes social shares emotionally compelling in a way that static photos cannot match.",
      },
      {
        heading: "Updating or removing a listing",
        body: "To update a listing (new photos, changed description, location update) or mark a dog as adopted: email shelters@waitingthelongest.com with the dog's name and what changed. Self-service listing management is on the roadmap for Tier 1+ organizations.",
      },
      {
        heading: "Bulk submissions and API access",
        body: "Organizations with more than 20 dogs should contact us about API access. Email shelters@waitingthelongest.com with subject line 'API Access Request — [Organization Name]'. Bulk uploads use the same data schema as the web form.",
      },
      {
        heading: "Partnership inquiries",
        body: "If you represent a large shelter network, national rescue organization, or animal welfare nonprofit and want to discuss a formal data-sharing partnership, email shelters@waitingthelongest.com.",
      },
    ],
  },
  {
    id: "sharing",
    icon: Share2,
    title: "Sharing Dogs",
    color: "text-wtl-navy",
    bg: "bg-wtl-navy/10 border-wtl-navy",
    content: [
      {
        heading: "The ShareKit",
        body: "Every dog profile page includes a ShareKit with pre-written social media content for TikTok, Instagram, Facebook, and Twitter/X. The copy includes the dog's name, breed, wait time, and a direct link back to their profile page.",
      },
      {
        heading: "Why sharing matters",
        body: "Adoption is primarily a visibility problem. The more people who see a dog, the higher the chance that the right person sees them. A dog who has been in a shelter for 800 days has likely been seen by everyone within driving distance. They need visibility beyond their geographic area.",
      },
      {
        heading: "TikTok is the highest-leverage share",
        body: "A single viral TikTok video about a specific dog can generate 1-5 million views in 48 hours. The live wait counter — '847 days, 3 hours, 22 minutes' — is the kind of specific, emotional detail that makes content stop scrollers. Follow @waitingthelongest on TikTok for daily long-wait spotlights.",
      },
      {
        heading: "Direct URL sharing",
        body: "Every dog has a permanent URL: waitingthelongest.com/dogs/[id]. This link is shareable anywhere — texts, emails, other social platforms, rescue forums. The page always shows the live wait counter in real time.",
      },
    ],
  },
  {
    id: "rules-and-prohibited",
    icon: ShieldCheck,
    title: "Rules and Prohibited Submissions",
    color: "text-wtl-coral",
    bg: "bg-wtl-coral/10 border-wtl-coral",
    content: [
      {
        heading: "Zero tolerance violations",
        body: "The following are permanently banned: commercial dog sales (any dog listed with a sale price), puppy mills and brokers, impersonating an organization, fabricating intake dates to inflate wait time rankings, and submitting dogs not in your physical care.",
      },
      {
        heading: "Enforcement",
        body: "Violations are reported to the Humane Society of the United States, ASPCA, and local law enforcement where applicable. There are no warnings — a first violation results in a permanent account ban and potential legal action.",
      },
      {
        heading: "Adoption fees are fine",
        body: "Shelters charging standard adoption fees are permitted and expected. The prohibition is on for-profit commercial dog sales — selling dogs for a markup as a business. A $150 shelter adoption fee that covers spay/neuter, vaccines, and microchip is not the same thing.",
      },
      {
        heading: "Breed honesty rule",
        body: "Be honest about breed. Listing a clear pit bull as a 'Lab Mix' to improve adoption chances erodes trust for every shelter on the platform. We ask submitters to use honest breed descriptions. Breed-conscious adopters find and choose dogs based on honest information.",
      },
      {
        heading: "Report abuse",
        body: "If you see a listing that appears fraudulent, falsely represents a dog, or violates our rules, email abuse@waitingthelongest.com. Include the dog's name, the listing URL, and what you observed. We investigate every report.",
      },
    ],
  },
  {
    id: "data-standards",
    icon: Zap,
    title: "Data Standards",
    color: "text-wtl-sky",
    bg: "bg-wtl-sky/10 border-wtl-sky",
    content: [
      {
        heading: "SAC-aligned vocabulary",
        body: "WaitingTheLongest.com uses vocabulary aligned with the Shelter Animals Count (SAC) national database standard. This ensures compatibility with existing shelter data systems.",
      },
      {
        heading: "Intake types",
        body: "Stray, Owner Surrender, Transfer, Return, Confiscation, Born in Care.",
      },
      {
        heading: "Size categories",
        body: "Small (under 20 lbs), Medium (20-50 lbs), Large (50-90 lbs), XL (90+ lbs).",
      },
      {
        heading: "Age groupings",
        body: "Puppy (0-6 months), Young (6-18 months), Adult (18 months - 7 years), Senior (7 years+).",
      },
      {
        heading: "Altered status",
        body: "Yes (spayed/neutered), No (intact), Unknown.",
      },
    ],
  },
  {
    id: "contact",
    icon: Users,
    title: "Contact and Support",
    color: "text-wtl-sage",
    bg: "bg-wtl-sage/10 border-wtl-sage",
    content: [
      {
        heading: "Shelter and rescue partnerships",
        body: "shelters@waitingthelongest.com — new partnerships, API access, bulk listing questions, listing updates, adoption confirmations.",
      },
      {
        heading: "Report abuse or fraud",
        body: "abuse@waitingthelongest.com — fraudulent listings, breed misrepresentation, commercial breeders, impersonation.",
      },
      {
        heading: "Privacy",
        body: "privacy@waitingthelongest.com — data deletion requests, GDPR/CCPA inquiries, opt-out requests.",
      },
      {
        heading: "General",
        body: "hello@waitingthelongest.com — press, partnerships, general questions, feedback.",
      },
    ],
  },
];

// ---- Component ----

export default function WikiPage() {
  return (
    <div className="min-h-screen bg-wtl-cream">
      {/* Header */}
      <section className="bg-wtl-navy border-b-4 border-wtl-coral py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-wtl-coral" />
            <span className="font-display font-black uppercase tracking-widest text-sm text-wtl-coral">
              Site Wiki
            </span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-6xl text-white uppercase leading-tight tracking-tighter mb-6">
            How Everything<br />
            <span className="text-wtl-coral">Works</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Complete documentation for WaitingTheLongest.com — the wait counter,
            how dogs get listed, how to search, shelter tools, rules, and
            everything in between.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="bg-white border-b-2 border-wtl-warm sticky top-20 z-30 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-0 overflow-x-auto">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex-none px-4 py-4 text-xs font-display font-bold uppercase tracking-widest text-wtl-muted hover:text-wtl-coral border-b-2 border-transparent hover:border-wtl-coral transition-colors whitespace-nowrap"
              >
                {s.title.split(" ").slice(0, 3).join(" ")}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.id} id={section.id} className="scroll-mt-32">
              {/* Section Header */}
              <div className={`flex items-center gap-3 mb-6 pb-4 border-b-4 border-wtl-navy`}>
                <div className={`p-2 border-2 border-wtl-navy ${section.bg.split(" ")[0]}`}>
                  <Icon className={`w-6 h-6 ${section.color}`} />
                </div>
                <h2 className="font-display font-black text-2xl md:text-3xl text-wtl-navy uppercase tracking-tight">
                  {section.title}
                </h2>
              </div>

              {/* Section Items */}
              <div className="space-y-6">
                {section.content.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-wtl-warm pl-6">
                    <h3 className="font-display font-black text-wtl-navy uppercase tracking-wide text-sm mb-2">
                      {item.heading}
                    </h3>
                    <p className="text-wtl-muted leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* FAQ + More links */}
        <section className="border-t-4 border-wtl-navy pt-12">
          <h2 className="font-display font-black text-2xl text-wtl-navy uppercase tracking-tight mb-6">
            More Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { href: "/faq", label: "FAQ", desc: "Quick answers to common questions", icon: HelpCircle },
              { href: "/blog", label: "Stories & Articles", desc: "Why long-wait dogs wait", icon: BookOpen },
              { href: "/submit", label: "Submit a Dog", desc: "Free listing for shelters and fosters", icon: Dog },
              { href: "/dogs", label: "Browse All Dogs", desc: "See every dog on the platform", icon: Search },
            ].map(({ href, label, desc, icon: ItemIcon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-start gap-4 p-5 border-2 border-wtl-navy bg-white hover:shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] transition-all"
              >
                <ItemIcon className="w-5 h-5 text-wtl-coral mt-0.5 flex-none" />
                <div>
                  <div className="font-display font-black text-wtl-navy uppercase tracking-wide text-sm">
                    {label}
                  </div>
                  <div className="text-wtl-muted text-sm">{desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-wtl-muted ml-auto flex-none mt-0.5" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
