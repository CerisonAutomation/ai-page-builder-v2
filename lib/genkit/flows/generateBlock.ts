/**
 * Generate Block Flow
 * ✅ Strict z.enum validation, prevents invalid blocks
 * ✅ Block schemas injected into prompt for correct prop shapes
 */

import { z } from "zod";
import { AVAILABLE_BLOCKS, puckConfig } from "@/lib/puck/config";
import { ai } from "@/lib/genkit/ai";
import { blockSchemaMap, blockSchemaPromptMap } from "@/lib/genkit/blockSchemas";
import { logger } from "@/lib/utils/logger";

// ✅ STRICT OUTPUT SCHEMA (enum, not string)
export const BlockOutputSchema = z.object({
    componentName: z.enum(AVAILABLE_BLOCKS as [string, ...string[]]),
    props: z.record(z.string(), z.unknown()),
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
      }) as any,
      outputSchema: BlockOutputSchema as any,
    } as any,
    async ({ prompt, context }) => {
    // Build available blocks list with labels AND prop schemas
    const blockDescriptions = AVAILABLE_BLOCKS.map((name) => {
      const label =
        puckConfig.components[name as keyof typeof puckConfig.components]?.label ?? name;
      const schema = blockSchemaPromptMap[name] ?? "{}";
      return `${name} (${label}):\n  props schema: ${schema}`;
    }).join("\n\n");

    const systemPrompt = `
You are an expert page builder assistant. Your job is to generate realistic, production-quality block content.

Available blocks and their required prop shapes:
${blockDescriptions}

Rules:
1. componentName MUST be one of the available blocks (exact match)
2. props MUST match the block's schema — all required fields must be present
3. Generate realistic content (no Lorem ipsum, no placeholders)
4. For array fields, include 3-4 items minimum
5. Text should be engaging and professional
6. All required text fields must be non-empty strings
7. URLs should be realistic paths (use /demo, /signin, /pricing, etc.)
8. Colors should be web-safe (hex values preferred)
9. Return ONLY valid JSON — no markdown, no code blocks

Response format:
{
  "componentName": "BlockName",
  "props": { ... },
  "reasoning": "why this block matches the request"
}
`;

    const userPrompt = `${context ? `Page context: ${context}\n` : ""}User request: "${prompt}"

Generate a single block that best matches this request.`;

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

      // ✅ Validate props against the block-specific Zod schema
      const blockZodSchema = blockSchemaMap[validated.componentName];
      if (blockZodSchema) {
        const propsResult = blockZodSchema.safeParse(validated.props);
        if (!propsResult.success) {
          logger.warn("AI generated props failed schema validation, using as-is", {
            block: validated.componentName,
            errors: propsResult.error.flatten(),
          });
        }
      }

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
export { ai };
export default generateBlockFlow;
