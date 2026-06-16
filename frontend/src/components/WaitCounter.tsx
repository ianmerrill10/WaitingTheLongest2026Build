"use client";

import { useEffect, useState } from "react";

interface WaitCounterProps {
  intakeDate: string;
  size?: "large" | "small";
  className?: string;
}

export function WaitCounter({ intakeDate, size = "small", className = "" }: WaitCounterProps) {
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const intake = new Date(intakeDate).getTime();
    function update() {
      const diff = Date.now() - intake;
      if (diff > 0) {
        setElapsed({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [intakeDate]);

  const isLarge = size === "large";
  const numClass = isLarge ? "text-5xl sm:text-7xl font-black tabular-nums leading-none" : "text-2xl font-black tabular-nums leading-none";
  const labelClass = isLarge ? "text-xs font-bold uppercase tracking-[0.2em] mt-1" : "text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5";
  const cellBase = "flex flex-col items-center justify-center border-2 border-wtl-navy";
  const cellSize = isLarge ? "p-3 sm:p-5 min-w-[80px] sm:min-w-[110px]" : "p-2 min-w-[52px]";
  const sep = isLarge ? "font-black text-3xl text-wtl-navy mx-1" : "font-black text-lg text-wtl-navy";

  return (
    <div className={`flex items-center gap-1 font-display ${className}`}>
      <div className={`${cellBase} ${cellSize} bg-wtl-coral shadow-[3px_3px_0px_0px_rgba(9,9,11,1)]`}>
        <span className={`${numClass} text-white`}>{String(elapsed.days).padStart(3, "0")}</span>
        <span className={`${labelClass} text-white/80`}>Days</span>
      </div>
      <span className={sep}>:</span>
      <div className={`${cellBase} ${cellSize} bg-white shadow-[3px_3px_0px_0px_rgba(9,9,11,1)]`}>
        <span className={`${numClass} text-wtl-navy`}>{String(elapsed.hours).padStart(2, "0")}</span>
        <span className={`${labelClass} text-wtl-muted`}>Hrs</span>
      </div>
      <span className={sep}>:</span>
      <div className={`${cellBase} ${cellSize} bg-white shadow-[3px_3px_0px_0px_rgba(9,9,11,1)]`}>
        <span className={`${numClass} text-wtl-navy`}>{String(elapsed.minutes).padStart(2, "0")}</span>
        <span className={`${labelClass} text-wtl-muted`}>Min</span>
      </div>
      <span className={sep}>:</span>
      <div className={`${cellBase} ${cellSize} bg-wtl-navy shadow-[3px_3px_0px_0px_rgba(9,9,11,1)]`}>
        <span className={`${numClass} text-white`}>{String(elapsed.seconds).padStart(2, "0")}</span>
        <span className={`${labelClass} text-wtl-cream/70`}>Sec</span>
      </div>
    </div>
  );
}
