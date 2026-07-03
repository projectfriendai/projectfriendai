import { useMemo } from "react";
import { motion } from "motion/react";

interface WellnessScoreProps {
  totalMinutes: string;
  goalProgressPercent: number;
  breathingSessions: number;
  themeClass: (light: string, dark: string) => string;
}

function StatRing({ value, label, color, max = 100 }: { value: number; label: string; color: string; max?: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="52" height="52" viewBox="0 0 52 52" className="transform -rotate-90">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-[#EDEBE7] dark:text-white/10" />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="text-[11px] font-bold text-[#2B2B2B] dark:text-white/80">{label}</span>
      <span className="text-[10px] font-mono text-[#6B6B6B] dark:text-white/40">{Math.round(value)}%</span>
    </div>
  );
}

export function WellnessScore({ totalMinutes, goalProgressPercent, breathingSessions, themeClass }: WellnessScoreProps) {
  const score = useMemo(() => {
    const base = 60;
    const sessionBonus = Math.min(breathingSessions * 5, 20);
    const goalBonus = Math.min(goalProgressPercent * 0.2, 20);
    return Math.min(Math.round(base + sessionBonus + goalBonus), 100);
  }, [breathingSessions, goalProgressPercent]);

  const feelingText = score >= 80 ? "Feeling Great" : score >= 60 ? "Feeling Better" : score >= 40 ? "Hanging In" : "Need Care";

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130" className="transform -rotate-90">
            <circle cx="65" cy="65" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-[#EDEBE7] dark:text-white/10" />
            <motion.circle
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7A9E85" />
                <stop offset="100%" stopColor="#6B9080" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={score}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-black font-display text-[#2B2B2B] dark:text-white"
            >
              {score}%
            </motion.span>
            <span className="text-[10px] font-medium text-[#7A9E85] dark:text-[#7A9E85] mt-0.5">{feelingText}</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          <StatRing value={Math.min(parseFloat(totalMinutes) * 10 + 20, 100)} label="Stress" color="#7A9E85" />
          <StatRing value={Math.min(breathingSessions * 8 + 30, 100)} label="Energy" color="#6B9080" />
          <StatRing value={Math.min(parseFloat(totalMinutes) * 5 + 40, 100)} label="Sleep" color="#5D7E68" />
          <StatRing value={score} label="Mood" color="#7A9E85" />
        </div>
      </div>
    </div>
  );
}
