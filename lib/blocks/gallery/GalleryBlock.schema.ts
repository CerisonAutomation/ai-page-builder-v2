import { z } from "zod";

export const GalleryBlockSchema = z.object({
  images: z.array(z.string().url()).min(1).max(24),
  columns: z.number().min(1).max(6).optional(),
  gap: z.number().min(0).max(16).optional(),
});
