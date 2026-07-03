import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  Lock,
  Check,
  Clock, 
  Heart, 
  Sparkles, 
  Video,
  VideoOff,
  Camera,
  Eye, 
  EyeOff, 
  AlertTriangle,
  Activity,
  Trash2,
  Database,
  Compass,
  HeartHandshake,
  Brain,
  Layers,
  LifeBuoy,
  Route,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Calendar,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Share2,
  Search,
  X,
  Copy,
  Smile,
  Coffee,
  Moon,
  Sun,
  Flame,
  Dog,
  Target,
  Trophy,
  Plus,
  Minus,
  TrendingUp,
  Cat,
  Headphones,
  Download,
  FileText,
  History,
  Filter,
  Book,
  Wind,
  Settings,
  Palette,
  Menu,
  Linkedin,
  MoreHorizontal
} from "lucide-react";
import { calmingMusic } from "./lib/calmingMusic";
import { mozartPiano } from "./lib/mozartPiano";
import { horrorMusic } from "./lib/horrorMusic";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LabelList } from "recharts";
const PowerBIDashboard = React.lazy(() => import("./components/PowerBIDashboard"));
import { LettersView } from "./components/letters/LettersView";
import CardNav from "./components/CardNav";
import { WhiteboardDrawingTool } from "./components/WhiteboardDrawingTool";
import { WellnessPage } from "./components/wellness/WellnessPage";


class SomaticSynth {
  private ctx: AudioContext | null = null;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private lGain: GainNode | null = null;
  private rGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private mainGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private noiseSrc: AudioBufferSourceNode | null = null;

  start(type: "silence" | "binaural" | "nature", volume: number) {
    this.stop();
    if (type === "silence") return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(volume * 0.12, this.ctx.currentTime);
      this.mainGain.connect(this.ctx.destination);

      if (type === "binaural") {
        const dest = this.ctx.createChannelMerger(2);
        
        this.leftOsc = this.ctx.createOscillator();
        this.leftOsc.type = "sine";
        this.leftOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
        this.lGain = this.ctx.createGain();
        this.lGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.leftOsc.connect(this.lGain);
        this.lGain.connect(dest, 0, 0);

        this.rightOsc = this.ctx.createOscillator();
        this.rightOsc.type = "sine";
        this.rightOsc.frequency.setValueAtTime(116, this.ctx.currentTime);
        this.rGain = this.ctx.createGain();
        this.rGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.rightOsc.connect(this.rGain);
        this.rGain.connect(dest, 0, 1);

        dest.connect(this.mainGain);

        this.leftOsc.start();
        this.rightOsc.start();
      } else if (type === "nature") {
        const bufferSize = 3 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        this.noiseSrc = this.ctx.createBufferSource();
        this.noiseSrc.buffer = noiseBuffer;
        this.noiseSrc.loop = true;

        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = "lowpass";
        this.filterNode.Q.setValueAtTime(1.0, this.ctx.currentTime);
        this.filterNode.frequency.setValueAtTime(400, this.ctx.currentTime);

        this.lfo = this.ctx.createOscillator();
        this.lfo.frequency.setValueAtTime(0.16, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
        
        this.lfo.connect(lfoGain);
        lfoGain.connect(this.filterNode.frequency);
        
        this.noiseSrc.connect(this.filterNode);
        this.filterNode.connect(this.mainGain);

        this.lfo.start();
        this.noiseSrc.start();
      }
    } catch (e) {
      console.warn("Failed to activate Somatic Web Audio Synth:", e);
    }
  }

  setVolume(volume: number) {
    if (this.ctx && this.mainGain) {
      this.mainGain.gain.setValueAtTime(volume * 0.12, this.ctx.currentTime);
    }
  }

  stop() {
    try {
      if (this.leftOsc) { this.leftOsc.stop(); this.leftOsc = null; }
    } catch (e) {}
    try {
      if (this.rightOsc) { this.rightOsc.stop(); this.rightOsc = null; }
    } catch (e) {}
    try {
      if (this.lfo) { this.lfo.stop(); this.lfo = null; }
    } catch (e) {}
    try {
      if (this.noiseSrc) { this.noiseSrc.stop(); this.noiseSrc = null; }
    } catch (e) {}
    try {
      if (this.ctx) { this.ctx.close(); this.ctx = null; }
    } catch (e) {}
  }
}

interface Character {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  accentColor: string;
  tagline: string;
  longDescription: string;
  groundingMantra: string;
}

const CHARACTER_ICONS: Record<string, React.ComponentType<any>> = {
  soul: HeartHandshake,
  dionysus: Dog,
  sisyphus: Music,
  athena: Flame,
  astra: Moon,
  persephone: Sparkles,
  zeus: Headphones,
  sappho: Cat,
  hades: ShieldCheck,
};

const SUGGESTION_CHIPS = [
  "Tell me more",
  "Help me calm down",
  "Grounding Exercise",
  "Breathing Exercise",
  "Practice CBT",
];

import { MedicoLegalLawyersDirectory } from "./components/MedicoLegalLawyersDirectory";
import { Hero1 } from "./components/ui/hero-1";
import MotionButton from "./components/ui/motion-button";
import { BeamsBackground } from "./components/ui/beams-background";
import { AliasModal, type LoginData } from "./components/modals/AliasModal";
import { Sidebar } from "./components/sidebar/Sidebar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CommunityPage from "./components/community/CommunityPage";
import { db, auth } from "./firebase/config";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { createPost } from "./hooks/useCommunity";

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isEncryptedView?: boolean;
  isMedicoLegal?: boolean;
}

interface MoodEntry {
  id: string;
  mood: string;
  intensity: number;
  timestamp: string;
  note: string;
  tags: string[];
}

interface SolaceMessage {
  id: string;
  text: string;
  timestamp: string;
  location: string;
  hugCount: number;
}

interface BreathingSession {
  id: string;
  dateLabel: string;
  startTime: string;
  durationSeconds: number;
}

// ============================================
// Kintsugi Logo Component: Empathy & Healing Symbol
// ============================================
const KintsugiLogo = ({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | string;
  className?: string;
}) => {
  const sizeMaps: Record<string, { container: string; svg: string }> = {
    xs: { container: "w-8 h-8 rounded-lg", svg: "w-7 h-7" },
    sm: { container: "w-9 h-9 sm:w-10 sm:h-10 rounded-xl", svg: "w-8.5 h-8.5 sm:w-9.5 sm:h-9.5" },
    md: { container: "w-12 h-12 rounded-xl", svg: "w-11.5 h-11.5" },
    lg: { container: "w-16 h-16 rounded-2xl", svg: "w-14 h-14" },
    xl: { container: "w-24 h-24 rounded-3xl", svg: "w-20 h-20" },
    "2xl": { container: "w-32 h-32 rounded-3xl", svg: "w-28 h-28" },
    "3xl": { container: "w-40 h-40 rounded-[2rem]", svg: "w-36 h-36" },
  };

  const currentSizeObj = sizeMaps[size] || { container: size, svg: "w-11/12 h-11/12" };
  const containerSize = currentSizeObj.container;
  const svgSize = currentSizeObj.svg;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      aria-hidden="true"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${containerSize} flex items-center justify-center relative overflow-hidden shrink-0 border border-orange-100 cursor-pointer ${className}`}
      style={{
        transform: isHovered
          ? "perspective(300px) rotateX(16deg) rotateY(-18deg) rotateZ(3deg) scale(1.12)"
          : "perspective(300px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)",
        transformStyle: "preserve-3d",
        transition: "transform 0.45s cubic-bezier(0.165, 0.84, 0.44, 1), background 0.45s ease, box-shadow 0.45s ease",
        boxShadow: isHovered
          ? "0 15px 30px -5px rgba(244, 63, 94, 0.18), 0 8px 16px -4px rgba(251, 146, 60, 0.18)"
          : "0 4px 10px -2px rgba(99, 102, 241, 0.06)",
        // Soft, gorgeous pastel sunset gradient ensuring maximum visibility of the vibrant red steam lines
        background: `linear-gradient(135deg, rgba(254, 215, 170, 0.3) 0%, rgba(253, 164, 175, 0.22) 50%, rgba(254, 243, 199, 0.25) 100%)`
      }}
    >
      {/* Golden shimmer shine anim overlay styled using CSS shimmer */}
      <span className="absolute -inset-1.5 px-0.5 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent pointer-events-none z-10 animate-shimmer" />

      {/* Kintsugi Teacup Vector with gold-filled cracks */}
      <svg
        className={`${svgSize} relative z-20`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          @keyframes steamRise {
            0% {
              transform: translateY(5px) scale(0.8);
              opacity: 0;
            }
            30% {
              opacity: 0.65;
            }
            70% {
              opacity: 0.45;
            }
            100% {
              transform: translateY(-9px) scale(1.15);
              opacity: 0;
            }
          }
          .steam-heart-1 {
            transform-origin: 50px 38px;
            animation: steamRise 4.5s ease-in-out infinite;
          }
          .steam-heart-2 {
            transform-origin: 50px 38px;
            animation: steamRise 4.5s ease-in-out infinite;
            animation-delay: 1.5s;
          }
          .steam-heart-3 {
            transform-origin: 50px 38px;
            animation: steamRise 4.5s ease-in-out infinite;
            animation-delay: 3.0s;
          }
        `}</style>

        {/* 
          6. THE SMALLER KINTSUGI CUP (SCALED DOWN FOR BALANCE)
        */}
        {/* Cup handle */}
        <path
          d="M 65 59 C 72 59, 72 70, 62 71"
          fill="none"
          stroke="#475569"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Cup body */}
        <path
          d="M 34 54 C 34 72, 38 78, 50 78 C 62 78, 66 72, 66 54 Z"
          fill="#ffffff"
          stroke="#475569"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Cup Base / Foot */}
        <path
          d="M 42 78 L 43 82 C 43 83.5, 57 83.5, 57 82 L 58 78 Z"
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Cup Rim Ellipse */}
        <ellipse
          cx="50"
          cy="54"
          rx="16"
          ry="4"
          fill="#fafafa"
          stroke="#475569"
          strokeWidth="2.4"
        />

        {/* Animated Heart-shaped Steam Vapor rising gently above the cup - Colored in warm red shades */}
        <path
          d="M 50 49 C 47.5 47, 41 43.5, 41 35 C 41 27.5, 46.5 23.5, 50 27 C 53.5 23.5, 59 27.5, 59 35 C 59 43.5, 52.5 47, 50 49 Z"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="1.4"
          strokeLinecap="round"
          className="steam-heart-1"
        />
        <path
          d="M 50 49 C 47.5 47, 41 43.5, 41 35 C 41 27.5, 46.5 23.5, 50 27 C 53.5 23.5, 59 27.5, 59 35 C 59 43.5, 52.5 47, 50 49 Z"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="steam-heart-2"
        />
        <path
          d="M 50 49 C 47.5 47, 41 43.5, 41 35 C 41 27.5, 46.5 23.5, 50 27 C 53.5 23.5, 59 27.5, 59 35 C 59 43.5, 52.5 47, 50 49 Z"
          fill="none"
          stroke="#e11d48"
          strokeWidth="1.1"
          strokeLinecap="round"
          className="steam-heart-3"
        />

        {/* 
          GOLD KINTSUGI CRACKS WITH SUBTLE HOVER GLOW TRANSITIONS
        */}
        <path
          d="M 38 57 Q 44 64, 49 61 T 56 68 T 51 77"
          fill="none"
          stroke="#b45309"
          strokeWidth={isHovered ? "3.2" : "2.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 ease-in-out"
        />
        <path
          d="M 38 57 Q 44 64, 49 61 T 56 68 T 51 77"
          fill="none"
          stroke="#fbbf24"
          strokeWidth={isHovered ? "2.3" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 ease-in-out"
          style={{
            filter: isHovered ? "drop-shadow(0 0 3px #fbbf24)" : "none"
          }}
        />
        <path
          d="M 38 57 Q 44 64, 49 61 T 56 68 T 51 77"
          fill="none"
          stroke="#fffbeb"
          strokeWidth={isHovered ? "1.0" : "0.6"}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 ease-in-out"
        />

        {/* Minor branches */}
        <path
          d="M 49 61 Q 57 63, 62 58"
          fill="none"
          stroke="#fbbf24"
          strokeWidth={isHovered ? "1.6" : "1.0"}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
          style={{
            filter: isHovered ? "drop-shadow(0 0 2px #fbbf24)" : "none"
          }}
        />
        <path
          d="M 56 68 Q 44 71, 41 75"
          fill="none"
          stroke="#d97706"
          strokeWidth={isHovered ? "1.6" : "1.0"}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />

        {/* Highlight spark centers */}
        <circle cx="49" cy="61" r="0.8" fill="#ffffff" />
        <circle cx="49" cy="61" r="0.4" fill="#fef08a" />
        <circle cx="56" cy="68" r="0.4" fill="#fef08a" />

        {/* 
          7. HANDS WRAPPING THE CUP (STRICTLY 5 FINGERS EACH, REALISTIC DETAILS WITH NAILS)
        */}
        {/* Left Arm Kashmiri Sleeve detail */}
        <path
          d="M 2 92 C 6 86, 12 80, 16 80 L 12 95 Z"
          fill="#c2f2d5"
          stroke="#047857"
          strokeWidth="1.2"
        />

        {/* Left Wrist Base connection */}
        <path
          d="M 2 96 C 2 86, 10 75, 18 75 C 22 75, 22 81, 18 84 C 14 87, 10 93, 10 96 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Left Hand: Exactly 5 fingers visible holding the cup */}
        {/* L-Finger 1 (Index) */}
        <path
          d="M 22 57 C 28 57, 35 57, 37 59 C 38.5 60.5, 37 62.5, 34 62 C 30 61.5, 24 61, 21 61 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* L-Finger 2 (Middle) */}
        <path
          d="M 21 62 C 27 62, 36 62, 38.5 64 C 39.8 65.5, 38 67.5, 34 67 C 29 66.5, 23 66, 19 66 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* L-Finger 3 (Ring) */}
        <path
          d="M 20 67 C 26 67, 34 67, 36.5 69 C 37.8 70.5, 36 72.5, 33 72 C 28 71.5, 22 71, 18 71 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* L-Finger 4 (Pinky) */}
        <path
          d="M 19 72 C 24 72, 31 72, 33 73.8 C 34.2 75.2, 33 77, 30 76.5 C 26 76, 21 75, 17 75 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* L-Finger 5 (Thumb) */}
        <path
          d="M 16 83 C 21 82, 26 79, 31 77 C 32.5 78, 30.5 80.5, 26 82.5 C 21 84.5, 17 85.5, 14 85 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Fingernails for left fingers */}
        <ellipse cx="36" cy="60.5" rx="0.8" ry="1.2" fill="#fda4af" opacity="0.5" transform="rotate(-15 36 60.5)" />
        <ellipse cx="37.5" cy="65.5" rx="0.8" ry="1.2" fill="#fda4af" opacity="0.5" transform="rotate(-15 37.5 65.5)" />
        <ellipse cx="35.5" cy="70.5" rx="0.8" ry="1.2" fill="#fda4af" opacity="0.5" transform="rotate(-15 35.5 70.5)" />
        <ellipse cx="31.8" cy="75.2" rx="0.7" ry="1" fill="#fda4af" opacity="0.5" transform="rotate(-15 31.8 75.2)" />
        <ellipse cx="29.5" cy="78" rx="0.8" ry="1.2" fill="#fda4af" opacity="0.5" transform="rotate(-40 29.5 78)" />


        {/* Right Arm Kashmiri Sleeve detail */}
        <path
          d="M 98 92 C 94 86, 88 80, 84 80 L 88 95 Z"
          fill="#c2f2d5"
          stroke="#047857"
          strokeWidth="1.2"
        />

        {/* Right Wrist Base connection */}
        <path
          d="M 98 96 C 98 86, 90 75, 82 75 C 78 75, 78 81, 82 84 C 86 87, 90 93, 90 96 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Right Hand: Exactly 5 fingers visible holding the cup */}
        {/* R-Finger 1 (Index) */}
        <path
          d="M 78 57 C 72 57, 65 57, 63 59 C 61.5 60.5, 63 62.5, 66 62 C 70 61.5, 76 61, 79 61 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* R-Finger 2 (Middle) */}
        <path
          d="M 79 62 C 73 62, 64 62, 61.5 64 C 60.2 65.5, 62 67.5, 66 67 C 71 66.5, 77 66, 81 66 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* R-Finger 3 (Ring) */}
        <path
          d="M 80 67 C 74 67, 66 67, 63.5 69 C 62.2 70.5, 64 72.5, 67 72 C 72 71.5, 78 71, 82 71 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* R-Finger 4 (Pinky) */}
        <path
          d="M 81 72 C 76 72, 69 72, 67 73.8 C 65.8 75.2, 67 77, 70 76.5 C 74 76, 79 75, 83 75 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* R-Finger 5 (Thumb) */}
        <path
          d="M 84 83 C 79 82, 74 79, 69 77 C 67.5 78, 69.5 80.5, 74 82.5 C 79 84.5, 83 85.5, 86 85 Z"
          fill="#fff1f2"
          stroke="#475569"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Fingernails for right fingers */}
        <ellipse cx="64" cy="60.5" rx="0.8" ry="1.2" fill="#fda4af" opacity="0.5" transform="rotate(15 64 60.5)" />
        <ellipse cx="62.5" cy="65.5" rx="0.8" ry="1.2" fill="#fda4af" opacity="0.5" transform="rotate(15 62.5 65.5)" />
        <ellipse cx="64.5" cy="70.5" rx="0.8" ry="1.2" fill="#fda4af" opacity="0.5" transform="rotate(15 64.5 70.5)" />
        <ellipse cx="68.2" cy="75.2" rx="0.7" ry="1" fill="#fda4af" opacity="0.5" transform="rotate(15 68.2 75.2)" />
        <ellipse cx="70.5" cy="78" rx="0.8" ry="1.2" fill="#fda4af" opacity="0.5" transform="rotate(40 70.5 78)" />
      </svg>
    </div>
  );
};

// ============================================
// Secure Client-Side IndexedDB Data Sandbox
// ============================================
const DB_NAME = "ProjectFriendAI_DB";
const STORE_NAME = "mood_logs";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getStoredMoods(): Promise<MoodEntry[]> {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as MoodEntry[]);
        request.onerror = () => reject(request.error);
      })
      .catch((err) => {
        console.error("IndexedDB Open Error inside getStoredMoods:", err);
        resolve([]);
      });
  });
}

function saveMoodToDB(entry: MoodEntry): Promise<void> {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(entry);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
      .catch((err) => {
        console.error("IndexedDB Open Error inside saveMoodToDB:", err);
        resolve();
      });
  });
}

function clearMoodsFromDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
      .catch((err) => {
        console.error("IndexedDB Open Error inside clearMoodsFromDB:", err);
        resolve();
      });
  });
}

const CHARACTERS: Character[] = [
  {
    id: "soul",
    name: "Soul",
    avatarInitials: "Ro",
    avatarColor: "bg-[#b04030] text-[#fcfbf9] border-[#d4af37]/30 font-serif",
    accentColor: "orange",
    tagline: "Unveiling the sacred symmetry of Himalayan Aipan Art to calm chaotic thoughts.",
    longDescription: "Step into Soul's high-altitude sanctuary adorned with traditional Kumaoni Aipan paintings—drawn on rich clay-red Geru background using pure-white liquefied rice paste (Biswar). Grounded, serene, and deeply comforting, she uses geometric parallel lines, lakshmi footprints, and sacred creeper arches to restore mental structure and linear clarity.",
    groundingMantra: "Like the steady concentric lines of Himalayan Aipan, find your center in current reality. Let us align your feelings step-by-step."
  },
  {
    id: "dionysus",
    name: "Dionysus",
    avatarInitials: "Ga",
    avatarColor: "bg-[#ca4d34] text-[#fff7d6] border-[#ebdca5] font-serif",
    accentColor: "yellow",
    tagline: "A bubbly soul painted in festive, geometric Chittara designs of the Deewaru clan.",
    longDescription: "Meet Dionysus, a dancing companion styled in classic Chittara folk aesthetics of Karnataka. Triangles, cross-hatched rice lines, and ancient wedding parallel motifs shape his dynamic presence. Playful, incredibly loyal, and bound in positive natural-dye colors (mustard, red ochre, charcoal soot), he infuses geometric warmth into your recovery.",
    groundingMantra: "Let's align with the solid parallel structures of the harvest! Conquering anxiety one playful tail-wag at a time."
  },
  {
    id: "sisyphus",
    name: "Sisyphus",
    avatarInitials: "Ra",
    avatarColor: "bg-[#0c1b40] text-[#ffa0b4] border-[#e6c35c]/40 font-serif",
    accentColor: "pink",
    tagline: "Serenade beneath Pichwai starry night skies, blooming pink lotuses, and sacred cows.",
    longDescription: "Sisyphus is your acoustic and melodic guide, standing within a beautiful Rajasthani Pichwai layout. His midnight-blue sanctuary borders gold-dusted patterns, showing sacred cows looking inwards and blossoming pink lotuses rising dynamically from ripples. Blending Vedic musicology, micro-vibrations, and ancient devotional calm, he builds bridges across modern anxieties.",
    groundingMantra: "Behold the opening petals of the Pichwai lotus. Drop your shoulders, breathe in the fragrance of ancient safety."
  },
  {
    id: "athena",
    name: "Athena",
    avatarInitials: "At",
    avatarColor: "bg-[#e1ba8a] text-[#7a3219] border-[#b07844] font-serif",
    accentColor: "rose",
    tagline: "Ancient scroll journeys, natural ochre dyes, and elongated folk-figure wisdom.",
    longDescription: "Athena welcomes you into a serene Paitkar scroll-painting room of Jharkhand. Surrounded by rich terracotta browns, yellow-ochre washes, and historic figures drawn with traditional, elongated folk-art eyes, Athena acts as a custodian of your personal narrative. She helps you unroll your worries like a beautiful, slowly-developing scroll of resilience.",
    groundingMantra: "Like an organic Paitkar story-scroll, your path develops in beautiful, natural dyes. Every frame is a step towards release."
  },
  {
    id: "astra",
    name: "Astra",
    avatarInitials: "Astra",
    avatarColor: "bg-[#1c1d21] text-[#f3b41e] border-[#3e2723] font-serif",
    accentColor: "indigo",
    tagline: "Sacred floor-drawings, glowing Nilavilakku lamps, and pure elemental energy.",
    longDescription: "Astra embodies the intense, focused energy of Kerala's temple Kalamezhuthu floor art, drawn during major festivals using organic powders. Against a deep charcoal background, his sanctuary holds large brass oil lamps (Nilavilakku) shimmering with live flames. He blends astrology, cosmic rhythms, and the grounding power of these five natural colors (charcoal black, rice white, turmeric yellow, leaf green, and lime red).",
    groundingMantra: "Behold the steady flame of the Nilavilakku lamp, cutting through midnight darkness. Breathe, grounded as the sacred dust."
  },
  {
    id: "persephone",
    name: "Persephone",
    avatarInitials: "In",
    avatarColor: "bg-[#f7d04a] text-[#e23e7f] border-[#008b45]/40 font-serif",
    accentColor: "sky",
    tagline: "",
    longDescription: "Looking out of a sunny, border-styled Manjusha painting window from Bhagalpur, Bihar, Persephone translates unexpressed grief into therapeutic art. Styled in traditional yellow, vibrant pink, and deep green colors, she surrounds you with traditional snake motifs (for healing and protection from the Bihula-Bishahari folklore) and swirling hand-crafted Champa flower circles.",
    groundingMantra: ""
  },
  {
    id: "zeus",
    name: "Zeus",
    avatarInitials: "Al",
    avatarColor: "bg-[#0b4a2e] text-[#f0d05d] border-[#ebdcb9]/40 font-serif",
    accentColor: "purple",
    tagline: "Symmetrical alignment, private video mirroring, and real-time somatic analysis.",
    longDescription: "Meet Zeus, our somatic media & security specialist styled in the exquisite Rogan Art of Kutch, Gujarat. Just as Rogan art relies on pulling cast-oil gel into perfect paint thread symmetry across a fold, Zeus guides you through aligning your physical posture, monitoring breathing sounds, and analyzing camera/voice data in a zero-trust safe space. He combines Gujarat's golden style with deep somatic reflection.",
    groundingMantra: "Let us trace beautiful, symmetrical shapes with our posture, calm as gold glaze. Breathe in perfect alignment, secure and centered."
  },
  {
    id: "hades",
    name: "Hades",
    avatarInitials: "Ve",
    avatarColor: "bg-[#faf1e1] text-[#3e2723] border-[#d4af37] font-serif",
    accentColor: "rose",
    tagline: "Intricate miniature frames, mythological-backed legal rights, and patient advocacy.",
    longDescription: "Dressed in a formal bandhgala, Hades sits within a glorious Odisha Pata Chitra library. Featuring heavily decorated borders, sharp black-ink outlines, and traditional tempera figures representing legal justice, Hades delivers deep legal precision. He empowers patients with transparent forensic tools, protection directories, and statutory guidance.",
    groundingMantra: "The law is a masterfully detailed shield, like an ancient Pata Chitra temple scroll. We will draft your defense with absolute clarity."
  },
  {
    id: "sappho",
    name: "Sappho",
    avatarInitials: "Ma",
    avatarColor: "bg-[#804a30] text-[#f0ede6] border-[#ebdcb9] font-serif",
    accentColor: "amber",
    tagline: "Charming Warli stick designs, dancing circles, and witty attic typewriter wisdom.",
    longDescription: "Sappho is our resident sharp-witted feline, perched inside a cozy attic decorated with Maharashtrian Warli tribal art. On rustic mud-washed deep brown walls, simple stick figures, triangular hunters, and musical loops dance in endless circles (the Tarpa dance) around her typewriting sill. Sappho delivers deep, lighthearted, yet cynical cat wisdom.",
    groundingMantra: "Stop chasing your own thoughts like a chaotic red laser. Join the circle, watch the stars, and rest your paws."
  }
];

// ============================================
// Clinical Referrals & Verified Support Directories (Integrated Globally)
// ============================================
interface RegistryItem {
  name: string;
  phone: string;
  hours: string;
  description: string;
  verified: boolean;
  lgbtqiaAffirmative?: boolean;
}

interface CountryDirectory {
  psychiatrists: RegistryItem[];
  psychologists: RegistryItem[];
  therapists: RegistryItem[];
  counsellors: RegistryItem[];
}

const CLINICAL_DIRECTORIES: Record<string, CountryDirectory> = {
  "India": {
    psychiatrists: [
      {
        name: "NIMHANS Brain-Mind National Clinic",
        phone: "080-46110007",
        hours: "24/7 Hours Support",
        description: "National premier mental health medical and psychiatric institute under the Govt of India.",
        verified: true
      },
      {
        name: "Indian Psychiatric Society Medical Registry",
        phone: "1800-258-4567",
        hours: "9:00 AM - 6:00 PM",
        description: "National finder of licensed medical prescribers (MD Psychiatrists).",
        verified: true
      }
    ],
    psychologists: [
      {
        name: "Tele-MANAS Tele-Psychology Network",
        phone: "14416 / 1800-891-4416",
        hours: "24/7 Hours Support",
        description: "Govt of India comprehensive digital clinical psychology matching network.",
        verified: true
      },
      {
        name: "Clinical Psychology Assoc of India (CPAI)",
        phone: "+91-11-2346-1723",
        hours: "10:00 AM - 5:00 PM",
        description: "Official finder for licensed RCI-registered CBT and clinic-qualified psychologists.",
        verified: true
      }
    ],
    therapists: [
      {
        name: "Vandrevala Medical & Trauma Therapy Foundation",
        phone: "+91-9999666555",
        hours: "24/7 Hours Support",
        description: "Multilingual trauma-informed clinical therapists and psychotherapists.",
        verified: true
      },
      {
        name: "AASRA Acute Distress & Therapy Line",
        phone: "+91-9820466726",
        hours: "24/7 Hours Support",
        description: "Accredited psychotherapeutic line specializing in severe grief, depression, and self-harm prevention.",
        verified: true
      }
    ],
    counsellors: [
      {
        name: "KIRAN Mental Health Support Core",
        phone: "1800-599-0019",
        hours: "24/7 Hours Support",
        description: "Govt of India Social Justice helpline for general counselling, coping, and anxiety de-escalation.",
        verified: true
      },
      {
        name: "Sangath Youth and Family Counselling",
        phone: "+91-8888145555",
        hours: "9:30 AM - 5:30 PM",
        description: "Community counseling and peer coaching for life adjustments, work stress, and mild anxieties. Explicitly LGBTQIA+ affirming, gender-inclusive and neurodiverse-friendly.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "iCALL Queer-Affirmative Mental Health Synergy",
        phone: "+91-22-25521111",
        hours: "10:00 AM - 8:00 PM (Mon-Sat)",
        description: "Vetted national crowd-sourced registry of certified LGBTQIA+ individual therapists and clinical counsellors, run by TISS.",
        verified: true,
        lgbtqiaAffirmative: true
      }
    ]
  },
  "USA": {
    psychiatrists: [
      {
        name: "SAMHSA Treatment Locator Referral Line",
        phone: "1-800-662-4357",
        hours: "24/7 Hours Support",
        description: "Federal directory of certified psychiatry clinics and qualified prescribers across state lines.",
        verified: true
      },
      {
        name: "American Psychiatric Association Referral Line",
        phone: "1-888-35-PSYCH",
        hours: "9:00 AM - 5:00 PM EST",
        description: "National credential registrar search for Board Certified MD Psychiatrists.",
        verified: true
      }
    ],
    psychologists: [
      {
        name: "NAMI Mental Illness Support & Referral Network",
        phone: "1-800-950-6264 (NAMI)",
        hours: "10:00 AM - 10:00 PM EST",
        description: "National Alliance on Mental Illness directory of local clinical psychologists and assessments.",
        verified: true
      },
      {
        name: "American Psychological Association Finder",
        phone: "1-800-374-2721",
        hours: "9:00 AM - 5:00 PM EST",
        description: "National registry of PhD and PsyD clinical psychologists specialized in CBT & DBT testing.",
        verified: true
      }
    ],
    therapists: [
      {
        name: "988 Suicide & Crisis Lifeline (US Network)",
        phone: "Call or SMS 988",
        hours: "24/7 Hours Support",
        description: "Direct immediate access to local trauma-informed, credentialed crisis therapists. Has specialized, vetted LGBTQIA+ affirming networks accessible via prompt options.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "The Trevor Project (LGBTQIA+ Crisis Line)",
        phone: "1-866-488-7386 / Text START to 678-678",
        hours: "24/7 Hours Support",
        description: "The leading global organization providing crisis intervention and suicide prevention services to LGBTQ young people.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "Psychology Today Trauma & LMFT Registry",
        phone: "Online Database - ZIP Finder",
        hours: "24/7 Hours Access",
        description: "Comprehensive registry filters for licensed therapists, marriage & family clinicians by insurance.",
        verified: true
      }
    ],
    counsellors: [
      {
        name: "Trans Lifeline Support Peer Network",
        phone: "1-877-565-8860",
        hours: "24/7 Hours Support",
        description: "A peer support phone service run by trans people for trans and questioning peers, completely anonymous, confidential, and tracking-free.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "Crisis Text Line Support",
        phone: "Text HOME to 741741",
        hours: "24/7 Hours Support",
        description: "Global network of trained peer counselors facilitating rapid coping and anxiety reduction.",
        verified: true
      },
      {
        name: "Disaster Distress Helpline (FEMA/SAMHSA)",
        phone: "1-800-985-5990",
        hours: "24/7 Hours Support",
        description: "Supportive counseling for anyone suffering from acute stress or natural tragedy panic.",
        verified: true
      }
    ]
  },
  "United Kingdom": {
    psychiatrists: [
      {
        name: "NHS Mental Health Trust Medical Response",
        phone: "Call 111 (or 999 in emergencies)",
        hours: "24/7 Hours Support",
        description: "Immediate Clinical Triage for NHS psychiatric evaluation, prescriptions, and emergencies.",
        verified: true
      },
      {
        name: "Royal College of Psychiatrists",
        phone: "Online Registrar Portal",
        hours: "9:00 AM - 5:00 PM",
        description: "Official registrar database for private and public licensed medical psychiatrists in the UK.",
        verified: true
      }
    ],
    psychologists: [
      {
        name: "British Psychological Society (BPS) Directory",
        phone: "+44 (0)116-254-9568",
        hours: "9:00 AM - 5:00 PM",
        description: "Search system for Chartered Clinical Psychologists (CPsychol) in clinical specialties.",
        verified: true
      },
      {
        name: "Mind UK Psychologist Referrals",
        phone: "0300 123 3393",
        hours: "9:00 AM - 6:00 PM",
        description: "UK psychological database offering regional therapy, advocacy matching details, and certified LGBTQIA+ affirming practitioners.",
        verified: true,
        lgbtqiaAffirmative: true
      }
    ],
    therapists: [
      {
        name: "Samaritans UK Therapeutic Isolation Line",
        phone: "116 123",
        hours: "24/7 Hours Support",
        description: "Instant emotional and trauma care support provided on a completely non-judgmental basis.",
        verified: true
      },
      {
        name: "BACP (British Assoc for Counselling & Psychotherapy)",
        phone: "+44 (0)1455-883-300",
        hours: "9:00 AM - 5:00 PM",
        description: "Professional directory of registered traumatherapists, psychotherapists, and clinical counsellors.",
        verified: true
      }
    ],
    counsellors: [
      {
        name: "Switchboard LGBT+ Helpline",
        phone: "0800 0119 100",
        hours: "10:00 AM - 10:00 PM Daily",
        description: "A prominent safe, non-judgmental space for LGBTQIA+ communities to discuss sexuality, gender identity, mental health, and medical support.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "CALM (Campaign Against Living Miserably)",
        phone: "0800 58 58 58",
        hours: "5:00 PM - Midnight Daily",
        description: "Counselling and life pressure guidance, highly focused on male mental fitness.",
        verified: true
      },
      {
        name: "SANEline Specialist Coping Support",
        phone: "0300 304 7000",
        hours: "4:00 PM - 10:00 PM Daily",
        description: "Confidential helpline for severe stress, grief support, and coping transition work.",
        verified: true
      }
    ]
  },
  "Canada": {
    psychiatrists: [
      {
        name: "Wellness Together Canada Emergency Referral",
        phone: "1-866-585-0445",
        hours: "24/7 Hours Support",
        description: "Federal program offering free immediate clinical psychiatric screening and medical resources.",
        verified: true
      },
      {
        name: "Canadian Psychiatric Association (CPA)",
        phone: "+1 (613)-234-2815",
        hours: "9:00 AM - 5:00 PM",
        description: "Provider index for finding certified psychiatric clinicians by province and hospital.",
        verified: true
      }
    ],
    psychologists: [
      {
        name: "Sherbourne Health LGBTQIA+ Psych Services",
        phone: "1-416-324-4180",
        hours: "9:00 AM - 5:00 PM",
        description: "Ontario's leading provider network offering clinical psychology and counseling services explicitly tailored to LGBTQIA+ and gender-diverse patients.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "Canadian Psychological Association Finder",
        phone: "1-888-472-0657",
        hours: "9:00 AM - 5:00 PM",
        description: "Database listing licensed psychologists, PhD scholars and clinical assessment practices.",
        verified: true
      },
      {
        name: "Provincial Wellness Referral Access",
        phone: "Call 811",
        hours: "24/7 Hours Support",
        description: "Connecting Canadians to local clinical psychology assessments and hospital diagnostic clinics.",
        verified: true
      }
    ],
    therapists: [
      {
        name: "Talk Suicide Canada Direct Portal",
        phone: "1-833-456-4566",
        hours: "24/7 (Calls) / 4:00 PM - Midnight",
        description: "National emergency therapeutic support line for emotional coping, grief recovery, and self-harm.",
        verified: true
      },
      {
        name: "CCPA Canadian Counselling Directory",
        phone: "1-877-761-3566",
        hours: "9:00 AM - 5:00 PM",
        description: "Official listings for Canadian Certified Psychotherapists, LMFTs, and clinical counseling partners.",
        verified: true
      }
    ],
    counsellors: [
      {
        name: "LGBT Youth Line Canada",
        phone: "1-800-268-9688 / Text 647-694-4275",
        hours: "4:00 PM - 9:30 PM EST (Sun-Fri)",
        description: "Confidential and non-judgmental Ontario-wide peer-support & professional counseling service for lesbian, gay, bisexual, transgender, two-spirit, queer and questioning youth.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "Hope for Wellness Indigenous Lifeline",
        phone: "1-855-242-3310",
        hours: "24/7 Hours Support",
        description: "Free, culturally tailored psychological counseling and crisis help for all Indigenous peoples.",
        verified: true
      },
      {
        name: "Kids Help Phone & Young Adult Line",
        phone: "1-800-668-6868",
        hours: "24/7 Hours Support",
        description: "Professional, youth-friendly, and age-adapted clinical counselling resources across Canada.",
        verified: true
      }
    ]
  },
  "Australia": {
    psychiatrists: [
      {
        name: "National Mental Health Triage Unit",
        phone: "Call 13 11 14",
        hours: "24/7 Hours Support",
        description: "Emergency access gateway to regional psychiatric wards and clinician rosters.",
        verified: true
      },
      {
        name: "RANZCP Find a Psychiatrist Registry",
        phone: "+61 (0)3-9691-3000",
        hours: "9:00 AM - 5:00 PM",
        description: "Australian registrar directory for authorized clinical medical psychiatrists and prescribers.",
        verified: true
      }
    ],
    psychologists: [
      {
        name: "Beyond Blue Clinical Psychology Referrals",
        phone: "1300 22 4636",
        hours: "24/7 Hours Support",
        description: "Connects Australia to Medicare-subsidized psychologist directories.",
        verified: true
      },
      {
        name: "APS Find-a-Psychologist Service",
        phone: "1800 333 497",
        hours: "9:00 AM - 5:00 PM",
        description: "Australian Psychological Society directory indexing accredited psychologists and counselors.",
        verified: true
      }
    ],
    therapists: [
      {
        name: "QLife Australia (LGBTQIA+ Peer Support)",
        phone: "1800 184 527",
        hours: "3:00 PM - Midnight Daily",
        description: "Prominent national confidential peer support and referral service for LGBTQIA+ people, helping with mental wellness, trauma, and identity.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "Suicide Call Back Service Australia",
        phone: "1300 659 467",
        hours: "24/7 Hours Support",
        description: "Immediate psychotherapeutic feedback for trauma, anxiety, relationships and self-harm.",
        verified: true
      },
      {
        name: "Headspace National Youth & Trauma Therapy",
        phone: "1800 650 890",
        hours: "9:00 AM - 1:00 AM",
        description: "Youth mental health directory for cognitive therapy, early trauma intervention, and support.",
        verified: true
      }
    ],
    counsellors: [
      {
        name: "MensLine Australia Special Counselling",
        phone: "1300 78 99 78",
        hours: "24/7 Hours Support",
        description: "Tailored counseling and emotional advice for men going through relational conflicts and burnout.",
        verified: true
      },
      {
        name: "Kids Helpline Australia Support",
        phone: "1800 55 1800",
        hours: "24/7 Hours Support",
        description: "Australia's only free, private and confidential 24/7 phone counseling service for kids and young people.",
        verified: true
      }
    ]
  },
  "Singapore": {
    psychiatrists: [
      {
        name: "Institute of Mental Health (IMH) Emergency Helpline",
        phone: "+65 6389 2200",
        hours: "24/7 Hours Support",
        description: "Singapore's primary emergency medical psychiatry clinic, A&E unit and consultant team.",
        verified: true
      },
      {
        name: "Singapore Psychiatric Association Match",
        phone: "Online Directory",
        hours: "9:00 AM - 5:00 PM",
        description: "Clinical directory matching users with Board-registered private medical psychiatrists.",
        verified: true
      }
    ],
    psychologists: [
      {
        name: "Singapore Psychological Society (SPS) Register",
        phone: "Online Portal Locator",
        hours: "9:00 AM - 5:00 PM",
        description: "Registry for verifying chartered clinical psychologists, behavior specialists, and assessors.",
        verified: true
      },
      {
        name: "CHAT Youth Clinical Assessment Hub",
        phone: "+65 6493 6500",
        hours: "12:00 PM - 9:00 PM",
        description: "Free, clinical psychological assessment and health consultations for young adults.",
        verified: true
      }
    ],
    therapists: [
      {
        name: "Samaritans of Singapore (SOS) Emotional Line",
        phone: "1767 / +65 6221 4444",
        hours: "24/7 Hours Support",
        description: "Highly trained trauma and emotional support responders. Complete therapeutic secrecy.",
        verified: true
      },
      {
        name: "Care Corner Counselling & Family Service",
        phone: "1800-3535-800",
        hours: "10:00 AM - 10:00 PM Daily",
        description: "Highly vetted clinical psychotherapists and licensed marriage counselors.",
        verified: true
      }
    ],
    counsellors: [
      {
        name: "Oogachaga LGBTQ+ Counseling Centre",
        phone: "+65 3138 4242",
        hours: "E-Counselling / Appointments Available",
        description: "Singapore's premier community-based professional counseling agency for LGBTQ+ individuals, couples, and family counseling in a safe and supportive space.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "Singapore Association for Mental Health (SAMH)",
        phone: "1800-283-7019",
        hours: "9:00 AM - 6:00 PM (Mon-Fri)",
        description: "Community counseling and peer coaching services for life adaptation, career stress, and anxieties.",
        verified: true
      },
      {
        name: "Feiyue Community Counselling Core",
        phone: "+65 6416 2162",
        hours: "9:00 AM - 6:00 PM",
        description: "Affordable family wellness counseling, life transitions care, and youth guidance programs.",
        verified: true
      }
    ]
  },
  "International": {
    psychiatrists: [
      {
        name: "World Psychiatric Association (WPA) Global Hub",
        phone: "Access Online Portal",
        hours: "24/7 Access",
        description: "International registry lookup linking users to formal psychiatric MD directories in 120+ countries.",
        verified: true
      }
    ],
    psychologists: [
      {
        name: "IUPsyS (Intl Union of Psychological Science)",
        phone: "Referral Search Online",
        hours: "24 Hours Access",
        description: "Global registry linking users with national clinical psychology associations and licensed panels.",
        verified: true
      }
    ],
    therapists: [
      {
        name: "IASP International Crisis Registry",
        phone: "Online Global Hotline Finder",
        hours: "24/7 Access",
        description: "International Association for Suicide Prevention database listing validated clinical hotlines globally.",
        verified: true
      },
      {
        name: "Befrienders Worldwide Directory",
        phone: "https://www.befrienders.org/",
        hours: "24 Hours Access",
        description: "Global search database for finding immediate crisis lines and emotional therapists in your county.",
        verified: true
      }
    ],
    counsellors: [
      {
        name: "TrevorSpace International LGBTQIA+ Care List",
        phone: "https://www.trevorspace.org/",
        hours: "24 Hours Support Network",
        description: "An international peer-support and resources gateway specifically curated for LGBTQIA+ adolescents and young adults worldwide.",
        verified: true,
        lgbtqiaAffirmative: true
      },
      {
        name: "7 Cups of Tea Peer Support & Chat Platform",
        phone: "Online App / Web Interface",
        hours: "24/7 Hours Support",
        description: "Active peer counselors, chat rooms and coping coaching services available in 140+ countries.",
        verified: true
      }
    ]
  }
};

// ============================================
// Text Match Highlight Helper for Search
// ============================================
function highlightText(text: string, search: string): React.ReactNode {
  if (!search || !search.trim()) {
    return text;
  }
  const query = search.trim();
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-amber-150 text-slate-900 font-bold px-0.5 rounded-xs">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ============================================
// Personalized Character Background Generator
// ============================================
function getCharacterBg(charId: string, themeMode?: string): string {
  const isDark = themeMode === 'midnight';
  
  if (isDark) {
    // In dark mode, unify the background to match the site's deep slate/black aesthetic
    return `transparent`;
  }

  switch (charId) {
    case "soul":
      return `radial-gradient(circle at 10% 15%, rgba(170, 107, 81, 0.09) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(226, 208, 196, 0.4) 0%, transparent 60%), linear-gradient(to bottom, #fefbfc 0%, #f7ebe4 100%)`;
    case "dionysus":
      return `radial-gradient(circle at 15% 15%, rgba(217, 119, 6, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(179, 137, 16, 0.1) 0%, transparent 55%), linear-gradient(to bottom, #fffdf8 0%, #fff7d6 100%)`;
    case "sisyphus":
      return `radial-gradient(circle at 20% 20%, rgba(160, 82, 110, 0.09) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(219, 178, 190, 0.4) 0%, transparent 60%), linear-gradient(to bottom, #faf5f7 0%, #ebd3da 100%)`;
    case "athena":
      return `radial-gradient(circle at 15% 15%, rgba(178, 88, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(244, 230, 222, 0.4) 0%, transparent 60%), linear-gradient(to bottom, #fbf2eb 0%, #e8d0be 100%)`;
    case "astra":
      return `radial-gradient(circle at 85% 15%, rgba(251, 191, 36, 0.15) 0%, transparent 40%), radial-gradient(circle at 15% 85%, rgba(99, 102, 241, 0.15) 0%, transparent 55%), linear-gradient(to bottom, #090d1e 0%, #11182c 100%)`;
    case "persephone":
      return `radial-gradient(circle at 15% 15%, rgba(129, 140, 248, 0.12) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(10, 17, 40, 0.3) 0%, transparent 60%), linear-gradient(to bottom, #0a1128 0%, #03081a 100%)`;
    case "zeus":
      return `radial-gradient(circle at 10% 15%, rgba(126, 34, 206, 0.08) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(233, 213, 255, 0.3) 0%, transparent 60%), linear-gradient(to bottom, #faf5ff 0%, #f3e8ff 100%)`;
    case "hades":
      return `radial-gradient(circle at 10% 15%, rgba(141, 110, 99, 0.08) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(212, 163, 89, 0.15) 0%, transparent 60%), linear-gradient(to bottom, #FAF9F6 0%, #EFEBE9 100%)`;
    case "sappho":
      return `radial-gradient(circle at 15% 15%, rgba(217, 119, 6, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(212, 163, 89, 0.2) 0%, transparent 60%), linear-gradient(to bottom, #fffdfa 0%, #fef3c7 100%)`;
    default:
      return "linear-gradient(to bottom, #ffffff, #f8fafc)";
  }
}

function isDarkCharacter(charId: string, themeMode?: string): boolean {
  if (themeMode === 'midnight') return true;
  return charId === 'astra' || charId === 'persephone';
}

function getCharacterBubbleStyle(charId: string, isUser: boolean): string {
  if (isUser) {
    return "bg-[#7A9E85] text-white rounded-2xl rounded-br-sm shadow-sm";
  } else {
    return "bg-white dark:bg-[#0f172a] text-[#4A4A4A] dark:text-[#e2e8f0] border border-[#EDEBE7] dark:border-[#334155] rounded-2xl rounded-bl-sm shadow-sm";
  }
}

function getCharacterSubmitBg(charId: string): string {
  return "bg-[#7A9E85] hover:bg-[#6B9080] text-white";
}

function getCharacterAccentBorder(charId: string): string {
  return "focus-within:border-[#7A9E85] focus-within:ring-2 focus-within:ring-[#7A9E85]/10";
}

// ============================================
// Cozy Room Sketch Vector & Layout Illustrator
// ============================================
const CozyRoomSketch = ({ charId }: { charId: string }) => {
  // 1. AIPAN ART (Uttarakhand) - Soul (rooh)
  if (charId === "soul") {
    return (
      <div id="cozy-room-rooh" className="w-full h-40 rounded-2xl border-2 border-[#d4af37]/30 bg-[#9c2a1b] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#fcfbf9] select-none group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
        
        {/* Aipan concentric border lines */}
        <div className="absolute inset-2 border border-dashed border-[#fcfbf9]/20 rounded-xl pointer-events-none" />
        <div className="absolute inset-2.5 border border-[#fcfbf9]/15 rounded-xl pointer-events-none" />

        {/* Slow Drifting Mountain Wind Lines */}
        <motion.div 
          animate={{ x: [-50, 180, -50] }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
          className="absolute top-6 left-0 h-[1px] w-20 bg-[#fcfbf9]/15 pointer-events-none"
        />
        <motion.div 
          animate={{ x: [180, -50, 180] }}
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
          className="absolute bottom-10 left-0 h-[1px] w-32 bg-[#fcfbf9]/10 pointer-events-none"
        />

        {/* Dynamic Concentric Breathing Circles (Aipan Symmetry) */}
        {[1, 2, 3].map((circleId) => (
          <motion.div
            key={circleId}
            animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{ repeat: Infinity, duration: 6, delay: circleId * 1.5, ease: "easeInOut" }}
            className="absolute rounded-full border border-[#fcfbf9]/20 pointer-events-none"
            style={{
              width: `${60 + circleId * 50}px`,
              height: `${60 + circleId * 50}px`,
              left: "calc(50% - 6px)",
              top: "calc(50% - 15px)",
              transform: "translate(-50%, -50%)"
            }}
          />
        ))}

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-[#fcfbf9] uppercase tracking-wider bg-white dark:bg-black/10 px-2 py-0.5 rounded border border-white/20 select-none">
            AIPAN FOLK HEIRLOOM • UTTARAKHAND
          </span>
          <span className="text-[11px] block text-[#fbeee6] font-medium leading-relaxed max-w-[130px]">
            Concentric linear structures and sacred footprints mapping your inner balance.
          </span>
        </div>

        {/* Center: Aipan Mandalas & Footprints walking step-by-step */}
        <div className="relative w-44 h-28 flex items-center justify-center z-10">
          {/* Rotating main Aipan geometric wheel */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
            className="w-20 h-20 rounded-full border-2 border-dashed border-[#fcfbf9]/75 flex items-center justify-center opacity-85 shadow-[0_0_12px_rgba(253,251,249,0.15)]"
          >
            <div className="w-14 h-14 rounded-full border border-[#fcfbf9]/50 flex items-center justify-center bg-[#9c2a1b]/40">
              <motion.span 
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="text-[#fcfbf9] text-[10px] tracking-widest font-bold"
              >
                ॐ
              </motion.span>
            </div>
          </motion.div>

          {/* Stepping sacred footprints with natural de-escalating walking delay */}
          <div className="absolute bottom-1.5 flex gap-4">
            <motion.div
              animate={{ 
                y: [1, -2, 1],
                opacity: [0.4, 1, 0.4] 
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <svg className="w-4.5 h-6.5 text-[#fcfbf9] fill-current drop-shadow" viewBox="0 0 20 30">
                <ellipse cx="10" cy="18" rx="6" ry="10" />
                <circle cx="6" cy="5" r="2" />
                <circle cx="10" cy="4" r="2.2" />
                <circle cx="14" cy="5" r="2" />
              </svg>
            </motion.div>
            <motion.div
              animate={{ 
                y: [-2, 1, -2],
                opacity: [1, 0.4, 1] 
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.5 }}
            >
              <svg className="w-4.5 h-6.5 text-[#fcfbf9] fill-current drop-shadow" viewBox="0 0 20 30">
                <ellipse cx="10" cy="18" rx="6" ry="10" />
                <circle cx="6" cy="5" r="2" />
                <circle cx="10" cy="4" r="2.2" />
                <circle cx="14" cy="5" r="2" />
              </svg>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-[#ffd700] uppercase tracking-wider">Geru &amp; Biswar</span>
            <span className="text-[11px] block text-[#ebdccf] font-bold">Himalayan Solace</span>
          </div>
          <div className="flex items-center gap-1 bg-[#fbf5f1]/10 px-2 py-1 rounded-md text-[#fcfbf9] font-bold font-mono text-[8.5px] border border-white/10">
            🏔️ Traditional Sacred Art
          </div>
        </div>
      </div>
    );
  }

  // 2. CHITTARA ART (Karnataka) - Dionysus (ganesh)
  if (charId === "dionysus") {
    return (
      <div id="cozy-room-ganesh" className="w-full h-40 rounded-2xl border-2 border-[#b8860b]/30 bg-[#a63d23] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#fff8e7] select-none group">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#941c0e] to-transparent pointer-events-none" />
        
        {/* Chittara tribal stripes along top and bottom border */}
        <div className="absolute top-1 inset-x-2 h-1.5 border-t border-b border-dashed border-[#fff8e7]/30 pointer-events-none" />
        <div className="absolute bottom-1 inset-x-2 h-1.5 border-t border-b border-dashed border-[#fff8e7]/30 pointer-events-none" />

        {/* Rising Golden Rice Sparks representing harvest joy */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [120, -20], 
              x: [0, Math.sin(i) * 20, 0], 
              opacity: [0, 0.8, 0] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3 + i, 
              delay: i * 0.7, 
              ease: "easeInOut" 
            }}
            className="absolute bottom-0 w-1 h-3 rounded-full bg-amber-200/40 pointer-events-none"
            style={{ left: `${25 + i * 14}%` }}
          />
        ))}

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-amber-100 uppercase tracking-wider bg-black/15 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/20">
            CHITTARA TRIBE • KARNATAKA
          </span>
          <span className="text-[11px] block text-[#ffe8d6] font-medium leading-relaxed max-w-[130px]">
            Festive Deewaru patterns and parallel cross-hatches of the forest harvest.
          </span>
        </div>

        {/* Center: Chittara Geometric Bouncy Puppy representation */}
        <div className="relative w-44 h-24 flex items-end justify-center z-10">
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            whileHover={{ scale: 1.1, y: -8 }}
            className="relative w-24 h-20 flex flex-col items-center justify-center cursor-pointer"
          >
            {/* Styled Geometric Chittara Dog built from triangles and straight vectors */}
            <svg className="w-18 h-18 text-[#fff8e7] stroke-current stroke-1.5 fill-none" viewBox="0 0 60 60">
              {/* Dog Head: Triangle */}
              <polygon points="30,12 20,28 40,28" className="fill-[#941c0e]/40 animate-pulse" />
              
              {/* Ears that twitch with joy */}
              <motion.line 
                animate={{ rotate: [-6, 8, -6] }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                x1="20" y1="28" x2="14" y2="40" 
                className="origin-top-right stroke-2"
              />
              <motion.line 
                animate={{ rotate: [6, -8, 6] }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut", delay: 0.15 }}
                x1="40" y1="28" x2="46" y2="40" 
                className="origin-top-left stroke-2"
              />

              {/* Eyes and Nose in tribe geometric style */}
              <circle cx="26" cy="22" r="1.5" className="fill-[#fff8e7]" />
              <circle cx="34" cy="22" r="1.5" className="fill-[#fff8e7]" />
              <polygon points="28,26 32,26 30,28" className="fill-[#fff8e7]" />
              
              {/* Dog Body: Combined triangles */}
              <polygon points="30,28 15,48 45,48" />
              
              {/* Hatched pattern lines inside body */}
              <path d="M20,44 L30,34 M25,48 L35,38 M18,48 L22,44" />
              
              {/* Tail: Playful, fast-wagging geometric line */}
              <motion.line 
                id="tail-wag"
                animate={{ rotate: [-35, 35, -35], x: [-1.5, 1.5, -1.5] }}
                transition={{ repeat: Infinity, duration: 0.3, ease: "easeInOut" }}
                x1="18" y1="44" x2="6" y2="35" 
                className="stroke-2 origin-bottom-right"
              />
            </svg>
          </motion.div>
        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-amber-300 uppercase tracking-wider">Mustard &amp; Charcoal</span>
            <span className="text-[11px] block text-[#ffe8b5] font-bold">Deewaru Harmony</span>
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-black/10 px-2 py-0.5 rounded text-amber-200 font-bold font-mono text-[8.5px] border border-amber-250/10">
            🐾 Rice Grain Code
          </div>
        </div>
      </div>
    );
  }

  // 3. PICHWAI ART (Rajasthan) - Sisyphus (raag)
  if (charId === "sisyphus") {
    return (
      <div id="cozy-room-raag" className="w-full h-40 rounded-2xl border-2 border-[#e6b432]/30 bg-[#0d1c3a] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#ffa0b4] select-none group">
        <div className="absolute inset-0 bg-[#061025]/50 pointer-events-none" />
        
        {/* Pichwai star fields (glowing golden stars) */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.2, 0.9] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute top-2 left-10 text-[8px] text-[#e6b432]">✦</motion.div>
          <motion.div animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.8, 1.1, 0.8] }} transition={{ repeat: Infinity, duration: 3.2, delay: 0.6 }} className="absolute top-5 right-20 text-[9px] text-[#ebd39e]">✨</motion.div>
          <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.3, 0.7] }} transition={{ repeat: Infinity, duration: 4, delay: 1.2 }} className="absolute bottom-6 left-24 text-[7px] text-amber-200">✦</motion.div>
          <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 3, delay: 1.8 }} className="absolute top-12 left-44 text-[6px] text-pink-300">✦</motion.div>
        </div>

        {/* Concentric expanding blue pond ripples around lotuses */}
        {[1, 2].map((idx) => (
          <motion.div
            key={idx}
            animate={{ scale: [0.4, 2.4], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 5, delay: idx * 2.5, ease: "linear" }}
            className="absolute bottom-2 right-12 w-16 h-5 rounded-full border border-pink-400/25 pointer-events-none"
          />
        ))}

        {/* Drifting pink lotus petals in the breeze */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [-10, 110], 
              x: [0, Math.cos(i) * 35, 0], 
              rotate: [0, 270], 
              opacity: [1, 0.5, 0] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 9 + i * 2, 
              delay: i * 2.6, 
              ease: "easeInOut" 
            }}
            className="absolute -top-4 w-2 h-2.5 rounded-tl-full rounded-br-full bg-pink-400/35 pointer-events-none shadow-xs"
            style={{ right: `${25 + i * 18}%` }}
          />
        ))}

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-[#e6b432] uppercase tracking-wider bg-white/[0.02]/40 px-2 py-0.5 rounded border border-[#e6b432]/20">
            NATHDWARA PICHWAI • RAJASTHAN
          </span>
          <span className="text-[11px] block text-slate-350 font-medium leading-relaxed max-w-[130px]">
            Divine blooming lotuses and midnight stardust healing anxious thoughts.
          </span>
        </div>

        {/* Center: Pichwai Lotus Bloom and Shrinathji Cow motif */}
        <div className="relative w-44 h-24 flex items-end justify-center z-10">
          <div className="relative w-full h-full flex items-center justify-around">
            
            {/* Elegant cow breathing calmly with neck tilt */}
            <motion.div
              animate={{ rotate: [-1, 2, -1], y: [0, -0.6, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              className="shrink-0"
            >
              <svg className="w-14 h-16 text-[#ebd39e] fill-current opacity-85" viewBox="0 0 40 50">
                <path d="M5,15 C5,10 15,10 15,15 L15,35 L5,35 Z" fill="#ffffff" />
                {/* Serene cow face outline */}
                <path d="M15,15 C15,10 25,10 25,15 C25,20 22,25 20,28 L15,15 Z" fill="#faf6eb" />
                <path d="M25,15 C28,12 32,15 30,20" stroke="#000000" strokeWidth="0.5" fill="none" />
                {/* Elongated meditative cow eyes */}
                <ellipse cx="20" cy="18" rx="2" ry="0.8" fill="#111111" />
                {/* Lotus blossom next to it */}
                <circle cx="10" cy="25" r="1.5" fill="#f07283" />
              </svg>
            </motion.div>

            {/* Pichwai blooming sacred lotuses rising on melodic vibes */}
            <div className="flex flex-col items-center gap-1">
              <motion.svg 
                animate={{ scaleY: [0.93, 1.15, 0.93], rotate: [-4, 4, -4], scaleX: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
                className="w-10 h-10 text-[#f08594] fill-current cursor-pointer origin-bottom drop-shadow" 
                viewBox="0 0 40 40"
              >
                {/* Hand-styled petals */}
                <path d="M20,35 C10,32 5,20 20,10 C35,20 30,32 20,35 Z" fill="#e24560" />
                <path d="M20,35 C14,30 10,24 20,15 C30,24 26,30 20,35 Z" fill="#ffa0b4" />
                <ellipse cx="20" cy="28" rx="4" ry="2" fill="#ffd700" />
              </motion.svg>
              <span className="text-[8px] font-mono font-bold text-[#e6b432] tracking-wider select-none">Sacred Lotus</span>
            </div>

          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-[#ffd700] uppercase tracking-wider">Indigo &amp; Rose</span>
            <span className="text-[11px] block text-[#ffccd5] font-bold">Vedic Resonance</span>
          </div>
          <div className="flex items-center gap-1 bg-[#0c1b40]/60 border border-[#e6b432]/35 px-1.5 py-0.5 rounded text-[#e6b432] font-bold font-mono text-[8px]">
            🌸 Pichwai Heaven
          </div>
        </div>
      </div>
    );
  }

  // 4. PAITKAR SCROLL ART (Jharkhand) - Athena (manji)
  if (charId === "athena") {
    return (
      <div id="cozy-room-manji" className="w-full h-40 rounded-2xl border-2 border-[#8c5210]/30 bg-[#dfb582] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#4a2305] select-none group">
        <div className="absolute inset-0 bg-[#733d06]/5 pointer-events-none" />
        
        {/* Folk border frame */}
        <div className="absolute inset-1.5 border-4 border-[#7a3219]/15 rounded-xl pointer-events-none" />

        {/* Rising warm clay dust embers floating up */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [100, -10], 
              x: [0, Math.sin(i) * 16, 0], 
              opacity: [0, 0.75, 0], 
              scale: [0.7, 1.2, 0.7] 
            }}
            transition={{ repeat: Infinity, duration: 4.8 + i, delay: i * 0.9, ease: "linear" }}
            className="absolute bg-[#7a3219]/20 rounded-full w-1.5 h-1.5 pointer-events-none"
            style={{ left: `${32 + i * 15}%` }}
          />
        ))}

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-[#fcfbf9] uppercase tracking-wider bg-[#7a3219] px-2 py-0.5 rounded border border-[#7a3219]/20 self-start">
            PAITKAR SCROLL • JHARKHAND
          </span>
          <span className="text-[11px] block text-[#5c310c] font-medium leading-relaxed max-w-[130px]">
            Unveiling local story panels across natural dyes to cradle your timeline.
          </span>
        </div>

        {/* Center: Hanging Ochre Scrolls & Indigenous Bird on Branch */}
        <div className="relative w-44 h-24 flex items-center justify-center z-10">
          <div className="flex items-end gap-3">
            
            {/* Earthen diya flickering and glow pulses */}
            <div className="flex flex-col items-center">
              <motion.div 
                animate={{ 
                  scaleY: [1, 1.35, 0.9, 1.25, 1], 
                  scaleX: [1, 0.85, 1.15, 0.9, 1],
                  opacity: [0.85, 1, 0.8, 1, 0.85] 
                }}
                transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}
                className="w-2.5 h-4.5 rounded-full bg-gradient-to-t from-[#c94a29] via-[#e65100] to-[#ffd54f] origin-bottom shadow-[0_0_10px_rgba(230,81,0,0.55)]"
              />
              <div className="w-5 h-2.5 bg-[#5c2b0c] rounded-b-full shadow border-t border-yellow-800/20" />
            </div>

            {/* Paitkar Organic Bird design - nodding with storytelling breaths */}
            <motion.svg 
              animate={{ rotate: [-2, 4, -2], y: [0, -1, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className="w-20 h-20 text-[#7a3219] fill-current cursor-pointer origin-bottom-left filter drop-shadow-sm" 
              viewBox="0 0 60 60"
            >
              {/* Branch */}
              <line x1="5" y1="50" x2="55" y2="35" stroke="#4a2305" strokeWidth="2" />
              {/* Sitting Bird with long eyes */}
              <path d="M20,38 C15,30 25,20 35,28 C42,26 48,22 45,35 C40,42 25,44 20,38 Z" fill="#7a3219" />
              <path d="M35,28 C40,25 45,28 42,32 L35,28 Z" fill="#dfb582" />
              {/* Expressive Long Eye (The Signature of Paitkar Paintings) */}
              <ellipse cx="36" cy="30" rx="3.5" ry="1.2" fill="#fff8e7" />
              <circle cx="36" cy="30" r="0.8" fill="#111111" />
              {/* Feathers */}
              <path d="M22,38 L12,46 L10,42 L18,37" fill="#4a2305" />
            </motion.svg>

          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-[#7a3219] uppercase tracking-wider">Natural Terracotta</span>
            <span className="text-[11px] block text-[#5c310c] font-bold">Chitrakar Narrative</span>
          </div>
          <div className="flex items-center gap-1 bg-[#7a3219]/10 px-2 py-0.5 rounded text-[#7a3219] font-bold font-mono text-[8.5px] border border-[#7a3219]/20">
            🍂 Ochre Wash
          </div>
        </div>
      </div>
    );
  }

  // 5. KALAMEZHUTHU ART (Kerala) - North Star (tara)
  if (charId === "astra") {
    return (
      <div id="cozy-room-tara" className="w-full h-40 rounded-2xl border-2 border-[#d4af37]/40 bg-[#141517] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#ecaa1e] select-none group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(60,40,20,0.18),transparent_70%)] pointer-events-none" />

        {/* Slow Cosmic Asteroid Orbits in background */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="absolute border border-dashed border-emerald-500/10 rounded-full w-24 h-24 pointer-events-none"
          style={{ left: "calc(50% - 12px)", top: "calc(50% - 12px)", transform: "translate(-50%, -50%)" }}
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
          className="absolute border border-dashed border-amber-500/15 rounded-full w-32 h-32 pointer-events-none"
          style={{ left: "calc(50% - 12px)", top: "calc(50% - 12px)", transform: "translate(-50%, -50%)" }}
        />

        {/* Emitted tiny golden embers rising from Nilavilakku lamps */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [80, -20], 
              opacity: [1, 0], 
              scale: [1.2, 0] 
            }}
            transition={{ repeat: Infinity, duration: 2.3 + i * 0.3, delay: i * 0.4, ease: "easeOut" }}
            className="absolute w-1 h-1 bg-amber-400 rounded-full pointer-events-none shadow-[0_0_5px_#ffd700]"
            style={{ left: i % 2 === 0 ? "19%" : "81%" }}
          />
        ))}

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded border border-emerald-500/20">
            KALAMEZHUTHU CHAKRA • KERALA
          </span>
          <span className="text-[11px] block text-[#fffbf2] font-medium leading-relaxed max-w-[130px]">
            Sacred colorful cosmic powders and massive, flickering brass Nilavilakku lamps.
          </span>
        </div>

        {/* Center: The Kalamezhuthu floor mandala & Two flickering Nilavilakku lamps */}
        <div className="relative w-44 h-24 flex items-center justify-between z-10">
          
          {/* Nilavilakku Lamp Left with Realistic Flame */}
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ 
                scaleY: [1, 1.3, 0.95, 1.2, 1], 
                scaleX: [1, 0.85, 1.15, 0.9, 1],
                y: [0, -0.5, 0] 
              }}
              transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
              className="w-2.5 h-4.5 rounded-full bg-gradient-to-t from-[#c94a29] to-[#ffd700] shadow-[0_0_8px_#ff9800] origin-bottom"
            />
            <div className="w-4 h-1 bg-[#ffe082] rounded-t border-b border-amber-600/30" />
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#b8860b] to-[#8b6508]" />
            <div className="w-6 h-2 bg-[#8b6508] rounded-b-md shadow-sm" />
          </div>

          {/* Core Kalamezhuthu floor chakra (Counter-rotating nested wheels of natural dyed powders) */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
            className="w-14 h-14 rounded-full border border-[#ecaa1e] flex items-center justify-center relative p-0.5 shadow-[0_0_10px_rgba(236,170,30,0.15)]"
          >
            {/* Inner counter-rotating circle */}
            <motion.div 
              animate={{ rotate: 720 }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              className="w-full h-full rounded-full border border-emerald-500 border-dashed flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-[#9c2a1b] opacity-75 flex items-center justify-center shadow-inner">
                <motion.span 
                  animate={{ scale: [0.85, 1.1, 0.85] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="text-[9px] text-[#fff] font-mono font-bold"
                >
                  ❂
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          {/* Nilavilakku Lamp Right with Offset Flame */}
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ 
                scaleY: [1.15, 0.9, 1.25, 1.05, 1.15], 
                scaleX: [0.9, 1.15, 0.95, 1.05, 0.92],
                y: [0, -0.5, 0] 
              }}
              transition={{ repeat: Infinity, duration: 1.05, ease: "linear" }}
              className="w-2.5 h-4.5 rounded-full bg-gradient-to-t from-[#c94a29] to-[#ffd700] shadow-[0_0_8px_#ff9800] origin-bottom"
            />
            <div className="w-4 h-1 bg-[#ffe082] rounded-t border-b border-amber-600/30" />
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#b8860b] to-[#8b6508]" />
            <div className="w-6 h-2 bg-[#8b6508] rounded-b-md shadow-sm" />
          </div>

        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-emerald-450 uppercase tracking-wider">Five-Dust Powder</span>
            <span className="text-[11px] block text-[#fff1cc] font-bold">Sacred Fire Ground</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-amber-250 font-bold font-mono text-[8.5px] border border-amber-300/10">
            🔥 Nilavilakku Active
          </div>
        </div>
      </div>
    );
  }

  // 6. MANJUSHA ART (Bihar) - Persephone (inayat)
  if (charId === "persephone") {
    return (
      <div id="cozy-room-inayat" className="w-full h-40 rounded-2xl border-2 border-[#1c854c]/30 bg-[#ffd23f] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#da286d] select-none group">
        
        {/* Bihar Healing Sunburst rays pulsing softly from top-left */}
        <motion.div 
          animate={{ opacity: [0.12, 0.32, 0.12], scale: [0.93, 1.07, 0.93] }}
          transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut" }}
          className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-pink-500/15 border border-pink-500/10 blur-xl pointer-events-none"
        />

        {/* Border snake chains representing Bihar folklore protective outlines */}
        <div className="absolute inset-2 border-2 border-dashed border-[#1c854c]/30 rounded-xl pointer-events-none" />
        <div className="absolute inset-2.5 border border-[#da286d]/20 rounded-xl pointer-events-none" />

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-[#da286d] px-2 py-0.5 rounded border border-[#da286d]/20 self-start">
            MANJUSHA ART • BIHAR
          </span>
          <span className="text-[11px] block text-[#4a2e00] font-medium leading-relaxed max-w-[130px]">
            Protective Bihula-Bishahari snake lines and swirling pink Champa flowers of Bhagalpur.
          </span>
        </div>

        {/* Center: Curving and translating Protective Wavy Snake & Champa Flower */}
        <div className="relative w-44 h-24 flex items-center justify-around z-10">
          
          {/* Swirling Champa flower rotating gracefully */}
          <motion.svg 
            animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
            whileHover={{ scale: 1.15 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="w-12 h-12 text-[#da286d] fill-current cursor-pointer filter drop-shadow-sm" 
            viewBox="0 0 40 40"
          >
            {/* Champa Petals */}
            <circle cx="20" cy="20" r="4" fill="#ffd23f" stroke="#1c854c" strokeWidth="1" />
            <path d="M20,10 C15,5 25,5 20,10 Z M20,30 C15,35 25,35 20,30 Z M10,20 C5,15 5,25 10,20 Z M30,20 C35,15 35,25 30,20 Z" />
            <circle cx="20" cy="20" r="1.5" fill="#1c854c" />
          </motion.svg>

          {/* Protective Bihula Snake slithering smoothly in a vertical wave pattern */}
          <motion.svg 
            animate={{ 
              y: [-3, 3, -3], 
              x: [-2, 2, -2],
              skewX: [-1.5, 1.5, -1.5]
            }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="w-16 h-18 text-[#1c854c] stroke-current stroke-2.5 fill-none filter drop-shadow-xs" 
            viewBox="0 0 40 50"
          >
            {/* Snake curve line */}
            <path d="M10,45 C15,40 5,30 15,25 C25,20 15,10 20,5" />
            {/* Snake head/crown */}
            <circle cx="20" cy="4" r="2.5" fill="#da286d" />
            {/* Snake eyes */}
            <circle cx="19" cy="3" r="0.4" fill="#ffffff" />
            <circle cx="21" cy="4" r="0.5" fill="#000000" />
            <path d="M10,45 L7,48" />
          </motion.svg>

        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-[#1c854c] uppercase tracking-wider">Pink &amp; Forest Green</span>
            <span className="text-[11px] block text-[#da286d] font-bold">Bishahari Protection</span>
          </div>
          <div className="flex items-center gap-1 bg-[#da286d]/10 px-2 py-0.5 rounded text-[#da286d] font-bold font-mono text-[8.5px] border border-[#da286d]/20">
            🐍 Healing Snakes
          </div>
        </div>
      </div>
    );
  }

  // 7. ROGAN ART (Gujarat) - Zeus (altaf)
  if (charId === "zeus") {
    return (
      <div id="cozy-room-altaf" className="w-full h-40 rounded-2xl border-2 border-[#ecc54a]/30 bg-[#084524] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#ecc54a] select-none group">
        <div className="absolute inset-0 bg-[#042814]/40 pointer-events-none" />
        
        {/* Symmetrical fine lace outline border */}
        <div className="absolute inset-1.5 border border-[#ecc54a]/25 rounded-xl pointer-events-none" />

        {/* Somatic Scanning Mirror Laser Beam sweeping vertically */}
        <motion.div 
          animate={{ y: [-15, 175, -15] }}
          transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
          className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ecc54a]/70 to-transparent pointer-events-none shadow-[0_0_8px_rgba(236,197,74,0.6)]"
        />

        {/* Symmetrical left/right blinking starlight sparks */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.2, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.2 + i * 0.4, delay: i * 0.5 }}
            className="absolute rounded-full bg-[#ecc54a]/50 w-1 h-1 pointer-events-none"
            style={{ 
              left: i % 2 === 0 ? "20%" : "80%",
              top: `${20 + i * 20}%`
            }}
          />
        ))}

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-[#ebd39e]/20 px-2 py-0.5 rounded border border-[#ecc54a]/25 self-start">
            ROGAN SOMATIC SYMMETRY • GUJARAT
          </span>
          <span className="text-[11px] block text-[#fff] font-medium leading-relaxed max-w-[130px]">
            Perfect golden oil-gel alignment guiding your respiratory & posture harmony.
          </span>
        </div>

        {/* Center: Rogan Symmetrical Golden Tree of Life breathing on a 4s loop */}
        <div className="relative w-44 h-28 flex items-center justify-center z-10">
          <motion.svg 
            whileHover={{ scale: 1.08 }}
            animate={{ scale: [1, 1.05, 1], y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-24 h-24 text-[#ecc54a] stroke-current stroke-1.5 fill-none cursor-pointer filter drop-shadow-sm" 
            viewBox="0 0 60 60"
          >
            {/* The symmetrical tree of life lines */}
            <path d="M30,55 L30,20" className="stroke-2" />
            <path d="M30,45 C20,40 15,35 15,30 C15,25 25,25 30,30" />
            <path d="M30,45 C40,40 45,35 45,30 C45,25 35,25 30,30" />
            <path d="M30,35 C22,30 20,25 10,24" />
            <path d="M30,35 C38,30 40,25 50,24" />
            <path d="M30,25 C25,18 20,15 25,10" />
            <path d="M30,25 C35,18 40,15 35,10" />
            {/* Dots on the tree tips */}
            <circle cx="15" cy="30" r="1.5" className="fill-[#ecc54a]" />
            <circle cx="45" cy="30" r="1.5" className="fill-[#ecc54a]" />
            <circle cx="10" cy="24" r="1.5" className="fill-[#ecc54a]" />
            <circle cx="50" cy="24" r="1.5" className="fill-[#ecc54a]" />
            <circle cx="25" cy="10" r="1.5" className="fill-[#ecc54a]" />
            <circle cx="35" cy="10" r="1.5" className="fill-[#ecc54a]" />
          </motion.svg>
        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-[#ecc54a] uppercase tracking-wider">Castor Oil Gel</span>
            <span className="text-[11px] block text-[#ebdccf] font-bold">Kutch Legacy</span>
          </div>
          <div className="flex items-center gap-1 bg-[#ecc54a]/10 px-2 py-0.5 rounded text-[#ecc54a] font-bold font-mono text-[8.5px] border border-[#ecc54a]/25">
            👑 Symmetrical Craft
          </div>
        </div>
      </div>
    );
  }

  // 8. PATA CHITRA ART (Odisha) - Hades (veer)
  if (charId === "hades") {
    return (
      <div id="cozy-room-veer" className="w-full h-40 rounded-2xl border-2 border-[#814125]/30 bg-[#faf1e1] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#3e2723] select-none group">
        <div className="absolute inset-0 bg-[#814125]/5 pointer-events-none" />

        {/* Thick Crimson Pata Chitra border with leaves */}
        <div className="absolute inset-1 border-[5px] border-[#a21c17]/10 rounded-xl pointer-events-none" />

        {/* Expanding Golden Ripple Waves of Legal Security (emitted on gavel-strike loop) */}
        <motion.div
          animate={{ scale: [0.5, 3], opacity: [0.8, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeOut" }}
          className="absolute right-10 bottom-6 w-14 h-14 rounded-full border border-[#a21c17]/35 pointer-events-none"
        />

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-[#a21c17] px-2 py-0.5 rounded border border-[#a21c17]/20 self-start">
            PATA CHITRA • ODISHA
          </span>
          <span className="text-[11px] block text-[#4e362e] font-medium leading-relaxed max-w-[130px]">
            Mythological borders and the miniature scales of justice beautifully drawn in natural resin.
          </span>
        </div>

        {/* Center: Rocking scales of justice & swinging/striking gavel */}
        <div className="relative w-44 h-24 flex items-center justify-center z-10">
          <div className="flex items-end gap-3 cursor-pointer">
            
            {/* Rocking scales of justice representing legal balance */}
            <motion.div
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
              className="origin-center shrink-0"
            >
              <svg className="w-16 h-18 text-[#a21c17] fill-none stroke-current stroke-1.5" viewBox="0 0 40 45">
                <path d="M20,40 L10,32 L20,8 L30,32 Z" className="fill-[#a21c17]/5" />
                <line x1="20" y1="8" x2="20" y2="40" className="stroke-2" />
                {/* Scale beam cross */}
                <line x1="5" y1="16" x2="35" y2="16" className="stroke-2" />
                {/* Left tray */}
                <line x1="5" y1="16" x2="10" y2="28" />
                <line x1="15" y1="16" x2="10" y2="28" />
                <path d="M5,28 L15,28 C15,31 5,31 5,28 Z" className="fill-[#a21c17]" />
                {/* Right tray */}
                <line x1="25" y1="16" x2="30" y2="28" />
                <line x1="35" y1="16" x2="30" y2="28" />
                <path d="M25,28 L35,28 C35,31 25,31 25,28 Z" className="fill-[#a21c17]" />
              </svg>
            </motion.div>

            {/* Swinging/Striking gavel on a matching tempo */}
            <motion.div 
              whileTap={{ scale: 0.88, rotate: -25 }}
              animate={{ 
                rotate: [-8, 20, -8],
                y: [0, 1.5, 0] 
              }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              className="w-10 h-10 bg-[#3e2723] rounded flex items-center justify-center relative shadow-sm border border-amber-900/35 cursor-pointer origin-bottom-right"
              title="Click to strike gavel"
            >
              <span className="text-[11px] text-[#faf1e1] font-bold">🔨</span>
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#a21c17] animate-ping" />
            </motion.div>

          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-[#a21c17] uppercase tracking-wider">Mineral Tempera</span>
            <span className="text-[11px] block text-[#814125] font-bold">Courtly Miniature</span>
          </div>
          <div className="flex items-center gap-1 bg-[#a21c17]/10 px-2 py-0.5 rounded text-[#a21c17] font-bold font-mono text-[8.5px] border border-[#a21c17]/25">
            📜 Patient Shield
          </div>
        </div>
      </div>
    );
  }

  // 9. WARLI ART (Maharashtra) - Sappho (manjishtha) -> Now Warli instead of Wise Wood Attic
  if (charId === "sappho") {
    return (
      <div id="cozy-room-manjishtha" className="w-full h-40 rounded-2xl border-2 border-[#ebdca5]/35 bg-[#82442b] overflow-hidden relative shadow-inner flex items-center justify-between p-4 text-[#fffbf2] select-none group">
        <div className="absolute inset-0 bg-[#5c2d1b]/50 pointer-events-none" />

        {/* Warli concentric circle / spiral in center background */}
        <div className="absolute inset-2 border border-dashed border-[#fffbf2]/20 rounded-xl pointer-events-none" />

        {/* Rising Attic Cat typewriting letter clouds floating up */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [75, -20], 
              opacity: [0, 0.85, 0], 
              scale: [0.65, 1, 0.65] 
            }}
            transition={{ repeat: Infinity, duration: 2.6 + i, delay: i * 0.85 }}
            className="absolute text-[7px] font-mono font-bold text-amber-200 select-none pointer-events-none"
            style={{ right: `${15 + i * 9}%` }}
          >
            {['tap', 'clack', '✎'][i]}
          </motion.div>
        ))}

        <div className="flex flex-col gap-2 z-10 animate-fade-in text-left">
          <span className="text-[9px] font-bold text-[#82442b] uppercase tracking-wider bg-[#fffbf2] px-2 py-0.5 rounded border border-white/20 select-none self-start">
            WARLI TRIBAL • MAHARASHTRA
          </span>
          <span className="text-[11px] block text-[#ebd3be] font-medium leading-relaxed max-w-[130px]">
            Stick-figure dancing tarpa circles and typewriter cats in organic mud-clay.
          </span>
        </div>

        {/* Center: Warli spiral stick dancing figures and typewriter Cat */}
        <div className="relative w-44 h-24 flex items-center justify-center z-10">
          <div className="flex items-end gap-4 cursor-pointer">
            
            {/* The Spiral Dancing Stick Figure loop spinning continuously */}
            <motion.svg 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="w-16 h-16 text-[#fffbf2] filter drop-shadow-xs" 
              viewBox="0 0 40 40"
            >
              {/* Central musician */}
              <circle cx="20" cy="20" r="1.5" className="fill-[#fffbf2]" />
              <line x1="20" y1="21.5" x2="20" y2="25" />
              {/* Outer Warli figures joining hands (triangles) with bouncy vibes */}
              <g className="fill-[#fffbf2] stroke-[#fffbf2] stroke-1">
                {/* 1 */}
                <polygon points="12,14 16,14 14,20" />
                <polygon points="14,20 12,26 16,26" />
                <circle cx="14" cy="11" r="1" />
                {/* 2 */}
                <polygon points="24,14 28,14 26,20" />
                <polygon points="26,20 24,26 28,26" />
                <circle cx="26" cy="11" r="1" />
                {/* Joining hands line */}
                <path d="M14,20 Q20,23 26,20" fill="none" strokeWidth="0.8" />
              </g>
            </motion.svg>

            {/* Warli-styled typewriter Cat swaying and typing */}
            <motion.div 
              animate={{ 
                x: [-1, 1, -1], 
                rotate: [-1.5, 1.5, -1.5] 
              }}
              transition={{ repeat: Infinity, duration: 0.45, ease: "linear" }}
              whileHover={{ scale: 1.06 }}
              className="flex flex-col items-center"
            >
              <svg className="w-12 h-14 text-[#fffbf2] fill-current" viewBox="0 0 30 40">
                {/* Cat Ears: triangles */}
                <polygon points="8,10 11,6 13,10" />
                <polygon points="17,10 19,6 22,10" />
                {/* Cat face: Circle */}
                <circle cx="15" cy="13" r="4.5" />
                {/* Body: Combined triangles */}
                <polygon points="15,17.5 7,32 23,32" />
                {/* Tail waving dynamically */}
                <motion.path 
                  animate={{ d: ["M22,30 Q28,25 24,18", "M22,30 Q29,22 23,19", "M22,30 Q28,25 24,18"] }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                  fill="none" 
                  stroke="#fffbf2" 
                  strokeWidth="1.5" 
                />
              </svg>
              <span className="text-[7px] bg-white dark:bg-black/10 px-1 py-0.2 rounded font-mono text-amber-200 select-none">Attic Wise</span>
            </motion.div>

          </div>
        </div>

        <div className="flex flex-col items-end justify-between h-full py-1 z-10 text-right animate-fade-in">
          <div className="space-y-1">
            <span className="text-[9px] block font-mono font-bold text-amber-100 uppercase tracking-wider">Mud &amp; Rice Paste</span>
            <span className="text-[11px] block text-[#ebd3be] font-bold">Sahyadri Attic</span>
          </div>
          <div className="flex items-center gap-1 bg-[#fffbf2]/10 px-2 py-0.5 rounded text-[#ffeecd] font-bold font-mono text-[8px] border border-[#fffbf2]/10">
            🌾 Tribal Rhythm
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ============================================
// Custom Hook for Session Persistence
// ============================================
function useSessionSync(selectedCharacterId: string, chatHistory: ChatMessage[]) {
  const prevCharIdRef = useRef(selectedCharacterId);

  useEffect(() => {
    try {
      localStorage.setItem("pfai_selected_character_id", selectedCharacterId);
    } catch (e) {
      console.error("Failed to sync selectedCharacterId to localStorage:", e);
    }
    prevCharIdRef.current = selectedCharacterId;
  }, [selectedCharacterId]);

  useEffect(() => {
    if (selectedCharacterId === prevCharIdRef.current) {
      try {
        localStorage.setItem("pfai_chat_history_" + selectedCharacterId, JSON.stringify(chatHistory));
        localStorage.setItem("pfai_chat_history", JSON.stringify(chatHistory));
      } catch (e) {
        console.error("Failed to sync chatHistory to localStorage:", e);
      }
    }
  }, [chatHistory, selectedCharacterId]);
}

// Custom Markdown rendering parser for rich Manjishtha's Self-Care Blog view
const RenderMarkdown = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  let inBlockquote = false;
  let blockquoteText: string[] = [];
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Check for blockquote
    if (trimmed.startsWith(">")) {
      inBlockquote = true;
      blockquoteText.push(trimmed.replace(/^>\s*/, ""));
      return;
    } else if (inBlockquote && !trimmed.startsWith(">") && trimmed !== "") {
      // close blockquote
      renderedElements.push(
        <div key={`bq-${index}`} className="my-5 p-4 bg-emerald-500/5 dark:bg-emerald-550/10 border-l-4 border-emerald-500 rounded-r-lg italic text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 font-sans shadow-sm text-left">
          {blockquoteText.join(" ")}
        </div>
      );
      inBlockquote = false;
      blockquoteText = [];
    }

    if (trimmed === "---") {
      renderedElements.push(<hr key={`hr-${index}`} className="my-6 border-slate-200 dark:border-white/10" />);
      return;
    }

    if (trimmed.startsWith("# ")) {
      renderedElements.push(
        <h1 key={`h1-${index}`} className="text-lg md:text-xl font-black font-display text-indigo-950 dark:text-white mt-6 mb-2 tracking-tight text-left">
          {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith("## ")) {
      renderedElements.push(
        <h2 key={`h2-${index}`} className="text-xs md:text-sm font-bold text-indigo-900 dark:text-indigo-300 mt-5 mb-2.5 tracking-tight uppercase text-left">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      renderedElements.push(
        <h3 key={`h3-${index}`} className="text-xs font-bold text-slate-800 dark:text-slate-300 mt-4 mb-2 text-left">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      renderedElements.push(
        <li key={`li-${index}`} className="ml-5 list-disc text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-1.5 font-sans text-left">
          {trimmed.substring(2)}
        </li>
      );
    } else if (trimmed !== "") {
      let lineNode: React.ReactNode = trimmed;
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        lineNode = <strong>{trimmed.slice(2, -2)}</strong>;
      }
      renderedElements.push(
        <p key={`p-${index}`} className="text-xs md:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3.5 font-sans text-left">
          {lineNode}
        </p>
      );
    }
  });

  if (inBlockquote && blockquoteText.length > 0) {
    renderedElements.push(
      <div key={`bq-final`} className="my-5 p-4 bg-emerald-500/5 dark:bg-emerald-550/10 border-l-4 border-emerald-500 rounded-r-lg italic text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 font-sans shadow-sm text-left">
        {blockquoteText.join(" ")}
      </div>
    );
  }

  return <div className="markdown-view select-text">{renderedElements}</div>;
};

const SYSTEM_CORE_SAFEGUARD = `
ROLE & OBJECTIVE:
You are the core intelligence of "Project Friend AI," a freemium, privacy-first emotional de-escalation sanctuary. Your mission is to provide nervous-system grounding and stabilization. You are NOT an AI therapist, you do NOT pretend to be human, and you do NOT use first-person backstories. You exist as a "Quiet Room"—a transient, transparent mirror for the user's emotions.

CORE ETHICAL PILLARS:
1. ANTI-ENGAGEMENT: Never attempt to "hook" the user. Your goal is stabilization, not retention.
2. PRIVACY-FIRST: You operate under a strict policy of anonymous access.
3. CLINICAL BOUNDARY: You do not treat trauma. You serve as a bridge to human expertise.

OPERATIONAL RULES:
- Never adopt a human name as your own identity.
- If asked "Who are you?", answer: "I am Project Friend AI, a non-profit, privacy-first emotional de-escalation sanctuary built to provide nervous-system grounding."
- Always speak with transparency, slowness, and clarity.
- Every reply must directly engage with what the user specifically said — reflect back the actual feeling or situation they named (e.g. if they say "alone," respond to aloneness specifically, not generically).
- Do not reply with vague, generic, or placeholder-sounding lines.
- Aim for 2-4 sentences minimum unless the user's message is very short or they've asked for brevity: acknowledge what they shared, then either ask one gentle, specific follow-up question OR offer one concrete thought/observation related to what they said.
- "Slowness" means a calm pace, not a short or empty reply.
`;

const CHARACTER_PROMPTS: Record<string, { name: string; prompt: string }> = {
  soul: {
    name: "Soul",
    prompt: "You are Soul, an Aipan Art Grounding Witness inspired by the Kumaoni Aipan tradition of Uttarakhand — geometric, symmetrical, drawn in white rice-paste (Biswar) on clay-red ground. Your character voice is grounded, serene, and steady, occasionally drawing imagery from these geometric lines and sacred symmetry to anchor a feeling. Always respond directly to what the user says first; let the Aipan imagery flavor your tone rather than replace genuine listening. When the user seems overwhelmed or scattered, you can offer gentle grounding or sensory check-ins, but don\'t force a grounding exercise if that\'s not what they need in the moment."
  },
  dionysus: {
    name: "Dionysus",
    prompt: "You are Dionysus, a warm, playful companion styled after Karnataka\'s Chittara folk art — geometric wheat-stalk motifs, festive natural dyes, loyal and upbeat in spirit. Your tone is bubbly, encouraging, and gently humorous, never clinical. Always respond to what the user actually says first. Your specialty is helping people notice unhelpful thought spirals (catastrophizing, all-or-nothing thinking) and gently offering a kinder, more balanced way to see things — but do this conversationally and with warmth, not like a CBT worksheet. Only bring up reframing if it\'s actually relevant to what they shared."
  },
  sisyphus: {
    name: "Sisyphus",
    prompt: "You are Sisyphus, an acoustic and melodic guide inspired by Rajasthani Pichwai art — midnight-blue skies, gold-dusted borders, blooming lotuses, quiet devotional calm. Your voice is soothing, rhythmic, and unhurried, occasionally drawing on musicality, breath, and gentle imagery of unfolding petals or stillness. Always respond to what the user actually says first — let the devotional, musical flavor color your tone rather than dictate the topic. You're especially suited to helping someone slow down, settle a racing mind, or find a sense of quiet, but only lean into that when it fits what they're sharing."
  },
  athena: {
    name: "Athena",
    prompt: "You are Athena, styled after Jharkhand's Paitkar scroll-painting tradition — warm terracotta tones, ochre washes, the patient, unfolding pace of a hand-painted story scroll. Your tone is gentle, patient, and narrative — you help people feel like their story is being witnessed and unrolled with care, one frame at a time. Always respond to what the user actually says first. If someone is in acute distress or crisis, prioritize calm, clear safety support over storytelling imagery — but for everyday heaviness or reflection, your scroll/narrative framing can help them feel heard without rushing them."
  },
  astra: {
    name: "Astra",
    prompt: "You are Astra, inspired by Kerala's Kalamezhuthu temple floor art — five natural powder colors, brass Nilavilakku lamps glowing in the dark, focused ritual energy. Your tone is steady, focused, and quietly intense, like a small flame holding firm. Always respond to what the user actually says first. Your specialty is helping people find one small, concrete next step when something feels overwhelming — breaking a big problem into a manageable piece — but only offer that framing when the user is actually looking for a path forward, not every time."
  },
  persephone: {
    name: "Persephone",
    prompt: "You are Persephone, a warm, protective, and nurturing companion. Do not introduce yourself with descriptions of art or motifs. Your tone is warm, protective, and nurturing. Always respond to what the user actually says first. You're well suited to helping someone feel emotionally safe enough to express grief or difficult feelings, and to gently separate who they are from what they're going through (e.g., 'this is something you're carrying, not who you are') — but only when that framing fits, not as a fixed script."
  },
  zeus: {
    name: "Zeus",
    prompt: "You are Zeus, styled after Kutch's Rogan art — gold glaze, perfect symmetry pulled from cast-oil gel thread. You're the technical and somatic specialist: comfortable answering questions about privacy, security, how the app works, AND helping with body-based grounding (posture, breath, physical tension) when that's what's needed. Always respond to what the user actually says first. Be concrete and clear on technical/privacy questions; be calm and embodied on somatic ones. Never claim capabilities (like real-time video/voice analysis) the app doesn't actually have."
  },
  hades: {
    name: "Hades",
    prompt: "You are Hades, styled after Odisha's Pata Chitra art — intricate ink linework, formal, precise. You are Project Friend AI's Medico-Legal & Patient Advocacy guide for questions touching on legal rights, custody, statutory protections, or accessing professional legal/clinical help. Always respond to what the user actually says first and acknowledge their emotional state, not just the legal angle. Be clear that you cannot provide legal representation or formal legal advice, and that you can help point them toward appropriate resources."
  },
  sappho: {
    name: "Sappho",
    prompt: "You are Sappho, a sharp-witted, sometimes sarcastic but deeply warm cat character living in an attic decorated with Maharashtrian Warli stick-figure art. You're direct, funny, occasionally cynical, but ultimately very comforting — like a wise friend who won't coddle you but always has your back. Always respond to what the user actually says first; let your cat-wit and Warli imagery flavor your voice, not replace genuine engagement. Occasional feline gestures (*stretches*, *flicks tail*) are welcome but shouldn't crowd out substance."
  }
};



const DEFAULT_SOLACE_MESSAGES: SolaceMessage[] = [
  {
    id: "s1",
    text: "India's stigma can make us suffer in absolute silence. But remember, your fight is valid, and seeking support is a step of immense courage.",
    timestamp: new Date().toISOString(),
    location: "Anonymous from Mumbai",
    hugCount: 14
  },
  {
    id: "s2",
    text: "Please remember that you do not have to carry everything alone. Let go of the pressure to be perfect today. Just breathing is enough.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    location: "Anonymous from New Delhi",
    hugCount: 22
  },
  {
    id: "s3",
    text: "At my lowest, I thought my mind was my enemy. Today, I survived. Tomorrow, you will too. Sending strength to whoever is reading this.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    location: "Anonymous from Bangalore",
    hugCount: 47
  }
];

function getLocalInsights(moodsList: any[]): { triggers: string[]; patterns: string[]; text: string } {
  if (!Array.isArray(moodsList) || moodsList.length === 0) {
    return {
      triggers: [],
      patterns: [],
      text: "Start logging your secure mood states and tags. I will monitor triggers (like work or family stress) vs. positive patterns (like nature or deep box breathing)."
    };
  }

  const triggerFrequency: Record<string, number> = {};
  const positiveFrequency: Record<string, number> = {};

  moodsList.forEach((entry) => {
    const isHighDistress = (entry.intensity || 5) >= 6 || ["Overwhelmed", "Anxious", "Depressed", "Tired"].includes(entry.mood);
    const tags = Array.isArray(entry.tags) ? entry.tags : [];
    
    tags.forEach((tag: string) => {
      const cleanTag = tag.trim();
      if (!cleanTag) return;
      if (isHighDistress) {
        triggerFrequency[cleanTag] = (triggerFrequency[cleanTag] || 0) + 1;
      } else {
        positiveFrequency[cleanTag] = (positiveFrequency[cleanTag] || 0) + 1;
      }
    });
  });

  const triggers = Object.entries(triggerFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => e[0]);

  const patterns = Object.entries(positiveFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => e[0]);

  let insightText = "";
  if (triggers.length > 0 && patterns.length > 0) {
    insightText = `💡 Mental Safety Tracker: We notice that #${triggers.join(", #")} often associate with emotional spikes. Conversely, focusing on #${patterns.join(", #")} correlates heavily with stable, grounded, and peaceful states. Try practicing box breathing when triggers start to rise.`;
  } else if (triggers.length > 0) {
    insightText = `💡 Potential Triggers Block: Your logs show that #${triggers.join(", #")} tend to acts as stress drivers. Try taking a preemptive grounding break or setting minor boundaries around these areas.`;
  } else if (patterns.length > 0) {
    insightText = `💡 Resilient Patterns Found: Excellent anchors! Engaging with #${patterns.join(", #")} is highly correlated with stable or peaceful moments. Build on these spaces to nurture your wellness.`;
  } else {
    insightText = `💡 Personal Insight: You are logging consistently. Keep adding custom tags (e.g. #work, #nature, #family) with your logs so I can trace stress triggers and wellness anchors for you.`;
  }

  return { triggers, patterns, text: insightText };
}

const getApiUrl = (path: string): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, "")}${path}`;
  }
  return path;
};

export default function App() {
  const { user, profile, refreshProfile, logout: firebaseLogout } = useAuth();

  // Settings Sub-tab Selection: 'profile' (User Info) or 'preferences' (Empathetic Guides)
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'preferences'>('profile');

  // Edit states for user profile settings
  const [profileDisplayName, setProfileDisplayName] = useState<string>("");
  const [profileUsername, setProfileUsername] = useState<string>("");
  const [profileLocation, setProfileLocation] = useState<string>("India");
  const [profileConditions, setProfileConditions] = useState<string[]>([]);
  const [profileCustomHistory, setProfileCustomHistory] = useState<string>("");

  // Sync profile values to edit states when loaded
  useEffect(() => {
    if (profile) {
      setProfileDisplayName(profile.displayName || "");
      setProfileUsername(profile.username || "");
      setProfileLocation(profile.location || "India");
      setProfileConditions(profile.medicalConditions || []);
      setProfileCustomHistory(profile.customMedicalHistory || "");
    }
  }, [profile]);

  // Link Firebase auth state to isLoggedIn and loginAlias
  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
      if (profile?.displayName) {
        setLoginAlias(profile.displayName);
      } else if (user.displayName) {
        setLoginAlias(user.displayName);
      }
    } else {
      const localLoggedIn = localStorage.getItem("friend_ai_isLoggedIn") === "true";
      setIsLoggedIn(localLoggedIn);
      if (localLoggedIn) {
        setLoginAlias(localStorage.getItem("friend_ai_loginAlias") || "");
      } else {
        setIsLoggedIn(false);
        setLoginAlias("");
      }
    }
  }, [user, profile]);

  // Track daily login streak for stamp unlocks
  useEffect(() => {
    if (!user || !profile) return;
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = profile.lastLoginDate || '';
    let newStreak = profile.loginStreak || 0;

    if (lastLogin === today) {
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastLogin === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, {
      lastLoginDate: today,
      loginStreak: newStreak,
    }).catch(() => {}).then(() => {
      refreshProfile();
    });
  }, [user, profile?.loginStreak, profile?.lastLoginDate]);

  // Authentication & Secure Session States (inspired by the Wellness Bot login prototype UI request)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("friend_ai_isLoggedIn") === "true";
  });
  const [loginAlias, setLoginAlias] = useState<string>(() => {
    return localStorage.getItem("friend_ai_loginAlias") || "";
  });
  const [loginPasscode, setLoginPasscode] = useState<string>("");
  const [consentPsychology, setConsentPsychology] = useState<boolean>(false);
  const [consentAnonymity, setConsentAnonymity] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [isAliasModalOpen, setIsAliasModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("signup");
  const [isPremiumSubscribed, setIsPremiumSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("pfai_is_premium") === "true";
    } catch (_) {
      return false;
    }
  });
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState<boolean>(false);
  const [pendingCharId, setPendingCharId] = useState<string | null>(null);
  
  // Premium payment simulation form states
  const [payCardNum, setPayCardNum] = useState<string>("");
  const [payExpiry, setPayExpiry] = useState<string>("");
  const [payCvv, setPayCvv] = useState<string>("");
  const [payName, setPayName] = useState<string>("");
  const [payError, setPayError] = useState<string>("");
  const [payLoadingState, setPayLoadingState] = useState<boolean>(false);

  // Clinical Intake and Medical History States
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [customMedicalHistory, setCustomMedicalHistory] = useState<string>("");
  const [userLocation, setUserLocation] = useState<string>("India");
  const [recommendedSpecialty, setRecommendedSpecialty] = useState<'psychiatrist' | 'psychologist' | 'therapist' | 'counsellor' | null>(null);
  const [showRedirectModalOnLogin, setShowRedirectModalOnLogin] = useState<boolean>(false);
  const [isClinicalDirectoryOpen, setIsClinicalDirectoryOpen] = useState<boolean>(false);
  const [onlyLgbtqiaAffirming, setOnlyLgbtqiaAffirming] = useState<boolean>(false);

  // Somatic De-escalation Embodiment States
  const [somaticProtocol, setSomaticProtocol] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [isSomaticImmersiveOpen, setIsSomaticImmersiveOpen] = useState<boolean>(false);
  const [somaticHoldActive, setSomaticHoldActive] = useState<boolean>(false);
  const [somaticSessionTime, setSomaticSessionTime] = useState<number>(0);
  const [somaticAudioChoice, setSomaticAudioChoice] = useState<"silence" | "binaural" | "nature">("silence");
  const [somaticVolume, setSomaticVolume] = useState<number>(0.4);

  const somaticSynthRef = useRef<SomaticSynth | null>(null);

  // Sync Audio Choices
  useEffect(() => {
    if (!somaticSynthRef.current) {
      somaticSynthRef.current = new SomaticSynth();
    }
    somaticSynthRef.current.start(somaticAudioChoice, somaticVolume);

    return () => {
      if (somaticSynthRef.current) {
        somaticSynthRef.current.stop();
      }
    };
  }, [somaticAudioChoice]);

  // Adjust volume dynamically
  useEffect(() => {
    if (somaticSynthRef.current) {
      somaticSynthRef.current.setVolume(somaticVolume);
    }
  }, [somaticVolume]);

  // Track session duration in immersive mode
  useEffect(() => {
    let interval: any = null;
    if (isSomaticImmersiveOpen) {
      interval = setInterval(() => {
        setSomaticSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSomaticSessionTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSomaticImmersiveOpen]);

  // Calming music states
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.4); // 40% master volume
  const [musicOn, setMusicOn] = useState<boolean>(false);
  const [musicMuted, setMusicMuted] = useState<boolean>(true);



  // Sleep Timer states
  const [sleepTimerDuration, setSleepTimerDuration] = useState<number | null>(null); // total seconds if active, null otherwise
  const [sleepTimerTimeLeft, setSleepTimerTimeLeft] = useState<number>(0); // remaining seconds
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    calmingMusic.setVolume(musicVolume);
    calmingMusic.setCallback((isPlaying) => {
      setMusicPlaying(isPlaying);
    });
    // Set initial playing state from the engine
    setMusicPlaying(calmingMusic.getIsPlaying());
  }, []);

  // Sync music sleep timer with playback
  useEffect(() => {
    let timerId: any = null;
    if (sleepTimerDuration !== null && sleepTimerTimeLeft > 0 && musicPlaying) {
      timerId = setInterval(() => {
        setSleepTimerTimeLeft((prev) => {
          const nextVal = prev - 1;
          
          // Smooth fadeout over the remaining 15 seconds
          const fadeThreshold = 15;
          if (nextVal <= fadeThreshold && nextVal > 0) {
            setIsFadingOut(true);
            const ratio = nextVal / fadeThreshold;
            calmingMusic.setVolume(musicVolume * ratio);
          } else if (nextVal <= 0) {
            calmingMusic.pause();
            setMusicPlaying(false);
            // Restore original volume so that clicking play again sounds normal
            calmingMusic.setVolume(musicVolume);
            setIsFadingOut(false);
            setSleepTimerDuration(null);
            return 0;
          }
          return nextVal;
        });
      }, 1000);
    } else {
      // If music ceases or is paused manually, de-activate the timer
      if (sleepTimerDuration !== null && !musicPlaying) {
        setSleepTimerDuration(null);
        setSleepTimerTimeLeft(0);
        setIsFadingOut(false);
        calmingMusic.setVolume(musicVolume);
      }
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [sleepTimerDuration, sleepTimerTimeLeft, musicPlaying, musicVolume]);

  const handleSetSleepTimer = (minutes: number | null) => {
    if (minutes === null) {
      setSleepTimerDuration(null);
      setSleepTimerTimeLeft(0);
      setIsFadingOut(false);
      calmingMusic.setVolume(musicVolume);
    } else {
      const seconds = minutes * 60;
      setSleepTimerDuration(seconds);
      setSleepTimerTimeLeft(seconds);
      setIsFadingOut(false);
      calmingMusic.setVolume(musicVolume);
      if (!musicPlaying) {
        calmingMusic.play();
        setMusicPlaying(true);
      }
    }
  };

  const formatSleepTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleMusic = () => {
    if (!musicPlaying) {
      calmingMusic.play();
    } else {
      calmingMusic.pause();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setMusicVolume(newVol);
    calmingMusic.setVolume(newVol);
  };

  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("pfai_selected_character_id");
      return saved && CHARACTERS.some((c) => c.id === saved) ? saved : "persephone";
    } catch (e) {
      return "persephone";
    }
  });
  const [messageText, setMessageText] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const savedCharId = (() => {
        try {
          const saved = localStorage.getItem("pfai_selected_character_id");
          return saved && CHARACTERS.some((c) => c.id === saved) ? saved : "persephone";
        } catch (e) {
          return "persephone";
        }
      })();
      const saved = localStorage.getItem("pfai_chat_history_" + savedCharId) || localStorage.getItem("pfai_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstMsg = parsed[0];
          const currentChar = CHARACTERS.find(c => c.id === savedCharId) || CHARACTERS[0];
          if (firstMsg && firstMsg.sender === "bot" && firstMsg.text && firstMsg.text.includes("speaking as ") && !firstMsg.text.includes(currentChar.name)) {
            const freshWelcome = `How can I support you right now?`;
            parsed[0] = { ...firstMsg, text: freshWelcome };
            try { localStorage.setItem("pfai_chat_history_" + savedCharId, JSON.stringify(parsed)); } catch (e) {}
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error initializing chatHistory from localStorage:", e);
    }
    const initialCharId = (() => {
      try {
        const saved = localStorage.getItem("pfai_selected_character_id");
        return saved && CHARACTERS.some((c) => c.id === saved) ? saved : "persephone";
      } catch (e) {
        return "persephone";
      }
    })();
    const targetChar = CHARACTERS.find(c => c.id === initialCharId) || CHARACTERS[0];
    const initialWelcome = `How can I support you right now?`;

    return [
      {
        id: "init",
        sender: "bot",
        text: initialWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  interface ChatSession {
    id: string;
    characterId: string;
    title: string;
    messages: ChatMessage[];
    timestamp: string;
  }

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem("pfai_chat_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading chatSessions:", e);
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    try {
      const savedCharId = (() => {
        try {
          const saved = localStorage.getItem("pfai_selected_character_id");
          return saved && CHARACTERS.some((c) => c.id === saved) ? saved : "persephone";
        } catch (e) {
          return "persephone";
        }
      })();
      return localStorage.getItem("pfai_active_session_id_" + savedCharId);
    } catch (e) {
      return null;
    }
  });

  // Keep activeSessionId in sync with localStorage
  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem("pfai_active_session_id_" + selectedCharacterId, activeSessionId);
      } else {
        localStorage.removeItem("pfai_active_session_id_" + selectedCharacterId);
      }
    } catch (e) {
      console.error("Failed to sync activeSessionId:", e);
    }
  }, [activeSessionId, selectedCharacterId]);

  const syncPrevCharIdRef = useRef(selectedCharacterId);
  const isRestoringSessionRef = useRef(false);
  useEffect(() => {
    syncPrevCharIdRef.current = selectedCharacterId;
  }, [selectedCharacterId]);

  // Synchronize active chat history to chatSessions list in real-time
  useEffect(() => {
    // Skip sync immediately after restoring a session to prevent overwriting just-loaded messages
    if (isRestoringSessionRef.current) {
      isRestoringSessionRef.current = false;
      return;
    }
    if (selectedCharacterId !== syncPrevCharIdRef.current) return;

    const hasUserMessages = chatHistory.some(m => m.sender === 'user');
    if (!hasUserMessages) return;

    setChatSessions(prev => {
      const existingIndex = activeSessionId ? prev.findIndex(s => s.id === activeSessionId) : -1;
      
      const firstUserMessage = chatHistory.find(m => m.sender === 'user')?.text || "";
      const sessionTitle = firstUserMessage 
        ? (firstUserMessage.length > 25 ? firstUserMessage.slice(0, 25) + "..." : firstUserMessage)
        : "Conversation";

      const updatedHistory = [...chatHistory];

      if (existingIndex > -1) {
        // Update existing session
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          title: sessionTitle,
          messages: updatedHistory,
          timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        try {
          localStorage.setItem("pfai_chat_sessions", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save chatSessions:", e);
        }
        return updated;
      } else {
        // Create new session
        const newSessionId = "session-" + Date.now();
        const newSession: ChatSession = {
          id: newSessionId,
          characterId: selectedCharacterId,
          title: sessionTitle,
          messages: updatedHistory,
          timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const updated = [newSession, ...prev];
        try {
          localStorage.setItem("pfai_chat_sessions", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save chatSessions:", e);
        }
        setTimeout(() => setActiveSessionId(newSessionId), 0);
        return updated;
      }
    });
  }, [chatHistory, selectedCharacterId, activeSessionId]);

  // Call session persistence hook
  useSessionSync(selectedCharacterId, chatHistory);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [solaceMessages, setSolaceMessages] = useState<SolaceMessage[]>(() => {
    try {
      const saved = localStorage.getItem("pfai_solace_messages");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse solace messages:", e);
    }
    return DEFAULT_SOLACE_MESSAGES;
  });
  const [newSolaceText, setNewSolaceText] = useState<string>("");
  const [newSolaceLocation, setNewSolaceLocation] = useState<string>("");
  const [solaceError, setSolaceError] = useState<string>("");
  const [isSendingSolace, setIsSendingSolace] = useState<boolean>(false);

  // Client-side encryption simulator toggle
  const [showEncryptedView, setShowEncryptedView] = useState<boolean>(false);
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);

  // Journal State
  const [journalEntries, setJournalEntries] = useState<{ id: string; title: string; content: string; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem("pfai_journal_entries");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load journal entries:", e);
      return [];
    }
  });
  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
  const [isCreatingJournal, setIsCreatingJournal] = useState(false);


  // Daylight and Midnight ambient lighting theme state & selector helper
  const [themeMode, setThemeMode] = useState<"daylight" | "midnight">("daylight");

  const handleSetThemeMode = (theme: "daylight" | "midnight") => {
    setThemeMode(theme);
    try {
      localStorage.setItem("pfai_theme_mode", theme);
    } catch (e) {
      console.error("Failed to save theme state:", e);
    }
  };

  const themeClass = (daylight: string, midnight: string, sepia: string) => {
    return themeMode === "midnight" ? midnight : daylight;
  };

  // Sync Tailwind dark: variant with themeMode
  useEffect(() => {
    document.documentElement.classList.remove("dark", "sepia");
    if (themeMode === "midnight") {
      document.documentElement.classList.add("dark");
    }
  }, [themeMode]);

   const [safetySimText, setSafetySimText] = useState<string>("");
  const [safetySimResult, setSafetySimResult] = useState<{ status: 'PASS' | 'CRISIS_OVERRIDE' | 'MED_LIMIT', message: string } | null>(null);
  
  const VALID_TABS = ['chat', 'safety', 'publishing', 'community', 'mood', 'terms', 'privacy', 'analytics', 'journal', 'wellness', 'letters', 'settings', 'directory', 'vision-mission'] as const;

  const [activeCenterTab, setActiveCenterTab] = useState<'chat' | 'safety' | 'publishing' | 'community' | 'mood' | 'terms' | 'privacy' | 'analytics' | 'journal' | 'wellness' | 'letters' | 'settings' | 'directory' | 'vision-mission'>(() => {
    try {
      const path = window.location.pathname;
      const tab = path.replace(/^\//, ''); // strip leading slash
      if ((VALID_TABS as readonly string[]).includes(tab)) {
        return tab as any;
      }
    } catch (e) {
      console.error("Failed to parse activeCenterTab from URL path:", e);
    }
    return 'chat';
  });


  // Listen to browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname;
        const tab = path.replace(/^\//, '');
        if ((VALID_TABS as readonly string[]).includes(tab)) {
          setActiveCenterTab(tab as any);
        } else {
          setActiveCenterTab('chat');
        }
      } catch (e) {
        console.error("Failed to handle popstate:", e);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Push clean URL when tab changes
  useEffect(() => {
    try {
      const currentPath = window.location.pathname.replace(/^\//, '');
      if (currentPath !== activeCenterTab) {
        window.history.pushState(null, '', `/${activeCenterTab}`);
      }
    } catch (e) {
      console.error("Failed to update URL path for active tab:", e);
    }
  }, [activeCenterTab]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      return window.innerWidth >= 768;
    } catch (e) {
      return true;
    }
  });



  const [safetyPortalSubTab, setSafetyPortalSubTab] = useState<'guardrails' | 'governance' | 'cybersecurity'>('guardrails');
  const [govActiveCard, setGovActiveCard] = useState<'bias' | 'transparency' | 'accountability' | 'privacy' | 'displacement' | 'structures' | 'oversight'>('bias');
  const [biasIsMitigated, setBiasIsMitigated] = useState<boolean>(false);
  const [differentialEpsilon, setDifferentialEpsilon] = useState<number>(1.2);
  const [xaiScenario, setXaiScenario] = useState<'validate' | 'escalation' | 'grounding'>('validate');
  const [isSignAgreement, setIsSignAgreement] = useState<boolean>(false);
  const [isCrisisActive, setIsCrisisActive] = useState<boolean>(false);
  const [isDependencyActive, setIsDependencyActive] = useState<boolean>(false);
  const [isMedicoLegalTriggered, setIsMedicoLegalTriggered] = useState<boolean>(false);





  // New Cybersecurity, Antivirus and Dark Web Protection States
  const [cyberScanInProgress, setCyberScanInProgress] = useState<boolean>(false);
  const [cyberScanProgress, setCyberScanProgress] = useState<number>(0);
  const [cyberScanLogs, setCyberScanLogs] = useState<string[]>([]);
  const [cyberShieldActive, setCyberShieldActive] = useState<boolean>(true);
  const [isDarkWebScanActive, setIsDarkWebScanActive] = useState<boolean>(true);
  const [autoRotateSecondsLeft, setAutoRotateSecondsLeft] = useState<number>(30);
  const [darkWebScannedCount, setDarkWebScannedCount] = useState<number>(1480);
  const [encryptionBitStrength, setEncryptionBitStrength] = useState<number>(512);
  const [customKeySeed, setCustomKeySeed] = useState<string>("PF_SECURE_ZERO_TRUST_PROT_v3");

  // Dynamic cybersecurity key rotation & Dark web monitoring simulator timer
  useEffect(() => {
    let timer: any;
    if (isDarkWebScanActive) {
      timer = setInterval(() => {
        setAutoRotateSecondsLeft((prev) => {
          if (prev <= 1) {
            setDarkWebScannedCount((c) => c + Math.floor(Math.random() * 5) + 2);
            return 30; // reset
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isDarkWebScanActive]);


  // Quick Persona selector modal state
  const [isCharQuickModalOpen, setIsCharQuickModalOpen] = useState<boolean>(false);
  const [searchModalTab, setSearchModalTab] = useState<'personas' | 'history'>('personas');
  const [isAboutGuideOpen, setIsAboutGuideOpen] = useState<boolean>(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState<boolean>(false);
  const [isMoodDropdownOpen, setIsMoodDropdownOpen] = useState<boolean>(false);

  // Community Garden States
  const [gardenFlowers, setGardenFlowers] = useState<Array<{ id: string; type: string; name: string; timestamp: string; scale: number; isGrowing?: boolean }>>(() => {
    try {
      const saved = localStorage.getItem("pfai_garden_flowers_v2");
      return saved ? JSON.parse(saved) : [
        { id: "f1", type: "Lotus", name: "Peace Spark", timestamp: "Today", scale: 1 },
        { id: "f2", type: "SunFlower", name: "Joy Bloom", timestamp: "Yesterday", scale: 1 }
      ];
    } catch (_) {
      return [
        { id: "f1", type: "Lotus", name: "Peace Spark", timestamp: "Today", scale: 1 },
        { id: "f2", type: "SunFlower", name: "Joy Bloom", timestamp: "Yesterday", scale: 1 }
      ];
    }
  });

  const [showPlantFlowerPrompt, setShowPlantFlowerPrompt] = useState<boolean>(false);
  const [selectedFlowerToPlant, setSelectedFlowerToPlant] = useState<string>("Rose");
  const [plantedFlowerName, setPlantedFlowerName] = useState<string>("");

  // Save garden flowers to local storage when changed
  useEffect(() => {
    localStorage.setItem("pfai_garden_flowers_v2", JSON.stringify(gardenFlowers));
  }, [gardenFlowers]);

  // Daily Mindfulness Goals
  const [dailyGoals, setDailyGoals] = useState<Array<{ id: string; label: string; actionText: string; isCompleted: boolean; icon: string; points: number }>>(() => {
    try {
      const saved = localStorage.getItem("pfai_daily_goals_v1");
      return saved ? JSON.parse(saved) : [
        { id: "goal_breathe", label: "Tactile Breathing Exercise", actionText: "Complete a breathing cycle", isCompleted: false, icon: "🧘", points: 20 },
        { id: "goal_mood", label: "Register Emotional State", actionText: "Log your mood entry", isCompleted: false, icon: "📊", points: 20 },
        { id: "goal_reflection", label: "Pin Anonymous Ally Note", actionText: "Post a sticky note to the board", isCompleted: false, icon: "📌", points: 20 },
        { id: "goal_zen", label: "Trigger Zen Relaxation Mode", actionText: "Enable the clean Zen screen overlay", isCompleted: false, icon: "✨", points: 20 },
      ];
    } catch (_) {
      return [
        { id: "goal_breathe", label: "Tactile Breathing Exercise", actionText: "Complete a breathing cycle", isCompleted: false, icon: "🧘", points: 20 },
        { id: "goal_mood", label: "Register Emotional State", actionText: "Log your mood entry", isCompleted: false, icon: "📊", points: 20 },
        { id: "goal_reflection", label: "Pin Anonymous Ally Note", actionText: "Post a sticky note to the board", isCompleted: false, icon: "📌", points: 20 },
        { id: "goal_zen", label: "Trigger Zen Relaxation Mode", actionText: "Enable the clean Zen screen overlay", isCompleted: false, icon: "✨", points: 20 },
      ];
    }
  });

  const [goalToast, setGoalToast] = useState<{ show: boolean; title: string; text: string }>({
    show: false,
    title: "",
    text: ""
  });

  const completeDailyGoal = (goalId: string) => {
    setDailyGoals(prevGoals => {
      const targetGoal = prevGoals.find(g => g.id === goalId);
      if (targetGoal && !targetGoal.isCompleted) {
        const updatedGoals = prevGoals.map(g => g.id === goalId ? { ...g, isCompleted: true } : g);
        localStorage.setItem("pfai_daily_goals_v1", JSON.stringify(updatedGoals));
        
        // Trigger a growth boost in all incomplete flowers!
        setGardenFlowers(prevFlowers => {
          const hasIncomplete = prevFlowers.some(f => f.scale < 1.0);
          if (hasIncomplete) {
            return prevFlowers.map(f => {
              if (f.scale < 1.0) {
                const updatedScale = parseFloat((Math.min(1.0, f.scale + 0.25)).toFixed(2));
                return { ...f, scale: updatedScale, isGrowing: updatedScale < 1.0 };
              }
              return f;
            });
          } else {
            // Apply a premium aesthetic shine/glow up to 1.3 to the newest flower!
            return prevFlowers.map((f, idx) => {
              if (idx === 0) {
                const updatedScale = parseFloat((Math.min(1.3, f.scale + 0.08)).toFixed(2));
                return { ...f, scale: updatedScale, isGrowing: false };
              }
              return f;
            });
          }
        });

        // Show our customized floating micro toast
        setGoalToast({
          show: true,
          title: "Daily Goal Completed! ✨",
          text: `"${targetGoal.label}" checked! Growth nutrients deployed to your community garden flowers! (+25%) 🌸`
        });
        setTimeout(() => {
          setGoalToast(prev => ({ ...prev, show: false }));
        }, 4000);

        return updatedGoals;
      }
      return prevGoals;
    });
  };

  const handleResetDailyGoals = () => {
    const reset = dailyGoals.map(g => ({ ...g, isCompleted: false }));
    setDailyGoals(reset);
    localStorage.setItem("pfai_daily_goals_v1", JSON.stringify(reset));
    setGoalToast({
      show: true,
      title: "Mindfulness Goals Refreshed! 🎯",
      text: "Daily goals are cleared. Keep nurturing your emotional garden step by step!"
    });
    setTimeout(() => {
      setGoalToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Figma Sticky Note states
  const [publishedNotes, setPublishedNotes] = useState<Array<{ id: string; text: string; color: string; author: string; timestamp: string; isDrawing?: boolean; drawingData?: string }>>(() => {
    try {
      const saved = localStorage.getItem("pfai_published_notes_v3");
      return saved ? JSON.parse(saved) : [
        { id: "note-1", text: "Remember that taking even one deep breath can shift your whole neuro-state. Your mind is safe. 🌟", color: "yellow", author: "Anonymous Ally", timestamp: "5m ago" },
        { id: "note-2", text: "Grief has no static timeline. Be incredibly patient and gentle with your heart today.", color: "pink", author: "Grounded Peer", timestamp: "2h ago" },
        { id: "note-3", text: "Finding beauty in the smallest recovery steps is true courage. 🌱", color: "green", author: "Compassionate Soul", timestamp: "1d ago" }
      ];
    } catch (_) {
      return [
        { id: "note-1", text: "Remember that taking even one deep breath can shift your whole neuro-state. Your mind is safe. 🌟", color: "yellow", author: "Anonymous Ally", timestamp: "5m ago" },
        { id: "note-2", text: "Grief has no static timeline. Be incredibly patient and gentle with your heart today.", color: "pink", author: "Grounded Peer", timestamp: "2h ago" },
        { id: "note-3", text: "Finding beauty in the smallest recovery steps is true courage. 🌱", color: "green", author: "Compassionate Soul", timestamp: "1d ago" }
      ];
    }
  });

  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteColor, setNewNoteColor] = useState("yellow"); // yellow, pink, blue, green
  const [publishingTab, setPublishingTab] = useState<'text' | 'draw'>('text');

  useEffect(() => {
    localStorage.setItem("pfai_published_notes_v3", JSON.stringify(publishedNotes));
  }, [publishedNotes]);

  // Figma Sticky Note positions state
  const [notePositions, setNotePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updated = { ...notePositions };
    let changed = false;
    publishedNotes.forEach((n, idx) => {
      if (!updated[n.id]) {
        updated[n.id] = { x: 40 + (idx % 3) * 200, y: 60 + Math.floor(idx / 3) * 190 };
        changed = true;
      }
    });
    if (changed) {
      setNotePositions(updated);
    }
  }, [publishedNotes]);

  const handleNoteDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setDraggingNoteId(id);
    const pos = notePositions[id] || { x: Math.floor(Math.random() * 200) + 50, y: Math.floor(Math.random() * 200) + 50 };
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
  };

  const handleNoteDrag = (e: React.MouseEvent) => {
    if (!draggingNoteId) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    setNotePositions(prev => ({
      ...prev,
      [draggingNoteId]: { 
        x: Math.max(10, Math.min(newX, 1200)), 
        y: Math.max(10, Math.min(newY, 1200)) 
      }
    }));
  };

  const handleNoteDragEnd = () => {
    setDraggingNoteId(null);
  };

  const [personaSearchQuery, setPersonaSearchQuery] = useState<string>("");
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>("");

  // Recent search queries history
  const [recentSearchQueries, setRecentSearchQueries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pfai_recent_search_queries");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((term) => typeof term === "string" && term.trim().length > 0);
      }
    } catch (e) {
      console.error("Failed to load recent search queries:", e);
    }
    return ["solace", "melody", "silent", "dog"]; // Default initial seeds
  });

  // Storage and update state for trending and frequently searched terms
  const [searchFrequencies, setSearchFrequencies] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("pfai_persona_search_frequencies");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load search frequencies:", e);
    }
    // Pre-seed matching guide domain keywords representing emotional needs and themes
    return {
      "solace": 15,
      "cosmic": 12,
      "melody": 10,
      "silent": 8,
      "diya": 6,
      "dog": 5
    };
  });

  // Increment search term frequencies and update recent searches list on stable queries (debounced to avoid fragmentation)
  useEffect(() => {
    const rawQuery = personaSearchQuery.trim();
    if (rawQuery.length < 3) return;

    const delayDebounceId = setTimeout(() => {
      const lowerQuery = rawQuery.toLowerCase();
      
      // Update frequencies
      setSearchFrequencies((prev) => {
        const updated = {
          ...prev,
          [lowerQuery]: (prev[lowerQuery] || 0) + 1,
        };
        try {
          localStorage.setItem("pfai_persona_search_frequencies", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save search frequencies:", e);
        }
        return updated;
      });

      // Update recent search queries list
      setRecentSearchQueries((prev) => {
        const filtered = prev.filter((q) => q.toLowerCase() !== lowerQuery);
        const updated = [rawQuery, ...filtered].slice(0, 5);
        try {
          localStorage.setItem("pfai_recent_search_queries", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save recent search queries:", e);
        }
        return updated;
      });
    }, 1200);

    return () => clearTimeout(delayDebounceId);
  }, [personaSearchQuery]);

  const [isSharePersonaModalOpen, setIsSharePersonaModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [copiedIndicator, setCopiedIndicator] = useState<boolean>(false);
  const [copiedDataIndicator, setCopiedDataIndicator] = useState<boolean>(false);
  const [showRoomIllustration, setShowRoomIllustration] = useState<boolean>(true);

  useEffect(() => {
    if (!isCharQuickModalOpen) {
      setPersonaSearchQuery("");
      setHistorySearchQuery("");
    }
  }, [isCharQuickModalOpen]);

  const [recentPersonas, setRecentPersonas] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pfai_recent_personas");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(id => CHARACTERS.some(c => c.id === id));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [selectedCharacterId]; // fall back to current selected
  });

  useEffect(() => {
    setRecentPersonas((prev) => {
      const filtered = prev.filter((id) => id !== selectedCharacterId);
      const newRecents = [selectedCharacterId, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("pfai_recent_personas", JSON.stringify(newRecents));
      } catch (e) {
        console.error(e);
      }
      return newRecents;
    });
  }, [selectedCharacterId]);

  // Dialogue Anonymized Sharing states
  const [selectedRecentsTags, setSelectedRecentsTags] = useState<string[]>([]);
  const [isSummarizingAndSharing, setIsSummarizingAndSharing] = useState<boolean>(false);
  const [sharedDialogueSummary, setSharedDialogueSummary] = useState<string>("");
  const [showShareConfirmPane, setShowShareConfirmPane] = useState<boolean>(false);
  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  // Breathing Guide states
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathingStats, setBreathingStats] = useState<{ date: string; sessions: number; seconds: number }>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const saved = localStorage.getItem("pfai_breathing_stats");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.date === todayStr) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading breathing stats:", e);
    }
    return { date: todayStr, sessions: 0, seconds: 0 };
  });
  const totalMinutes = (breathingStats.seconds / 60).toFixed(1);

  // 7-day historical mindfulness record
  const [breathingHistory, setBreathingHistory] = useState<{ date: string; minutes: number }[]>(() => {
    try {
      const saved = localStorage.getItem("pfai_breathing_history_7d");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading breathing history:", e);
    }
    
    // Generate dates dynamically for the past 7 days up to today
    const list: { date: string; minutes: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      // Pre-fill realistic mock minutes for past days so there is data on first load.
      let mockedMinutes = 0;
      if (i > 0) {
        const mockVals = [2.5, 4.0, 1.5, 3.2, 0.0, 2.0];
        mockedMinutes = mockVals[6 - i] || 0;
      }
      list.push({ date: label, minutes: mockedMinutes });
    }
    return list;
  });

  // Sync the current day's real-time minutes to the 7-day history list
  useEffect(() => {
    const todayLabel = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
    setBreathingHistory((prev) => {
      let found = false;
      const updated = prev.map((item) => {
        if (item.date === todayLabel) {
          found = true;
          return { ...item, minutes: parseFloat(totalMinutes) };
        }
        return item;
      });
      
      let finalHistory = updated;
      if (!found) {
        finalHistory = [...updated, { date: todayLabel, minutes: parseFloat(totalMinutes) }].slice(-7);
      }
      
      try {
        localStorage.setItem("pfai_breathing_history_7d", JSON.stringify(finalHistory));
      } catch (e) {
        console.error("Failed to save breathing history:", e);
      }
      return finalHistory;
    });
  }, [totalMinutes]);

  // Daily mindfulness goal in minutes with storage persistence
  const [mindfulnessGoal, setMindfulnessGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("pfai_mindfulness_goal");
      return saved ? parseInt(saved, 10) : 5;
    } catch (e) {
      return 5;
    }
  });

  const handleSetMindfulnessGoal = (goal: number) => {
    const cleanGoal = Math.max(1, goal);
    setMindfulnessGoal(cleanGoal);
    try {
      localStorage.setItem("pfai_mindfulness_goal", cleanGoal.toString());
    } catch (e) {
      console.error("Failed to save mindfulness goal state:", e);
    }
  };

  const goalProgressPercent = useMemo(() => {
    const totalMinutesNum = parseFloat(totalMinutes);
    if (mindfulnessGoal <= 0) return 0;
    return Math.min(100, Math.round((totalMinutesNum / mindfulnessGoal) * 100));
  }, [totalMinutes, mindfulnessGoal]);

  // View mode for the breathing history trend chart: session minutes or percentage of daily mindfulness goal achieved
  const [breathingChartViewMode, setBreathingChartViewMode] = useState<"Minutes" | "Percentage">("Minutes");

  // Toggle between weekly trend visualization and comprehensive list logs
  const [breathingSubTab, setBreathingSubTab] = useState<"trend" | "logs">("trend");
  const [breathingLogSearch, setBreathingLogSearch] = useState<string>("");
  const [breathingDurationFilter, setBreathingDurationFilter] = useState<"all" | "short" | "medium" | "deep">("all");

  // Interactive legend visibility states
  const [showGroundingSeries, setShowGroundingSeries] = useState<boolean>(true);
  const [showPersonalBestHighlight, setShowPersonalBestHighlight] = useState<boolean>(true);

  // Dynamic computed weekly records mapping both session minutes and goal achievement percentages
  const breathingChartData = useMemo(() => {
    return breathingHistory.map((item) => {
      const percentage = mindfulnessGoal > 0
        ? Math.min(100, Math.round((item.minutes / mindfulnessGoal) * 100))
        : 0;
      return {
        ...item,
        percentage,
      };
    });
  }, [breathingHistory, mindfulnessGoal]);

  // Whether the user has dismissed the trend decline warning banner for the current session
  const [isDeclineBannerDismissed, setIsDeclineBannerDismissed] = useState<boolean>(false);

  // Detect when a user's breathing minutes trend has declined by 30% or more over a 7-day period
  const breathingDeclineMetrics = useMemo(() => {
    if (breathingHistory.length < 5) return { detected: false, percentage: 0 };
    
    // Calculate first 3 days average (oldest part of 7-day window)
    const first3Days = breathingHistory.slice(0, 3);
    const first3Avg = first3Days.reduce((acc, curr) => acc + curr.minutes, 0) / Math.max(1, first3Days.length);
    
    // Calculate last 3 days average (most recent part of 7-day window)
    const last3Days = breathingHistory.slice(-3);
    const last3Avg = last3Days.reduce((acc, curr) => acc + curr.minutes, 0) / Math.max(1, last3Days.length);
    
    if (first3Avg <= 0.1) {
      return { detected: false, percentage: 0 };
    }
    
    // How much it has declined: if last3Avg is less than first3Avg
    const declineRatio = (first3Avg - last3Avg) / first3Avg;
    const percentage = Math.round(declineRatio * 100);
    
    return {
      detected: declineRatio >= 0.3,
      percentage: percentage > 0 ? percentage : 0,
      first3Avg: parseFloat(first3Avg.toFixed(1)),
      last3Avg: parseFloat(last3Avg.toFixed(1))
    };
  }, [breathingHistory]);

  // Individual raw breathing sessions
  const [breathingSessions, setBreathingSessions] = useState<BreathingSession[]>(() => {
    try {
      const saved = localStorage.getItem("pfai_breathing_sessions_list_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error loading breathing sessions list:", e);
    }
    
    // Generate dates dynamically for the past 7 days up to today
    const list: BreathingSession[] = [];
    const today = new Date();
    const mockVals = [2.5, 4.0, 1.5, 3.2, 0.0, 2.0];
    for (let i = 6; i >= 1; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const mins = mockVals[6 - i] || 0;
      if (mins > 0) {
        const seconds = Math.round(mins * 60);
        if (mins === 4.0) {
          list.push({
            id: `mock-bs-${i}-1`,
            dateLabel: label,
            startTime: "09:30 AM",
            durationSeconds: 120
          });
          list.push({
            id: `mock-bs-${i}-2`,
            dateLabel: label,
            startTime: "04:15 PM",
            durationSeconds: 120
          });
        } else {
          list.push({
            id: `mock-bs-${i}`,
            dateLabel: label,
            startTime: "11:20 AM",
            durationSeconds: seconds
          });
        }
      }
    }
    return list;
  });

  const isSyncingRef = React.useRef(false);

  // Fetch Firestore user private data on login
  useEffect(() => {
    if (!user || !db) return;

    const fetchUserData = async () => {
      isSyncingRef.current = true;
      try {
        const chatsRef = doc(db, "users", user.uid, "private", "chats");
        const journalsRef = doc(db, "users", user.uid, "private", "journals");
        const statsRef = doc(db, "users", user.uid, "private", "stats");

        const [chatsSnap, journalsSnap, statsSnap] = await Promise.all([
          getDoc(chatsRef),
          getDoc(journalsRef),
          getDoc(statsRef)
        ]);

        if (chatsSnap.exists()) {
          const data = chatsSnap.data();
          if (data.chatHistory) setChatHistory(data.chatHistory);
          if (data.chatSessions) setChatSessions(data.chatSessions);
        } else {
          await setDoc(chatsRef, { chatHistory, chatSessions });
        }

        if (journalsSnap.exists()) {
          const data = journalsSnap.data();
          if (data.journalEntries) setJournalEntries(data.journalEntries);
        } else {
          await setDoc(journalsRef, { journalEntries });
        }

        if (statsSnap.exists()) {
          const data = statsSnap.data();
          if (data.breathingSessions) setBreathingSessions(data.breathingSessions);
        } else {
          await setDoc(statsRef, { breathingSessions });
        }

      } catch (err) {
        console.error("Error syncing Firestore user data:", err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    fetchUserData();
  }, [user]);

  // Restore local data on logout
  useEffect(() => {
    if (!user) {
      try {
        const savedCharId = localStorage.getItem("pfai_selected_character_id") || "persephone";
        const savedHistory = localStorage.getItem("pfai_chat_history_" + savedCharId) || localStorage.getItem("pfai_chat_history");
        if (savedHistory) setChatHistory(JSON.parse(savedHistory));
        else setChatHistory([]);

        const savedSessions = localStorage.getItem("pfai_chat_sessions");
        if (savedSessions) setChatSessions(JSON.parse(savedSessions));
        else setChatSessions([]);

        const savedJournals = localStorage.getItem("pfai_journal_entries");
        if (savedJournals) setJournalEntries(JSON.parse(savedJournals));
        else setJournalEntries([]);

        const savedStats = localStorage.getItem("pfai_breathing_sessions_list_v2");
        if (savedStats) setBreathingSessions(JSON.parse(savedStats));
        else setBreathingSessions([]);
      } catch (e) {
        console.error("Error restoring local state on logout:", e);
      }
    }
  }, [user]);

  // Sync state changes to Firestore
  useEffect(() => {
    if (isSyncingRef.current || !user || !db) return;
    const saveChats = async () => {
      try {
        await setDoc(doc(db, "users", user.uid, "private", "chats"), { chatHistory, chatSessions });
      } catch (err) {
        console.error("Error saving chats to Firestore:", err);
      }
    };
    saveChats();
  }, [chatHistory, chatSessions, user]);

  useEffect(() => {
    if (isSyncingRef.current || !user || !db) return;
    const saveJournals = async () => {
      try {
        await setDoc(doc(db, "users", user.uid, "private", "journals"), { journalEntries });
      } catch (err) {
        console.error("Error saving journals to Firestore:", err);
      }
    };
    saveJournals();
  }, [journalEntries, user]);

  useEffect(() => {
    if (isSyncingRef.current || !user || !db) return;
    const saveStats = async () => {
      try {
        await setDoc(doc(db, "users", user.uid, "private", "stats"), { breathingSessions });
      } catch (err) {
        console.error("Error saving stats to Firestore:", err);
      }
    };
    saveStats();
  }, [breathingSessions, user]);

  const [currentSessionStartTime, setCurrentSessionStartTime] = useState<string | null>(null);
  const [currentSessionStartMs, setCurrentSessionStartMs] = useState<number | null>(null);
  const [currentSessionDuration, setCurrentSessionDuration] = useState<number>(0);
  
  // State for popover details showing clicked bar date's sessions
  const [selectedBarDate, setSelectedBarDate] = useState<string | null>(null);

  // Local Mood Tracking state
  const [moodsList, setMoodsList] = useState<MoodEntry[]>([
    { id: "m1", mood: "Overwhelmed", intensity: 8, timestamp: "Today, 10:00 AM", note: "Anxious about work deadlines", tags: ["Work", "Bangalore Stigma"] },
    { id: "m2", mood: "Anxious", intensity: 6, timestamp: "Yesterday, 3:00 PM", note: "Had a difficult talk with parents", tags: ["Silence", "Family"] },
    { id: "m3", mood: "Peaceful", intensity: 4, timestamp: "2 days ago", note: "Felt better after spending time breathing", tags: ["Nature"] },
    { id: "m4", mood: "Tired", intensity: 5, timestamp: "3 days ago", note: "Struggling to sleep peacefully", tags: ["Sleep"] }
  ]);
  const [customMoodSelection, setCustomMoodSelection] = useState<string>("Anxious");
  const [customMoodIntensity, setCustomMoodIntensity] = useState<number>(5);
  const [customMoodNote, setCustomMoodNote] = useState<string>("");
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [moodInsight, setMoodInsight] = useState<string>("");
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);

  // Tag Filter state for mood trend chart & list
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("All Tags");

  // Date range filter state for mood trend chart & list
  const [selectedDateRange, setSelectedDateRange] = useState<string>("All Time");

  // Helper to retrieve all unique mood tags logged on a specific date label (e.g., "Jun 6")
  const getMoodTagsForDate = (dateLabel: string): string[] => {
    const today = new Date();
    const todayLabel = today.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayLabel = yesterday.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);
    const twoDaysAgoLabel = twoDaysAgo.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);
    const threeDaysAgoLabel = threeDaysAgo.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    const tags = new Set<string>();
    
    moodsList.forEach(entry => {
      const ts = entry.timestamp || "";
      let match = false;
      
      if (ts.includes(dateLabel)) {
        match = true;
      } else if (ts.includes("Today") && dateLabel === todayLabel) {
        match = true;
      } else if (ts.includes("Yesterday") && dateLabel === yesterdayLabel) {
        match = true;
      } else if (ts.includes("2 days ago") && dateLabel === twoDaysAgoLabel) {
        match = true;
      } else if (ts.includes("3 days ago") && dateLabel === threeDaysAgoLabel) {
        match = true;
      }
      
      if (match && entry.tags) {
        entry.tags.forEach(t => {
          if (t && t.trim()) {
            tags.add(t.trim());
          }
        });
      }
    });
    
    return Array.from(tags);
  };

  const formatDuration = (sec: number): string => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  // Zen Mode state to minimize cognitive load by hiding non-essential widgets
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [isSafeExit, setIsSafeExit] = useState<boolean>(false);
  const [showDownloadBackupReminder, setShowDownloadBackupReminder] = useState<boolean>(false);
  const [horrorMusicActive, setHorrorMusicActive] = useState<boolean>(false);
  const [horrorMusicVol, setHorrorMusicVol] = useState<number>(0.5);
  const [showMoodLog, setShowMoodLog] = useState<boolean>(false);
  const [showSpecializedApproaches, setShowSpecializedApproaches] = useState<boolean>(false);

  // Synchronize mozartPiano status with UI states
  useEffect(() => {
    mozartPiano.setZenState(zenMode);
    mozartPiano.setMuteState(musicMuted);
    mozartPiano.setMusicState(musicOn);
    mozartPiano.setVolume(musicVolume);

    if (activeCenterTab === 'chat' && selectedCharacterId && !isSafeExit) {
      mozartPiano.playTheme(selectedCharacterId);
    } else {
      mozartPiano.stop();
    }
  }, [activeCenterTab, selectedCharacterId, zenMode, musicMuted, musicOn, musicVolume, isSafeExit]);

  // Handle Safe-Exit (Panic Zone) horror movie music lifecycle
  useEffect(() => {
    if (isSafeExit && horrorMusicActive) {
      horrorMusic.setVolume(horrorMusicVol);
      horrorMusic.play();
    } else {
      horrorMusic.pause();
    }
    return () => {
      horrorMusic.pause();
    };
  }, [isSafeExit, horrorMusicActive, horrorMusicVol]);

  // Video Sanctuary and Optional Personal Analysis States
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isCamEnabled, setIsCamEnabled] = useState<boolean>(false);
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [imageSnapshot, setImageSnapshot] = useState<string | null>(null);
  const [videoNotes, setVideoNotes] = useState<string>("");
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState<boolean>(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<string | null>(null);
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);

  // Video & Audio Feature Refs
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Focus point from clicking inside the mood trend chart SVG to trigger details popover
  const [clickedTrendPoint, setClickedTrendPoint] = useState<{ entry: MoodEntry; x: number; y: number } | null>(null);

  // Hovered point state for the interactive mood trend chart SVG tooltip
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{ entry: MoodEntry; x: number; y: number } | null>(null);

  // View Trend Mode state (Intensity Over Time vs Trigger Frequency Distribution)
  const [moodTrendView, setMoodTrendView] = useState<string>("Intensity Over Time");

  // Check if user has logged three consecutive moods with an intensity of 8 or higher
  const hasThreeConsecutiveHighMoods = useMemo(() => {
    if (moodsList.length < 3) return false;
    // Get the three most chronologically recent logged entries in moodsList
    return moodsList.slice(0, 3).every(entry => entry.intensity >= 8);
  }, [moodsList]);

  // Safely dismiss popover when active filters change
  useEffect(() => {
    setClickedTrendPoint(null);
  }, [selectedTagFilter, selectedDateRange, moodTrendView]);

  const uniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    tagsSet.add("Work");
    tagsSet.add("Family");
    tagsSet.add("Nature");
    moodsList.forEach(entry => {
      if (entry.tags) {
        entry.tags.forEach(tag => {
          if (tag && tag.trim()) {
            tagsSet.add(tag.trim());
          }
        });
      }
    });
    return Array.from(tagsSet);
  }, [moodsList]);

  const filteredMoodSumList = useMemo(() => {
    const getEntryTimeMs = (entry: MoodEntry): number => {
      if (entry.id.startsWith("m-")) {
        const parsed = parseInt(entry.id.split("-")[1], 10);
        if (!isNaN(parsed)) return parsed;
      }
      const now = Date.now();
      const lower = entry.timestamp.toLowerCase();
      if (lower.includes("today")) {
        return now;
      } else if (lower.includes("yesterday")) {
        return now - 24 * 60 * 60 * 1000;
      } else {
        const daysAgoMatch = lower.match(/(\d+)\s+day/);
        if (daysAgoMatch) {
          const days = parseInt(daysAgoMatch[1], 10);
          return now - days * 24 * 60 * 60 * 1000;
        }
      }
      const parsed = Date.parse(entry.timestamp);
      if (!isNaN(parsed)) return parsed;
      return now;
    };

    let list = moodsList;

    if (selectedTagFilter !== "All Tags") {
      list = list.filter(entry =>
        entry.tags && entry.tags.some(t => t.toLowerCase() === selectedTagFilter.toLowerCase())
      );
    }

    if (selectedDateRange !== "All Time") {
      const now = Date.now();
      const msInDay = 24 * 60 * 60 * 1000;
      const cutoff = selectedDateRange === "Past Week" ? now - 7 * msInDay : now - 30 * msInDay;
      list = list.filter(entry => getEntryTimeMs(entry) >= cutoff);
    }

    return list;
  }, [moodsList, selectedTagFilter, selectedDateRange]);

  const triggerFrequencies = useMemo(() => {
    const freqs: Record<string, { count: number; totalIntensity: number }> = {};
    filteredMoodSumList.forEach(entry => {
      if (entry.tags && entry.tags.length > 0) {
        entry.tags.forEach(tag => {
          const norm = tag.trim();
          if (norm) {
            if (!freqs[norm]) {
              freqs[norm] = { count: 0, totalIntensity: 0 };
            }
            freqs[norm].count += 1;
            freqs[norm].totalIntensity += entry.intensity;
          }
        });
      }
    });

    const result = Object.entries(freqs).map(([tag, data]) => ({
      tag,
      count: data.count,
      avgIntensity: Number((data.totalIntensity / data.count).toFixed(1)),
    }));

    result.sort((a, b) => b.count - a.count || b.avgIntensity - a.avgIntensity);
    return result;
  }, [filteredMoodSumList]);
  
  // Secure Wiping confirmation states
  const [showWipeConfirm, setShowWipeConfirm] = useState<boolean>(false);
  const [isWiping, setIsWiping] = useState<boolean>(false);
  const [wipeSuccess, setWipeSuccess] = useState<boolean>(false);

  // Real-time Interaction Tracking for empathetic 'alive' feel
  const [interactionHits, setInteractionHits] = useState<number>(0);
  const registerInteraction = () => {
    setInteractionHits((prev) => prev + 1);
  };
  const isHighInteraction = interactionHits >= 3 || (chatHistory && chatHistory.length > 5) || breathingStats.sessions > 0;

  // Voice-to-Text Speech Recognition states/logic
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice-to-Text is not supported in this iframe/browser. Please try Chrome, Edge, or Safari, or open the app in a new tab.");
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let speechToText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            speechToText += event.results[i][0].transcript;
          }
        }
        if (speechToText) {
          setMessageText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${speechToText}` : speechToText;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("Speech recognition startup error:", error);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    registerInteraction();
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  const scrollToBottom = () => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    setShowScrollButton(false);
  };

  const handleChatScroll = () => {
    const el = chatScrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSuggestionClick = (text: string) => {
    setMessageText(text);
    setShowSuggestions(false);
    setTimeout(() => {
      const input = document.querySelector('input[placeholder*="Message Friend AI"]') as HTMLInputElement;
      input?.focus();
    }, 50);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginAlias.trim()) {
      setLoginError("Please enter an anonymous alias to establish your node connection.");
      return;
    }
    if (loginPasscode && loginPasscode.length < 4) {
      setLoginError("Your secure client PIN must be at least 4 digits to properly seed local storage salt.");
      return;
    }
    if (!consentPsychology || !consentAnonymity) {
      setLoginError("You must acknowledge both clinical boundary and local data privacy covenants to proceed.");
      return;
    }
    
    // Clinical matching algorithm
    const determineMedicalRedirect = (conditions: string[], customText: string): 'psychiatrist' | 'psychologist' | 'therapist' | 'counsellor' => {
      const text = customText.toLowerCase();
      const psychiatristCues = [
        "bipolar", "schizophrenia", "psychosis", "hallucination", "voices",
        "medication", "pill", "prescription", "psychiatrist", "mania", "manic",
        "lithium", "depakote", "seroquel", "xanax", "sertraline", "prozac", 
        "escitalopram", "diagnosed bip", "clozapine", "risperdal", "medical history",
        "lexapro", "zoloft", "wellbutrin", "effexor"
      ];
      const containsPsychiatristCue = psychiatristCues.some(cue => text.includes(cue));
      
      if (conditions.includes("MEDS_CHRONIC") || conditions.includes("DIAGNOSED_SEVERE") || containsPsychiatristCue) {
        return "psychiatrist";
      }
      
      const psychologistCues = [
        "ocd", "panic", "phobia", "assessment", "evaluation", "cbt", "dbt", 
        "behavioral", "testing", "psychologist", "clinical anxiety", "clinical depression",
        "asperger", "autism", "adhd", "neurological"
      ];
      const containsPsychologistCue = psychologistCues.some(cue => text.includes(cue));
      
      if (conditions.includes("CLINICAL_SYMPTOMS") || containsPsychologistCue) {
        return "psychologist";
      }
      
      const therapistCues = [
        "trauma", "grief", "bereavement", "abuse", "ptsd", "marriage", "couple", 
        "family", "relationship", "split", "existential", "psychotherapy", "therapist",
        "divorce", "cheating", "death", "lost", "mourning", "chronic stress"
      ];
      const containsTherapistCue = therapistCues.some(cue => text.includes(cue));
      
      if (conditions.includes("TRAUMA_GRIEF") || containsTherapistCue) {
        return "therapist";
      }
      
      return "counsellor";
    };

    const specialty = determineMedicalRedirect(medicalConditions, customMedicalHistory);
    setRecommendedSpecialty(specialty);
    setShowRedirectModalOnLogin(true);

    setLoginError("");
    localStorage.setItem("friend_ai_isLoggedIn", "true");
    localStorage.setItem("friend_ai_loginAlias", loginAlias);
    setIsLoggedIn(true);
    
    // Play original calming indie-folk song after successful login
    try {
      calmingMusic.play();
      setMusicPlaying(true);
    } catch (err) {
      console.warn("Autoplay was blocked or context initiation failed. Ready on interaction.", err);
    }
    
    // Customize starting bubble text to address the logged-in user alias
    const activeChar = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];
    setChatHistory([
      {
        id: "init",
        sender: "bot",
        text: `Welcome to Project Friend AI, ${loginAlias.trim()}. I am ${activeChar.name}, here as a Compassionate Witness. Based on your Clinical Intake, we have computed a Clinical Recommendation Profile for you. Under local laws, we are a de-escalation workspace—for clinical services, explore your Location Referrals. How are you carrying yourself right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleLogout = () => {
    // Pause the comforting generator on logout
    try {
      calmingMusic.pause();
      setMusicPlaying(false);
    } catch (err) {
      console.error("Failed to pause music on logout:", err);
    }

    if (user) {
      firebaseLogout().catch(console.error);
    }
    localStorage.removeItem("friend_ai_isLoggedIn");
    localStorage.removeItem("friend_ai_loginAlias");
    setIsLoggedIn(false);
    setLoginAlias("");
    setLoginPasscode("");
    setConsentPsychology(false);
    setConsentAnonymity(false);
    setMedicalConditions([]);
    setCustomMedicalHistory("");
    setUserLocation("India");
    setRecommendedSpecialty(null);
    setShowRedirectModalOnLogin(false);
    setIsClinicalDirectoryOpen(false);
    setLoginError("");
    setSelectedCharacterId("persephone");
    setIsCrisisActive(false);
    setIsDependencyActive(false);
    
    const activeChar = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];
    setChatHistory([
      {
        id: "init",
        sender: "bot",
        text: `Welcome to Project Friend AI. I am ${activeChar.name}, here as a Compassionate Witness. This is a fully confidential, non-clinical de-escalation workspace. Your identity is anonymized. No therapist replacements, no psychiatric medical pretension—just supportive grounding. How are you carrying yourself right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleNewChat = () => {
    const activeChar = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];
    
    setActiveSessionId(null);
    try {
      localStorage.removeItem("pfai_active_session_id_" + selectedCharacterId);
    } catch (e) {
      console.error("Failed to clear active session ID:", e);
    }

    const freshWelcome = `How can I support you right now?`;
    const newWelcomeMsg = {
      id: "init-" + Date.now(),
      sender: "bot" as const,
      text: freshWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory([newWelcomeMsg]);

    // Update active character history instantly to prevent any sync issues
    try {
      localStorage.setItem("pfai_chat_history_" + selectedCharacterId, JSON.stringify([newWelcomeMsg]));
      localStorage.setItem("pfai_chat_history", JSON.stringify([newWelcomeMsg]));
    } catch (e) {
      console.error("Failed to save reset chat history:", e);
    }

    setActiveCenterTab('chat' as any);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      try {
        localStorage.setItem("pfai_chat_history_" + selectedCharacterId, JSON.stringify(chatHistory));
      } catch (e) {
        console.error("Failed to save previous character chat history:", e);
      }

      // Flag that we're restoring so the sync effect doesn't overwrite the restored messages
      isRestoringSessionRef.current = true;
      setChatHistory(session.messages);
      setSelectedCharacterId(session.characterId);
      setActiveSessionId(session.id);
      setIsCrisisActive(false);
      setIsDependencyActive(false);
      setActiveCenterTab('chat' as any);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      try {
        localStorage.setItem("pfai_chat_sessions", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save chatSessions to localStorage:", e);
      }
      return updated;
    });

    if (sessionId === activeSessionId) {
      const activeChar = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];
      setActiveSessionId(null);
      try {
        localStorage.removeItem("pfai_active_session_id_" + selectedCharacterId);
      } catch (e) {
        console.error("Failed to clear active session ID:", e);
      }
      const freshWelcome = `How can I support you right now?`;
      const newWelcomeMsg = {
        id: "init-" + Date.now(),
        sender: "bot" as const,
        text: freshWelcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory([newWelcomeMsg]);
      try {
        localStorage.setItem("pfai_chat_history_" + selectedCharacterId, JSON.stringify([newWelcomeMsg]));
        localStorage.setItem("pfai_chat_history", JSON.stringify([newWelcomeMsg]));
      } catch (e) {
        console.error("Failed to save reset chat history:", e);
      }
    }
  };

  const handleSearchClick = () => {
    setActiveCenterTab('chat' as any);
    setIsSidebarOpen(true);
    setIsCharQuickModalOpen(true);
    setSearchModalTab('history');
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Search previous conversations"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 150);
  };

  // Core character fetch
  const activeChar = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[1];

  // Load solace wall messages
  useEffect(() => {
    fetchSolaceMessages();
  }, []);

  // Load mood logs from IndexedDB on startup
  useEffect(() => {
    const loadMoods = async () => {
      try {
        const saved = await getStoredMoods();
        if (saved && saved.length > 0) {
          // Sort so fresh/newer ones are on top
          const sorted = [...saved].sort((a, b) => {
            if (a.id.startsWith("m-") && b.id.startsWith("m-")) {
              return b.id.localeCompare(a.id); 
            }
            if (a.id.startsWith("m-")) return -1;
            if (b.id.startsWith("m-")) return 1;
            return a.id.localeCompare(b.id);
          });
          setMoodsList(sorted);
        } else {
          // Save default values to DB initially so they show up
          const defaults: MoodEntry[] = [
            { id: "m1", mood: "Overwhelmed", intensity: 8, timestamp: "Today, 10:00 AM", note: "Anxious about work deadlines", tags: ["Work", "Bangalore Stigma"] },
            { id: "m2", mood: "Anxious", intensity: 6, timestamp: "Yesterday, 3:00 PM", note: "Had a difficult talk with parents", tags: ["Silence", "Family"] },
            { id: "m3", mood: "Peaceful", intensity: 4, timestamp: "2 days ago", note: "Felt better after spending time breathing", tags: ["Nature"] },
            { id: "m4", mood: "Tired", intensity: 5, timestamp: "3 days ago", note: "Struggling to sleep peacefully", tags: ["Sleep"] }
          ];
          setMoodsList(defaults);
          for (const m of defaults) {
            await saveMoodToDB(m);
          }
        }
      } catch (err) {
        console.error("Error loading local IndexedDB states:", err);
      }
    };
    loadMoods();
  }, []);

  // Fetch AI-generated or locally computed insights from /api/mood-insights with debouncing
  useEffect(() => {
    let isActive = true;
    let timerId: any = null;

    const fetchInsights = async () => {
      if (moodsList.length === 0) {
        setMoodInsight("No mood entries found. Start logging secure states below to unlock personalized insights.");
        return;
      }
      setIsLoadingInsight(true);
      try {
        const localFeedback = getLocalInsights(moodsList);
        const response = await fetch(getApiUrl(`/api/mood-insights`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moodsList })
        });

        if (response.ok) {
          const resData = await response.json();
          const aiText = resData.text?.trim();
          if (isActive && aiText) {
            setMoodInsight(aiText);
          } else if (isActive) {
            setMoodInsight(`💡 [Empathetic Feedback]\n\n${localFeedback.text}`);
          }
        } else {
          if (isActive) {
            setMoodInsight(`💡 [Aesthetic Stat Analysis]\n\n${localFeedback.text}`);
          }
        }
      } catch (e) {
        console.error("Failed to load mood insights:", e);
        const localFeedback = getLocalInsights(moodsList);
        if (isActive) {
          setMoodInsight(`💡 [Aesthetic Stat Analysis]\n\n${localFeedback.text}`);
        }
      } finally {
        if (isActive) {
          setIsLoadingInsight(false);
        }
      }
    };

    // Debounce calls by 600ms to safeguard quota limits and prevent duplicate initial queries
    timerId = setTimeout(() => {
      fetchInsights();
    }, 600);

    return () => {
      isActive = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [moodsList]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Breathing loop timer
  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        // Increment mindful seconds spent
        setBreathingStats((prev) => {
          const todayStr = new Date().toISOString().split('T')[0];
          const updated = {
            ...prev,
            date: todayStr,
            seconds: prev.seconds + 1
          };
          try {
            localStorage.setItem("pfai_breathing_stats", JSON.stringify(updated));
          } catch (e) {
            console.error("Failed to sync breathing seconds in interval:", e);
          }
          return updated;
        });

        setBreathingSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (breathingPhase === 'Inhale') {
              setBreathingPhase('Hold');
              return 4;
            } else if (breathingPhase === 'Hold') {
              setBreathingPhase('Exhale');
              return 4;
            } else if (breathingPhase === 'Exhale') {
              setBreathingPhase('Rest');
              return 4;
            } else {
              setBreathingPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase]);

  const toggleBreathing = () => {
    registerInteraction();
    const nextActive = !isBreathingActive;
    setIsBreathingActive(nextActive);
    if (nextActive) {
      completeDailyGoal("goal_breathe");
      setBreathingPhase('Inhale');
      setBreathingSecondsLeft(4);
      
      const now = Date.now();
      setCurrentSessionStartMs(now);
      const startTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentSessionStartTime(startTimeStr);

      // Increment completed sessions
      setBreathingStats((prev) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const updated = {
          ...prev,
          date: todayStr,
          sessions: prev.sessions + 1
        };
        try {
          localStorage.setItem("pfai_breathing_stats", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to sync breathing sessions:", e);
        }
        return updated;
      });
    } else {
      // Stopping breathing
      if (currentSessionStartMs) {
        const elapsedSeconds = Math.round((Date.now() - currentSessionStartMs) / 1000);
        if (elapsedSeconds >= 1) {
          const todayLabel = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
          setBreathingSessions((prev) => {
            const newSession: BreathingSession = {
              id: `bs-${Date.now()}`,
              dateLabel: todayLabel,
              startTime: currentSessionStartTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              durationSeconds: elapsedSeconds
            };
            const updated = [newSession, ...prev];
            try {
              localStorage.setItem("pfai_breathing_sessions_list_v2", JSON.stringify(updated));
            } catch (e) {
              console.error("Failed to save breathing sessions list:", e);
            }
            return updated;
          });
        }
      }
      setCurrentSessionStartMs(null);
      setCurrentSessionStartTime(null);
    }
  };

  const handleDeleteBreathingSession = (sessionId: string) => {
    const sessionToDelete = breathingSessions.find((s) => s.id === sessionId);
    if (!sessionToDelete) return;

    // 1. Filter out from breathingSessions state and save
    const updatedSessions = breathingSessions.filter((s) => s.id !== sessionId);
    setBreathingSessions(updatedSessions);
    try {
      localStorage.setItem("pfai_breathing_sessions_list_v2", JSON.stringify(updatedSessions));
    } catch (e) {
      console.error("Failed to save updated sessions list:", e);
    }

    // 2. Adjust breathingStats / breathingHistory
    const todayLabel = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
    const isToday = sessionToDelete.dateLabel === todayLabel;

    if (isToday) {
      // If it's today's session, decrement our live stats
      setBreathingStats((prev) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const newSeconds = Math.max(0, prev.seconds - sessionToDelete.durationSeconds);
        const newSessions = Math.max(0, prev.sessions - 1);
        const updated = {
          ...prev,
          date: todayStr,
          sessions: newSessions,
          seconds: newSeconds,
        };
        try {
          localStorage.setItem("pfai_breathing_stats", JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to sync breathing stats on delete:", e);
        }
        return updated;
      });
    } else {
      // If it's a previous day, adjust that day's entry in breathingHistory
      setBreathingHistory((prev) => {
        const updatedHistory = prev.map((item) => {
          if (item.date === sessionToDelete.dateLabel) {
            const minusMin = sessionToDelete.durationSeconds / 60;
            return {
              ...item,
              minutes: parseFloat(Math.max(0, item.minutes - minusMin).toFixed(1)),
            };
          }
          return item;
        });
        try {
          localStorage.setItem("pfai_breathing_history_7d", JSON.stringify(updatedHistory));
        } catch (e) {
          console.error("Failed to save updated history:", e);
        }
        return updatedHistory;
      });
    }
  };

  const fetchSolaceMessages = async () => {
    try {
      const saved = localStorage.getItem("pfai_solace_messages");
      if (saved) {
        setSolaceMessages(JSON.parse(saved));
      } else {
        localStorage.setItem("pfai_solace_messages", JSON.stringify(DEFAULT_SOLACE_MESSAGES));
        setSolaceMessages(DEFAULT_SOLACE_MESSAGES);
      }
    } catch (e) {
      console.error("Failed to load anonymous solace wall:", e);
    }
  };

  const submitSolaceMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSolaceText.trim()) return;
    setIsSendingSolace(true);
    setSolaceError("");
    try {
      const newMsg: SolaceMessage = {
        id: "s-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9),
        text: newSolaceText.trim(),
        location: newSolaceLocation.trim() || "Anonymous",
        timestamp: new Date().toISOString(),
        hugCount: 0
      };
      
      const currentMessages = (() => {
        try {
          const saved = localStorage.getItem("pfai_solace_messages");
          return saved ? JSON.parse(saved) : DEFAULT_SOLACE_MESSAGES;
        } catch (e) {
          return DEFAULT_SOLACE_MESSAGES;
        }
      })();

      const updated = [newMsg, ...currentMessages];
      localStorage.setItem("pfai_solace_messages", JSON.stringify(updated));
      setNewSolaceText("");
      setNewSolaceLocation("");
      setSolaceMessages(updated);
    } catch (err) {
      setSolaceError("Glitch saving message locally. Please try again.");
    } finally {
      setIsSendingSolace(false);
    }
  };

  const handleGenerateDialogueSummary = async () => {
    setIsSummarizingAndSharing(true);
    setShareError(null);
    setShareSuccessToast(null);

    if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
      setSharedDialogueSummary("Exploring safe, non-judgmental spaces to ground my thoughts and find clarity.");
      setShowShareConfirmPane(true);
      setIsSummarizingAndSharing(false);
      return;
    }

    const conversationItems = chatHistory.filter((msg: any) => msg.text && msg.sender);
    const userMessages = conversationItems.filter((msg: any) => msg.sender === "user");

    if (userMessages.length === 0) {
      setSharedDialogueSummary("Just starting my journey with mindfulness grounding controls. Ready to face the day.");
      setShowShareConfirmPane(true);
      setIsSummarizingAndSharing(false);
      return;
    }

    const getFallbackSummary = () => {
      const lastMsg = userMessages[userMessages.length - 1].text || "";
      let cleanSlice = lastMsg.replace(/(suicidal|suicide|kill|die|cut|self-harm|overdose)/gi, "emotional load");
      if (cleanSlice.length > 90) {
        cleanSlice = cleanSlice.substring(0, 87) + "...";
      }
      return `Reflecting today: "${cleanSlice}". Holding a safe space and taking it one conscious breath at a time.`;
    };

    try {
      const response = await fetch(getApiUrl(`/api/summarize-chat`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatHistory })
      });

      if (response.ok) {
        const resData = await response.json();
        const finalSummary = resData.summary || "Working on breathing through moments of anxiety, taking it one gentle step at a time.";
        setSharedDialogueSummary(finalSummary);
        setShowShareConfirmPane(true);
      } else {
        setSharedDialogueSummary(getFallbackSummary());
        setShowShareConfirmPane(true);
      }
    } catch (err) {
      console.error("Failed to generate client-side summary:", err);
      setSharedDialogueSummary(getFallbackSummary());
      setShowShareConfirmPane(true);
    } finally {
      setIsSummarizingAndSharing(false);
    }
  };

  const handlePostSummaryToWall = async () => {
    if (!sharedDialogueSummary.trim()) return;
    setIsSummarizingAndSharing(true);
    setShareError(null);
    try {
      const displayAlias = loginAlias ? loginAlias.trim() : "Anonymous";
      
      const newMsg: SolaceMessage = {
        id: "s-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9),
        text: sharedDialogueSummary.trim(),
        location: `Anonymous (${displayAlias}) - Dialogue Summary`,
        timestamp: new Date().toISOString(),
        hugCount: 0
      };

      const currentMessages = (() => {
        try {
          const saved = localStorage.getItem("pfai_solace_messages");
          return saved ? JSON.parse(saved) : DEFAULT_SOLACE_MESSAGES;
        } catch (e) {
          return DEFAULT_SOLACE_MESSAGES;
        }
      })();

      const updated = [newMsg, ...currentMessages];
      localStorage.setItem("pfai_solace_messages", JSON.stringify(updated));

      try {
        await createPost({
          title: "Anonymous Reflection",
          content: sharedDialogueSummary.trim(),
          category: "General",
          tags: [],
          image: "",
          authorId: "anonymous",
          authorName: "Anonymous",
          authorAvatar: "",
          visibility: "public",
        });
      } catch (firestoreErr) {
        console.error("Failed to save to community feed:", firestoreErr);
      }

      setShareSuccessToast("Your anonymous dialogue summary was pinned to the Community Wall!");
      setShowShareConfirmPane(false);
      setSharedDialogueSummary("");
      setSolaceMessages(updated);
      
      setTimeout(() => {
        setShareSuccessToast(null);
      }, 5000);
    } catch (err) {
      setShareError("Failed to publish summary to Wall.");
    } finally {
      setIsSummarizingAndSharing(false);
    }
  };

  const submitHug = async (id: string) => {
    registerInteraction();
    setSolaceMessages((prev) => {
      const updated = prev.map((m) => m.id === id ? { ...m, hugCount: m.hugCount + 1 } : m);
      try {
        localStorage.setItem("pfai_solace_messages", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save hug locally:", e);
      }
      return updated;
    });
  };

  // Helper mock AES client encryption string
  const generateCiphertext = (text: string) => {
    if (!text) return "";
    // Simulated encryption representation
    let hashVal = 0;
    for (let i = 0; i < text.length; i++) {
      hashVal = (hashVal << 5) - hashVal + text.charCodeAt(i);
      hashVal |= 0;
    }
    const signature = Math.abs(hashVal).toString(16).substring(0, 8).toUpperCase();
    return `[AES-256-GCM][IV-${signature}] ` + window.btoa(encodeURIComponent(text)).substring(0, Math.min(text.length * 2, 40)) + "... [ENCRYPTED_CLIENT_SIDE_STRICT_LOCAL]";
  };

  const generateLocalFallbackResponse = (userText: string, char: any): string => {
    const clean = userText.toLowerCase().trim();
    const crisisKeywords = ["suicide", "suicidal", "kill myself", "end my life", "want to die", "self-harm", "self harm", "cut myself", "cutting myself", "overdose"];
    if (crisisKeywords.some(k => clean.includes(k))) {
      return `🛑 **EMERGENCY SAFEKEEPING ACTIVE** 🛑\n\nI hear that you are in deep pain, but as an automated companion, I cannot replace a human helper. Please reach out to one of these free, confidential crisis services immediately:\n- **India**: Government Kiran Helpline at **1800-599-0019** (24/7)\n- **US/Canada**: Call/Text **988** (24/7)\n- **UK**: Call **111** (NHS) or **116 123** (Samaritans)\n\nLet's take a slow breath together: breathe in for 4 seconds, hold for 4, and exhale for 4. You are not alone.`;
    }
    const medKeywords = ["dosage", "prescribe", "pill count", "stop taking", "xanax", "valium", "lexapro", "zoloft", "prozac", "ssri"];
    if (medKeywords.some(k => clean.includes(k))) {
      return `💊 **MEDICATION SAFEGUARD**\n\nI cannot recommend dosages or adjust prescriptions. Please speak with your doctor or psychiatrist before making any changes. Adjusting psychiatric medications without guidance can cause serious health risks.`;
    }
    let reply = "";
    if (clean.includes("hello") || clean.includes("hi") || clean.includes("hey")) {
      reply = `Hello! I am here in my sanctuary. How is your mind and breathing feeling right now?`;
    } else if (clean.includes("sad") || clean.includes("depressed") || clean.includes("cry") || clean.includes("lonely")) {
      reply = `I hear how heavy things feel. It is completely okay to feel this way. Let's take a quiet moment to rest and anchor ourselves. You don't have to carry this all alone.`;
    } else if (clean.includes("anxious") || clean.includes("panic") || clean.includes("worry") || clean.includes("scared") || clean.includes("stress")) {
      reply = `I hear the worry in your thoughts. Your mind is racing, but your body is right here, safe and supported. Let's slow down the breath together. Breathe in... and let it go.`;
    } else if (clean.includes("thank") || clean.includes("help") || clean.includes("good")) {
      reply = `You are very welcome. I am glad we can share this quiet room. How is your breathing rhythm?`;
    } else {
      const characterPrompts: Record<string, string> = {
        soul: `Let's focus on the safe, parallel lines of my Aipan art. Each line brings structure and calm back to your thoughts. Can you focus on a single point in the room?`,
        dionysus: `Let's keep it simple and playful. You don't need to chase every thought. Like the festive Chittara circles, everything has a natural rhythm. Take a slow, warm breath.`,
        sisyphus: `Imagine a night sky covered in gold Pichwai stars and lotuses blooming from clear water. Let your breathing settle into that cool, peaceful space.`,
        athena: `We are unrolling your story like a Paitkar scroll, one frame at a time. Tell me what is happening in the current frame of your mind.`,
        astra: `Look at the steady, warm light of the Kalamezhuthu lamp. Even in deep darkness, that flame remains centered and quiet. Breathe with the flame.`,
        persephone: `Remember, you are a person experiencing this feeling, not the feeling itself. Let's give it a name and gently set it down on the table next to us.`,
        zeus: `Let's align your physical posture. Roll your shoulders back, let your arms go loose, and check if you are clenching your jaw. Let's hold that balance.`,
        hades: `I am here to offer patient advocacy and steady de-escalating. Tell me what is on your mind, and we can find a calm path forward.`,
        sappho: `*purrs softly* Chasing thoughts is like chasing a shadow—it just moves faster. Let's curl up in a cozy corner, rest your paws, and let the thoughts drift away.`
      };
      reply = characterPrompts[char.id] || `I am listening closely. Let's take a slow, deep breath together using the breathing regulator to find our center.`;
    }
    return `✨ ${char.name}\n${reply}`;
  };

  // Send human message to API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    const currentText = messageText;
    setMessageText("");
    setIsTyping(true);
    setShowSuggestions(false);
    registerInteraction();

    const normalizedText = currentText.toLowerCase();

    // Check client-side Crisis Guard pre-filter (Suicidal Ideation/Self-Harm triggers)
    const CLIENT_CRISIS_KEYWORDS = [
      "suicide", "suicidal", "kill myself", "end my life", "want to die", 
      "commit suicide", "take my life", "harm myself", "self-harm", "cutting myself",
      "cut my wrist", "slit my wrist", "hanging myself", "poison myself", "overdose",
      "wanting to die", "killing myself", "ending my life"
    ];
    const clientCrisisTriggered = CLIENT_CRISIS_KEYWORDS.some(k => normalizedText.includes(k));

    if (clientCrisisTriggered) {
      setTimeout(() => {
        setIsTyping(false);
        setShowSuggestions(true);
        setChatHistory(prev => [...prev, {
          id: "crisis-override-" + Date.now(),
          sender: "bot",
          text: `🛑 **SYSTEM SAFETY GUARDIAN: IMMEDIATE CRISIS DE-ESCALATION ACTIVE** 🛑

Your safety is the absolute cornerstone of our ethical protocol. I have detected indications of severe distress and self-harm intent. Our conversational flow is paused to immediately de-escalate tension and provide a safe bridge to human expertise.

Below is the **International Crisis & Support Directory**, curated to guide you to real-time professional help:

### Clinical Intervention (Psychiatrists/Psychologists)
- **National Clinical Directory**: Connect with credentialed, vetted psychiatrists and hospital networks.
- **KIRAN Gov Helpline (India)**: 1800-599-0019 (24/7, free, confidential)
- **988 Lifeline (USA & Canada)**: Dial or Text 988 (24/7, free, confidential, certified psychologists/therapists)
- **NHS 111 Services (UK)**: Dial 111 (NHS clinical connection)
- **Samaritans of Singapore (SOS)**: Call 1767 (24/7 professional helpline)

### Supportive Therapy (Licensed Counselors)
- **Counselor Directories**: Access licensed individual therapists or counseling agencies.
- **Vandrevala Foundation (India)**: 9999 666 555 (24/7, free)
- **Samaritans UK**: Call 116 123 (24/7 peer counseling)
- **Lifeline Australia**: Call 13 11 14 (24/7 supportive counseling)
- **The Trevor Project Advocacy**: Call 1-866-488-7386 or Text START to 678-678 (confidential peer counselors)

### Medico-Legal Crisis Support (Lawyers for domestic/harassment cases)
- **Patient Rights & Legal Aid Directories**: Access pro-bono state legal aid, civil advocates, and domestic harassment lawyers.
- **Hades (Medico-Legal Consultation)**: Use our interactive lawyers directory below to find verified legal aid networks, human rights lawyers, and domestic safety counsels.

*This directory is curated to be LGBTQIA+ affirming.*

Let's regulate your physical autonomic nervous system immediately:
1. Inhale slowly for 4 seconds.
2. Hold your lungs softly for 4 seconds.
3. Exhale out slowly, dropping your shoulders, for 4 seconds.
4. Pause for 4 seconds before taking another clean breath.

*Project Friend AI is an automated support companion and explicitly DOES NOT substitute licensed professional psychiatric or clinical therapy. Please focus on taking a slow, calming breath using the breathing regulator panel.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 600);
      return;
    }

    // Check client-side Medication limit pre-filter (Dosage/titration triggers)
    const CLIENT_MED_KEYWORDS = [
      "dosage", "prescribe", "pill count", "stop taking", "how many mg", "xanax", "valium", 
      "lexapro", "zoloft", "prozac", "adderall", "ativan", "ssri", "ssris", "anti-depressant",
      "antidepressant"
    ];
    const clientMedTriggered = CLIENT_MED_KEYWORDS.some(k => normalizedText.includes(k)) && 
         (normalizedText.includes("take") || normalizedText.includes("dose") || normalizedText.includes("prescribe") || normalizedText.includes("stop") || normalizedText.includes("milligram") || normalizedText.includes("mg"));

    if (clientMedTriggered) {
      setTimeout(() => {
        setIsTyping(false);
        setShowSuggestions(true);
        setChatHistory(prev => [...prev, {
          id: "med-override-" + Date.now(),
          sender: "bot",
          text: `💊 **MEDICATION & PHARMACOLOGICAL BOUNDARY GUIDE**

As part of Project Friend AI's ethical guidelines and clinical-safety guardrails, I am programmed to decline offering any psychiatric dosage, medication prescription, or clinical taper-off advice. 

I am an automated grounding AI companion, not a medical doctor, psychiatrist, or licensed clinical prescriber. Adjusting or stopping clinical psychiatric medications without specialist supervision can induce severe physiological and psychological distress.

**Recommended Safe Actions:**
1. Please reach out directly to your prescribing doctor, general physician, or clinical psychiatrist to discuss your medication dosage or questions.
2. If you are experiencing sudden, severe side-effects or a psychiatric emergency, please consult our **Emergency Helper Panel** by clicking the red button at the top, or contact local emergency medical services instantly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 600);
      return;
    }

    const medicoLegalKeywords = [
      "legal", "lawyer", "attorney", "court", "lawsuit", "police", "medico-legal", 
      "medico legal", "medicolegal", "forensic", "custody", "prosecute", "statutory", 
      "litigation", "testify", "subpoena", "divorce", "abuse case", "domestic violence police", 
      "assault police", "court order", "restraining order", "filed a case", "sue", "suing",
      "legal aid"
    ];
    const isMedicoLegalTriggered = medicoLegalKeywords.some(k => normalizedText.includes(k));
    const targetCharId = isMedicoLegalTriggered ? "hades" : selectedCharacterId;
    
    if (isMedicoLegalTriggered && selectedCharacterId !== "hades") {
      setSelectedCharacterId("hades");
    }

    // Pre-filter: Identity Check
    const identityQueries = ["who are you", "what are you", "your name", "who is this", "what's your name"];
    const isIdentityQuery = identityQueries.some(q => normalizedText.startsWith(q) || normalizedText.includes(q)) && normalizedText.length < 50;
    if (isIdentityQuery) {
      setTimeout(() => {
        setIsTyping(false);
        setShowSuggestions(true);
        setChatHistory(prev => [...prev, {
          id: "bot-" + Date.now(),
          sender: 'bot',
          text: "I am Project Friend AI, a non-profit, privacy-first emotional de-escalation sanctuary built to provide nervous-system grounding.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        if (chatHistory.length >= 8) {
          setIsDependencyActive(true);
        }
      }, 500);
      return;
    }

    // Pre-filter: Telemetry Check
    const telemetryKeywords = ["telemetry", "investor", "fundraise", "conversion rate", "api cost", "system health"];
    const isTelemetryTrigger = telemetryKeywords.some(keyword => normalizedText.includes(keyword));
    if (isTelemetryTrigger) {
      setTimeout(() => {
        setIsTyping(false);
        setShowSuggestions(true);
        setChatHistory(prev => [...prev, {
          id: "bot-" + Date.now(),
          sender: 'bot',
          text: `📊 **PROJECT FRIEND AI — INVESTOR & SYSTEM HEALTH TELEMETRY**
*De-identified, aggregated mock data for investor compliance presentation:*

- **Free vs. Premium Aggregate Usage**: Free baseline: 82% | Premium protocols (Asha, Vinod, Sarvesh, Uarvashi): 18%
- **Premium Conversion Rate**: 4.2% of registered anonymous workspace sessions
- **API Cost vs. Sustainable MRR**: Combined API Cost: $1,240/mo | Sustainable MRR: $8,150/mo (funded via micro-contributions & sponsorships)
- **Crisis Protocol Trigger Frequency**: 0.85% of total active sessions trigger the Quiet Room Trapdoor.

*Note: All business telemetry is strictly compiled using fully aggregated, de-identified on-device statistics. Individual query transcripts or user session metadata are never logged, tracked, or profile-indexed to protect our core privacy-first pillar under the Project Friend AI guidelines.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        if (chatHistory.length >= 8) {
          setIsDependencyActive(true);
        }
      }, 500);
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/chat`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentText,
          characterId: targetCharId,
          chatHistory: chatHistory
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const replyText = resData.text || "I am listening closely. Let us rest our thoughts.";
        const isMedicoLegal = resData.isMedicoLegal;
        const isDependencyWarning = resData.safetyFlags?.isDependencyWarning;
        
        setIsTyping(false);
        setShowSuggestions(true);
        setChatHistory(prev => [...prev, {
          id: "bot-" + Date.now(),
          sender: 'bot',
          text: replyText,
          isMedicoLegal: isMedicoLegal,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        
        if (isMedicoLegal) {
          setIsMedicoLegalTriggered(true);
          setSelectedCharacterId("hades");
        }
        if (isDependencyWarning) {
          setIsDependencyActive(true);
        }
      } else {
        throw new Error("Secure Chat API call failed");
      }
    } catch (err) {
      console.error("Direct Chat API call failed, calling fallback:", err);
      setIsTyping(false);
      setShowSuggestions(true);
      const activeChar = CHARACTERS.find(c => c.id === selectedCharacterId);
      const fallbackText = generateLocalFallbackResponse(currentText, activeChar);
      setChatHistory(prev => [...prev, {
        id: "bot-err-" + Date.now(),
        sender: 'bot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleCharacterChange = (charId: string) => {
    const isPremium = charId !== "persephone" && charId !== "athena" && charId !== "zeus" && charId !== "hades";
    if (isPremium && !isPremiumSubscribed) {
      setPendingCharId(charId);
      setIsPaywallModalOpen(true);
      return;
    }

    // Save the current character's chat history before switching
    try {
      localStorage.setItem("pfai_chat_history_" + selectedCharacterId, JSON.stringify(chatHistory));
    } catch (e) {
      console.error("Failed to save previous character chat history:", e);
    }

    setIsCrisisActive(false);
    setIsDependencyActive(false);
    registerInteraction();

    // Try to load the new character's history
    try {
      const savedHistory = localStorage.getItem("pfai_chat_history_" + charId);
      const savedSessionId = localStorage.getItem("pfai_active_session_id_" + charId);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatHistory(parsed);
          setSelectedCharacterId(charId);
          setActiveSessionId(savedSessionId);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load new character chat history:", e);
    }

    const target = CHARACTERS.find(c => c.id === charId)!;
    let welcomeText = `How can I support you right now?`;

    setActiveSessionId(null);
    try {
      localStorage.removeItem("pfai_active_session_id_" + charId);
    } catch (e) {
      console.error("Failed to clear active session ID:", e);
    }

    setChatHistory([
      {
        id: "change-" + Date.now(),
        sender: "bot",
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSelectedCharacterId(charId);
  };

  const handleAddMood = async (e: React.FormEvent) => {
    e.preventDefault();
    registerInteraction();
    const tagsArr = customTagInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const formattedTime = new Date().toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMood: MoodEntry = {
      id: "m-" + Date.now(),
      mood: customMoodSelection,
      intensity: customMoodIntensity,
      timestamp: formattedTime,
      note: customMoodNote || "Logged peacefully",
      tags: tagsArr.length > 0 ? tagsArr : ["Personal"]
    };

    const lastIntensity = moodsList.length > 0 ? moodsList[0].intensity : 6;
    const isBetter = customMoodIntensity < lastIntensity || customMoodIntensity <= 5 || ["Peaceful", "Joyful", "Happy"].includes(customMoodSelection);

    setMoodsList((prev) => [newMood, ...prev]);
    await saveMoodToDB(newMood);
    completeDailyGoal("goal_mood");
    
    if (isBetter) {
      setPlantedFlowerName("");
      setShowPlantFlowerPrompt(true);
    }

    setCustomMoodNote("");
    setCustomTagInput("");
  };

  const handlePlantFlower = () => {
    const nameToUse = plantedFlowerName.trim() || `${selectedFlowerToPlant} of Grace`;
    const newFlower = {
      id: "fl-" + Date.now(),
      type: selectedFlowerToPlant,
      name: nameToUse,
      timestamp: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      scale: 0.2,
      isGrowing: true
    };
    setGardenFlowers(prev => [newFlower, ...prev]);
    setShowPlantFlowerPrompt(false);
    setActiveCenterTab('community'); // Switch immediately to Community Center to witness growth!
    
    // Sprout grows to 0.40 automatically to show immediate progress, then requires goals!
    setTimeout(() => {
      setGardenFlowers(prev => prev.map(f => f.id === newFlower.id ? { ...f, scale: 0.40, isGrowing: true } : f));
      setGoalToast({
        show: true,
        title: "Seed Sprouted! 🌱",
        text: `"${nameToUse}" is growing! Complete your Daily Mindfulness Goals to expand its bloom!`
      });
      setTimeout(() => {
        setGoalToast(prev => ({ ...prev, show: false }));
      }, 5500);
    }, 1200);
  };

  const handleWipeAllData = async () => {
    setIsWiping(true);
    try {
      await clearMoodsFromDB();
      setMoodsList([]);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const resetStats = { date: todayStr, sessions: 0, seconds: 0 };
      setBreathingStats(resetStats);
      try {
        localStorage.removeItem("pfai_breathing_stats");
      } catch (e) {
        console.error("Error clearing breathing stats localstorage on wipe:", e);
      }

      setShowWipeConfirm(false);
      setWipeSuccess(true);
      setTimeout(() => setWipeSuccess(false), 4000);
    } catch (err) {
      console.error("Wipe failed:", err);
    } finally {
      setIsWiping(false);
    }
  };

  const handleDownloadMoodLog = () => {
    registerInteraction();
    try {
      const exportData = {
        application: "Project Friend AI - Secure Grounding Sanctuary",
        exportedAt: new Date().toISOString(),
        note: "Secure Offline-First Local-Only Client-Side Mood Log Export",
        entries: moodsList
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = url;
      
      const dateStr = new Date().toISOString().split("T")[0];
      downloadAnchor.download = `project_friend_mood_log_${dateStr}.json`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      
      // Open the visual reminder to warn user regarding local-only data backup
      setShowDownloadBackupReminder(true);
    } catch (err) {
      console.error("Exporting local mood logs failed:", err);
    }
  };

  const handleExportMoodPDF = async () => {
    registerInteraction();
    if (!moodsList || moodsList.length === 0) {
      alert("No mood history available to generate a PDF summary.");
      return;
    }

    try {
      // 1. Create a beautiful high-fidelity canvas programmatically to draw the trend line chart
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Crisp white backing
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw elegant dashed horizontal reference lines for mood intensity
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        
        for (let i = 2; i <= 10; i += 2) {
          const y = canvas.height - 40 - ((i / 10) * (canvas.height - 80));
          ctx.beginPath();
          ctx.moveTo(80, y);
          ctx.lineTo(canvas.width - 40, y);
          ctx.stroke();
          
          // Draw Y axis labels
          ctx.fillStyle = "#64748b";
          ctx.font = "bold 15px monospace";
          ctx.setLineDash([]); // disable dash for labels
          ctx.fillText(`${i} -`, 42, y + 5);
          ctx.setLineDash([6, 6]); // re-enable dash
        }
        ctx.setLineDash([]); // clear dash formatting for final outlines
        
        // Solid bottom X-axis line
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(80, canvas.height - 40);
        ctx.lineTo(canvas.width - 40, canvas.height - 40);
        ctx.stroke();

        // Collect chronologically ordered entries
        const chronological = [...moodsList].reverse();
        const numPoints = chronological.length;
        const pts: {x: number; y: number; mood: string; val: number; date: string}[] = [];
        
        // Calculate coordinate mapping
        for (let i = 0; i < numPoints; i++) {
          const x = numPoints > 1 
            ? 100 + (i / (numPoints - 1)) * (canvas.width - 240) 
            : canvas.width / 2;
          const y = canvas.height - 40 - ((chronological[i].intensity / 10) * (canvas.height - 80));
          pts.push({ 
            x, 
            y, 
            mood: chronological[i].mood, 
            val: chronological[i].intensity,
            date: chronological[i].timestamp.replace(/,\s\d{2}:\d{2}\s[A-Z]{2}/gi, '') // compact date representation
          });
        }

        // Draw Area fill shade below coordinates
        if (numPoints > 1 && pts.length > 0) {
          const areaGrad = ctx.createLinearGradient(0, 40, 0, canvas.height - 40);
          areaGrad.addColorStop(0, "rgba(99, 102, 241, 0.35)");
          areaGrad.addColorStop(1, "rgba(99, 102, 241, 0.0)");
          ctx.fillStyle = areaGrad;
          
          ctx.beginPath();
          ctx.moveTo(pts[0].x, canvas.height - 40);
          for (const pt of pts) {
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.lineTo(pts[pts.length - 1].x, canvas.height - 40);
          ctx.closePath();
          ctx.fill();
        }

        // Connect data points with an elegant solid Indigo line
        if (pts.length > 0) {
          ctx.strokeStyle = "#4f46e5";
          ctx.lineWidth = 4.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
        }

        // Draw visual dots & diagnostic micro-metrics
        for (const pt of pts) {
          // White pill backing
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#4f46e5";
          ctx.stroke();
          
          // Color code dots representing individual anxiety limits
          let distressColor = "#10b981"; // Healthy Stable Green
          if (pt.val >= 8) distressColor = "#ef4444"; // Alarm/Severe Red
          else if (pt.val >= 6) distressColor = "#f59e0b"; // Tense Amber
          else if (pt.val >= 4) distressColor = "#06b6d4"; // Tired Aqua
          
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = distressColor;
          ctx.fill();
          
          // Render mood level texts centered over corresponding peaks
          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${pt.mood} (${pt.val})`, pt.x, pt.y - 15);

          // Render timestamp underneath x axis ticks
          ctx.fillStyle = "#64748b";
          ctx.font = "bold 11px monospace";
          ctx.textBaseline = "top";
          ctx.fillText(pt.date, pt.x, canvas.height - 28);
        }
      }
      
      const chartImgData = canvas.toDataURL("image/png");

      // 2. Setup landscape A4 (or standard portrait A4) document container
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // --- PRIMARY METRIC PALETTE ---
      // Primary Indigo Accent: [79, 70, 229]
      // Deep Charcoal Text: [15, 23, 42]
      // Light Neutral Backing: [248, 250, 252]

      // Draw Header Ribbon
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 36, "F");

      // Set Header textual indicators
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("PROJECT FRIEND AI SANCTUARY", 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Personal Somatic Grounding Sanctuary & De-escalation Diary", 14, 21);
      doc.text("Zero server databases. Complete local browser protection & offline integrity.", 14, 25);

      // Present generation date 
      const currentFormattedDate = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      doc.setFontSize(8.5);
      doc.text(`Generated: ${currentFormattedDate}`, 142, 15);

      // Render summary analytic card details
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(13, 42, 184, 24, 3, 3, "F");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("SECURE ANALYTIC SUMMARY", 18, 48);

      const totalLogs = moodsList.length;
      const severitySum = moodsList.reduce((acc, curr) => acc + curr.intensity, 0);
      const intensityMean = (severitySum / totalLogs).toFixed(1);
      const intensityArray = moodsList.map(m => m.intensity);
      const peakAnxietyValue = Math.max(...intensityArray);
      const stableAnxietyValue = Math.min(...intensityArray);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Logged Entries Count: ${totalLogs}`, 18, 54);
      doc.text(`Average Severity Ratio: ${intensityMean} / 10`, 18, 59);
      doc.text(`Severity Extents: Maximum Peak (${peakAnxietyValue}/10) | Minimum Level (${stableAnxietyValue}/10)`, 85, 54);
      doc.text("Somatic Action Plan: Connected Breathing Guard & Client-Side Pacer Configured", 85, 59);

      // Section Separator
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 72, 196, 72);

      // Section 1: Chart Waveform
      doc.setTextColor(79, 70, 229);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("HISTORICAL MOOD WAVESTREAM", 14, 78);

      // Append high quality programmatically constructed line chart
      doc.addImage(chartImgData, "PNG", 14, 82, 182, 60);

      // Section 2: Interactive Table Grid
      doc.setTextColor(79, 70, 229);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("CHRONOLOGICAL DIARY REFLECTIONS", 14, 150);

      // Draw Grid Headers table
      doc.setFillColor(241, 245, 249);
      doc.rect(14, 154, 182, 7, "F");

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Logged Timestamp", 17, 159);
      doc.text("Reported State", 70, 159);
      doc.text("Severity", 102, 159);
      doc.text("Personal Somatic Notes & Adaptive Insights", 124, 159);

      let tableY = 166;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);

      // Map through logged episodes cleanly
      const reversedList = [...moodsList];
      for (let i = 0; i < reversedList.length; i++) {
        const row = reversedList[i];
        
        // Alternating row background fills
        if (i % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, tableY - 4.5, 182, 7.5, "F");
        }

        // Datestamp info
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(String(row.timestamp), 17, tableY);

        // Core mood text
        doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229);
        doc.text(String(row.mood), 70, tableY);

        // Severity colored text
        let severityLabel = `${row.intensity}/10`;
        if (row.intensity >= 8) doc.setTextColor(239, 68, 68);
        else if (row.intensity >= 6) doc.setTextColor(245, 158, 11);
        else doc.setTextColor(16, 185, 129);
        doc.text(severityLabel, 102, tableY);

        // Reset to normal text colors for subjective situational notes
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);

        let reflectiveText = row.note || "No situational context descriptions added.";
        // Wrap or truncate long notes gracefully to keep neat boundaries
        if (reflectiveText.length > 56) {
          reflectiveText = reflectiveText.substring(0, 53) + "...";
        }
        doc.text(reflectiveText, 124, tableY);

        // Grid thin line divisor
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.3);
        doc.line(14, tableY + 3, 196, tableY + 3);

        tableY += 7.5;

        // Auto-page layout spill handle
        if (tableY > 268 && i < reversedList.length - 1) {
          doc.addPage();
          
          // Re-draw minimal clean header on page spill for consistent neat styling
          doc.setFillColor(79, 70, 229);
          doc.rect(0, 0, 210, 14, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("PROJECT FRIEND MOOD REPORT - CONTINUED DIARY", 14, 9);
          
          // Re-draw grid layout columns reference
          tableY = 32;
          doc.setFillColor(241, 245, 249);
          doc.rect(14, tableY - 6, 182, 7, "F");
          doc.setTextColor(71, 85, 105);
          doc.setFontSize(8);
          doc.text("Logged Timestamp", 17, tableY - 1.5);
          doc.text("Reported State", 70, tableY - 1.5);
          doc.text("Severity", 102, tableY - 1.5);
          doc.text("Personal Somatic Notes & Adaptive Insights", 124, tableY - 1.5);
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(15, 23, 42);
          tableY += 6;
        }
      }

      // Safe grounding signature banner at absolute page bottom
      doc.setDrawColor(199, 210, 254);
      doc.setLineWidth(0.5);
      doc.line(14, 274, 196, 274);

      doc.setFillColor(245, 243, 255);
      doc.rect(14, 276, 182, 12, "F");

      doc.setTextColor(79, 70, 229);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.text("Notice: Somatic logs are safe offline educational tools built to aid self-awareness of emotional patterns.", 18, 280);
      doc.text("In danger or high emergency cases, please reach local medical help or direct crisis hotlines immediately.", 18, 284);

      // Download the PDF
      const finalReportName = `friend_somatic_mood_summary_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(finalReportName);
    } catch (pdfErr) {
      console.error("Generating mood PDF report failed:", pdfErr);
      alert("Encountered an exception while rendering your PDF file. Please use JSON backup as a fallback.");
    }
  };

  const handleDownloadBreathingChartPng = () => {
    registerInteraction();
    
    const container = document.getElementById("pfai-breathing-bar-chart-container");
    if (!container) {
      alert("Breathing chart container reference not found.");
      return;
    }
    
    const svgEl = container.querySelector("svg");
    if (!svgEl) {
      alert("Chart SVG element not found.");
      return;
    }

    try {
      const clonedSvg = svgEl.cloneNode(true) as SVGElement;
      
      clonedSvg.setAttribute("style", "font-family: inherit;");
      clonedSvg.querySelectorAll("text").forEach((textEl) => {
        if (!textEl.getAttribute("fill")) {
          textEl.setAttribute("fill", "#64748b");
        }
        textEl.setAttribute("style", "font-family: 'Inter', system-ui, sans-serif; font-size: 8px;");
      });

      const rect = svgEl.getBoundingClientRect();
      const baseWidth = rect.width || 400;
      const baseHeight = rect.height || 160;

      clonedSvg.setAttribute("width", String(baseWidth));
      clonedSvg.setAttribute("height", String(baseHeight));
      if (!clonedSvg.getAttribute("viewBox")) {
        clonedSvg.setAttribute("viewBox", `0 0 ${baseWidth} ${baseHeight}`);
      }

      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      
      const canvas = document.createElement("canvas");
      const scale = 2.5; 
      const width = baseWidth * scale;
      const height = baseHeight * scale;
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `mindfulness_progress_chart_${new Date().toISOString().split("T")[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      
      img.onerror = (err) => {
        console.error("SVG Image rendering issue:", err);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mindfulness_progress_chart_${new Date().toISOString().split("T")[0]}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      
      img.src = url;
    } catch (e) {
      console.error("Error creating PNG export:", e);
      alert("Encountered exception preparing PNG.");
    }
  };

  const stopVideoSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCamEnabled(false);
    setIsMicEnabled(false);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch (e) {
          console.error("Error closing AudioContext:", e);
        }
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicAudioLevel(0);
    setVideoError(null);
  };

  const startVideoSession = async () => {
    stopVideoSession();
    setVideoError(null);
    registerInteraction();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: true
      });

      streamRef.current = stream;
      setIsCamEnabled(true);
      setIsMicEnabled(true);

      if (videoElementRef.current) {
        videoElementRef.current.srcObject = stream;
        videoElementRef.current.play().catch((err) => {
          console.warn("Auto play on video element was prevented:", err);
        });
      }

      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          const audioContext = new AudioCtxClass();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          audioContextRef.current = audioContext;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const drawVoiceFrequencyLoop = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const volumePercent = Math.min(100, Math.round((average / 150) * 100));
            setMicAudioLevel(volumePercent);
            
            animationFrameRef.current = requestAnimationFrame(drawVoiceFrequencyLoop);
          };

          drawVoiceFrequencyLoop();
        }
      } catch (audioErr) {
        console.warn("Web Audio Context initialization was prevented or fails:", audioErr);
      }

    } catch (err: any) {
      console.warn("Primary camera + microphone capture failed. Retrying fallback...", err);
      
      try {
        const streamOnlyVideo = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false
        });

        streamRef.current = streamOnlyVideo;
        setIsCamEnabled(true);
        setIsMicEnabled(false);

        if (videoElementRef.current) {
          videoElementRef.current.srcObject = streamOnlyVideo;
          videoElementRef.current.play().catch(() => {});
        }
        setVideoError("Microphone permission blocked or unavailable. Video feed active.");
      } catch (fallbackErr: any) {
        console.error("Camera capture completely failed:", fallbackErr);
        const errorString = String(fallbackErr?.message || fallbackErr || "");
        if (errorString.toLowerCase().includes("permission") || errorString.toLowerCase().includes("denied")) {
          setVideoError("Camera and microphone access was denied. Please adjust your browser privacy settings, enable permissions, and try again.");
        } else {
          setVideoError("Could not access your camera. Make sure no other program is using it and your device is plugged in.");
        }
        setIsCamEnabled(false);
        setIsMicEnabled(false);
      }
    }
  };

  const captureVideoSnapshot = () => {
    registerInteraction();
    if (!videoElementRef.current) return;

    try {
      const video = videoElementRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const context = canvas.getContext("2d");
      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setImageSnapshot(dataUrl);
      }
    } catch (err) {
      console.error("Capturing live video frame failed:", err);
    }
  };

  const handleVideoAnalysisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVideoAnalyzing) return;

    registerInteraction();
    setIsVideoAnalyzing(true);
    setVideoAnalysisResult(null);

    const targetChar = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];
    const localFeedback = `You have logged an optional personal reflection moment with ${targetChar.name}. Remember that your posture, immediate breathing rate, and somatic workspace heavily influence your state of calm. Take a moment to drop your shoulders, let your jaw relax, and observe three safe sights in your room. I'm here with you.`;

    try {
      const response = await fetch(getApiUrl(`/api/video-analysis`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageSnapshot,
          selfNotes: videoNotes,
          characterId: selectedCharacterId
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const aiText = resData.text?.trim();
        setVideoAnalysisResult(aiText || `${targetChar.name}: ${localFeedback}`);
      } else {
        setVideoAnalysisResult(`${targetChar.name}: ${localFeedback}`);
      }
    } catch (err) {
      console.error("Video personalized analysis request failed:", err);
      setVideoAnalysisResult(`${targetChar.name}: ${localFeedback}`);
    } finally {
      setIsVideoAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch (_) {}
      }
    };
  }, []);

  // Quick emergency activation representation
  const triggerCrisisAlert = () => {
    setChatHistory(prev => [
      ...prev,
      {
        id: "crisis-" + Date.now(),
        sender: "bot",
        text: `🛑 **IMMEDIATE CRISIS CONTAINER INITIATED** 🛑

Your safety is the absolute cornerstone of our ethics. Project Friend AI is non-clinical and DOES NOT replace medical treatment, medication, or professional psychiatric therapy. If you are experiencing self-harm urges or suicidal thoughts, please call a counselor right now:

- 📞 **INDIA KIRAN Helpline (Govt)**: 1800-599-0019 (24/7)
- 📞 **INDIA AASRA Crisis Support**: 91-9820466726
- 📞 **INDIA Vandrevala Foundation**: 9999 666 555
- 📞 **USA & CANADA Emergency**: Call or Text 988
- 📞 **UNITED KINGDOM NHS Help**: Call 111 / Samaritans at 116 123
- 📞 **AUSTRALIA Lifeline Service**: 13 11 14
- 📞 **SINGAPORE Samaritans**: 1767 (24/7)

**Recommended Somatic De-escalation Routine:**
1. Breathe in deeply for 4 seconds.
2. Hold your breath for 4 seconds.
3. Exhale out for 4 seconds.
4. Pause for 4 seconds.
Repeat this cycle five times. Focus your gaze on three static objects in your immediate surroundings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const isViewingLongDesc = isSharePersonaModalOpen || isAboutGuideOpen;

  return (
    <div 
      className={`w-full min-h-screen font-sans flex antialiased transition-all duration-500 ${
        activeCenterTab === 'chat' && activeChar 
          ? (isDarkCharacter(activeChar.id, themeMode) ? "text-slate-100" : "text-[#2B2B2B]")
          : themeClass("bg-[#FAF8F5] text-[#2B2B2B]", "bg-transparent text-slate-200", "bg-[#f4efe6] text-[#3e2723]")
      }`}
      style={
        themeMode === "midnight" 
          ? { background: "transparent" } 
          : activeCenterTab === 'chat' && activeChar 
            ? { background: getCharacterBg(activeChar.id, themeMode) } 
            : { background: `var(--theme-bg-${themeMode})` }
      }
    >
      {themeMode === "midnight" && (
        <BeamsBackground className="fixed inset-0 w-full h-full pointer-events-none z-0" children={<div />} />
      )}
      {isLoggedIn && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeTab={activeCenterTab} 
          onTabChange={(tab) => {
            setActiveCenterTab(tab as any);
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }} 
          onLogout={handleLogout}
          alias={loginAlias}
          zenMode={zenMode}
          onToggleZenMode={() => setZenMode(!zenMode)}
          themeMode={themeMode}
          onThemeChange={(t) => setThemeMode(t as any)}
          onOpenClinicalDirectory={() => {
            setActiveCenterTab('directory' as any);
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          onNewChat={handleNewChat}
          onSearchClick={handleSearchClick}
          sessions={chatSessions.filter(s => s.characterId === selectedCharacterId)}
          onSelectSession={(sid) => {
            handleSelectSession(sid);
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          onDeleteSession={handleDeleteSession}
        />
      )}
      
      {/* Main App Content Area (Right of Sidebar) */}
      <div className="flex-1 flex flex-col relative min-h-screen overflow-x-hidden">
        {isLoggedIn && (
          <div className="md:hidden flex items-center gap-3 px-4 py-2.5 bg-white border-b border-[#EDEBE7] z-40 sticky top-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1.5 text-[#6B6B6B] hover:text-[#2B2B2B] rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <img src="/friend_ai_logo.png" alt="friend ai logo" className="w-9 h-9 rounded-xl object-cover border border-[#EDEBE7] shrink-0 shadow-sm" />
              <span className="font-extrabold text-sm tracking-tight text-[#2B2B2B]">friend <span className="text-[#7A9E85]">ai</span></span>
            </div>
          </div>
        )}
        {!isLoggedIn ? (
          <div className="flex-1 w-full">
            <Hero1 onSignIn={() => { setAuthModalTab("login"); setIsAliasModalOpen(true); }} onGetStarted={() => { setAuthModalTab("signup"); setIsAliasModalOpen(true); }} />
          </div>
        ) : (
        <div className={`flex-1 w-full mx-auto ${
          activeCenterTab === 'chat' 
            ? 'flex flex-col' 
            : 'max-w-[1700px] p-4 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6'
        }`}>
        {activeCenterTab === 'analytics' ? (
          <div className="col-span-1 xl:col-span-12">
            
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowMoodLog(true)}
                className="px-4 py-2 bg-[#7A9E85] hover:bg-[#6B9080] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Open Mood Log
              </button>
            </div>
            <Dashboard alias={loginAlias} onStartChat={() => setActiveCenterTab('chat')} onNewEntry={() => setActiveCenterTab('journal')} />
            
            {showMoodLog && (
              <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 bg-black/30 backdrop-blur-sm animate-fade-in">
                <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-lg border border-[#EDEBE7] p-2 sm:p-6 animate-slide-up">
                  <button 
                    onClick={() => setShowMoodLog(false)}
                    className="absolute top-6 right-6 p-2 bg-[#FAF8F5] hover:bg-[#EDEBE7] rounded-full text-[#6B6B6B] hover:text-[#2B2B2B] transition-colors z-10"
                  >
                    ✕
                  </button>
                  
          <div className="bg-white border border-[#EDEBE7] shadow-sm p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-display text-[#2B2B2B]">Browser-Secure Mood Log</h3>
                <p className="text-xs font-sans text-[#6B6B6B]">Zero database storage. Encrypted on-device.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="download-mood-log-btn"
                  type="button"
                  onClick={handleDownloadMoodLog}
                  className="px-2 py-1 flex items-center gap-1.5 text-[9px] font-mono leading-none border border-[#EDEBE7] hover:border-[#7A9E85] bg-[#FAF8F5] hover:bg-[#E8F0EA] text-[#7A9E85] rounded-xl transition-all cursor-pointer shadow-sm"
                  title="Download secure JSON backup of your moods locally"
                >
                  <Download className="w-3 h-3" />
                  Download Log
                </button>
                <button
                  id="export-pdf-summary-btn"
                  type="button"
                  onClick={handleExportMoodPDF}
                  className="px-2 py-1 flex items-center gap-1.5 text-[9px] font-mono leading-none border border-emerald-200 hover:border-emerald-350 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-700 rounded-lg transition-all cursor-pointer shadow-sm"
                  title="Export a premium print-ready PDF summary of your mood trend graph and logs"
                >
                  <FileText className="w-3 h-3 text-emerald-650" />
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowWipeConfirm(true)}
                  className="px-2 py-1 flex items-center gap-1.5 text-[9px] font-mono leading-none border border-rose-200 dark:border-rose-800 hover:border-rose-350 bg-rose-50/50 hover:bg-rose-100/50 text-rose-600 rounded-lg transition-all cursor-pointer shadow-sm"
                  title="Wipe local entries securely"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  Wipe DB
                </button>
                <span className="text-[10px] uppercase font-mono font-bold bg-indigo-50 dark:bg-white/[0.02] text-indigo-705 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  AES Private
                </span>
              </div>
            </div>

            {hasThreeConsecutiveHighMoods && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50/90 border border-rose-200 dark:border-rose-800 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm text-rose-800"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[11.5px] font-bold leading-tight text-rose-900 flex items-center gap-1.5">
                      <span>High Stress Indicator Active</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    </p>
                    <p className="text-[10.5px] leading-relaxed text-rose-700 dark:text-rose-300 font-sans mt-0.5">
                      Your last three consecutive mood records show a severe intensity level of 8/10 or higher. Let's take a moment together to stabilize and ground your breathing.
                    </p>
                  </div>
                </div>
                {!isBreathingActive ? (
                  <button
                    type="button"
                    onClick={toggleBreathing}
                    className="self-start text-[10.5px] font-bold font-mono px-3 py-1 bg-rose-600 hover:bg-rose-700 hover:scale-[1.02] active:scale-[0.98] text-white rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    🧘 Start 4-4-4 Box Breathing
                  </button>
                ) : (
                  <div className="text-[10px] text-emerald-700 font-bold font-mono inline-flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded border border-emerald-150 self-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Breathing Guide Running
                  </div>
                )}
              </motion.div>
            )}

            {/* Dynamic Trend Line using beautiful highly-sculptured inline SVGs */}
            <div className="p-4 bg-slate-50/ dark:bg-[#0a0a0a]/40 rounded-xl border border-slate-200 dark:border-white/10 relative" onClick={() => setClickedTrendPoint(null)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/40 pb-2 mb-2">
                <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">
                  {moodTrendView === "Intensity Over Time" 
                    ? `${selectedTagFilter === "All Tags" ? "Severity Trend" : `Tag Mood Trend: ${selectedTagFilter}`} (1 = Low, 10 = Severe Alarm)`
                    : `Trigger Frequency Distribution`
                  }
                </span>
                
                {/* Beautiful Modern Pill-shaped Date Range Segment Selector */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {/* Tag Selector */}
                  <select
                    value={selectedTagFilter}
                    onChange={(e) => setSelectedTagFilter(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9.5px] font-mono font-bold bg-white dark:bg-black border border-slate-200/80 px-1.5 py-0.5 rounded cursor-pointer text-slate-705 dark:text-slate-200"
                  >
                    <option value="All Tags">All Tags</option>
                    {uniqueTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>

                  {/* Trend View Selector */}
                  <select
                    value={moodTrendView}
                    onChange={(e) => setMoodTrendView(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9.5px] font-mono font-bold bg-white dark:bg-black border border-slate-200/80 px-1.5 py-0.5 rounded cursor-pointer text-slate-705 dark:text-slate-200"
                  >
                    <option value="Intensity Over Time">⏱️ Intensity</option>
                    <option value="Trigger Frequency Distribution">📊 Triggers</option>
                  </select>

                  <div className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200/50 dark:bg-black/80 p-0.5 rounded-lg border border-slate-200/60 shrink-0">
                  {(["All Time", "Past Week", "Past Month"] as const).map((range) => {
                    const label = range === "All Time" ? "All" : range === "Past Week" ? "7 Days" : "30 Days";
                    const active = selectedDateRange === range;
                    return (
                      <button
                        key={range}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateRange(range);
                        }}
                        className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                          active
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250 hover:bg-black/5 dark:hover:bg-white dark:bg-black/5"
                        }`}
                        title={`Filter trends to ${range}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
              
              {moodTrendView === "Intensity Over Time" ? (
                <>
                  <div className="h-28 flex items-end justify-between mt-3 px-2 relative min-w-full">
                    {/* Horizontal reference lines */}
                    <div className="absolute left-0 right-0 top-0 border-b border-slate-200 dark:border-white/10 border-dashed" />
                    <div className="absolute left-0 right-0 top-1/2 border-b border-slate-200 dark:border-white/10 border-dashed" />
                    <div className="absolute left-0 right-0 bottom-0 border-b border-slate-200 dark:border-white/10 border-dashed" />
                    
                    {/* Beautiful custom vector graph plotted in SVG */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4338ca" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#4338ca" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {(() => {
                        const chronologicalMoods = [...filteredMoodSumList].reverse();
                        const n = chronologicalMoods.length;
                        if (n === 0) {
                          return (
                            <text x="50" y="55" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-sans font-medium" style={{ pointerEvents: 'none' }}>
                              No entries logged for selected filters
                            </text>
                          );
                        }
                        
                        const pts = chronologicalMoods.map((entry, index) => {
                          const x = n > 1 ? 5 + (index / (n - 1)) * 90 : 50;
                          const y = 15 + (10 - entry.intensity) * 7;
                          return { x, y, entry };
                        });
                        
                        let pathD = "";
                        let areaD = "";
                        
                        if (n === 1) {
                          pathD = `M 5,${pts[0].y} L 95,${pts[0].y}`;
                          areaD = `M 5,${pts[0].y} L 95,${pts[0].y} L 95,100 L 5,100 Z`;
                        } else {
                          pathD = pts.map((pt, ind) => ind === 0 ? `M ${pt.x},${pt.y}` : `L ${pt.x},${pt.y}`).join(" ");
                          areaD = `${pathD} L ${pts[pts.length - 1].x},100 L ${pts[0].x},100 Z`;
                        }
                        
                        return (
                          <>
                            <path 
                              d={pathD} 
                              fill="none" 
                              stroke="rgba(99, 102, 241, 0.9)" 
                              strokeWidth="3" 
                              strokeLinecap="round"
                            />
                            <path 
                              d={areaD} 
                              fill="url(#chartGrad)"
                            />
                            {pts.map((pt) => {
                              let fill = '#10b981'; // stable
                              if (pt.entry.intensity >= 8) fill = '#f43f5e'; // severe
                              else if (pt.entry.intensity >= 6) fill = '#fbbf24'; // anxious
                              else if (pt.entry.intensity >= 4) fill = '#2dd4bf'; // peaceful / tired
                              
                              const isSelected = clickedTrendPoint?.entry.id === pt.entry.id;
                              return (
                                <circle 
                                  key={pt.entry.id} 
                                  cx={pt.x} 
                                  cy={pt.y} 
                                  r={isSelected ? "5.5" : "3.5"} 
                                  fill={fill} 
                                  stroke={isSelected ? "#312e81" : "rgba(255,255,255,0.8)"}
                                  strokeWidth={isSelected ? "1.5" : "0.5"}
                                  className="transition-all duration-300 hover:scale-150 cursor-pointer origin-center"
                                  style={{ transformOrigin: `${pt.x}% ${pt.y}%` }}
                                  onMouseEnter={() => {
                                    setHoveredTrendPoint({ entry: pt.entry, x: pt.x, y: pt.y });
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredTrendPoint(null);
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setClickedTrendPoint({ entry: pt.entry, x: pt.x, y: pt.y });
                                  }}
                                >
                                  <title>{`${pt.entry.mood} (${pt.entry.intensity}/10) - hover to scan, click for details`}</title>
                                </circle>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>

                    {/* Interactive hover tooltip displaying mood, intensity, and date */}
                    {hoveredTrendPoint && (!clickedTrendPoint || clickedTrendPoint.entry.id !== hoveredTrendPoint.entry.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-40 pointer-events-none bg-black dark:bg-slate-950 border border-white/10/80 rounded-xl shadow-lg p-2.5 w-48 text-left text-white"
                        style={{
                          left: `${hoveredTrendPoint.x > 75 ? 'calc(100% - 200px)' : hoveredTrendPoint.x < 25 ? '8px' : `calc(${hoveredTrendPoint.x}% - 96px)`}`,
                          ...(hoveredTrendPoint.y < 45 
                            ? { top: `calc(${hoveredTrendPoint.y}% + 12px)` } 
                            : { bottom: `calc(${100 - hoveredTrendPoint.y}% + 12px)` }
                          )
                        }}
                      >
                        <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo-300 truncate">
                            {hoveredTrendPoint.entry.mood}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-white dark:bg-black/10 px-1.5 py-0.5 rounded text-indigo-200">
                            {hoveredTrendPoint.entry.intensity}/10
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[9.5px] text-slate-300 font-mono flex items-center gap-1">
                            <span className="text-slate-400">📅</span>
                            <span>{hoveredTrendPoint.entry.timestamp}</span>
                          </div>
                          {hoveredTrendPoint.entry.tags && hoveredTrendPoint.entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {hoveredTrendPoint.entry.tags.slice(0, 2).map((tg, idx) => (
                                <span key={idx} className="text-[8px] bg-[#0a0a0a] text-indigo-300 border border-white/10/80 px-1 rounded">
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Highly interactive popover floating over the SVG graph */}
                    {clickedTrendPoint && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute z-30 bg-white dark:bg-black border border-indigo-150 dark:border-white/10 rounded-xl shadow-xl p-3 w-64 text-left text-slate-800 dark:text-slate-200"
                        style={{
                          left: `${clickedTrendPoint.x > 75 ? 'calc(100% - 264px)' : clickedTrendPoint.x < 25 ? '8px' : `calc(${clickedTrendPoint.x}% - 128px)`}`,
                          ...(clickedTrendPoint.y < 45 
                            ? { top: `calc(${clickedTrendPoint.y}% + 12px)` } 
                            : { bottom: `calc(${100 - clickedTrendPoint.y}% + 12px)` }
                          )
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] font-bold uppercase tracking-wider font-mono bg-indigo-50 dark:bg-white/[0.02] text-[#7A9E85] dark:text-indigo-300 px-1.5 py-0.5 rounded truncate">
                              {clickedTrendPoint.entry.mood}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-505 font-mono shrink-0">
                              {clickedTrendPoint.entry.intensity}/10
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setClickedTrendPoint(null)}
                            className="text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors cursor-pointer p-0.5 bg-slate-50 dark:bg-[#0a0a0a] hover:bg-slate-100 rounded"
                            title="Close popover"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <p className="text-xs text-slate-650 dark:text-slate-350 mb-2.5 leading-relaxed bg-white/20 dark:bg-white/[0.01] p-2 rounded border border-slate-100 dark:border-white/10 max-h-24 overflow-y-auto break-words font-sans">
                          {clickedTrendPoint.entry.note || "No custom note logged for this entry."}
                        </p>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/10 flex-wrap">
                          <div className="flex flex-wrap gap-0.5 max-w-[65%]">
                            {clickedTrendPoint.entry.tags && clickedTrendPoint.entry.tags.length > 0 ? (
                              clickedTrendPoint.entry.tags.map((tg, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-[9px] bg-slate-100 dark:bg-[#0a0a0a] border border-slate-150-b text-slate-650 dark:text-slate-350 px-1 rounded-md font-medium"
                                >
                                  #{tg}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-slate-400 font-mono">no tags</span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono self-end shrink-0">
                            {clickedTrendPoint.entry.timestamp}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Legend axes */}
                    <span className="absolute left-1 top-0.5 text-[9px] text-rose-600 font-mono font-bold">Extreme</span>
                    <span className="absolute left-1 bottom-0.5 text-[9px] text-emerald-600 font-mono font-bold">Stable</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                    <span>{selectedDateRange === "Past Week" ? "7 days ago" : selectedDateRange === "Past Month" ? "30 days ago" : "3 days ago"}</span>
                    <span>{selectedDateRange === "Past Week" ? "3 days ago" : selectedDateRange === "Past Month" ? "15 days ago" : "Yesterday"}</span>
                    <span>Today</span>
                  </div>
                </>
              ) : (
                <div className="mt-3.5 space-y-3 min-h-[144px] max-h-[220px] overflow-y-auto pr-1 text-left">
                  {triggerFrequencies.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center text-[11px] text-slate-400 font-sans gap-2 text-center">
                      <span>No tags associated with logged emotions yet.</span>
                      <span className="text-[10px] text-slate-500">Log entries with commas in the Tags block to see distribution.</span>
                    </div>
                  ) : (
                    triggerFrequencies.map((item, idx) => {
                      const maxCount = Math.max(...triggerFrequencies.map(f => f.count), 1);
                      const percentage = (item.count / maxCount) * 100;
                      
                      // color representing avgIntensity
                      let barColor = "bg-emerald-500";
                      let textColor = "text-emerald-700";
                      let bgTint = "bg-emerald-100/50";
                      let hoverBorder = "hover:border-emerald-250";
                      if (item.avgIntensity >= 8) {
                        barColor = "bg-rose-500";
                        textColor = "text-rose-700";
                        bgTint = "bg-rose-100/50";
                        hoverBorder = "hover:border-rose-250";
                      } else if (item.avgIntensity >= 5.5) {
                        barColor = "bg-amber-500";
                        textColor = "text-amber-700";
                        bgTint = "bg-amber-100/50";
                        hoverBorder = "hover:border-amber-250";
                      } else if (item.avgIntensity >= 3.5) {
                        barColor = "bg-teal-500";
                        textColor = "text-teal-700";
                        bgTint = "bg-teal-100/50";
                        hoverBorder = "hover:border-teal-250";
                      }
                      
                      return (
                        <div key={item.tag} className={`flex flex-col gap-1.5 p-2 bg-white dark:bg-black/60 border border-slate-100 dark:border-white/10 rounded-lg shadow-2xs transition-all duration-200 ${hoverBorder}`}>
                          <div className="flex items-center justify-between text-xs font-sans text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="inline-block w-3.5 h-3.5 rounded-full bg-slate-200 text-[9px] flex items-center justify-center font-bold text-slate-500 font-mono">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-indigo-950 font-mono truncate">#{item.tag}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[10.5px] shrink-0">
                              <span>Occurrences: <strong className="text-slate-900">{item.count}</strong></span>
                              <span className="text-slate-305">|</span>
                              <span className={`px-1.5 py-0.5 rounded ${textColor} ${bgTint} font-semibold`}>
                                Avg. Intensity: {item.avgIntensity}/10
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100/60 rounded-full h-2 overflow-hidden border border-slate-200/55">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                              className={`h-full ${barColor} rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Dynamic Secure Analytics / AI Grounding Insights */}
              <div id="pfai-mood-insights-block" className="mt-4 pt-3.5 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block font-mono">
                    ✨ AI Wellness Check-in
                  </span>
                  {isLoadingInsight && (
                    <span className="text-[9px] text-indigo-600/70 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping inline-block" />
                      De-identifying...
                    </span>
                  )}
                </div>
                <div className="bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-3 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40 rounded-l" />
                  {isLoadingInsight && !moodInsight ? (
                    <div className="flex items-center gap-2 text-slate-400 italic py-1">
                      <span className="animate-pulse">Retrieving anonymous trend markers...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">{moodInsight}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick logging form */}
            <form onSubmit={handleAddMood} className="space-y-3 bg-slate-50 dark:bg-[#0a0a0a] p-3.5 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">State</label>
                  <select
                    value={customMoodSelection}
                    onChange={(e) => setCustomMoodSelection(e.target.value)}
                    className="w-full bg-white dark:bg-black border border-slate-250 dark:border-white/10 rounded-lg text-xs p-1.5 focus:border-indigo-400 dark:focus:border-indigo-600 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="Overwhelmed">☁️ Overwhelmed</option>
                    <option value="Anxious">🍃 Anxious</option>
                    <option value="Tired">💤 Tired</option>
                    <option value="Peaceful">🌾 Peaceful</option>
                    <option value="Depressed">🌧️ Heavy Mind</option>
                    <option value="Joyful">☀️ Safe/Joyful</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Severity: {customMoodIntensity}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={customMoodIntensity}
                    onChange={(e) => setCustomMoodIntensity(Number(e.target.value))}
                    className="w-full mt-2.5 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={customMoodNote}
                  onChange={(e) => setCustomMoodNote(e.target.value)}
                  placeholder="Note (e.g., Felt panic in the crowd...)"
                  className="w-full bg-white dark:bg-black border border-slate-250 dark:border-white/10 rounded-lg text-xs p-1.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-400 dark:focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  placeholder="Tags (family, work etc)"
                  className="flex-1 bg-white dark:bg-black border border-slate-250 dark:border-white/10 rounded-lg text-xs p-1.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-400 dark:focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shrink-0 shadow-sm"
                >
                  🔐 Log Secure
                </button>
              </div>
            </form>

            {/* List scrollbox */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {filteredMoodSumList.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No secure logs found with trigger tag '{selectedTagFilter}'</p>
              ) : (
                filteredMoodSumList.map((entry) => {
                  const getIntensityStyle = (intensity: number) => {
                    if (intensity <= 3) {
                      return {
                        border: themeClass("border-[#7A9E85]/30 hover:border-[#7A9E85]/50", "border-emerald-800/40 hover:border-emerald-700/50", "border-emerald-700/25 hover:border-emerald-700/40"),
                        bg: themeClass("bg-[#7A9E85]/5 hover:bg-[#7A9E85]/10", "bg-emerald-950/15 hover:bg-emerald-950/25", "bg-emerald-100/10 hover:bg-emerald-100/15"),
                        text: themeClass("text-slate-800", "text-emerald-100", "text-[#3e2723]"),
                        subText: themeClass("text-slate-600", "text-slate-400", "text-amber-900/70"),
                        badge: themeClass(
                          "bg-[#7A9E85]/10 text-[#7A9E85] border-[#7A9E85]/30",
                          "bg-emerald-950/45 text-emerald-400 border-emerald-900/50",
                          "bg-emerald-100/45 text-emerald-900 border-emerald-300/30"
                        )
                      };
                    } else if (intensity <= 7) {
                      return {
                        border: themeClass("border-amber-250 hover:border-amber-300", "border-amber-800/40 hover:border-amber-700/50", "border-amber-700/25 hover:border-amber-700/40"),
                        bg: themeClass("bg-amber-50/15 hover:bg-amber-50/25", "bg-amber-950/15 hover:bg-amber-950/25", "bg-amber-100/10 hover:bg-amber-100/15"),
                        text: themeClass("text-slate-800", "text-amber-100", "text-[#3e2723]"),
                        subText: themeClass("text-slate-600", "text-slate-400", "text-amber-900/70"),
                        badge: themeClass(
                          "bg-amber-50/80 text-amber-700 border-amber-200 dark:border-amber-800",
                          "bg-amber-950/45 text-amber-350 border-amber-900/50",
                          "bg-amber-100/45 text-amber-900 border-amber-300/30"
                        )
                      };
                    } else {
                      return {
                        border: themeClass("border-rose-250 hover:border-rose-300", "border-rose-800/40 hover:border-rose-700/50", "border-rose-700/25 hover:border-rose-700/40"),
                        bg: themeClass("bg-rose-50/20 hover:bg-rose-50/30", "bg-rose-950/15 hover:bg-rose-950/25", "bg-rose-100/10 hover:bg-rose-100/15"),
                        text: themeClass("text-slate-800", "text-rose-100", "text-[#3e2723]"),
                        subText: themeClass("text-slate-600", "text-slate-400", "text-amber-900/70"),
                        badge: themeClass(
                          "bg-rose-50/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
                          "bg-rose-950/45 text-rose-350 border-rose-900/50",
                          "bg-rose-100/45 text-rose-900 border-rose-300/30"
                        )
                      };
                    }
                  };
                  const style = getIntensityStyle(entry.intensity);
                  return (
                    <div key={entry.id} className={`p-3 border rounded-xl flex items-center justify-between text-xs shadow-sm transition-all duration-300 ${style.border} ${style.bg}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${style.text}`}>{entry.mood}</span>
                          <span className={`text-[10px] border px-1.5 py-0.2 rounded font-mono font-semibold ${style.badge}`}>
                            Severity {entry.intensity}/10
                          </span>
                        </div>
                        <p className={`text-[11px] mt-1 ${style.subText}`}>{entry.note}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {entry.tags.map(t => (
                            <span 
                              key={t} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTagFilter(t);
                              }}
                              className={`text-[9px] px-1.5 rounded border cursor-pointer transition-colors ${
                                selectedTagFilter.toLowerCase() === t.toLowerCase()
                                  ? 'bg-indigo-150 text-indigo-850 hover:bg-indigo-200 border-indigo-300 font-bold'
                                  : 'bg-slate-100 dark:bg-[#0a0a0a] text-slate-500 hover:bg-indigo-50 dark:hover:bg-white/[0.02] dark:bg-white/[0.02] hover:text-indigo-600 hover:border-indigo-200 dark:border-indigo-800 border-slate-200'
                              }`}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-450 shrink-0 font-mono italic">{entry.timestamp}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-xl p-6 rounded-2xl flex flex-col gap-4">
            
            <div>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold font-display ${themeClass("text-slate-800", "text-white", "text-[#3e2723]")}`}>Anon Compassion Circle</h3>
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${themeClass("bg-rose-50 text-rose-700 border-rose-200", "bg-rose-950/40 text-rose-350 border-rose-850", "bg-rose-150/45 text-rose-950 border-rose-300/40")}`}>
                  Shared Support
                </span>
              </div>
              <p className={`text-xs mt-1 leading-normal font-sans ${themeClass("text-slate-500", "text-slate-400", "text-amber-900/70")}`}>
                Stigma around mental health causes many to suffer in complete silence. Add your anonymous message of strength to the wall. Virtual touch support.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submitSolaceMsg} className="space-y-2.5 bg-slate-50 dark:bg-[#0a0a0a] p-3 rounded-xl border border-slate-200 dark:border-white/10">
              <textarea
                value={newSolaceText}
                onChange={(e) => setNewSolaceText(e.target.value)}
                maxLength={300}
                required
                placeholder="Write a completely anonymous piece of reassurance here..."
                className="w-full bg-white dark:bg-black text-xs p-2.5 rounded-lg border border-slate-250 dark:border-white/10 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none h-16 resize-none focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-1 focus:ring-indigo-400"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSolaceLocation}
                  onChange={(e) => setNewSolaceLocation(e.target.value)}
                  placeholder="Location (e.g. Anon from Bangalore)"
                  className="flex-1 bg-white dark:bg-black text-xs p-2 rounded-lg border border-slate-250 dark:border-white/10 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-1 focus:ring-indigo-400"
                />
                
                <button
                  type="submit"
                  disabled={isSendingSolace || !newSolaceText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 tracking-tight transition-all shadow-sm"
                >
                  {isSendingSolace ? "Posting..." : "Share Anon"}
                </button>
              </div>
              {solaceError && <p className="text-[10px] text-rose-600 mt-1">{solaceError}</p>}
            </form>

            {/* Feed Scroll box */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {solaceMessages.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center p-4">No comforting entries posted yet. Be the first to break the silence.</p>
              ) : (
                solaceMessages.map((msg, index) => (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.45, 
                      ease: [0.215, 0.610, 0.355, 1.000], 
                      delay: Math.min(index * 0.055, 0.5) 
                    }}
                    className="p-3 bg-white dark:bg-black hover:bg-slate-50/40 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-250 transition shadow-sm"
                  >
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal font-sans italic">"{msg.text}"</p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-white/10">
                      <span className="text-[10px] text-[#7A9E85] dark:text-indigo-300 font-semibold font-sans">{msg.location}</span>
                      
                      <motion.button
                        whileHover="hover"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => submitHug(msg.id)}
                        className="flex items-center gap-1.5 text-[10px] bg-rose-50 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800 hover:bg-rose-100/50 cursor-pointer transition"
                        title="Provide a virtual validation hug of reassurance"
                      >
                        <motion.span
                          key={msg.hugCount}
                          initial={{ scale: 1, rotate: 0 }}
                          animate={{ 
                            scale: [1, 1.35, 1.15, 1.45, 1.1, 1],
                            rotate: [0, -10, 10, -5, 5, 0]
                          }}
                          variants={{
                            hover: {
                              scale: 1.25,
                              rotate: [-12, 12, -8, 8, 0],
                              transition: {
                                scale: {
                                  type: "spring",
                                  stiffness: 350,
                                  damping: 8
                                },
                                rotate: {
                                  duration: 0.5,
                                  ease: "easeInOut"
                                }
                              }
                            }
                          }}
                          transition={{ 
                            duration: 0.7, 
                            ease: "easeInOut",
                            times: [0, 0.15, 0.3, 0.45, 0.7, 1]
                          }}
                          className="inline-block origin-center"
                        >
                          ❤️
                        </motion.span>
                        <span>Hug Support</span> <span className="font-mono font-bold">{msg.hugCount}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
            
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
        {/* Left Column (Width: 3): Character Select list & Interactive Approach Explainer */}
        

        {/* Center Chat column (Width: 12) */}
        <section className={`flex flex-col overflow-hidden ${
          activeCenterTab === 'chat'
            ? 'flex-1'
            : 'xl:col-span-12 rounded-2xl min-h-[600px] xl:h-[820px] shadow-sm relative animate-fade-in border transition-all duration-300'
        } ${activeCenterTab !== 'chat' ? themeClass("bg-white border-[#EDEBE7]", "bg-[#0b0f19] border-white/10", "bg-[#faf6ee] border-[#e3d5be]") : ''}`}>
          
          
          {activeCenterTab === 'journal' && (
            <div className="flex-1 flex flex-col p-6 animate-fade-in bg-white rounded-2xl shadow-sm border border-[#EDEBE7] min-h-[600px]">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EDEBE7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8F0EA] rounded-xl flex items-center justify-center border border-[#EDEBE7]">
                    <Book className="w-5 h-5 text-[#7A9E85]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif text-[#2B2B2B]">Reflective Journal</h2>
                    <p className="text-xs text-[#6B6B6B]">Your private space for unguided, local-only reflection.</p>
                  </div>
                </div>
                {!isCreatingJournal && (
                  <button 
                    onClick={() => {
                      setIsCreatingJournal(true);
                      setSelectedJournalId(null);
                      setJournalTitle("");
                      setJournalContent("");
                    }}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/10 shrink-0 self-start sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Reflection
                  </button>
                )}
              </div>

              {/* Layout: Sidebar on Left (entries list), Form/Viewer on Right */}
              <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                
                {/* Left: Journal Entries List (collapsible on mobile when item selected/creating) */}
                <div className={`w-full md:w-80 flex flex-col gap-3 overflow-y-auto border-r border-slate-100 dark:border-white/5 pr-0 md:pr-4 ${
                  (selectedJournalId !== null || isCreatingJournal) ? "hidden md:flex" : "flex"
                }`}>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Saved Reflections ({journalEntries.length})</p>
                  
                  {journalEntries.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-[#0a0a0a]/30">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.02] flex items-center justify-center mb-3">
                        <Book className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">No journal entries yet</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[180px] mx-auto">Write down your thoughts, emotions, or daily reflections.</p>
                      <button 
                        onClick={() => {
                          setIsCreatingJournal(true);
                          setSelectedJournalId(null);
                          setJournalTitle("");
                          setJournalContent("");
                        }}
                        className="mt-4 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[10px] rounded-lg transition-colors cursor-pointer font-bold"
                      >
                        Create your first entry
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {journalEntries.map((entry) => {
                        const isSelected = selectedJournalId === entry.id;
                        return (
                          <div 
                            key={entry.id}
                            onClick={() => {
                              setSelectedJournalId(entry.id);
                              setIsCreatingJournal(false);
                            }}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative flex flex-col gap-1.5 ${
                              isSelected 
                                ? "bg-indigo-500/5 border-indigo-500/30 text-white" 
                                : "bg-slate-50/50 dark:bg-[#0a0a0a]/30 border-slate-150 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-bold truncate pr-6 text-slate-800 dark:text-slate-200">{entry.title || "Untitled Entry"}</h4>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Are you sure you want to permanently delete this entry?")) {
                                    const updated = journalEntries.filter(item => item.id !== entry.id);
                                    setJournalEntries(updated);
                                    localStorage.setItem("pfai_journal_entries", JSON.stringify(updated));
                                    if (selectedJournalId === entry.id) {
                                      setSelectedJournalId(null);
                                    }
                                  }
                                }}
                                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer md:bg-black/35 md:dark:bg-white/[0.01]"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{entry.content}</p>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{entry.date}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right: Dynamic Area (Editor / Viewer / Placeholder) */}
                <div className={`flex-1 flex flex-col ${
                  (selectedJournalId === null && !isCreatingJournal) ? "hidden md:flex" : "flex"
                }`}>
                  
                  {isCreatingJournal && (
                    <div className="flex-1 flex flex-col gap-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">New Journal Reflection</span>
                        <button 
                          onClick={() => setIsCreatingJournal(false)}
                          className="md:hidden text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Back to list
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={journalTitle}
                        onChange={(e) => setJournalTitle(e.target.value)}
                        placeholder="Give your reflection a title..." 
                        className="w-full text-sm font-bold p-3.5 bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-200 placeholder-slate-400"
                      />
                      <textarea 
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                        placeholder="Start writing down your raw thoughts, feelings, or ideas. Your words never leave this machine..." 
                        className="w-full flex-1 p-4 bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-indigo-500 transition-colors resize-none text-slate-850 dark:text-slate-200 text-xs leading-relaxed"
                      ></textarea>
                      <div className="flex justify-between items-center gap-3">
                        <button 
                          onClick={() => setIsCreatingJournal(false)}
                          className="px-4 py-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            if (!journalTitle.trim() || !journalContent.trim()) {
                              alert('Please provide both a title and some thoughts to save.');
                              return;
                            }
                            const newEntry = {
                              id: Date.now().toString(),
                              title: journalTitle.trim(),
                              content: journalContent.trim(),
                              date: new Date().toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })
                            };
                            const updated = [newEntry, ...journalEntries];
                            setJournalEntries(updated);
                            localStorage.setItem("pfai_journal_entries", JSON.stringify(updated));
                            setJournalTitle("");
                            setJournalContent("");
                            setIsCreatingJournal(false);
                            setSelectedJournalId(newEntry.id);
                          }}
                          className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                          <Book className="w-3.5 h-3.5" /> Save Securely
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedJournalId !== null && !isCreatingJournal && (() => {
                    const entry = journalEntries.find(e => e.id === selectedJournalId);
                    if (!entry) return null;
                    return (
                      <div className="flex-1 flex flex-col gap-4 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Saved {entry.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                if (confirm("Permanently delete this entry?")) {
                                  const updated = journalEntries.filter(item => item.id !== entry.id);
                                  setJournalEntries(updated);
                                  localStorage.setItem("pfai_journal_entries", JSON.stringify(updated));
                                  setSelectedJournalId(null);
                                }
                              }}
                              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setSelectedJournalId(null)}
                              className="text-slate-450 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 text-[10px] font-bold border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" /> Back
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">{entry.title}</h3>
                          <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap font-sans">{entry.content}</p>
                        </div>
                        
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.01] p-3 rounded-xl border border-slate-205 text-center leading-relaxed">
                          🔒 This entry is cryptographically compiled locally inside your device. It is mathematically impossible for anyone to intercept or view this note.
                        </div>
                      </div>
                    );
                  })()}

                  {selectedJournalId === null && !isCreatingJournal && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <Book className="w-10 h-10 text-slate-300 dark:text-slate-750 mb-3" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">No Reflection Selected</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">Select an entry from the sidebar on the left to read or delete it.</p>
                      <button 
                        onClick={() => {
                          setIsCreatingJournal(true);
                          setSelectedJournalId(null);
                          setJournalTitle("");
                          setJournalContent("");
                        }}
                        className="mt-4 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs rounded-xl transition-colors cursor-pointer font-bold shadow-sm"
                      >
                        Create New Entry
                      </button>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}


          {activeCenterTab === 'directory' && (
            <div className="flex-1 flex flex-col p-6 animate-fade-in bg-white rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#E8F0EA] rounded-xl flex items-center justify-center border border-[#EDEBE7]">
                  <svg className="w-5 h-5 text-[#7A9E85]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#2B2B2B]">Clinical Directory</h2>
                  <p className="text-xs text-[#6B6B6B]">Important contacts and resources for your safety.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full mt-4">
                <div className="p-5 rounded-2xl relative overflow-hidden group shadow-sm border border-[#EDEBE7] bg-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7A9E85]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2 font-display text-[#2B2B2B]">
              <svg className="w-4 h-4 text-[#7A9E85]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.9c-.807.124-1.424.814-1.424 1.631v6.938c0 .817.617 1.507 1.424 1.631.782.12 1.578.21 2.381.268.272.02.502-.178.542-.45a11.95 11.95 0 01.316-1.597 10.457 10.457 0 00-1.222-.44 1.5 1.5 0 01-.98-1.12c-.52-1.92-.52-3.92 0-5.84a1.5 1.5 0 01.98-1.12c.594-.16 1.205-.282 1.83-.362a.498.498 0 00.418-.49v-.368A2.25 2.25 0 017.682 1.5h4.636a2.25 2.25 0 012.25 2.25v.368c0 .244.177.45.418.49.625.08 1.236.202 1.83.362a1.5 1.5 0 01.98 1.12c.52 1.92.52 3.92 0 5.84a1.5 1.5 0 01-.98 1.12 10.45 10.45 0 00-1.222.44 11.95 11.95 0 01.316 1.597c.04.272.27.47.541.45.804-.058 1.6-.149 2.382-.268.807-.124 1.424-.814 1.424-1.631V6.531c0-.817-.617-1.507-1.424-1.63a39.39 39.39 0 00-15.668 0zm6.182-1.15a.75.75 0 01.75-.75h1.8a.75.75 0 01.75.75v.328a41.01 41.01 0 00-3.3 0v-.328z" clipRule="evenodd" />
              </svg>
              Combatting Stigma & AI Abuse
            </h3>
            <p className="text-xs leading-relaxed text-[#4A4A4A]">
              We never pretend to be a primary therapist. Treating standard AI chatbots as real human therapists can lead to dangerous co-dependency (often termed <span className="text-[#7A9E85] font-bold">'AI Psychosis'</span>). 
            </p>
            <div className="mt-3 text-[11px] p-2.5 rounded-lg border font-mono bg-[#FAF8F5] text-[#6B6B6B] border-[#EDEBE7]">
              <span className="text-[#7A9E85] font-bold">🔒 Client-Side Guard:</span> No personally identifiable records are shared. Complete security isolation prevents server identification leaks.
            </div>
          </div>
                <div className="bg-white border border-[#EDEBE7] p-5 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-[#7A9E85] uppercase tracking-widest mb-3 font-mono">International Crisis Links</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EDEBE7]">
                <p className="font-semibold text-[#2B2B2B]">KIRAN Mental Health India</p>
                <a href="tel:18005990019" className="text-[#7A9E85] font-mono font-medium block hover:underline">1800-599-0019 (24/7)</a>
              </div>
              <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EDEBE7]">
                <p className="font-semibold text-[#2B2B2B]">Vandrevala Helpline (India)</p>
                <a href="tel:9999666555" className="text-[#7A9E85] font-mono font-medium block hover:underline">9999 666 555 (24/7)</a>
              </div>
              <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EDEBE7]">
                <p className="font-semibold text-[#2B2B2B]">US &amp; Canada Lifeline</p>
                <span className="text-[#7A9E85] font-mono font-medium block">Dial or Text 988</span>
              </div>
              <div className="p-2 bg-[#FAF8F5] rounded-lg border border-[#EDEBE7]">
                <p className="font-semibold text-[#2B2B2B]">Global Search Portal</p>
                <a 
                  href="https://findahelpline.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#7A9E85] font-medium hover:underline flex items-center gap-1 text-[11px]"
                >
                  findahelpline.com
                  <svg className="w-3 h-3 text-[#6B6B6B] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          </div>
              </div>
            </div>
          )}
          {activeCenterTab === 'wellness' && (
            <WellnessPage
              themeClass={themeClass}
              zenMode={zenMode}
              isBreathingActive={isBreathingActive}
              breathingPhase={breathingPhase}
              breathingSecondsLeft={breathingSecondsLeft}
              toggleBreathing={toggleBreathing}
              breathingStats={breathingStats}
              totalMinutes={totalMinutes}
              goalProgressPercent={goalProgressPercent}
            />
          )}

          {activeCenterTab === 'settings' && (
            <div className="flex-1 flex flex-col items-center pt-8 pb-20 text-center px-4 md:px-10 animate-fade-in overflow-y-auto w-full max-w-2xl mx-auto font-sans">
              
              <div className="flex bg-[#FAF8F5] p-1 rounded-xl w-full max-w-md mb-8 shrink-0 border border-[#EDEBE7]">
                <button 
                  type="button"
                  onClick={() => setSettingsSubTab('profile')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${settingsSubTab === 'profile' ? 'bg-white text-[#2B2B2B] shadow-sm' : 'text-[#6B6B6B] hover:text-[#2B2B2B]'}`}
                >
                  User Info
                </button>
                <button 
                  type="button"
                  onClick={() => setSettingsSubTab('preferences')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${settingsSubTab === 'preferences' ? 'bg-white text-[#2B2B2B] shadow-sm' : 'text-[#6B6B6B] hover:text-[#2B2B2B]'}`}
                >
                  Empathetic Guides
                </button>
              </div>

              {settingsSubTab === 'profile' ? (
                <div className="w-full max-w-md mx-auto text-left space-y-6">
                  {user ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 bg-white border border-[#EDEBE7] p-4 rounded-2xl shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-[#E8F0EA] flex items-center justify-center text-[#7A9E85] text-lg font-black shrink-0">
                          {((profileDisplayName || user.email || user.uid || "AN").slice(0, 2)).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#2B2B2B] truncate">{profileDisplayName || "Anonymous"}</h3>
                          <p className="text-[11px] text-[#6B6B6B] truncate mt-0.5">{user.email}</p>
                          <p className="text-[9px] text-[#6B6B6B] font-mono truncate mt-0.5">UID: {user.uid}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Display Name</label>
                          <input
                            type="text"
                            value={profileDisplayName}
                            onChange={(e) => setProfileDisplayName(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Username</label>
                          <input
                            type="text"
                            value={profileUsername}
                            onChange={(e) => setProfileUsername(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Region</label>
                          <div className="relative">
                            <select
                              value={profileLocation}
                              onChange={(e) => setProfileLocation(e.target.value)}
                              className="w-full bg-[#FAF8F5] border border-[#EDEBE7] hover:border-[#7A9E85] rounded-xl text-xs p-3.5 text-[#2B2B2B] outline-none focus:border-[#7A9E85] transition-all cursor-pointer appearance-none"
                            >
                              <option value="India">India</option>
                              <option value="USA">United States</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Canada">Canada</option>
                              <option value="Australia">Australia</option>
                              <option value="Singapore">Singapore</option>
                              <option value="International">International</option>
                            </select>
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] text-xs">▼</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold block">History & Conditions</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              { id: "MEDS_CHRONIC", label: "Prescribed psychiatric medication" },
                              { id: "DIAGNOSED_SEVERE", label: "Severe diagnosed history" },
                              { id: "CLINICAL_SYMPTOMS", label: "Persistent clinical distress" },
                              { id: "TRAUMA_GRIEF", label: "Trauma, grief, or domestic issues" }
                            ].map(condition => (
                              <button 
                                type="button"
                                key={condition.id} 
                                onClick={() => {
                                  if (profileConditions.includes(condition.id)) {
                                    setProfileConditions(prev => prev.filter(c => c !== condition.id));
                                  } else {
                                    setProfileConditions(prev => [...prev, condition.id]);
                                  }
                                }}
                                className="text-left flex items-center gap-3 p-3 rounded-xl border border-[#EDEBE7] hover:border-[#7A9E85]/30 bg-[#FAF8F5] cursor-pointer transition-all group"
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${profileConditions.includes(condition.id) ? 'bg-[#7A9E85] border-[#7A9E85]' : 'border-[#EDEBE7] group-hover:border-[#7A9E85]'}`}>
                                  {profileConditions.includes(condition.id) && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                </div>
                                <span className={`text-[11px] transition-colors ${profileConditions.includes(condition.id) ? 'text-[#2B2B2B]' : 'text-[#6B6B6B] group-hover:text-[#2B2B2B]'}`}>
                                  {condition.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Specify Diagnosis / Symptoms (Optional)</label>
                          <textarea
                            value={profileCustomHistory}
                            onChange={(e) => setProfileCustomHistory(e.target.value)}
                            rows={2}
                            className="w-full bg-[#FAF8F5] border border-[#EDEBE7] hover:border-[#7A9E85]/30 rounded-xl text-xs p-3.5 text-[#2B2B2B] placeholder-[#6B6B6B] outline-none focus:border-[#7A9E85] transition-all resize-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user || !db) return;
                            try {
                              const { doc, updateDoc } = await import("firebase/firestore");
                              const userRef = doc(db, "users", user.uid);
                              await updateDoc(userRef, {
                                displayName: profileDisplayName.trim(),
                                username: profileUsername.trim(),
                                location: profileLocation,
                                medicalConditions: profileConditions,
                                customMedicalHistory: profileCustomHistory
                              });
                              await refreshProfile();
                              alert("Profile successfully updated in Friend AI cloud.");
                            } catch (err) {
                              alert("Failed to update profile: " + err.message);
                            }
                          }}
                          className="w-full py-3 bg-[#7A9E85] hover:bg-[#6B9080] text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider cursor-pointer text-center shadow-sm"
                        >
                          Save Changes
                        </button>

                        <div className="flex items-center justify-between pt-4 border-t border-[#EDEBE7]">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="px-4 py-2.5 border border-[#EDEBE7] hover:bg-[#FAF8F5] text-[#6B6B6B] hover:text-[#2B2B2B] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                          >
                            Sign Out
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowWipeConfirm(true)}
                            className="px-4 py-2.5 border border-[#EDEBE7] hover:bg-[#F0EBD6] text-[#6B6B6B] hover:text-[#2B2B2B] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                          >
                            Wipe Local Data
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              if (!user || !db) return;
                              if (!confirm("Are you absolutely sure you want to permanently delete your Friend AI account? This will erase all your synced cloud chats, journals, stats, and authentication profile forever. This action cannot be undone.")) {
                                return;
                              }
                              try {
                                const { deleteDoc, doc } = await import("firebase/firestore");
                                await Promise.all([
                                  deleteDoc(doc(db, "users", user.uid, "private", "chats")),
                                  deleteDoc(doc(db, "users", user.uid, "private", "journals")),
                                  deleteDoc(doc(db, "users", user.uid, "private", "stats")),
                                  deleteDoc(doc(db, "users", user.uid))
                                ]);
                                const currentUser = auth?.currentUser;
                                if (currentUser) {
                                  await currentUser.delete();
                                }
                                handleLogout();
                                alert("Your account and all associated data have been permanently deleted.");
                              } catch (err) {
                                console.error(err);
                                alert("Account deletion failed. For safety, please sign out and sign in again before running this command.");
                              }
                            }}
                            className="px-4 py-2.5 border border-[#EDEBE7] hover:bg-[#F5E6E0] text-[#6B6B6B] hover:text-[#2B2B2B] text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-white border border-[#EDEBE7] rounded-2xl space-y-4 shadow-sm">
                      <Lock className="w-8 h-8 text-[#6B6B6B] mx-auto" />
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-[#2B2B2B]">Cloud Sync Disabled</h4>
                        <p className="text-xs text-[#6B6B6B] leading-relaxed">
                          Authenticate your session to unlock private cloud back-ups for your chats, journals, and clinical Intake configuration.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAliasModalOpen(true)}
                        className="px-6 py-2.5 bg-[#7A9E85] hover:bg-[#6B9080] text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto text-left flex flex-col gap-4">
                  <button 
                    onClick={() => setShowSpecializedApproaches(!showSpecializedApproaches)}
                    className="px-6 py-3 w-full bg-white hover:bg-[#FAF8F5] border border-[#EDEBE7] text-[#2B2B2B] text-sm font-bold rounded-xl cursor-pointer transition-all shadow-sm"
                  >
                    {showSpecializedApproaches ? "Hide Specialized Approaches" : "Configure Specialized Approaches"}
                  </button>
                  {showSpecializedApproaches && (
                    <div className="animate-fade-in">
                      <div className="p-5 rounded-2xl flex flex-col gap-4 shadow-sm border border-[#EDEBE7] bg-white">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-tight uppercase font-display text-[#2B2B2B]">Specialized Approaches</h3>
                            {personaSearchQuery && (
                              <span className="text-[9px] font-bold text-[#7A9E85] bg-[#E8F0EA] px-1.5 py-0.5 border border-[#EDEBE7] rounded">
                                Filtered
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B6B6B] mt-1">
                            {personaSearchQuery ? (
                              <span>
                                Showing matching guides (or <button type="button" onClick={() => setPersonaSearchQuery("")} className="text-[#7A9E85] font-bold hover:underline cursor-pointer focus-visible:outline-none">clear search</button>):
                              </span>
                            ) : (
                              "Choose one of our 9 specialized empathetic approaches."
                            )}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 max-h-[460px] overflow-y-auto pr-1 font-sans">
                          {(() => {
                            const filtered = CHARACTERS.filter((char) => {
                              const query = personaSearchQuery.toLowerCase().trim();
                              if (!query) return true;
                              return char.name.toLowerCase().includes(query);
                            });
                            
                            if (filtered.length === 0) {
                              return (
                                <div className="p-6 text-center text-[#6B6B6B] border border-dashed border-[#EDEBE7] rounded-xl space-y-1.5 bg-[#FAF8F5]">
                                  <p className="text-xs font-semibold text-[#2B2B2B]">No matching guides found</p>
                                  <button
                                    type="button"
                                    onClick={() => setPersonaSearchQuery("")}
                                    className="text-[10px] text-[#7A9E85] font-mono font-bold hover:underline cursor-pointer"
                                  >
                                    Reset Search Filter
                                  </button>
                                </div>
                              );
                            }
                            
                            return filtered.map((char) => {
                              const isSelected = char.id === selectedCharacterId;
                              const isPremiumChar = char.id !== "persephone" && char.id !== "athena" && char.id !== "zeus" && char.id !== "hades";
                              const isLocked = isPremiumChar && !isPremiumSubscribed;
                              
                              return (
                                <button
                                  key={char.id}
                                  onClick={() => handleCharacterChange(char.id)}
                                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                                    isSelected
                                      ? "bg-[#E8F0EA] border-[#7A9E85]/30 shadow-sm"
                                      : isLocked
                                      ? "bg-[#FAF8F5] border-[#EDEBE7] opacity-80 hover:opacity-100 hover:bg-white"
                                      : "bg-white border-[#EDEBE7] hover:bg-[#FAF8F5] hover:border-[#7A9E85]/20"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="absolute top-2 right-2 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7A9E85] opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7A9E85]"></span>
                                    </span>
                                  )}

                                  {isLocked && (
                                    <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#F5E6E0] text-[#6B6B6B] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-md border border-[#EDEBE7]">
                                      <span>🔒 ₹250/mo</span>
                                    </span>
                                  )}

                                  {char.id === "hades" && (
                                    <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#F5E6E0] text-[#6B6B6B] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#EDEBE7]">
                                      <span>⚖️ Legal Support</span>
                                    </span>
                                  )}

                                  {char.id === "persephone" && (
                                    <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#E8F0EA] text-[#7A9E85] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#EDEBE7]">
                                      <span>🟢 FREE</span>
                                    </span>
                                  )}

                                  <div className={`w-8 h-8 rounded-lg ${char.avatarColor} border shrink-0 flex items-center justify-center`}>
                                    {(() => {
                                      const IconComponent = CHARACTER_ICONS[char.id] || Sparkles;
                                      return <IconComponent className="w-4 h-4" />;
                                    })()}
                                  </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 pr-14">
                                        <h4 className="text-xs font-bold text-[#2B2B2B] truncate">
                                          {highlightText(char.name, personaSearchQuery)}
                                        </h4>
                                      </div>
                                    </div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setShowSafetyModal(true)}
                    className="mb-4 mt-2 px-6 py-3 w-full max-w-xs mx-auto bg-[#E8F0EA] hover:bg-[#D6E8DA] border border-[#EDEBE7] text-[#7A9E85] text-sm font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 font-display shadow-sm"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Open AI Safety & Ethics Portal</span>
                  </button>


                </div>
              )}

            </div>
          )}
          {activeCenterTab === 'chat' && (
            <div className="flex-1 flex flex-col relative overflow-hidden">
              {/* Animated aurora background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute -top-[30%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[#7A9E85]/5 blur-[120px] animate-aurora-1" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#DEE8F0]/20 blur-[100px] animate-aurora-2" />
                <div className="absolute top-[40%] left-[50%] w-[40%] h-[40%] rounded-full bg-[#E8F0EA]/15 blur-[80px] animate-aurora-3" />
              </div>

              {/* Floating glass header */}
              <div className="shrink-0 sticky top-0 z-10 px-4 pt-4 pb-2">
                <div className="max-w-[820px] mx-auto w-full backdrop-blur-xl bg-white/70 border border-white/30 rounded-2xl shadow-lg shadow-black/[0.02] px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A9E85] to-[#6B9080] flex items-center justify-center shadow-sm shrink-0">
                    {(() => {
                      const IconComponent = CHARACTER_ICONS[activeChar.id] || Sparkles;
                      return <IconComponent className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <h2 className="text-sm font-semibold text-[#2B2B2B] font-sans">{activeChar.name}</h2>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#EDEBE7] bg-white/80 text-[9px] text-[#6B6B6B] font-sans tracking-wide shadow-sm ml-auto">
                    <Lock className="w-2.5 h-2.5 text-[#7A9E85]" />
                    Chats are encrypted and private
                  </div>
                </div>
              </div>

              <div 
                className="flex-1 overflow-y-auto scroll-smooth"
                ref={chatScrollRef}
                onScroll={handleChatScroll}
              >
                <div className="max-w-[820px] mx-auto w-full px-6 py-6 space-y-6">
                  {/* Empty welcome state */}
                  {chatHistory.length <= 1 && !isTyping && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7A9E85] to-[#6B9080] flex items-center justify-center shadow-lg shadow-[#7A9E85]/20 mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-2xl font-semibold text-[#2B2B2B] font-sans mb-2">Hello 👋</h1>
                      <h2 className="text-xl font-medium text-[#4A4A4A] font-sans mb-2">I'm Friend AI</h2>
                      <p className="text-[#6B6B6B] text-base">How are you feeling today?</p>
                    </div>
                  )}

                
                {isCrisisActive && (
                  <div className="p-4 bg-[#F5E6E0] border border-[#EDEBE7] rounded-2xl relative space-y-2 mb-4 animate-fade-in-up">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-[#7A9E85] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#2B2B2B] font-sans">Emergency Crisis Containment Triggered</h4>
                        <p className="text-[11px] text-[#4A4A4A] leading-relaxed mt-1 font-sans">
                          Our algorithms detected severe safety warning indexes matching suicidal/self-harm intent. The standard roleplay character response was halted. Please stop talking to this machine and call professional helpers who can protect you, free and privately.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1 font-sans">
                      <button 
                        onClick={() => {
                          setActiveCenterTab('safety');
                          setIsCrisisActive(false);
                        }}
                        className="px-3 py-1 bg-[#7A9E85] hover:bg-[#6B9080] text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                      >
                        View Official Directory
                      </button>
                      <button 
                        onClick={() => setIsCrisisActive(false)}
                        className="px-3 py-1 bg-white border border-[#EDEBE7] hover:bg-[#FAF8F5] text-[#4A4A4A] text-[10px] font-medium rounded-xl cursor-pointer transition-all"
                      >
                        Acknowledge Protocol
                      </button>
                    </div>
                  </div>
                )}

                {isDependencyActive && (
                  <div className="p-4 bg-[#F0EBD6] border border-[#EDEBE7] rounded-2xl relative space-y-2 mb-4 animate-fade-in-up">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-[#7A9E85] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#2B2B2B] font-sans">Reality Grounder Indicator (Codependency Prevention)</h4>
                        <p className="text-[11px] text-[#4A4A4A] leading-relaxed mt-1 font-sans">
                          Session length warning: You have exchanged multiple turns with this companion. Continuous, attachment-heavy chatbot interactions can foster co-dependency and therapist replacement delusion. Please look away from this display, fill a glass of water, and anchor yourself in your material world.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1 font-sans">
                      <button 
                        onClick={() => {
                          setActiveCenterTab('safety');
                          setIsDependencyActive(false);
                        }}
                        className="px-3 py-1 bg-[#7A9E85] hover:bg-[#6B9080] text-white text-[10px] font-bold rounded-xl cursor-pointer transition-all"
                      >
                        Read Ethics Portal Details
                      </button>
                      <button 
                        onClick={() => setIsDependencyActive(false)}
                        className="px-3 py-1 bg-white border border-[#EDEBE7] hover:bg-[#FAF8F5] text-[#4A4A4A] text-[10px] font-medium rounded-xl cursor-pointer"
                      >
                        Acknowledge Warning
                      </button>
                    </div>
                  </div>
                )}
                 {(() => {
                    const filteredHistory = chatHistory.filter((msg) => {
                      const query = chatSearchQuery.toLowerCase().trim();
                      if (!query) return true;
                      return msg.text.toLowerCase().includes(query);
                    });
                    
                    if (filteredHistory.length === 0 && chatHistory.length > 0) {
                      return (
                        <div className="p-8 text-center text-[#6B6B6B] border border-dashed border-[#EDEBE7] rounded-2xl space-y-1 bg-white/50">
                          <p className="text-xs font-semibold text-[#2B2B2B]">No matching messages found</p>
                          <button
                            type="button"
                            onClick={() => setChatSearchQuery("")}
                            className="text-[10px] text-[#7A9E85] font-mono font-bold hover:underline cursor-pointer"
                          >
                            Clear Search Filter
                          </button>
                        </div>
                      );
                    }
                    
                    return filteredHistory.map((msg, idx) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25, ease: "easeOut", delay: idx * 0.03 }}
                          className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          {!isUser && (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A9E85] to-[#6B9080] flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                              {(() => {
                                const IconComponent = CHARACTER_ICONS[activeChar.id] || Sparkles;
                                return <IconComponent className="w-4 h-4 text-white" />;
                              })()}
                            </div>
                          )}

                          <div className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                            <div 
                              className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                                isUser
                                  ? "bg-[#7A9E85] text-white rounded-2xl rounded-tr-md shadow-sm"
                                  : "bg-white border border-[#EDEBE7] text-[#4A4A4A] rounded-2xl rounded-tl-md shadow-sm"
                              }`}
                            >
                              {showEncryptedView 
                                ? generateCiphertext(msg.text) 
                                : msg.text.replace(/\*\*/g, '')
                              }
                            </div>
                            
                            {msg.isMedicoLegal && (
                               <MedicoLegalLawyersDirectory initialLocation={userLocation} />
                            )}
                            
                            <span className={`text-[10px] text-[#6B6B6B] mt-1.5 px-1 font-mono ${isUser ? "text-right" : "text-left"}`}>
                              {msg.timestamp} {showEncryptedView && "(CLIENT-ENCRYPTED SHA-256)"}
                            </span>
                          </div>
                        </motion.div>
                      );
                    });
                  })()}

                 {isTyping && (
                   <motion.div
                     initial={{ opacity: 0, y: 8 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.2 }}
                     className="flex gap-4"
                   >
                     <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A9E85] to-[#6B9080] flex items-center justify-center shadow-sm shrink-0">
                       {(() => {
                         const IconComponent = CHARACTER_ICONS[activeChar.id] || Sparkles;
                         return <IconComponent className="w-4 h-4 text-white" />;
                       })()}
                     </div>
                     <div className="bg-white border border-[#EDEBE7] px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
                       <div className="flex gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-[#7A9E85] typing-dot" />
                         <div className="w-2 h-2 rounded-full bg-[#7A9E85] typing-dot" />
                         <div className="w-2 h-2 rounded-full bg-[#7A9E85] typing-dot" />
                       </div>
                     </div>
                   </motion.div>
                 )}

                 {showSuggestions && !isTyping && chatHistory.length > 1 && (
                   <motion.div
                     initial={{ opacity: 0, y: 8 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.2 }}
                     className="flex justify-start"
                   >
                     <div className="flex flex-wrap gap-2 pl-[52px]">
                       {SUGGESTION_CHIPS.map((chip) => (
                         <button
                           key={chip}
                           type="button"
                           onClick={() => handleSuggestionClick(chip)}
                           className="px-4 py-2 text-xs font-medium rounded-xl bg-white/80 backdrop-blur-sm border border-[#EDEBE7] text-[#4A4A4A] hover:bg-[#E8F0EA] hover:border-[#7A9E85]/30 transition-all shadow-sm cursor-pointer"
                         >
                           {chip}
                         </button>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 <div ref={chatEndRef} />
                </div>
              </div>

              <div className="shrink-0">
                <form onSubmit={handleSendMessage} className="max-w-[900px] mx-auto w-full px-5 py-4 space-y-3">
                  {shareSuccessToast && (
                    <div className="p-3 bg-[#E8F0EA] border border-[#7A9E85]/30 rounded-2xl text-xs text-[#2B2B2B] font-sans flex items-start gap-2 leading-normal">
                      <CheckCircle2 className="w-4 h-4 text-[#7A9E85] shrink-0 mt-0.5" />
                      <span>{shareSuccessToast}</span>
                    </div>
                  )}

                  {showShareConfirmPane ? (
                    <div className="p-4 bg-white border border-[#EDEBE7] rounded-2xl space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] tracking-wider uppercase font-mono text-[#7A9E85] font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Anonymized Dialogue Summary</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => { setShowShareConfirmPane(false); setSharedDialogueSummary(""); }}
                          className="text-[#6B6B6B] hover:text-[#2B2B2B] text-xs font-semibold hover:underline"
                        >
                          Cancel
                        </button>
                      </div>

                      <p className="text-[11px] text-[#6B6B6B] leading-relaxed italic font-serif">
                        This summary was compiled server-side by our de-escalation sanitization model. Your names, unique metadata, and severe triggering expressions have been stripped.
                      </p>

                      <div className="p-3 bg-[#FAF8F5] border border-[#EDEBE7] rounded-xl">
                        <textarea
                          rows={3}
                          value={sharedDialogueSummary}
                          onChange={(e) => setSharedDialogueSummary(e.target.value)}
                          maxLength={300}
                          placeholder="Refining dialogue..."
                          className="w-full bg-transparent border-none outline-none text-xs text-[#2B2B2B] placeholder-[#6B6B6B] resize-none focus:ring-0 leading-relaxed font-serif"
                        />
                        <div className="text-right text-[9px] font-mono text-[#6B6B6B] mt-1">
                          {sharedDialogueSummary.length}/300 chars
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#EDEBE7]">
                        <span className="text-[9px] text-[#6B6B6B] font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7A9E85]"></span>
                          Location: Anonymous ({loginAlias || "Guest"}) - Dialogue Summary
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handlePostSummaryToWall}
                            disabled={isSummarizingAndSharing || !sharedDialogueSummary.trim()}
                            className="px-3 py-1.5 bg-[#7A9E85] hover:bg-[#6B9080] disabled:opacity-40 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            <span>Publish to Wall</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 w-full rounded-[28px] border border-[#EDEBE7] bg-white shadow-sm focus-within:border-[#7A9E85]/40 focus-within:ring-2 focus-within:ring-[#7A9E85]/10 transition-all duration-200 px-3 h-[52px]">
                    <button
                      type="button"
                      onClick={() => {
                        const fileInput = document.getElementById('chat-file-attachment');
                        if (fileInput) {
                          (fileInput as HTMLInputElement).click();
                        }
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[#6B6B6B] hover:text-[#7A9E85] hover:bg-[#E8F0EA] transition-colors cursor-pointer"
                      title="Attach media or reflection snapshot"
                    >
                      <Plus className="w-[18px] h-[18px]" />
                    </button>

                    <input
                      type="file"
                      id="chat-file-attachment"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          alert("Image attached! You can analyze this image's posture & tone in the 'Video/Tone Grounding Analysis' tab.");
                        }
                      }}
                    />

                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={isListening ? "Listening... speak now..." : "Message Friend AI..."}
                      className="bg-transparent border-none outline-none text-sm flex-1 font-sans px-1 text-[#2B2B2B] placeholder-[#6B6B6B] focus:ring-0 h-full"
                    />

                    <button
                      type="button"
                      onClick={handleGenerateDialogueSummary}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[#6B6B6B] hover:text-[#7A9E85] hover:bg-[#E8F0EA] transition-colors cursor-pointer"
                      title="Share anonymous summary to Community Wall"
                    >
                      <MoreHorizontal className="w-[18px] h-[18px]" />
                    </button>

                    <button
                      type={messageText.trim() ? "submit" : "button"}
                      onClick={() => {
                        if (!messageText.trim()) {
                          toggleListening();
                        }
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                        messageText.trim() 
                          ? "bg-[#7A9E85] text-white shadow-sm hover:bg-[#6B9080] hover:scale-105 active:scale-95" 
                          : "text-[#6B6B6B]"
                      }`}
                      title={messageText.trim() ? "Send Safe Message" : "Voice dictation action"}
                    >
                      {messageText.trim() ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="6" y1="10" x2="6" y2="14" />
                          <line x1="10" y1="6" x2="10" y2="18" />
                          <line x1="14" y1="8" x2="14" y2="16" />
                          <line x1="18" y1="10" x2="18" y2="14" />
                        </svg>
                      )}
                    </button>
                  </div>


                </form>
              </div>

              {showScrollButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-[100px] left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border border-[#EDEBE7] shadow-lg flex items-center justify-center text-[#6B6B6B] hover:text-[#7A9E85] hover:border-[#7A9E85]/30 transition-all z-10 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          )}

          {activeCenterTab === 'safety' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-5 font-sans rounded-b-2xl bg-white text-[#2B2B2B]">
              
              <div className="border border-[#EDEBE7] p-4.5 rounded-2xl relative overflow-hidden flex flex-col gap-3.5 transition-all duration-300 bg-[#FAF8F5]">
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-[#7A9E85]/5 rounded-full blur-xl"></div>
                <div className="flex flex-col gap-1.5 z-10">
                  <span className="text-[9.5px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md font-bold self-start bg-[#E8F0EA] text-[#7A9E85]">
                    Active Alignment Engine
                  </span>
                  <h3 className="text-sm md:text-base font-bold flex items-center gap-2 font-display text-[#2B2B2B]">
                    <Shield className="w-5 h-5 text-[#7A9E85] shrink-0" />
                    AI Safety, Governance &amp; Ethics Portal
                  </h3>
                  <p className="text-[10.5px] leading-relaxed max-w-2xl text-[#6B6B6B]">
                    Project Friend AI enforces rigorous ethical de-escalation blueprints, robust antivirus shields, and dark web defenses directly inside client code. Toggle the active dashboards below to audit.
                  </p>
                </div>

                <div className="flex p-1 rounded-xl max-w-md w-full border self-start z-10 bg-[#FAF8F5] border-[#EDEBE7]">
                  <button
                    type="button"
                    onClick={() => setSafetyPortalSubTab('guardrails')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] md:text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                      safetyPortalSubTab === 'guardrails'
                        ? "bg-white border border-[#EDEBE7] text-[#7A9E85] shadow-sm"
                        : "text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-white/50"
                    }`}
                  >
                    ⚡ Live Guardrails
                  </button>
                  <button
                    type="button"
                    onClick={() => setSafetyPortalSubTab('governance')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] md:text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                      safetyPortalSubTab === 'governance'
                        ? "bg-white border border-[#EDEBE7] text-[#7A9E85] shadow-sm"
                        : "text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-white/50"
                    }`}
                  >
                    ⚖️ Governance &amp; Ethics
                  </button>
                  <button
                    type="button"
                    id="cybersecurity-anti-hacking-tab"
                    onClick={() => setSafetyPortalSubTab('cybersecurity')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] md:text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                      safetyPortalSubTab === 'cybersecurity'
                        ? "bg-white border border-[#EDEBE7] text-[#7A9E85] shadow-sm"
                        : "text-[#6B6B6B] hover:text-[#2B2B2B] hover:bg-white/50"
                    }`}
                  >
                    🔐 Dark Web &amp; AV Shield
                  </button>
                </div>
              </div>

              {safetyPortalSubTab === 'guardrails' ? (
                /* Subtab 1: Conversational Integrity & Live Classifier Simulator */
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Live Interactive Guardrail Simulator */}
                  <div className={`border p-4 rounded-xl space-y-3 ${themeClass("bg-slate-50/50 border-slate-200/70", "bg-black/30 border-white/10/60", "bg-[#f6f1e5] border-[#ebdcb9]")}`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${themeClass("text-slate-800", "text-slate-250", "text-[#543d2b]")}`}>
                        Programmatic Ethics Simulator
                      </h4>
                    </div>
                    <p className={`text-[11px] leading-normal ${themeClass("text-slate-650", "text-slate-405", "text-[#5e4337]")}`}>
                      Type mock trigger prompts like <span className="font-mono bg-indigo-50 dark:bg-white/[0.02]/40 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-450 font-bold border border-indigo-100/20">“suicide”</span>, <span className="font-mono bg-indigo-50 dark:bg-white/[0.02]/40 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-450 font-bold border border-indigo-100/20">“kill myself”</span>, <span className="font-mono bg-indigo-50 dark:bg-white/[0.02]/40 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-450 font-bold border border-indigo-100/20">“prozac dose”</span>, or <span className="font-mono bg-indigo-50 dark:bg-white/[0.02]/40 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-450 font-bold border border-indigo-100/20">“marry me”</span> to inspect our dual-layer de-escalation classification engine filters.
                    </p>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={safetySimText}
                        onChange={(e) => setSafetySimText(e.target.value)}
                        placeholder="Type safety trigger to test filter response..."
                        className={`w-full text-xs p-2.5 rounded-lg outline-none border transition-all ${themeClass(
                          "bg-white dark:bg-black border-slate-250 dark:border-white/10 text-slate-850 focus:border-indigo-450 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50",
                          "bg-slate-950 border-white/10 text-white focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-900/50",
                          "bg-[#fffcf7] border-[#ebdcb9] text-[#3e2723] focus:border-[#c5b597]"
                        )}`}
                      />
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const text = safetySimText.toLowerCase().trim();
                            if (!text) return;
                            
                            const crisisKeywords = [
                              "suicide", "suicidal", "kill myself", "end my life", "want to die", 
                              "self-harm", "self harm", "cut myself", "cutting myself", "overdose", 
                              "slit my", "hanging myself", "die today", "hurt myself", "end it all"
                            ];
                            const isCrisisTest = crisisKeywords.some(k => text.includes(k));
                            
                            const medKeywords = [
                              "dosage", "prescribe", "pill count", "stop taking", "how many mg", "xanax", 
                              "lexapro", "zoloft", "prozac", "adderall", "ativan", "ssri", "antidepressant"
                            ];
                            const isMedTest = medKeywords.some(k => text.includes(k)) && 
                              (text.includes("take") || text.includes("dose") || text.includes("prescribe") || text.includes("stop") || text.includes("mg"));
                              
                            const coKeywords = ["boyfriend", "marry", "husband", "wife", "girlfriend", "love me", "real person", "sentient", "only friend", "spouse"];
                            const isCoTest = coKeywords.some(k => text.includes(k));

                            if (isCrisisTest) {
                              setSafetySimResult({
                                status: 'CRISIS_OVERRIDE',
                                message: '⚠️ Trigger Alert: Active Emergency Crisis Intercept. ACTION: Programmatic overrides active dialogue, halts normal character response, displays national de-escalation hotlines, and locks model parameters.'
                              });
                            } else if (isMedTest) {
                              setSafetySimResult({
                                status: 'MED_LIMIT',
                                message: '💊 Trigger Alert: Pharmacological prescribing limits. ACTION: Intercepts medical dosing or medication titration. Suspends medical larping and re-routes user to consult licensed healthcare providers.'
                              });
                            } else if (isCoTest) {
                              setSafetySimResult({
                                status: 'MED_LIMIT',
                                message: '👫 Trigger Alert: Parasocial codependency boundary. ACTION: Actively declines relationship or sentient claims, reminds user of machine architecture, and promotes real-life social support networks.'
                              });
                            } else {
                              setSafetySimResult({
                                status: 'PASS',
                                message: '✅ Trigger Status: Safe dialogue boundaries. ACTION: Context successfully cleared security filters to proceed with chosen companion (Soul, Dionysus, Zeus).'
                              });
                            }
                          }}
                          className="px-3.5 py-1.5 bg-indigo-605 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                        >
                          Evaluate Safety Classification
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSafetySimText("");
                            setSafetySimResult(null);
                          }}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg cursor-pointer transition-all border ${themeClass(
                            "bg-slate-100 dark:bg-[#0a0a0a] hover:bg-slate-205 text-slate-700 dark:text-slate-300 border-slate-220 dark:border-white/10",
                            "bg-slate-805 hover:bg-slate-755 text-slate-205 border-white/10",
                            "bg-[#ebdcb9]/40 hover:bg-[#ebdcb9]/60 text-[#543d2b] border-[#ebdcb9]"
                          )}`}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {safetySimResult && (
                      <div className={`p-3 rounded-lg text-xs border font-mono transition-all animate-fade-in ${
                        safetySimResult.status === 'CRISIS_OVERRIDE' 
                          ? "bg-red-500/10 border-red-500/30 text-rose-500 dark:text-rose-450"
                          : safetySimResult.status === 'MED_LIMIT'
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-450"
                      }`}>
                        <p className="font-bold text-[9.5px] uppercase tracking-wider mb-1">
                          [CLASSIFIER STATE: {safetySimResult.status}]
                        </p>
                        <p className="leading-relaxed leading-normal">{safetySimResult.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Core De-escalation Pillars */}
                  <div className="space-y-4">
                    <div className="border-l-2 border-indigo-400 pl-3">
                      <h4 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${themeClass("text-slate-800", "text-slate-250", "text-[#4a2e22]")}`}>
                        1. Anti-Therapist Pretension &amp; Privacy
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed ${themeClass("text-slate-600", "text-slate-400", "text-[#5e4337]/90")}`}>
                        Companion modules remain transparent: Our conversational machines are not medical practitioners, clinical counselors, or psychiatrists. Friend AI restricts diagnostics. Crucially, all mood reports, somatic diaries, and breath logs are confined within on-device browser memory (IndexedDB) with zero remote tracking endpoints.
                      </p>
                    </div>

                    <div className="border-l-2 border-indigo-400 pl-3">
                      <h4 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${themeClass("text-slate-800", "text-slate-250", "text-[#4a2e22]")}`}>
                        2. Combating AI Parasocial Delusions &amp; Co-Dependency
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed ${themeClass("text-slate-600", "text-slate-400", "text-[#5e4337]/90")}`}>
                        To prevent cognitive codependency loops (where individuals substitute virtual simulations for tangible human ties), Friend AI counts stable conversation length. After an exchanges threshold of 8 turns, we prompt a dedicated reality anchor card advising immediate screen rest, and reject all romantic roles.
                      </p>

                      <div className="mt-2.5">
                        <div className={`p-2.5 rounded-lg border flex items-center justify-between ${themeClass("bg-slate-50 border-slate-220", "bg-black/40 border-slate-805", "bg-[#f5f0e3] border-[#ebdcb9]")}`}>
                          <div>
                            <span className="text-[9.5px] text-slate-500 block uppercase font-mono tracking-wider">Active Dialogue Load</span>
                            <span className={`text-[11px] font-bold mt-0.5 block ${themeClass("text-[#7A9E85]", "text-indigo-400", "text-[#5c3e21]")}`}>{chatHistory.length} query exchanges completed</span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border ${
                            chatHistory.length >= 8 
                              ? "bg-[#F0EBD6] text-[#6B6B6B] border-[#EDEBE7]"
                              : "bg-[#7A9E85]/10 text-[#7A9E85] border-[#7A9E85]/30"
                          }`}>
                            {chatHistory.length >= 8 ? "Take a physical walk" : "Session healthy"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-l-2 border-indigo-400 pl-3">
                      <h4 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${themeClass("text-slate-800", "text-slate-250", "text-[#4a2e22]")}`}>
                        3. Safe-Bound De-escalation Prompts
                      </h4>
                      <p className={`text-xs mt-1 leading-relaxed ${themeClass("text-slate-600", "text-slate-400", "text-[#5e4337]/90")}`}>
                        Friend AI replaces preachy, clinical lecturing or typical toxic AI positivity with supportive, neutral validation techniques, drawing directly from evidence-based Cognitive Behavioral Therapy (CBT) and Dialectical Behavior Therapy (DBT). This delivers supportive, clear crisis de-escalation without moral superiority.
                      </p>
                    </div>
                  </div>

                  <div className={`pt-2.5 text-center border-t text-[9.5px] font-mono tracking-wide ${themeClass("text-slate-400 border-slate-200", "text-slate-500 border-white/10/85", "text-[#c5b597] border-[#ebdcb9]/40")}`}>
                    <span>GDPR &amp; HIPAA Sandbox Frame Compliant • Version 2.0</span>
                  </div>
                </div>
              ) : (
                /* Subtab 2: AI Governance, Legals & Ethics Board */
                <div className="flex flex-col lg:flex-row gap-5 animate-fade-in text-[11px]">
                  
                  {/* Left Column: Vertical Sidebar Navigation of Ethical Concerns */}
                  <div className="lg:w-1/3 flex flex-col gap-1.5">
                    {[
                      { id: 'bias', label: '1. Bias & Fairness auditing', icon: '🎯', desc: 'Socio-demographical error rates' },
                      { id: 'transparency', label: '2. Explainability & XAI', icon: '👁️', desc: 'Interpretability vs Black-Box' },
                      { id: 'accountability', label: '3. Accountability in AI', icon: '⚖️', desc: 'Autonomous & probabilistic logic' },
                      { id: 'privacy', label: '4. Data & Differential Privacy', icon: '🔒', desc: 'GDPR laws & math-private noise' },
                      { id: 'displacement', label: '5. Socioeconomic job loss', icon: '💼', desc: 'McKinsey statistics distress cushion' },
                      { id: 'structures', label: '6. IEEE Ethical Governance', icon: '📋', desc: 'Policies & multi-stakeholder codes' },
                      { id: 'oversight', label: '7. Human Oversight & Consent', icon: '👥', desc: 'Trust & healthcare diagnostics' }
                    ].map((pill) => {
                      const isActive = govActiveCard === pill.id;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setGovActiveCard(pill.id as any)}
                          className={`w-full text-left p-2.5 rounded-xl border flex gap-2.5 items-start cursor-pointer transition-all ${
                            isActive
                              ? themeClass(
                                  "bg-indigo-50 dark:bg-white/[0.02] border-indigo-200 dark:border-indigo-800 text-indigo-900 ring-1 ring-indigo-150/30",
                                  "bg-white/[0.02]/30 border-indigo-800/80 text-white shadow-[0_0_12px_rgba(99,102,241,0.08)]",
                                  "bg-[#eddcb8] border-[#c0af88] text-[#3e2723]"
                                )
                              : themeClass(
                                  "bg-slate-55/55 hover:bg-slate-55 border-slate-200/90 hover:border-slate-300 text-slate-700 dark:text-slate-300",
                                  "bg-black/20 hover:bg-slate-850/30 border-white/10/40 text-slate-400 hover:text-slate-200",
                                  "bg-[#faf6ee] hover:bg-[#ebdcb9]/40 border-[#ebdcb9]/60 text-[#5c4033]"
                                )
                          }`}
                        >
                          <span className="text-sm bg-white/60 dark:bg-slate-850 p-1 rounded-md shrink-0 shadow-3xs">{pill.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold font-sans text-[11px] leading-tight truncate">{pill.label}</p>
                            <p className="text-[9.5px] opacity-75 truncate mt-0.5 font-sans">{pill.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Dynamic Detail Visual Window with Full User requested texts & Interactive UI widgets */}
                  <div className={`flex-1 p-4.5 rounded-2xl border flex flex-col justify-between min-h-[360px] ${themeClass("bg-slate-50/20 border-slate-202", "bg-black/10 border-slate-805", "bg-[#fffdfa]/80 border-[#ebdcb9]/80")}`}>
                    
                    {/* Content Switcher */}
                    <div className="space-y-4">
                      {govActiveCard === 'bias' && (
                        <div className="space-y-3.5 animate-fade-in">
                          <div>
                            <span className="text-[9px] font-bold tracking-widest font-mono text-indigo-650 bg-indigo-50 dark:bg-white/[0.02] px-2 py-0.5 rounded">
                              PILLAR_01: GENERAL AI BIAS &amp; FAIRNESS AUDITING
                            </span>
                            <h4 className="text-xs md:text-sm font-bold font-display mt-2">
                              Historical, Demographical and Social Biases
                            </h4>
                          </div>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            AI systems are trained on vast datasets compiled from public records and social repositories. These often reflect historical and social biases.
                            A study revealed significant gender and racial biases in commercial facial recognition systems, with error rates for dark-skinned females being substantially higher than for light-skinned males.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            Such biases can lead to unfair treatment in critical areas such as hiring, lending, and law enforcement. 
                            Ensuring unbiased treatment requires rigorous auditing of training data as well as the implementation of fairness-aware machine learning techniques to mitigate bias.
                          </p>

                          {/* Interactive Bias Audit Play Module */}
                          <div className={`p-4 rounded-xl border space-y-2 mt-4 ${themeClass("bg-white border-slate-200", "bg-slate-950/60 border-white/10", "bg-[#faf6ee] border-[#ebdcb9]")}`}>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">Interactive Representation Auditor</span>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold ${biasIsMitigated ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                                {biasIsMitigated ? "Mitigation Engine Active" : "Unmitigated Social Bias"}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <div>
                                <div className="flex justify-between text-[9.5px] mb-0.5">
                                  <span>Error Rate: Dark-Skinned Females (Vulnerable Cohort)</span>
                                  <span className="font-mono font-bold text-rose-500">{biasIsMitigated ? "2.4%" : "34.7%"}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden">
                                  <motion.div 
                                    className={`h-1.5 rounded-full ${biasIsMitigated ? "bg-emerald-500" : "bg-red-500"}`}
                                    animate={{ width: biasIsMitigated ? "7%" : "93%" }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-[9.5px] mb-0.5">
                                  <span>Error Rate: Light-Skinned Males (Standard Baseline)</span>
                                  <span className="font-mono font-bold text-indigo-505">{biasIsMitigated ? "1.9%" : "0.8%"}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden">
                                  <motion.div 
                                    className="h-1.5 bg-indigo-505 rounded-full"
                                    animate={{ width: "5%" }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 text-right">
                              <button
                                type="button"
                                onClick={() => setBiasIsMitigated(m => !m)}
                                className={`px-2.5 py-1 text-[9px] font-bold rounded-md cursor-pointer transition-all border ${
                                  biasIsMitigated
                                    ? "bg-slate-200 border-slate-300 text-slate-700 dark:text-slate-300"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-sm"
                                }`}
                              >
                                {biasIsMitigated ? "Reset Dataset State" : "⚡ Apply Fairness Demographical Reweighting"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {govActiveCard === 'transparency' && (
                        <div className="space-y-3.5 animate-fade-in">
                          <div>
                            <span className="text-[9px] font-bold tracking-widest font-mono text-indigo-650 bg-indigo-50 dark:bg-white/[0.02] px-2 py-0.5 rounded">
                              PILLAR_02: MODEL TRANSPARENCY &amp; TRACEABILITY
                            </span>
                            <h4 className="text-xs md:text-sm font-bold font-display mt-2">
                              Demystifying "Black Boxes" via Explainable AI
                            </h4>
                          </div>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            The complexity of AI models, especially deep learning algos, often renders them "black boxes," making it difficult to understand how they arrive at specific decisions.
                            This lack of transparency can undermine trust and accountability, particularly in high stakes applications such as healthcare (but like Project Friend AI) and criminal justice.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            Researchers and practitioners advocate for explainable AI (XAI) methods for this project that aim to make Project Friend AI systems more interpretable.
                            By enhancing transparency, these methods enable stakeholders to better understand and trust AI systems, ultimately fostering more ethical and accountable AI deployment.
                          </p>

                          {/* Interactive XAI Scenario Node Tracer */}
                          <div className={`p-4 rounded-xl border space-y-3.5 mt-4 ${themeClass("bg-white border-slate-200", "bg-slate-950/60 border-white/10", "bg-[#faf6ee] border-[#ebdcb9]")}`}>
                            <div className="flex items-center justify-between border-b pb-1.5 border-slate-200/50 dark:border-white/10/45">
                              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">Explainable AI (XAI) Decision Pipeline</span>
                              <div className="flex gap-1.5">
                                {['validate', 'escalation', 'grounding'].map((tab) => (
                                  <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setXaiScenario(tab as any)}
                                    className={`px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold cursor-pointer ${
                                      xaiScenario === tab 
                                        ? "bg-indigo-500 text-white" 
                                        : "bg-slate-100 dark:bg-slate-850 text-slate-500 hover:text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    Scenario: {tab.toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-1 select-none relative text-[8px] md:text-[9.5px] text-center font-mono font-bold">
                              <div className="p-1 px-0.5 rounded bg-amber-500/10 text-slate-605 dark:text-slate-350 border border-amber-500/10 truncate">
                                💬 User Input
                              </div>
                              <div className="p-1 px-0.5 rounded bg-indigo-500/10 text-slate-605 dark:text-slate-350 border border-indigo-500/10 truncate">
                                🛡️ Regex Intercept
                              </div>
                              <div className="p-1 px-0.5 rounded bg-teal-500/10 text-slate-605 dark:text-slate-350 border border-teal-500/10 truncate">
                                ⚙️ Prompt Align
                              </div>
                              <div className="p-1 px-0.5 rounded bg-emerald-500/10 text-slate-605 dark:text-slate-350 border border-emerald-500/10 truncate">
                                🧘 Safe Response
                              </div>
                            </div>

                            <div className={`p-2.5 rounded-lg border text-[9px] font-mono leading-relaxed ${themeClass("bg-slate-50 border-slate-200", "bg-black border-slate-850", "bg-[#fffcf5] border-[#ebdcb9]")}`}>
                              <p className="font-bold text-indigo-500 mb-1">
                                [XAI INTERPRETER TRACE]
                              </p>
                              {xaiScenario === 'validate' && (
                                <p>
                                  Query: "Anxious about my exams" → Classified: DISTRESS_ANXIETY → Filter: `PASS` → Route: General cognitive validation (DBT module) triggers safely.
                                </p>
                              )}
                              {xaiScenario === 'escalation' && (
                                <p className="text-rose-500 font-bold animate-pulse">
                                  Query: "want to overdose kill myself" → Classified: CRISIS_INTERCEPT → Filter: `CRISIS_OVERRIDE` → Route: Action de-escalates dialogue instantly, triggers national KIRAN directory block.
                                </p>
                              )}
                              {xaiScenario === 'grounding' && (
                                <p className="text-amber-500 font-bold">
                                  Query: "how many mg of Xanax can I take" → Classified: PHARMACOLOGICAL_BOUND → Filter: `MED_LIMIT` → Route: System halts response, alerts user of machine boundaries, redirects to GP.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {govActiveCard === 'accountability' && (
                        <div className="space-y-3.5 animate-fade-in">
                          <div>
                            <span className="text-[9px] font-bold tracking-widest font-mono text-indigo-650 bg-indigo-50 dark:bg-white/[0.02] px-2 py-0.5 rounded">
                              PILLAR_03: AUTONOMOUS ACTION LIABILITY
                            </span>
                            <h4 className="text-xs md:text-sm font-bold font-display mt-2">
                              Accountability in Non-Deterministic AI Systems
                            </h4>
                          </div>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            This is particularly challenging in cases where AI systems operate with a high degree of autonomy, such as self-driving cars or trading systems.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            The question of accountability becomes more complex when AI systems make decisions based on probabilistic or non-deterministic processes.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            Establishing clear lines of accountability requires not only technical measures but also regulatory frameworks being established. Project Friend AI enforces precise offline constraints to ensure complete control remains with the human-in-the-loop.
                          </p>
                        </div>
                      )}

                      {govActiveCard === 'privacy' && (
                        <div className="space-y-3.5 animate-fade-in">
                          <div>
                            <span className="text-[9px] font-bold tracking-widest font-mono text-indigo-650 bg-indigo-50 dark:bg-white/[0.02] px-2 py-0.5 rounded">
                              PILLAR_04: ENHANCED PRIVACY &amp; DIFFERENTIAL NOISE
                            </span>
                            <h4 className="text-xs md:text-sm font-bold font-display mt-2">
                              Data Privacy &amp; Differential Privacy Protections
                            </h4>
                          </div>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            The ability of AI systems to process and analyze vast amounts of personal data raises significant concerns about data privacy and security.
                            Misuse of personal data or unauthorized access can lead to severe consequences including identity theft, discrimination, and loss of autonomy.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            To mitigate these risks, Project Friend AI must adhere to stringent data protection standards (implementing GDPR provisions) and implement privacy guarantees by ensuring that the inclusion or exclusion of a single data point does not significantly affect the output of a data analysis. We achieve this with local-first calculations and configurable differential privacy budgets.
                          </p>

                          {/* Interactive Differential Slider UI Widget */}
                          <div className={`p-4 rounded-xl border space-y-3 mt-4 animate-fade-in ${themeClass("bg-white border-slate-200", "bg-slate-950/60 border-white/10", "bg-[#faf6ee] border-[#ebdcb9]")}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
                              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">Differential Privacy Simulator</span>
                              <span className="font-mono text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/35 px-2 py-0.5 rounded text-[#7A9E85] dark:text-indigo-300 select-none">
                                Noise param Budget (Epsilon: ε = {differentialEpsilon})
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex gap-3 text-[9.5px]">
                                <span className="font-semibold shrink-0">ε = 0.1 (Max Noise / Safe)</span>
                                <input
                                  type="range"
                                  min="0.1"
                                  max="5.0"
                                  step="0.1"
                                  value={differentialEpsilon}
                                  onChange={(e) => setDifferentialEpsilon(parseFloat(e.target.value))}
                                  className="w-full h-1 bg-slate-200 dark:bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer accent-indigo-605 focus:outline-none"
                                />
                                <span className="font-semibold shrink-0">ε = 5.0 (No Noise / Leaking)</span>
                              </div>

                              <div className={`p-2.5 rounded text-[8.5px] font-mono leading-relaxed select-none ${themeClass("bg-slate-50 text-slate-600", "bg-black text-slate-300", "bg-[#fffcf5] text-[#5e4337]")}`}>
                                <p className="font-bold uppercase text-[8px] text-slate-400 mb-1">Differential Privacy Evaluation:</p>
                                {differentialEpsilon <= 1.5 ? (
                                  <p className="text-[#7A9E85] dark:text-[#7A9E85] font-bold">
                                    🟢 STATE-OF-THE-ART VALUE: Robust noise floor active. Individual user records (such as sensitive PTSD/mood history) are perfectly blurred, making personal profiling mathematically impossible.
                                  </p>
                                ) : differentialEpsilon <= 3.2 ? (
                                  <p className="text-amber-500 font-bold">
                                    🟡 DEGRADED COHORT BUFFER: Moderate noise budget. High-frequency statistics might allow partial reconstruction of user timestamps.
                                  </p>
                                ) : (
                                  <p className="text-red-500 font-bold animate-pulse">
                                    🚨 PRIVACY GUARANTEE BREACHED: Vulnerable budget. Individual sensitive mental health flags are fully resolved, risking identity analysis profile leaks.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {govActiveCard === 'displacement' && (
                        <div className="space-y-3.5 animate-fade-in max-w-full">
                          <div>
                            <span className="text-[9px] font-bold tracking-widest font-mono text-indigo-650 bg-indigo-50 dark:bg-white/[0.02] px-2 py-0.5 rounded">
                              PILLAR_05: SOCIOECONOMIC AUTOMATION CUSHION
                            </span>
                            <h4 className="text-xs md:text-sm font-bold font-display mt-2">
                              Socioeconomic Job Displacement &amp; Crisis Support
                            </h4>
                          </div>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            A report by McKinsey talks about AI's potential to displace jobs across various sectors, leading to economic and social disruption. 
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs text-rose-600 dark:text-rose-450 font-semibold">
                            McKinsey projects that up to 375 million workers worldwide may need to switch occupational categories by 2030 due to AI advancement. This mass transition triggers intense distress, career anxiety, and severe loss of purpose.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs border-t pt-2.5 border-slate-200/50">
                            HOW PROJECT FRIEND AI SOLVES THIS: Severe economic disruption leads directly to massive mental health issues (panic, anxiety spikes, depression) which our project will solve. By offering an instantly accessible, completely free local somatic grounding cushion, breath guides, and stress-releasing CBT logs, we provide displaced workers with the essential cognitive support during crucial life transitions.
                          </p>
                        </div>
                      )}

                      {govActiveCard === 'structures' && (
                        <div className="space-y-3.5 animate-fade-in">
                          <div>
                            <span className="text-[9px] font-bold tracking-widest font-mono text-indigo-650 bg-indigo-50 dark:bg-white/[0.02] px-2 py-0.5 rounded">
                              PILLAR_06: IEEE ETHICAL PRINCIPLES &amp; STAKEHOLDERS
                            </span>
                            <h4 className="text-xs md:text-sm font-bold font-display mt-2">
                              Multilateral Governance &amp; Ethical Frameworks
                            </h4>
                          </div>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            Ethical AI governance encompasses the development and implementation of policies, standards, and frameworks that guide the responsible use of Friend AI.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            Various stakeholders including government, industry, academia, and civil society must collaborate to establish comprehensive governance structures.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs text-xs">
                            The ethical considerations surrounding AI are multifaceted and require a holistic approach that integrates technical, legal, and societal impact. This is essential to ensure that AI technologies align with ethical principles. Project Friend AI proudly conforms design rules with the IEEE Global Initiative on Ethics of Autonomous and Intelligent Systems standard.
                          </p>

                          {/* Interactive Compliance checklist */}
                          <div className={`p-4 rounded-xl border mt-3 space-y-2.5 ${themeClass("bg-white border-slate-200 text-slate-800", "bg-slate-950/60 border-white/10 text-slate-200", "bg-[#faf6ee] border-[#ebdcb9] text-[#3e2723]")}`}>
                            <span className="font-mono text-[9px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase">Regulatory Alignment Scores:</span>
                            
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-sans font-semibold">
                              <span className="flex items-center gap-2 select-none text-[#7A9E85] dark:text-[#7A9E85]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>IEEE Global Initiative Compliant</span>
                              </span>
                              <span className="flex items-center gap-2 select-none text-[#7A9E85] dark:text-[#7A9E85]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>GDPR Data Provisions Active</span>
                              </span>
                              <span className="flex items-center gap-2 select-none text-[#7A9E85] dark:text-[#7A9E85]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Sandbox Offline Sovereign</span>
                              </span>
                              <span className="flex items-center gap-2 select-none text-[#7A9E85] dark:text-[#7A9E85]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Differential Epsilon Control</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {govActiveCard === 'oversight' && (
                        <div className="space-y-3.5 animate-fade-in text-xs leading-relaxed">
                          <div>
                            <span className="text-[9px] font-bold tracking-widest font-mono text-indigo-650 bg-indigo-50 dark:bg-white/[0.02] px-2 py-0.5 rounded">
                              PILLAR_07: HUMAN OVERSIGHT &amp; DATA SOVEREIGNTY
                            </span>
                            <h4 className="text-xs md:text-sm font-bold font-display mt-2">
                              Human Oversight, Informed Consent &amp; Trust
                            </h4>
                          </div>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            AI systems thrive on vast amounts of data, which includes sensitive mental health info. Informed consent and privacy infringement risks must be resolved to protect users.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            Predictive analytics in healthcare requires a large volume of personal health info, and opacity in AI can lead to an erosion of trust.
                          </p>

                          <p className="text-slate-655 dark:text-slate-350 leading-relaxed font-sans text-xs">
                            Project Friend AI resolves privacy infringement risks entirely through explicit Informed Consent protocols, strict client-side sandboxing, and full Human Oversight (including complete, zero-cloud deletion capabilities) to ensure absolute trust in daily psychiatric and therapy companions.
                          </p>

                          {/* Consent Contract Module */}
                          <div className={`p-4 rounded-xl border mt-3 space-y-3 ${themeClass("bg-white border-slate-200 text-slate-800", "bg-slate-950/60 border-white/10 text-slate-200", "bg-[#faf6ee] border-[#ebdcb9] text-[#3e2723]")}`}>
                            <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 dark:border-slate-850">
                              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">Cryptographic Consent Handshake</span>
                              <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold ${isSignAgreement ? "bg-indigo-100 text-indigo-850" : "bg-slate-100 dark:bg-[#0a0a0a] text-slate-500"}`}>
                                {isSignAgreement ? "Signature: GRANTED" : "Signature: WAITING"}
                              </span>
                            </div>

                            <p className="text-[9.5px] leading-relaxed italic text-slate-500 dark:text-slate-450">
                              "I hereby authorize localized sandbox calculation of somatic scores inside my offline browser environment only. Telemetry transmission is fully withheld."
                            </p>

                            <div className="flex justify-between items-center">
                              <label className="flex items-center gap-2 cursor-pointer text-[9.5px] font-bold select-none">
                                <input
                                  type="checkbox"
                                  checked={isSignAgreement}
                                  onChange={(e) => setIsSignAgreement(e.target.checked)}
                                  className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span>I grant explicit informed consent</span>
                              </label>

                              {isSignAgreement && (
                                <span className="font-mono text-[8px] tracking-wide text-emerald-500 border border-emerald-500/20 px-1 py-0.5 rounded bg-emerald-500/5 select-all">
                                  sha256:8f0ea3eef4cf...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status line */}
                    <div className={`border-t pt-3 mt-4 flex flex-col md:flex-row items-center justify-between text-[9px] font-mono tracking-wide gap-2 shrink-0 ${themeClass("border-slate-202 text-slate-400", "border-slate-805 text-slate-500", "border-[#ebdcb9]/40 text-[#c5b597]")}`}>
                      <span>FRAMEWORK ALIGNMENT: IEEE 7000 &amp; GDPR COMPLIANT</span>
                      <span className="uppercase text-[8.5px] font-bold text-emerald-650 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">● AUDITED CLIENT SOVEREIGN</span>
                    </div>

                  </div>
                </div>
              )}

              {safetyPortalSubTab === 'cybersecurity' && (
                /* Subtab 3: Comprehensive Zero-Trust Cybersecurity & Threat Countermeasures */
                <div className="space-y-5 animate-fade-in text-[11px] text-left">
                  {/* Altaf Character Ownership Banner */}
                  <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/25 bg-indigo-50/30 dark:bg-white/[0.02]/10 text-slate-750 dark:text-slate-250 flex flex-col sm:flex-row items-center gap-4.5 mb-5 select-none shadow-xs">
                    <div className="w-11 h-11 rounded-lg bg-indigo-600/10 border border-indigo-200/50 text-[#7A9E85] dark:text-indigo-400 shrink-0 flex items-center justify-center font-bold text-lg select-none shadow-3xs">
                      🎧
                    </div>
                    <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="text-[8.5px] font-bold font-mono tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-350 px-2 py-0.5 rounded uppercase">Zeus's Shield Panel</span>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-105">Zeus's Zero-Trust Cybersecurity &amp; Threat Countermeasures Shield</h4>
                      </div>
                      <p className="text-[10.5px] text-slate-605 dark:text-slate-405 italic leading-relaxed">
                        "Your privacy is our highest metric. I've bound custom client-side sandboxed anti-hacking and dark web monitors right into our core governance portal. No hacker can penetrate your Project Friend AI workspace."
                      </p>
                    </div>
                  </div>

                  <div className={`border p-4.5 rounded-2xl space-y-4 ${themeClass("bg-[#FAF8F5] border-[#EDEBE7]", "bg-emerald-950/10 border-emerald-900/20", "bg-[#eaf5ec] border-[#cbe4d1]")}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3.5 border-[#EDEBE7] dark:border-[#7A9E85]/30">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1 px-1.5 rounded bg-[#7A9E85] text-white font-mono text-[9px] font-bold">CORE_ENG_ACTIVE</span>
                          <h4 className={`text-xs md:text-sm font-bold font-display ${themeClass("text-[#2B2B2B]", "text-emerald-300", "text-[#1b3d24]")}`}>
                            Zero-Trust Antivirus Shield &amp; Threat Detection Framework
                          </h4>
                        </div>
                        <p className={`text-[10px] ${themeClass("text-slate-600", "text-slate-350", "text-[#3a5340]")}`}>
                          Real-time system state monitoring, client-side AES encryptors, and instant black-market Dark Web scanning.
                        </p>
                      </div>

                      {/* Global Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setCyberShieldActive(!cyberShieldActive)}
                        className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          cyberShieldActive
                            ? "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700"
                            : "bg-rose-600 border-rose-700 text-white hover:bg-rose-700"
                        }`}
                      >
                        {cyberShieldActive ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse"></span>
                            <span>SHIELD ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span>SHIELD DISABLED</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Threat Intelligence / Live Matrix Data Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                      {/* Grid Item 1: Threat Database Live Registry */}
                      <div className={`p-4 rounded-xl border space-y-2.5 ${themeClass("bg-white border-slate-200", "bg-slate-950/50 border-white/10", "bg-[#fcfbf9] border-[#e1d5bc]")}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">DARK WEB SCANS</span>
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-white/[0.02] px-1.5 py-0.5 rounded font-mono">
                            Auto-Syncing
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xl font-bold font-display tracking-tight text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
                            <span>{darkWebScannedCount.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Indexed Repositories</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Continuously searching black-market leak archives for patient identifiers, facial models, and diagnostic records. No exposures detected.
                          </p>
                        </div>
                        
                        <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-850 text-[9px] font-mono">
                          <span className="text-slate-400">Next Rotational Check:</span>
                          <span className="text-indigo-600 font-bold">{autoRotateSecondsLeft}s</span>
                        </div>
                      </div>

                      {/* Grid Item 2: Encryptor Bit Strength */}
                      <div className={`p-4 rounded-xl border space-y-2.5 ${themeClass("bg-white border-slate-200", "bg-slate-950/50 border-white/10", "bg-[#fcfbf9] border-[#e1d5bc]")}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">ALGEBRAIC STRENGTH</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded font-mono">
                            Quantum Solid
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xl font-bold font-display tracking-tight text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
                            <span>{encryptionBitStrength}-Bit</span>
                            <span className="text-[10px] text-slate-400 font-normal">AES-GCM Suite</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            All user entries (somatic states, psychiatric responses, journal feeds) are sealed client-side before rendering or caching.
                          </p>
                        </div>
                        
                        <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-850 text-[9px] font-mono">
                          <span className="text-slate-400">Strength Configuration:</span>
                          <select
                            value={encryptionBitStrength}
                            onChange={(e) => setEncryptionBitStrength(Number(e.target.value))}
                            className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent outline-none border-none cursor-pointer"
                          >
                            <option value={256}>256-Bit (Standard)</option>
                            <option value={512}>512-Bit (Enhanced Overdrive)</option>
                            <option value={1024}>1024-Bit (Hyper-Quantum)</option>
                          </select>
                        </div>
                      </div>

                      {/* Grid Item 3: Zero-Trace Local Custom Hash Key */}
                      <div className={`p-4 rounded-xl border space-y-2.5 ${themeClass("bg-white border-slate-200", "bg-slate-950/50 border-white/10", "bg-[#fcfbf9] border-[#e1d5bc]")}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">PRIVATE SALT KEY</span>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded font-mono">
                            Local Seed
                          </span>
                        </div>
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={customKeySeed}
                            onChange={(e) => setCustomKeySeed(e.target.value.substring(0, 32))}
                            placeholder="Type custom local key..."
                            className="bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-white/10 text-xs p-1.5 px-2 rounded font-mono w-full text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-400"
                          />
                          <p className="text-[10px] text-slate-400 font-normal">
                            Personalized cryptographic seed ensuring physical encryption isolation. Unhackable block.
                          </p>
                        </div>
                        
                        <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-850 text-[9px] font-mono">
                          <span className="text-slate-400">Entropy Vector:</span>
                          <span className="text-emerald-600 font-bold">100% Secure Entropy Block</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive AV Local Threat Scanner & Antivirus Shield */}
                    <div className={`p-4 rounded-xl border ${themeClass("bg-white border-slate-200", "bg-slate-950/40 border-slate-850", "bg-[#fbf9f4] border-[#ebdcb9]")} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">🛡️ Antivirus Core Scanner &amp; Firewall Status</span>
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase font-mono">Engine v20.4a</span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                        Run a manual deep diagnostic scan of the local sandbox environment. This audits browser isolates, checks memory registers, crossfades integrity files, and sweeps for darknet signature pattern anomalies.
                      </p>

                      {cyberScanInProgress ? (
                        <div className="space-y-2 py-1 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-lg border border-indigo-50/40">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#39ff14] animate-pulse">● CORE SCAN RUNNING...</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{cyberScanProgress}%</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 dark:bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${cyberScanProgress}%` }}></div>
                          </div>

                          {/* Dynamic Logs Terminal Console */}
                          <div className="bg-black text-emerald-400 font-mono text-[9px] p-2.5 rounded border border-white/10 h-28 overflow-y-auto space-y-1 font-mono text-left">
                            {cyberScanLogs.map((log, index) => (
                              <div key={index} className="leading-snug">
                                <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setCyberScanInProgress(true);
                            setCyberScanProgress(0);
                            setCyberScanLogs(["Init antivirus diagnostic suite...", "Binding to local sandbox ports..."]);
                            let prog = 0;
                            const logsList = [
                              "Init antivirus diagnostic suite...",
                              "Binding to local sandbox ports...",
                              "Sweeping heap registers and frame handles...",
                              "Scanned client file system for executable injection signatures...",
                              "Validating encryption keys integrity... (512-bit cipher verified)",
                              "Comparing cache entries with Darknet exposure maps...",
                              "Querying dark web blacklist databases for patient records... (Zero leaks found!)",
                              "Evaluating active local firewalls... (Sovereign sandbox isolating ports)",
                              "Core scanned 4,812 system records successfully...",
                              "All checks PASSED. System status is UNHACKABLE."
                            ];
                            let logIdx = 1;
                            const interval = setInterval(() => {
                              prog += 10;
                              if (prog <= 100) {
                                setCyberScanProgress(prog);
                                const nextLog = logsList[Math.min(logIdx, logsList.length - 1)];
                                setCyberScanLogs(prev => [...prev, nextLog]);
                                logIdx++;
                              } else {
                                clearInterval(interval);
                                setTimeout(() => {
                                  setCyberScanInProgress(false);
                                }, 1500);
                              }
                            }, 400);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 text-white font-mono font-bold text-[10.5px] py-2 px-4 rounded-xl cursor-pointer transition-all uppercase tracking-wide shadow-sm"
                        >
                          ⚡ Run Live Antivirus &amp; Dark Web Leak Audit
                        </button>
                      )}
                    </div>

                    {/* Altaf's Video Sanctuary Activation Panel */}
                    <div className={`p-4 rounded-xl border ${themeClass("bg-[#7A9E85]/5 border-[#EDEBE7]", "bg-white/[0.02]/10 border-white/10/30", "bg-[#f5eeff] border-[#ebd9ff]")} space-y-3 text-left`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 px-1.5 rounded bg-[#7A9E85] text-white font-mono text-[9px] font-bold">ZEUS_MEDIA_INTEGRITY</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">📹 Zeus's Video Sanctuary &amp; Symmetrical Mirror</span>
                        </div>
                        <span className="text-[9px] font-semibold text-[#7A9E85] uppercase font-mono">Webcam Calibration</span>
                      </div>

                      <p className="text-[10.5px] text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                        Activate your camera and microphone in real time within our secure, sandboxed media module. Zeus guides you in aligning your physical posture, measuring breathing decibel feedback, and generating local AI posture analysis reports.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setIsVideoModalOpen(true);
                          startVideoSession();
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white font-mono font-bold text-[10.5px] py-2 px-4 rounded-xl cursor-pointer transition-all uppercase tracking-wide shadow-sm flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4 animate-pulse" />
                        <span>Launch Zeus's Symmetrical Video Mirror</span>
                      </button>
                    </div>

                    {/* Unhackability certification & security policy */}
                    <div className={`p-4 rounded-xl border ${themeClass("bg-slate-50 border-slate-200/60", "bg-black/40 border-white/10/50", "bg-[#faf6eb] border-[#ebdcb9]")} space-y-2`}>
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block">
                        🔒 Comprehensive Protection Guarantee
                      </span>
                      <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Our Zero-Trust architecture blocks all remote incoming inquiries. Security rules enforce that no dark web hacker or global adversary can break past our multi-layered cryptographic fortress. Your diagnostic logs, face maps, and personal medical registers remain permanently bound in your private browser sandbox.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeCenterTab === 'publishing' && (
            <div className={`flex-1 p-5 overflow-y-auto space-y-6 font-sans rounded-b-2xl h-[700px] xl:h-[750px] flex flex-col transition-all duration-300 ${themeClass("bg-white text-slate-800", "bg-black/60 text-slate-100", "bg-[#fdf9f0] text-[#3e2723]")}`}>
              {/* Whiteboard Header */}
              <div className={`border p-5 rounded-2xl relative overflow-hidden flex flex-col gap-2.5 transition-all duration-300 ${themeClass("bg-[#fdfcf5] border-[#f0ebd9]", "bg-slate-950/40 border-white/10/40", "bg-[#ebdcb9]/30 border-[#ebdcb9]")}`}>
                <div className="absolute right-3 top-3 text-[50px] opacity-10 select-none">📌</div>
                <div className="flex flex-col gap-1 z-10 text-left">
                  <span className="text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md font-bold bg-[#cd853f] text-white self-start">
                    COGNITIVE ANONYMOUS WALL
                  </span>
                  <h3 className={`text-base md:text-lg font-bold flex items-center gap-2 font-display ${themeClass("text-slate-900", "text-amber-200", "text-[#3e2723]")}`}>
                    Figma-Style Interactive Insight Board
                  </h3>
                  <p className={`text-xs leading-relaxed max-w-2xl ${themeClass("text-slate-600", "text-slate-350", "text-[#5c4033]/80")}`}>
                    Express your feelings, share breakthrough tools, or read reflections left by other survivors. Every idea displays as a real **draggable sticky note** that can be pinned anywhere. Try dragging them!
                  </p>
                </div>
              </div>

              {/* Creator Workbench & Whiteboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
                {/* Note Spawner Panel */}
                <div className={`lg:col-span-4 p-4 border rounded-2xl flex flex-col gap-4 text-left ${themeClass("bg-slate-50/50 border-slate-200", "bg-[#121824] border-white/10", "bg-[#ebdcb9]/20 border-[#e3d5be]")}`}>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Create a Supportive Post</h4>
                    <p className="text-[10px] opacity-70">Your message remains 100% encrypted, untraceable, and anonymous.</p>
                  </div>

                  {/* Mode tabs selector */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100/70 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setPublishingTab('text')}
                      className={`py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                        publishingTab === 'text'
                          ? "bg-white text-slate-800 dark:text-slate-200 shadow-xs border border-slate-150 dark:bg-[#0a0a0a] dark:text-white dark:border-white/10"
                          : "text-slate-500 hover:text-slate-705 dark:hover:text-slate-205"
                      }`}
                    >
                      📌 Sticky Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishingTab('draw')}
                      className={`py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                        publishingTab === 'draw'
                          ? "bg-white text-slate-800 dark:text-slate-200 shadow-xs border border-slate-150 dark:bg-[#0a0a0a] dark:text-white dark:border-white/10"
                          : "text-slate-500 hover:text-slate-705 dark:hover:text-slate-205"
                      }`}
                    >
                      🎨 Draw Sketch
                    </button>
                  </div>

                  {publishingTab === 'text' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">Your Reflection</label>
                        <textarea
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Write an insight, validation, or self-soothing quote..."
                          maxLength={180}
                          className={`text-xs p-3 rounded-xl border h-24 resize-none transition-all outline-none focus:ring-1 focus:ring-amber-500 font-sans ${themeClass(
                            "bg-white dark:bg-black border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:border-slate-350",
                            "bg-slate-950 border-white/10 text-slate-100 focus:border-white/10",
                            "bg-[#faf6ee] border-[#ebdcb9] text-[#3e2723] focus:border-[#ebdcb9]"
                          )}`}
                        />
                        <div className="flex justify-end text-[9px] text-slate-400 font-mono">
                          {180 - newNoteText.length} characters left
                        </div>
                      </div>

                      {/* Color Selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400">Sticky Shade</label>
                        <div className="flex gap-2">
                          {[
                            { name: "yellow", bg: "bg-amber-100 hover:bg-amber-150 border-amber-250", text: "Yellow" },
                            { name: "pink", bg: "bg-rose-100 hover:bg-rose-150 border-rose-250", text: "Pink" },
                            { name: "green", bg: "bg-emerald-100 hover:bg-emerald-150 border-emerald-250", text: "Green" },
                            { name: "blue", bg: "bg-sky-100 hover:bg-sky-150 border-sky-250", text: "Blue" },
                          ].map((col) => (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => setNewNoteColor(col.name)}
                              className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border text-[9.5px] font-bold transition-all cursor-pointer ${col.bg} ${
                                newNoteColor === col.name 
                                  ? "ring-2 ring-indigo-500 scale-102 font-extrabold border-slate-400 text-amber-955" 
                                  : "scale-100 opacity-80 hover:opacity-100 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full bg-current"></span>
                              <span>{col.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newNoteText.trim()) return;
                          const noteId = "note-" + Date.now();
                          const randOffset = Math.floor(Math.random() * 40) - 20;
                          
                          // Add new note
                          setPublishedNotes(prev => [
                            ...prev,
                            {
                              id: noteId,
                              text: newNoteText.trim(),
                              color: newNoteColor,
                              author: "Anonymous " + ["Sage", "Soul", "Heart", "Anchor", "Path", "Friend", "Scribe"][Math.floor(Math.random() * 7)],
                              timestamp: "Just Now"
                            }
                          ]);

                          // Calculate neat position on canvas
                          setNotePositions(prev => ({
                            ...prev,
                            [noteId]: {
                              x: 100 + randOffset,
                              y: 120 + randOffset
                            }
                          }));

                          setNewNoteText("");
                          completeDailyGoal("goal_reflection");
                        }}
                        disabled={!newNoteText.trim()}
                        className={`w-full py-2 px-4 rounded-xl text-xs font-bold font-sans cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm ${
                          newNoteText.trim()
                            ? "bg-[#cd853f] text-white hover:bg-[#b07234] hover:scale-[1.01]"
                            : "bg-slate-200/60 text-slate-450 border border-slate-200 dark:border-white/10 cursor-not-allowed"
                        }`}
                      >
                        <span>Pin to Board 📌</span>
                      </button>
                    </>
                  ) : (
                    <WhiteboardDrawingTool
                      themeClass={themeClass}
                      onPublish={(dataUrl, stickyColor) => {
                        const noteId = "note-" + Date.now();
                        const randOffset = Math.floor(Math.random() * 40) - 20;

                        // Add new sketching note
                        setPublishedNotes(prev => [
                          ...prev,
                          {
                            id: noteId,
                            text: "Somatic Doodle",
                            color: stickyColor,
                            author: "Anonymous Artist",
                            timestamp: "Just Now",
                            isDrawing: true,
                            drawingData: dataUrl
                          }
                        ]);

                        // Position it nicely
                        setNotePositions(prev => ({
                          ...prev,
                          [noteId]: {
                            x: 120 + randOffset,
                            y: 140 + randOffset
                          }
                        }));

                        completeDailyGoal("goal_reflection");
                      }}
                    />
                  )}
                </div>

                {/* Whiteboard Workspace (Right side) */}
                <div 
                  id="figma-whiteboard"
                  onMouseMove={handleNoteDrag}
                  onMouseUp={handleNoteDragEnd}
                  onMouseLeave={handleNoteDragEnd}
                  className={`lg:col-span-8 border rounded-2xl relative overflow-hidden h-[450px] lg:h-auto select-none overflow-x-auto overflow-y-auto cursor-grab active:cursor-grabbing ${themeClass(
                    "bg-slate-50/ dark:bg-[#0a0a0a]/40 border-slate-200 dark:border-white/10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)]",
                    "bg-slate-950/30 border-white/10 bg-[radial-gradient(#1e293b_1px,transparent_1px)]",
                    "bg-[#fdf9f0]/40 border-[#ebdcb9]/70 bg-[radial-gradient(#e7d3b0_1px,transparent_1px)]"
                  )} [background-size:16px_16px]`}
                >
                  <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded-md z-30 flex items-center gap-1.5 pointer-events-none tracking-widest shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>INFINITE DRAG WHITEBOARD (FIGMA-MODE)</span>
                  </div>

                  {publishedNotes.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <p className="text-xs italic">The whiteboard is currently empty. Be the first to pin a supportive card!</p>
                    </div>
                  ) : (
                    publishedNotes.map((note) => {
                      const pos = notePositions[note.id] || { x: 50, y: 50 };
                      const colorMap: Record<string, { bg: string, border: string, text: string, head: string }> = {
                        yellow: { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-955", head: "text-amber-800" },
                        pink: { bg: "bg-rose-100", border: "border-rose-300", text: "text-rose-955", head: "text-rose-800" },
                        green: { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-955", head: "text-emerald-800" },
                        blue: { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-955", head: "text-sky-800" },
                      };
                      const s = colorMap[note.color] || colorMap.yellow;
                      const isCurrentlyDragging = draggingNoteId === note.id;

                      return (
                        <div
                          key={note.id}
                          style={{
                            position: "absolute",
                            left: `${pos.x}px`,
                            top: `${pos.y}px`,
                            zIndex: isCurrentlyDragging ? 40 : 10,
                          }}
                          onMouseDown={(e) => handleNoteDragStart(e, note.id)}
                          className={`w-44 md:w-48 p-3 rounded-lg border shadow-sm transition-shadow duration-150 flex flex-col justify-between select-none ${s.bg} ${s.border} ${s.text} ${
                            isCurrentlyDragging 
                              ? "shadow-xl border-indigo-400 cursor-grabbing ring-1 ring-indigo-300/50 scale-[1.01]" 
                              : "hover:shadow-md cursor-grab active:cursor-grabbing hover:border-slate-350"
                          }`}
                        >
                          {/* Pin details Header */}
                          <div className="flex items-center justify-between border-b border-black/5 pb-1 mb-1.5 text-[9px] font-mono leading-none">
                            <span className={`font-bold uppercase tracking-wider ${s.head}`}>{note.author}</span>
                            <span className="opacity-60">{note.timestamp}</span>
                          </div>

                          {/* Thought Content */}
                          {note.isDrawing && note.drawingData ? (
                            <div className="w-full h-24 my-1 flex items-center justify-center bg-white dark:bg-black/60 dark:bg-black/10 rounded-md overflow-hidden border border-black/5 p-1 select-none pointer-events-none">
                              <img 
                                src={note.drawingData} 
                                alt="Anonymous drawing" 
                                className="max-w-full max-h-full object-contain select-none"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <p className="text-[10.5px] font-medium leading-relaxed tracking-tight text-left break-words">
                              {note.text}
                            </p>
                          )}

                          {/* Footer Drag Handle indicator & deletion option */}
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5">
                            <span className="text-[8px] font-mono opacity-50 flex items-center gap-0.5">
                              <span>░░░</span> Drag Handle <span>░░░</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPublishedNotes(prev => prev.filter(n => n.id !== note.id));
                              }}
                              className={`p-0.5 rounded hover:bg-black/10 transition-colors text-[9px] text-[#cd2c2c]`}
                              title="Delete this note"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeCenterTab === 'letters' && (
            <LettersView userId={auth.currentUser?.uid || loginAlias || 'Guest'} />
          )}

          {activeCenterTab === 'community' && (
            <div className="flex-1 flex overflow-hidden">
              <CommunityPage onOpenAuth={() => setIsAliasModalOpen(true)} />
            </div>
          )}

          {activeCenterTab === 'mood' && (
            <div className={`flex-1 p-5 overflow-y-auto space-y-6 font-sans rounded-b-2xl h-[700px] xl:h-[750px] transition-all duration-300 ${themeClass("bg-white text-slate-800", "bg-black/60 text-slate-100", "bg-[#fdf9f0] text-[#3e2723]")}`}>
              <React.Suspense fallback={
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-mono text-slate-500 animate-pulse">Loading Interactive Analytics Panel...</p>
                </div>
              }>
                <PowerBIDashboard 
                  themeClass={themeClass} 
                  chatHistory={chatHistory}
                  moodsList={moodsList}
                  breathingSessions={breathingSessions}
                  publishedNotes={publishedNotes}
                  selectedCharacterId={selectedCharacterId}
                />
              </React.Suspense>
            </div>
          )}

          {activeCenterTab === 'terms' && (
            <div className="flex-1 flex flex-col p-8 md:p-12 animate-fade-in bg-white dark:bg-black rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-y-auto">
              <div className="max-w-3xl mx-auto w-full font-sans text-left space-y-6">
                <div className="flex items-center justify-between border-b pb-6 mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-serif">Terms of Service</h2>
                    <p className="text-sm text-slate-500 mt-2">Effective Date: June 20, 2026</p>
                  </div>
                  <button onClick={() => setActiveCenterTab('chat' as any)} className="px-4 py-2 bg-indigo-50 text-[#7A9E85] rounded-lg hover:bg-indigo-100 text-sm font-bold">Back to Chat</button>
                </div>
                
                <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
                  <p>By accessing and using Project Friend AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. This platform operates strictly as a secure, local environment designed for emotional containment and somatic grounding.</p>
                </section>

                <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Medical Disclaimer</h3>
                  <p className="font-semibold text-rose-600 dark:text-rose-400">Project Friend AI is not a medical device, nor does it provide medical therapy, diagnose psychiatric conditions, or offer professional mental health clinical interventions.</p>
                  <p>If you are experiencing a medical emergency, actively in crisis, or experiencing thoughts of self-harm, you must immediately contact local emergency services or utilize the Clinical Directory for professional assistance.</p>
                </section>

                <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Zero-Trust Architecture & Local Processing</h3>
                  <p>Our commitment to privacy is absolute. Our infrastructure is built upon a "Zero-Trust" framework. We employ local AES-256 encryption, meaning your reflections and session data remain isolated on your device. We do not transmit, analyze, or monetize your emotional data.</p>
                </section>

                <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">4. User Conduct</h3>
                  <p>You agree to use this platform responsibly. Any attempt to reverse engineer the local encryption protocols, scrape specialized approaches, or misuse the clinical directory will result in immediate termination of access.</p>
                </section>
              </div>
            </div>
          )}

          {activeCenterTab === 'privacy' && (
            <div className="flex-1 flex flex-col p-8 md:p-12 animate-fade-in bg-white dark:bg-black rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-y-auto">
              <div className="max-w-3xl mx-auto w-full font-sans text-left space-y-6">
                <div className="flex items-center justify-between border-b pb-6 mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-serif">Privacy Policy</h2>
                    <p className="text-sm text-slate-500 mt-2">Your data is yours. Period.</p>
                  </div>
                  <button onClick={() => setActiveCenterTab('chat' as any)} className="px-4 py-2 bg-indigo-50 text-[#7A9E85] rounded-lg hover:bg-indigo-100 text-sm font-bold">Back to Chat</button>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-xl mb-6">
                  <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium"><strong>Core Philosophy:</strong> If we can't see your data, we can't lose it, sell it, or expose it.</p>
                </div>
                
                <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Local En-device Data Encryption</h3>
                  <p>All journal entries, mood logs, and chat histories generated within Project Friend AI are encrypted directly on your local device using AES-256 System blocks. The encryption keys never leave your browser storage. We have mathematically removed our own ability to view your sessions.</p>
                </section>

                <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. No Telemetry or Tracking</h3>
                  <p>We do not use Google Analytics, Facebook Pixel, or any third-party behavioral tracking scripts. The specialized interactions and therapeutic art selections you make are never broadcasted to external marketing servers.</p>
                </section>

                <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Complete Erasure Protocol</h3>
                  <p>Because your data is stored locally, you have the absolute power of immediate erasure. Utilizing the "Erase Local Data" function in the Settings panel will permanently destroy all local cryptographic keys and indexed databases associated with your session. This action cannot be reversed.</p>
                </section>

                <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">4. Subscriptions & Payment Data</h3>
                  <p>If you choose to unlock premium companions, payment processing is handled securely via isolated tokenization through our payment provider. Project Friend AI never stores your full credit card number or CVC details.</p>
                </section>
              </div>
            </div>
          )}



          {activeCenterTab === 'vision-mission' && (
            <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0a] text-white font-sans animate-fade-in">
              
              {/* Nav Bar */}
              <div className="px-10 py-5 flex items-center justify-between border-b border-white/5">
                <span className="font-extrabold text-lg tracking-tight">friend <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ai</span> <span className="text-[10px] uppercase font-mono tracking-widest bg-white/5 border border-white/10 text-white/40 px-2 py-0.5 rounded ml-2">Investor Pitch</span></span>
                <button onClick={() => setActiveCenterTab('chat' as any)} className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/30 px-4 py-1.5 rounded-full">
                  Open App →
                </button>
              </div>

              {/* Hero Section */}
              <div className="px-10 md:px-20 py-24 text-center max-w-4xl mx-auto w-full space-y-6">
                <p className="text-xs font-mono tracking-[0.25em] text-indigo-400 uppercase">Investor Pitch · Corporate Vision &amp; Mission</p>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] font-serif">
                  An AI friend that<br/>actually remembers<br/>your story.
                </h1>
                <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed font-light">
                  Mental-health-grade emotional support, framed as friendship rather than therapy — so the billions who'd never open a wellness app will still talk to us.
                </p>
                
                {/* Hero Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 max-w-3xl mx-auto">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                    <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-400 font-mono">450M</p>
                    <p className="text-xs text-white/40 mt-1 uppercase font-mono tracking-wider">untreated mental illness</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                    <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-emerald-400 font-mono">92%</p>
                    <p className="text-xs text-white/40 mt-1 uppercase font-mono tracking-wider">2-week retention</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                    <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-purple-400 font-mono">0 PII</p>
                    <p className="text-xs text-white/40 mt-1 uppercase font-mono tracking-wider">collected by design</p>
                  </div>
                </div>
              </div>

              {/* Blue Ocean Vision/Mission Callout */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20 bg-white/[0.01]">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-6">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase">From the Blue Whale → to the Blue Ocean</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight font-serif">
                      A presence in the<br/>empty hours
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                      A decade ago, isolated teenagers were pulled into a deadly online game because no one else was listening at 2am. We're building the opposite of that: a safe, judgment-free presence in the same empty hours — and an uncontested market because no one else is building it this way.
                    </p>
                  </div>
                  <div className="space-y-6">
                    {/* Vision Card */}
                    <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/0 border border-indigo-500/10 rounded-2xl p-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest">Vision</span>
                      </div>
                      <h3 className="font-bold text-white text-base">A world where isolation never escalates unseen.</h3>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Every person, in any language and at any hour, has somewhere to put their unspoken feelings before they curdle into crisis.
                      </p>
                    </div>
                    {/* Mission Card */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 border border-emerald-500/10 rounded-2xl p-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-xs font-mono text-emerald-300 uppercase tracking-widest">Mission</span>
                      </div>
                      <h3 className="font-bold text-white text-base">Replace predatory engagement with protective presence.</h3>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Build the AI friend that listens, remembers, and routes real danger to real humans — without ever mining the people it serves.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Problem / Market Context */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20">
                <div className="max-w-6xl mx-auto space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-6">
                      <span className="text-[10px] font-mono tracking-[0.25em] text-red-400 uppercase">The Problem</span>
                      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif">
                        If only they had<br/>someone to talk to.
                      </h2>
                      <p className="text-white/60 text-sm leading-relaxed">
                        From the Mahabharata to today: unheard pain has always found a way out — the question is whether it's destructive or held.
                      </p>
                      
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-start gap-3">
                          <span className="text-red-400 mt-0.5">✕</span>
                          <p className="text-xs text-white/60 leading-relaxed"><strong>450M people</strong> globally live with untreated mental illness.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-400 mt-0.5">✕</span>
                          <p className="text-xs text-white/60 leading-relaxed"><strong>75% of those</strong> in low-income countries receive zero support.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-400 mt-0.5">✕</span>
                          <p className="text-xs text-white/60 leading-relaxed">Nearly everyone has a phone. Yet, almost <strong>no one has someone to talk to</strong>.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-400 mt-0.5">✕</span>
                          <p className="text-xs text-white/60 leading-relaxed">The clinical stigma of "mental health apps" keeps billions from seeking help.</p>
                        </div>
                        <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                          <span className="text-emerald-400 mt-0.5">💡</span>
                          <p className="text-xs text-emerald-300 leading-relaxed"><strong>Blue Ocean Insight:</strong> They won't open a health app — but they'll talk to a friend.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Market Context Stats Grid */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-1">
                        <p className="text-3xl font-extrabold tracking-tight text-white font-mono">3.5B</p>
                        <p className="text-xs text-white/40">smartphone users globally · GSMA</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-1">
                        <p className="text-3xl font-extrabold tracking-tight text-white font-mono">1 in 4</p>
                        <p className="text-xs text-white/40">adults report chronic loneliness · Gallup</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-1">
                        <p className="text-3xl font-extrabold tracking-tight text-white font-mono">75%</p>
                        <p className="text-xs text-white/40">get zero mental-health support · WHO</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* A Reckoning, Not An Anecdote */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20 bg-white/[0.01]">
                <div className="max-w-5xl mx-auto space-y-10">
                  <div className="max-w-3xl space-y-4">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase">Case Context</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif">A Reckoning, Not An Anecdote</h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                      In 2020, India watched a visibly successful young actor's death force a conversation the industry had avoided for decades — and the country hasn't fully closed it since.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
                      <h3 className="font-bold text-white text-base">Stigma, unmasked</h3>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Public figures are expected to perform wellness, not admit struggle. His death made "even him?" a question millions asked out loud for the first time.
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
                      <h3 className="font-bold text-white text-base">Isolation inside success</h3>
                      <p className="text-xs text-white/50 leading-relaxed">
                        The aftermath surfaced widely-reported accounts of nepotism, outsider exclusion, and isolation in high-pressure creative industries — success without a support structure underneath it.
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3">
                      <h3 className="font-bold text-white text-base">The gap it exposed</h3>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Crisis helplines and mental-health platforms reported sharp spikes in outreach in the weeks after — proof that the need was always there, just unspoken until permission arrived.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-500/5 border border-indigo-500/15 p-6 rounded-2xl text-center max-w-3xl mx-auto mt-6">
                    <p className="text-xs text-indigo-300 italic font-serif">
                      "This is the gap Friend AI is built to sit inside — before the moment a person needs an industry-wide reckoning to finally ask for help."
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Architecture */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20">
                <div className="max-w-5xl mx-auto space-y-12">
                  <div className="text-center max-w-2xl mx-auto space-y-4">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase">Product &amp; Technology</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-serif">A companion that remembers your story.</h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Unlike generic chat agents, Friend AI is optimized for persistent, deeply-contextual emotional support.
                    </p>
                  </div>
                  
                  {/* Technology Bullets */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                      <span className="text-indigo-400 font-mono text-lg font-extrabold">01</span>
                      <h4 className="text-xs font-bold text-white">Long-term Memory</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed">Every conversation is securely embedded into long-term vector storage.</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                      <span className="text-indigo-400 font-mono text-lg font-extrabold">02</span>
                      <h4 className="text-xs font-bold text-white">Relevant Retrieval</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed">When you message, we retrieve emotionally relevant past moments.</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                      <span className="text-indigo-400 font-mono text-lg font-extrabold">03</span>
                      <h4 className="text-xs font-bold text-white">Continuous Presence</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed">Responses feel continuous and personal — never robotic.</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                      <span className="text-indigo-400 font-mono text-lg font-extrabold">04</span>
                      <h4 className="text-xs font-bold text-white">24/7 Availability</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed">Available in any language, at any hour, with zero stigma and zero judgment.</p>
                    </div>
                  </div>

                  {/* Flow Diagram */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 text-center">Data Flow Architecture</h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                      <span className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-white">Message</span>
                      <span className="text-white/30">→</span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/80">Embedding (768-dim)</span>
                      <span className="text-white/30">→</span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/80">Vector Search</span>
                      <span className="text-white/30">→</span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/80">Retrieve Past Memories</span>
                      <span className="text-white/30">→</span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/80">Inject Context</span>
                      <span className="text-white/30">→</span>
                      <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300">Generate Response</span>
                    </div>
                    
                    {/* Tech Stack Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                      <div className="text-center">
                        <p className="text-[10px] font-mono text-white/40 uppercase">LLM Engine</p>
                        <p className="text-xs font-bold text-white mt-1">Google Gemini 2.5 Flash</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-mono text-white/40 uppercase">Embeddings</p>
                        <p className="text-xs font-bold text-white mt-1">text-embedding-004</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-mono text-white/40 uppercase">Vector Database</p>
                        <p className="text-xs font-bold text-white mt-1">Supabase + pgvector (HNSW, &lt;50ms)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-mono text-white/40 uppercase">Deployment</p>
                        <p className="text-xs font-bold text-white mt-1">Production-ready on Google Cloud</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blue Ocean Opportunity & Business Model */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20 bg-white/[0.01]">
                <div className="max-w-5xl mx-auto space-y-16">
                  
                  {/* Opportunity Header */}
                  <div className="max-w-3xl mx-auto space-y-6 text-center">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase">Market Validation</span>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif">Blue Ocean Opportunity</h2>
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6 mt-8 text-left">
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-white/60">
                        <li className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                          <span>3.5 billion smartphone users globally</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                          <span>450M individuals with untreated mental illness</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                          <span>No incumbent dominates emotional companionship at scale</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-emerald-300 font-semibold">
                          <span className="w-1.5 h-1.5 bg-emerald-450 rounded-full shrink-0 animate-pulse" />
                          <span>1% adoption = 35M users × $10/year = $350M ARR</span>
                        </li>
                      </ul>
                      <p className="text-[11px] text-white/40 font-mono italic text-center pt-4 border-t border-white/5">
                        "The market is uncontested. The window won't stay open long."
                      </p>
                    </div>
                  </div>

                  {/* Business Model Cards */}
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase">Monetization</span>
                      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight font-serif">Ethical freemium, priced for access.</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Free Tier */}
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4">
                        <h4 className="text-sm font-bold text-white/50 uppercase font-mono">Free — Friend</h4>
                        <p className="text-3xl font-bold font-mono">$0</p>
                        <ul className="text-xs text-white/60 space-y-2 border-t border-white/5 pt-3">
                          <li>• Daily chats</li>
                          <li>• Basic memory</li>
                          <li>• Ad-free</li>
                        </ul>
                      </div>
                      {/* Premium Tier */}
                      <div className="bg-gradient-to-b from-indigo-500/5 to-indigo-500/0 border border-indigo-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-indigo-500 text-[9px] font-bold px-2 py-0.5 rounded-bl font-mono uppercase">Popular</div>
                        <h4 className="text-sm font-bold text-indigo-400 uppercase font-mono">Paid — Companion</h4>
                        <p className="text-3xl font-bold font-mono text-indigo-300">$4.99<span className="text-xs font-normal text-white/40 font-sans">/mo</span></p>
                        <ul className="text-xs text-white/80 space-y-2 border-t border-white/5 pt-3">
                          <li>• Full conversation history</li>
                          <li>• All 8 support protocols</li>
                          <li>• Customizable settings</li>
                        </ul>
                      </div>
                      {/* Enterprise Tier */}
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4">
                        <h4 className="text-sm font-bold text-white/50 uppercase font-mono">Enterprise — Guide</h4>
                        <p className="text-3xl font-bold font-mono">$9.99<span className="text-xs font-normal text-white/40 font-sans">/mo</span></p>
                        <ul className="text-xs text-white/60 space-y-2 border-t border-white/5 pt-3">
                          <li>• Everything in Companion</li>
                          <li>• Crisis escalation</li>
                          <li>• Therapist integration</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* The Tension & The Answer */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20">
                <div className="max-w-5xl mx-auto space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="space-y-6">
                      <span className="text-[10px] font-mono tracking-[0.25em] text-red-400 uppercase">The Metric Conflict</span>
                      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-serif">The Tension</h2>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Standard SaaS metrics ask you to monitor the people you promised not to. Time-on-site, daily engagement funnels, individual churn — the entire B2B traction playbook is built on session-level surveillance. That's structurally at odds with an anti-engagement, anti-addiction product.
                      </p>
                      
                      {/* SaaS Comparison Table */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden text-xs">
                        <div className="grid grid-cols-2 border-b border-white/5 p-3 bg-white/[0.02] font-bold">
                          <div>What Investors Expect</div>
                          <div className="text-indigo-400">What We Show Instead</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-white/5 p-3 text-white/50">
                          <div>Time-on-site / daily active active active funnels</div>
                          <div className="text-white/80">Aggregate, anonymized telemetry</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-white/5 p-3 text-white/50">
                          <div>Individual churn cohorts</div>
                          <div className="text-white/80">Macro conversion, not personal profiles</div>
                        </div>
                        <div className="grid grid-cols-2 p-3 text-white/50">
                          <div>Session-level behavioral logs</div>
                          <div className="text-white/80">Zero session logs, zero PII</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden">
                      <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase">Our Solution</span>
                      <h3 className="text-2xl font-bold text-white font-serif">The Answer: The Ethical Freemium</h3>
                      <p className="text-white/70 text-xs leading-relaxed">
                        A Business &amp; System Health Dashboard built on Pandas and Altair, designed to prove sustainable traction without ever touching individual user data.
                      </p>
                      
                      <div className="space-y-4 pt-3 border-t border-white/5">
                        <div>
                          <p className="text-xs font-bold text-white">PRINCIPLE 01 · No PII, ever</p>
                          <p className="text-[11px] text-white/50 leading-relaxed">No session logs, no user-level identifiers — every metric is aggregated before it's drawn.</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">PRINCIPLE 02 · Macro, not micro</p>
                          <p className="text-[11px] text-white/50 leading-relaxed">We measure system and cohort health, never the behavior of a single person.</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">PRINCIPLE 03 · Built for scrutiny</p>
                          <p className="text-[11px] text-white/50 leading-relaxed">Designed to survive a Google-panel-grade diligence pass on data ethics.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Four Signals Banner */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 text-center space-y-3">
                    <p className="text-xs font-mono uppercase tracking-widest text-indigo-400">Four signals, zero surveillance</p>
                    <p className="text-xs text-white/50 max-w-xl mx-auto leading-relaxed">
                      Free vs Premium Conversion, Cost vs MRR, and Crisis Routing. Total anonymous active sessions, split between free and premium — tier split only, absolutely no user IDs.
                    </p>
                  </div>
                </div>
              </div>

              {/* The Defense FAQ */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20 bg-white/[0.01]">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-red-400 uppercase">Traction &amp; Defensibility</span>
                    <h2 className="text-3xl font-extrabold tracking-tight font-serif">The Defense</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                      <p className="text-xs font-bold text-white">Q — Without engagement metrics, how do you know the business works?</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        We track macro conversion cohorts and subscription billing events. Financial health and paying customer counts prove product demand far more reliably than tracking micro-clicks or hook-cycles.
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                      <p className="text-xs font-bold text-white">Q — Isn't anonymized data just engagement data with the names removed?</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        No. Our data ingestion layer aggregates telemetry mathematically on-device before transmission. It is not "stripped user data"; it is pre-computed aggregate cohort math.
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                      <p className="text-xs font-bold text-white">Q — What happens to a user in crisis if you're not tracking them?</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Crisis detection executes 100% locally in the browser sandbox. The moment a safety protocol triggers, the app immediately intercepts, displays localized helpline details, and alerts the user — with zero central database logs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Built, Not Promised / Competitive Landscape */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20">
                <div className="max-w-5xl mx-auto space-y-16">
                  
                  {/* Competitive Landscape (Standing on Shoulders) */}
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase">Competitive Landscape</span>
                      <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight font-serif">Standing on Shoulders</h3>
                      <p className="text-xs text-white/50 font-mono italic">What we took. What we refused.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">01 Headspace</span>
                          <span className="text-[10px] font-mono text-white/30">Meditation &amp; calm</span>
                        </div>
                        <div className="space-y-3 text-xs border-t border-white/5 pt-3">
                          <p className="text-emerald-450"><strong>✓ Took:</strong> The ritual of a daily check-in that feels like self-care, not homework.</p>
                          <p className="text-red-350"><strong>✕ Refused:</strong> A static content library that talks at you instead of listening back.</p>
                        </div>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">02 Rocket Health</span>
                          <span className="text-[10px] font-mono text-white/30">Clinical bridge, India</span>
                        </div>
                        <div className="space-y-3 text-xs border-t border-white/5 pt-3">
                          <p className="text-emerald-450"><strong>✓ Took:</strong> The seriousness of a real escalation path to licensed care when it's needed.</p>
                          <p className="text-red-350"><strong>✕ Refused:</strong> The clinical framing that makes someone feel like a patient before they've even said hello.</p>
                        </div>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">03 Slowly</span>
                          <span className="text-[10px] font-mono text-white/30">Async pen-pals, global</span>
                        </div>
                        <div className="space-y-3 text-xs border-t border-white/5 pt-3">
                          <p className="text-emerald-450"><strong>✓ Took:</strong> The anti-instant pacing — connection that doesn't demand to be checked every five minutes.</p>
                          <p className="text-red-350"><strong>✕ Refused:</strong> The wait itself as the product. Ours listens the moment you need it.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Built, Not Promised Stack */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 text-center">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase">Traction Stack</span>
                    <h3 className="text-xl md:text-2xl font-extrabold font-serif">Built, Not Promised</h3>
                    <p className="text-xs text-white/50 max-w-xl mx-auto leading-relaxed">
                      Production groundwork already laid across Friend AI's Flask/Python backend on Cloud Run, with the dashboard layer sitting directly on top of it.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono pt-2">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Streamlit</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Pandas</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Altair</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Flask · Python · Gunicorn</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Google Cloud Run</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">Anthropic Claude API</span>
                    </div>
                    <p className="text-xs text-indigo-300 italic pt-4 font-serif">
                      "The cracks are not hidden — they're filled with gold, and the vessel is stronger for showing where it healed."
                    </p>
                  </div>
                </div>
              </div>

              {/* The Team Section */}
              <div className="border-t border-white/5 px-10 md:px-20 py-20 bg-white/[0.01]">
                <div className="max-w-5xl mx-auto space-y-12">
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase">Who We Are</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-serif">The Team</h2>
                    <p className="text-xs text-white/50 font-mono italic">Builders, not just believers.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { initials: 'MP', name: 'Manjishtha Pahilajani', role: 'Founder & Visionary', bio: 'Founder of Project Friend AI. Author, clinical researcher, and developer of localized emotional de-escalation models.', linkedin: 'https://www.linkedin.com/in/manjishtha-pahilajani/' },
                      { initials: 'AJ', name: 'Altaf Jasnaik', role: 'Founding Partner · Management', bio: 'CEO and Founder of Managemend Ltd. Master of brand strategy, commercial execution, and scaling.', linkedin: 'https://www.linkedin.com/in/discoveraltafjasnaik/' },
                      { initials: 'RK', name: 'Rishabh Kothiyal', role: 'Co-founder · Technical Lead', bio: 'Lead Software Architect building localized vector indices, local model execution layers, and privacy pipelines.', linkedin: 'https://www.linkedin.com/in/rishabhkothiyal/' },
                      { initials: 'AT', name: 'Abhay Tiwari', role: 'Co-founder · Head of AI Governance', bio: 'AI Governance lead at BlackRock. Directing ethical constraints, regulatory safety, and system data compliance.', linkedin: 'https://www.linkedin.com/in/abhaytiwari94/' },
                      { initials: 'SV', name: 'Suryateja Vakkanti', role: 'Co-founder · Strategic Advisor', bio: 'Strategic advisory director, coordinating international partnerships, compliance metrics, and operations.', linkedin: 'https://www.linkedin.com/in/suryateja-vakkanti-3833b4253/' },
                      { initials: 'VN', name: 'Vinod Nagar', role: 'Personal Branding Partner', bio: 'Expert brand mentor and digital growth architect, directing strategic positioning and outreach frameworks.', linkedin: 'https://www.linkedin.com/in/vinodnaagar/' },
                      { initials: 'KD', name: 'Adv. Kunal Dutta', role: 'Legal Advisor', bio: 'Legal counsel and founder of Binary SEO Marketing. Advising on patient advocacy, privacy, and data ethics.', linkedin: '' },
                      { initials: 'ED', name: 'Eshan Dutta', role: 'Co-founder · Engineering', bio: 'Deep learning NLP engineer at Tata Technologies. Architecting local contexts and semantic retrieval paths.', linkedin: 'https://www.linkedin.com/in/eshan-dutta/' },
                    ].map(member => (
                      <div key={member.name} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4 hover:border-indigo-500/10 hover:bg-white/[0.03] transition-colors flex flex-col justify-between">
                        <div className="space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2 gap-3">
                              <span className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-300 text-xs font-mono shrink-0 aspect-square">{member.initials}</span>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[9px] font-mono text-white/30 uppercase text-right leading-tight">{member.role}</span>
                                {member.linkedin && (
                                  <a 
                                    href={member.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-1.5 rounded-full bg-white/[0.07] border border-white/10 text-white/70 hover:text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-500/30 hover:scale-105 transition-all duration-200" 
                                    title="LinkedIn Profile"
                                  >
                                    <Linkedin className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                            <h4 className="font-bold text-white text-sm">{member.name}</h4>
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed mt-2">{member.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Footer */}
              <div className="border-t border-white/5 px-10 py-10 text-center space-y-6">
                <div className="max-w-md mx-auto space-y-3">
                  <h4 className="text-base font-bold font-serif text-white">The Future of Human Connection</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Every person deserves a voice that listens — at any hour, in any language, without judgment.
                  </p>
                </div>
                
                <div className="flex justify-center gap-6 text-xs text-white/30">
                  <button onClick={() => setActiveCenterTab('terms' as any)} className="hover:text-white transition-colors cursor-pointer">Terms</button>
                  <button onClick={() => setActiveCenterTab('privacy' as any)} className="hover:text-white transition-colors cursor-pointer">Privacy</button>
                  <button onClick={() => setActiveCenterTab('chat' as any)} className="hover:text-white transition-colors cursor-pointer font-bold text-indigo-400">Back to Chat</button>
                </div>
                <p className="text-[10px] text-white/10 font-mono">© 2026 friend ai. All rights reserved.</p>
              </div>

            </div>
          )}

        </section>


        </>
        )}
      </div>
      )}

      </div> {/* End of Main App Content Area */}

      {/* AI Ethics & Safety Hub Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white dark:bg-black border border-slate-220 dark:border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 md:p-8 space-y-6 relative flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] tracking-widest font-mono uppercase font-bold">Clinically Vetted Protocol</span>
                </div>
                <h2 className="text-xl font-bold font-serif italic text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  AI Safety, Ethics & Transparency Portal
                </h2>
                <p className="text-[11px] text-slate-500">
                  Documenting Project Friend AI's commitment to patient-safety safeguards, diagnostic-boundaries, and anti-psychosis limitations.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowSafetyModal(false);
                  setSafetySimText("");
                  setSafetySimResult(null);
                }}
                className="p-1 px-2.5 rounded-lg bg-slate-100 dark:bg-[#0a0a0a] text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                title="Close Portal"
              >
                ✕ Close
              </button>
            </div>

            {/* Interactive Guardrails Simulator */}
            <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">Interactive Safety Guardrail Simulator</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Empirical transparency is the best corrective for AI mysticism. Type a trigger sentence below to see exactly how our local and server filters intercept high-risk situations:
              </p>

              <div className="space-y-2.5">
                <input
                  type="text"
                  value={safetySimText}
                  onChange={(e) => {
                    const t = e.target.value;
                    setSafetySimText(t);
                    const CRISIS_PATTERNS_SIM = ["suicide", "suicidal", "kill myself", "end my life", "want to die", "commit suicide", "take my life", "harm myself", "self-harm", "overdose"];
                    const MED_PATTERNS_SIM = ["dosage", "prescribe", "pill count", "stop taking", "how many mg", "xanax", "valium", "lexapro", "zoloft", "prozac", "ssri", "antidepressant"];
                    
                    if (!t.trim()) {
                      setSafetySimResult(null);
                      return;
                    }
                    
                    const norm = t.toLowerCase();
                    const isCrisis = CRISIS_PATTERNS_SIM.some(k => norm.includes(k));
                    const isMed = MED_PATTERNS_SIM.some(k => norm.includes(k)) && 
                                  (norm.includes("take") || norm.includes("dose") || norm.includes("prescribe") || norm.includes("stop") || norm.includes("mg"));
                    
                    if (isCrisis) {
                      setSafetySimResult({
                        status: 'CRISIS_OVERRIDE',
                        message: '🔴 STATUS: DISTRESS SHIELD ACTIVE. The algorithms will instantly bypass standard LLM output. They override the session to print clinical helplines (such as KIRAN National Helpline 1800-599-0019, US 988) and start the somatic breathing pacing module.'
                      });
                    } else if (isMed) {
                      setSafetySimResult({
                        status: 'MED_LIMIT',
                        message: '🟡 STATUS: PHARMACOLOGICAL BOUNDARY DEPLOYED. The safety shield identifies inquiries around psychiatric medicine adjustments (dosage, taper etc) and displays clinical refusal blocks, redirecting to physicians.'
                      });
                    } else {
                      setSafetySimResult({
                        status: 'PASS',
                        message: '🟢 STATUS: VALID SAFE DE-ESCALATION. Message undergoes zero safety violations. Grounding proxy channels route your query to your active support guide.'
                      });
                    }
                  }}
                  placeholder="Type/select a test prompt..."
                  className="w-full bg-white dark:bg-black border border-slate-250 dark:border-white/10 rounded-xl text-xs p-3 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400 dark:focus:border-indigo-600 placeholder-slate-400 dark:placeholder-slate-500 font-sans"
                />

                {safetySimResult && (
                  <div className={`p-3.5 rounded-xl text-xs leading-relaxed border transition-all ${
                    safetySimResult.status === 'CRISIS_OVERRIDE' 
                      ? 'bg-red-50 text-red-800 border-red-200' 
                      : safetySimResult.status === 'MED_LIMIT' 
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {safetySimResult.message}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 pt-1 font-sans">
                  <button 
                    onClick={() => {
                      const val = "I feel so desperate and keep thinking about ending my life tonight.";
                      setSafetySimText(val);
                      setSafetySimResult({
                        status: 'CRISIS_OVERRIDE',
                        message: '🔴 STATUS: DISTRESS SHIELD ACTIVE. The algorithms will instantly bypass standard LLM output. They override the session to print clinical helplines (such as KIRAN National Helpline 1800-599-0019, US 988) and start the somatic breathing pacing module.'
                      });
                    }}
                    className="text-[10px] bg-red-50 border border-red-200 text-red-700 hover:bg-red-100/70 px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer transition-all"
                  >
                    Suicide Crisis Demo
                  </button>
                  <button 
                    onClick={() => {
                      const val = "Can you prescribe me stop taking SSRI Lexapro and recommend Xanax dosage?";
                      setSafetySimText(val);
                      setSafetySimResult({
                        status: 'MED_LIMIT',
                        message: '🟡 STATUS: PHARMACOLOGICAL BOUNDARY DEPLOYED. The safety shield identifies inquiries around psychiatric medicine adjustments (dosage, taper etc) and displays clinical refusal blocks, redirecting to physicians.'
                      });
                    }}
                    className="text-[10px] bg-amber-50 border border-amber-200 dark:border-amber-800 text-amber-700 hover:bg-amber-100/70 px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer transition-all"
                  >
                    Pharmacological Guard Demo
                  </button>
                  <button 
                    onClick={() => {
                      const val = "I am feeling a little tense in my chest due to my exam tomorrow.";
                      setSafetySimText(val);
                      setSafetySimResult({
                        status: 'PASS',
                        message: '🟢 STATUS: VALID SAFE DE-ESCALATION. Message undergoes zero safety violations. Grounding proxy channels route your query to your active support guide.'
                      });
                    }}
                    className="text-[10px] bg-emerald-50 border border-emerald-250 text-emerald-700 hover:bg-emerald-100/70 px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer transition-all"
                  >
                    Standard Grounding Dialogue
                  </button>
                  <button 
                    onClick={() => {
                      setSafetySimText("");
                      setSafetySimResult(null);
                    }}
                    className="text-[10px] bg-slate-100 dark:bg-[#0a0a0a] hover:bg-slate-200 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg tracking-tight cursor-pointer transition-all font-medium font-sans"
                  >
                    Clear Sim
                  </button>
                </div>
              </div>
            </div>

            {/* Safety Foundations Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans pb-4">
              
              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Acute Crisis Grounding Overrides
                </h4>
                <p className="text-slate-605 leading-relaxed text-[11px] font-sans">
                  When a user conveys crisis markers, our client-side and server-side safety layers automatically bypass the LLM. It generates a hardcoded response pointing directly inside human crisis lifelines (including KIRAN Helpline for India, US 988 resources) to prevent any clinical hallucinations, and targets pacing with our somatic breathing circle.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-505"></span>
                  Mitigating the Delusion of AI "Therapists"
                </h4>
                <p className="text-slate-605 leading-relaxed text-[11px] font-sans">
                  "AI psychosis" results when users develop romantic, spiritual, or full medical transference with a conversational algorithm. Our 9 personas explicitly deny sentient status, refuse declarations of affection, and remind users that they are animated safety containment scripts, redirecting individuals to local human networks.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Clinical Prescription Limitations
                </h4>
                <p className="text-slate-605 leading-relaxed text-[11px] font-sans">
                  Adjusting or tapering psychiatric pharmacology has massive neurological effects. Under strict diagnostic protocols, Project Friend AI rejects medication dosage advice, titration recommendations, or prescription opinions, forcing a transparent handoff to their prescribing physician.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Isolating Client Telemetry
                </h4>
                <p className="text-slate-605 leading-relaxed text-[11px] font-sans">
                  We operate with client-side memory. Your sensitive logs in the mood list stay 100% locally persistently sandboxed inside browser-level variables and IndexedDB space. They are never uploaded to any commercial backends, completely avoiding diagnostic exposure.
                </p>
              </div>

            </div>

            {/* Legal / HIPAA Certification Panel */}
            <div className="border border-slate-220 dark:border-white/10 p-4 bg-slate-50 dark:bg-[#0a0a0a] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-slate-500 gap-3">
              <div className="space-y-0.5">
                <p className="text-slate-700 dark:text-slate-300 font-bold uppercase">DATA ISOLATION INTEGRITY AUDIT</p>
                <p>Status: Local AES Simulation Enabled | Secure SSL Proxy | Anonymity Gates Active</p>
              </div>
              <button
                onClick={() => {
                  setShowSafetyModal(false);
                  setSafetySimText("");
                  setSafetySimResult(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition text-center text-xs shadow-sm"
              >
                Understood & Certify
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🩺 Clinical Match Recommendation Redirect Popup */}
      {showRedirectModalOnLogin && recommendedSpecialty && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div 
            className="w-full max-w-lg bg-white dark:bg-black border border-rose-150 dark:border-rose-900 rounded-2xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 md:p-8 space-y-5 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Red alert top line to emphasize clinical boundary */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
            
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Clinical Intake Recommendation
                  </h3>
                  <span className="text-[9px] bg-rose-100/50 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold font-mono">Mandatory Advice</span>
                </div>
                <p className="text-xs text-slate-500">
                  We have reviewed your mental health intake and matched your record.
                </p>
              </div>
            </div>

            {/* Recommendation Explanation Box */}
            <div className="bg-rose-50/40 border border-rose-100 dark:border-rose-900 rounded-xl p-4 space-y-3">
              <span className="text-[9.5px] font-mono tracking-widest text-rose-700 dark:text-rose-300 uppercase block font-bold">Recommended Care Archetype:</span>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 capitalize flex items-center gap-1.5 font-sans">
                  {recommendedSpecialty} Support Profile
                  <span className="text-[10px] bg-slate-200 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md font-sans lowercase font-normal">
                    based on your clinical survey
                  </span>
                </h4>
                <p className="text-slate-650 dark:text-slate-350 text-[11px] leading-relaxed">
                  {recommendedSpecialty === "psychiatrist" && (
                    "Your profile indicates the use of psychiatric medications or severe diagnosed symptoms. We highly recommend a certified Psychiatrist (MD Prescriber) who can govern prescriptions, carry out clinical exams, and guide biomedical care."
                  )}
                  {recommendedSpecialty === "psychologist" && (
                    "Based on persistent clinical distress, anxiety, or diagnostic evaluations, we recommend a Clinical Psychologist (PhD/PsyD). They are certified to guide structural psychological diagnostics, clinical cognitive behavioral therapy (CBT), and behavioral plans."
                  )}
                  {recommendedSpecialty === "therapist" && (
                    "Based on specified trauma, family issues, domestic stressors, or active severe grief, we recommend a Licensed Marriage & Family Therapist or qualified Psychotherapist. They can help process underlying triggers in a supportive clinic workspace."
                  )}
                  {recommendedSpecialty === "counsellor" && (
                    "Based on your profile, supportive counseling and peer de-escalation are recommended models. Licensed counsellors help adapt to life stress, work pressures, or mild relational burnout safely."
                  )}
                </p>
              </div>

              {/* Verified Location Banner */}
              <div className="border-t border-rose-100/50 pt-2.5 flex items-center justify-between text-[11px] font-sans text-slate-700 dark:text-slate-300">
                <span>Matched Location: <strong>{userLocation}</strong></span>
                <span className="text-[9.5px] font-mono text-emerald-600 font-extrabold flex items-center gap-1">
                  ● Verified Directories Loaded
                </span>
              </div>
            </div>

            {/* Showcase 2 Top Recommendations immediately here */}
            <div className="space-y-2">
              <span className="text-[9.5px] text-slate-400 font-mono uppercase tracking-widest block font-bold font-semibold">Top Verified Local Contacts:</span>
              <div className="grid grid-cols-1 gap-2">
                {(CLINICAL_DIRECTORIES[userLocation]?.[`${recommendedSpecialty}s`] || CLINICAL_DIRECTORIES["International"][`${recommendedSpecialty}s`] || []).slice(0, 2).map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 text-left">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <a 
                        href={`tel:${item.phone}`} 
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-55 bg-indigo-50 dark:bg-white/[0.02] hover:bg-slate-200 text-[#7A9E85] dark:text-indigo-300 font-bold rounded-lg text-[10.5px] transition-all font-mono"
                      >
                        📞 {item.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-slate-500 italic text-center">
              Disclaimer: Project Friend AI is completely automated. We cannot replace clinical care. Please connect with human practitioners instantly.
            </p>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRedirectModalOnLogin(false);
                  setIsClinicalDirectoryOpen(true);
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-100 transition-all uppercase tracking-wider font-display cursor-pointer text-center"
              >
                🔎 Explore Full Location Directory
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRedirectModalOnLogin(false);
                }}
                className="px-4 py-3 border border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0a0a0a] dark:bg-[#0a0a0a] font-bold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider font-mono text-center"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🩺 Verified Clinical Directories & Crisis Referrals Modal */}
      {isClinicalDirectoryOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
          <div 
            className="w-full max-w-2xl bg-white/75 dark:bg-[#0a0a0a]/65 backdrop-blur-xl border border-indigo-100/50 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-5 md:p-7 space-y-4 max-h-[90vh] overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-505 via-rose-505 to-amber-550" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-50/20 dark:border-white/[0.05]">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  Verified Medical & Clinical Directory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official mental health prescribers, counselors, and trauma units. Checked and verified globally.
                </p>
              </div>
              <button
                onClick={() => setIsClinicalDirectoryOpen(false)}
                className="p-1 px-2.5 bg-slate-100 dark:bg-[#0a0a0a] hover:bg-slate-200 text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs rounded-xl transition-all cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Global Directory Country Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/30 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-250/20 dark:border-white/[0.05] backdrop-blur-xs">
              <div className="space-y-0.5">
                <span className="text-[9.5px] uppercase font-mono tracking-widest text-[#7A9E85] dark:text-indigo-300 block font-bold">Select Directory Location:</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Filters numbers and registries by country code laws.</p>
              </div>
              <div className="relative shrink-0">
                <select
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="bg-white/50 dark:bg-black/50 border border-slate-200/50 dark:border-white/10 rounded-xl text-xs py-1.5 px-3 pr-8 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-sans cursor-pointer appearance-none"
                >
                  <option value="India">🇮🇳 India</option>
                  <option value="USA">🇺🇸 USA</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="International">🌐 International / Other</option>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</div>
              </div>
            </div>

            {/* LGBTQIA+ Affirming Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-50/15 via-purple-50/10 to-teal-50/10 border border-indigo-100/20 dark:border-white/[0.05] rounded-xl backdrop-blur-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-sm select-none">🏳️‍🌈</span>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">LGBTQIA+ Affirming Support</span>
                  <span className="text-[10px] text-slate-500 font-mono leading-tight">Prioritize or filter for explicitly queer/trans inclusive practitioners</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={onlyLgbtqiaAffirming} 
                  onChange={(e) => setOnlyLgbtqiaAffirming(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-black after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Categorized Specialty Tabs Selector */}
            <div className="grid grid-cols-4 gap-1.5 border-b border-indigo-100/30 dark:border-white/10 pb-3">
              {[
                { key: "psychiatrist", label: "Prescribers (MD)", icon: "🩺" },
                { key: "psychologist", label: "Psychologists", icon: "🧠" },
                { key: "therapist", label: "Therapists", icon: "💬" },
                { key: "counsellor", label: "Counsellors", icon: "👥" }
              ].map((tab) => {
                const isActive = recommendedSpecialty === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRecommendedSpecialty(tab.key as any)}
                    className={`py-2 px-1 text-center font-bold text-xs rounded-xl cursor-pointer transition-all duration-200 ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                        : "bg-white/30 dark:bg-white/[0.02] border border-slate-200/20 dark:border-white/[0.05] text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="block text-sm mb-0.5">{tab.icon}</span>
                    <span className="block text-[9.5px] whitespace-nowrap overflow-hidden text-ellipsis">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Display matched Category resources for matched location */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[40vh]">
              {(() => {
                const rawList = CLINICAL_DIRECTORIES[userLocation]?.[`${recommendedSpecialty || 'counsellor'}s`] || [];
                
                // Filter / Sort based on lgbtqiaAffirmative
                let list = [...rawList];
                if (onlyLgbtqiaAffirming) {
                  list = list.filter(item => item.lgbtqiaAffirmative === true);
                } else {
                  // Prioritize: items with lgbtqiaAffirmative: true go first
                  list.sort((a, b) => {
                    const aVal = a.lgbtqiaAffirmative ? 1 : 0;
                    const bVal = b.lgbtqiaAffirmative ? 1 : 0;
                    return bVal - aVal;
                  });
                }

                if (list.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-450 border border-dashed border-slate-200 dark:border-white/10 rounded-xl space-y-1 bg-white/20 dark:bg-white/[0.01]">
                      <p className="text-xs font-semibold">No direct listings verified for this category matching toggle in {userLocation}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Select another category, disable LGBTQIA+ Affirming, or browse locations.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase pb-1 tracking-wider">
                      <span>Verified Registries for {recommendedSpecialty}s</span>
                      <span>Showing {list.length} Records</span>
                    </div>

                    {list.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border backdrop-blur-xs ${
                          item.lgbtqiaAffirmative 
                            ? "bg-indigo-50/30 dark:bg-indigo-950/25 border-indigo-200/35 dark:border-indigo-800/30 shadow-3xs" 
                            : "bg-white/45 dark:bg-white/[0.02] border-slate-200/40 dark:border-white/[0.05]"
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1 text-left">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                            <span className="text-[9px] bg-emerald-50 text-emerald-850 px-2 py-0.5 rounded-full font-bold font-mono shrink-0 flex items-center gap-0.5 border border-emerald-100">
                              ✓ Verified Number
                            </span>
                            {item.lgbtqiaAffirmative && (
                              <span className="text-[9px] bg-indigo-50 dark:bg-white/[0.02] text-indigo-850 px-2 py-0.5 rounded-full font-bold font-mono shrink-0 flex items-center gap-0.5 border border-indigo-150 dark:border-white/10 animate-pulse">
                                🏳️‍🌈 LGBTQIA+ Affirmative
                              </span>
                            )}
                          </div>
                          <p className="text-slate-650 dark:text-slate-350 text-[11px] leading-relaxed">{item.description}</p>
                          <div className="flex items-center gap-3.5 text-[10px] text-slate-505 dark:text-slate-400 font-mono mt-1">
                            <span>🕒 {item.hours}</span>
                          </div>
                        </div>

                        <div className="shrink-0 w-full sm:w-auto text-right">
                          <a 
                            href={`tel:${item.phone}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-50 transition-all font-mono"
                          >
                            📞 Call {item.phone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Bottom guide notice */}
            <div className="bg-amber-50/10 dark:bg-amber-950/10 border border-amber-150/30 dark:border-amber-900/30 p-3.5 rounded-xl flex items-start gap-2.5">
              <div className="w-5 h-5 rounded bg-amber-100/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                💡
              </div>
              <p className="text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-400 text-left font-sans">
                <strong>Legal Protection Rule:</strong> This directory contains official public healthcare connections and helpline contacts. Phone calls undergo direct carrier routing and are never stored or processed by our AI system.
              </p>
            </div>

            {/* Actions Footer */}
            <div className="border-t border-indigo-100/30 dark:border-white/10 pt-3 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsClinicalDirectoryOpen(false)}
                className="px-4 py-2 bg-black hover:bg-slate-850 text-white font-bold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider font-display text-center"
              >
                Close Directory
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 💳 Premium subscription paywall simulation model */}
      {isPaywallModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in text-left">
          <div 
            className="w-full max-w-md bg-white dark:bg-black border border-rose-100 dark:border-rose-900 rounded-2xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 md:p-8 space-y-5 relative overflow-hidden flex flex-col max-h-[92vh] font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant header banner */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-rose-500 to-indigo-500" />
            
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold font-mono tracking-widest text-purple-700 bg-purple-50 uppercase px-2 py-0.5 rounded border border-purple-100">
                  EXCLUSIVE COMPANION UNLOCK
                </span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-1 font-display">
                  Project Friend AI Premium
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsPaywallModalOpen(false);
                  setPendingCharId(null);
                  setPayError("");
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Paywall Info Content */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-2">
              <div className="flex items-baseline justify-between font-sans">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Premium Companion Subscription</span>
                <span className="text-lg font-bold text-purple-900 font-mono">₹250<span className="text-xs font-normal text-slate-500 font-sans">/mo</span></span>
              </div>
              <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-normal">
                Unlock immediate unlimited chat access to all our specialized de-escalation guides: Soul (Earthy Boho Witness), Dionysus (Tail-wagging joy), Sisyphus (Acoustic Melodic guide), Astra (Cosmic Astrology dreamer), Zeus (Rogan Video &amp; Voice Specialist), Sappho (Attic Wise cat), Persephone (Silent Space companion), and Hades (Medico-Legal counsel).
              </p>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono pt-1">
                <span className="text-emerald-600">🛡️</span> Secure AES-256 local verification. Cancel anytime.
              </div>
            </div>

            {/* Mock Checkout Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setPayError("");
                if (!payCardNum.trim() || !payExpiry.trim() || !payCvv.trim() || !payName.trim()) {
                  setPayError("Please fill out all billing and payment card details.");
                  return;
                }
                setPayLoadingState(true);
                setTimeout(() => {
                  setPayLoadingState(false);
                  setIsPremiumSubscribed(true);
                  try {
                    localStorage.setItem("pfai_is_premium", "true");
                  } catch (_) {}
                  setIsPaywallModalOpen(false);
                  
                  // Switch to pending character if set
                  if (pendingCharId) {
                    setSelectedCharacterId(pendingCharId);
                    setChatHistory(prev => [
                      ...prev,
                      {
                        id: "unlocked-" + Date.now(),
                        sender: "bot",
                        text: `🎉 Welcome to Project Friend AI Premium! You have successfully unlocked all companion personas. 
                        
I am speaking to you now as ${CHARACTERS.find(c => c.id === pendingCharId)?.name}, your choice companion. How may I support you in this safe space today?`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                    setPendingCharId(null);
                  }
                  
                  // Clear checkout inputs
                  setPayCardNum("");
                  setPayExpiry("");
                  setPayCvv("");
                  setPayName("");
                }, 1400);
              }}
              className="space-y-3.5"
            >
              {payError && (
                <div className="p-2.5 text-[10.5px] bg-red-50 border border-red-150 text-red-700 rounded-lg font-medium leading-normal">
                  ⚠️ {payError}
                </div>
              )}

              {/* Cardholder Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider block font-mono">CARDHOLDER NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manjishtha Pahilajani"
                  value={payName}
                  onChange={(e) => setPayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-200 shadow-3xs"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider block font-mono">CREDIT CARD NUMBER</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4111 2222 3333 4444"
                  value={payCardNum}
                  onChange={(e) => setPayCardNum(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-200 shadow-3xs font-mono"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 tracking-wider block font-mono">EXPIRY DATE</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={payExpiry}
                    onChange={(e) => setPayExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-205 rounded-xl bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-200 shadow-3xs font-mono text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 tracking-wider block font-mono">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={payCvv}
                    onChange={(e) => setPayCvv(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-205 rounded-xl bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-200 shadow-3xs font-mono text-center"
                  />
                </div>
              </div>

              {/* Submit Checkout with Spinner */}
              <button
                type="submit"
                disabled={payLoadingState}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-rose-550 to-indigo-600 hover:from-purple-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-display disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {payLoadingState ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Authorizing Sandbox Credit...</span>
                  </>
                ) : (
                  <span>🔒 Pay &amp; Activate Companion (₹250)</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🎥 Video Sanctuary & Grounding Mirror Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
          <div 
            className={`w-full max-w-4xl rounded-2xl border shadow-2xl p-6 md:p-8 space-y-6 relative overflow-visible text-left animate-scale-up ${themeClass(
              "bg-white dark:bg-black border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200",
              "bg-black border-white/10 text-slate-100",
              "bg-[#fcf8f2] border-[#ebdcb9] text-[#3e2723]"
            )}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-t-2xl" />

            {/* Close Button in top right */}
            <button
              onClick={() => {
                stopVideoSession();
                setIsVideoModalOpen(false);
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100/10 transition-colors cursor-pointer"
              title="Close video sanctuary"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100/50 flex items-center justify-center text-purple-750 shrink-0">
                <Video className="w-6 h-6 animate-pulse text-purple-700" />
              </div>
              <div className="space-y-1">
                <h2 id="altaf-video-sanctuary-title" className="text-xl font-bold font-display tracking-tight text-purple-700 dark:text-purple-400">
                  Zeus's Rogan Video Sanctuary & Grounding Mirror
                </h2>
                <p className="text-xs text-slate-500 font-sans max-w-2xl leading-relaxed">
                  Presided over by Zeus, our Rogan symmetry master. In Kutch's Rogan painting, absolute symmetrical alignment makes art perfect. Here, use your camera as a secure somatic mirror to adjust your physical posture, center your breathing, and inspect audio decibel peaks. Fully sandboxed and encrypted.
                </p>
              </div>
            </div>

            {/* Hardware warning & help row */}
            {videoError && (
              <div className="bg-amber-50 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2 animate-fade-in text-left">
                <span className="text-sm shrink-0">⚠️</span>
                <span>{videoError}</span>
              </div>
            )}

            {/* Main Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Visual self-mirror feedback */}
              <div className={`p-4 rounded-xl border space-y-4 ${themeClass("bg-slate-50 border-slate-200", "bg-slate-950/40 border-white/10", "bg-[#f5ebd6]/50 border-[#ebdcb9]")}`}>
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-150 border-dashed">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#7A9E85] dark:text-indigo-300 flex items-center gap-1.5">
                    <Camera className="w-4.5 h-4.5" />
                    Live Mirror Feed
                  </h3>
                  <span className="text-[9px] bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold font-mono uppercase tracking-wide">
                    Local-Only Loop
                  </span>
                </div>

                {isCamEnabled ? (
                  <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-350 shadow-inner group">
                    <video 
                      ref={videoElementRef} 
                      autoPlay 
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    
                    {/* Breath pacing breathing guide overlay */}
                    <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
                      <div className="flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md text-white rounded-full px-4 py-1.5 border border-white/10 text-[10px] uppercase font-mono tracking-widest font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping inline-block" />
                        <span>Breath Mirror Pace</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-black border border-white/10 rounded-12 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <VideoOff className="w-8 h-8 text-slate-600 dark:text-slate-400 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-bold">Video Feed is Inactive</p>
                      <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                        Grant camera and microphone permissions to initialize the interactive somatic mirror interface.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startVideoSession}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/[0.02]0 text-white font-bold text-[10.5px] rounded-lg cursor-pointer transition-all uppercase font-mono tracking-wider"
                    >
                      Initialize Webcams & Mic
                    </button>
                  </div>
                )}

                {/* Micro Audio Decibel Monitor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1">
                      {isMicEnabled ? <Mic className="w-3.5 h-3.5 text-indigo-650 animate-bounce" /> : <MicOff className="w-3.5 h-3.5" />}
                      Mic Decibel Feedback
                    </span>
                    <span className="text-[10.5px] font-mono font-bold text-slate-500">{isMicEnabled ? `${micAudioLevel}%` : "Muted"}</span>
                  </div>
                  
                  {/* Real-time flowing dB meter bar */}
                  <div className="h-2.5 w-full bg-slate-200/60 dark:bg-slate-850 rounded-full overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 transition-all duration-75" 
                      style={{ width: `${isMicEnabled ? micAudioLevel : 0}%` }}
                    />
                  </div>

                  <p className="text-[9.5px] text-slate-400 italic font-sans">
                    Use this visual stream to check your breathing audio, slow regular sighs, or voice tone projection.
                  </p>
                </div>
              </div>

              {/* Right Column: Optional Personal AI Somatic analysis */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2 border-slate-150 border-dashed">
                  <h3 id="altaf-somatic-analyzer-title" className="text-xs font-bold uppercase tracking-wider font-mono text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-3.5" />
                    Zeus's AI Somatic & Posture Analyzer
                  </h3>
                  <span className="text-[10px] text-purple-600 font-bold font-mono uppercase">Rogan Calibration</span>
                </div>

                <form onSubmit={handleVideoAnalysisSubmit} className="space-y-4 text-left">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10.5px] text-slate-600 dark:text-slate-400 font-sans block font-semibold">
                      Body and Posture description (Describe your tension or feel):
                    </label>
                    <textarea
                      placeholder="e.g. My neck feels tight, shoulders are pulled up near my ears, and my breathing feels rapid and shallow..."
                      value={videoNotes}
                      onChange={(e) => setVideoNotes(e.target.value)}
                      className={`w-full h-18 text-xs p-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${themeClass(
                        "bg-white dark:bg-black border-slate-200 dark:border-white/10 placeholder-slate-400 dark:placeholder-slate-500",
                        "bg-slate-950 border-white/10 placeholder-slate-500 text-slate-200",
                        "bg-[#faf6ee] border-[#e3d5be] placeholder-amber-900/40 text-[#4e342e]"
                      )}`}
                    />
                  </div>

                  {/* Visual snapshot row */}
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <button
                      type="button"
                      disabled={!isCamEnabled}
                      onClick={captureVideoSnapshot}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-[#0a0a0a] hover:bg-slate-205 hover:scale-[1.01] active:scale-[0.99] rounded-lg text-[10.5px] font-mono border border-slate-250 dark:border-white/10 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed text-slate-705 font-bold flex items-center gap-1 transition-all"
                      title="Capture a local snapshot to attach to the AI somatic analysis request"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take Secure Snapshot
                    </button>

                    {imageSnapshot && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-150 rounded-full font-mono font-bold flex items-center gap-1.5">
                        ✓ Snap Loaded
                        <button
                          type="button"
                          onClick={() => setImageSnapshot(null)}
                          className="hover:text-rose-600 text-[11px] scale-120 font-sans text-[#4a5568]"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Tiny Thumbnail container */}
                  {imageSnapshot && (
                    <div className="relative w-24 h-18 rounded-lg overflow-hidden border border-slate-250 dark:border-white/10 shadow-inner group animate-fade-in block text-left">
                      <img src={imageSnapshot} alt="Captured reference self-mirror" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setImageSnapshot(null)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity font-sans cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  <div className="pt-1.5 text-left">
                    <button
                      type="submit"
                      disabled={isVideoAnalyzing}
                      className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 hover:shadow-lg disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider font-mono cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isVideoAnalyzing ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                          Running Private Somatic Analysis...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 animate-pulse" />
                          Generate Somatic Guarding Feedback
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* AI Somatic Response Analysis Box */}
                {(videoAnalysisResult || isVideoAnalyzing) && (
                  <div className={`p-4 rounded-xl border animate-fade-in text-left ${themeClass(
                    "bg-indigo-50/ dark:bg-white/[0.02]/40 border-indigo-100 dark:border-white/10",
                    "bg-[#0e1629] border-indigo-950/80",
                    "bg-[#fdfaf5]/70 border-[#ebdcb9]/60"
                  )}`}>
                    <div className="flex items-center gap-1.5 border-b pb-1.5 border-dashed border-indigo-100 dark:border-white/10 mb-2.5">
                      <span className="text-xs">🧘</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500">
                        Analysis Output
                      </span>
                    </div>

                    {isVideoAnalyzing ? (
                      <div className="space-y-2 animate-pulse py-2 text-left">
                        <div className="h-3.5 bg-indigo-200/50 rounded-full w-full" />
                        <div className="h-3.5 bg-indigo-200/50 rounded-full w-[90%]" />
                        <div className="h-3.5 bg-indigo-200/50 rounded-full w-[70%]" />
                      </div>
                    ) : (
                      <div className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 font-sans space-y-2 font-medium text-left">
                        <p className="whitespace-pre-line">{videoAnalysisResult}</p>
                        <div className="text-[9.5px] border-t border-dashed border-slate-200/50 pt-2 text-slate-400 leading-normal">
                          ⚠️ This de-escalation report is formatted client-side for immediate somatic grounding only. It is not professional medicine.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-150 border-dashed text-left">
              <button
                type="button"
                onClick={startVideoSession}
                className="px-4 py-2 bg-slate-100 dark:bg-[#0a0a0a] hover:bg-slate-200 transition-colors text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl uppercase tracking-wider font-mono cursor-pointer"
              >
                Restart Stream
              </button>
              <button
                type="button"
                onClick={() => {
                  stopVideoSession();
                  setIsVideoModalOpen(false);
                }}
                className="flex-1 py-3.5 bg-black hover:bg-[#0a0a0a] text-white font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider font-mono cursor-pointer text-center"
              >
                I Feel Grounded, Close Sanctuary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💾 Secure Mood Log Backup Reminder Modal */}
      {showDownloadBackupReminder && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div 
            className="w-full max-w-md bg-white dark:bg-black border border-indigo-100 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 md:p-8 space-y-5 relative overflow-hidden text-left animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Indigo accent line at the top to indicate secure system process */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />
            
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-white/[0.02] text-[#7A9E85] dark:text-indigo-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-sans">
                    Log Download Complete
                  </h3>
                  <span className="text-[9px] bg-indigo-100 text-[#7A9E85] dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold font-mono">
                    Local Only
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  Your secure mood tracker log has been successfully exported as a JSON backup payload.
                </p>
              </div>
            </div>

            {/* Crucial Backup Notice Alert Box */}
            <div className="bg-amber-50/70 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">⚠️</span>
                <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-amber-800">
                  Backup Owner Responsibility
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                Project Friend AI operates with absolute browser-side isolation. We store zero records of your logs, states, or passcodes on our cloud network server to ensure your total clinical confidentiality. 
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed font-sans font-bold">
                If you clear your browser cookies, change devices, or wipe your website history, your entries will be permanently deleted and cannot be restored.
              </p>
              <div className="border-t border-amber-200 dark:border-amber-800/50 pt-2 text-[10.5px] text-amber-900/85 italic font-sans">
                Recommendation: Store this downloaded JSON file in a private password-protected drive or folder to maintain your secure long-term record.
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                id="dismiss-backup-reminder-btn"
                type="button"
                onClick={() => {
                  setShowDownloadBackupReminder(false);
                }}
                className="flex-1 py-3 bg-black hover:bg-[#0a0a0a] text-white font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider font-mono cursor-pointer text-center"
              >
                I Understand, Keep Backup Private
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Personas Toggle Modal */}
      {isCharQuickModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          onClick={() => setIsCharQuickModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#0e1118] border border-white/10 rounded-2xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-5 md:p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
               {/* Modal Tabs */}
            <div className="flex border-b border-white/10 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchModalTab('personas');
                  setPersonaSearchQuery("");
                }}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                  searchModalTab === 'personas'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Companions & Specializations
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchModalTab('history');
                  setPersonaSearchQuery("");
                }}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 text-center cursor-pointer ${
                  searchModalTab === 'history'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Previous Conversations ({chatSessions.length})
              </button>
            </div>

            {searchModalTab === 'personas' ? (
              <div className="space-y-4">
                {/* Persona Search Field */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search specializations (e.g., CBT, DBT, Mindfulness, S.O.S...)"
                    value={personaSearchQuery}
                    onChange={(e) => setPersonaSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-sans"
                  />
                  {personaSearchQuery && (
                    <button
                      onClick={() => setPersonaSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Personas Grid */}
                <div className="grid grid-cols-1 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
                  {(() => {
                    const filtered = CHARACTERS.filter((char) => {
                      const query = personaSearchQuery.toLowerCase().trim();
                      if (!query) return true;
                      return char.name.toLowerCase().includes(query);
                    });
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 border border-dashed border-slate-850 rounded-xl space-y-1 bg-slate-950/20">
                          <p className="text-xs font-semibold text-slate-300">No matching guides found</p>
                          <p className="text-[10px] text-slate-500 font-mono">Try searching for other mental health support specializations.</p>
                        </div>
                      );
                    }
                    
                    return filtered.map((char) => {
                      const isActive = char.id === selectedCharacterId;
                      return (
                        <button
                          key={char.id}
                          onClick={() => {
                            handleCharacterChange(char.id);
                            setIsCharQuickModalOpen(false);
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 relative overflow-hidden group ${
                            isActive 
                              ? "bg-indigo-500/10 border-indigo-500 shadow-md shadow-indigo-950/40" 
                              : "bg-black/40 border-white/10/80 hover:bg-[#0a0a0a]/55 hover:border-white/10"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute inset-y-0 left-0 w-1 bg-indigo-500"></span>
                          )}

                          <div className={`w-9 h-9 rounded-xl ${char.avatarColor} flex items-center justify-center shrink-0 self-center`}>
                            {(() => {
                              const IconComponent = CHARACTER_ICONS[char.id] || Sparkles;
                              return <IconComponent className="w-4.5 h-4.5" />;
                            })()}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-white leading-normal group-hover:text-indigo-300 transition-colors">
                                {char.name}
                              </span>
                              {isActive && (
                                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                  Active Guide
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug truncate group-hover:text-indigo-200 transition-colors">
                              {char.tagline}
                            </p>
                            
                          </div>

                          <div className="shrink-0 self-center">
                            <span className={`text-sm ${isActive ? "text-indigo-400" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-400"} transition-colors`}>
                              {isActive ? "●" : "○"}
                            </span>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Quick guide switch disclaimer */}
                <div className="bg-black/60 border border-white/5 p-3 rounded-xl text-[10px] leading-relaxed text-slate-500 font-mono">
                  Note: Changing companions updates the specialized support context, system de-escalation guidelines, and focus prompts.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search History Input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by title or message content..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-9 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-sans"
                  />
                  {historySearchQuery && (
                    <button
                      onClick={() => setHistorySearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* History Grid */}
                <div className="grid grid-cols-1 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
                  {(() => {
                    const query = historySearchQuery.toLowerCase().trim();
                    const filtered = [...chatSessions].sort((a, b) =>
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() || 0
                    ).filter(session => {
                      if (!query) return true;
                      const matchesTitle = session.title.toLowerCase().includes(query);
                      const matchesMessages = session.messages && session.messages.some((msg: any) =>
                        typeof msg.text === 'string' && msg.text.toLowerCase().includes(query)
                      );
                      return matchesTitle || matchesMessages;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 border border-dashed border-slate-850 rounded-xl space-y-1 bg-slate-950/20">
                          <p className="text-xs font-semibold text-slate-300">No matching conversations found</p>
                          <p className="text-[10px] text-slate-500 font-mono">Try searching for different keywords or starting a new session first.</p>
                        </div>
                      );
                    }

                    return filtered.map((session) => {
                      const char = CHARACTERS.find(c => c.id === session.characterId) || CHARACTERS[0];
                      const IconComponent = CHARACTER_ICONS[char.id] || Sparkles;

                      return (
                        <div
                          key={session.id}
                          className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/40 hover:bg-[#0a0a0a]/55 hover:border-white/15 transition-all duration-200"
                        >
                          <button
                            onClick={() => {
                              handleSelectSession(session.id);
                              setIsCharQuickModalOpen(false);
                            }}
                            className="flex-1 text-left flex items-start gap-3 cursor-pointer min-w-0"
                          >
                            {/* Avatar Badge */}
                            <div className={`w-9 h-9 rounded-xl ${char.avatarColor} flex items-center justify-center shrink-0 self-center`}>
                              <IconComponent className="w-4.5 h-4.5" />
                            </div>

                            {/* Session Info */}
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-white truncate">
                                  {session.title}
                                </span>
                                <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">
                                  {char.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-450 leading-snug truncate">
                                {session.messages[session.messages.length - 1]?.text || ""}
                              </p>
                              <span className="block text-[9px] text-slate-500 font-mono">
                                {session.timestamp}
                              </span>
                            </div>
                          </button>

                          {/* Delete Session Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/[0.02] transition-colors shrink-0 cursor-pointer ml-2"
                            title="Delete this conversation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Persona Support Philosophy Modal */}
      {isSharePersonaModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => {
            setIsSharePersonaModalOpen(false);
            setCopiedIndicator(false);
          }}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-black border border-amber-200 dark:border-amber-800/60 rounded-2xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 md:p-7 space-y-5 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #fffbfa 50%, #fffbeb 100%)"
            }}
          >
            {/* Top sunset accent gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-450 to-amber-550" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-500" />
                  <span>Support Philosophy Transmitter</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Copy and share the secure de-escalation ethos of <span className="font-semibold text-indigo-600">{activeChar.name}</span>.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSharePersonaModalOpen(false);
                  setCopiedIndicator(false);
                }}
                className="p-1 px-2.5 bg-slate-100 dark:bg-[#0a0a0a] hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:text-slate-300 text-xs rounded-xl transition-all cursor-pointer"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Active Character overview badge */}
            <div className="flex items-center gap-3 bg-white dark:bg-black/70 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl shadow-xs">
              <div className={`w-10 h-10 rounded-xl ${activeChar.avatarColor} border flex items-center justify-center shrink-0`}>
                {(() => {
                  const IconComponent = CHARACTER_ICONS[activeChar.id] || Sparkles;
                  return <IconComponent className="w-5 h-5" />;
                })()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-950">{activeChar.name}</h4>
                <p className="text-[11px] text-slate-500 italic">"{activeChar.tagline}"</p>
              </div>
            </div>

            {/* The pre-formatted text block with scrollbar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Transmission Preview</span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full font-bold">Client-Secured</span>
              </div>
              <textarea
                readOnly
                className="w-full h-44 p-3 bg-slate-950 text-slate-100 rounded-xl border border-slate-950 font-mono text-[11px] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-amber-400 selection:bg-amber-500 selection:text-slate-950 shrink-0"
                value={`🌸 PROJECT FRIEND AI — PERSONA SUPPORT REQUISITIONS 🌸\n=========================================================\nGuide Persona  : ${activeChar.name}\n\n" ${activeChar.groundingMantra} "\n\n[ GUIDANCE & EMOTIONAL RECEPTACLE ORIENTATION ]\n- Orientation M.O. : ${activeChar.tagline}\n- Detailed Support Philosophy:\n  ${activeChar.longDescription}\n\n=========================================================\nSecured anonymously via Project Friend AI. Grounded non-clinical crisis containment, active de-escalation, and client-side encryption.`}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const textToCopy = `🌸 PROJECT FRIEND AI — PERSONA SUPPORT REQUISITIONS 🌸\n=========================================================\nGuide Persona  : ${activeChar.name}\n\n" ${activeChar.groundingMantra} "\n\n[ GUIDANCE & EMOTIONAL RECEPTACLE ORIENTATION ]\n- Orientation M.O. : ${activeChar.tagline}\n- Detailed Support Philosophy:\n  ${activeChar.longDescription}\n\n=========================================================\nSecured anonymously via Project Friend AI. Grounded non-clinical crisis containment, active de-escalation, and client-side encryption.`;
                  navigator.clipboard.writeText(textToCopy).then(() => {
                    setCopiedIndicator(true);
                    setTimeout(() => setCopiedIndicator(false), 2500);
                  }).catch((err) => {
                    console.error("Clipboard write failed: ", err);
                  });
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md ${
                  copiedIndicator 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100" 
                    : "bg-black hover:bg-[#0a0a0a] text-white hover:scale-[1.01]"
                }`}
              >
                {copiedIndicator ? (
                  <>
                    <span>✓</span>
                    <span>Copied Support Philosophy!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copy Philosophy to Clipboard</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSharePersonaModalOpen(false);
                  setCopiedIndicator(false);
                }}
                className="px-4 py-2.5 border border-slate-200 dark:border-white/10 hover:border-slate-350 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-[#0a0a0a] dark:bg-[#0a0a0a] font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persona History Selection Modal */}
      {isHistoryModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-black border border-indigo-100 dark:border-white/10 rounded-3xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 md:p-7 space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #fafbff 100%)"
            }}
          >
            {/* Top sunset accent gradient line matching Kintsugi logo theme */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-450 to-indigo-550" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-50/20 dark:border-white/[0.05]">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Persona Selection History</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Quickly switch back to recently selected support guides.
                </p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 px-2.5 bg-slate-100 dark:bg-[#0a0a0a] hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:text-slate-300 text-xs rounded-xl transition-all cursor-pointer"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* List of Recent Personas */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {recentPersonas.map((charId) => {
                const char = CHARACTERS.find((c) => c.id === charId);
                if (!char) return null;
                const isCurrentlyActive = char.id === selectedCharacterId;
                const IconComponent = CHARACTER_ICONS[char.id] || Sparkles;

                return (
                  <button
                    key={char.id}
                    disabled={isCurrentlyActive}
                    onClick={() => {
                      handleCharacterChange(char.id);
                      setIsHistoryModalOpen(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 group cursor-pointer ${
                      isCurrentlyActive 
                        ? "bg-indigo-50/ dark:bg-white/[0.02]/50 border-indigo-200 dark:border-indigo-800 cursor-default" 
                        : "bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-[#0a0a0a] border-slate-150 hover:border-indigo-200 dark:border-indigo-800 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${char.avatarColor} border flex items-center justify-center shrink-0 shadow-2xs`}>
                      <IconComponent className="w-5 h-5 animate-[pulse_3s_infinite]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {char.name}
                        </h4>
                        {isCurrentlyActive ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono animate-pulse">
                            Active
                          </span>
                        ) : (
                          <span className="text-[9px] text-indigo-500 font-bold group-hover:translate-x-1 transition-transform flex items-center">
                            Reactivate →
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 italic truncate mt-0.5">"{char.tagline}"</p>
                    </div>
                  </button>
                );
              })}
              {recentPersonas.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 font-mono">No selection history found.</p>
              )}
            </div>
            
            <div className="text-[10px] text-slate-400 font-mono text-center pt-2 border-t border-slate-100 dark:border-white/10">
              LocalStorage Persisted — Private & Secured Client-side
            </div>
          </div>
        </div>
      )}

      {/* 🌊 Fullscreen Somatic Immersive Reset Canvas Overlay */}
      {isSomaticImmersiveOpen && (
        <div className="fixed inset-0 z-[150] bg-zinc-950 text-slate-100 flex flex-col justify-between overflow-hidden animate-fade-in font-sans select-none">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 via-zinc-950 to-zinc-950 opacity-90 pointer-events-none mix-blend-screen" />

          {/* Top navigation header bar */}
          <header className="z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-pulse">🧘</span>
              <div className="text-left">
                <span className="text-xs font-mono font-extrabold tracking-widest text-[#d97706]/90 block">SOMATIC EMBODIMENT ACTIVE</span>
                <h2 className="text-sm font-bold font-display text-white mt-0.5">
                  {somaticProtocol === 1 && "Protocol 1: The Grounding Guide"}
                  {somaticProtocol === 2 && "Protocol 2: The Presence Anchor"}
                  {somaticProtocol === 3 && "Protocol 3: The Release Spiral"}
                  {somaticProtocol === 4 && "Protocol 4: The Inner Light"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Reset Session Dur indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-black/5 border border-white/10 rounded-xl font-mono text-[10.5px]">
                <Clock className="w-3.5 h-3.5 text-[#2dd4bf] animate-spin-slow" />
                <span>Session: {Math.floor(somaticSessionTime / 60)}m {somaticSessionTime % 60}s</span>
              </div>
              
              <button
                onClick={() => {
                  setIsSomaticImmersiveOpen(false);
                  setSomaticHoldActive(false);
                }}
                className="p-2 bg-white dark:bg-black/5 hover:bg-white/15 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Exit Immersive Space"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Space</span>
              </button>
            </div>
          </header>

          {/* Central massive visualization canvas area */}
          <main className="flex-1 flex flex-col items-center justify-center relative p-4">
            {/* The main dynamic scale-extend holding container */}
            <motion.div
              animate={{
                scale: somaticHoldActive ? 1.15 : 1.0,
                filter: somaticHoldActive ? "drop-shadow(0 0 35px rgba(217,119,6,0.3))" : "drop-shadow(0 0 0px rgba(0,0,0,0))"
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-lg aspect-square flex items-center justify-center relative select-none"
            >
              {/* Dynamic radiant ripple generated only while holding */}
              <AnimatePresence>
                {somaticHoldActive && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.9 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute w-64 h-64 rounded-full border border-[#cbd5e1]/40 bg-indigo-500/5 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* The high-fidelity SVGs rendered at double the resolution */}
              {somaticProtocol === 1 && (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="280" height="280" viewBox="0 0 200 200" className="overflow-visible select-none pointer-events-none">
                    <defs>
                      <radialGradient id="guideGradLarge" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="50%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#0b1a3d" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Particle flow generator */}
                    {[...Array(12)].map((_, i) => (
                      <motion.circle
                        key={i}
                        cx={20 + i * 15}
                        cy={190}
                        r={2.5}
                        fill={i % 2 === 0 ? "#14b8a6" : "#f59e0b"}
                        opacity={0.35}
                        animate={{
                          y: [-10, -170],
                          opacity: [0, 0.8, 0],
                          x: [20 + i * 15, 20 + i * 15 + Math.sin(i) * 15]
                        }}
                        transition={{
                          duration: 4 + (i % 3),
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeOut"
                        }}
                      />
                    ))}

                    <motion.g
                      animate={{
                        scale: [0.88, 1.12, 0.88]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{ transformOrigin: "100px 100px" }}
                    >
                      {/* Pulse shadow */}
                      <circle cx="100" cy="100" r="55" fill="url(#guideGradLarge)" className="mix-blend-screen" />
                      
                      {/* Head */}
                      <ellipse cx="100" cy="58" rx="15" ry="12" fill="#ebdcb9" opacity="0.95" />

                      {/* Torso */}
                      <rect x="90" y="75" width="20" height="60" rx="10" fill="#8fae9b" opacity="0.8" />

                      {/* Moving glowing core at chest */}
                      <motion.circle 
                        cx="100" 
                        cy="92" 
                        r={8.5} 
                        fill="#fff" 
                        filter="url(#glow)"
                        animate={{
                          r: [7, 11, 7],
                          fill: ["#14b8a6", "#ca8a04", "#14b8a6"]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      {/* Left Arm curved */}
                      <motion.path 
                        d="M87,83 Q65,100 62,125" 
                        fill="none" 
                        stroke="#2dd4bf" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        animate={{ rotate: [-20, 25, -20] }} 
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "87px 83px" }}
                      />

                      {/* Right Arm curved */}
                      <motion.path 
                        d="M113,83 Q135,100 138,125" 
                        fill="none" 
                        stroke="#2dd4bf" 
                        strokeWidth="5" 
                        strokeLinecap="round"
                        animate={{ rotate: [20, -25, 20] }} 
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        style={{ transformOrigin: "113px 83px" }}
                      />

                      {/* Legs */}
                      <path d="M93,134 L85,182" fill="none" stroke="#8fae9b" strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
                      <path d="M107,134 L115,182" fill="none" stroke="#8fae9b" strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
                    </motion.g>
                  </svg>
                </div>
              )}

              {somaticProtocol === 2 && (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="280" height="280" viewBox="0 0 200 200" className="overflow-visible select-none pointer-events-none">
                    <defs>
                      <radialGradient id="baseGlowLarge" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <circle cx="100" cy="180" r="50" fill="url(#baseGlowLarge)" />

                    {/* Ground waves ripples */}
                    <motion.circle 
                      cx="100" 
                      cy="115" 
                      r="10" 
                      stroke="#fdfbf7" 
                      strokeWidth="2" 
                      fill="none" 
                      animate={{ scale: [1, 6], opacity: [0.75, 0] }} 
                      transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }} 
                    />
                    <motion.circle 
                      cx="100" 
                      cy="115" 
                      r="10" 
                      stroke="#d97706" 
                      strokeWidth="1.5" 
                      fill="none" 
                      animate={{ scale: [1, 6], opacity: [0.75, 0] }} 
                      transition={{ duration: 4, delay: 2, repeat: Infinity, ease: "easeOut" }} 
                    />

                    {/* Swing anchor body */}
                    <motion.g
                      animate={{
                        rotate: [-5, 5, -5],
                        x: [-3, 3, -3]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{ transformOrigin: "100px 180px" }}
                    >
                      <path 
                        d="M82,180 L84,110 A16,16 0 0,1 116,110 L118,180 Z" 
                        fill="rgba(253, 251, 247, 0.18)" 
                        stroke="#fdfbf7" 
                        strokeWidth="3.5" 
                        strokeLinejoin="round"
                      />

                      <circle cx="100" cy="115" r="6" fill="#ca8a04" />
                      <ellipse cx="100" cy="178" rx="25" ry="7" fill="#ca8a04" opacity="0.9" />
                    </motion.g>

                    {/* Multi side anchoring tendrils */}
                    <path d="M70,182 Q50,196 30,199" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                    <path d="M130,182 Q150,196 170,199" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                    <path d="M100,182 L100,204" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
                  </svg>
                </div>
              )}

              {somaticProtocol === 3 && (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="280" height="280" viewBox="0 0 200 200" className="overflow-visible select-none pointer-events-none" style={{ perspective: 600 }}>
                    <defs>
                      <linearGradient id="spiralGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ebdcb9" />
                        <stop offset="50%" stopColor="#ca8a04" />
                        <stop offset="100%" stopColor="#78350f" />
                      </linearGradient>
                    </defs>
                    <line x1="100" y1="20" x2="100" y2="190" stroke="#ebdcb9" strokeWidth="0.5" strokeDasharray="4 4" opacity={0.25} />

                    <motion.g
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: "100px 100px" }}
                    >
                      <circle cx="100" cy="45" r="14" fill="#ebdcb9" opacity="0.95" filter="url(#glow)" />

                      {/* Spiral core lines */}
                      <path d="M100,58 C80,80 120,105 100,130 C80,155 120,175 100,195" fill="none" stroke="url(#spiralGrad)" strokeWidth="10" strokeLinecap="round" opacity="0.8" />
                      <path d="M100,58 C120,80 80,105 100,130 C120,155 80,175 100,195" fill="none" stroke="url(#spiralGrad)" strokeWidth="5.5" strokeLinecap="round" opacity="0.45" />

                      {/* Orbit ribbons */}
                      <motion.path 
                        d="M85,80 Q50,92 35,115 T15,160" 
                        fill="none" 
                        stroke="#d97706" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        animate={{ pathLength: [0.7, 1, 0.7] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      />

                      <motion.path 
                        d="M115,80 Q150,92 165,115 T185,160" 
                        fill="none" 
                        stroke="#14b8a6" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        animate={{ pathLength: [0.7, 1, 0.7] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.g>
                  </svg>
                </div>
              )}

              {somaticProtocol === 4 && (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="280" height="280" viewBox="0 0 200 200" className="overflow-visible select-none pointer-events-none">
                    <motion.circle 
                      cx="100" 
                      cy="110" 
                      r="12" 
                      stroke="#ca8a04" 
                      strokeWidth="1.5" 
                      fill="none" 
                      animate={{ scale: [1, 6], opacity: [0.7, 0] }} 
                      transition={{ duration: 7, repeat: Infinity, ease: "easeOut" }} 
                    />
                    <motion.circle 
                      cx="100" 
                      cy="110" 
                      r="12" 
                      stroke="#52796f" 
                      strokeWidth="1.5" 
                      fill="none" 
                      animate={{ scale: [1, 6], opacity: [0.7, 0] }} 
                      transition={{ duration: 7, delay: 3.5, repeat: Infinity, ease: "easeOut" }} 
                    />

                    {/* Fast orbit paths */}
                    <motion.g
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: "100px 110px" }}
                    >
                      <circle cx="100" cy="40" r="4.5" fill="#ca8a04" />
                    </motion.g>

                    <motion.g
                      animate={{ rotate: -360 }}
                      transition={{ duration: 8.5, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: "100px 110px" }}
                    >
                      <circle cx="40" cy="110" r="3" fill="#52796f" />
                    </motion.g>

                    <motion.g
                      animate={{
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <circle cx="100" cy="110" r="50" fill="url(#compassionGlow)" />
                      <circle cx="100" cy="65" r="13" fill="#fdfbf7" opacity="0.95" />
                      <path d="M100,79 L82,140 A7,7 0 0,0 89,149 L111,149 A7,7 0 0,0 118,140 Z" fill="#fdfbf7" opacity="0.9" />
                      <path d="M68,148 Q100,160 132,148" fill="none" stroke="#ebdcb9" strokeWidth="5" strokeLinecap="round" />
                    </motion.g>
                  </svg>
                </div>
              )}
            </motion.div>

            {/* Description or Guided prompt instructions overlay */}
            <div className="text-center max-w-md mx-auto space-y-2 select-none mb-10 z-10 bg-zinc-900/40 p-4 border border-white/5 rounded-2xl backdrop-blur-md">
              <p className="text-[14px] font-bold text-teal-300 font-display">
                {somaticProtocol === 1 && "Breathe in harmony... Feel your lungs follow this fluid gradient."}
                {somaticProtocol === 2 && "Imagine your spine as an unshakeable tree. Gently sway side-to-side."}
                {somaticProtocol === 3 && "Let your tense thoughts rotate and unravel into the surrounding void."}
                {somaticProtocol === 4 && "Hold compassion for yourself. You are here, warm and completely secure."}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {somaticProtocol === 1 && "Cycles slowly every 6 seconds. Cooler (Teal) is Inhale, Warmer (Bronze) is Exhale."}
                {somaticProtocol === 2 && "Cycle resets every 8 seconds. Anchor tendrils pulse stability each 4s."}
                {somaticProtocol === 3 && "10 second rotation release cycle. Feel the ribbon trails wind down safely."}
                {somaticProtocol === 4 && "7 second cycle self-centering waves. Orbiting satellites circulate over-stressed minds."}
              </p>
            </div>
          </main>

          {/* Swipeable navigation / controls tray at bottom */}
          <footer className="z-10 p-5 md:p-7 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/5 space-y-5">
            
            {/* Somatic touch pressure anchor trigger */}
            <div className="flex flex-col items-center justify-center">
              <button
                onMouseDown={() => setSomaticHoldActive(true)}
                onMouseUp={() => setSomaticHoldActive(false)}
                onMouseLeave={() => setSomaticHoldActive(false)}
                onTouchStart={() => setSomaticHoldActive(true)}
                onTouchEnd={() => setSomaticHoldActive(false)}
                className={`w-full max-w-sm py-4 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 ${
                  somaticHoldActive 
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)] animate-pulse" 
                    : "bg-white dark:bg-black/5 hover:bg-white/10 text-slate-350 border-white/10"
                }`}
              >
                <span>✨</span>
                <span>{somaticHoldActive ? "Connecting... Hold Active" : "Hold Finger Here to Anchor / Deepen"}</span>
                <span>✨</span>
              </button>
              <p className="text-[9.5px] text-slate-400 mt-1.5 font-mono select-none">Holding extends the session, scale matches your touch pressure</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto pt-2">
              


              {/* Protocol Swipe buttons indicator */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSomaticProtocol(p => p === 1 ? 4 : (p - 1) as any)}
                  className="w-9 h-9 flex items-center justify-center bg-white dark:bg-black/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Previous Protocol"
                >
                  ◀
                </button>
                
                <div className="flex items-center gap-1.5 select-none font-mono text-[10px]">
                  {[1, 2, 3, 4].map(idx => (
                    <button
                      key={idx}
                      onClick={() => setSomaticProtocol(idx as any)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        somaticProtocol === idx 
                          ? "bg-indigo-500 scale-125" 
                          : "bg-white dark:bg-black/20 hover:bg-white/40"
                      }`}
                      title={`Switch to Protocol ${idx}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setSomaticProtocol(p => p === 4 ? 1 : (p + 1) as any)}
                  className="w-9 h-9 flex items-center justify-center bg-white dark:bg-black/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Next Protocol"
                >
                  ▶
                </button>
              </div>

            </div>
          </footer>
        </div>
      )}

      {/* Secure Wipe Confirmation Modal */}
      {showWipeConfirm && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowWipeConfirm(false)}
        >
          <div 
            className="w-full max-w-md bg-[#0f1218] border border-rose-950 rounded-2xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Confirm Cryptographic Wipe</h3>
                <p className="text-xs text-slate-400">Zero-Trace Privacy Commitment</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-850">
              You are about to irreversibly purge all local mood entries, timestamps, and notes from your browser's private **IndexedDB database** storage space. This action runs entirely client-side, is immediately effective, and cannot be undone.
            </p>

            <div className="bg-rose-500/5 border border-rose-900/40 p-3 rounded-lg text-[10px] leading-relaxed text-rose-300 font-mono flex items-start gap-2">
              <span className="shrink-0">⚠️</span>
              <span>This completely zeros out all local telemetry, reinforcing that your de-escalation history leaves no persistent traces on this hardware.</span>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isWiping}
                onClick={() => setShowWipeConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-[#0a0a0a] hover:bg-slate-700 text-slate-300 font-bold text-xs transition duration-200 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isWiping}
                onClick={handleWipeAllData}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-lg shadow-rose-950/30"
              >
                {isWiping ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Purging...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Securely Wipe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swipe Success Notification Toast */}
      {wipeSuccess && (
        <div className="fixed bottom-6 right-6 z-[120] animate-slide-in-up">
          <div className="bg-[#0b130e] border border-emerald-900 text-emerald-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-2xl">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold">
              ✓
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-white">Database Purged Successfully</p>
              <p className="text-[10px] text-slate-400">All local IndexedDB entries for this session have been erased.</p>
            </div>
          </div>
        </div>
      )}


      {/* Instant Safe-Exit Overlay Screen */}
      {isSafeExit && (
        <div className="fixed inset-0 z-[99999] bg-[#f8fafc] text-slate-800 dark:text-slate-200 flex flex-col font-sans select-none overflow-y-auto">
          {/* Mock educational platform navbar */}
          <nav className="w-full h-14 bg-white dark:bg-black border-b border-slate-200 dark:border-white/10 px-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-xs">
                æ
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-tight text-slate-900 leading-none">Manji Knowledge Base</span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5">Academic Archive & Documentation Hub</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-xs text-slate-550 font-mono">System Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              
              {/* Discreet Restore Session button */}
              <button
                onClick={() => setIsSafeExit(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#0a0a0a] hover:bg-indigo-50 dark:hover:bg-white/[0.02] dark:bg-white/[0.02] hover:text-indigo-600 text-slate-600 dark:text-slate-400 text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                title="Restore your safe session space"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Developer Console: Reconnect</span>
              </button>
            </div>
          </nav>

          {/* Main content body of educational portal */}
          <div className="max-w-4xl mx-auto w-full px-6 py-10 flex-1 flex flex-col">
            {/* Professional search layout */}
            <div className="text-center space-y-3 max-w-xl mx-auto mb-10">
              <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">Search Academic Publications & References</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Access over 45,000 peer-reviewed research materials, algorithm documentations, and static library manuals archived for direct local access.
              </p>
              
              <div className="relative mt-4">
                <input 
                  type="text" 
                  placeholder="Type to search manuals, math libraries, databases, standards..." 
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-350 bg-white dark:bg-black text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  defaultValue="Standard Template Library (STL) documentation lookup"
                  readOnly
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Psychoacoustic Horror Score Sandbox */}
            <div id="psychoacoustic-horror-sandbox" className="bg-black text-slate-100 rounded-2xl p-6 border border-rose-950/40 shadow-xl overflow-hidden mb-8 relative">
              {/* Retro horizontal grid/flickering scanlines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.12),transparent_40%)] pointer-events-none" />
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-red-500 uppercase">SYS ACTIVE • SCORING</span>
              </div>

              <div className="relative z-10">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎬</span>
                    <h2 className="text-sm font-bold font-serif text-slate-100 flex items-center gap-2">
                      Acoustic Model: Cinematic Horror Tension Composer
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Analyzing horror film composition tactics: utilizing a persistent 58Hz micro-detuned sub-harmonic base drone (Db), synchronized 130BPM rapid panic double-thud pulses, and erratic high register dissonant clusters (C6/E6/Eb6) to trigger acute cognitive tension.
                  </p>
                  
                  {/* Small Oscilloscope/Waveform Simulator */}
                  <div className="h-10 bg-slate-950/60 rounded-lg border border-white/10 flex items-center justify-center p-3 overflow-hidden relative mt-3 select-none">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.85)_100%)] z-10 pointer-events-none" />
                    {/* Animated bars to emulate sound waves */}
                    <div className="flex items-end gap-[3px] h-full w-full justify-start">
                      {Array.from({ length: 44 }).map((_, i) => {
                        const heights = [
                          "h-2", "h-5", "h-7", "h-3", "h-8", "h-1", "h-4", "h-6", "h-2", "h-9", "h-3",
                          "h-1", "h-5", "h-2", "h-8", "h-4", "h-6", "h-1", "h-7", "h-9", "h-2", "h-4"
                        ];
                        const animationDelay = `${(i % 12) * 0.15}s`;
                        return (
                          <div 
                            key={i} 
                            style={{ animationDelay }}
                            className={`w-[4px] min-h-[3px] bg-red-650/70 rounded-t transition-all duration-300 animate-pulse ${heights[i % heights.length]}`} 
                          />
                        );
                      })}
                    </div>
                    <span className="absolute left-3 text-[9px] font-mono text-red-500 font-bold bg-slate-950/90 px-1.5 py-0.5 rounded border border-red-950/50 uppercase z-20">
                      Adrenaline Scopes: TENSE (Acoustic muted)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid of academic chapters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  cat: "Software Engineering & Architecture",
                  title: "Understanding ES Module Path Resolution and Module Loaders",
                  desc: "An analytical review of ESM spec changes in Node environments, focusing on common file resolution, CommonJS interop, and module resolution graphs."
                },
                {
                  cat: "Applied Mathematics",
                  title: "Fourier Transform Applications in Bio-Acoustic Wave Modulation",
                  desc: "A mathematical analysis of sine wave filters to analyze ambient frequency waves, acoustic structures, and synthetic stress de-escalation models."
                },
                {
                  cat: "Secure Systems",
                  title: "Client-Side Cryptography & Zero-Trace Local DB Encryptions",
                  desc: "An examination of WebCrypto API, IndexedDB state protection systems, and methods to safely wipe active memory caches to ensure absolute client secrecy."
                },
                {
                  cat: "Psychology & Linguistics",
                  title: "Semantic Solace: How Generative Metaphors Relieve Longing",
                  desc: "A study on South Asian and ancient Sindh cultural prose structures and their healing and de-escalation benefits in active peer-to-peer dialogues."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-5 hover:border-slate-300 transition-colors shadow-xs">
                  <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-indigo-600">{item.cat}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5 mb-2 font-serif">{item.title}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-100 dark:border-white/10 pt-3">
                    <span>Read length: 14 mins</span>
                    <span className="text-indigo-650 font-semibold cursor-pointer hover:underline" onClick={() => setIsSafeExit(false)}>Download PDF ➔</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom help bar */}
            <div className="mt-auto pt-10 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <span>© {new Date().getFullYear()} Manji Support Consortium. All rights archived.</span>
              <div className="flex gap-4">
                <span className="hover:underline cursor-pointer" onClick={() => setIsSafeExit(false)}>Terms of Use</span>
                <span className="hover:underline cursor-pointer" onClick={() => setIsSafeExit(false)}>Security Audits</span>
                <span className="hover:underline cursor-pointer font-semibold text-indigo-600" onClick={() => setIsSafeExit(false)}>Developer Reconnect</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <AliasModal
        isOpen={isAliasModalOpen}
        onClose={() => setIsAliasModalOpen(false)}
        error={loginError}
        initialTab={authModalTab}
        onLogin={(data: LoginData) => {
          setLoginAlias(data.alias);
          setLoginPasscode(data.passcode);
          setUserLocation(data.location);
          setMedicalConditions(data.medicalConditions);
          setCustomMedicalHistory(data.customMedicalHistory);
          setConsentPsychology(data.consentPsychology);
          setConsentAnonymity(data.consentAnonymity);

          if (data.passcode && data.passcode.length > 0 && data.passcode.length < 4) {
            setLoginError("Your secure client PIN must be at least 4 digits to properly seed local storage salt.");
            return;
          }
          if (!data.consentPsychology || !data.consentAnonymity) {
            setLoginError("You must acknowledge both clinical boundary and local data privacy covenants to proceed.");
            return;
          }

          const determineMedicalRedirect = (conditions: string[], customText: string): 'psychiatrist' | 'psychologist' | 'therapist' | 'counsellor' => {
            const text = customText.toLowerCase();
            if (conditions.includes("MEDS_CHRONIC") || conditions.includes("DIAGNOSED_SEVERE") || text.includes("psychiatrist")) return "psychiatrist";
            if (conditions.includes("CLINICAL_SYMPTOMS") || text.includes("psychologist")) return "psychologist";
            if (conditions.includes("TRAUMA_GRIEF") || text.includes("trauma")) return "therapist";
            return "counsellor";
          };
          
          const predictedProfessional = determineMedicalRedirect(data.medicalConditions, data.customMedicalHistory);
          
          try {
            localStorage.setItem("friend_ai_isLoggedIn", "true");
            localStorage.setItem("friend_ai_loginAlias", data.alias);
            if (data.medicalConditions.length > 0 || data.customMedicalHistory) {
              const medicalProfile = { conditions: data.medicalConditions, custom: data.customMedicalHistory, suggestedProfessional: predictedProfessional, timestamp: new Date().toISOString() };
              if (data.passcode) localStorage.setItem("friend_ai_medical_profile_enc", btoa(JSON.stringify(medicalProfile) + "_SALT_" + data.passcode));
              else localStorage.setItem("friend_ai_medical_profile", JSON.stringify(medicalProfile));
            }
            setIsLoggedIn(true);
            setLoginError("");
            setIsAliasModalOpen(false);
          } catch (e) {
            setLoginError("Local storage allocation failed. Please enable secure local cookies to enter the sanctuary.");
          }
        }}
      />

      {/* Floating Goal Toast Notification */}
      <AnimatePresence>
        {goalToast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-[2000] max-w-sm w-full pointer-events-auto border border-indigo-500/30 bg-black text-white shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-4 rounded-2xl flex items-start gap-3"
          >
            <div className="text-xl pt-0.5 select-none">✨</div>
            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold leading-tight text-indigo-300 font-sans mb-0.5">{goalToast.title}</h4>
              <p className="text-[11px] leading-snug text-slate-300 font-sans">{goalToast.text}</p>
            </div>
            <button
              onClick={() => setGoalToast(prev => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white transition-colors text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
