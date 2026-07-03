import { useMemo } from "react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "🌅" };
  if (hour < 17) return { text: "Good Afternoon", emoji: "☀️" };
  if (hour < 21) return { text: "Good Evening", emoji: "🌆" };
  return { text: "Good Night", emoji: "🌙" };
};

const formatDate = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function HeroSection() {
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#EDEBE7] dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl p-8 md:p-10">
      <div className="absolute -right-24 -top-24 w-64 h-64 bg-[#7A9E85]/10 dark:bg-[#7A9E85]/20 rounded-full blur-[100px]" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#DEE8F0]/30 dark:bg-[#7A9E85]/10 rounded-full blur-[80px]" />

      <div className="relative flex items-center gap-6 md:gap-10">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#7A9E85] dark:text-[#7A9E85] tracking-wide mb-1">
            {greeting.emoji} {greeting.text}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-[#2B2B2B] dark:text-white tracking-tight leading-tight">
            How are you feeling today?
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-white/50 font-medium">
            {formatDate()}
          </p>
        </div>

        <div className="shrink-0">
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7A9E85]/30 via-[#DEE8F0]/30 to-[#F5E6E0]/30 dark:from-[#7A9E85]/20 dark:via-[#6B9080]/10 dark:to-[#7A9E85]/5 animate-pulse-slow blur-xl" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#7A9E85] via-[#6B9080] to-[#5D7E68] dark:from-[#7A9E85] dark:via-[#6B9080] dark:to-[#5D7E68] animate-breathing-orb flex items-center justify-center shadow-lg shadow-[#7A9E85]/20">
              <span className="text-3xl md:text-4xl">{greeting.emoji}</span>
            </div>
            <div className="absolute -inset-1 rounded-full border border-[#7A9E85]/20 dark:border-[#7A9E85]/10 animate-ping-slow" />
          </div>
        </div>
      </div>
    </div>
  );
}
