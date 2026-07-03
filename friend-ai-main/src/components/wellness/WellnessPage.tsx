import { useMemo, type ReactNode } from "react";
import { motion } from "motion/react";
import { HeroSection } from "./HeroSection";
import { WellnessScore } from "./WellnessScore";
import { QuickActions } from "./QuickActions";
import { MoodSelector } from "./MoodSelector";
import { BreathingOrb } from "./BreathingOrb";
import { MindfulnessTimer } from "./MindfulnessTimer";
import { JourneyTimeline } from "./JourneyTimeline";
import { RecommendationCard } from "./RecommendationCard";
import { DailyQuote } from "./DailyQuote";
import { AnalyticsCards } from "./AnalyticsCards";
import { AchievementBadge } from "./AchievementBadge";

interface WellnessPageProps {
  themeClass: (daylight: string, midnight: string, sepia?: string) => string;
  zenMode: boolean;
  isBreathingActive: boolean;
  breathingPhase: string;
  breathingSecondsLeft: number;
  toggleBreathing: () => void;
  breathingStats: { date: string; sessions: number; seconds: number };
  totalMinutes: string;
  goalProgressPercent: number;
}

function SectionWrapper({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function WellnessPage({
  themeClass,
  zenMode,
  isBreathingActive,
  breathingPhase,
  breathingSecondsLeft,
  toggleBreathing,
  breathingStats,
  totalMinutes,
  goalProgressPercent,
}: WellnessPageProps) {
  return (
    <div
      className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative ${
        zenMode ? "hidden" : ""
      }`}
    >
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[20%] -left-[15%] w-[50%] h-[50%] rounded-full bg-[#7A9E85]/5 blur-[120px] animate-aurora-1" />
        <div className="absolute -bottom-[15%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#DEE8F0]/10 blur-[100px] animate-aurora-2" />
        <div className="absolute top-[50%] left-[55%] w-[30%] h-[30%] rounded-full bg-[#E8F0EA]/8 blur-[80px] animate-aurora-3" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">
        {/* Hero */}
        <SectionWrapper delay={0}>
          <HeroSection />
        </SectionWrapper>

        {/* Wellness Score + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5">
            <SectionWrapper delay={0.05}>
              <WellnessScore
                totalMinutes={totalMinutes}
                goalProgressPercent={goalProgressPercent}
                breathingSessions={breathingStats.sessions}
                themeClass={themeClass}
              />
            </SectionWrapper>
          </div>
          <div className="lg:col-span-7">
            <SectionWrapper delay={0.1}>
              <QuickActions
                onBreathing={toggleBreathing}
                isBreathingActive={isBreathingActive}
                themeClass={themeClass}
              />
            </SectionWrapper>
          </div>
        </div>

        {/* Mood Selector + Breathing Orb */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5">
            <SectionWrapper delay={0.15}>
              <MoodSelector themeClass={themeClass} />
            </SectionWrapper>
          </div>
          <div className="lg:col-span-7">
            <SectionWrapper delay={0.2}>
              <BreathingOrb
                isActive={isBreathingActive}
                phase={breathingPhase}
                secondsLeft={breathingSecondsLeft}
                onToggle={toggleBreathing}
                themeClass={themeClass}
              />
            </SectionWrapper>
          </div>
        </div>

        {/* Mindfulness Timer + Daily Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5">
            <SectionWrapper delay={0.25}>
              <MindfulnessTimer themeClass={themeClass} />
            </SectionWrapper>
          </div>
          <div className="lg:col-span-7">
            <SectionWrapper delay={0.3}>
              <DailyQuote themeClass={themeClass} />
            </SectionWrapper>
          </div>
        </div>

        {/* Journey Timeline */}
        <SectionWrapper delay={0.35}>
          <JourneyTimeline themeClass={themeClass} />
        </SectionWrapper>

        {/* AI Recommendations + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <SectionWrapper delay={0.4}>
              <RecommendationCard themeClass={themeClass} />
            </SectionWrapper>
          </div>
          <div className="lg:col-span-5">
            <SectionWrapper delay={0.45}>
              <AchievementBadge themeClass={themeClass} />
            </SectionWrapper>
          </div>
        </div>

        {/* Analytics */}
        <SectionWrapper delay={0.5}>
          <AnalyticsCards
            themeClass={themeClass}
            breathingSessions={breathingStats.sessions}
            totalMinutes={totalMinutes}
          />
        </SectionWrapper>
      </div>
    </div>
  );
}
