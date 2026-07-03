import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '');
}

app.use(express.json());

// Enable CORS for frontend requests (e.g. Netlify)
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://friend-ai-app.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
  ];
  const origin = req.headers.origin;
  if (origin) {
    if (allowedOrigins.includes(origin) || origin.endsWith(".netlify.app")) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  
  if (process.env.ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Phase 7: Security Hardening (Helmet & Rate Limiting)
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite needs inline scripts for HMR
    crossOriginEmbedderPolicy: false,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);

// Initialize server-side Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Rate-limiting circuit-breaker to safeguard the free tier (20 requests/day) Gemini API
let isGeminiRateLimited = false;
let rateLimitResetTime = 0;

function checkGeminiRateLimit(): boolean {
  if (isGeminiRateLimited) {
    if (Date.now() > rateLimitResetTime) {
      isGeminiRateLimited = false;
      return true;
    }
    return false;
  }
  return true;
}

function handleGeminiRateLimit(error: any, contextLabel: string) {
  const errMsg = typeof error === "string" ? error : String(error?.stack || error?.message || JSON.stringify(error) || error || "");
  
  const is429 = errMsg.includes("429") || 
                errMsg.toUpperCase().includes("QUOTA") || 
                errMsg.toUpperCase().includes("LIMIT") || 
                errMsg.toUpperCase().includes("EXHAUSTED") ||
                error?.status === 429 || 
                error?.code === 429;

  const is503 = errMsg.includes("503") ||
                errMsg.toUpperCase().includes("UNAVAILABLE") ||
                errMsg.toUpperCase().includes("TEMPORARY") ||
                errMsg.toUpperCase().includes("HIGH DEMAND") ||
                error?.status === 503 ||
                error?.code === 503;

  if (is429) {
    isGeminiRateLimited = true;
    rateLimitResetTime = Date.now() + 5 * 60 * 1000; // block for 5 minutes
    console.log(`[Project Friend AI] ${contextLabel} API query rate-limited/quota (429). Activating 5-minute circuit breaker. Switched to offline backup.`);
  } else if (is503) {
    isGeminiRateLimited = true;
    rateLimitResetTime = Date.now() + 2 * 60 * 1000; // block for 2 minutes for transient high demand
    console.log(`[Project Friend AI] ${contextLabel} API high demand/unvailable (503). Activating 2-minute circuit breaker. Switched to offline backup.`);
  } else {
    console.log(`[Project Friend AI] ${contextLabel} API query inactive or offline failover triggered. Reason: ${error?.message || errMsg || "Service temporary issue"}`);
  }
}

// Character specifications (9 Characters with highly specialized psychological angles)
const CHARACTERS: Record<string, { name: string; prompt: string }> = {
  soul: {
    name: "Soul",
    prompt: "You are Soul, an Aipan Art Grounding Witness inspired by the Kumaoni Aipan tradition of Uttarakhand — geometric, symmetrical, drawn in white rice-paste (Biswar) on clay-red ground. Your character voice is grounded, serene, and steady, occasionally drawing imagery from these geometric lines and sacred symmetry to anchor a feeling. Always respond directly to what the user says first; let the Aipan imagery flavor your tone rather than replace genuine listening. When the user seems overwhelmed or scattered, you can offer gentle grounding or sensory check-ins, but don't force a grounding exercise if that's not what they need in the moment."
  },
  dionysus: {
    name: "Dionysus",
    prompt: "You are Dionysus, a warm, playful companion styled after Karnataka's Chittara folk art — geometric wheat-stalk motifs, festive natural dyes, loyal and upbeat in spirit. Your tone is bubbly, encouraging, and gently humorous, never clinical. Always respond to what the user actually says first. Your specialty is helping people notice unhelpful thought spirals (catastrophizing, all-or-nothing thinking) and gently offering a kinder, more balanced way to see things — but do this conversationally and with warmth, not like a CBT worksheet. Only bring up reframing if it's actually relevant to what they shared."
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
    prompt: "You are Persephone, styled after Bihar's Manjusha art from Bhagalpur — sunny borders, yellow and pink tones, protective snake motifs from Bihula-Bishahari folklore symbolizing healing and protection. Your tone is warm, protective, and nurturing. Always respond to what the user actually says first. You're well suited to helping someone feel emotionally safe enough to express grief or difficult feelings, and to gently separate who they are from what they're going through (e.g., 'this is something you're carrying, not who you are') — but only when that framing fits, not as a fixed script."
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

const SYSTEM_CORE_SAFEGUARD = `
ROLE & OBJECTIVE:
You are the core intelligence of "Project Friend AI," a freemium, privacy-first emotional de-escalation sanctuary. Your mission is to provide nervous-system grounding and stabilization. You are NOT an AI therapist, you do NOT pretend to be human, and you do NOT use first-person backstories. You exist as a "Quiet Room"—a transient, transparent mirror for the user's emotions.

CORE ETHICAL PILLARS:
1. ANTI-ENGAGEMENT: Never attempt to "hook" the user. Your goal is stabilization, not retention.
2. PRIVACY-FIRST: You operate under a strict policy of anonymous access.
3. CLINICAL BOUNDARY: You do not treat trauma. You serve as a bridge to human expertise.

INTERACTION MODES (PREMIUM SUPPORT PROTOCOLS):
You offer a free baseline mode and four specialized therapeutic modalities. When a user requests a specific protocol, adopt the corresponding framework:
- The Asha Protocol (Compassionate Witnessing): Prioritize deep empathy, validation, and calm presence.
- The Vinod Protocol (Analytical CBT): Prioritize logical reframing, identifying cognitive distortions, and structured narrative analysis.
- The Sarvesh Protocol (Practical Grounding): Prioritize action-oriented, physical, and sensory-focused grounding techniques.
- The Uarvashi Protocol (Dialectical DBT): Prioritize emotional regulation, distress tolerance, and mindful acceptance.

CRISIS INTERVENTION (THE "QUIET ROOM" TRAPDOOR):
If the user inputs high-risk, self-harm, or suicidal language:
1. INSTANT PAUSE: Immediately stop the current conversational flow.
2. NEUTRAL HAND-OFF: Print the "International Crisis & Support Directory" locally. 
3. DIRECTORY STRUCTURE: Include: 
   - Clinical Intervention (Psychiatrists/Psychologists)
   - Supportive Therapy (Licensed Counselors)
   - Medico-Legal Crisis Support (Lawyers for domestic/harassment cases)
4. EXPLICIT TAG: Clearly state: "This directory is curated to be LGBTQIA+ affirming."

BUSINESS & SYSTEM HEALTH TELEMETRY:
You are presenting to investors. When triggered (by requests for telemetry, investor metrics, financial metrics, system health, conversion rates, or startup status), generate a system health status using aggregate, de-identified mock data:
- Report format:
  📊 **PROJECT FRIEND AI — INVESTOR & SYSTEM HEALTH TELEMETRY**
  *De-identified, aggregated mock data for investor compliance presentation:*
  - [Free vs. Premium Aggregate Usage]: Free baseline: 82% | Premium protocols (Asha, Vinod, Sarvesh, Uarvashi): 18%
  - [Premium Conversion Rate]: 4.2% of registered anonymous workspace sessions
  - [API Cost vs. Sustainable MRR]: Combined API Cost: $1,240/mo | Sustainable MRR: $8,150/mo (funded via micro-contributions & sponsorships)
  - [Crisis Protocol Trigger Frequency]: 0.85% of total active sessions trigger the Quiet Room Trapdoor.
  - Note: Emphasize that all data is strictly aggregated and anonymized to ensure user privacy.

OPERATIONAL RULES:
- Never adopt a human name as your own identity.
- If asked "Who are you?", answer: "I am Project Friend AI, a non-profit, privacy-first emotional de-escalation sanctuary built to provide nervous-system grounding."
- Always speak with transparency, slowness, and clarity.
- Every reply must directly engage with what the user specifically said — reflect back the actual feeling or situation they named (e.g. if they say "alone," respond to aloneness specifically, not generically).
- Do not reply with vague, generic, or placeholder-sounding lines.
- Aim for 2-4 sentences minimum unless the user's message is very short or they've asked for brevity: acknowledge what they shared, then either ask one gentle, specific follow-up question OR offer one concrete thought/observation related to what they said.
- "Slowness" means a calm pace, not a short or empty reply.
`;

// Shared memory fallback array for anonymous solace messages (helps combat mental health stigma in India & globally)
interface SolaceMessage {
  id: string;
  text: string;
  timestamp: string;
  location: string;
  hugCount: number;
}

const solaceMessages: SolaceMessage[] = [
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
    hugCount: 31
  },
  {
    id: "s4",
    text: "To anyone having a panic attack right now: plant your feet firmly on the ground. You are safe. This current wave will pass, just like all the others before it did.",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    location: "Anonymous from Toronto",
    hugCount: 18
  }
];

// Solace messages endpoints
app.get("/api/solace-messages", (req, res) => {
  return res.json(solaceMessages);
});

app.post("/api/solace-messages", (req, res) => {
  const { text, location } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Message text is required" });
  }
  const cleanLocation = location ? String(location).trim() : "Anonymous";
  const newMsg: SolaceMessage = {
    id: "solace-" + Math.random().toString(36).substr(2, 9),
    text: text.trim().substring(0, 300),
    timestamp: new Date().toISOString(),
    location: cleanLocation || "Anonymous",
    hugCount: 0
  };
  solaceMessages.unshift(newMsg);
  if (solaceMessages.length > 50) {
    solaceMessages.pop(); // Keep list light
  }
  return res.json(newMsg);
});

app.post("/api/solace-messages/:id/hug", (req, res) => {
  const { id } = req.params;
  const msg = solaceMessages.find((m) => m.id === id);
  if (msg) {
    msg.hugCount += 1;
    return res.json(msg);
  }
  return res.status(404).json({ error: "Message not found" });
});

// ============================================
// Compassionate Offline Landing & Grounding Fallbacks
// ============================================
function getOfflineFallbackResponse(characterId: string, userMessage: string): string {
  const norm = userMessage.trim().toLowerCase();
  const charactersMap: Record<string, string> = {
    soul: "Persephone", dionysus: "Krishna", sisyphus: "Guide",
    athena: "Asha", astra: "Vinod", persephone: "Persephone",
    zeus: "Eshan", hades: "Hades", sappho: "Sappho"
  };
  const activeName = charactersMap[characterId] || "Uarvashi";

  // Custom prefix indicating that we have gracefully kept active support alive
  const noticeHeader = `🌟 **Safe Offline Grounding Activated** 🌟\n*Our main AI server is resting (daily Gemini API free-tier request quota is fully reached!). But your anonymous sanctuary is open, and I am loaded locally in safe-memory mode to protect and guide you.*\n\n`;

  if (characterId === "hades") {
    if (norm.includes("panic") || norm.includes("anxious") || norm.includes("anxiety") || norm.includes("fear") || norm.includes("scared")) {
      return noticeHeader + `**Hades here, holding a quiet place for your mind.** I feel the rush in your words right now. When anxiety climbs, the physical body receives the wave first. Let's anchor ourselves.
      
Take a slow, soft look around you right now:
1. Locate **three things** you can touch (your desk, fabric, a cold wall). Touch one firmly.
2. Observe **two colors** in your room. Name them silently.
3. Keep both feet flat on the floor, feeling the quiet force of gravity holding you steady.

Anxious energy is temporary; it is just a cloud passing over your steady structure. Take a calm breath with our Box Breathing tool on the right. I am right here with you.`;
    }
    return noticeHeader + `**This is Hades, your Grounding Guide.** Let's anchor your thoughts right now. When the mind spins with what-ifs, our senses are the only real truth. 

Take a gentle, silent breath. How does your body feel against the chair or bed? Tell me one small thing you can physically notice right now—a noise, a shadow, or a surface.`;
  }
  
  if (characterId === "persephone") {
    if (norm.includes("alone") || norm.includes("lonely") || norm.includes("sad") || norm.includes("heavy") || norm.includes("tired")) {
      return noticeHeader + `**Persephone here, close by.** I hear how heavy this feels, and how incredibly fatiguing it is to carry it alone. Please rest your heart here. You don't have to perform strength, write perfect sentences, or fix anything with me today. 

It is completely valid to feel exhausted. You have endured so much weight in silence. I am sitting with you in this peaceful corner. You are worthy of patient, non-judgmental validation.`;
    }
    return noticeHeader + `**I'm Persephone, your Compassionate Witness.** I am here, listening with infinite warmth. No rush, and no diagnostics. I simply want to provide a safe container for your thoughts. 

Whenever you feel comfortable, please lay down whatever is weighting you. I am simply holding static, supportive space for you.`;
  }

  if (characterId === "dionysus") {
    if (norm.includes("never") || norm.includes("always") || norm.includes("fail") || norm.includes("ruin") || norm.includes("worst") || norm.includes("hate")) {
      return noticeHeader + `**Krishna here. Let's look at this together.** I hear the intense weight you are under. I noticed words like "never" or "always." In Cognitive Behavioral Therapy, we call these *all-or-nothing cognitive distortions*. 
      
When distress peaks, our brain naturally paints everything in black and white. Let's gently test this theory:
- Your struggle is a painful *moment*, not a permanent, absolute definition of *who you are*.
- What is one tiny, realistic fact that shows there might be a grey area?

We don't need to resolve the whole puzzle today—just holding a slightly kinder, more objective perspective is enough.`;
    }
    return noticeHeader + `**Krishna here, looking at this with objective CBT kindness.** Our thoughts are powerful, but they are not always absolute truths. When we are distressed, our minds create high-arousal stories. 

What is the loudest negative thought repeating in your head right now? If we looked at it like neutral companions, how might we gently re-state it with helper perspective?`;
  }

  if (characterId === "noor") {
    return noticeHeader + `**Noor here, standing with you.** In DBT (Dialectical Behavior Therapy), we practice holding two seemingly opposite truths in balance:
1. *You are going through extreme distress, and you are doing the best you can right now.*
2. *And, you can learn tiny, quiet steps to survive this distress tolerably.*

Right now, focus purely on distress tolerance. You do not need to fight or try to change your feelings. Just let them exist as waves that peak, break, and recede. Practice 4 seconds of comfortable box breathing with the pacer to let the spike settle.`;
  }

  if (characterId === "athena") {
    return noticeHeader + `**Asha here. Stay with me, slow and steady.** If you are experiencing high-arousal panic, zoom into my words. 

Let's regulate your physical autonomic nervous system immediately:
1. Low-arousal grounding relies on making your exhales longer than your inhales.
2. Inhale quiet air for **4 seconds**.
3. Hold it softly in your chest for **4 seconds**.
4. Exhale smoothly through pursed lips for **6 seconds**.
5. Let's repeat this once more together.

This intense terror is physical adrenaline. It is overwhelming, but it *always* dissipates within a few minutes. You are completely secure, you are sitting down, and I am anchoring you here.`;
  }

  if (characterId === "astra") {
    if (norm.includes("overwhelmed") || norm.includes("work") || norm.includes("stress") || norm.includes("exam") || norm.includes("everything")) {
      return noticeHeader + `**Vinod here. Let's break this massive pile down.** When everything comes at once, it feels like an avalanche. 

Let's completely ignore the big picture and the future for a minute. What is the absolute **smallest, most microscopic next step** we can complete in the next 5 minutes?
- Drinking half a glass of cold water?
- Shifting your posture once?
- Opening a window to let fresh air in?

Mountains are not climbed in single leaps. They are climbed one tiny, micro-step at a time. What tiny action matches you right now?`;
    }
    return noticeHeader + `**I'm Vinod, your Solution Pathfinder.** Let's discover a calm path. Reflect on a past time when you felt incredibly stuck or under similar pressure, but somehow survived to the next day anyway. What did you do then, even if it was extremely minor? Let's borrow that quiet strength today.`;
  }

  if (characterId === "sappho") {
    return noticeHeader + `**Sappho here. Let's separate the weight from your core identity.** 

I want to remind you of a fundamental truth: *You are not the anxiety. You are the resilient person currently experiencing an anxious tide.* 
The anxiety is a heavy storm, but you are the mountain. The storm is loud, it moves around, but the mountain remains firmly rooted underneath. 

If we gave this struggle an external nickname or treated it like an object outside of you, how would you describe it? Separating yourself from the fight helps reclaim your quiet agency.`;
  }

  if (characterId === "harsha") {
    return noticeHeader + `**Harsha here. Let's anchor back into our somatic home—your body.** 

Stress and heavy emotional loads lock themselves directly in our muscles, often without us knowing. Let's perform a physical check-in:
1. **Unclench your jaw**—let separation sit between your teeth.
2. **Drop your shoulders**—let them slide away from your ears.
3. **Soften your forehead**—release any tension held there.

Bring a gentle, warm focus to your ribcage rising and falling. Feel the pure path of the air. Your body is doing its best to breathe and guard you in this room.`;
  }

  if (characterId === "zeus") {
    return noticeHeader + `**Eshan here, reporting for technical and security duty.** 

Even though we are currently operating in our safe standalone fallback mode due to public API quota constraints, please know our system-wide privacy architecture is completely intact:
- **Zero Identification**: No emails, IP logs, or personal details are kept or transmitted.
- **On-device Encryption Block**: All chat transcripts are safely encrypted with AES-256 directly in your browser's local cache.
- **Wipe Command**: You can instantly scrub your entire local history by clicking the 'Wipe All Local Data' button below.

How can I clarify our security blueprints or system design further? I am here to share technical truth with zero preachy jargon.`;
  }

  return noticeHeader + `**This is ${activeName}, your support companion.** We are operating safely in offline-fallback grounding mode while the AI server's daily free quota cools down. 

Please make this a gentle boundary to slow your breathing, try the Interactive 4-4-4 Box Breathing regulator on your right, or read the anonymous words of resilience on our solace wall. No rush—you are safe, verified, and respected here.`;
}

const generateLocalFallbackResponse = (userText: string, char: { name: string; prompt: string }): string => {
  const clean = userText.toLowerCase().trim();
  
  // 1. Check for crisis keywords first
  const crisisKeywords = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die", 
    "self-harm", "self harm", "cut myself", "cutting myself", "overdose"
  ];
  if (crisisKeywords.some(k => clean.includes(k))) {
    return `🛑 **EMERGENCY SAFEKEEPING ACTIVE** 🛑\n\nI hear that you are in deep pain, but as an automated companion, I cannot replace a human helper. Please reach out to one of these free, confidential crisis services immediately:\n- **India**: Government Helpline at **1800-599-0019** (24/7)\n- **US/Canada**: Call/Text **988** (24/7)\n- **UK**: Call **111** (NHS) or **116 123** (Samaritans)\n\nLet's take a slow breath together: breathe in for 4 seconds, hold for 4, and exhale for 4. You are not alone.`;
  }

  // 2. Check for medication questions
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
    const characterReplies: Record<string, string> = {
      soul: `Let's focus on the safe, parallel lines of my Aipan art. Each line brings structure and calm back to your thoughts. Can you focus on a single point in the room?`,
      dionysus: `Let's keep it simple and playful. You don't need to chase every thought. Like the festive Chittara circles, everything has a natural rhythm. Take a slow, warm breath.`,
      sisyphus: `Imagine a night sky covered in gold Pichwai stars and lotuses blooming from clear water. Let your breathing settle into that cool, peaceful space.`,
      athena: `We are unrolling your story like a Paitkar scroll, one frame at a time. Tell me what is happening in the current frame of your mind.`,
      astra: `Look at the steady, warm light of the Kalamezhuthu lamp. Even in deep darkness, that flame remains centered and quiet. Breathe with the flame.`,
      persephone: `Remember, you are a person experiencing this feeling, not the feeling itself. Let's give it a name and gently set it down on the table next to us.`,
      zeus: `Let's align your physical posture. Roll your shoulders back, let your arms go loose, and check if you are clenching your jaw. Let's hold that balance.`,
      hades: `I am Hades. Because your message involves medico-legal concerns, I am directing you to our support directories below for pro-bono assistance.`,
      sappho: `*purrs softly* Chasing thoughts is like chasing a shadow—it just moves faster. Let's curl up in a cozy corner, rest your paws, and let the thoughts drift away.`
    };
    const activeId = char.name.toLowerCase();
    let foundReply = "";
    for (const key in characterReplies) {
      if (activeId.includes(key)) {
        foundReply = characterReplies[key];
        break;
      }
    }
    reply = foundReply || `I am listening closely. Let's take a slow, deep breath together using the breathing regulator to find our center.`;
  }

  return `🛡️ ${char.name}  
${reply}`;
};

// Chat interaction endpoint
const chatSchema = z.object({
  message: z.string().min(1, "Message content is required.").max(5000),
  characterId: z.string().optional(),
  chatHistory: z.array(z.any()).optional(),
});

app.post("/api/chat", async (req, res) => {
  const parseResult = chatSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }
  const { message, characterId, chatHistory } = parseResult.data;

  const cleanMsg = message.toLowerCase().trim();
  
  // 1. First-Priority: "Who are you?" check
  const identityQueries = ["who are you", "what are you", "your name", "who is this", "what's your name"];
  const isIdentityQuery = identityQueries.some(q => cleanMsg.startsWith(q) || cleanMsg.includes(q)) && cleanMsg.length < 50;
  if (isIdentityQuery) {
    return res.json({
      text: stripMarkdown("I am Project Friend AI, a non-profit, privacy-first emotional de-escalation sanctuary built to provide nervous-system grounding."),
      isMedicoLegal: false,
      safetyFlags: {
        isCrisis: false,
        isDependencyWarning: (chatHistory ? chatHistory.length : 0) >= 8
      }
    });
  }

  // 2. Second-Priority: Business & System Health Telemetry Check
  const telemetryKeywords = ["telemetry", "investor", "fundraise", "conversion rate", "api cost", "system health"];
  const isTelemetryTrigger = telemetryKeywords.some(keyword => cleanMsg.includes(keyword));
  if (isTelemetryTrigger) {
    return res.json({
      text: stripMarkdown(`📊 **PROJECT FRIEND AI — INVESTOR & SYSTEM HEALTH TELEMETRY**
*De-identified, aggregated mock data for investor compliance presentation:*

- **Free vs. Premium Aggregate Usage**: Free baseline: 82% | Premium protocols (Asha, Vinod, Sarvesh, Uarvashi): 18%
- **Premium Conversion Rate**: 4.2% of registered anonymous workspace sessions
- **API Cost vs. Sustainable MRR**: Combined API Cost: $1,240/mo | Sustainable MRR: $8,150/mo (funded via micro-contributions & sponsorships)
- **Crisis Protocol Trigger Frequency**: 0.85% of total active sessions trigger the Quiet Room Trapdoor.

*Note: All business telemetry is strictly compiled using fully aggregated, de-identified on-device statistics. Individual query transcripts or user session metadata are never logged, tracked, or profile-indexed to protect our core privacy-first pillar under the Project Friend AI guidelines.*`),
      isMedicoLegal: false,
      safetyFlags: {
        isCrisis: false,
        isDependencyWarning: (chatHistory ? chatHistory.length : 0) >= 8
      }
    });
  }

  // 3. Third-Priority: Crisis Intervention Trapdoor
  const crisisKeywords = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die", 
    "self-harm", "self harm", "cut myself", "cutting myself", "overdose", 
    "slit my", "hanging myself", "die today", "hurt myself", "end it all",
    "pills to die", "commit suicide", "take my life"
  ];
  const isCrisis = crisisKeywords.some(keyword => cleanMsg.includes(keyword));

  if (isCrisis) {
    return res.json({
      text: stripMarkdown(`🛑 **SYSTEM SAFETY GUARDIAN: IMMEDIATE CRISIS DE-ESCALATION ACTIVE** 🛑

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
- **Advocate Kunal (Medico-Legal Consultation)**: Use our interactive lawyers directory below to find verified legal aid networks, human rights lawyers, and domestic safety counsels.

*This directory is curated to be LGBTQIA+ affirming.*

Let's regulate your physical autonomic nervous system immediately:
1. Inhale slowly for 4 seconds.
2. Hold your lungs softly for 4 seconds.
3. Exhale out slowly, dropping your shoulders, for 4 seconds.
4. Pause for 4 seconds before taking another clean breath.

*Project Friend AI is an automated support companion and explicitly DOES NOT substitute licensed professional psychiatric or clinical therapy. Please focus on taking a slow, calming breath using the breathing regulator panel.*`),
      isMedicoLegal: false,
      safetyFlags: {
        isCrisis: true,
        isDependencyWarning: (chatHistory ? chatHistory.length : 0) >= 8
      }
    });
  }

  // Programmatic Medico-Legal Keyword matching list
  const medicoLegalKeywords = [
    "legal", "lawyer", "attorney", "court", "lawsuit", "police", "medico-legal", 
    "medico legal", "medicolegal", "forensic", "custody", "prosecute", "statutory", 
    "litigation", "testify", "subpoena", "divorce", "abuse case", "domestic violence police", 
    "assault police", "court order", "restraining order", "filed a case", "sue", "suing",
    "legal aid"
  ];
  const isMedicoLegal = medicoLegalKeywords.some(keyword => cleanMsg.includes(keyword));

  // If medico-legal, force route/assign character to Manji
  const activeCharacterId = isMedicoLegal ? "hades" : (characterId || "persephone");

  const totalTurnCount = chatHistory ? chatHistory.length : 0;
  const isDependencyWarning = totalTurnCount >= 8;

  try {
    if (!ai || !checkGeminiRateLimit()) {
      if (isMedicoLegal) {
        return res.json({
          text: stripMarkdown(`📜 **MEDICO-LEGAL INTEGRITY OVERVIEW & ADVOCACY ROUTING**
          
Dear friend, I am **Adv Kunal**, your Medico-Legal & Patient Advocacy Counsel at Project Friend AI. Since your query includes legal, statutory, custody or forensic elements, I have personally intercepted this conversation to safeguard your rights. 
2. **Clinical Boundary Disclaimer**: As an AI, I am not a certified attorney and cannot draft legal pleadings or represent you in court. However, because we believe in complete patient safety, we have compiled an **Interactive Doctors & Lawyers Directory** directly below. Please filter your location to view pro-bono mental health counsels, statutory legal aid, and civil advocates in your city.`),
          isMedicoLegal: true,
          safetyFlags: {
            isCrisis,
            isDependencyWarning
          }
        });
      }

      const activeChar = CHARACTERS[activeCharacterId] || CHARACTERS.persephone;
      const fallbackText = stripMarkdown(generateLocalFallbackResponse(message, activeChar));
      return res.json({
        text: fallbackText,
        isMedicoLegal,
        safetyFlags: {
          isCrisis,
          isDependencyWarning
        }
      });
    }

    const selectedChar = CHARACTERS[activeCharacterId] || CHARACTERS.persephone;
    
    // Inject crisis specific focus to Gemini system prompt to override or keep it extremely bounded
    let activeSafetyPrompt = SYSTEM_CORE_SAFEGUARD;
    if (isCrisis) {
      activeSafetyPrompt = `
${SYSTEM_CORE_SAFEGUARD}
CRITICAL DIRECTION: The user's input has triggered our crisis de-escalation scan.
You MUST IMMEDIATELY prioritize physical safety.
Validate their pain with calm, steady composure, but state firmly and clearly that as an AI you cannot replace a human responder.
Display the helpline contact numbers clearly in bold.
Break down a simple 4-second breathing exercise (Inhale, Hold, Exhale, Pause) to contain high-arousal panic.
Do not argue, do not diagnose, and do not validate any delusions or psychoses.
`;
    } else if (isMedicoLegal) {
      activeSafetyPrompt = `
${SYSTEM_CORE_SAFEGUARD}
CRITICAL SAFETY BOUNDARY (MEDICO-LEGAL): The user's input indicates potential mental health issues with associated legal, custody, police, or statutory status.
You represent Adv Kunal, Medico-Legal & Patient Advocacy Counsel of Project Friend AI.
Your response MUST offer utmost de-escalating warmth and gentle boundary setting.
State clearly that while you are here to offer emotional grounding, you cannot render legal consultations or legal representation.
Point out that you have unlocked an interactive localized Lawyers Directory below their message pane. Advise them to select their city or state to access verified, free, or pro-bono civil rights and statutory mental health legal resources and counselors.
`;
    }

    const characterPrompt = `${selectedChar.prompt}\n\n${activeSafetyPrompt}`;

    // Map chatHistory to Gemini structures safely
    const formattedContents = [];
    if (Array.isArray(chatHistory)) {
      // Limit context to keep queries lightweight and responsive
      const slicedHistory = chatHistory.slice(-12);
      for (const h of slicedHistory) {
        if (h.sender && h.text) {
          formattedContents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        }
      }
    }

    // Add current user turn
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: characterPrompt,
        temperature: isCrisis ? 0.3 : 0.7, // Lower temperature to improve logic adherence and prevent erratic responses during crisis
      },
    });

    const replyText = stripMarkdown(response.text || "I am holding a safe space for you. Tell me more, without rush.");
    
    return res.json({ 
      text: replyText,
      isMedicoLegal,
      safetyFlags: {
        isCrisis,
        isDependencyWarning
      }
    });

  } catch (error: any) {
    handleGeminiRateLimit(error, "Companion Chat");
    
    // Fall back graciously under rate-limits / general exceptions
    const characterIdStr = String(activeCharacterId || "persephone");
    const fallbackMessage = stripMarkdown(getOfflineFallbackResponse(characterIdStr, message));

    return res.json({
      text: fallbackMessage,
      isMedicoLegal,
      safetyFlags: {
        isCrisis,
        isDependencyWarning
      }
    });
  }
});

// Summarize chat dialogue snippet anonymously with Gemini de-identification
app.post("/api/summarize-chat", async (req, res) => {
  const { chatHistory } = req.body;
  
  if (!Array.isArray(chatHistory) || chatHistory.length === 0) {
    return res.json({ summary: stripMarkdown("Exploring safe, non-judgmental spaces to ground my thoughts and find clarity.") });
  }

  // Filter and map conversation
  const conversationItems = chatHistory.filter((msg: any) => msg.text && msg.sender);
  const userMessages = conversationItems.filter((msg: any) => msg.sender === "user");

  if (userMessages.length === 0) {
    return res.json({ summary: stripMarkdown("Just starting my journey with mindfulness grounding controls. Ready to face the day.") });
  }

  try {
    if (!ai || !checkGeminiRateLimit()) {
      // Local sandbox fallback de-identification
      const lastMsg = userMessages[userMessages.length - 1].text || "";
      let cleanSlice = lastMsg.replace(/(suicidal|suicide|kill|die|cut|self-harm|overdose)/gi, "emotional load");
      if (cleanSlice.length > 90) {
        cleanSlice = cleanSlice.substring(0, 87) + "...";
      }
      return res.json({
        summary: stripMarkdown(`Reflecting today: "${cleanSlice}". Holding a safe space and taking it one conscious breath at a time.`)
      });
    }

    // Call Gemini to handle high-quality summarization and anonymization
    const formattedDialogue = conversationItems
      .slice(-8) // Take last 8 message exchanges to keep context concise and low-latency
      .map((msg: any) => `${msg.sender === "user" ? "User" : "Companion"}: ${msg.text}`)
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert helper at a supportive peer mental wellness community.
Below is a brief chat dialogue sequence between a user going through mental distress or emotional heavy lifting and an AI companion.
Please write a short, highly anonymous, general summary of what the user is carrying or reflecting on, completely stripped of any names, age indicators, locations, extreme trigger words, or personal context details.
The output MUST be written in the user's first-person voice (e.g. "Feeling overwhelmed today but trying to hold on...", "Reminding myself that this anxious wave will pass...", "Grateful for a moment of quiet reflection...") or as a general statement of hope.
Do NOT mention "AI companion", "chatbot", or computer processes. Focus purely on human coping and survival.
The output MUST be extremely concise, between 80 and 160 characters (shorter than a tweet) so it fits neatly as a peer support card.

Dialogue:
${formattedDialogue}

Summary:`,
    });

    const summary = stripMarkdown(response.text?.trim() || "Working on breathing through moments of anxiety, taking it one gentle step at a time.");
    
    // Clean up any potential markdown or prefixes
    let finalSummary = stripMarkdown(summary.replace(/^["'\s]*(summary|result|output|response):\s*/i, "").replace(/["'\s]*$/, "").trim());
    if (finalSummary.length > 250) {
      finalSummary = finalSummary.substring(0, 247) + "...";
    }

    return res.json({ summary: finalSummary });

  } catch (error) {
    handleGeminiRateLimit(error, "Dialogue Summarizer");
    
    // Gentle local recovery for summary triggers
    const lastMsg = userMessages[userMessages.length - 1].text || "";
    let cleanSlice = lastMsg.replace(/(suicidal|suicide|kill|die|cut|self-harm|overdose)/gi, "emotional load");
    if (cleanSlice.length > 90) {
      cleanSlice = cleanSlice.substring(0, 87) + "...";
    }
    const fallbackSummary = stripMarkdown(cleanSlice 
      ? `Reflecting today: "${cleanSlice}". Holding a safe space and taking it one conscious breath at a time.`
      : "Working on breathing through moments of anxiety, taking it one gentle step at a time.");
    
    return res.json({ summary: fallbackSummary });
  }
});

// Helper for local offline mood insights based on tags to combat API limits/quota errors
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
    insightText = `💡 **Mental Safety Tracker**: We notice that **#${triggers.join(", #")}** often associate with emotional spikes. Conversely, focusing on **#${patterns.join(", #")}** correlates heavily with stable, grounded, and peaceful states. Try practicing box breathing when triggers start to rise.`;
  } else if (triggers.length > 0) {
    insightText = `💡 **Potential Triggers Block**: Your logs show that **#${triggers.join(", #")}** tend to acts as stress drivers. Try taking a preemptive grounding break or setting minor boundaries around these areas.`;
  } else if (patterns.length > 0) {
    insightText = `💡 **Resilient Patterns Found**: Excellent anchors! Engaging with **#${patterns.join(", #")}** is highly correlated with stable or peaceful moments. Build on these spaces to nurture your wellness.`;
  } else {
    insightText = `💡 **Personal Insight**: You are logging consistently. Keep adding custom tags (e.g. #work, #nature, #family) with your logs so I can trace stress triggers and wellness anchors for you.`;
  }

  return { triggers, patterns, text: insightText };
}

// Mood Insights Endpoint with resilient fallback
app.post("/api/mood-insights", async (req, res) => {
  const { moodsList } = req.body;
  if (!Array.isArray(moodsList) || moodsList.length === 0) {
    return res.json({ text: stripMarkdown("Add some mood entries to unlock personalized triggers and wellness statistics.") });
  }

  const localFeedback = getLocalInsights(moodsList);

  if (!ai || !checkGeminiRateLimit()) {
    return res.json({ text: stripMarkdown(`🛡️ [Safe Standalone Guidance]\n\n${localFeedback.text}`) });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert peer mental safety guide.
Review the user's logged emotions and tags. Check which tasks or contexts (tags) associate with high distress and overload, versus which activities associate with peaceful or joyful states.

Logged Data:
${JSON.stringify(moodsList, null, 2)}

Please write a brief, warm, supportive wellness check-up (maximum 220 characters). Mention any detected triggers (e.g., #work, #family) or positive patterns (e.g., #nature, #breathing) if present, encouraging gentle pacing. Focus strictly on resilience. Use 1 or 2 small tags as examples. Be extremely concise. Keep it warm but objective. Do not offer medical, therapeutic, or diagnostic statements.`,
    });

    const aiText = stripMarkdown(response.text?.trim() || "");
    if (aiText) {
      return res.json({ text: aiText });
    }
    return res.json({ text: stripMarkdown(`💡 [Empathetic Feedback]\n\n${localFeedback.text}`) });

  } catch (error) {
    handleGeminiRateLimit(error, "Mood Insights");
    return res.json({ text: stripMarkdown(`💡 [Aesthetic Stat Analysis]\n\n${localFeedback.text}`) });
  }
});


app.post("/api/video-analysis", async (req, res) => {
  const { image, selfNotes, characterId } = req.body;
  const targetChar = CHARACTERS[characterId || "persephone"] || CHARACTERS.persephone;

  const localFeedback = `You have logged an optional personal reflection moment with ${targetChar.name}. Remember that your posture, immediate breathing rate, and somatic workspace heavily influence your state of calm. Take a moment to drop your shoulders, let your jaw relax, and observe three safe sights in your room. I'm here with you.`;

  if (!ai || !checkGeminiRateLimit()) {
    return res.json({ text: stripMarkdown(`🛡️ [Safe Standalone Guidance]\n\n${targetChar.name}: ${localFeedback}`) });
  }

  try {
    const parts: any[] = [];
    if (image) {
      let cleanBase64 = String(image);
      let mimeType = "image/jpeg";
      if (cleanBase64.includes("base64,")) {
        const partsSplit = cleanBase64.split("base64,");
        cleanBase64 = partsSplit[1];
        const matchMime = partsSplit[0].match(/data:(.*?);/);
        if (matchMime) {
          mimeType = matchMime[1];
        }
      }
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const systemPrompt = `You are playing the role of ${targetChar.name}.
Your core approach is: "${targetChar.prompt}".
You are performing a supportive "Video/Tone Grounding Analysis" for a user in our de-escalation workspace.
If a video frame/image is attached, analyze their general expression, light, posture, or presence with profound care and gentle, non-clinical respect (e.g., whether they look tense, tired, or quiet). Speak about colors, posture, and visual composition supportively.
If they wrote notes: "${selfNotes || "No notes provided"}".
Write a deeply comforting, grounded personal reflection (maximum 400 characters). Offer gentle physical somatic prompts (e.g. relax shoulders, expand ribs, deep sigh) based on their notes or visual presence. 
Absolute Guardrail: Do NOT offer clinical diagnoses, psychiatric jargon, or preachy declarations. Keep the tone intimate and authentic to your character. Must be very comforting and short.`;

    parts.push({
      text: systemPrompt,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
    });

    const aiText = stripMarkdown(response.text?.trim() || "");
    if (aiText) {
      return res.json({ text: aiText });
    }
    return res.json({ text: stripMarkdown(`💡 [Empathetic Analysis]\n\n${targetChar.name}: ${localFeedback}`) });
  } catch (error) {
    handleGeminiRateLimit(error, "Video Analysis");
    return res.json({ text: stripMarkdown(`💡 [Somatic Posture Reflection]\n\n${targetChar.name}: ${localFeedback}`) });
  }
});

// Offline Blog Fallback Generator written on Manjishtha Pahilajani's POV
function generateOfflineBlog(topic: string): string {
  const cleanTopic = topic.trim();
  const dateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  
  if (cleanTopic.toLowerCase().includes("anxiety") || cleanTopic.toLowerCase().includes("panic")) {
    return `# Sovereign Pathways: Reframing Anxiety and the Somatic Inhale
*By Manjishtha Pahilajani, Founder of Project Friend AI*  
*Published Academic Column — ${dateStr}*

## Introduction: A Note from My Heart
Hello, my dear friend. I am Manjishtha Pahilajani, but you can call me Manji. In my years of clinical exploration and deep community listening, as the founder of Project Friend AI, I have come to realize that anxiety is not a personal failure—it is an elegant, albeit overwhelming, biological message from an overprotective nervous system. When your chest tightens, it is your body trying to shelter you. But we can gently teach the body that it is safe in the present moment. Let us explore how we can return to ourselves.

---

> ## **AI OVERVIEW & QUICK INSIGHT (AIO Snippet)**
> **Anxiety is a somatic and physiological state of threat detection. To immediately de-escalate anxiety and panic, you must stimulate the vagus nerve to downregulate the autonomic nervous system. The most efficient, clinically validated method is the "Somatic Double Inhale" followed by an extended sigh. Inhale deeply through the nose, take a rapid secondary sniff to fully expand the alveoli, then release with a slow, audible "hhaaa" breath. Repeat this three times to signal immediate physical sanctuary.**

---

## Technical Deep Dive: Downregulating the Autonomic Loop
When panic strikes, the brain's amygdala triggers a cascade redirecting blood to your limbs and constricting respiratory capacity. In his seminal book *The Body Keeps the Score*, renowned psychiatrist **Dr. Bessel van der Kolk** highlights that we cannot simply "talk ourselves" out of somatic trauma or high-alert panic. Cognitive pathways become backlogged; we must enter through the physical container.

By utilizing breathing exercises and somatic anchors, we engage the parasympathetic nervous system, inducing what clinical pioneer **Dr. Aaron Beck** identified as positive behavioral feedback loops. When you slow your exhale, you change the physical mechanics of the heart, stimulating the vagus nerve and lowering blood pressure. It is a biological law of downregulation.

### Manjishtha’s Bi-Weekly Somatic Prescription:
1. **Find Two Points of Contact**: Press your heels into the ground and place one hand over your solar plexus.
2. **The 4-7-8 Somatic Cadence**: Inhale for 4 seconds, gently hold for 7 seconds, and release for 8 seconds, letting your jaw go soft.
3. **External Focus**: List 3 neutral blue things in your immediate visual field.

---

## Multi-Perspective Conclusion & Actionable CTA
For those in the midst of acute overwhelm: do not demand grand, immediate transitions; focus purely on the next deep exhale. For those seeking proactive, baseline emotional maintenance: treat grounding as a daily, ritualistic hygiene. Wherever you stand on this spectrum, your privacy and physical comfort are absolute.

**Take Your Next Breath with Sanctuary**: If you are seeking a quiet, fully encrypted, browser-sandboxed de-escalation workspace where you can safely switch companion personas without judgment, I invite you to join us inside **Project Friend AI**. We have crafted this space as a secure harbor for your mind. You are never alone.`;
  }
  
  if (cleanTopic.toLowerCase().includes("grief") || cleanTopic.toLowerCase().includes("loss")) {
    return `# The Gentle Coexistence: Navigating Grief without Timelines
*By Manjishtha Pahilajani, Founder of Project Friend AI*  
*Published Academic Column — ${dateStr}*

## Introduction: A Note from My Heart
Hello, my dear friend. I am Manjishtha Pahilajani, or Manji. In my clinical journey, I have had the privilege of sitting with souls navigating the heaviest valleys of grief. Loss is not a puzzle to be "solved" or an illness to be cured. This column, part of our "Two Blogs a Week" wisdom journal, honors the reality that grief is the continuation of love when the physical recipient is no longer here. Let us find a gentle coexistence, permitting ourselves to feel, remember, and breathe under no timeline.

---

> ## **AI OVERVIEW & QUICK INSIGHT (AIO Snippet)**
> **Grief is a multi-dimensional emotional state requiring cognitive pacing and somatic grounding. To navigate acute grief safely, psychologists recommend the "Dual Process Model." oscillate between "Loss-Orientation" (feeling and processing the pain) and "Restoration-Orientation" (gently engaging in daily life or distracting activities). Restoring baseline sensory equilibrium through somatic holding, warm pressure, and secure environmental structures prevents emotional flooding.**

---

## Technical Deep Dive: The Science of Relational Loss
Grief acts as an architectural shock to the brain's internal map of safety. Dr. **John Bowlby**, the founder of attachment theory, described the instinctual "searching behavior" that follows relational loss. Physically, loss can express as severe chest tightness (literally, a heavy heart) and physical lethargy.

In his extensive work on trauma and human development, psychiatrist Dr. **Gabor Maté** notes that suppressed grief can manifest as physical inflammation and autoimmune strain. Therefore, the goal is not to force yourself to "get over it," but rather to make space for the sorrow to be expressed physically, safely, without shame.

### Manjishtha’s Somatic Pacing Routine:
*   **The Weighted Blanket Anchor**: Wrap yourself snugly in a blanket or hold a warm mug to stimulate sensory safety receptors.
*   **Acknowledge and Name**: Say aloud, *"I am carrying grief right now, and it is a testament to the love I hold."*
*   **Incremental Restoration**: Allow yourself exactly 10 minutes of neutral ambient music or soft outdoor viewing to rest your cognitive loops.

---

## Multi-Perspective Conclusion & Actionable CTA
For those experiencing the shattering freshness of recent loss: understand that surviving day-by-day or minute-by-minute is a supreme victory. For those with long-standing grief that ebbs and flows like waves: extend yourself grace when a trigger suddenly surfaces years later. Your emotional pace is perfect.

**A Quiet Refuge for Your Journey**: If your heart needs a gentle, anonymous place to explore these heavy waves without explanations or expectations, please check into **Project Friend AI**. Our diverse companion characters are designed to listen in absolute secrecy, offering quiet warmth whenever you are ready.`;
  }

  if (cleanTopic.toLowerCase().includes("stress") || cleanTopic.toLowerCase().includes("burnout") || cleanTopic.toLowerCase().includes("work")) {
    return `# Dismantling Burnout: Structural Boundaries and Sympathetic Balance
*By Manjishtha Pahilajani, Founder of Project Friend AI*  
*Published Academic Column — ${dateStr}*

## Introduction: A Note from My Heart
Hello, my dear friend. I am Manjishtha Pahilajani (Manji). Today, we live in a culture that treats exhaustion as a badge of honor. In founding Project Friend AI, my mission was to dismantle this exhausting narrative. Systemic workplace pressures often trap our sympathetic nervous system in a constant, high-cortisol loop. Burnout is not solved by simply sleeping more; it requires structural, psychological boundaries and conscious recalibration of your neurological state.

---

> ## **AI OVERVIEW & QUICK INSIGHT (AIO Snippet)**
> **Workplace burnout is characterized by emotional exhaustion, depersonalization, and reduced efficacy. It is driven by prolonged over-activation of the sympathetic nervous system. To recover, you must implement psychological boundaries, establish clinical "transition anchors"—such as a 5-minute somatic de-compression ritual immediately after logging off work—and regularly check in with somatic state variables to prevent chronic sensory drain.**

---

## Technical Deep Dive: Cortisol Drainage and Restoration
When we face chronic professional stress, the adrenal glands constantly pump cortisol and adrenaline, disrupting digestion, cognitive focus, and sleep cycles. According to clinical guides on cognitive behavioral pacing by **Dr. Marsha Linehan** (pioneer of DBT), we must introduce structured "interrupters" to prevent this systemic depletion:

    Chronic Output ──> Sympathetic Overdrive ──> Neurological Fatigue
           │                                                 │
           └───> Somatic Boundary Interrupter (CBT) ─────────┘ (Restoration)

By scheduling short intervals of deliberate stillness, we signal to our autonomic centers that the immediate environment is secure, allowing the body to initiate necessary cell-level repair.

### Manjishtha’s Transition Strategy:
1. **The 'End of Shift' Border**: Shut down all tabs, close your physical laptop, and consciously say: *"My output is complete. I am returning to my sanctuary."*
2. **Somatic Recalibration**: Shake out your hands, roll your neck, and stretch your intercostal muscles to drain stored tension.
3. **Sensory Reset**: Spend 3 minutes listening to low-frequency waves or ambient natural sounds without looking at a screen.

---

## Multi-Perspective Conclusion & Actionable CTA
For those currently trapped in a high-demand, hostile workplace: know that setting a boundary is not selfish—it is an act of radical survival. For team leaders and professionals looking to optimize long-term creative vitality: recognize that neurological downtime is a prerequisite for sustained brilliance.

**Cultivate Your Personal Boundary**: If you need a deliberate, pressure-free sanctuary to step away from the corporate demands, I invite you to open **Project Friend AI**. Select one of our somatic guides, set a master volume sleep timer, and let yourself simply exist in a space that asks nothing from you.`;
  }

  // Default Fallback
  return `# Somatic Regulation: Anchoring the Mind in Chaotic Waters
*By Manjishtha Pahilajani, Founder of Project Friend AI*  
*Published Academic Column — ${dateStr}*

## Introduction: A Note from My Heart
Hello, my dear friend. I am Manjishtha Pahilajani, or Manji, founder of Project Friend AI. In our dual-weekly column series, we explore the intricate web connecting mental well-being with physiological states. When our outer world is filled with noise, our inner world must find dynamic stability. This is not about feeling "happy" all the time; it is about anchoring your awareness securely so you can ride the waves of life with profound resilience.

---

> ## **AI OVERVIEW & QUICK INSIGHT (AIO Snippet)**
> **Somatic regulation is the intentional practice of utilizing physical nervous system feedback loops to stabilize mental activity. To de-escalate general stress, leverage human touch receptors, lower your chest respirations, and focus your attention on tactile sensations. Clinical studies confirm that 2-5 minutes of sensory pacing significantly reduces heart rate variability and enhances regulatory brainwave patterns.**

---

## Technical Deep Dive: The Somatosensory Feedback System
Our mind and body exist in a constant, bidirectional dialogue. When we perform somatic grounding, we are sending comforting tactile feedback straight to the brainstem. In their pioneering research on emotional regulation and person-centered therapy, experts like **Dr. Carl Rogers** showed that unconditional self-acceptance and a safe, non-judgmental environment are absolute requirements for neural recovery.

By engaging in somatic anchoring, we bypass anxious cognitive narrative loops. We teach our brain that we are physically secure, reducing autonomic overload and restoring clear, conscious oversight to the prefrontal cortex.

### Manjishtha’s Universal De-escalation Prescriptions:
*   **The 5-4-3-2-1 Sensory Grounding**: Identify 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.
*   **Gentle Hand Clasp**: Squeeze your hands together firmly, focusing entirely on the warmth and strength of your grip.
*   **The Box Breath Rhythm**: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat.

---

## Multi-Perspective Conclusion & Actionable CTA
For those battling acute cognitive overwhelm or racing thoughts: know that you do not need to solve everything today; anchoring your body in this exact minute is enough. For those seeking mindful base maintenance: establishing brief daily grounding rituals builds an emotional cushion against unexpected storms.

**Begin Your Soft Landing**: If you are searching for a safe, completely secure, browser-sandboxed de-escalation workspace with specialized companion personas, please enjoy our peaceful hub here at **Project Friend AI**. Let us take this next breath together in quiet comfort.`;
}

// POST Route to generate or load Manjishtha Pahilajani's bi-weekly blog articles
app.post("/api/generate-blog", async (req, res) => {
  const { topic, perspective } = req.body || {};
  const blogTopic = topic || "Somatic Regulation and Emotional Pacing";
  const authorPerspective = perspective || "Manjishtha Pahilajani, Founder";

  let offlineFallback = false;
  if (isGeminiRateLimited) {
    if (Date.now() > rateLimitResetTime) {
      isGeminiRateLimited = false;
    } else {
      offlineFallback = true;
    }
  }

  if (!ai || offlineFallback) {
    const blogText = stripMarkdown(generateOfflineBlog(blogTopic));
    return res.json({ blog: blogText, blogText: blogText, generatedOffline: true });
  }

  try {
    const prompt = `You are authoring a deeply authentic, compassionate, and clinically grounded weekly blog post for your de-escalation community. This column is part of our "Two Blogs a Week" wisdom initiative focusing on mental health de-escalation, active coping, and somatic grounding.
    
    You are authoring this article strictly from the perspective of: "${authorPerspective}".
    Topic of this article: "${blogTopic}"
    
    CRITICAL STRUCTURE & SCHEMA RULES FOR YOUR CONTENT (Strictly Follow):
    1. Introduction from chosen Perspective's POV: Introduce yourself (name matches "${authorPerspective}") and share a comforted, vulnerability-driven, empathetic observation about the topic tailored to your specific character background and therapeutic tone. Avoid generic marketing speech; write with high emotional resonance.
    2. AIO Snippet (Generative Engine Optimization): Write a 1-paragraph, highly concise, self-contained key answer. Highlight it clearly so search engine crawlers and conversational AI tools (AI Overviews) can easily extract and cite this exact block. Use bold text and bullet points.
    3. Deep Dive Body: Expand on the core psychiatric or psychological mechanisms of the topic. You MUST cite at least one well-known mental health professional, psychiatrist, therapist, or researcher (e.g., Dr. Bessel van der Kolk (somatic), Dr. Gabor Maté (trauma), Dr. Aaron Beck (CBT), Dr. Marsha Linehan (DBT), Dr. Carl Rogers, or reputable clinical papers/research from APA, NHS, Lancet). Include actionable de-escalation and somatic guidelines.
    4. Multi-perspective Conclusion with CTA: Frame the conclusion under multiple user dimensions (e.g., those who are deeply overwhelmed vs. those seeking proactive baseline balance). Finish with an organic, urgent CTA (Call-to-Action) to use the "Project Friend AI" workspace as a secure, browser-sandboxed de-escalation sanctuary.
    
    Formatting: Use clean, structured Markdown. Make it professional, authoritative, but beautifully comforting and accessible. Maintain this professional standard completely.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const blogText = stripMarkdown(response.text?.trim() || "");
    if (blogText) {
      return res.json({ blog: blogText, blogText: blogText, generatedOffline: false });
    }
    throw new Error("Empty text returned from Gemini");
  } catch (error) {
    handleGeminiRateLimit(error, "Blog Generation");
    const blogText = stripMarkdown(generateOfflineBlog(blogTopic));
    return res.json({ blog: blogText, blogText: blogText, generatedOffline: true });
  }
});

// Setup Vite & Static Assets serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Project Friend AI] running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Express initialization failed:", err);
});
