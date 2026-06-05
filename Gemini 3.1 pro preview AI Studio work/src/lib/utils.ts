import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDaysWaiting(days: number): string {
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const extraDays = days % 365;
    if (years === 1 && extraDays < 30) return "over 1 year";
    if (years > 1) return `over ${years} years`;
  }
  return `${days} days`;
}
