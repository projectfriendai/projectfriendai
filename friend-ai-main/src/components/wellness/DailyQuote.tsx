import { useMemo } from "react";
import { motion } from "motion/react";
import { Quote } from "lucide-react";

interface DailyQuoteProps {
  themeClass: (light: string, dark: string) => string;
}

const quotes = [
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "The greatest weapon against stress is our ability to choose one thought over another.", author: "William James" },
  { text: "Peace is not the absence of chaos, but the presence of calm within the chaos.", author: "Unknown" },
  { text: "Breathe in deeply, bring your focus to the present. You are exactly where you need to be.", author: "Unknown" },
  { text: "Self-care is not selfish. You cannot serve from an empty vessel.", author: "Eleanor Brown" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
  { text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", author: "Thich Nhat Hanh" },
  { text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
  { text: "Be where you are, not where you think you should be.", author: "Unknown" },
];

export function DailyQuote({ themeClass }: DailyQuoteProps) {
  const quoteIndex = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % quotes.length;
  }, []);

  const quote = quotes[quoteIndex];

  return (
    <div className={`rounded-2xl border p-6 transition-all duration-300 relative overflow-hidden ${themeClass("bg-white/60 border-[#EDEBE7]", "bg-white/[0.03] border-white/[0.08]")}`}>
      <div className="absolute -top-8 -left-8 w-24 h-24 bg-[#7A9E85]/5 dark:bg-[#7A9E85]/10 rounded-full blur-2xl" />

      <motion.div
        key={quoteIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <Quote className="w-8 h-8 text-[#7A9E85]/20 dark:text-[#7A9E85]/30 mb-3" />
        <blockquote className="text-base md:text-lg font-medium text-[#2B2B2B] dark:text-white/90 leading-relaxed font-display">
          "{quote.text}"
        </blockquote>
        <p className="mt-3 text-xs text-[#6B6B6B] dark:text-white/40 font-medium">
          — {quote.author}
        </p>
      </motion.div>
    </div>
  );
}
