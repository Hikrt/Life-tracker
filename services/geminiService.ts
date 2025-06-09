
import { GoogleGenAI, GenerateContentResponse, Part } from '@google/genai';
import { GEMINI_TEXT_MODEL } from '../constants';
import { GroundingChunk } from '../types';


// This service file is more for structure demonstration.
// The actual Gemini API call is currently within VoiceAssistant.tsx for simplicity.
// In a larger application, these functions would be centralized here.

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY && API_KEY !== "YOUR_API_KEY") {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI in service:", e);
  }
} else {
  console.warn("Gemini API Key not configured in geminiService.ts. Features using this service might not work.");
}

interface GeminiQueryResponse {
  text: string | null;
  groundingChunks?: GroundingChunk[];
  error?: string;
}

export const queryGeminiText = async (prompt: string, systemInstruction?: string, requestJson: boolean = false): Promise<GeminiQueryResponse> => {
  if (!ai) {
    return { text: null, error: "AI Service not initialized. Check API Key." };
  }

  try {
    const contents: Part[] = [{text: prompt}];
    const requestPayload: any = {
        model: GEMINI_TEXT_MODEL,
        contents: { role: "user", parts: contents },
        config: {}
    };

    if (systemInstruction) {
        requestPayload.config.systemInstruction = systemInstruction;
    }
    
    // Example of enabling search, adjust as needed. Only enable if not requesting JSON.
    if (!requestJson) {
      requestPayload.config.tools = [{googleSearch: {}}];
    }
    
    if (requestJson) {
      requestPayload.config.responseMimeType = "application/json";
    }


    const response: GenerateContentResponse = await ai.models.generateContent(requestPayload);
    
    let generatedText = response.text; // .text property directly gives the string
     
    if (!generatedText) {
      // Check for safety ratings or blocked responses if text is unexpectedly empty
      if (response.candidates && response.candidates[0] && response.candidates[0].finishReason === 'SAFETY') {
          return { text: null, error: "Response blocked due to safety concerns."};
      }
      return { text: null, error: "No text content in response." };
    }
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

    return { text: generatedText, groundingChunks: chunks };

  } catch (e: any) {
    console.error("Gemini API error in service:", e);
    return { text: null, error: `API Error: ${e.message || 'Unknown error'}` };
  }
};

export const parseJsonFromGeminiResponse = (responseText: string): any | null => {
    if (!responseText) return null;
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) { // match[1] captures the content within the fences
      jsonStr = match[1].trim();
    }
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", e);
      console.error("Original string for parsing was:", jsonStr); 
      // Attempt to parse even if no fences were found, as it might be raw JSON
      try {
          return JSON.parse(responseText.trim());
      } catch (e2) {
          console.error("Secondary attempt to parse raw JSON also failed:", e2);
          return null;
      }
    }
};
