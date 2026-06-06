import Link from "next/link";
import { Heart, Clock, ArrowRight, Search } from "lucide-react";
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wtl-cream via-white to-wtl-warm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-wtl-coral" />
              <span className="text-sm font-semibold text-wtl-coral uppercase tracking-wide">
                Every Day Counts
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-wtl-navy leading-tight mb-6">
              Meet the dogs who have been{" "}
              <span className="text-wtl-coral">waiting the longest</span>
            </h1>

            <p className="text-lg text-wtl-muted leading-relaxed mb-8 max-w-2xl">
              Every dog deserves a home. We surface the shelter dogs who have
              been overlooked the longest, so you can give a second chance to
              the ones who need it most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dogs?sort=days_waiting_desc" className="btn-primary text-lg px-8 py-4">
                <Search className="w-5 h-5 mr-2" />
                Find Your Dog
              </Link>
              <Link href="/about" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-wtl-coral/5 rounded-full blur-3xl" />
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <StatsBar stats={stats} />
        </section>
      )}

      {/* Longest Waiting Section */}
      {featured?.longest_waiting && featured.longest_waiting.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-wtl-coral" />
                <h2 className="font-display text-2xl md:text-3xl font-bold text-wtl-navy">
                  Waiting the Longest
                </h2>
              </div>
              <p className="text-wtl-muted">
                These dogs have been in shelters the longest. They need you.
              </p>
            </div>
            <Link
              href="/dogs?sort=days_waiting_desc"
              className="hidden md:flex items-center gap-1 text-wtl-sky hover:text-wtl-coral transition-colors font-medium"
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

      {/* CTA Section */}
      <section className="bg-wtl-cream py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-wtl-navy mb-4">
            Are you a shelter or rescue?
          </h2>
          <p className="text-wtl-muted mb-8 leading-relaxed">
            List your longest-waiting dogs for free through our Shelter Intake
            API. Help your hardest-to-place animals find homes faster.
          </p>
          <a
            href="mailto:shelters@waitingthelongest.com"
            className="btn-primary text-lg"
          >
            Get Started
          </a>
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
