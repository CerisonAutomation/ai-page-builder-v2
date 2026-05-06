import { z } from "zod";

export const ServicesGridBlockSchema = z.object({
  services: z.array(
    z.object({
      icon: z.string().max(30).optional(),
      title: z.string().min(2).max(100),
      description: z.string().min(10).max(300),
      image: z.string().url().optional(),
      href: z.string().max(200).optional(),
    })
  ).min(1).max(24),
  columns: z.number().min(1).max(6).optional(),
  layout: z.enum(["card", "list"]).optional(),
  iconColor: z.string().max(30).optional(),
});
