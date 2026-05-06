import { z } from "zod";

export const TimelineBlockSchema = z.object({
  events: z
    .array(
      z.object({
        date: z.string().min(1).max(30),
        title: z.string().min(2).max(100),
        body: z.string().min(5).max(400),
      })
    )
    .min(1)
    .max(12),
});
