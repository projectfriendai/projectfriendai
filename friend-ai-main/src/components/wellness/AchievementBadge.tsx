import { motion } from "motion/react";
import { Flame, Trophy, Heart, BookOpen, Compass } from "lucide-react";

interface AchievementBadgeProps {
  themeClass: (light: string, dark: string) => string;
}

const achievements = [
  { id: "streak", icon: Flame, label: "7 Day Streak", color: "#7A9E85", earned: true },
  { id: "mindful", icon: Trophy, label: "Mindful Week", color: "#6B9080", earned: true },
  { id: "hydrate", icon: Heart, label: "Hydration Hero", color: "#5D7E68", earned: false },
  { id: "journal", icon: BookOpen, label: "Journal Master", color: "#7A9E85", earned: false },
  { id: "calm", icon: Compass, label: "Calm Explorer", color: "#6B9080", earned: true },
];

export function AchievementBadge({ themeClass }: AchievementBadgeProps) {
  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <h3 className="text-sm font-bold font-display text-[#2B2B2B] dark:text-white mb-4">Achievements</h3>

      <div className="flex flex-wrap gap-3">
        {achievements.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
                badge.earned
                  ? "border-[#7A9E85]/30 dark:border-[#7A9E85]/20 bg-[#E8F0EA]/50 dark:bg-[#7A9E85]/10"
                  : "border-[#EDEBE7] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] opacity-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  badge.earned ? "bg-[#7A9E85]/20" : "bg-[#EDEBE7]/50 dark:bg-white/[0.05]"
                }`}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: badge.earned ? badge.color : undefined }}
                  {...(badge.earned ? {} : { className: "text-[#6B6B6B] dark:text-white/20" })}
                />
              </div>
              <div>
                <p
                  className={`text-[11px] font-bold ${
                    badge.earned ? "text-[#2B2B2B] dark:text-white" : "text-[#6B6B6B] dark:text-white/40"
                  }`}
                >
                  {badge.label}
                </p>
                <p className="text-[9px] text-[#6B6B6B] dark:text-white/40">
                  {badge.earned ? "Earned" : "Locked"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
