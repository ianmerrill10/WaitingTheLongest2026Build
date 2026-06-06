import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  ClipboardList,
  ArrowUpDown,
  Handshake,
  Mail,
  ArrowRight,
} from "lucide-react";

// ---- SEO Metadata ----

export const metadata: Metadata = {
  title: "About — WaitingTheLongest.com",
  description:
    "We surface the shelter dogs who have been waiting the longest for adoption. Learn how WaitingTheLongest.com works and how shelters can list their dogs for free.",
  openGraph: {
    title: "About — WaitingTheLongest.com",
    description:
      "We surface the shelter dogs who have been waiting the longest for adoption.",
    type: "website",
    url: "https://waitingthelongest.com/about",
  },
  twitter: {
    card: "summary",
    title: "About — WaitingTheLongest.com",
    description:
      "We surface the shelter dogs who have been waiting the longest for adoption.",
  },
};

// ---- Page Component ----

export default function AboutPage() {
  return (
    <div>
      {/* Mission Section */}
      <section className="bg-gradient-to-br from-wtl-cream via-white to-wtl-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-wtl-coral" />
            <span className="text-sm font-semibold text-wtl-coral uppercase tracking-wide">
              Our Mission
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-wtl-navy leading-tight mb-6">
            Every day a dog waits is a day too long
          </h1>

          <p className="text-lg md:text-xl text-wtl-muted leading-relaxed max-w-2xl mx-auto">
            WaitingTheLongest.com surfaces the shelter dogs who have been
            waiting longest for adoption &mdash; because they deserve to be seen
            first. The dogs who get overlooked, passed by, or simply lost in the
            shuffle are the ones who need the most visibility. We give it to
            them.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-wtl-navy mb-3">
              How It Works
            </h2>
            <p className="text-wtl-muted text-lg max-w-xl mx-auto">
              A simple system that puts the longest-waiting dogs in front of
              the people who can help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Shelters List Dogs */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 bg-wtl-sky/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <ClipboardList className="w-7 h-7 text-wtl-sky" />
              </div>
              <h3 className="font-display text-xl font-bold text-wtl-navy mb-3">
                Shelters List Dogs
              </h3>
              <p className="text-wtl-muted leading-relaxed">
                Shelters and rescues submit their longest-waiting dogs through
                our free Shelter Intake API. No cost, no catch &mdash; just
                more eyes on the dogs who need them.
              </p>
            </div>

            {/* Card 2: We Rank by Wait Time */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 bg-wtl-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <ArrowUpDown className="w-7 h-7 text-wtl-coral" />
              </div>
              <h3 className="font-display text-xl font-bold text-wtl-navy mb-3">
                We Rank by Wait Time
              </h3>
              <p className="text-wtl-muted leading-relaxed">
                Dogs are automatically ranked by how long they have been
                waiting. The longest-waiting dogs are always shown first. No
                algorithms, no pay-to-play &mdash; just time.
              </p>
            </div>

            {/* Card 3: You Find Your Match */}
            <div className="card p-8 text-center">
              <div className="w-14 h-14 bg-wtl-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Handshake className="w-7 h-7 text-wtl-sage" />
              </div>
              <h3 className="font-display text-xl font-bold text-wtl-navy mb-3">
                You Find Your Match
              </h3>
              <p className="text-wtl-muted leading-relaxed">
                Browse by breed, size, location, and more. When you find your
                dog, we connect you directly with the shelter. No middlemen,
                no fees &mdash; just a dog finding a home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Shelters CTA Section */}
      <section className="bg-wtl-cream py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 md:p-12 text-center">
            <h2 className="font-display text-3xl font-bold text-wtl-navy mb-4">
              Are you a shelter or rescue?
            </h2>
            <p className="text-wtl-muted text-lg leading-relaxed mb-6 max-w-xl mx-auto">
              List your longest-waiting dogs for free through our Shelter
              Intake API. It takes minutes to set up, and it gives your
              hardest-to-place animals the visibility they deserve.
            </p>
            <a
              href="mailto:shelters@waitingthelongest.com"
              className="btn-primary text-lg inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-wtl-sky" />
            <h2 className="font-display text-2xl font-bold text-wtl-navy">
              Get in Touch
            </h2>
          </div>
          <p className="text-wtl-muted leading-relaxed mb-4">
            Questions about listing your dogs, partnership opportunities, or
            just want to say hello? We would love to hear from you.
          </p>
          <a
            href="mailto:shelters@waitingthelongest.com"
            className="text-wtl-sky hover:text-wtl-coral transition-colors text-lg font-medium underline underline-offset-4"
          >
            shelters@waitingthelongest.com
          </a>
        </div>
      </section>

      {/* Final CTA — Browse dogs */}
      <section className="bg-wtl-cream py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-wtl-muted text-lg mb-4">
            Ready to meet the dogs who have been waiting the longest?
          </p>
          <Link
            href="/dogs?sort=days_waiting_desc"
            className="btn-primary text-lg inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Find Your Dog
          </Link>
        </div>
      </section>
    </div>
  );
}
