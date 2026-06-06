/**
 * Utility functions for WaitingTheLongest.com frontend.
 */
import { clsx, type ClassValue } from "clsx";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format days waiting into a human-readable string. */
export function formatWaitTime(days: number): string {
  if (days < 1) return "Just arrived";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 60) return "1 month";
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months`;
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${remainingMonths}m`;
}

/** Format age in months to a readable string. */
export function formatAge(months: number): string {
  if (months < 1) return "< 1 month";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${rem}m`;
}

/** Get a display label for size enum. */
export function formatSize(size: string): string {
  const map: Record<string, string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    xlarge: "Extra Large",
  };
  return map[size] || size;
}

/** Get a display label for sex enum. */
export function formatSex(sex: string): string {
  const map: Record<string, string> = {
    male: "Male",
    female: "Female",
    unknown: "Unknown",
  };
  return map[sex] || sex;
}

/** Get a display label for compatibility fields. */
export function formatCompatibility(value: string): string {
  const map: Record<string, string> = {
    yes: "Yes",
    no: "No",
    unknown: "Unknown",
  };
  return map[value] || value;
}

/** Get a color class for the days-waiting badge. */
export function getWaitBadgeColor(days: number): string {
  if (days >= 365) return "bg-red-100 text-red-800";      // 1+ years - urgent
  if (days >= 180) return "bg-orange-100 text-orange-800"; // 6+ months
  if (days >= 90) return "bg-yellow-100 text-yellow-800";  // 3+ months
  return "bg-green-100 text-green-800";                     // < 3 months
}

/** Default placeholder image for dogs without photos. */
export const PLACEHOLDER_DOG_IMAGE = "/placeholder-dog.svg";

/** Format a dollar amount. */
export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "Contact shelter";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
