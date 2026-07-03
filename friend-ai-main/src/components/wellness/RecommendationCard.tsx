import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Footprints, Droplets, Wind, BookOpen, Music, ChevronRight } from "lucide-react";

interface RecommendationCardProps {
  themeClass: (light: string, dark: string) => string;
}

const recommendations = [
  { icon: Footprints, label: "Take a short walk", desc: "15 min outside can reset your mind", color: "#7A9E85" },
  { icon: Droplets, label: "Drink water", desc: "Your body needs hydration right now", color: "#6B9080" },
  { icon: Wind, label: "Try breathing", desc: "2 minutes of deep breathing calms the nervous system", color: "#5D7E68" },
  { icon: BookOpen, label: "Write a journal", desc: "Getting thoughts on paper reduces anxiety", color: "#7A9E85" },
  { icon: Music, label: "Listen to calming sounds", desc: "Ambient sounds improve focus and mood", color: "#6B9080" },
];

export function RecommendationCard({ themeClass }: RecommendationCardProps) {
  const [current, setCurrent] = useState(0);

  const rec = recommendations[current];

  const next = () => {
    setCurrent((prev) => (prev + 1) % recommendations.length);
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#7A9E85]/10 to-transparent rounded-bl-full" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#7A9E85]" />
          <h3 className="text-sm font-bold font-display text-[#2B2B2B] dark:text-white">AI Recommendation</h3>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 12, x: -8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -12, x: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-start gap-4"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${rec.color}15` }}
            >
              <rec.icon className="w-6 h-6" style={{ color: rec.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#2B2B2B] dark:text-white">{rec.label}</p>
              <p className="text-xs text-[#6B6B6B] dark:text-white/50 mt-0.5 leading-relaxed">{rec.desc}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-[#7A9E85] dark:text-[#7A9E85]">
                <span>AI suggested</span>
                <Sparkles className="w-2.5 h-2.5" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={next}
          className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[#6B6B6B] dark:text-white/50 hover:text-[#2B2B2B] dark:hover:text-white transition-colors cursor-pointer"
        >
          Next suggestion
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
