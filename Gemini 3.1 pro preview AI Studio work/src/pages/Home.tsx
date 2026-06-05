import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dog, PlatformStats } from "@/lib/types";
import { getFeatured, getStats } from "@/lib/api";
import { DogCard } from "@/components/DogCard";
import { Section, Button } from "@/components/ui";
import { ArrowRight, BarChart3, Clock, Heart } from "lucide-react";

export function Home() {
  const [featured, setFeatured] = useState<Dog[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    getFeatured().then(setFeatured);
    getStats().then(setStats);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 relative z-10 max-w-5xl text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-teal-50 text-teal-700 font-semibold tracking-wide text-sm mb-6">
            Connecting Adopters with Overlooked Dogs
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Meet the dogs who've been <span className="text-coral-500">waiting the longest.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Shelters across the country submit their adoptable dogs. We rank them purely by days waiting. The longer the wait, the higher they appear.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/dogs">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Find a Dog
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      {stats && (
        <section className="bg-white border-b border-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
              <div className="text-center px-4">
                <p className="text-sm font-medium tracking-wide text-gray-500 uppercase mb-1">Total Dogs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_dogs.toLocaleString()}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium tracking-wide text-gray-500 uppercase mb-1">Shelters</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_shelters.toLocaleString()}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium tracking-wide text-gray-500 uppercase mb-1">Adopted This Month</p>
                <p className="text-3xl font-bold text-gray-900">{stats.adoptions_this_month.toLocaleString()}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium tracking-wide text-gray-500 uppercase mb-1">Longest Wait</p>
                <p className="text-3xl font-bold text-coral-500">{stats.longest_wait_days} Days</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Dogs Sector */}
      <Section className="bg-gray-50">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Longest Waiting Right Now</h2>
            <p className="text-gray-500 text-lg">These dogs have been waiting months, or even years, for a home.</p>
          </div>
          <Link to="/dogs" className="hidden md:flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 hover:underline">
            View All Dogs <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
        
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(dog => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <span className="text-gray-400">Loading dogs...</span>
          </div>
        )}
        
        <div className="mt-10 md:hidden">
          <Link to="/dogs">
            <Button variant="outline" className="w-full">View All Dogs</Button>
          </Link>
        </div>
      </Section>

      {/* How it Works */}
      <Section className="bg-white">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">A radically simple concept.</h2>
          <p className="text-xl text-gray-500">We don't use algorithms to show you the "cutest" dogs. We use time.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 text-teal-500">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Shelters Submit</h3>
            <p className="text-gray-500 leading-relaxed">
              Shelters and rescues automatically import their hardest-to-place dogs using our free, open API.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-coral-50 flex items-center justify-center mb-6 text-coral-500">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. We Rank By Time</h3>
            <p className="text-gray-500 leading-relaxed">
              Every dog is ordered by one transparent metric: how many consecutive days they've been waiting for a home.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 text-amber-500">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. You Adopt</h3>
            <p className="text-gray-500 leading-relaxed">
              You browse, fall in love, and give a dog the second chance they've been patiently waiting for.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
