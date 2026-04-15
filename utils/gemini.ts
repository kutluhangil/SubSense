
import { convertAmount } from "./currency";
import { debugLog } from "./debug";
import { Subscription } from "../components/SubscriptionModal";
import { validateSubscription, sanitizeForAI } from "./validateSubscription";

// Gemini REST API — works directly in the browser (no SDK needed)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const getApiKey = (): string => {
  // Use direct static access so Vite replaces this at build time.
  return (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
};

// Type definition for the structured insight
export interface AIInsight {
  type: 'redundancy' | 'optimization' | 'general';
  title: string;
  description: string;
  estimatedSavings: string;
}

// Simple in-memory cache for the session
let cachedInsights: { key: string; data: AIInsight[] } | null = null;

/**
 * Prepares a strictly typed, validated, and sanitized payload for Gemini.
 */
const prepareGeminiPayload = (subscriptions: Subscription[], baseCurrency: string) => {
  const validSubs = subscriptions.filter(validateSubscription);

  const convertedSubs = validSubs.map(s => {
    const safeSub = sanitizeForAI(s);
    const convertedCost = convertAmount(safeSub.price, safeSub.currency, baseCurrency);
    const monthlyCost = safeSub.cycle === 'Yearly' ? convertedCost / 12 : convertedCost;

    return {
      name: safeSub.name,
      category: safeSub.category,
      billingCycle: safeSub.cycle,
      costInBaseCurrency: parseFloat(monthlyCost.toFixed(2))
    };
  });

  return {
    userBaseCurrency: baseCurrency,
    subscriptions: convertedSubs
  };
};

/**
 * Direct REST call to Gemini API — browser-compatible, no CORS issues.
 */
const callGemini = async (prompt: string, systemInstruction?: string): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key missing. AI features disabled.");
    return null;
  }

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    }
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API Error:", res.status, errText);
    throw new Error(`Gemini API returned ${res.status}`);
  }

  const data = await res.json();
  // Extract text from the response
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
};

/**
 * Direct REST call for chat — supports multi-turn conversation history.
 */
const callGeminiChat = async (
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string,
  systemInstruction?: string
): Promise<string | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Gemini API Key missing. AI features disabled.");
    return null;
  }

  // Build the contents array (history + new user message)
  const contents = [
    ...history.map(h => ({
      role: h.role,
      parts: h.parts
    })),
    { role: "user", parts: [{ text: userMessage }] }
  ];

  const body: any = {
    contents,
    generationConfig: {}
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini Chat API Error:", res.status, errText);
    throw new Error(`Gemini API returned ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
};

export const generateDashboardInsights = async (subscriptions: Subscription[], baseCurrency: string = 'USD', languageCode: string = 'en'): Promise<AIInsight[]> => {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  try {
    // Cache Check
    const totalValue = subscriptions.reduce((acc, s) => acc + (s.price || 0), 0);
    const cacheKey = `${subscriptions.length}-${totalValue.toFixed(2)}-${baseCurrency}-${languageCode}-v3`;

    if (cachedInsights && cachedInsights.key === cacheKey) {
      debugLog('AI_LANG', 'Returning cached insights');
      return cachedInsights.data;
    }

    debugLog('AI_LANG', `Generating strict MVP insights in: ${languageCode}`);
    const payload = prepareGeminiPayload(subscriptions, baseCurrency);

    const langInstruction = languageCode === 'tr'
      ? "OUTPUT LANGUAGE: TURKISH (Türkçe). Output values must be in Turkish context."
      : "OUTPUT LANGUAGE: ENGLISH.";

    const prompt = `
      ROLE: You are a conservative Financial Optimization Engine.
      
      GOAL: Analyze subscriptions to find SPECIFIC savings based on 2 logic patterns only.
      
      PATTERNS TO DETECT:
      1. REDUNDANCY: Multiple active subscriptions in the same narrow category (e.g., 2 Music apps, 2 Video Streaming apps).
      2. CYCLE OPTIMIZATION: Monthly subscriptions > 10 ${baseCurrency} where switching to Yearly typically saves ~15-20%.
      
      CONSTRAINTS:
      - DO NOT speculate on Foreign Exchange (FX) rates.
      - DO NOT predict inflation or price hikes.
      - DO NOT make up generic advice like "Stop spending money".
      - Use conservative language: "Estimated", "Potential", "Typically".
      - MAX 2 INSIGHTS total.
      
      ${langInstruction}
      
      DATA:
      ${JSON.stringify(payload, null, 2)}
      
      OUTPUT FORMAT:
      Return a JSON object with a key "insights" containing an array of objects.
      Schema:
      {
        "insights": [
          {
            "type": "redundancy" | "optimization",
            "title": "Short Headline (Max 40 chars)",
            "description": "1 sentence explanation.",
            "estimatedSavings": "String with currency symbol, e.g. '$24/yr' or 'None'"
          }
        ]
      }
    `;

    const text = await callGemini(prompt);
    if (!text) return [];

    const resultObj = JSON.parse(text);
    const results: AIInsight[] = resultObj.insights || [];

    cachedInsights = { key: cacheKey, data: results };
    return results;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    const fallback: AIInsight[] = languageCode === 'tr' ? [
      { type: 'optimization', title: 'Yıllık Plan Tasarrufu', description: 'Bazı abonelikleri yıllığa çevirmek %20 tasarruf sağlayabilir.', estimatedSavings: 'Tahmini %20' }
    ] : [
      { type: 'optimization', title: 'Switch to Annual', description: 'Switching monthly plans to yearly often saves ~20%.', estimatedSavings: 'Est. 20%' }
    ];
    return fallback;
  }
};

export const chatWithGemini = async (history: any[], userMessage: string, contextData: any, languageCode: string = 'en') => {
  const apiKey = getApiKey();
  if (!apiKey) return "I'm currently offline or misconfigured. Please try again later.";

  try {
    debugLog('AI_LANG', `Chat request in: ${languageCode}`);
    const payload = prepareGeminiPayload(contextData.subscriptions, contextData.baseCurrency);

    let languageRules = languageCode === 'tr' ? "RESPOND IN TURKISH ONLY." : "RESPOND IN ENGLISH ONLY.";

    const systemInstruction = `
    ROLE: SubscriptionHub AI Assistant.
    ${languageRules}
    
    TONE: Professional, concise, data-driven.
    
    LIMITATIONS:
    - You cannot access real-time bank data.
    - You cannot predict future exchange rates.
    
    CONTEXT:
    ${JSON.stringify(payload)}
    
    GOAL: Help the user understand their spending patterns based ONLY on the provided context.
    `;

    const text = await callGeminiChat(history, userMessage, systemInstruction);
    return text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my intelligence layer right now.";
  }
};
