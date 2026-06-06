import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  ExternalLink,
  Dog,
  CalendarDays,
  ShieldCheck,
  Search,
} from "lucide-react";
import { getShelter } from "@/lib/api";
import type { ShelterProfile } from "@/lib/api";

// ---- SEO Metadata ----

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  let shelter: ShelterProfile | null = null;
  try {
    shelter = await getShelter(id);
  } catch {
    // Shelter not found — metadata will fall back to defaults
  }

  if (!shelter) {
    return { title: "Shelter Not Found" };
  }

  const title = `${shelter.legal_name} — Shelter Profile`;
  const description = `View adoptable dogs from ${shelter.legal_name} in ${shelter.city}, ${shelter.state}. See their longest-waiting dogs and help give a shelter dog a second chance.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | WaitingTheLongest.com`,
      description,
      type: "website",
      url: `https://waitingthelongest.com/shelters/${id}`,
    },
    twitter: {
      card: "summary",
      title: `${title} | WaitingTheLongest.com`,
      description,
    },
  };
}

// ---- Helpers ----

/** Human-readable label for org_type enum values. */
function formatOrgType(orgType: string): string {
  const labels: Record<string, string> = {
    municipal: "Municipal Shelter",
    rescue: "Rescue Organization",
    humane_society: "Humane Society",
    spca: "SPCA",
    foster_network: "Foster Network",
    private: "Private Shelter",
  };
  return labels[orgType] || orgType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Badge color classes for org_type. */
function getOrgTypeBadgeColor(orgType: string): string {
  const colors: Record<string, string> = {
    municipal: "bg-blue-50 text-blue-700 border border-blue-200",
    rescue: "bg-purple-50 text-purple-700 border border-purple-200",
    humane_society: "bg-amber-50 text-amber-700 border border-amber-200",
    spca: "bg-teal-50 text-teal-700 border border-teal-200",
    foster_network: "bg-pink-50 text-pink-700 border border-pink-200",
    private: "bg-gray-50 text-gray-700 border border-gray-200",
  };
  return colors[orgType] || "bg-gray-50 text-gray-700 border border-gray-200";
}

/** Verification tier display config. */
function getVerificationTier(tier: string): {
  label: string;
  color: string;
  showCheck: boolean;
} {
  switch (tier) {
    case "tier_2":
      return {
        label: "Verified",
        color: "bg-green-50 text-green-700 border border-green-200",
        showCheck: true,
      };
    case "tier_1":
      return {
        label: "Basic Verified",
        color: "bg-blue-50 text-blue-700 border border-blue-200",
        showCheck: false,
      };
    case "tier_0":
    default:
      return {
        label: "Unverified",
        color: "bg-gray-50 text-gray-500 border border-gray-200",
        showCheck: false,
      };
  }
}

/** Format an ISO date string to a readable "Month Year" format. */
function formatMemberSince(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return "Unknown";
  }
}

// ---- Page Component ----

export default async function ShelterProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let shelter: ShelterProfile | null = null;

  try {
    shelter = await getShelter(id);
  } catch {
    // API error or shelter not found
  }

  if (!shelter) {
    notFound();
  }

  const orgBadgeColor = getOrgTypeBadgeColor(shelter.org_type);
  const verification = getVerificationTier(shelter.verification_tier);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-wtl-muted">
        <Link href="/" className="hover:text-wtl-coral transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-wtl-navy font-medium">{shelter.legal_name}</span>
      </nav>

      {/* Shelter Profile Card */}
      <div className="card p-8">
        {/* Header: Name + Badges */}
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-3">
            <Building2 className="w-8 h-8 text-wtl-sky flex-shrink-0 mt-0.5" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-wtl-navy leading-tight">
              {shelter.legal_name}
            </h1>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 ml-11">
            {/* Org type badge */}
            <span className={`badge ${orgBadgeColor}`}>
              {formatOrgType(shelter.org_type)}
            </span>

            {/* Verification tier badge */}
            <span className={`badge ${verification.color}`}>
              {verification.showCheck && (
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              )}
              {verification.label}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ml-11">
          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-wtl-muted flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-wtl-muted font-medium uppercase tracking-wide mb-0.5">
                Location
              </p>
              <p className="text-wtl-navy">
                {shelter.city}, {shelter.state} {shelter.postal_code}
              </p>
            </div>
          </div>

          {/* Website */}
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-wtl-muted flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-wtl-muted font-medium uppercase tracking-wide mb-0.5">
                Website
              </p>
              {shelter.website ? (
                <a
                  href={shelter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wtl-sky hover:text-wtl-coral transition-colors underline underline-offset-2"
                >
                  {/* Strip protocol for cleaner display */}
                  {shelter.website.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                <p className="text-wtl-muted italic">Not provided</p>
              )}
            </div>
          </div>

          {/* Active listings */}
          <div className="flex items-start gap-3">
            <Dog className="w-5 h-5 text-wtl-muted flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-wtl-muted font-medium uppercase tracking-wide mb-0.5">
                Active Listings
              </p>
              <p className="text-wtl-navy">
                <span className="text-2xl font-bold text-wtl-coral">
                  {shelter.active_listings}
                </span>{" "}
                <span className="text-wtl-muted">
                  {shelter.active_listings === 1 ? "dog" : "dogs"} listed
                </span>
              </p>
            </div>
          </div>

          {/* Member since */}
          <div className="flex items-start gap-3">
            <CalendarDays className="w-5 h-5 text-wtl-muted flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-wtl-muted font-medium uppercase tracking-wide mb-0.5">
                Member Since
              </p>
              <p className="text-wtl-navy">
                {formatMemberSince(shelter.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dogs Section */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-wtl-navy mb-4">
          Adoptable Dogs
        </h2>
        <div className="card p-6 text-center">
          <Dog className="w-10 h-10 text-wtl-coral/40 mx-auto mb-3" />
          <p className="text-wtl-muted mb-4">
            Browse all dogs available for adoption and filter by shelter name to
            find dogs from {shelter.legal_name}.
          </p>
          <Link
            href="/dogs"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Browse All Dogs
          </Link>
        </div>
      </div>
    </div>
  );
}
