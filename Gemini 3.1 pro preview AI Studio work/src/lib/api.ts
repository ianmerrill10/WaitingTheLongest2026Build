import { Dog, DogFilters, DogListResponse, PlatformStats, Shelter } from "./types";
import { MOCK_DOGS, MOCK_SHELTERS, MOCK_STATS } from "./seed-data";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getDogs(filters: DogFilters): Promise<DogListResponse> {
  await delay(500);

  let filtered = [...MOCK_DOGS];

  // Apply filters
  if (filters.breed) {
    filtered = filtered.filter(d => 
      d.primary_breed?.toLowerCase().includes(filters.breed!.toLowerCase()) ||
      d.secondary_breed?.toLowerCase().includes(filters.breed!.toLowerCase())
    );
  }
  
  if (filters.size && filters.size.length > 0) {
    filtered = filtered.filter(d => filters.size!.includes(d.size));
  }
  
  if (filters.age_group) {
    if (filters.age_group === "puppy") {
      filtered = filtered.filter(d => d.age_months !== null && d.age_months < 12);
    } else {
      filtered = filtered.filter(d => d.age_months !== null && d.age_months >= 12);
    }
  }

  // Sorting
  if (filters.sort === "newest") {
    filtered.sort((a, b) => a.intake_age_days - b.intake_age_days);
  } else {
    // default: longest waiting
    filtered.sort((a, b) => b.intake_age_days - a.intake_age_days);
  }

  return {
    items: filtered,
    next_cursor: null,
    total_count: filtered.length
  };
}

export async function getDog(id: string): Promise<Dog> {
  await delay(300);
  const dog = MOCK_DOGS.find(d => d.id === id);
  if (!dog) throw new Error("Dog not found");
  return dog;
}

export async function getShelter(id: string): Promise<Shelter> {
  await delay(400);
  const shelter = MOCK_SHELTERS.find(s => s.id === id);
  if (!shelter) throw new Error("Shelter not found");
  return shelter;
}

export async function getStats(): Promise<PlatformStats> {
  await delay(200);
  return MOCK_STATS;
}

export async function getFeatured(): Promise<Dog[]> {
  await delay(300);
  // Get top 4 longest waiting
  return [...MOCK_DOGS].sort((a, b) => b.intake_age_days - a.intake_age_days).slice(0, 4);
}
