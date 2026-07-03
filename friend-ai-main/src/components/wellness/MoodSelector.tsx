import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface MoodSelectorProps {
  themeClass: (light: string, dark: string) => string;
}

const moods = [
  { emoji: "😀", label: "Excellent", color: "#7A9E85" },
  { emoji: "🙂", label: "Good", color: "#6B9080" },
  { emoji: "😐", label: "Okay", color: "#D4A574" },
  { emoji: "😞", label: "Low", color: "#C98B8B" },
  { emoji: "😢", label: "Overwhelmed", color: "#A88B9B" },
];

const encouragements: Record<string, string> = {
  "Excellent": "That's wonderful! Keep shining bright ✨",
  "Good": "Great to hear! Small joys matter 🌟",
  "Okay": "It's okay not to be okay. You're doing great 🌱",
  "Low": "We're here for you. Things will get better 💙",
  "Overwhelmed": "Take a deep breath. You're not alone 🫂",
};

export function MoodSelector({ themeClass }: MoodSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const handleSelect = (label: string) => {
    setSelected(label);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <h3 className="text-sm font-bold font-display text-[#2B2B2B] dark:text-white mb-1">Today's Check-In</h3>
      <p className="text-xs text-[#6B6B6B] dark:text-white/50 mb-4">How are you feeling right now?</p>

      <div className="flex gap-2 md:gap-3">
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            onClick={() => handleSelect(mood.label)}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.9 }}
            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all cursor-pointer border ${
              selected === mood.label
                ? "border-[#7A9E85] dark:border-[#7A9E85] bg-[#7A9E85]/10 dark:bg-[#7A9E85]/20 shadow-lg shadow-[#7A9E85]/10"
                : "border-[#EDEBE7] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] hover:border-[#7A9E85]/30 dark:hover:border-[#7A9E85]/30"
            }`}
          >
            {selected === mood.label && (
              <motion.span
                layoutId="moodGlow"
                className="absolute inset-0 rounded-xl bg-[#7A9E85]/10"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="text-2xl relative">{mood.emoji}</span>
            <span
              className="text-[10px] font-semibold relative"
              style={{ color: selected === mood.label ? mood.color : undefined }}
            >
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showMessage && selected && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-4 flex items-center gap-2 text-xs font-medium text-[#7A9E85] dark:text-[#7A9E85]"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            {encouragements[selected]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
