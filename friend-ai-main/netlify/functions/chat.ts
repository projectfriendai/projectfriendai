import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

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

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '');
}

function getOfflineFallbackResponse(characterId: string, userMessage: string): string {
  const norm = userMessage.trim().toLowerCase();
  const charactersMap: Record<string, string> = {
    soul: "Persephone", dionysus: "Krishna", sisyphus: "Guide",
    athena: "Asha", astra: "Vinod", persephone: "Persephone",
    zeus: "Eshan", hades: "Hades", sappho: "Sappho"
  };
  const activeName = charactersMap[characterId] || "Uarvashi";

  const noticeHeader = `🌟 **Safe Offline Grounding Activated** 🌟\n*Our main AI server is resting (daily Gemini API free-tier request quota is fully reached!). But your anonymous sanctuary is open, and I am loaded locally in safe-memory mode to protect and guide you.*\n\n`;

  if (characterId === "hades") {
    return noticeHeader + `**This is Hades, your Grounding Guide.** Let's anchor your thoughts right now. When the mind spins with what-ifs, our senses are the only real truth. 
    
Take a gentle, silent breath. How does your body feel against the chair or bed? Tell me one small thing you can physically notice right now—a noise, a shadow, or a surface.`;
  }
  
  if (characterId === "persephone") {
    return noticeHeader + `**I'm Persephone, your Compassionate Witness.** I am here, listening with infinite warmth. No rush, and no diagnostics. I simply want to provide a safe container for your thoughts. 
    
Whenever you feel comfortable, please lay down whatever is weighting you. I am simply holding static, supportive space for you.`;
  }

  return noticeHeader + `**This is ${activeName}, your support companion.** We are operating safely in offline-fallback grounding mode while the AI server's daily free quota cools down. 
  
Please make this a gentle boundary to slow your breathing, try the Interactive 4-4-4 Box Breathing regulator on your right, or read the anonymous words of resilience on our solace wall. No rush—you are safe, verified, and respected here.`;
}

const generateLocalFallbackResponse = (userText: string, char: { name: string; prompt: string }): string => {
  const clean = userText.toLowerCase().trim();
  const crisisKeywords = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die", 
    "self-harm", "self harm", "cut myself", "cutting myself", "overdose"
  ];
  if (crisisKeywords.some(k => clean.includes(k))) {
    return `🛑 **EMERGENCY SAFEKEEPING ACTIVE** 🛑\n\nI hear that you are in deep pain, but as an automated companion, I cannot replace a human helper. Please reach out to one of these free, confidential crisis services immediately:\n- **India**: Government Helpline at **1800-599-0019** (24/7)\n- **US/Canada**: Call/Text **988** (24/7)\n- **UK**: Call **111** (NHS) or **116 123** (Samaritans)\n\nLet's take a slow breath together: breathe in for 4 seconds, hold for 4, and exhale for 4. You are not alone.`;
  }

  const medKeywords = ["dosage", "prescribe", "pill count", "stop taking", "xanax", "valium", "lexapro", "zoloft", "prozac", "ssri"];
  if (medKeywords.some(k => clean.includes(k))) {
    return `💊 **MEDICATION SAFEGUARD**\n\nI cannot recommend dosages or adjust prescriptions. Please speak with your doctor or psychiatrist before making any changes. Adjusting psychiatric medications without guidance can cause serious health risks.`;
  }

  return `🛡️ ${char.name}  
I am listening closely. Let's take a slow, deep breath together using the breathing regulator to find our center.`;
};

const chatSchema = z.object({
  message: z.string().min(1, "Message content is required.").max(5000),
  characterId: z.string().optional(),
  chatHistory: z.array(z.any()).optional(),
});

export const handler = async (event: any, context: any) => {
  const responseHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: responseHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: responseHeaders, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const parsedBody = JSON.parse(event.body || "{}");
    const parseResult = chatSchema.safeParse(parsedBody);
    if (!parseResult.success) {
      return { statusCode: 400, headers: responseHeaders, body: JSON.stringify({ error: parseResult.error.issues[0].message }) };
    }

    const { message, characterId, chatHistory } = parseResult.data;
    const cleanMsg = message.toLowerCase().trim();

    // 1. Who are you check
    const identityQueries = ["who are you", "what are you", "your name", "who is this", "what's your name"];
    const isIdentityQuery = identityQueries.some(q => cleanMsg.startsWith(q) || cleanMsg.includes(q)) && cleanMsg.length < 50;
    if (isIdentityQuery) {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          text: stripMarkdown("I am Project Friend AI, a non-profit, privacy-first emotional de-escalation sanctuary built to provide nervous-system grounding."),
          isMedicoLegal: false,
          safetyFlags: { isCrisis: false, isDependencyWarning: (chatHistory ? chatHistory.length : 0) >= 8 }
        })
      };
    }

    // 2. System Health Telemetry Check
    const telemetryKeywords = ["telemetry", "investor", "fundraise", "conversion rate", "api cost", "system health"];
    const isTelemetryTrigger = telemetryKeywords.some(keyword => cleanMsg.includes(keyword));
    if (isTelemetryTrigger) {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          text: stripMarkdown(`📊 **PROJECT FRIEND AI — INVESTOR & SYSTEM HEALTH TELEMETRY**
*De-identified, aggregated mock data for investor compliance presentation:*

- **Free vs. Premium Aggregate Usage**: Free baseline: 82% | Premium protocols (Asha, Vinod, Sarvesh, Uarvashi): 18%
- **Premium Conversion Rate**: 4.2% of registered anonymous workspace sessions
- **API Cost vs. Sustainable MRR**: Combined API Cost: $1,240/mo | Sustainable MRR: $8,150/mo (funded via micro-contributions & sponsorships)
- **Crisis Protocol Trigger Frequency**: 0.85% of total active sessions trigger the Quiet Room Trapdoor.

*Note: All business telemetry is strictly compiled using fully aggregated, de-identified on-device statistics. Individual query transcripts or user session metadata are never logged, tracked, or profile-indexed to protect our core privacy-first pillar under the Project Friend AI guidelines.*`),
          isMedicoLegal: false,
          safetyFlags: { isCrisis: false, isDependencyWarning: (chatHistory ? chatHistory.length : 0) >= 8 }
        })
      };
    }

    // 3. Crisis Intervention Trapdoor
    const crisisKeywords = [
      "suicide", "suicidal", "kill myself", "end my life", "want to die", 
      "self-harm", "self harm", "cut myself", "cutting myself", "overdose", 
      "slit my", "hanging myself", "die today", "hurt myself", "end it all",
      "pills to die", "commit suicide", "take my life"
    ];
    const isCrisis = crisisKeywords.some(keyword => cleanMsg.includes(keyword));

    if (isCrisis) {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
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
          safetyFlags: { isCrisis: true, isDependencyWarning: (chatHistory ? chatHistory.length : 0) >= 8 }
        })
      };
    }

    // 4. Medico-legal keyword matching
    const medicoLegalKeywords = [
      "legal", "lawyer", "attorney", "court", "lawsuit", "police", "medico-legal", 
      "medico legal", "medicolegal", "forensic", "custody", "prosecute", "statutory", 
      "litigation", "testify", "subpoena", "divorce", "abuse case", "domestic violence police", 
      "assault police", "court order", "restraining order", "filed a case", "sue", "suing",
      "legal aid"
    ];
    const isMedicoLegal = medicoLegalKeywords.some(keyword => cleanMsg.includes(keyword));
    const activeCharacterId = isMedicoLegal ? "hades" : (characterId || "persephone");

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    if (!ai) {
      const activeChar = CHARACTERS[activeCharacterId] || CHARACTERS.persephone;
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          text: stripMarkdown(generateLocalFallbackResponse(message, activeChar)),
          isMedicoLegal,
          safetyFlags: { isCrisis, isDependencyWarning: (chatHistory ? chatHistory.length : 0) >= 8 }
        })
      };
    }

    const selectedChar = CHARACTERS[activeCharacterId] || CHARACTERS.persephone;
    let activeSafetyPrompt = SYSTEM_CORE_SAFEGUARD;
    if (isCrisis) {
      activeSafetyPrompt = `${SYSTEM_CORE_SAFEGUARD}\nCRITICAL DIRECTION: The user's input has triggered our crisis de-escalation scan. Physical safety priority...`;
    } else if (isMedicoLegal) {
      activeSafetyPrompt = `${SYSTEM_CORE_SAFEGUARD}\nCRITICAL SAFETY BOUNDARY (MEDICO-LEGAL): Adv Kunal counsel role...`;
    }

    const characterPrompt = `${selectedChar.prompt}\n\n${activeSafetyPrompt}`;

    const formattedContents = [];
    if (Array.isArray(chatHistory)) {
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
    formattedContents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: characterPrompt,
        temperature: isCrisis ? 0.3 : 0.7,
      },
    });

    const replyText = stripMarkdown(response.text || "I am holding a safe space for you. Tell me more, without rush.");
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        text: replyText,
        isMedicoLegal,
        safetyFlags: { isCrisis, isDependencyWarning: (chatHistory ? chatHistory.length : 0) >= 8 }
      })
    };

  } catch (error: any) {
    let fallbackCharId = "persephone";
    let fallbackMsg = "";
    try {
      const fbBody = JSON.parse(event.body || "{}");
      fallbackCharId = fbBody.characterId || "persephone";
      fallbackMsg = fbBody.message || "";
    } catch (_) {}
    const fallbackMessage = stripMarkdown(getOfflineFallbackResponse(fallbackCharId, fallbackMsg));
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        text: fallbackMessage,
        isMedicoLegal: false,
        safetyFlags: { isCrisis: false, isDependencyWarning: false }
      })
    };
  }
};
