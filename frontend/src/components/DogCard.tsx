"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Heart } from "lucide-react";
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

  return (
    <Link href={`/dogs/${dog.id}`} className="card overflow-hidden group block">
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {dog.primary_photo_url ? (
          <Image
            src={dog.primary_photo_url}
            alt={`Photo of ${dog.name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-wtl-warm">
            <Heart className="w-12 h-12 text-wtl-muted/30" />
          </div>
        )}

        {/* Days waiting badge */}
        <div className={`absolute top-3 left-3 badge ${waitBadgeColor}`}>
          <Clock className="w-3 h-3 mr-1" />
          {formatWaitTime(dog.days_waiting)}
        </div>

        {/* Special needs badge */}
        {dog.special_needs && (
          <div className="absolute top-3 right-3 badge bg-purple-100 text-purple-800">
            Special Needs
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-display text-lg font-bold text-wtl-navy group-hover:text-wtl-coral transition-colors">
            {dog.name}
          </h3>
          {dog.adoption_fee !== null && (
            <span className="text-sm font-semibold text-wtl-sage">
              {formatCurrency(dog.adoption_fee)}
            </span>
          )}
        </div>

        <p className="text-sm text-wtl-muted mb-2">
          {dog.primary_breed}
          {dog.is_mixed ? " Mix" : ""}
          {" · "}
          {formatAge(dog.age_months)}
          {" · "}
          {formatSize(dog.size)}
        </p>

        <div className="flex items-center gap-1 text-xs text-wtl-muted">
          <MapPin className="w-3 h-3" />
          <span>
            {dog.location_city}, {dog.location_state}
          </span>
          <span className="mx-1">·</span>
          <span>{dog.shelter_name}</span>
        </div>

        {/* Compatibility icons */}
        <div className="flex gap-3 mt-3 text-xs">
          {dog.good_with_dogs === "yes" && (
            <span className="text-wtl-sage">Dogs OK</span>
          )}
          {dog.good_with_cats === "yes" && (
            <span className="text-wtl-sage">Cats OK</span>
          )}
          {dog.good_with_kids === "yes" && (
            <span className="text-wtl-sage">Kids OK</span>
          )}
        </div>
      </div>
    </Link>
  );
}
