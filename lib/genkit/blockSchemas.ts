/**
 * Block Schemas — maps each block name to its Zod schema and a
 * human-readable JSON-schema string suitable for injecting into AI prompts.
 */

import { z } from "zod";
import { HeroBlockSchema } from "@/lib/blocks/hero/HeroBlock.schema";
import { CardGridBlockSchema } from "@/lib/blocks/card-grid/CardGridBlock.schema";
import { FeatureListBlockSchema } from "@/lib/blocks/feature-list/FeatureListBlock.schema";
import { StatsBlockSchema } from "@/lib/blocks/stats/StatsBlock.schema";
import { CTABlockSchema } from "@/lib/blocks/cta/CTABlock.schema";
import { FAQBlockSchema } from "@/lib/blocks/faq/FAQBlock.schema";
import { PricingBlockSchema } from "@/lib/blocks/pricing/PricingBlock.schema";
import { TestimonialBlockSchema } from "@/lib/blocks/testimonial/TestimonialBlock.schema";
import { TimelineBlockSchema } from "@/lib/blocks/timeline/TimelineBlock.schema";
import { GalleryBlockSchema } from "@/lib/blocks/gallery/GalleryBlock.schema";

/** Map from block name → Zod object schema */
export const blockSchemaMap: Record<string, z.ZodTypeAny> = {
  HeroBlock: HeroBlockSchema,
  CardGridBlock: CardGridBlockSchema,
  FeatureListBlock: FeatureListBlockSchema,
  StatsBlock: StatsBlockSchema,
  CTABlock: CTABlockSchema,
  FAQBlock: FAQBlockSchema,
  PricingBlock: PricingBlockSchema,
  TestimonialBlock: TestimonialBlockSchema,
  TimelineBlock: TimelineBlockSchema,
  GalleryBlock: GalleryBlockSchema,
};

/**
 * Converts a Zod schema to a compact JSON-schema-like string for use in
 * AI system prompts. Keeps it readable without requiring the full jsonschema lib.
 */
type ZodCheck = { kind: string; value?: number };

function getChecks(schema: z.ZodString | z.ZodNumber): ZodCheck[] {
  return (schema._def.checks ?? []) as ZodCheck[];
}

function zodToPromptString(schema: z.ZodTypeAny, indent = 0): string {
  const pad = "  ".repeat(indent);

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const fields = Object.entries(shape)
      .map(([key, val]) => `${pad}  "${key}": ${zodToPromptString(val, indent + 1)}`)
      .join(",\n");
    return `{\n${fields}\n${pad}}`;
  }

  if (schema instanceof z.ZodArray) {
    return `[${zodToPromptString(schema.element, indent)}]`;
  }

  if (schema instanceof z.ZodOptional) {
    return `${zodToPromptString(schema.unwrap(), indent)} (optional)`;
  }

  if (schema instanceof z.ZodString) {
    const checks = getChecks(schema);
    const minCheck = checks.find((c) => c.kind === "min");
    const maxCheck = checks.find((c) => c.kind === "max");
    if (minCheck || maxCheck) {
      return `string(min:${minCheck?.value ?? 0}, max:${maxCheck?.value ?? "∞"})`;
    }
    return "string";
  }

  if (schema instanceof z.ZodNumber) {
    const checks = getChecks(schema);
    const minCheck = checks.find((c) => c.kind === "min");
    const maxCheck = checks.find((c) => c.kind === "max");
    if (minCheck || maxCheck) {
      return `number(min:${minCheck?.value ?? 0}, max:${maxCheck?.value ?? "∞"})`;
    }
    return "number";
  }

  if (schema instanceof z.ZodBoolean) return "boolean";
  if (schema instanceof z.ZodEnum) {
    const values: unknown[] =
      (schema._def as { values?: unknown[] }).values ?? [];
    return values.map((o) => `"${String(o)}"`).join(" | ");
  }

  return "any";
}

/** Map from block name → prompt-ready schema description string */
export const blockSchemaPromptMap: Record<string, string> = Object.fromEntries(
  Object.entries(blockSchemaMap).map(([name, schema]) => [
    name,
    zodToPromptString(schema),
  ])
);
