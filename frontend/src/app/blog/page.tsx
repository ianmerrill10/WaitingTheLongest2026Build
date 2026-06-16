import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Stories — WaitingTheLongest.com",
  description: "Real stories of shelter dogs who waited the longest — and found their forever homes. Every day counts.",
};

export const BLOG_POSTS = [
  {
    slug: "black-dog-syndrome",
    title: "Black Dog Syndrome: The Invisible Epidemic in American Shelters",
    excerpt: "Studies show that black dogs are adopted at significantly lower rates and euthanized at higher rates than lighter-colored dogs. The reason is heartbreaking in its simplicity: they're harder to photograph.",
    date: "2026-06-10",
    readTime: "5 min read",
    category: "Education",
    image: null,
  },
  {
    slug: "why-adult-dogs-wait-longer",
    title: "Why Adult Dogs Wait 3x Longer Than Puppies — And Why That's Backwards",
    excerpt: "Adult dogs are house-trained, past the destructive puppy phase, and their personalities are fully formed. So why do they sit in shelters for months while puppies get adopted in hours?",
    date: "2026-06-08",
    readTime: "6 min read",
    category: "Education",
    image: null,
  },
  {
    slug: "pit-bull-wait-times",
    title: "Pit Bulls Are America's Most Overlooked Shelter Dog. Here's the Data.",
    excerpt: "Pit bull type dogs represent the single largest group of dogs in American shelters and have the longest average wait times. The reason has nothing to do with temperament.",
    date: "2026-06-05",
    readTime: "7 min read",
    category: "Data",
    image: null,
  },
  {
    slug: "senior-dogs-deserve-homes",
    title: "Senior Dogs: The Most Grateful Animals You'll Ever Meet",
    excerpt: "A dog who has spent 8 years with a family and then arrives at a shelter at age 10 knows exactly what it's lost. These dogs ask for so little and give back everything.",
    date: "2026-06-01",
    readTime: "4 min read",
    category: "Stories",
    image: null,
  },
  {
    slug: "how-shelter-wait-time-works",
    title: "How Shelter Wait Time Actually Works — And Why Most People Get It Wrong",
    excerpt: "When a dog's wait time hits 30 days, most shelters consider that 'long.' When it hits 365 days, something has gone deeply wrong. This is what happens inside the system.",
    date: "2026-05-28",
    readTime: "8 min read",
    category: "Education",
    image: null,
  },
  {
    slug: "decompression-period",
    title: "The 3-3-3 Rule: What to Expect When You Adopt a Long-Wait Dog",
    excerpt: "3 days of overwhelm. 3 weeks to learn the routine. 3 months to feel at home. If you adopt a dog who's been in a shelter for over a year, here's what the first 90 days actually look like.",
    date: "2026-05-20",
    readTime: "6 min read",
    category: "Adoption Guide",
    image: null,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Education: "bg-wtl-sky/10 text-wtl-sky border-wtl-sky",
  Data: "bg-wtl-gold/20 text-wtl-navy border-wtl-navy",
  Stories: "bg-wtl-sage/10 text-wtl-sage border-wtl-sage",
  "Adoption Guide": "bg-wtl-coral/10 text-wtl-coral border-wtl-coral",
};

export default function BlogPage() {
  return (
    <div className="bg-wtl-cream min-h-screen">
      {/* Header */}
      <div className="border-b-4 border-wtl-navy bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="font-display font-black uppercase tracking-widest text-sm text-wtl-muted block mb-3">Stories &amp; Research</span>
          <h1 className="font-display font-black text-5xl md:text-6xl text-wtl-navy uppercase leading-tight mb-4">
            Every Dog Has a Story
          </h1>
          <p className="text-xl text-wtl-muted max-w-2xl">
            Education, data, and real stories about shelter dogs who wait the longest — and what happens when someone finally sees them.
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card group flex flex-col">
              {/* Category bar */}
              <div className="p-4 border-b-2 border-wtl-navy bg-wtl-navy">
                <span className={`inline-block text-xs font-bold uppercase tracking-widest px-2 py-1 border ${CATEGORY_COLORS[post.category] || "bg-white text-wtl-navy border-wtl-navy"}`}>
                  {post.category}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h2 className="font-display font-black text-2xl text-wtl-navy uppercase leading-tight mb-3 group-hover:text-wtl-coral transition-colors">
                  {post.title}
                </h2>
                <p className="text-wtl-muted text-sm leading-relaxed flex-grow mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t-2 border-wtl-warm">
                  <div className="flex items-center gap-2 text-xs text-wtl-muted font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                    <span>&bull;</span>
                    <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-wtl-coral group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
