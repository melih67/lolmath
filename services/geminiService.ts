import { GoogleGenAI } from "@google/genai";
import { MatchupAnalysis, ApiResponse, GroundingChunk } from "../types";

const apiKey = process.env.API_KEY;

// Using gemini-3-pro-preview for complex reasoning and search capabilities
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeMatchup = async (
  myChampion: string,
  enemyChampion: string,
  role: string
): Promise<ApiResponse> => {
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables.");
  }

  const prompt = `
    You are a world-class League of Legends analyst and mathematician.
    Analyze the matchup: ${myChampion} (me) vs ${enemyChampion} (enemy) in the ${role} role.
    
    Use the latest available data (current patch).
    
    Your goal is to provide a MATHEMATICALLY OPTIMIZED build and strategy.
    
    IMPORTANT: For Item and Rune names, use the exact English names as they appear in the game (e.g. "Blade of the Ruined King" not "BORK", "Press the Attack" not "PTA") so they can be mapped to icons programmatically.
    
    Output a strictly valid JSON object inside a markdown code block (\`\`\`json ... \`\`\`).
    The JSON must match this structure exactly:
    {
      "champion": "${myChampion}",
      "opponent": "${enemyChampion}",
      "role": "${role}",
      "patch": "string (e.g. 14.x or 15.x)",
      "winRatePrediction": "string (e.g. 48%)",
      "runes": {
        "keystone": "string",
        "primaryTree": ["string", "string", "string"],
        "secondaryTree": ["string", "string"],
        "shards": ["string", "string", "string"],
        "explanation": "string (Explain using numbers why this is optimal, e.g. damage values, cooldowns)"
      },
      "build": {
        "starting": [{"name": "string", "reason": "string (math based)"}],
        "core": [{"name": "string", "reason": "string (math/gold efficiency)"}],
        "situational": [{"name": "string", "reason": "string"}]
        "explanation": "string (General build math)"
      },
      "skills": {
        "maxOrder": ["string (e.g. Q)", "string", "string"],
        "explanation": "string (Why max this first? Cite base damage increases per rank vs scaling)"
      },
      "mathAnalysis": {
        "tradingPattern": "string (How to trade based on CD and range)",
        "efficiencyStats": "string (Specific stats like Gold Efficiency or DPS comparisons)"
      },
      "powerCurve": [
        {"time": 0, "myPower": number (0-100), "enemyPower": number (0-100)},
        {"time": 5, "myPower": number, "enemyPower": number},
        {"time": 10, "myPower": number, "enemyPower": number},
        {"time": 15, "myPower": number, "enemyPower": number},
        {"time": 20, "myPower": number, "enemyPower": number},
        {"time": 25, "myPower": number, "enemyPower": number},
        {"time": 30, "myPower": number, "enemyPower": number},
        {"time": 35, "myPower": number, "enemyPower": number}
      ]
    }
    
    Make sure the reasoning is heavy on MATH and DATA (e.g., "BotRK deals 12% current HP which is better than X lethality against this HP stacker").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Extract JSON from the markdown code block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let analysisData: MatchupAnalysis | null = null;
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        analysisData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini response", e);
        // Fallback: try to find raw JSON if code block fails
        const rawJsonMatch = text.match(/\{[\s\S]*\}/);
        if (rawJsonMatch) {
             try {
                analysisData = JSON.parse(rawJsonMatch[0]);
             } catch (e2) {
                 console.error("Failed to parse raw JSON", e2);
             }
        }
      }
    }

    // Extract sources
    const sources: { title: string; url: string }[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    
    if (groundingChunks) {
      groundingChunks.forEach(chunk => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            url: chunk.web.uri,
          });
        }
      });
    }

    return {
      data: analysisData,
      sources: sources,
    };

  } catch (error) {
    console.error("Error fetching analysis:", error);
    throw error;
  }
};
