import { GoogleGenAI } from "@google/genai";

import { ENV } from "./env.config";

export const getAI = new GoogleGenAI({
  apiKey: ENV.GEMINI_API_KEY,
});

export const genAIModel = "gemini-2.0-flash";
