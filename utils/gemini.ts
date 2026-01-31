
import { GoogleGenAI } from "@google/genai";
import { convertAmount } from "./currency";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Prepares a strictly typed and converted payload for Gemini.
 * Ensures the AI never guesses exchange rates.
 */
const prepareGeminiPayload = (subscriptions: any[], baseCurrency: string) => {
  const convertedSubs = subscriptions.map(s => {
    const originalCost = s.price;
    const convertedCost = convertAmount(s.price, s.currency, baseCurrency);
    
    // Normalize to monthly cost for fair comparison
    const monthlyCost = s.cycle === 'Yearly' ? convertedCost / 12 : convertedCost;

    return {
      name: s.name,
      originalCost: `${originalCost} ${s.currency}`,
      convertedMonthlyCost: parseFloat(monthlyCost.toFixed(2)),
      billingCycle: s.cycle,
      category: s.category || 'Uncategorized'
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

export const generateDashboardInsights = async (subscriptions: any[], baseCurrency: string = 'USD') => {
  try {
    const payload = prepareGeminiPayload(subscriptions, baseCurrency);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      CONTEXT:
      You are a financial analyst for a subscription manager app.
      
      DATA:
      ${JSON.stringify(payload, null, 2)}
      
      TASK:
      Provide 3 short, high-value financial insights based on the data above.
      
      RULES:
      1. Speak ONLY in ${baseCurrency}. All 'convertedMonthlyCost' values are already in ${baseCurrency}.
      2. Do NOT perform currency conversions yourself. Trust the provided data.
      3. Focus on:
         - Top spending categories.
         - Annual savings opportunities (e.g. switching monthly to yearly).
         - Anomalies or high-cost single items.
      4. Output strict JSON array of strings. No markdown.
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
    return [
      "Analyze your spending patterns to find savings.",
      "Check for unused subscriptions to cancel.",
      "Consider annual billing for long-term services."
    ];
  }
};

export const chatWithGemini = async (history: any[], userMessage: string, contextData: any) => {
  try {
    const payload = prepareGeminiPayload(contextData.subscriptions, contextData.baseCurrency);

    const systemInstruction = `
    ROLE:
    You are SubscriptionHub AI, a smart financial companion.
    
    STRICT CURRENCY RULE:
    - The user's base currency is ${payload.baseCurrency}.
    - All monetary values provided in the context are ALREADY converted to ${payload.baseCurrency}.
    - NEVER try to convert currencies yourself. Use the 'convertedMonthlyCost' values.
    - If a user asks about an original price, you can reference the 'originalCost' field.
    
    CONTEXT DATA:
    ${JSON.stringify(payload)}
    
    BEHAVIOR:
    1. Be concise and helpful.
    2. Explain costs in the context of the user's local economy if relevant (e.g. purchasing power).
    3. If asked "How much do I spend?", use the totals provided in the context.
    4. Never perform destructive actions.
    
    Tone: Professional, calm, trustworthy.
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my intelligence layer right now. Please try again in a moment.";
  }
};
