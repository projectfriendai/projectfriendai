import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Wind, Brain, BookOpen, PersonStanding, Droplets, Music, Star, HeartHandshake } from "lucide-react";

interface QuickActionsProps {
  onBreathing: () => void;
  isBreathingActive: boolean;
  themeClass: (light: string, dark: string) => string;
}

const actions = [
  { id: "breathing", icon: Wind, label: "Breathing", color: "#7A9E85", desc: "Guided breath work" },
  { id: "meditation", icon: Brain, label: "Meditation", color: "#6B9080", desc: "Calm your mind" },
  { id: "journal", icon: BookOpen, label: "Journal", color: "#5D7E68", desc: "Write your thoughts" },
  { id: "stretch", icon: PersonStanding, label: "Stretch", color: "#7A9E85", desc: "Release tension" },
  { id: "water", icon: Droplets, label: "Water", color: "#6B9080", desc: "Stay hydrated" },
  { id: "sounds", icon: Music, label: "Sleep Sounds", color: "#5D7E68", desc: "Deep rest" },
  { id: "affirmations", icon: Star, label: "Affirmations", color: "#7A9E85", desc: "Positive mindset" },
  { id: "calm", icon: HeartHandshake, label: "Emergency Calm", color: "#6B9080", desc: "Quick de-stress" },
];

export function QuickActions({ onBreathing, isBreathingActive, themeClass }: QuickActionsProps) {
  const [rippleId, setRippleId] = useState<string | null>(null);

  const handleClick = useCallback((id: string) => {
    setRippleId(id);
    setTimeout(() => setRippleId(null), 600);
    if (id === "breathing") onBreathing();
  }, [onBreathing]);

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <h3 className="text-sm font-bold font-display text-[#2B2B2B] dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => handleClick(action.id)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden group flex flex-col items-center gap-2 p-3 rounded-xl border border-[#EDEBE7] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] hover:border-[#7A9E85]/30 dark:hover:border-[#7A9E85]/30 hover:shadow-lg hover:shadow-[#7A9E85]/5 dark:hover:shadow-[#7A9E85]/10 transition-all duration-200 cursor-pointer"
            >
              {rippleId === action.id && (
                <motion.span
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-[#7A9E85]/20"
                />
              )}
              {isBreathingActive && action.id === "breathing" && (
                <motion.span
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-xl bg-[#7A9E85]/10"
                />
              )}
              <div
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="relative text-[11px] font-semibold text-[#2B2B2B] dark:text-white/80 leading-tight text-center">
                {action.label}
              </span>
              <span className="relative text-[9px] text-[#6B6B6B] dark:text-white/40 leading-none hidden md:block">
                {action.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
