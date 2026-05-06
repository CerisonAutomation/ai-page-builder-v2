import { z } from "zod";

export const TestimonialBlockSchema = z.object({
  quotes: z
    .array(
      z.object({
        text: z.string().min(10).max(500),
        author: z.string().min(2).max(80),
        role: z.string().min(2).max(100),
        avatar: z.string().url().optional(),
      })
    )
    .min(1)
    .max(8),
});
