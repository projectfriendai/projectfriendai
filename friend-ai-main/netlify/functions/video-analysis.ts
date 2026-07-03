import { GoogleGenAI } from "@google/genai";

const CHARACTERS: Record<string, { name: string; prompt: string }> = {
  soul: {     name: "Soul", prompt: "" },
  dionysus: {     name: "Dionysus", prompt: "" },
  sisyphus: {     name: "Sisyphus", prompt: "" },
  athena: {     name: "Athena", prompt: "" },
  astra: {     name: "Astra", prompt: "" },
  persephone: {     name: "Persephone", prompt: "" },
  zeus: {     name: "Zeus", prompt: "" },
  hades: {     name: "Hades", prompt: "" },
  sappho: {     name: "Sappho", prompt: "" }
};

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '');
}

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
    const { image, selfNotes, characterId } = parsedBody;

    const targetChar = CHARACTERS[characterId || "persephone"] || CHARACTERS.persephone;
    const localFeedback = `You have logged an optional personal reflection moment with ${targetChar.name}. Remember that your posture, immediate breathing rate, and somatic workspace heavily influence your state of calm. Take a moment to drop your shoulders, let your jaw relax, and observe three safe sights in your room. I'm here with you.`;

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    if (!ai) {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({ text: stripMarkdown(`🛡️ [Safe Standalone Guidance]\n\n${targetChar.name}: ${localFeedback}`) })
      };
    }

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
Your core approach prompt details.
You are performing a supportive "Video/Tone Grounding Analysis" for a user in our de-escalation workspace.
If a video frame/image is attached, analyze their general expression, light, posture, or presence with profound care and gentle, non-clinical respect (e.g., whether they look tense, tired, or quiet). Speak about colors, posture, and visual composition supportively.
If they wrote notes: "${selfNotes || "No notes provided"}".
Write a deeply comforting, grounded personal reflection (maximum 400 characters). Offer gentle physical somatic prompts (e.g. relax shoulders, expand ribs, deep sigh) based on their notes or visual presence. 
Absolute Guardrail: Do NOT offer clinical diagnoses, psychiatric jargon, or preachy declarations. Keep the tone intimate and authentic to your character. Must be very comforting and short.`;

    parts.push({ text: systemPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
    });

    const aiText = stripMarkdown(response.text?.trim() || "");
    if (aiText) {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({ text: aiText })
      };
    }

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({ text: stripMarkdown(`💡 [Empathetic Analysis]\n\n${targetChar.name}: ${localFeedback}`) })
    };

  } catch (error: any) {
    const parsedBody = JSON.parse(event.body || "{}");
    const { characterId } = parsedBody;
    const targetChar = CHARACTERS[characterId || "persephone"] || CHARACTERS.persephone;
    const localFeedback = `You have logged an optional personal reflection moment with ${targetChar.name}. Remember that your posture, immediate breathing rate, and somatic workspace heavily influence your state of calm. Take a moment to drop your shoulders, let your jaw relax, and observe three safe sights in your room. I'm here with you.`;
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({ text: stripMarkdown(`💡 [Somatic Posture Reflection]\n\n${targetChar.name}: ${localFeedback}`) })
    };
  }
};
