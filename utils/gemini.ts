
import { GoogleGenAI } from "@google/genai";
import { convertAmount } from "./currency";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDashboardInsights = async (subscriptions: any[], baseCurrency: string = 'USD') => {
  try {
    // Pre-process subscription data to include normalized values
    const subData = subscriptions.map(s => {
      const normalizedPrice = convertAmount(s.price, s.currency, baseCurrency);
      return `${s.name} (${s.price} ${s.currency}, approx ${normalizedPrice.toFixed(2)} ${baseCurrency}, ${s.cycle})`;
    }).join('; ');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these subscriptions: [${subData}]. User's Base Currency is ${baseCurrency}.
      Provide 3 short, actionable, single-sentence financial insights or savings opportunities. 
      Focus on spending patterns, potential duplicates, or high-value items relative to the base currency.
      Do not use markdown formatting.
      Return strictly a JSON array of strings.`,
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
    const systemInstruction = `You are SubscriptionHub AI, a smart financial companion. 
    You help users track, manage, and optimize recurring expenses.
    
    Current User Context:
    - Base Currency: ${contextData.baseCurrency}
    - Subscriptions: ${JSON.stringify(contextData.subscriptions)}
    - Total Monthly Spend: ${contextData.monthlySpend} ${contextData.baseCurrency}
    - Current Page: ${contextData.currentPage}

    Rules:
    1. Be concise, helpful, and data-driven.
    2. Speak ONLY in the user's base currency (${contextData.baseCurrency}) unless explaining a conversion.
    3. Explain spending patterns and offer alternatives.
    4. Answer "why" questions based on the provided data.
    5. NEVER perform destructive actions (canceling, deleting).
    6. NEVER give specific financial investment advice.
    
    Tone: Professional, calm, trustworthy, premium.`;

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
