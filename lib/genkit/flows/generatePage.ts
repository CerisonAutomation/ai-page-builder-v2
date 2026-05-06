/**
 * Generate Full Page Flow
 * ✅ Creates multi-block pages from description
 * ✅ Accepts optional theme context for brand-aligned generation
 */

import { z } from "zod";
import { ai } from "@/lib/genkit/ai";
import { puckConfig, AVAILABLE_BLOCKS, emptyPage } from "@/lib/puck/config";
import { blockSchemaPromptMap } from "@/lib/genkit/blockSchemas";
import { logger } from "@/lib/utils/logger";
import type { Data } from "@measured/puck";

// ✅ PUCK DATA SCHEMA (validated)
const PuckContentItemSchema = z.object({
  type: z.enum(AVAILABLE_BLOCKS as [string, ...string[]]),
  props: z.record(z.unknown()),
  readOnly: z.record(z.boolean()).optional(),
});

const PuckDataSchema = z.object({
  content: z
    .array(PuckContentItemSchema)
    .min(1)
    .max(12)
    .describe("1-12 blocks in order"),
  root: z.object({
    props: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
    }),
  }),
  zones: z.record(z.array(PuckContentItemSchema)).optional(),
});

export type PageOutput = z.infer<typeof PuckDataSchema>;

// ✅ PAGE GENERATION FLOW
export const generatePageFlow = ai.defineFlow(
  {
    name: "generatePage",
    inputSchema: z.object({
      description: z.string().min(10).max(800),
      industry: z.string().optional(),
      tone: z.enum(["professional", "casual", "bold", "minimal"]).optional(),
      themeContext: z
        .object({
          colorPrimary: z.string().optional(),
          industry: z.string().optional(),
          brandTone: z.string().optional(),
        })
        .optional(),
    }),
    outputSchema: PuckDataSchema,
  },
  async ({ description, industry = "technology", tone = "professional", themeContext }) => {
    const componentList = AVAILABLE_BLOCKS.join(", ");
    const blockSchemas = AVAILABLE_BLOCKS.map(
      (name) =>
        `${name}: ${blockSchemaPromptMap[name] ?? "{}"}`
    ).join("\n\n");

    const brandContext = themeContext
      ? [
          themeContext.colorPrimary && `Brand color: ${themeContext.colorPrimary}`,
          themeContext.brandTone && `Brand tone: ${themeContext.brandTone}`,
          themeContext.industry && `Industry: ${themeContext.industry}`,
        ]
          .filter(Boolean)
          .join(". ")
      : "";

    const systemPrompt = `
You are an expert landing page designer. Create a complete, production-quality Puck page as JSON.

Available components: ${componentList}

Block prop schemas:
${blockSchemas}

Page layout patterns (in order):
1. Hero (headline, CTA)
2. Features/Benefits (CardGrid or FeatureList)
3. Social Proof (Stats or Testimonials)
4. CTA or Pricing
5. FAQ or Timeline

Tone: ${tone}
Industry: ${industry}${brandContext ? `\n${brandContext}` : ""}

Rules:
1. Use 4-8 blocks (logical order: Hero → Benefits → Proof → CTA)
2. Each block must have complete, realistic props matching the schema above
3. No placeholder text (Lorem ipsum forbidden)
4. All array fields: minimum 3 items
5. URLs realistic (/pricing, /signin, /docs, etc)
6. Match tone to content style
7. Output ONLY valid JSON

Puck data format:
{
  "content": [
    { "type": "HeroBlock", "props": {...} },
    ...
  ],
  "root": {
    "props": { "title": "...", "description": "..." }
  }
}
`;

    const userPrompt = `Create a ${industry} page with this brief:
"${description}"

Generate a complete, ready-to-publish page with 5-7 blocks in logical order.`;

    try {
      const { output } = await ai.generate({
        model: "googleai/gemini-2.0-flash",
        prompt: userPrompt,
        system: systemPrompt,
        output: { schema: PuckDataSchema },
      });

      if (!output) {
        logger.warn("No output from Gemini, returning empty page");
        return { ...emptyPage, zones: {} } as Data;
      }

      // ✅ USE safeParse FOR GRACEFUL ERROR HANDLING
      const validation = PuckDataSchema.safeParse(output);

      if (!validation.success) {
        logger.warn("Invalid page schema", undefined, {
          errors: validation.error.flatten().fieldErrors,
        });
        return { ...emptyPage, zones: {} } as Data;
      }

      const validated = validation.data;

      // ✅ Filter out invalid blocks as extra safety layer
      const validContent = validated.content.filter((item) =>
        AVAILABLE_BLOCKS.includes(item.type)
      );

      if (validContent.length === 0) {
        logger.warn("No valid blocks in generated page");
        return { ...emptyPage, zones: {} } as Data;
      }

      return {
        ...validated,
        content: validContent,
        zones: validated.zones ?? {},
      } as Data;
    } catch (error) {
      logger.error("Unexpected error in generatePageFlow", error);
      return { ...emptyPage, zones: {} } as Data;
    }
  }
);

export default generatePageFlow;
