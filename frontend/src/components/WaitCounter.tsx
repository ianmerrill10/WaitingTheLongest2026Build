"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface WaitCounterProps {
  /** Intake date string from API — e.g. "2022-03-15" */
  intakeDate: string;
  /** Visual size variant */
  size?: "large" | "small";
  /** Extra CSS classes */
  className?: string;
}

interface Elapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcElapsed(intakeDate: string): Elapsed {
  const start = new Date(intakeDate + "T00:00:00Z").getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - start);

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

/**
 * WaitCounter — live real-time counter of how long a dog has been waiting.
 *
 * Two modes:
 * - size="large" — prominent hero display on dog detail page
 * - size="small" — compact badge for dog cards
 *
 * Updates every second via setInterval. Hydration-safe (SSR renders nothing,
 * client mounts with actual elapsed time immediately).
 */
export function WaitCounter({ intakeDate, size = "large", className = "" }: WaitCounterProps) {
  const [elapsed, setElapsed] = useState<Elapsed | null>(null);

  useEffect(() => {
    // Initial render — set immediately so there's no flash
    setElapsed(calcElapsed(intakeDate));

    const interval = setInterval(() => {
      setElapsed(calcElapsed(intakeDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [intakeDate]);

  if (!elapsed) {
    // SSR / hydration — render placeholder with same dimensions to avoid layout shift
    if (size === "small") {
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-mono text-wtl-muted ${className}`}>
          <Clock className="w-3 h-3" />
          Calculating...
        </span>
      );
    }
    return (
      <div className={`bg-wtl-coral/10 rounded-xl p-5 ${className}`}>
        <p className="text-xs text-wtl-muted uppercase tracking-widest mb-2">Time Waiting</p>
        <p className="text-2xl font-mono font-bold text-wtl-coral">Calculating...</p>
      </div>
    );
  }

  // ---- Small badge variant (for dog cards) ----
  if (size === "small") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-mono font-semibold text-wtl-coral ${className}`}
        title={`Waiting since ${intakeDate}`}
      >
        <Clock className="w-3 h-3 flex-shrink-0" />
        {elapsed.days}d {String(elapsed.hours).padStart(2, "0")}h {String(elapsed.minutes).padStart(2, "0")}m
      </span>
    );
  }

  // ---- Large hero variant (for dog detail page) ----
  return (
    <div className={`bg-wtl-coral/10 border border-wtl-coral/20 rounded-xl p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-wtl-coral" />
        <p className="text-xs font-semibold text-wtl-coral uppercase tracking-widest">
          Time Waiting for a Home
        </p>
      </div>

      {/* Big live counter */}
      <div className="flex items-end gap-3 flex-wrap">
        <CountUnit value={elapsed.days} label="days" large />
        <CountUnit value={elapsed.hours} label="hrs" />
        <CountUnit value={elapsed.minutes} label="min" />
        <CountUnit value={elapsed.seconds} label="sec" />
      </div>

      <p className="text-xs text-wtl-muted mt-3">
        Waiting since {new Date(intakeDate + "T00:00:00Z").toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

function CountUnit({
  value,
  label,
  large = false,
}: {
  value: number;
  label: string;
  large?: boolean;
}) {
  return (
    <div className="text-center">
      <span
        className={`block font-mono font-bold text-wtl-navy tabular-nums ${
          large ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
        }`}
      >
        {String(value).padStart(large ? 1 : 2, "0")}
      </span>
      <span className="block text-xs text-wtl-muted uppercase tracking-wide mt-0.5">
        {label}
      </span>
    </div>
  );
}
