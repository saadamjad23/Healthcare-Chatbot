
import { GoogleGenAI, Chat } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';

let ai: GoogleGenAI | null = null;

try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. Is the API_KEY environment variable set?", error);
  // We'll let the UI handle the display of this error.
}

export function createChatSession(): Chat | null {
  if (!ai) {
    return null;
  }
  return ai.chats.create({
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
  });
}
