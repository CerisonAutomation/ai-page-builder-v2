import { z } from "zod";

export const HeroVideoBlockSchema = z.object({
  videoUrl: z.string().url(),
  fallbackImage: z.string().url().optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  muted: z.boolean().optional(),
  headline: z.string().max(100).optional(),
  subheadline: z.string().max(250).optional(),
});
