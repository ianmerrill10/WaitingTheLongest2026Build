import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Dog } from "@/lib/types";
import { getDog } from "@/lib/api";
import { formatDaysWaiting, cn } from "@/lib/utils";
import { Section, Button } from "@/components/ui";
import { ArrowLeft, Check, X, HelpCircle, MapPin, ExternalLink, Calendar, Info, Share2, Ruler } from "lucide-react";

export function DogDetail() {
  const { id } = useParams<{ id: string }>();
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getDog(id)
        .then(setDog)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading dog profile...</div>;
  }

  if (!dog) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Dog not found.</div>;
  }

  const daysText = formatDaysWaiting(dog.intake_age_days);
  const photo = dog.photo_urls[0] || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Top Banner / Photo */}
      <div className="w-full h-[50vh] md:h-[60vh] bg-gray-200 relative">
        <img 
          src={photo} 
          alt={dog.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-6 left-6 z-10">
          <Link to="/dogs" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto max-w-5xl">
             <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
               {dog.name}
             </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="md:col-span-2 space-y-8">
            {/* The Huge Stats Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 justify-between">
              <div>
                <p className="text-gray-500 font-medium uppercase tracking-widest text-sm mb-2">Waiting To Be Adopted</p>
                <div className="text-5xl md:text-6xl font-black text-coral-500 tracking-tighter">
                  {dog.intake_age_days} <span className="text-3xl text-coral-400">days</span>
                </div>
                {dog.intake_age_days >= 365 && (
                  <p className="text-coral-600 font-semibold mt-2 text-lg">({daysText})</p>
                )}
              </div>
              <div className="hidden md:block w-px h-24 bg-gray-100"></div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                 {dog.listing_url ? (
                   <a href={dog.listing_url} target="_blank" rel="noreferrer" className="w-full text-center bg-coral-500 text-white font-bold py-4 px-8 rounded-xl hover:bg-coral-600 transition shadow-sm text-lg block">
                     Apply to Adopt
                   </a>
                 ) : (
                   <Button size="lg" className="w-full text-lg">Contact Shelter</Button>
                 )}
                 <Button variant="outline" className="w-full gap-2">
                   <Share2 className="w-5 h-5"/> Share Profile
                 </Button>
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">About {dog.name}</h2>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                  <InfoItem icon={<Info/>} label="Breed" value={`${dog.primary_breed} ${dog.is_mixed ? 'Mix' : ''}`}/>
                  <InfoItem icon={<Calendar/>} label="Age" value={dog.age_months ? `${Math.floor(dog.age_months/12)}y ${dog.age_months%12}m` : 'Unknown'}/>
                  <InfoItem icon={<Ruler/>} label="Size & Weight" value={`${dog.size.toUpperCase()} â€¢ ${dog.weight_kg ? dog.weight_kg + 'kg' : 'Unknown'}`}/>
                  <InfoItem icon={<Info/>} label="Sex" value={<span className="capitalize">{dog.sex}</span>}/>
                  <InfoItem icon={<Info/>} label="Altered" value={<span className="capitalize">{dog.altered}</span>}/>
                  {dog.adoption_fee !== null && <InfoItem icon={<Info/>} label="Adoption Fee" value={`$${dog.adoption_fee}`}/>}
               </div>

               <div className="border-t border-gray-100 pt-8">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Good With...</h3>
                 <div className="flex flex-wrap gap-4">
                   <GoodWithBadge type="Kids" status={dog.good_with_kids} />
                   <GoodWithBadge type="Dogs" status={dog.good_with_dogs} />
                   <GoodWithBadge type="Cats" status={dog.good_with_cats} />
                   {dog.special_needs && (
                     <span className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-medium border border-rose-100">
                       <Info className="w-5 h-5"/> Special Needs
                     </span>
                   )}
                 </div>
               </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Their Story</h2>
               <div className="prose prose-gray max-w-none text-lg text-gray-600 leading-relaxed font-medium">
                 {dog.description ? (
                   <p>{dog.description}</p>
                 ) : (
                   <p className="italic">The shelter hasn't provided a detailed description yet, but don't let that stop you from reaching out! Every dog has a unique personality waiting to be discovered.</p>
                 )}
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Shelter Information</h3>
              <div className="flex items-start gap-4 mb-6">
                 <div className="bg-teal-50 text-teal-600 p-3 rounded-xl">
                   <MapPin className="w-6 h-6"/>
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1">{dog.organization.legal_name}</h4>
                   <p className="text-gray-500">{dog.location.city}, {dog.location.state} {dog.location.postal_code}</p>
                 </div>
              </div>

               <div className="space-y-3">
                 <Link to={`/shelters/${dog.organization.id}`}>
                   <Button variant="outline" className="w-full">View Shelter Profile</Button>
                 </Link>
                 {dog.organization.verification_tier !== "tier_0_self_asserted" && (
                   <div className="flex items-center gap-2 justify-center text-sm font-medium text-teal-600 bg-teal-50 py-2 rounded-lg mt-4">
                     <Check className="w-4 h-4"/> Verified Partner
                   </div>
                 )}
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
        {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })} {label}
      </div>
      <div className="font-semibold text-gray-900 text-lg">{value}</div>
    </div>
  );
}

function GoodWithBadge({ type, status }: { type: string, status: "yes" | "no" | "unknown" }) {
  const styles = {
    yes: "bg-teal-50 text-teal-700 border-teal-100",
    no: "bg-rose-50 text-rose-700 border-rose-100",
    unknown: "bg-gray-50 text-gray-600 border-gray-200"
  };
  
  const icons = {
    yes: <Check className="w-4 h-4"/>,
    no: <X className="w-4 h-4"/>,
    unknown: <HelpCircle className="w-4 h-4"/>
  };

  return (
    <span className={cn("flex items-center gap-2 px-4 py-2 rounded-xl font-medium border", styles[status])}>
      {icons[status]} {type}
    </span>
  );
}
