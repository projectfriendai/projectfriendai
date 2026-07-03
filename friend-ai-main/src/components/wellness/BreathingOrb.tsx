import { useState } from "react";
import { motion } from "motion/react";
import { Wind } from "lucide-react";

interface BreathingOrbProps {
  isActive: boolean;
  phase: string;
  secondsLeft: number;
  onToggle: () => void;
  themeClass: (light: string, dark: string) => string;
}

const protocols = [
  { id: "box", label: "Box Breathing", pattern: "4-4-4-4" },
  { id: "478", label: "4-7-8", pattern: "4-7-8-0" },
  { id: "deep", label: "Deep Calm", pattern: "5-5-7-0" },
  { id: "quick", label: "Quick Relax", pattern: "3-2-4-0" },
];

const phaseColors: Record<string, string> = {
  Inhale: "#7A9E85",
  Hold: "#6B9080",
  Exhale: "#5D7E68",
  Rest: "#A8C5B0",
};

export function BreathingOrb({ isActive, phase, secondsLeft, onToggle, themeClass }: BreathingOrbProps) {
  const [protocol, setProtocol] = useState("box");

  const scale = isActive
    ? phase === "Inhale" || phase === "Hold"
      ? 1.5
      : phase === "Exhale"
        ? 0.85
        : 1
    : 1;

  const duration = isActive ? 3.9 : 1.5;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 overflow-hidden relative ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#7A9E85]/5 dark:bg-[#7A9E85]/10 rounded-full blur-3xl" />

      <div className="relative flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold font-display text-[#2B2B2B] dark:text-white">Breathing</h3>
          <p className="text-xs text-[#6B6B6B] dark:text-white/50">Guided breathing exercise</p>
        </div>
        <div className="flex gap-1">
          {protocols.map((p) => (
            <button
              key={p.id}
              onClick={() => setProtocol(p.id)}
              className={`px-2 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                protocol === p.id
                  ? "bg-[#7A9E85] text-white shadow-sm"
                  : "text-[#6B6B6B] dark:text-white/50 hover:text-[#2B2B2B] dark:hover:text-white border border-[#EDEBE7] dark:border-white/[0.08]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <motion.div
            animate={{
              scale: isActive
                ? phase === "Inhale" || phase === "Hold"
                  ? 1.5
                  : phase === "Exhale"
                    ? 0.85
                    : 1
                : 1,
              opacity: isActive ? [0.3, 0.8, 0.3] : 0.2,
            }}
            transition={{ duration, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-[#E8F0EA]/30 dark:bg-[#7A9E85]/20 border border-[#7A9E85]/20"
          />
          <motion.div
            animate={{
              scale,
              backgroundColor: isActive
                ? phase === "Hold"
                  ? "#E8F0EA"
                  : "#F0F7F2"
                : "#ffffff",
              borderColor: isActive
                ? phaseColors[phase] || "#7A9E85"
                : "#e2e8f0",
            }}
            transition={{ duration, ease: "easeInOut" }}
            className="absolute w-28 h-28 rounded-full flex flex-col items-center justify-center border-2 shadow-lg dark:shadow-[#7A9E85]/10"
          >
            {isActive ? (
              <>
                <motion.span
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] font-bold font-mono text-[#5D7E68] dark:text-[#7A9E85]"
                >
                  {phase}
                </motion.span>
                <span className="text-lg font-black font-mono text-[#5D7E68] dark:text-[#7A9E85]">
                  {secondsLeft}s
                </span>
              </>
            ) : (
              <Wind className="w-8 h-8 text-[#7A9E85]/40" />
            )}
          </motion.div>
        </div>

        <p className="text-xs font-medium text-[#6B6B6B] dark:text-white/50 mt-6 text-center">
          {isActive
            ? phase === "Inhale"
              ? "Breathe in slowly..."
              : phase === "Hold"
                ? "Hold gently..."
                : phase === "Exhale"
                  ? "Exhale completely..."
                  : "Rest and receive..."
            : `Protocol: ${protocols.find(p => p.id === protocol)?.pattern}`
          }
        </p>

        <button
          onClick={onToggle}
          className={`mt-4 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isActive
              ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-950/50"
              : "bg-[#7A9E85] hover:bg-[#6B9080] text-white shadow-sm shadow-[#7A9E85]/20"
          }`}
        >
          {isActive ? "Stop" : `Start ${protocols.find(p => p.id === protocol)?.label}`}
        </button>
      </div>
    </div>
  );
}
