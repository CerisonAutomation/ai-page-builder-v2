import { z } from "zod";

export const StatsBlockSchema = z.object({
  stats: z
    .array(
      z.object({
        value: z.string().min(1).max(20),
        label: z.string().min(2).max(60),
        unit: z.string().max(10).optional(),
      })
    )
    .min(1)
    .max(8),
});
