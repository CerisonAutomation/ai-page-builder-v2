/**
 * Shared Genkit AI instance
 * Import `ai` from here instead of creating a new instance per flow.
 */

import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY! })],
  model: "googleai/gemini-2.0-flash",
});
