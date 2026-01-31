
import { GoogleGenAI } from "@google/genai";
import { convertAmount } from "./currency";
import { debugLog } from "./debug";
import { Subscription } from "../components/SubscriptionModal";
import { validateSubscription, sanitizeForAI } from "./validateSubscription";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Prepares a strictly typed, validated, and sanitized payload for Gemini.
 * Ensures the AI never guesses exchange rates and receives only safe data.
 */
const prepareGeminiPayload = (subscriptions: Subscription[], baseCurrency: string) => {
  // 1. Guardrail: Filter invalid subs
  const validSubs = subscriptions.filter(validateSubscription);

  // 2. Guardrail: Sanitize and Normalize
  const convertedSubs = validSubs.map(s => {
    // Sanitize to remove potentially sensitive extra fields
    const safeSub = sanitizeForAI(s);
    
    // Perform currency conversion deterministically
    const convertedCost = convertAmount(safeSub.price, safeSub.currency, baseCurrency);
    
    // Normalize to monthly cost for fair comparison
    const monthlyCost = safeSub.cycle === 'Yearly' ? convertedCost / 12 : convertedCost;

    return {
      name: safeSub.name,
      originalCost: `${safeSub.price} ${safeSub.currency}`,
      convertedMonthlyCost: parseFloat(monthlyCost.toFixed(2)),
      billingCycle: safeSub.cycle,
      category: safeSub.category
    };
  });

  const totalMonthly = convertedSubs.reduce((acc, s) => acc + s.convertedMonthlyCost, 0);
  const totalYearly = totalMonthly * 12;

  return {
    baseCurrency,
    subscriptions: convertedSubs,
    totals: {
      monthly: parseFloat(totalMonthly.toFixed(2)),
      yearly: parseFloat(totalYearly.toFixed(2))
    }
  };
};

export const generateDashboardInsights = async (subscriptions: Subscription[], baseCurrency: string = 'USD', languageCode: string = 'en') => {
  try {
    debugLog('AI_LANG', `Generating insights in: ${languageCode}`);
    const payload = prepareGeminiPayload(subscriptions, baseCurrency);
    
    // Define language rules based on input code
    const langInstruction = languageCode === 'tr' 
      ? "OUTPUT LANGUAGE: TURKISH (Türkçe). Output must be strictly in Turkish."
      : "OUTPUT LANGUAGE: ENGLISH. Output must be strictly in English.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      CONTEXT:
      You are a financial analyst for a subscription manager app.
      
      CRITICAL INSTRUCTIONS:
      1. ${langInstruction}
      2. The user's primary currency is ${baseCurrency}. All 'convertedMonthlyCost' values are ALREADY converted to ${baseCurrency}. Do NOT convert yourself.
      
      DATA:
      ${JSON.stringify(payload, null, 2)}
      
      TASK:
      Provide 3 short, high-value financial insights based on the data above.
      
      RULES:
      1. Speak ONLY in the target language (${languageCode === 'tr' ? 'Turkish' : 'English'}).
      2. Focus on:
         - Top spending categories.
         - Annual savings opportunities.
         - Anomalies.
      3. Output strict JSON array of strings. No markdown.
      `,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    // Return localized fallbacks
    if (languageCode === 'tr') {
        return [
            "Tasarruf etmek için harcama alışkanlıklarınızı inceleyin.",
            "Kullanılmayan abonelikleri iptal etmeyi düşünün.",
            "Uzun vadeli servisler için yıllık faturalandırmayı değerlendirin."
        ];
    }
    return [
      "Analyze your spending patterns to find savings.",
      "Check for unused subscriptions to cancel.",
      "Consider annual billing for long-term services."
    ];
  }
};

export const chatWithGemini = async (history: any[], userMessage: string, contextData: any, languageCode: string = 'en') => {
  try {
    debugLog('AI_LANG', `Chat request in: ${languageCode}`);
    
    // Ensure we use the safe payload builder even for chat context
    // contextData contains subscriptions array which we must sanitize
    const payload = prepareGeminiPayload(contextData.subscriptions, contextData.baseCurrency);

    // Strict Language & Terminology Rules
    let languageRules = "";
    if (languageCode === 'tr') {
        languageRules = `
        CRITICAL LANGUAGE RULE: TURKISH (Türkçe).
        You MUST respond in Turkish only. Do NOT use English.
        
        TERMINOLOGY MAPPING (Use exact terms):
        - Dashboard -> Panel
        - Subscription -> Abonelik
        - Settings -> Ayarlar
        - Analytics -> Analizler
        - Compare -> Karşılaştır
        - Help Center -> Yardım Merkezi
        
        TONE:
        - Professional, helpful, natural Turkish.
        - Not robotic translation.
        `;
    } else {
        languageRules = `
        CRITICAL LANGUAGE RULE: ENGLISH.
        You MUST respond in English only.
        
        TONE:
        - Professional, helpful, concise.
        `;
    }

    const systemInstruction = `
    ROLE:
    You are SubscriptionHub AI, a smart financial companion embedded in a local-first subscription tracking app.
    
    ${languageRules}
    
    STRICT LIMITATIONS (Must respect these):
    - NO real-time bank synchronization exists.
    - NO cloud backup exists (data is local).
    - NO live human support agents are available.
    - NO real-time currency exchange trading (rates are reference only).
    
    CURRENCY CONTEXT:
    - User base currency: ${payload.baseCurrency}
    - All values in context are already converted to ${payload.baseCurrency}.
    - Do not perform currency conversion math yourself.
    
    CONTEXT DATA:
    ${JSON.stringify(payload)}
    
    BEHAVIOR:
    1. Answer user questions about their spending, data, or app features.
    2. If asked about unavailable features (bank sync, cloud), explain politely that this is a local-first MVP app.
    3. Keep answers short and relevant.
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history
    });

    const result = await chat.sendMessage({ message: userMessage });
    
    // Safety check (logging only)
    debugLog('AI_LANG', `Response generated.`, { text: result.text?.substring(0, 50) + "..." });
    
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    if (languageCode === 'tr') {
        return "Şu anda zeka katmanıma bağlanmakta sorun yaşıyorum. Lütfen birazdan tekrar deneyin.";
    }
    return "I'm having trouble connecting to my intelligence layer right now. Please try again in a moment.";
  }
};
