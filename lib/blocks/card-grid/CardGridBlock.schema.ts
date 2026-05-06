import { z } from "zod";

export const CardGridBlockSchema = z.object({
  title: z.string().min(2).max(100),
  columns: z.number().min(1).max(4).optional(),
  cards: z
    .array(
      z.object({
        title: z.string().min(2).max(80),
        body: z.string().min(5).max(300),
        icon: z.string().max(10),
        href: z.string().min(1).max(200),
      })
    )
    .min(1)
    .max(8),
});
