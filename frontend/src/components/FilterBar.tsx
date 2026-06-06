"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

const SIZES = [
  { value: "", label: "Any Size" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra Large" },
];

const AGE_GROUPS = [
  { value: "", label: "Any Age" },
  { value: "under_5_months", label: "Puppy (< 5mo)" },
  { value: "5_11_months", label: "Young (5-11mo)" },
  { value: "1_year", label: "1 Year" },
  { value: "2_years", label: "2 Years" },
  { value: "3_4_years", label: "3-4 Years" },
  { value: "5_6_years", label: "5-6 Years" },
  { value: "7_9_years", label: "7-9 Years" },
  { value: "10_plus_years", label: "Senior (10+)" },
];

const SORT_OPTIONS = [
  { value: "days_waiting_desc", label: "Longest Waiting" },
  { value: "days_waiting_asc", label: "Shortest Waiting" },
  { value: "recently_added", label: "Recently Added" },
  { value: "name_asc", label: "Name (A-Z)" },
];

const COMPATIBILITY = [
  { value: "", label: "Any" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      router.push(`/dogs?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-wtl-muted" />
        <span className="text-sm font-semibold text-wtl-navy">Filters</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Sort */}
        <div>
          <label className="block text-xs text-wtl-muted mb-1">Sort By</label>
          <select
            className="input-field text-sm"
            value={searchParams.get("sort") || "days_waiting_desc"}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Breed search */}
        <div>
          <label className="block text-xs text-wtl-muted mb-1">Breed</label>
          <input
            type="text"
            className="input-field text-sm"
            placeholder="e.g. Labrador"
            value={searchParams.get("breed") || ""}
            onChange={(e) => updateFilter("breed", e.target.value)}
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-xs text-wtl-muted mb-1">Size</label>
          <select
            className="input-field text-sm"
            value={searchParams.get("size") || ""}
            onChange={(e) => updateFilter("size", e.target.value)}
          >
            {SIZES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Age Group */}
        <div>
          <label className="block text-xs text-wtl-muted mb-1">Age</label>
          <select
            className="input-field text-sm"
            value={searchParams.get("age_group") || ""}
            onChange={(e) => updateFilter("age_group", e.target.value)}
          >
            {AGE_GROUPS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Good with Dogs */}
        <div>
          <label className="block text-xs text-wtl-muted mb-1">
            Good with Dogs
          </label>
          <select
            className="input-field text-sm"
            value={searchParams.get("good_with_dogs") || ""}
            onChange={(e) => updateFilter("good_with_dogs", e.target.value)}
          >
            {COMPATIBILITY.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block text-xs text-wtl-muted mb-1">State</label>
          <input
            type="text"
            className="input-field text-sm"
            placeholder="e.g. MA"
            maxLength={2}
            value={searchParams.get("state") || ""}
            onChange={(e) =>
              updateFilter("state", e.target.value.toUpperCase())
            }
          />
        </div>
      </div>
    </div>
  );
}
