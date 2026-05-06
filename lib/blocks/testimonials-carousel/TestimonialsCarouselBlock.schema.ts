import { z } from "zod";

export const TestimonialsCarouselBlockSchema = z.object({
  testimonials: z.array(
    z.object({
      text: z.string().min(10).max(500),
      author: z.string().min(2).max(60),
      role: z.string().max(100).optional(),
      avatar: z.string().url().optional(),
      rating: z.number().min(1).max(5).optional(),
    })
  ).min(1).max(12),
  autoplay: z.boolean().optional(),
  layout: z.enum(["card", "minimal", "full"]).optional(),
  showRating: z.boolean().optional(),
});
