export interface Dog {
  id: string;
  external_id: string;
  name: string;
  species: "dog";
  intake_date: string; // ISO date
  intake_age_days: number; // server-computed, THE ranking metric
  sex: "male" | "female" | "unknown";
  altered: "altered" | "intact" | "unknown";
  size: "small" | "medium" | "large" | "xlarge";
  primary_breed: string | null;
  secondary_breed: string | null;
  is_mixed: boolean;
  primary_color: string | null;
  coat_length: string | null;
  age_months: number | null;
  weight_kg: number | null;
  description: string | null;
  adoption_fee: number | null;
  special_needs: boolean;
  good_with_dogs: "yes" | "no" | "unknown";
  good_with_cats: "yes" | "no" | "unknown";
  good_with_kids: "yes" | "no" | "unknown";
  photo_urls: string[];
  listing_url: string | null;
  status: "adoptable" | "pending";
  location: { city: string | null; state: string | null; postal_code: string | null };
  organization: { id: string; legal_name: string; org_type: string; verification_tier: string };
  confidence_score: number;
}

export interface DogFilters {
  postal_code?: string;
  radius_miles?: number;
  breed?: string;
  size?: string[];
  age_group?: "puppy" | "adult";
  sex?: string;
  good_with_dogs?: boolean;
  good_with_cats?: boolean;
  good_with_kids?: boolean;
  special_needs?: boolean;
  sort?: "days_waiting" | "newest" | "nearest";
  cursor?: string;
  limit?: number;
}

export interface DogListResponse {
  items: Dog[];
  next_cursor: string | null;
  total_count: number;
}

export interface Shelter {
  id: string;
  legal_name: string;
  org_type: string;
  verification_tier: "tier_0_self_asserted" | "tier_1_verified" | "tier_2_trusted";
  location: { city: string | null; state: string | null; postal_code: string | null };
  website: string | null;
  active_listings: number;
  dogs: Dog[];
}

export interface PlatformStats {
  total_dogs: number;
  total_shelters: number;
  adoptions_this_month: number;
  avg_wait_days: number;
  longest_wait_days: number;
}
