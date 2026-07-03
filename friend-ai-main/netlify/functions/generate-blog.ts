import { GoogleGenAI } from "@google/genai";

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '');
}

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
    rateLimitResetTime = Date.now() + 5 * 60 * 1000;
  } else if (is503) {
    isGeminiRateLimited = true;
    rateLimitResetTime = Date.now() + 2 * 60 * 1000;
  }
}

function generateOfflineBlog(topic: string): string {
  return `### Somatic Grounding and Emotional Recovery: Navigating Waves of Anxiety
*By Project Friend AI Support Team*

When anxiety hits, our sympathetic nervous system enters high-arousal fight-or-flight mode. Our breathing becomes shallow, our heart rate spikes, and our thoughts race. In these moments, cognitive reframing alone is often insufficient because the body's safety detectors are fully active.

According to trauma and somatic specialist **Dr. Bessel van der Kolk**, author of *The Body Keeps the Score*, to change how we feel, we must learn to regulate our physical state. 

**Core Somatic Grounding Practice:**
1. **Paced Breathing**: Inhale slowly for 4 seconds, hold for 4 seconds, exhale for 4 seconds, and pause for 4 seconds.
2. **Body Check**: Dropping the shoulders and unclenching the jaw signals back to the brain that the immediate threat has passed.

By practicing these physical anchors, we can gently de-escalate panic waves and reclaim our baseline calm. You can use our secure, browser-sandboxed de-escalation workspace as a safe haven to ground yourself anytime.`;
}

export const handler = async (event: any, context: any) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const responseHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { blogTopic, authorPerspective } = body;
    const topic = blogTopic || "Somatic Pacing and Emotional Pacing";
    const author = authorPerspective || "Manjishtha Pahilajani, Founder";

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

    if (!ai || !checkGeminiRateLimit()) {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({ blogText: generateOfflineBlog(topic) })
      };
    }

    const prompt = `You are authoring a deeply authentic, compassionate, and clinically grounded weekly blog post for your de-escalation community. This column is part of our "Two Blogs a Week" wisdom initiative focusing on mental health de-escalation, active coping, and somatic grounding.
    
You are authoring this article strictly from the perspective of: "${author}".
Topic of this article: "${topic}"

CRITICAL STRUCTURE & SCHEMA RULES FOR YOUR CONTENT (Strictly Follow):
1. Introduction from chosen Perspective's POV: Introduce yourself (name matches "${author}") and share a comforted, vulnerability-driven, empathetic observation about the topic tailored to your specific character background and therapeutic tone. Avoid generic marketing speech; write with high emotional resonance.
2. AIO Snippet (Generative Engine Optimization): Write a 1-paragraph, highly concise, self-contained key answer. Highlight it clearly so search engine crawlers and conversational AI tools (AI Overviews) can easily extract and cite this exact block. Use bold text and bullet points.
3. Deep Dive Body: Expand on the core psychiatric or psychological mechanisms of the topic. You MUST cite at least one well-known mental health professional, psychiatrist, therapist, or researcher (e.g., Dr. Bessel van der Kolk (somatic), Dr. Gabor Maté (trauma), Dr. Aaron Beck (CBT), Dr. Marsha Linehan (DBT), Dr. Carl Rogers, or reputable clinical papers/research from APA, NHS, Lancet). Include actionable de-escalation and somatic guidelines.
4. Multi-perspective Conclusion with CTA: Frame the conclusion under multiple user dimensions (e.g., those who are deeply overwhelmed vs. those seeking proactive baseline balance). Finish with an organic, urgent CTA (Call-to-Action) to use the "Project Friend AI" workspace as a secure, browser-sandboxed de-escalation sanctuary.

Formatting: Use clean, structured Markdown. Make it professional, authoritative, but beautifully comforting and accessible. Maintain this professional standard completely.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const blogText = response.text || "";
    if (blogText.trim()) {
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({ blogText })
      };
    }

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({ blogText: generateOfflineBlog(topic) })
    };

  } catch (error) {
    handleGeminiRateLimit(error, "Blog Generator");
    const body = JSON.parse(event.body || "{}");
    const topic = body.blogTopic || "Somatic Pacing and Emotional Pacing";
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({ blogText: generateOfflineBlog(topic) })
    };
  }
};
