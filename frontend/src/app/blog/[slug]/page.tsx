import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { BLOG_POSTS } from "../_data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — WaitingTheLongest.com`,
    description: post.excerpt,
  };
}

const POST_CONTENT: Record<string, string> = {
  "black-dog-syndrome": `Black Dog Syndrome is one of the most documented — and most heartbreaking — phenomena in American animal sheltering. Study after study confirms it: dogs with black or very dark coats are adopted at significantly lower rates, sit in shelters longer, and are euthanized at higher rates than their lighter-colored counterparts.

The cause, when you look at it squarely, is almost embarrassingly mundane: photography.

Black dogs are harder to photograph. Their facial features get lost against dark fur. Their eyes don't catch the light. In the thumbnail-driven world of online adoption galleries, a black dog looks like a shadow when placed next to a golden retriever.

**The numbers are stark.** Research published by the National Canine Research Council found that black dogs spent an average of 4 days longer in shelters than dogs of other colors. In high-volume shelters where space is limited, 4 extra days can be the difference between life and death.

**It's not about temperament.** Shelter workers consistently report that black dogs are among their most affectionate, biddable, and personality-rich animals. The color of a dog's coat has zero correlation with their suitability as a pet. What it does affect is click-through rates on an adoption website.

**What you can do.** The next time you're browsing dog profiles and a dark-coated dog shows up looking like a silhouette, click on it anyway. Read the description. Look at the wait time. That dog has probably been waiting longer than anything else in the results.

WaitingTheLongest.com surfaces black dogs prominently precisely because of this bias. When you sort by wait time, they rise to the top — not because of their color, but because of how long the system has failed them.`,

  "why-adult-dogs-wait-longer": `Walk into any shelter in America and ask a staff member which dogs they worry most about. The answer is almost never a puppy.

Adult dogs — typically defined as anything over 2 years old — wait three to four times longer than puppies for adoption. Senior dogs, those over 7, often wait indefinitely. In shelters with limited space, indefinitely means euthanasia.

**The irony is brutal.** Adult dogs have everything that makes a good pet:

- House training is either complete or happens within days, not months
- The destructive puppy phase — chewing furniture, manic energy at 2 AM — is over
- Their personality is fully formed. What you see is what you get
- They sleep. A lot. Perfect for working households
- They bond deeply and quickly, especially adults who came from loving homes and know what they've lost

**So why do people choose puppies?** The honest answer is that puppies are marketed better. Shelters put their best photography resources into puppy litters. Puppy content goes viral. Adult dogs in kennel photos look exhausted and scared — because they are.

**The intake-date reality.** When an adult dog arrives at a shelter after being surrendered by a family they lived with for 5 years, they go through a grief response that is clinically documented. They stop eating. They lose weight. They pace. In a kennel photo taken two weeks after surrender, they look depressed — because they are depressed. But that dog, in a home environment, is often one of the easiest, most loving animals you'll ever share a couch with.

WaitingTheLongest.com is explicitly built around this problem. We don't show you what's newest. We show you what's been forgotten the longest. Most of the dogs at the top of our list are adults. That's not a coincidence.`,

  "pit-bull-wait-times": `Pit bull type dogs — a catch-all term that shelters use to describe American Pit Bull Terriers, American Staffordshire Terriers, Staffordshire Bull Terriers, and mixes that share physical characteristics with these breeds — make up approximately 20-30% of all dogs in American shelters.

Their average wait time is the longest of any breed category. In many municipalities, breed-specific legislation (BSL) means they cannot legally live in certain cities, counties, or rental properties — dramatically shrinking their potential adoption pool.

**What the data actually shows about temperament.** The American Veterinary Medical Association (AVMA) has repeatedly stated that breed is a poor predictor of individual dog behavior and that temperament testing of individual animals is far more reliable than breed profiling. The ASPCA, the American Kennel Club, and the National Canine Research Council agree.

The American Temperament Test Society, which has tested over 35,000 dogs across 9 decades, shows pit bull type dogs consistently outperforming many breeds considered "family-friendly" in passing rates.

**The insurance and housing problem.** Even adopters who want a pit bull often can't get one. Homeowner's and renter's insurance policies frequently exclude coverage if certain breeds are in the household. Rental leases commonly prohibit them. This is not based on actuarial data — there is none — but on liability mythology that has persisted for 40 years.

**What this means in practice.** A pit bull type dog in a shelter in a major metro area may face: BSL in the city preventing adoption, insurance exclusions eliminating homeowners, and landlord bans eliminating renters. The population of eligible adopters shrinks to rural homeowners. Wait times of 400, 500, 600+ days are not unusual.

These are the dogs at the very top of WaitingTheLongest's list. They are waiting for someone who has a yard, owns their home, and lives in a BSL-free municipality. If that's you — they are waiting for you specifically.`,

  "senior-dogs-deserve-homes": `A dog who has spent 8 years in a home, sleeping in the same spot on the couch, learning the sound of their owner's car, knowing exactly when dinner happens — and then arrives at a shelter at age 10 — knows precisely what it has lost.

Senior dogs in shelters don't act confused. They act bereaved.

**The numbers.** Senior dogs, those 7 years and older, have average shelter stays that are four to six times longer than dogs under 2. Many are never adopted. They live out their remaining years in a 6x8 concrete kennel, with staff who love them but cannot give them what they need: a couch, a yard, a person.

**The heartbreaking reality of surrenders.** The most common reason for a senior dog surrender is not behavior. It's life circumstances: an owner's death or disability, a move to assisted living, a housing situation that no longer accommodates a pet. These dogs are not problem animals. They are victims of human circumstance.

**The medical cost myth.** The most common objection to adopting a senior dog is veterinary cost. This is sometimes real, but it's often overstated. Many seniors are in excellent health. And many shelters offer reduced adoption fees and health guarantees for senior dogs specifically to address this barrier.

**What you actually get.** Senior dogs sleep 16-18 hours a day. They don't need 3-hour runs. They want a warm spot, consistent company, and to know they are safe. The return on that investment — measured in daily gratitude, unwavering loyalty, the particular kind of companionship only a dog who has lived a full life can give — is immeasurable.

If you have ever lost a dog and thought "I can't go through that again" — a senior dog is not for you. But if you have ever thought "I wish someone had been there for them at the end" — a senior dog is exactly for you.`,

  "how-shelter-wait-time-works": `When the public hears "long-wait dog," most people think 30 days. When shelter workers hear it, many think 90. When you look at what WaitingTheLongest.com tracks, you find dogs who have been in the system for 400, 600, 800 days.

Understanding why requires understanding how shelter intake actually works.

**Day 1-3: Stray hold.** Most jurisdictions require shelters to hold stray animals for 3-5 business days before they can be made available for adoption. This gives owners time to reclaim lost pets.

**Day 3-14: Medical intake.** After the stray hold, dogs go through veterinary examination, vaccinations, spay/neuter scheduling, and behavioral assessment. Many shelters don't list dogs as "available" until this process is complete.

**Day 14+: Available for adoption.** The dog goes onto the adoption floor and onto the website. This is when the clock most people are counting starts. But the dog has already been in the system for two weeks.

**The invisible population.** Some dogs never make it to the website at all. They're in medical holds, behavioral modification programs, or rescue partner pipelines. The dogs you see publicly available are the ones the shelter has assessed as immediately adoptable.

**Why some dogs don't move.** Once a dog is publicly available, why does one get adopted in 2 days while another waits 200? The variables include: photo quality, listing description, breed popularity, size, coat color, age, whether the shelter has enough kennel space to give the dog adequate exercise time, whether the dog is listed on multiple platforms, whether a volunteer has taken the time to write a compelling profile.

None of these variables have anything to do with whether the dog is a good dog.

**The 90-day crisis.** Research suggests that after 90 days in a shelter, dogs begin showing measurable behavioral changes from the stress of confinement: increased anxiety, reactivity, kennel cough from stress-induced immune suppression. These changes can make them look less adoptable in behavioral assessments — creating a feedback loop where the stress of not being adopted makes them look less adoptable.

WaitingTheLongest.com starts the counter from intake date, not available-for-adoption date, because the dog's wait began the moment they entered the system.`,

  "decompression-period": `The 3-3-3 rule was developed by experienced rescue volunteers to set realistic expectations for new adopters. It works like this:

**The first 3 days:** Overwhelm. Your new dog is in a completely unknown environment. They don't know the rules, the routine, the smells, where the water bowl is, or whether you're safe. Many dogs will not eat or drink for the first 24-48 hours. Some will hide. Some will be hyperactive. This is not who they are — this is an animal in acute stress.

What to do: Give them a single safe space. A crate with familiar smells, or a single room. Don't overwhelm them with guests. Don't take them to the dog park. Let them decompress.

**The first 3 weeks:** Learning. Your dog starts to understand the schedule. When you wake up, when they eat, when walks happen. They begin to relax. Their personality starts to emerge. You'll see moments of the dog they actually are — and then they'll retreat again into caution. This is normal.

What to do: Consistency above everything. Same wake time, same feeding time, same walk routes. Predictability is safety for a dog coming out of shelter stress.

**The first 3 months:** Home. By month three, a previously shelter-stressed dog is typically fully settled. This is when you see who you actually adopted. The anxiety behaviors from the shelter — door-bolting, resource guarding, reactivity on leash — often resolve entirely once a dog feels genuinely secure.

**For long-wait dogs, extend the timeline.** A dog who has been in a shelter for 500 days has been operating in survival mode for a very long time. Their nervous system has been trained by that environment. Give them 3-3-6: three days, three weeks, six months. The payoff is enormous.

**The single most important thing.** Don't evaluate the adoption in the first 30 days. Don't evaluate it in the first 60. Every rescue professional will tell you: the dog you have at 90 days is not the dog you had at 10 days. That 90-day dog is the one you actually adopted.`,
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const content = POST_CONTENT[slug];

  return (
    <div className="bg-wtl-cream min-h-screen">
      {/* Back nav */}
      <div className="border-b-4 border-wtl-navy bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link href="/blog" className="inline-flex items-center gap-2 font-display font-bold uppercase tracking-widest text-sm text-wtl-muted hover:text-wtl-coral transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Stories
          </Link>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-display font-black uppercase tracking-widest text-xs px-2 py-1 border-2 border-wtl-navy bg-white">
              {post.category}
            </span>
            <div className="flex items-center gap-2 text-xs text-wtl-muted font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
              <span>&bull;</span>
              <span>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl text-wtl-navy uppercase leading-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          {content ? (
            content.split("\n\n").map((para, i) => {
              if (para.startsWith("**") && para.endsWith("**")) {
                return (
                  <h3 key={i} className="font-display font-black text-2xl text-wtl-navy uppercase mt-8 mb-3 border-l-4 border-wtl-coral pl-4">
                    {para.replace(/\*\*/g, "")}
                  </h3>
                );
              }
              if (para.includes("**")) {
                return (
                  <p key={i} className="text-wtl-navy leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{
                      __html: para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    }}
                  />
                );
              }
              if (para.startsWith("- ")) {
                const items = para.split("\n").filter(l => l.startsWith("- "));
                return (
                  <ul key={i} className="list-none space-y-2 mb-4 border-l-4 border-wtl-warm pl-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-wtl-navy">
                        <span className="text-wtl-coral font-bold mr-2">—</span>
                        {item.replace("- ", "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} className="text-wtl-navy leading-relaxed mb-4">{para}</p>;
            })
          ) : (
            <p className="text-wtl-muted">Full article coming soon.</p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 border-4 border-wtl-navy p-8">
          <h3 className="font-display font-black text-2xl text-wtl-navy uppercase mb-2">
            Find a Dog Who&apos;s Been Waiting Too Long
          </h3>
          <p className="text-wtl-muted mb-6">
            The dogs in this article are real. They&apos;re on our platform right now, waiting.
          </p>
          <Link href="/dogs?sort=days_waiting_desc" className="btn-primary">
            View Most Urgent Dogs
          </Link>
        </div>
      </div>
    </div>
  );
}
