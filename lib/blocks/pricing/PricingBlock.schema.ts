import { z } from "zod";

export const PricingBlockSchema = z.object({
  title: z.string().max(100).optional(),
  plans: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        price: z.string().min(1).max(30),
        features: z.array(z.string().min(2).max(120)).min(1).max(10),
        cta: z.string().min(2).max(40),
        ctaHref: z.string().min(1).max(200),
        highlighted: z.boolean().optional(),
      })
    )
    .min(1)
    .max(5),
});
