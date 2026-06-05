import React from "react";
import { Section } from "@/components/ui";

export function About() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 py-16 md:py-24 border-b border-gray-200 text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Time is the only metric that matters.</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Most adoption platforms surface dogs based on breed popularity, "cuteness", or opaque algorithms. We believe the dogs who have waited the longest deserve the most visibility.
          </p>
        </div>
      </div>

      <Section>
        <div className="max-w-3xl mx-auto prose prose-lg prose-gray">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Every day, thousands of perfectly healthy, loving dogs sit in shelters while highly sought-after breeds get adopted within hours. These long-stay dogs often deteriorate in the high-stress shelter environment, making them even harder to adapt over time.
          </p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            WaitingTheLongest.com was built to flip the script. By forcing a default sort based purely on <strong>consecutive days waiting</strong>, we put the spotlight exactly where it's needed most.
          </p>

          <div className="bg-coral-50 rounded-2xl p-8 my-12 border border-coral-100">
            <h3 className="text-xl font-bold text-coral-900 mb-3">API-First Approach</h3>
            <p className="text-coral-800 leading-relaxed">
              We aren't just another listing site. We provide a free, open API for shelters to integrate their inventory systems directly. This ensures our data is accurate, real-time, and doesn't require shelter volunteers to do manual data entry.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-6">How it Works</h2>
          <ul className="space-y-4 text-gray-600 mb-8 list-disc pl-6 leading-relaxed">
            <li>Shelters push their dog data strictly through our Intake API.</li>
            <li>We calculate the `intake_age_days` from the moment they enter the shelter system.</li>
            <li>We rank dogs descending by this metric across the entire nation.</li>
            <li>Our verification tiers ensure you are adopting from reputable, active organizations.</li>
          </ul>
        </div>
      </Section>
    </div>
  );
}
