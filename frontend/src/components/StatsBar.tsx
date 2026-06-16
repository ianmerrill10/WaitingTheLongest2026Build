import { Activity, AlertTriangle, CalendarDays, Heart } from "lucide-react";

interface StatsBarProps {
  stats: {
    total_dogs: number;
    avg_wait_days: number;
    longest_wait_days: number;
    adoptions_this_month: number;
  } | null;
}

export function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null;

  return (
    <div className="w-full bg-white border-y-4 border-wtl-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x-4 divide-wtl-navy">
          <div className="flex flex-col p-6 sm:p-8 border-b-4 md:border-b-0 border-wtl-navy hover:bg-wtl-cream transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-wtl-muted" />
              <span className="text-xs font-bold uppercase tracking-widest text-wtl-muted font-display">At Risk</span>
            </div>
            <span className="font-display font-black text-5xl text-wtl-navy">
              {stats.total_dogs.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col p-6 sm:p-8 border-b-4 md:border-b-0 border-l-4 md:border-l-0 border-wtl-navy hover:bg-wtl-cream transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-wtl-muted" />
              <span className="text-xs font-bold uppercase tracking-widest text-wtl-muted font-display">Avg Wait</span>
            </div>
            <span className="font-display font-black text-5xl text-wtl-navy">
              {stats.avg_wait_days} <span className="text-xl text-wtl-muted">days</span>
            </span>
          </div>

          <div className="flex flex-col p-6 sm:p-8 border-b-4 md:border-b-0 border-r-4 md:border-r-0 border-wtl-navy bg-red-50 hover:bg-red-100 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-wtl-coral" />
              <span className="text-xs font-bold uppercase tracking-widest text-wtl-coral font-display">Longest Wait</span>
            </div>
            <span className="font-display font-black text-5xl text-wtl-coral">
              {stats.longest_wait_days} <span className="text-xl">days</span>
            </span>
          </div>

          <div className="flex flex-col p-6 sm:p-8 bg-wtl-navy hover:bg-wtl-navy/90 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-wtl-sage" />
              <span className="text-xs font-bold uppercase tracking-widest text-wtl-sage font-display">Rescued This Month</span>
            </div>
            <span className="font-display font-black text-5xl text-white">
              {stats.adoptions_this_month.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
