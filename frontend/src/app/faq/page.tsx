import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ — WaitingTheLongest.com",
  description: "Common questions about adopting long-wait shelter dogs, submitting a dog, and how WaitingTheLongest.com works.",
};

const FAQ_SECTIONS = [
  {
    section: "For Adopters",
    items: [
      {
        q: "What makes WaitingTheLongest.com different from other adoption sites?",
        a: "Every other adoption platform sorts dogs by recency, photos, or breed popularity. We sort by one thing only: how long each dog has been waiting. The dog at the top of our list has been in a shelter the longest. That's the dog who needs you most."
      },
      {
        q: "Are these dogs actually available for adoption?",
        a: "Yes. Every listing is submitted directly by a verified shelter or rescue organization. When you click 'Visit Shelter Website,' you go directly to the organization that has the dog. We're a discovery layer — the shelter handles the actual adoption process."
      },
      {
        q: "Why have some dogs been waiting over a year?",
        a: "Long shelter stays happen for many reasons: black coat syndrome (dark-colored dogs are statistically overlooked), breed bias (pit bull types, hound mixes), age (adult and senior dogs lose out to puppies), special medical needs, or simply bad luck — a dog who arrived during a busy season and never caught anyone's eye. WaitingTheLongest exists specifically to fix that last reason."
      },
      {
        q: "How do I know the wait times are accurate?",
        a: "Wait times are calculated from the dog's intake date, which is submitted by the shelter at the time of listing. The live counter you see on each dog's page ticks up in real time from that verified intake date. We do not manufacture or estimate wait times."
      },
      {
        q: "What should I expect when adopting a long-wait dog?",
        a: "Long-wait dogs often need a decompression period — typically 3 weeks — to adjust to a home environment. Many are incredibly grateful, bonded companions who were simply overlooked for reasons that have nothing to do with their temperament. Patience in the first few weeks pays off for years."
      },
      {
        q: "Can I filter by location, breed, or size?",
        a: "Yes. On the Browse Dogs page you can filter by state, breed, size, sex, and compatibility (good with dogs, cats, kids). All filters work alongside the default sort-by-wait-time ranking."
      },
      {
        q: "How do I contact the shelter?",
        a: "Each dog's profile page has a 'Visit Shelter Website' button that links directly to the organization. You contact the shelter directly — we don't process adoptions."
      },
      {
        q: "Is this service free for adopters?",
        a: "Yes, always. WaitingTheLongest.com is free to browse. Adoption fees are set by the individual shelter or rescue — we display them on each dog's profile when provided."
      },
    ]
  },
  {
    section: "For Shelters & Rescues",
    items: [
      {
        q: "How do I list my dogs on WaitingTheLongest.com?",
        a: "Use our Submit a Dog portal at waitingthelongest.com/submit. It takes about 5 minutes per dog. Alternatively, if you're a high-volume shelter, contact us at shelters@waitingthelongest.com about API access for bulk submissions."
      },
      {
        q: "Is listing free?",
        a: "Yes. Listing dogs is completely free. We believe financial barriers should never prevent a dog from getting exposure. We generate revenue through affiliate partnerships and optional premium shelter features, not by charging for basic listings."
      },
      {
        q: "How do you verify shelters?",
        a: "We use a three-tier verification system. Tier 0: self-asserted (basic submission, manual review). Tier 1: EIN-verified nonprofit or registered rescue. Tier 2: trusted organization with a track record on the platform. Tier 1 and 2 organizations get faster approval and a verified badge."
      },
      {
        q: "What information do I need to submit a dog?",
        a: "Required: dog's name, intake date, breed, age, size, sex, location, and at least one photo. Optional but recommended: description, compatibility info (good with dogs/cats/kids), adoption fee, and a direct listing URL."
      },
      {
        q: "How long does approval take?",
        a: "We review every submission manually. Typical approval time is 24-48 hours. Once approved, the dog's wait counter starts ticking from their original intake date — not from the submission date."
      },
      {
        q: "Can I submit dogs that have already been waiting a long time?",
        a: "Absolutely — that's exactly who this is for. A dog who has been waiting 400 days will immediately rank near the top of our list. Use the actual intake date so the counter reflects their real wait."
      },
      {
        q: "What if a dog gets adopted? How do I update the listing?",
        a: "Email us at shelters@waitingthelongest.com with the dog's name and your organization. We'll mark them as adopted — their success story may be featured in our blog. We're building a self-service shelter dashboard for real-time updates."
      },
    ]
  },
  {
    section: "About the Platform",
    items: [
      {
        q: "Who built WaitingTheLongest.com?",
        a: "WaitingTheLongest.com is an independent platform built to solve a specific problem: the dogs who need homes most are the ones least likely to be seen. The platform is not affiliated with any shelter, rescue network, or animal welfare organization — we're a neutral discovery layer."
      },
      {
        q: "How do you make money?",
        a: "We use affiliate partnerships (Amazon, Chewy) on dog product recommendations, and we're building optional premium features for shelters. We will never charge adopters, and basic shelter listings are always free."
      },
      {
        q: "Where does the data come from?",
        a: "All data is submitted directly by verified shelters and rescue organizations through our intake portal. We do not scrape other adoption platforms."
      },
      {
        q: "Do you have a TikTok or Instagram?",
        a: "We're building our social presence now. Follow @waitingthelongest on TikTok and Instagram. We post individual dog stories — if your dog is listed with us and you want them featured, email us."
      },
      {
        q: "How can I report abuse or a fraudulent listing?",
        a: "Email abuse@waitingthelongest.com immediately. We have zero tolerance for commercial dog sales, breeder listings, or impersonation of shelters. Verified abuse reports are investigated within 24 hours."
      },
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="bg-wtl-cream min-h-screen">
      {/* Header */}
      <div className="border-b-4 border-wtl-navy bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-wtl-coral" />
            <span className="font-display font-black uppercase tracking-widest text-sm text-wtl-muted">FAQ</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-6xl text-wtl-navy uppercase leading-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-wtl-muted max-w-2xl">
            Everything you need to know about adopting long-wait shelter dogs, listing your organization, and how the platform works.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {FAQ_SECTIONS.map((section) => (
          <div key={section.section}>
            <h2 className="font-display font-black text-2xl uppercase tracking-widest text-wtl-navy border-b-4 border-wtl-navy pb-3 mb-8">
              {section.section}
            </h2>
            <div className="space-y-0 border-2 border-wtl-navy">
              {section.items.map((item, i) => (
                <details
                  key={i}
                  className="group border-b-2 border-wtl-navy last:border-b-0"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-wtl-warm transition-colors list-none">
                    <span className="font-display font-bold text-lg text-wtl-navy pr-4">{item.q}</span>
                    <ChevronDown className="w-5 h-5 text-wtl-coral flex-shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-wtl-navy/80 leading-relaxed border-t-2 border-wtl-warm pt-4">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="border-4 border-wtl-navy bg-wtl-navy p-8 text-center">
          <h3 className="font-display font-black text-3xl text-white uppercase mb-3">Still have questions?</h3>
          <p className="text-white/70 mb-6">We respond to every email within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:shelters@waitingthelongest.com" className="btn-primary">Email Us</a>
            <Link href="/submit" className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-display font-bold uppercase tracking-widest hover:bg-white hover:text-wtl-navy transition-colors">
              Submit a Dog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
