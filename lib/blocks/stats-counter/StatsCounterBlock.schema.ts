import { z } from "zod";

export const StatsCounterBlockSchema = z.object({
  stats: z.array(
    z.object({
      value: z.number().min(0),
      label: z.string().min(2).max(60),
      icon: z.string().max(30).optional(),
      prefix: z.string().max(10).optional(),
      suffix: z.string().max(10).optional(),
    })
  ).min(1).max(8),
  animated: z.boolean().optional(),
  columns: z.number().min(1).max(6).optional(),
  bgColor: z.string().optional(),
});
