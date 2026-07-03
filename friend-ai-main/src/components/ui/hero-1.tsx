"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  MessageCircle,
  PenLine,
  BarChart3,
  Mail,
  Users,
  Heart,
  Shield,
  Brain,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface Hero1Props {
  onSignIn?: () => void;
  onGetStarted?: () => void;
}

function FadeInUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <FadeInUp delay={delay} className="group">
      <div className="p-8 rounded-3xl bg-white border border-[#EDEBE7] hover:border-[#C9A45C]/30 transition-all duration-500 hover:shadow-lg hover:shadow-[#C9A45C]/5 h-full">
        <div className="w-12 h-12 rounded-2xl bg-[#F6F1E6] flex items-center justify-center mb-5 text-[#7C8862] group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="font-serif-display text-xl font-semibold text-[#2E2A22] mb-3 leading-snug">
          {title}
        </h3>
        <p className="font-sans-body text-sm text-[#73796F] leading-relaxed">
          {description}
        </p>
      </div>
    </FadeInUp>
  );
}

const Hero1 = ({ onSignIn, onGetStarted }: Hero1Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Private AI Chat",
      description:
        "A secure, non-judgmental space to explore your thoughts. Encrypted and personal — your data stays yours.",
    },
    {
      icon: <PenLine className="w-5 h-5" />,
      title: "Reflective Journaling",
      description:
        "Transcribe your daily experiences into a digital journal that grows with you. Spot patterns and celebrate small wins.",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Mood Analytics",
      description:
        "Beautiful visual insights into your emotional landscape. Track trends, triggers, and triumphs over time.",
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Slow Letters",
      description:
        "Thoughtfully delayed correspondence that encourages depth over speed. Exchange meaningful letters with kindred spirits.",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community",
      description:
        "Anonymous support circles and shared-interest rooms. Build friendships that nourish, not just notify.",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Wellness Tools",
      description:
        "Guided breathing, meditation cues, daily check-ins, and somatic grounding exercises at your fingertips.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Clinical Directory",
      description:
        "Verified medico-legal resources and practitioner referrals for when professional support is needed.",
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Therapeutic Blog",
      description:
        "Bi-weekly clinical insights blending neuroscience, somatic anchoring, and psychiatric citations for self-care.",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "9 Companion Guides",
      description:
        "Each rooted in a distinct Indian folk-art tradition — from Aipan to Warli — to match your emotional language.",
    },
  ];

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Safety", href: "#safety" },
    { label: "Philosophy", href: "#philosophy" },
  ];

  return (
    <div className="min-h-screen bg-[#FEF8F1] text-[#1D1B17] font-sans-body overflow-x-hidden">
      {/* ============ NAVBAR ============ */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FEF8F1]/90 nav-blur shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-16 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img
              src="/friend_ai_logo.png"
              alt="Friend AI"
              className="w-9 h-9 rounded-lg object-cover"
            />
            <span className="font-serif-display text-xl font-semibold text-[#2E2A22] tracking-tight">
              Friend <span className="text-[#7C8862]">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#73796F] hover:text-[#2E2A22] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="hidden sm:block text-sm text-[#73796F] hover:text-[#2E2A22] transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-[#43643D] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#3A5A34] transition-all duration-200 hover:scale-[1.02] shadow-sm"
            >
              Get Started
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-[#73796F] hover:text-[#2E2A22]"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-[#EDEBE7] px-5 py-6 space-y-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-[#73796F] hover:text-[#2E2A22] py-2"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onSignIn?.(); }}
              className="block w-full text-left text-sm text-[#73796F] hover:text-[#2E2A22] py-2"
            >
              Sign In
            </button>
          </motion.div>
        )}
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-20">
        <div className="max-w-[1200px] mx-auto px-5 md:px-16 grid md:grid-cols-2 gap-12 items-center py-16 md:py-24">
          <div className="z-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8F0EA] text-[#2E4E29] rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Mental Well-being
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-semibold text-[#2E2A22] leading-[1.1] tracking-tight"
            >
              Your Mindful{" "}
              <span className="italic text-[#7C8862]">AI Companion</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#73796F] max-w-lg leading-relaxed font-sans-body"
            >
              A quiet, private sanctuary where you can chat, journal, reflect,
              and connect — on your own terms, at your own pace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button
                onClick={onGetStarted}
                className="bg-[#43643D] text-white px-8 py-4 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-[#3A5A34] transition-all duration-200 hover:scale-[1.02] shadow-sm"
              >
                Begin Your Journey
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border border-[#C9A45C]/40 text-[#7C8862] px-8 py-4 rounded-full text-sm font-semibold hover:bg-[#F6F1E6] transition-all duration-200">
                How it Works
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-0 flex items-center justify-center"
          >
            <div className="w-full max-w-[320px] md:max-w-[380px] aspect-[9/19] rounded-[2.5rem] overflow-hidden border-4 border-[#EDEBE7] shadow-xl shadow-[#7C8862]/10 rotate-2 hover:rotate-0 transition-transform duration-700 bg-white">
              <div className="h-full flex flex-col">
                <div className="px-5 pt-8 pb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#EDEBE7]" />
                  <div className="w-2 h-2 rounded-full bg-[#EDEBE7]" />
                  <div className="w-2 h-2 rounded-full bg-[#EDEBE7]" />
                  <div className="flex-1 text-center">
                    <span className="text-[9px] font-semibold text-[#73796F] tracking-wider">friend ai</span>
                  </div>
                </div>
                <div className="flex-1 px-4 space-y-3 py-3">
                  <div className="p-3 rounded-2xl bg-[#F6F1E6] max-w-[80%]">
                    <p className="text-xs text-[#2E2A22] leading-relaxed">
                      I've been feeling overwhelmed lately...
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#43643D] text-white max-w-[80%] ml-auto">
                    <p className="text-xs leading-relaxed">
                      Let's take a gentle breath together. You're in a safe space.
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F6F1E6] max-w-[75%]">
                    <p className="text-xs text-[#2E2A22] leading-relaxed">
                      Thank you. I needed that.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-1 pt-2 text-[#C9A45C]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
                <div className="px-4 pb-6 pt-2">
                  <div className="rounded-full bg-[#F6F1E6] border border-[#EDEBE7] px-4 py-2.5 flex items-center gap-2">
                    <span className="text-xs text-[#73796F]">Type your thoughts...</span>
                    <ArrowRight className="w-4 h-4 text-[#C9A45C] ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-[#E8C888]/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#A3AE86]/20 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-24 md:py-32 bg-[#FAF8F5]" id="features">
        <div className="max-w-[1200px] mx-auto px-5 md:px-16">
          <FadeInUp className="text-center mb-16 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C8862]">
              Cultivating Clarity
            </span>
            <h2 className="font-serif-display text-3xl md:text-4xl font-semibold text-[#2E2A22]">
              Everything you need to{" "}
              <span className="italic text-[#7C8862]">nurture your mind</span>
            </h2>
            <p className="text-base text-[#73796F] max-w-2xl mx-auto font-sans-body">
              Thoughtfully crafted tools to support your digital well-being and
              personal growth — all in one private, encrypted space.
            </p>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={0.05 * i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ QUOTE ============ */}
      <section
        className="py-32 md:py-40 bg-[#FEF8F1] overflow-hidden relative"
        id="philosophy"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="font-serif-display text-[300px] text-[#7C8862] italic leading-none">
            Soul
          </span>
        </div>
        <div className="max-w-[1200px] mx-auto px-5 md:px-16 text-center relative z-10">
          <FadeInUp>
            <div className="flex justify-center mb-8">
              <span className="text-4xl text-[#C9A45C] font-serif-display leading-none">
                &ldquo;
              </span>
            </div>
            <blockquote className="font-serif-display text-2xl md:text-4xl lg:text-5xl text-[#2E2A22] max-w-4xl mx-auto italic leading-snug font-medium">
              True connection doesn&rsquo;t happen at the speed of light. It
              happens at the speed of the soul.
            </blockquote>
            <div className="mt-10 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-[#C9A45C]/30" />
              <cite className="text-xs font-semibold uppercase tracking-[0.2em] text-[#73796F] not-italic">
                The Botanical Heritage Philosophy
              </cite>
              <div className="h-px w-12 bg-[#C9A45C]/30" />
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ============ TRUST ============ */}
      <section className="py-20 bg-[#FAF8F5]" id="safety">
        <div className="max-w-[1200px] mx-auto px-5 md:px-16">
          <FadeInUp>
            <div className="bg-white rounded-[2rem] p-8 md:p-16 border border-[#EDEBE7] shadow-sm">
              <div className="grid md:grid-cols-3 gap-10 text-center">
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#E8F0EA] flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6 text-[#43643D]" />
                  </div>
                  <h3 className="font-serif-display text-lg font-semibold text-[#2E2A22]">
                    End-to-End Encrypted
                  </h3>
                  <p className="text-sm text-[#73796F] leading-relaxed">
                    Your conversations are private. We use zero-knowledge
                    architecture — even we can&apos;t read them.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#E8F0EA] flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-[#43643D]" />
                  </div>
                  <h3 className="font-serif-display text-lg font-semibold text-[#2E2A22]">
                    No Ads, Ever
                  </h3>
                  <p className="text-sm text-[#73796F] leading-relaxed">
                    We don&apos;t sell data, show ads, or mine your activity.
                    Your well-being is our only metric.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#E8F0EA] flex items-center justify-center mx-auto">
                    <Heart className="w-6 h-6 text-[#43643D]" />
                  </div>
                  <h3 className="font-serif-display text-lg font-semibold text-[#2E2A22]">
                    Responsible AI
                  </h3>
                  <p className="text-sm text-[#73796F] leading-relaxed">
                    Built with safety guardrails, crisis detection, and
                    medico-legal compliance at its core.
                  </p>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-24 md:py-32 bg-[#FEF8F1]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-16">
          <FadeInUp>
            <div className="bg-[#43643D] rounded-[2.5rem] p-8 md:p-20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#7C8862]/20 rounded-full blur-[80px] -ml-24 -mb-24" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="font-serif-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight">
                  Start Your Mindful Chapter
                </h2>
                <p className="text-lg text-white/80 font-sans-body max-w-lg mx-auto">
                  Join thousands of seekers who have found their digital
                  sanctuary. Begin your journey toward a more intentional life
                  today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button
                    onClick={onGetStarted}
                    className="w-full sm:w-auto bg-white text-[#2E2A22] px-10 py-4 rounded-full text-sm font-semibold hover:bg-[#F6F1E6] transition-all duration-200 hover:scale-105 shadow-sm"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={onSignIn}
                    className="w-full sm:w-auto border border-white/30 text-white px-10 py-4 rounded-full text-sm font-semibold hover:bg-white/5 transition-all duration-200"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#FAF8F5] py-16 border-t border-[#EDEBE7]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/friend_ai_logo.png"
                alt="Friend AI"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="font-serif-display text-lg font-semibold text-[#2E2A22]">
                Friend AI
              </span>
            </div>
            <p className="text-sm text-[#73796F] leading-relaxed max-w-xs">
              Nurturing digital peace through mindful AI and reflective design
              principles.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-[#EDEBE7] flex items-center justify-center text-[#73796F] hover:text-[#2E2A22] hover:border-[#C9A45C] transition-all"
                aria-label="Social link"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M21 12h0" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-[#EDEBE7] flex items-center justify-center text-[#73796F] hover:text-[#2E2A22] hover:border-[#C9A45C] transition-all"
                aria-label="Social link"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2E2A22]">
              Platform
            </h4>
            <ul className="space-y-3 text-sm text-[#73796F]">
              <li><a href="/chat" className="hover:text-[#2E2A22] transition-colors">AI Chat</a></li>
              <li><a href="/journal" className="hover:text-[#2E2A22] transition-colors">Journaling</a></li>
              <li><a href="/analytics" className="hover:text-[#2E2A22] transition-colors">Mood Analytics</a></li>
              <li><a href="/letters" className="hover:text-[#2E2A22] transition-colors">Letters</a></li>
              <li><a href="/community" className="hover:text-[#2E2A22] transition-colors">Community</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2E2A22]">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-[#73796F]">
              <li><a href="/wellness" className="hover:text-[#2E2A22] transition-colors">Wellness Tools</a></li>
              <li><a href="/safety" className="hover:text-[#2E2A22] transition-colors">Safety Guide</a></li>
              <li><a href="/directory" className="hover:text-[#2E2A22] transition-colors">Clinical Directory</a></li>
              <li><a href="/blogs" className="hover:text-[#2E2A22] transition-colors">Therapeutic Blog</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2E2A22]">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-[#73796F]">
              <li><a href="/vision-mission" className="hover:text-[#2E2A22] transition-colors">Vision & Mission</a></li>
              <li><a href="/privacy" className="hover:text-[#2E2A22] transition-colors">Privacy</a></li>
              <li><a href="/terms" className="hover:text-[#2E2A22] transition-colors">Terms of Service</a></li>
              <li><a href="/chat" className="hover:text-[#2E2A22] transition-colors">9 Companion Guides</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 md:px-16 mt-12 pt-8 border-t border-[#EDEBE7] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#73796F]">
          <p>&copy; 2026 Friend AI. All rights reserved.</p>
          <p>Crafted for peaceful minds.</p>
        </div>
      </footer>
    </div>
  );
};

export { Hero1 };
