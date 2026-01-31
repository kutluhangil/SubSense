
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDashboardInsights = async (subscriptions: any[]) => {
  try {
    const subData = subscriptions.map(s => `${s.name} (${s.price} ${s.currency}, ${s.cycle})`).join(', ');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these subscriptions: [${subData}]. 
      Provide 3 short, actionable, single-sentence financial insights or savings opportunities. 
      Focus on spending patterns, potential duplicates, or high-value items.
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
    - Subscriptions: ${JSON.stringify(contextData.subscriptions)}
    - Total Monthly Spend: ${contextData.monthlySpend}
    - Current Page: ${contextData.currentPage}

    Rules:
    1. Be concise, helpful, and data-driven.
    2. Explain spending patterns and offer alternatives.
    3. Answer "why" questions based on the provided data.
    4. NEVER perform destructive actions (canceling, deleting).
    5. NEVER give specific financial investment advice.
    6. If asked to delete or change something, explain how the user can do it manually.
    
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
