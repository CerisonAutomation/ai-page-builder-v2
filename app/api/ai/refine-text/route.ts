/**
 * Text Refinement API Route
 * ✅ Streams refined text with Gemini using genkit
 * Supports: make shorter, more engaging, professional tone, fix grammar
 */

import { appRoute } from "@genkit-ai/next";
import { defineFlow, streamText } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { z } from "zod";

const ai = googleAI();

// ✅ TEXT REFINEMENT SCHEMA
const refineTextSchema = z.object({
  text: z.string().min(1, "Text is required"),
  instruction: z.enum([
    "shorter",
    "engaging",
    "professional",
    "grammar",
    "custom",
  ]),
  customPrompt: z.string().optional(),
  context: z.string().optional(), // e.g., "hero headline", "product description"
});

type RefineTextInput = z.infer<typeof refineTextSchema>;

// ✅ REFINEMENT PROMPTS
const refinementPrompts: Record<string, (text: string, context?: string) => string> = {
  shorter: (text, context) =>
    `Make this text shorter and more concise while keeping the key message. ${context ? `Context: ${context}` : ""}\n\nOriginal: "${text}"\n\nRefined (short version only, no explanation):`,

  engaging: (text, context) =>
    `Rewrite this to be more engaging, compelling, and dynamic. Use active voice. ${context ? `Context: ${context}` : ""}\n\nOriginal: "${text}"\n\nRefined (only the refined text, no explanation):`,

  professional: (text, context) =>
    `Rewrite this in a professional, formal tone suitable for business communication. ${context ? `Context: ${context}` : ""}\n\nOriginal: "${text}"\n\nRefined (only the refined text, no explanation):`,

  grammar: (text, context) =>
    `Fix all grammar, spelling, and punctuation errors. Keep the original meaning and tone. ${context ? `Context: ${context}` : ""}\n\nOriginal: "${text}"\n\nRefined (only corrected text, no explanation):`,

  custom: (text, context) => text, // Will use customPrompt instead
};

// ✅ GENKIT FLOW FOR TEXT REFINEMENT
export const refineTextFlow = defineFlow(
  {
    name: "refineText",
    inputSchema: refineTextSchema,
    streamSchema: z.object({
      chunk: z.string(),
      refined: z.string().optional(),
      isComplete: z.boolean().optional(),
    }),
  },
  async function* (input) {
    const { text, instruction, customPrompt, context } = input;

    // Build prompt
    let prompt: string;
    if (instruction === "custom" && customPrompt) {
      prompt = `${customPrompt}\n\nOriginal text: "${text}"${
        context ? `\n\nContext: ${context}` : ""
      }\n\nRefined (only output the refined text, no explanation):`;
    } else {
      prompt = refinementPrompts[instruction](text, context);
    }

    let refined = "";

    // ✅ STREAM TEXT RESPONSE
    const stream = await streamText({
      prompt,
      model: ai.model("gemini-1.5-flash"),
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    // Yield chunks as they arrive
    for await (const chunk of stream.stream) {
      refined += chunk.text();
      yield {
        chunk: chunk.text(),
        refined: refined.trim(),
        isComplete: false,
      };
    }

    // Final complete refinement
    yield {
      chunk: "",
      refined: refined.trim(),
      isComplete: true,
    };
  }
);

// ✅ NEXT.JS ROUTE HANDLER
export const POST = appRoute(refineTextFlow);
