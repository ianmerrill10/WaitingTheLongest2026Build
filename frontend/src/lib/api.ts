/**
 * WaitingTheLongest.com — API client for the public read API.
 * All requests hit the FastAPI backend at WTL_API_URL.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface DogSummary {
  id: string;
  name: string;
  species: string;
  primary_breed: string;
  secondary_breed: string | null;
  is_mixed: boolean;
  sex: string;
  size: string;
  age_months: number;
  sac_age_group: string;
  primary_color: string;
  primary_photo_url: string | null;
  days_waiting: number;
  intake_date: string;
  adoption_fee: number | null;
  good_with_dogs: string;
  good_with_cats: string;
  good_with_kids: string;
  special_needs: boolean;
  location_city: string;
  location_state: string;
  shelter_name: string;
  status: string;
}

export interface DogDetail extends DogSummary {
  description: string | null;
  coat_length: string | null;
  weight_kg: number | null;
  altered: string | null;
  photo_urls: string[];
  listing_url: string | null;
  intake_type: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_postal_code: string | null;
  first_listed_at: string | null;
  organization_id: string | null;
  shelter_website: string | null;
  distance_miles?: number;
}

export interface DogPage {
  items: DogSummary[];
  pagination: PaginationMeta;
}

export interface ShelterProfile {
  id: string;
  legal_name: string;
  org_type: string;
  verification_tier: string;
  city: string;
  state: string;
  postal_code: string;
  website: string | null;
  active_listings: number;
  created_at: string;
}

export interface PlatformStats {
  total_dogs: number;
  total_shelters: number;
  adoptions_this_month: number;
  avg_wait_days: number;
  longest_wait_days: number;
}

export interface FeaturedResponse {
  longest_waiting: DogSummary[];
  recently_added: DogSummary[];
}

export interface DogFilters {
  page?: number;
  per_page?: number;
  sort?: string;
  breed?: string;
  size?: string;
  age_group?: string;
  good_with_dogs?: string;
  good_with_cats?: string;
  good_with_kids?: string;
  special_needs?: boolean;
  state?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius_miles?: number;
}

async function fetchAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

/** Build query string from filters object, skipping undefined/null values. */
function buildQuery(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ---- Public API endpoints ----

export async function getDogs(filters: DogFilters = {}): Promise<DogPage> {
  const query = buildQuery(filters as Record<string, unknown>);
  return fetchAPI<DogPage>(`/v1/public/dogs${query}`);
}

export async function getDog(id: string): Promise<DogDetail> {
  return fetchAPI<DogDetail>(`/v1/public/dogs/${id}`);
}

export async function getShelter(id: string): Promise<ShelterProfile> {
  return fetchAPI<ShelterProfile>(`/v1/public/shelters/${id}`);
}

export async function getStats(): Promise<PlatformStats> {
  return fetchAPI<PlatformStats>(`/v1/public/stats`);
}

export async function getFeatured(): Promise<FeaturedResponse> {
  return fetchAPI<FeaturedResponse>(`/v1/public/featured`);
}
