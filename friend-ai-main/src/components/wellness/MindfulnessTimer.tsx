import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface MindfulnessTimerProps {
  themeClass: (light: string, dark: string) => string;
}

const presets = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
];

export function MindfulnessTimer({ themeClass }: MindfulnessTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(5 * 60);
  const [remaining, setRemaining] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const start = useCallback(() => {
    if (isRunning) return;
    if (remaining <= 0) {
      setRemaining(totalSeconds);
    }
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isRunning, remaining, totalSeconds, clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setRemaining(totalSeconds);
  }, [clearTimer, totalSeconds]);

  const setDuration = useCallback((minutes: number) => {
    clearTimer();
    setIsRunning(false);
    setTotalSeconds(minutes * 60);
    setRemaining(minutes * 60);
    setCustomMinutes("");
  }, [clearTimer]);

  const handleCustom = useCallback(() => {
    const mins = parseInt(customMinutes, 10);
    if (mins > 0 && mins <= 120) {
      setDuration(mins);
    }
  }, [customMinutes, setDuration]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const displayMinutes = String(minutes).padStart(2, "0");
  const displaySeconds = String(seconds).padStart(2, "0");

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <h3 className="text-sm font-bold font-display text-[#2B2B2B] dark:text-white mb-4">Mindfulness Timer</h3>

      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-[#EDEBE7] dark:text-white/10" />
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="#7A9E85"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-mono text-[#2B2B2B] dark:text-white">
              {displayMinutes}:{displaySeconds}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setDuration(p.value)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer border ${
                totalSeconds === p.value * 60 && !customMinutes
                  ? "bg-[#7A9E85] text-white border-[#7A9E85]"
                  : "border-[#EDEBE7] dark:border-white/[0.08] text-[#6B6B6B] dark:text-white/60 hover:border-[#7A9E85]/30"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="min"
              className="w-12 px-1.5 py-1.5 text-[10px] font-bold rounded-xl border border-[#EDEBE7] dark:border-white/[0.08] bg-transparent text-[#2B2B2B] dark:text-white text-center focus:outline-none focus:border-[#7A9E85]"
              min={1}
              max={120}
            />
            <button
              onClick={handleCustom}
              className="px-2 py-1.5 text-[9px] font-bold rounded-xl border border-[#EDEBE7] dark:border-white/[0.08] text-[#6B6B6B] dark:text-white/60 hover:border-[#7A9E85]/30 cursor-pointer"
            >
              Set
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {isRunning ? (
            <button
              onClick={pause}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6B9080] hover:bg-[#5D7E68] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
          ) : (
            <button
              onClick={start}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#7A9E85] hover:bg-[#6B9080] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-[#7A9E85]/20"
            >
              <Play className="w-3.5 h-3.5" />
              Start
            </button>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#EDEBE7] dark:border-white/[0.08] text-[#6B6B6B] dark:text-white/60 hover:text-[#2B2B2B] dark:hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
