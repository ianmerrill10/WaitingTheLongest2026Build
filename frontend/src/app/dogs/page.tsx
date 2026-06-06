import { Suspense } from "react";
import type { Metadata } from "next";
import { Search, Heart } from "lucide-react";
import { getDogs } from "@/lib/api";
import type { DogFilters } from "@/lib/api";
import { DogCard } from "@/components/DogCard";
import { FilterBar } from "@/components/FilterBar";
import { Pagination } from "@/components/Pagination";

export const revalidate = 30; // ISR: revalidate every 30 seconds

// ---- SEO Metadata ----

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const breed = typeof params.breed === "string" ? params.breed : undefined;
  const state = typeof params.state === "string" ? params.state : undefined;

  // Build a descriptive title based on active filters
  const parts: string[] = [];
  if (breed) parts.push(breed);
  if (state) parts.push(`in ${state}`);

  const filterDesc = parts.length > 0 ? ` — ${parts.join(" ")}` : "";
  const title = `Browse Adoptable Dogs${filterDesc}`;
  const description = breed
    ? `Find ${breed} dogs waiting for adoption in shelters across the country. Sorted by longest waiting so you can help the dogs who need it most.`
    : "Browse shelter dogs sorted by how long they have been waiting for adoption. Filter by breed, size, age, and location to find your perfect match.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | WaitingTheLongest.com`,
      description,
      type: "website",
      url: "https://waitingthelongest.com/dogs",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | WaitingTheLongest.com`,
      description,
    },
  };
}

// ---- Helper: parse search params into typed DogFilters ----

function parseFilters(
  params: Record<string, string | string[] | undefined>
): DogFilters {
  const str = (key: string): string | undefined => {
    const v = params[key];
    return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
  };

  const num = (key: string): number | undefined => {
    const v = str(key);
    if (!v) return undefined;
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const bool = (key: string): boolean | undefined => {
    const v = str(key);
    if (v === "true") return true;
    if (v === "false") return false;
    return undefined;
  };

  return {
    page: num("page") ?? 1,
    per_page: 24,
    sort: str("sort"),
    breed: str("breed"),
    size: str("size"),
    age_group: str("age_group"),
    good_with_dogs: str("good_with_dogs"),
    good_with_cats: str("good_with_cats"),
    good_with_kids: str("good_with_kids"),
    special_needs: bool("special_needs"),
    state: str("state"),
    city: str("city"),
  };
}

// ---- Page Component ----

export default async function DogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);

  let data = null;
  let error: string | null = null;

  try {
    data = await getDogs(filters);
  } catch (e) {
    error =
      e instanceof Error ? e.message : "Failed to load dogs. Please try again.";
  }

  const dogs = data?.items ?? [];
  const pagination = data?.pagination ?? null;
  const total = pagination?.total ?? 0;
  const page = pagination?.page ?? 1;
  const perPage = pagination?.per_page ?? 24;

  // Calculate "Showing X-Y of Z" range
  const rangeStart = total > 0 ? (page - 1) * perPage + 1 : 0;
  const rangeEnd = total > 0 ? Math.min(page * perPage, total) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-wtl-navy mb-2">
          Find Your Dog
        </h1>
        <p className="text-wtl-muted text-lg">
          Browse shelter dogs sorted by how long they have been waiting. Every
          day counts.
        </p>
      </div>

      {/* Filter Bar — client component that uses useSearchParams */}
      <Suspense
        fallback={
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 animate-pulse h-28" />
        }
      >
        <FilterBar />
      </Suspense>

      {/* Results Count */}
      {!error && total > 0 && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-wtl-muted">
            Showing{" "}
            <span className="font-semibold text-wtl-navy">
              {rangeStart}&ndash;{rangeEnd}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-wtl-navy">
              {total.toLocaleString()}
            </span>{" "}
            dogs
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-wtl-muted/30 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-wtl-navy mb-2">
            Something went wrong
          </h2>
          <p className="text-wtl-muted max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!error && total === 0 && (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-wtl-coral/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-wtl-navy mb-2">
            No dogs found
          </h2>
          <p className="text-wtl-muted max-w-md mx-auto mb-6">
            We could not find any dogs matching your filters. Try broadening
            your search by removing some filters.
          </p>
          <a
            href="/dogs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-wtl-coral text-white font-semibold rounded-lg hover:bg-wtl-coral/90 transition-colors"
          >
            <Search className="w-4 h-4" />
            Clear All Filters
          </a>
        </div>
      )}

      {/* Dog Grid */}
      {!error && dogs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!error && pagination && (
        <Suspense fallback={null}>
          <Pagination meta={pagination} />
        </Suspense>
      )}
    </div>
  );
}
