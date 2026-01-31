
import { GoogleGenAI } from "@google/genai";
import { convertAmount } from "./currency";
import { debugLog } from "./debug";
import { Subscription } from "../components/SubscriptionModal";
import { validateSubscription, sanitizeForAI } from "./validateSubscription";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Type definition for the structured insight
export interface AIInsight {
  type: 'redundancy' | 'optimization' | 'general';
  title: string;
  description: string;
  estimatedSavings: string; // e.g. "$120/yr"
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
    // Standardize to monthly for analysis
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

export const generateDashboardInsights = async (subscriptions: Subscription[], baseCurrency: string = 'USD', languageCode: string = 'en'): Promise<AIInsight[]> => {
  try {
    // 1. Cache Check
    const totalValue = subscriptions.reduce((acc, s) => acc + (s.price || 0), 0);
    const cacheKey = `${subscriptions.length}-${totalValue.toFixed(2)}-${baseCurrency}-${languageCode}-v2`;

    if (cachedInsights && cachedInsights.key === cacheKey) {
        debugLog('AI_LANG', 'Returning cached insights');
        return cachedInsights.data;
    }

    debugLog('AI_LANG', `Generating strict MVP insights in: ${languageCode}`);
    const payload = prepareGeminiPayload(subscriptions, baseCurrency);
    
    // Strict language instruction
    const langInstruction = languageCode === 'tr' 
      ? "OUTPUT LANGUAGE: TURKISH (Türkçe). Output values must be in Turkish context."
      : "OUTPUT LANGUAGE: ENGLISH.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
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
      `,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const resultObj = JSON.parse(text);
    const results: AIInsight[] = resultObj.insights || [];
    
    // Update cache
    cachedInsights = { key: cacheKey, data: results };
    
    return results;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    // Fallback static insights
    const fallback: AIInsight[] = languageCode === 'tr' ? [
        { type: 'optimization', title: 'Yıllık Plan Tasarrufu', description: 'Bazı abonelikleri yıllığa çevirmek %20 tasarruf sağlayabilir.', estimatedSavings: 'Tahmini %20' }
    ] : [
        { type: 'optimization', title: 'Switch to Annual', description: 'Switching monthly plans to yearly often saves ~20%.', estimatedSavings: 'Est. 20%' }
    ];
    return fallback;
  }
};

export const chatWithGemini = async (history: any[], userMessage: string, contextData: any, languageCode: string = 'en') => {
  // Existing chat logic remains, but leveraging the same conservative persona
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

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: { systemInstruction },
      history: history
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my intelligence layer right now.";
  }
};
