import Link from "next/link";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { DogCard } from "@/components/DogCard";
import { StatsBar } from "@/components/StatsBar";
import { getFeatured, getStats } from "@/lib/api";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  let stats = null;
  let featured = null;

  try {
    [stats, featured] = await Promise.all([getStats(), getFeatured()]);
  } catch {
    // API might not be running yet during development
  }

  return (
    <div>
      {/* Preview banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 text-center">
        <p className="text-sm text-amber-800 font-medium">
          🚧 This site is not live and not for public view. Data has not been verified. For internal preview only.
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative w-full bg-wtl-cream border-b-4 border-wtl-navy py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-wtl-gold text-wtl-navy font-display font-black uppercase tracking-widest px-4 py-2 mb-6 border-2 border-wtl-navy shadow-[4px_4px_0px_0px_rgba(9,9,11,1)]">
              <AlertTriangle className="w-4 h-4" />
              Urgent Crisis Directive
            </div>

            <h1 className="font-display font-black text-6xl sm:text-7xl md:text-8xl text-wtl-navy uppercase leading-[0.9] tracking-tighter mb-8">
              They are running<br />
              <span className="text-wtl-coral">out of time.</span>
            </h1>

            <p className="text-xl md:text-2xl text-wtl-navy font-medium mb-10 max-w-2xl leading-relaxed border-l-4 border-wtl-coral pl-6">
              Every second counts. We rank shelter dogs by the days they&apos;ve been forgotten.
              The ones at the top of this list are in immediate danger.{" "}
              <strong className="font-black">Stop scrolling. Start saving.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dogs?sort=days_waiting_desc" className="btn-primary text-lg px-8 py-4">
                View Most Urgent Dogs
              </Link>
              <Link href="/about" className="btn-secondary text-lg px-8 py-4">
                Learn How This Works
              </Link>
            </div>
          </div>
        </div>

        {/* Brutalist background element */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none flex items-center justify-end overflow-hidden">
          <span className="font-display font-black text-[20rem] leading-none text-wtl-navy -mr-20 select-none">
            00:00
          </span>
        </div>
      </section>

      {/* Stats Section */}
      {stats && <StatsBar stats={stats} />}

      {/* Longest Waiting Section */}
      {featured?.longest_waiting && featured.longest_waiting.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8 border-b-4 border-wtl-navy pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-wtl-coral" />
                <h2 className="font-display font-black text-3xl md:text-4xl text-wtl-navy uppercase tracking-tight">
                  Most Urgent
                </h2>
              </div>
              <p className="text-wtl-muted font-medium">
                These dogs have been waiting the longest. They need you now.
              </p>
            </div>
            <Link
              href="/dogs?sort=days_waiting_desc"
              className="hidden md:flex items-center gap-1 font-display font-bold uppercase tracking-widest text-sm text-wtl-coral hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.longest_waiting.slice(0, 6).map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/dogs?sort=days_waiting_desc" className="btn-primary">
              View All Dogs <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      {featured?.recently_added && featured.recently_added.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-wtl-navy">
                  Recently Added
                </h2>
                <p className="text-wtl-muted">
                  New arrivals looking for their forever home.
                </p>
              </div>
              <Link
                href="/dogs?sort=recently_added"
                className="hidden md:flex items-center gap-1 text-wtl-sky hover:text-wtl-coral transition-colors font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.recently_added.slice(0, 6).map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Shelter CTA Section */}
      <section className="border-t-4 border-wtl-navy bg-wtl-navy py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-wtl-gold text-wtl-navy font-display font-black uppercase tracking-widest px-4 py-1 mb-6 text-sm border-2 border-white/20">
            For Shelters &amp; Rescues
          </div>
          <h2 className="font-display font-black text-4xl md:text-5xl text-white uppercase mb-4">
            List your longest-waiting dogs. Free.
          </h2>
          <p className="text-white/70 mb-8 text-lg leading-relaxed">
            Help your hardest-to-place animals find homes faster. Our intake portal takes 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit" className="btn-primary text-lg px-8 py-4">
              Submit a Dog
            </Link>
            <a href="mailto:shelters@waitingthelongest.com" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-display font-bold uppercase tracking-widest hover:bg-white hover:text-wtl-navy transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Fallback when API is not connected */}
      {!stats && !featured && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Heart className="w-16 h-16 text-wtl-coral/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-wtl-navy mb-2">
            Coming Soon
          </h2>
          <p className="text-wtl-muted">
            We&apos;re connecting with shelters across the country. Check back
            soon to meet the dogs who have been waiting the longest.
          </p>
        </section>
      )}
    </div>
  );
}
