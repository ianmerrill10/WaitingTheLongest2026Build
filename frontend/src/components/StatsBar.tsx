import type { PlatformStats } from "@/lib/api";
import { Heart, Home, Clock, Award } from "lucide-react";

interface StatsBarProps {
  stats: PlatformStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    {
      icon: Heart,
      value: stats.total_dogs.toLocaleString(),
      label: "Dogs Waiting",
      color: "text-wtl-coral",
    },
    {
      icon: Home,
      value: stats.total_shelters.toLocaleString(),
      label: "Partner Shelters",
      color: "text-wtl-sky",
    },
    {
      icon: Clock,
      value: `${Math.round(stats.avg_wait_days)}`,
      label: "Avg Days Waiting",
      color: "text-orange-500",
    },
    {
      icon: Award,
      value: stats.adoptions_this_month.toLocaleString(),
      label: "Adopted This Month",
      color: "text-wtl-sage",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100"
        >
          <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
          <div className="text-2xl font-bold text-wtl-navy">{item.value}</div>
          <div className="text-xs text-wtl-muted mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
