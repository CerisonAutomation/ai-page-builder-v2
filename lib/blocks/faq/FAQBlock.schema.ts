import { z } from "zod";

export const FAQBlockSchema = z.object({
  title: z.string().max(100).optional(),
  items: z
    .array(
      z.object({
        question: z.string().min(5).max(200),
        answer: z.string().min(10).max(800),
      })
    )
    .min(1)
    .max(15),
});
