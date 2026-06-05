import React from "react";
import { Link } from "react-router-dom";
import { Dog } from "@/lib/types";
import { formatDaysWaiting, cn } from "@/lib/utils";
import { Clock, MapPin, Bone } from "lucide-react";

export function DogCard({ dog }: { dog: Dog; key?: React.Key }) {
  const daysText = formatDaysWaiting(dog.intake_age_days);
  const photo = dog.photo_urls[0] || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80"; // fallback photo

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={photo} 
          alt={dog.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* The prominent "Days Waiting" badge */}
        <div className="absolute top-3 left-3 bg-coral-500 text-white rounded-full px-3 py-1.5 font-bold shadow-sm flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span className="text-sm tracking-tight">{daysText}</span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{dog.name}</h3>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-sm uppercase tracking-wider">
            {dog.size}
          </span>
        </div>
        
        <div className="flex flex-col gap-1.5 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Bone className="w-4 h-4 text-teal-500" />
            <span className="line-clamp-1">
              {dog.primary_breed} {dog.is_mixed && "Mix"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-500" />
            <span className="line-clamp-1">
              {dog.location.city}, {dog.location.state} â€¢ {dog.organization.legal_name}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
          {dog.good_with_kids === "yes" && <Badge>Good w/ Kids</Badge>}
          {dog.good_with_dogs === "yes" && <Badge>Good w/ Dogs</Badge>}
          {dog.special_needs && <Badge className="bg-rose-50 text-rose-700">Special Needs</Badge>}
        </div>

        <Link 
          to={`/dogs/${dog.id}`}
          className="mt-4 w-full bg-gray-50 text-gray-900 border border-gray-200 font-semibold py-2.5 rounded-xl text-center hover:bg-gray-100 transition-colors"
        >
          Meet {dog.name}
        </Link>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-700", className)}>
      {children}
    </span>
  );
}
