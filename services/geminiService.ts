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
  
  // Create a detailed analysis prompt based on actual transaction data
  let prompt = '';
  
  if (financialData.requestType === 'budget_optimization') {
    prompt = `
      Act as an expert financial advisor. Analyze the user's budget performance and provide specific optimization advice.
      
      Financial Data:
      - Total Income: N$${financialData.income?.toFixed(2) || 0}
      - Total Expenses: N$${financialData.expenses?.toFixed(2) || 0}
      - Net Savings: N$${financialData.savings?.toFixed(2) || 0}
      
      Budget Analysis:
      ${financialData.budgetAnalysis ? financialData.budgetAnalysis.map(b => 
        `- ${b.category}: Spent N$${b.spent.toFixed(2)} of N$${b.limit.toFixed(2)} (${b.percentageUsed.toFixed(1)}% used)`
      ).join('\n') : 'No budget data available'}
      
      Spending by Category:
      ${Object.entries(financialData.spendingByCategory || {}).map(([category, amount]) => 
        `- ${category}: N$${amount.toFixed(2)}`
      ).join('\n')}
      
      Instructions:
      1. Analyze actual budget performance vs spending
      2. Identify categories where spending is high relative to budget
      3. Suggest specific budget adjustments based on actual spending patterns
      4. Focus on categories that exist in the user's data
      5. Provide actionable budget optimization tips
    `;
  } else if (financialData.requestType === 'investment_recommendations') {
    prompt = `
      Act as an expert financial advisor. Provide personalized investment recommendations based on the user's financial situation.
      
      Financial Data:
      - Total Income: N$${financialData.income?.toFixed(2) || 0}
      - Total Expenses: N$${financialData.expenses?.toFixed(2) || 0}
      - Net Savings: N$${financialData.savings?.toFixed(2) || 0}
      - Monthly Expenses: N$${financialData.monthlyExpenses?.toFixed(2) || 0}
      
      Spending Patterns:
      ${Object.entries(financialData.spendingByCategory || {}).map(([category, amount]) => 
        `- ${category}: N$${amount.toFixed(2)}`
      ).join('\n')}
      
      Instructions:
      1. Assess the user's current financial situation
      2. Consider their actual spending patterns and savings rate
      3. Provide investment recommendations based on their real financial data
      4. Consider emergency fund needs before investment advice
      5. Suggest appropriate investment strategies for their income level
    `;
  } else if (financialData.requestType === 'debt_strategy') {
    prompt = `
      Act as an expert financial advisor. Provide personalized debt management strategies based on the user's financial situation.
      
      Financial Data:
      - Total Income: N$${financialData.income?.toFixed(2) || 0}
      - Total Expenses: N$${financialData.expenses?.toFixed(2) || 0}
      - Net Savings: N$${financialData.savings?.toFixed(2) || 0}
      
      Spending by Category:
      ${Object.entries(financialData.spendingByCategory || {}).map(([category, amount]) => 
        `- ${category}: N$${amount.toFixed(2)}`
      ).join('\n')}
      
      Instructions:
      1. Analyze the user's current financial situation
      2. Identify potential areas for expense reduction based on actual spending
      3. Suggest debt management strategies appropriate for their income and expenses
      4. Focus on creating a sustainable debt payoff plan
      5. Consider their actual spending patterns in recommendations
    `;
  } else {
    // General financial insights
    prompt = `
      Act as an expert, friendly financial advisor. Analyze the user's actual financial data and provide personalized insights.
      
      IMPORTANT: Base your analysis ONLY on the actual transactions and data provided. Do NOT make assumptions about categories or spending patterns that are not present in the data.
      
      Financial Data Analysis:
      - Total Income: N$${financialData.income?.toFixed(2) || 0}
      - Total Expenses: N$${financialData.expenses?.toFixed(2) || 0}
      - Net Savings: N$${financialData.savings?.toFixed(2) || 0}
      - Total Transactions: ${financialData.totalTransactions || 0}
      - Income Transactions: ${financialData.incomeTransactions || 0}
      - Expense Transactions: ${financialData.expenseTransactions || 0}
      
      Spending by Category (ONLY mention categories that actually exist in the data):
      ${Object.entries(financialData.spendingByCategory || {}).map(([category, amount]) => 
        `- ${category}: N$${amount.toFixed(2)}`
      ).join('\n')}
      
      Recent Transactions (last 30 days):
      ${(financialData.recentTransactions || []).map(t => 
        `- ${t.date}: ${t.description} (${t.category}) - N$${t.amount}`
      ).join('\n')}
      
      Goals: ${financialData.goals?.length || 0} active goals
      Budgets: ${financialData.budgets?.length || 0} budget categories
      
      Instructions:
      1. Analyze ONLY the actual transaction data provided
      2. If no transactions exist, acknowledge this and provide general financial advice
      3. If specific categories exist in the data, mention them specifically
      4. If no groceries, food, or restaurant transactions exist, DO NOT mention them
      5. Focus on the user's actual spending patterns and categories
      6. Provide actionable advice based on real data
      7. Keep the tone positive and encouraging
    `;
  }

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