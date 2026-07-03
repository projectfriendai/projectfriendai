"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";

interface DiaTextRevealProps {
  text: string;
  className?: string;
  colors?: string[];
  delay?: number;
  duration?: number;
}

export function DiaTextReveal({
  text,
  className = "",
  colors = ["#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"],
  delay = 0.35,
  duration = 2.4,
}: DiaTextRevealProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const gradientColors = colors.join(", ");

  return (
    <span ref={ref} className={`relative inline-block whitespace-nowrap ${className}`}>
      {/* Base text (transparent initially, fades to white) */}
      <motion.span
        className="inline-block whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: duration * 0.4, delay: delay + duration * 0.5 }}
        style={{ color: "inherit" }}
      >
        {text}
      </motion.span>

      {/* Color sweep overlay */}
      <motion.span
        className="absolute inset-0 inline-block overflow-hidden pointer-events-none"
        initial={{ opacity: 1 }}
        animate={isInView ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: duration * 0.3, delay: delay + duration * 0.7 }}
      >
        <motion.span
          className="inline-block whitespace-nowrap"
          style={{
            backgroundImage: `linear-gradient(90deg, ${gradientColors})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            backgroundSize: "200% 100%",
            backgroundRepeat: "no-repeat",
          }}
          initial={{ backgroundPosition: "100% 0%", opacity: 0 }}
          animate={
            isInView
              ? { backgroundPosition: "0% 0%", opacity: 1 }
              : { backgroundPosition: "100% 0%", opacity: 0 }
          }
          transition={{
            backgroundPosition: { duration: duration, delay: delay, ease: "easeOut" },
            opacity: { duration: 0.3, delay: delay },
          }}
        >
          {text}
        </motion.span>
      </motion.span>

      {/* Diagonal shine band */}
      <motion.span
        className="absolute inset-0 inline-block overflow-hidden pointer-events-none"
        aria-hidden
      >
        <motion.span
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)`,
            backgroundSize: "200% 100%",
            backgroundRepeat: "no-repeat",
          }}
          initial={{ backgroundPosition: "150% 0%", opacity: 0 }}
          animate={
            isInView
              ? { backgroundPosition: "-150% 0%", opacity: [0, 1, 1, 0] }
              : { backgroundPosition: "150% 0%", opacity: 0 }
          }
          transition={{
            backgroundPosition: {
              duration: duration * 0.8,
              delay: delay + 0.2,
              ease: "easeInOut",
            },
            opacity: {
              duration: duration * 0.8,
              delay: delay + 0.2,
              times: [0, 0.15, 0.85, 1],
              ease: "easeInOut",
            },
          }}
        />
      </motion.span>
    </span>
  );
}
