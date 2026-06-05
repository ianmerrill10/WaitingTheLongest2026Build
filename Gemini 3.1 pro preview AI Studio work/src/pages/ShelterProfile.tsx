import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Shelter } from "@/lib/types";
import { getShelter } from "@/lib/api";
import { DogCard } from "@/components/DogCard";
import { Section } from "@/components/ui";
import { MapPin, Globe, ShieldCheck } from "lucide-react";

export function ShelterProfile() {
  const { id } = useParams<{ id: string }>();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getShelter(id)
        .then(setShelter)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!shelter) return <div className="min-h-screen flex items-center justify-center">Shelter not found.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Shelter Header */}
      <div className="bg-white border-b border-gray-200 pt-16 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{shelter.legal_name}</h1>
                {shelter.verification_tier !== "tier_0_self_asserted" && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-600" title="Verified Shelter">
                     <ShieldCheck className="w-5 h-5"/>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6 text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-5 h-5"/> {shelter.location.city}, {shelter.location.state}</span>
                <span className="capitalize border-l border-gray-300 pl-6">{shelter.org_type.replace('_', ' ')}</span>
                {shelter.website && (
                  <a href={shelter.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-teal-600 hover:underline border-l border-gray-300 pl-6">
                    <Globe className="w-5 h-5"/> Visit Website
                  </a>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center gap-8 text-center min-w-[250px] justify-center">
               <div>
                 <div className="text-3xl font-black text-gray-900">{shelter.active_listings}</div>
                 <div className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1">Dogs Listed</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dogs Grid */}
      <Section className="bg-gray-50">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dogs at {shelter.legal_name}</h2>
          <p className="text-gray-500 text-lg mt-1">Sorted by longest wait time.</p>
        </div>
        
        {shelter.dogs && shelter.dogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sort dogs by intake_age_days naturally */}
            {shelter.dogs.sort((a,b) => b.intake_age_days - a.intake_age_days).map(dog => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
             <p className="text-gray-500 text-lg">No dogs currently listed by this shelter.</p>
          </div>
        )}
      </Section>
    </div>
  );
}
