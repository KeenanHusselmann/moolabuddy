import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { FinancialContent, AIInsight } from "../types";

// Support both API_KEY and GEMINI_API_KEY environment variables
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("API_KEY or GEMINI_API_KEY environment variable not set. Gemini API calls will be disabled.");
  console.warn("Please create a .env.local file with your Gemini API key from https://aistudio.google.com/app/apikey");
}

// The API key is passed at initialization. The functions below will guard against making calls if the key is missing.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const insightSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise, encouraging summary of the user's current financial situation (1-2 sentences)." },
        tips: {
            type: Type.ARRAY,
            description: "Exactly three actionable, personalized tips. Each tip should have a type and a description.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['savings', 'spending', 'investment'], description: "The category of the tip." },
                    description: { type: Type.STRING, description: "The detailed tip for the user (1-2 sentences)." },
                },
                required: ['type', 'description']
            }
        },
        observation: { type: Type.STRING, description: "One insightful prediction or observation about their financial habits (1-2 sentences)." },
    },
    required: ['summary', 'tips', 'observation'],
};

export const getFinancialInsights = async (financialData: any): Promise<AIInsight | null> => {
  if (!API_KEY) {
    console.error("API Key not configured.");
    return null;
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    Act as an expert, friendly financial advisor. Based on the following financial data, provide a structured analysis in JSON format.
    The data should include a concise summary, exactly three actionable tips (categorized as 'savings', 'spending', or 'investment'), and one final observation about their habits.
    Keep the tone positive, encouraging, and empowering.

    Financial Data:
    ${JSON.stringify(financialData, null, 2)}
  `;

  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightSchema,
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AIInsight;
  } catch (error) {
    console.error("Error getting financial insights:", error);
    return null;
  }
};

export const getProjectionAnalysis = async (projectionParams: any): Promise<string> => {
    if (!API_KEY) return "API Key not configured.";
    
    const model = 'gemini-2.5-flash';
    const prompt = `
      A user is making a financial projection with these parameters: ${JSON.stringify(projectionParams)}.
      In a friendly and clear tone, explain what this projection means for their financial future.
      Highlight one potential risk or consideration, and suggest one strategy to potentially accelerate their goal.
      Keep the analysis concise and easy to understand.
    `;
  
    try {
      const response: GenerateContentResponse = await ai!.models.generateContent({
          model: model,
          contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error getting projection analysis:", error);
      return "Sorry, I couldn't analyze the projection. Please check the parameters and try again.";
    }
};


export const getFinancialContent = async (topic: string): Promise<FinancialContent> => {
  if (!API_KEY) return { videos: [], articles: [] };

  const model = "gemini-2.5-flash";
  const prompt = `
    For a user interested in "${topic}", generate a list of 5 engaging YouTube video titles and 5 informative financial article headlines.
  `;

  try {
    const response: GenerateContentResponse = await ai!.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            videos: {
              type: Type.ARRAY,
              description: "List of 5 YouTube video titles.",
              items: { type: Type.STRING },
            },
            articles: {
              type: Type.ARRAY,
              description: "List of 5 financial article headlines.",
              items: { type: Type.STRING },
            },
          },
          required: ["videos", "articles"],
        },
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as FinancialContent;

  } catch (error) {
    console.error("Error fetching financial content:", error);
    return {
      videos: ["Could not fetch video suggestions."],
      articles: ["Could not fetch article suggestions."],
    };
  }
};