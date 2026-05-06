import { z } from "zod";

export const CTABlockSchema = z.object({
  headline: z.string().min(5).max(100),
  body: z.string().min(10).max(300),
  primaryCta: z.string().min(2).max(40),
  primaryHref: z.string().min(1).max(200),
  secondaryCta: z.string().max(40).optional(),
  secondaryHref: z.string().max(200).optional(),
});
