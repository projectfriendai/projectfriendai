import { useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, Activity, Moon, Wind, BookOpen } from "lucide-react";

interface AnalyticsCardsProps {
  themeClass: (light: string, dark: string) => string;
  breathingSessions: number;
  totalMinutes: string;
}

function MiniChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const height = 40;

  return (
    <div className="flex items-end gap-1 h-10">
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * height}px` }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="w-[6px] rounded-sm"
          style={{ backgroundColor: v === max ? color : `${color}40` }}
        />
      ))}
    </div>
  );
}

export function AnalyticsCards({ themeClass, breathingSessions, totalMinutes }: AnalyticsCardsProps) {
  const weeklyMood = useMemo(() => [3, 4, 2, 5, 3, 4, 4], []);
  const stressTrend = useMemo(() => [4, 3, 5, 2, 3, 4, 2], []);
  const sleepQuality = useMemo(() => [3, 4, 3, 5, 4, 3, 4], []);

  const cards = [
    {
      id: "mood",
      icon: Activity,
      label: "Weekly Mood",
      values: weeklyMood,
      color: "#7A9E85",
      metric: "Good",
    },
    {
      id: "stress",
      icon: TrendingUp,
      label: "Stress Trend",
      values: stressTrend,
      color: "#6B9080",
      metric: "Decreasing",
    },
    {
      id: "sleep",
      icon: Moon,
      label: "Sleep Quality",
      values: sleepQuality,
      color: "#5D7E68",
      metric: "7.2 hrs avg",
    },
    {
      id: "breathing",
      icon: Wind,
      label: "Breathing",
      values: [breathingSessions * 2, breathingSessions, breathingSessions * 3, breathingSessions * 2, breathingSessions * 4, breathingSessions * 3, breathingSessions * 2],
      color: "#7A9E85",
      metric: `${totalMinutes} min today`,
    },
    {
      id: "journal",
      icon: BookOpen,
      label: "Journal Streak",
      values: [1, 2, 3, 3, 4, 4, 5],
      color: "#6B9080",
      metric: "5 day streak",
    },
  ];

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <h3 className="text-sm font-bold font-display text-[#2B2B2B] dark:text-white mb-4">Analytics</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl border border-[#EDEBE7] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] hover:border-[#7A9E85]/20 transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                </div>
                <span className="text-[10px] font-bold text-[#2B2B2B] dark:text-white/70">{card.label}</span>
              </div>
              <MiniChart values={card.values} color={card.color} />
              <p className="text-[10px] font-mono font-bold text-[#6B6B6B] dark:text-white/40 mt-2">{card.metric}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
