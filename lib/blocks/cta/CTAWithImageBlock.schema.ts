import { z } from "zod";

export const CTAWithImageBlockSchema = z.object({
  headline: z.string().min(5).max(100),
  subheadline: z.string().max(250).optional(),
  image: z.string().url().optional(),
  primaryCta: z.string().min(2).max(40),
  primaryHref: z.string().min(1).max(200),
  secondaryCta: z.string().max(40).optional(),
  secondaryHref: z.string().max(200).optional(),
  imagePosition: z.enum(["left", "right"]).optional(),
  bgColor: z.string().optional(),
});
