import { z } from "zod";

export const PropertiesGridBlockSchema = z.object({
  properties: z.array(
    z.object({
      image: z.string().url().optional(),
      title: z.string().min(2).max(100),
      price: z.string().min(1).max(50),
      beds: z.number().min(0).optional(),
      baths: z.number().min(0).optional(),
      sqft: z.number().min(0).optional(),
      location: z.string().max(100).optional(),
    })
  ).min(1).max(24),
  columns: z.number().min(1).max(6).optional(),
  showDetails: z.boolean().optional(),
  cardVariant: z.enum(["standard", "compact"]).optional(),
});
