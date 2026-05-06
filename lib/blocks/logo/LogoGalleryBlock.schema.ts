import { z } from "zod";

export const LogoGalleryBlockSchema = z.object({
  logos: z.array(
    z.object({
      image: z.string().url(),
      alt: z.string().min(1).max(100),
      href: z.string().url().optional(),
    })
  ).min(1).max(24),
  columns: z.number().min(1).max(6).optional(),
  grayscale: z.boolean().optional(),
  carouselMode: z.boolean().optional(),
});
