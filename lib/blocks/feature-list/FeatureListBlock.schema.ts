import { z } from "zod";

export const FeatureListBlockSchema = z.object({
  features: z
    .array(
      z.object({
        icon: z.string().max(10),
        title: z.string().min(2).max(80),
        description: z.string().min(5).max(300),
      })
    )
    .min(1)
    .max(10),
});
