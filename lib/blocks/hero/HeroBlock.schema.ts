import { z } from "zod";

export const HeroBlockSchema = z.object({
  headline: z.string().min(5).max(100),
  subheadline: z.string().min(10).max(250),
  ctaLabel: z.string().min(2).max(40),
  ctaHref: z.string().min(1).max(200),
  bgImage: z.string().url().optional(),
  bgColor: z.string().optional(),
});
