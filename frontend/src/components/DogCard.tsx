"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, ShieldAlert } from "lucide-react";
import type { DogSummary } from "@/lib/api";
import {
  formatWaitTime,
  formatAge,
  formatSize,
  getWaitBadgeColor,
  formatCurrency,
  PLACEHOLDER_DOG_IMAGE,
} from "@/lib/utils";

interface DogCardProps {
  dog: DogSummary;
}

export function DogCard({ dog }: DogCardProps) {
  const waitBadgeColor = getWaitBadgeColor(dog.days_waiting);
  const isUrgent = dog.days_waiting >= 365;

  return (
    <Link href={`/dogs/${dog.id}`} className="card flex flex-col group block">
      {/* Unmissable wait time header */}
      <div className={`p-3 border-b-2 border-wtl-navy flex items-center justify-between ${isUrgent ? "bg-wtl-coral text-white" : "bg-wtl-navy text-white"}`}>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <span className="font-display font-black text-lg uppercase tracking-widest leading-none">
            {formatWaitTime(dog.days_waiting)}
          </span>
        </div>
        {dog.special_needs && <ShieldAlert className="w-5 h-5 text-wtl-gold flex-shrink-0" />}
      </div>

      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-wtl-warm border-b-2 border-wtl-navy">
        {dog.primary_photo_url ? (
          <Image
            src={dog.primary_photo_url}
            alt={`Photo of ${dog.name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image src={PLACEHOLDER_DOG_IMAGE} alt="No photo" fill className="object-cover opacity-20" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span className="badge text-[10px]">{formatSize(dog.size)}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        <div className="mb-3">
          <h3 className="font-display font-black text-3xl text-wtl-navy uppercase leading-none mb-1 group-hover:text-wtl-coral transition-colors">
            {dog.name}
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest text-wtl-muted">
            {dog.primary_breed}{dog.is_mixed ? " Mix" : ""} &bull; {formatAge(dog.age_months)}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-wtl-navy mb-3">
          <MapPin className="w-3.5 h-3.5 text-wtl-coral flex-shrink-0" />
          <span className="truncate font-medium">{dog.location_city}, {dog.location_state}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {dog.good_with_dogs === "yes" && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 bg-wtl-warm text-wtl-navy border border-wtl-navy">Dogs OK</span>
          )}
          {dog.good_with_cats === "yes" && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 bg-wtl-warm text-wtl-navy border border-wtl-navy">Cats OK</span>
          )}
          {dog.good_with_kids === "yes" && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 bg-wtl-warm text-wtl-navy border border-wtl-navy">Kids OK</span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t-2 border-wtl-warm flex items-center justify-between">
          {dog.adoption_fee !== null && (
            <span className="font-display font-black text-xl text-wtl-navy">
              {formatCurrency(dog.adoption_fee)}
            </span>
          )}
          <span className="font-display font-bold text-xs uppercase tracking-widest text-wtl-coral border-b-2 border-wtl-coral">
            View &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
