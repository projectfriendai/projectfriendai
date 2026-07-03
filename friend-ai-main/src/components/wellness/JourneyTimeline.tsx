import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sun, Brain, Droplets, PersonStanding, BookOpen, Moon, CheckCircle2 } from "lucide-react";

interface JourneyTimelineProps {
  themeClass: (light: string, dark: string) => string;
}

const milestones = [
  { id: "morning", label: "Morning Check-In", icon: Sun, time: "6:00 - 9:00 AM" },
  { id: "meditation", label: "Meditation", icon: Brain, time: "9:00 - 10:00 AM" },
  { id: "water", label: "Water (8 glasses)", icon: Droplets, time: "Throughout day" },
  { id: "exercise", label: "Exercise", icon: PersonStanding, time: "4:00 - 5:00 PM" },
  { id: "journal", label: "Journal", icon: BookOpen, time: "7:00 - 8:00 PM" },
  { id: "sleep", label: "Sleep", icon: Moon, time: "10:00 PM" },
];

const STORAGE_KEY = "pfai_journey_milestones";

export function JourneyTimeline({ themeClass }: JourneyTimelineProps) {
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toDateString();
        if (parsed.date === today) return parsed.ids;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), ids: completed }));
    } catch {}
  }, [completed]);

  const toggleMilestone = (id: string) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <h3 className="text-sm font-bold font-display text-[#2B2B2B] dark:text-white mb-4">Wellness Journey</h3>

      <div className="relative">
        <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gradient-to-b from-[#7A9E85]/40 via-[#7A9E85]/20 to-transparent" />

        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const isCompleted = completed.includes(m.id);
            const Icon = m.icon;
            return (
              <motion.button
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative flex items-center gap-3 w-full p-3 rounded-xl border transition-all duration-300 cursor-pointer text-left ${
                  isCompleted
                    ? "border-[#7A9E85]/40 dark:border-[#7A9E85]/30 bg-[#E8F0EA]/50 dark:bg-[#7A9E85]/10"
                    : "border-[#EDEBE7] dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.01] hover:border-[#7A9E85]/20 dark:hover:border-[#7A9E85]/20"
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#7A9E85] text-white shadow-sm shadow-[#7A9E85]/30"
                      : "bg-[#EDEBE7]/50 dark:bg-white/[0.05] text-[#6B6B6B] dark:text-white/40"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold transition-all ${
                      isCompleted ? "text-[#5D7E68] dark:text-[#7A9E85]" : "text-[#2B2B2B] dark:text-white/70"
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className="text-[10px] text-[#6B6B6B] dark:text-white/40 mt-0.5">{m.time}</p>
                </div>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-[#7A9E85]/20 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#7A9E85]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
