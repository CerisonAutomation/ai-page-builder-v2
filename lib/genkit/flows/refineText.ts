/**
 * Refine Text Flow
 * Streams refined text with Gemini.
 * Supports: shorter, engaging, professional, grammar, custom modes.
 */

import { z } from "zod";
import { ai } from "@/lib/genkit/ai";

// ✅ TEXT REFINEMENT SCHEMA
export const RefineTextInputSchema = z.object({
  text: z.string().min(1, "Text is required"),
  instruction: z.enum([
    "shorter",
    "engaging",
    "professional",
    "grammar",
    "custom",
  ]),
  customPrompt: z.string().optional(),
  context: z.string().optional(),
});

export type RefineTextInput = z.infer<typeof RefineTextInputSchema>;

// ✅ REFINEMENT PROMPTS
const refinementPrompts: Record<
  string,
  (text: string, context?: string) => string
> = {
  shorter: (text, context) =>
    `Make this text shorter and more concise while keeping the key message. ${context ? `Context: ${context}` : ""}\n\nOriginal: "${text}"\n\nRefined (short version only, no explanation):`,

  engaging: (text, context) =>
    `Rewrite this to be more engaging, compelling, and dynamic. Use active voice. ${context ? `Context: ${context}` : ""}\n\nOriginal: "${text}"\n\nRefined (only the refined text, no explanation):`,

  professional: (text, context) =>
    `Rewrite this in a professional, formal tone suitable for business communication. ${context ? `Context: ${context}` : ""}\n\nOriginal: "${text}"\n\nRefined (only the refined text, no explanation):`,

  grammar: (text, context) =>
    `Fix all grammar, spelling, and punctuation errors. Keep the original meaning and tone. ${context ? `Context: ${context}` : ""}\n\nOriginal: "${text}"\n\nRefined (only corrected text, no explanation):`,

  custom: (text) => text,
};

// ✅ GENKIT FLOW FOR TEXT REFINEMENT
export const refineTextFlow = ai.defineStreamingFlow(
  {
    name: "refineText",
    inputSchema: RefineTextInputSchema,
    streamSchema: z.object({
      chunk: z.string(),
      refined: z.string().optional(),
      isComplete: z.boolean().optional(),
    }),
    outputSchema: z.object({
      refined: z.string(),
    }),
  },
  async (input, streamingCallback) => {
    const { text, instruction, customPrompt, context } = input;

    let prompt: string;
    if (instruction === "custom" && customPrompt) {
      prompt = `${customPrompt}\n\nOriginal text: "${text}"${
        context ? `\n\nContext: ${context}` : ""
      }\n\nRefined (only output the refined text, no explanation):`;
    } else {
      prompt = refinementPrompts[instruction](text, context);
    }

    let refined = "";

    const { stream } = await ai.generateStream({
      model: "googleai/gemini-2.0-flash",
      prompt,
      config: { temperature: 0.7, maxOutputTokens: 500 },
    });

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      refined += chunkText;
      streamingCallback?.({
        chunk: chunkText,
        refined: refined.trim(),
        isComplete: false,
      });
    }

    streamingCallback?.({
      chunk: "",
      refined: refined.trim(),
      isComplete: true,
    });

    return { refined: refined.trim() };
  }
);

export default refineTextFlow;
