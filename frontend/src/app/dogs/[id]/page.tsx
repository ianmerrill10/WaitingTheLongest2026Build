import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Clock,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Dog,
  Scale,
  Scissors,
  Calendar,
} from "lucide-react";
import { getDog, type DogDetail } from "@/lib/api";
import {
  formatWaitTime,
  formatAge,
  formatSize,
  formatSex,
  formatCompatibility,
  getWaitBadgeColor,
  formatCurrency,
  PLACEHOLDER_DOG_IMAGE,
} from "@/lib/utils";
import { WaitCounter } from "@/components/WaitCounter";
import { ShareKit } from "@/components/ShareKit";
import { AffiliateBlock } from "@/components/AffiliateBlock";

export const revalidate = 60; // ISR: revalidate every 60 seconds

// ---------------------------------------------------------------------------
// SEO metadata
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const dog = await getDog(id);

    const description = dog.description
      ? dog.description.slice(0, 160)
      : `Meet ${dog.name}, a ${formatAge(dog.age_months)} old ${dog.primary_breed} waiting for a forever home.`;

    return {
      title: `${dog.name} — WaitingTheLongest.com`,
      description,
      openGraph: {
        title: `${dog.name} — WaitingTheLongest.com`,
        description,
        images: dog.primary_photo_url ? [dog.primary_photo_url] : [],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${dog.name} — WaitingTheLongest.com`,
        description,
      },
    };
  } catch {
    return { title: "Dog Not Found — WaitingTheLongest.com" };
  }
}

// ---------------------------------------------------------------------------
// Photo Gallery (client island for thumbnail selection)
// ---------------------------------------------------------------------------

function PhotoGallery({ dog }: { dog: DogDetail }) {
  // Combine primary photo with the photo_urls array, deduplicating
  const allPhotos: string[] = [];
  if (dog.primary_photo_url) allPhotos.push(dog.primary_photo_url);
  for (const url of dog.photo_urls) {
    if (!allPhotos.includes(url)) allPhotos.push(url);
  }

  if (allPhotos.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-wtl-warm flex items-center justify-center">
        <Heart className="w-20 h-20 text-wtl-muted/20" />
      </div>
    );
  }

  // Server-rendered: show main photo + thumbnail strip.
  // For client-side gallery interactivity a future "use client" wrapper can
  // be added; keeping it simple for v1.
  return (
    <div className="space-y-3">
      {/* Main photo */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={allPhotos[0]}
          alt={`Photo of ${dog.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail strip — only when there are multiple photos */}
      {allPhotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allPhotos.map((url, i) => (
            <div
              key={url}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                i === 0 ? "border-wtl-coral" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={url}
                alt={`${dog.name} photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compatibility row helper
// ---------------------------------------------------------------------------

function CompatRow({ label, value }: { label: string; value: string }) {
  const formatted = formatCompatibility(value);

  let dotColor = "bg-gray-300";
  if (value === "yes") dotColor = "bg-wtl-sage";
  if (value === "no") dotColor = "bg-red-400";

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-wtl-muted text-sm">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-wtl-navy">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        {formatted}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-wtl-muted flex-shrink-0" />
      <span className="text-sm text-wtl-muted">{label}</span>
      <span className="ml-auto text-sm font-medium text-wtl-navy">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function DogDetailPage({ params }: PageProps) {
  const { id } = await params;

  let dog: DogDetail;
  try {
    dog = await getDog(id);
  } catch {
    notFound();
  }

  const waitBadgeColor = getWaitBadgeColor(dog.days_waiting);
  const breedDisplay = `${dog.primary_breed}${dog.secondary_breed ? ` / ${dog.secondary_breed}` : ""}${dog.is_mixed ? " Mix" : ""}`;
  const externalUrl = dog.listing_url || dog.shelter_website || null;

  // Format intake date for display
  const intakeDateDisplay = dog.intake_date
    ? new Date(dog.intake_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Format weight
  const weightDisplay = dog.weight_kg
    ? `${Math.round(dog.weight_kg * 2.205)} lbs (${dog.weight_kg} kg)`
    : null;

  // Format altered status
  const alteredDisplay: Record<string, string> = {
    yes: "Spayed/Neutered",
    no: "Not Altered",
    unknown: "Unknown",
  };

  // Format coat length
  const coatDisplay: Record<string, string> = {
    short: "Short",
    medium: "Medium",
    long: "Long",
    wire: "Wire",
    hairless: "Hairless",
    curly: "Curly",
  };

  // Format intake type
  const intakeTypeDisplay: Record<string, string> = {
    stray: "Stray",
    surrender: "Owner Surrender",
    transfer: "Transfer",
    return: "Return",
    confiscation: "Confiscation",
    born_in_care: "Born in Care",
  };

  return (
    <div className="bg-wtl-cream min-h-screen">
      {/* Back navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/dogs"
          className="inline-flex items-center gap-1.5 text-sm text-wtl-muted hover:text-wtl-coral transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all dogs
        </Link>
      </div>

      {/* Main content: two-column layout on desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* ---- Left column: Photo gallery (sticky on desktop) ---- */}
          <div className="lg:sticky lg:top-6 lg:self-start mb-8 lg:mb-0">
            <PhotoGallery dog={dog} />
          </div>

          {/* ---- Right column: Info ---- */}
          <div>
            {/* Name + breed headline */}
            <div className="mb-4">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-wtl-navy mb-1">
                {dog.name}
              </h1>
              <p className="text-lg text-wtl-muted">{breedDisplay}</p>
            </div>

            {/* Live wait counter — replaces static badge */}
            {dog.intake_date ? (
              <WaitCounter intakeDate={dog.intake_date} size="large" className="mb-6" />
            ) : (
              <div className="mb-6">
                <span className={`badge ${waitBadgeColor} text-sm`}>
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Waiting {formatWaitTime(dog.days_waiting)}
                </span>
              </div>
            )}

            {/* Key stats row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Days waiting badge (fallback for cards without intake_date) */}
              {!dog.intake_date && (
              <span className={`badge ${waitBadgeColor} text-sm`}>
                <Clock className="w-3.5 h-3.5 mr-1" />
                Waiting {formatWaitTime(dog.days_waiting)}
              </span>
              )}

              {/* Age */}
              <span className="badge bg-gray-100 text-gray-700 text-sm">
                {formatAge(dog.age_months)}
              </span>

              {/* Size */}
              <span className="badge bg-gray-100 text-gray-700 text-sm">
                {formatSize(dog.size)}
              </span>

              {/* Sex */}
              <span className="badge bg-gray-100 text-gray-700 text-sm">
                {formatSex(dog.sex)}
              </span>

              {/* Special needs */}
              {dog.special_needs && (
                <span className="badge bg-purple-100 text-purple-800 text-sm">
                  Special Needs
                </span>
              )}
            </div>

            {/* Adoption fee */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-wtl-muted mb-0.5">Adoption Fee</p>
                  <p className="text-2xl font-bold text-wtl-navy">
                    {formatCurrency(dog.adoption_fee)}
                  </p>
                </div>
                {externalUrl && (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Visit Shelter Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            {dog.description && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                <h2 className="font-display text-lg font-bold text-wtl-navy mb-3">
                  About {dog.name}
                </h2>
                <div className="text-sm text-wtl-navy/80 leading-relaxed whitespace-pre-line">
                  {dog.description}
                </div>
              </div>
            )}

            {/* Compatibility */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <h2 className="font-display text-lg font-bold text-wtl-navy mb-2">
                Compatibility
              </h2>
              <div className="divide-y divide-gray-100">
                <CompatRow label="Good with Dogs" value={dog.good_with_dogs} />
                <CompatRow label="Good with Cats" value={dog.good_with_cats} />
                <CompatRow label="Good with Kids" value={dog.good_with_kids} />
              </div>
            </div>

            {/* Physical Details */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <h2 className="font-display text-lg font-bold text-wtl-navy mb-2">
                Details
              </h2>
              <div className="divide-y divide-gray-100">
                <DetailRow icon={Dog} label="Breed" value={breedDisplay} />
                <DetailRow icon={Dog} label="Size" value={formatSize(dog.size)} />
                <DetailRow
                  icon={Scale}
                  label="Weight"
                  value={weightDisplay}
                />
                <DetailRow
                  icon={Dog}
                  label="Coat"
                  value={coatDisplay[dog.coat_length ?? ""] || dog.coat_length}
                />
                <DetailRow icon={Dog} label="Color" value={dog.primary_color} />
                <DetailRow
                  icon={Scissors}
                  label="Altered"
                  value={alteredDisplay[dog.altered ?? ""] || dog.altered}
                />
                <DetailRow icon={Dog} label="Sex" value={formatSex(dog.sex)} />
              </div>
            </div>

            {/* Intake Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <h2 className="font-display text-lg font-bold text-wtl-navy mb-2">
                Intake Information
              </h2>
              <div className="divide-y divide-gray-100">
                <DetailRow
                  icon={Calendar}
                  label="Intake Date"
                  value={intakeDateDisplay}
                />
                <DetailRow
                  icon={Calendar}
                  label="Intake Type"
                  value={
                    intakeTypeDisplay[dog.intake_type ?? ""] || dog.intake_type
                  }
                />
              </div>
            </div>

            {/* Location + Shelter */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
              <h2 className="font-display text-lg font-bold text-wtl-navy mb-3">
                Location
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-wtl-coral flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-wtl-navy">
                    {dog.location_city}, {dog.location_state}
                  </p>
                  <Link
                    href={`/shelters/${dog.organization_id}`}
                    className="text-sm text-wtl-sky hover:text-wtl-coral transition-colors"
                  >
                    {dog.shelter_name}
                  </Link>
                </div>
              </div>
            </div>

            {/* Affiliate products */}
            <div className="mb-6">
              <AffiliateBlock dogName={dog.name} size={dog.size ?? null} />
            </div>

            {/* Share kit */}
            <div className="mb-6">
              <ShareKit
                dogName={dog.name}
                breed={`${dog.primary_breed}${dog.secondary_breed ? ` / ${dog.secondary_breed}` : ""}${dog.is_mixed ? " Mix" : ""}`}
                waitTime={formatWaitTime(dog.days_waiting)}
                dogUrl={`https://waitingthelongest.com/dogs/${dog.id}`}
                primaryPhotoUrl={dog.primary_photo_url ?? undefined}
              />
            </div>

            {/* Mobile CTA — repeated at bottom for easy thumb access */}
            {externalUrl && (
              <div className="lg:hidden">
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center"
                >
                  Visit Shelter Website
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
