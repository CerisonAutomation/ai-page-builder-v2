/**
 * Generate Block Flow
 * ✅ Strict z.enum validation, prevents invalid blocks
 */

import { z } from "zod";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { AVAILABLE_BLOCKS, puckConfig, AllBlockProps } from "@/lib/puck/config";
import { logger } from "@/lib/utils/logger";

// ✅ INITIALIZE GENKIT
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY! })],
  model: "googleai/gemini-2.0-flash",
});

// ✅ STRICT OUTPUT SCHEMA (enum, not string)
export const BlockOutputSchema = z.object({
  componentName: z.enum(AVAILABLE_BLOCKS as [string, ...string[]]),
  props: z.record(z.unknown()),
  reasoning: z.string().optional(),
});

export type BlockOutput = z.infer<typeof BlockOutputSchema>;

// ✅ BLOCK GENERATION FLOW
export const generateBlockFlow = ai.defineFlow(
  {
    name: "generateBlock",
    inputSchema: z.object({
      prompt: z.string().min(3).max(500),
      context: z.string().optional(),
    }),
    outputSchema: BlockOutputSchema,
  },
  async ({ prompt, context }) => {
    // Build available blocks list with descriptions
    const blockDescriptions = AVAILABLE_BLOCKS.map(
      (name) => `${name}: ${puckConfig.components[name as keyof typeof puckConfig.components]?.label}`
    ).join("\n");

    const systemPrompt = `
You are an expert page builder assistant. Your job is to generate realistic, production-quality block content.

Available blocks:
${blockDescriptions}

Rules:
1. componentName MUST be one of the available blocks (exact match)
2. props must be valid JSON matching the block's expected shape
3. Generate realistic content (no Lorem ipsum, no placeholders)
4. For array fields, include 3-4 items minimum
5. Text should be engaging and professional
6. All text fields required, no null values
7. URLs should be realistic (use /demo, /signin, etc.)
8. Colors should be web-safe (hex or named)

Respond with ONLY valid JSON:
{
  "componentName": "BlockName",
  "props": { ... },
  "reasoning": "why this block matches the request"
}
`;

    const userPrompt = `
${context ? `Page context: ${context}\n` : ""}
User request: "${prompt}"

Generate a single block that best matches this request.
`;

    try {
      const { output } = await ai.generate({
        model: "googleai/gemini-2.0-flash",
        prompt: userPrompt,
        system: systemPrompt,
        output: { schema: BlockOutputSchema },
      });

      if (!output) {
        throw new Error("No output from Gemini");
      }

      // ✅ Validate output matches schema
      const validated = BlockOutputSchema.parse(output);

      // ✅ Double-check block exists in config
      if (!(validated.componentName in puckConfig.components)) {
        throw new Error(
          `Invalid block: ${validated.componentName}. Must be one of: ${AVAILABLE_BLOCKS.join(", ")}`
        );
      }

      return validated;
    } catch (error) {
      logger.error("Failed to generate block", error);
      throw error;
    }
  }
);

// ✅ EXPORT FOR NEXT.js API ROUTE
export default generateBlockFlow;
