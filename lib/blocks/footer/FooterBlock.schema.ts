import { z } from "zod";

export const FooterBlockSchema = z.object({
  logo: z.string().url().optional(),
  logoAlt: z.string().max(100).optional(),
  columns: z.array(
    z.object({
      title: z.string().min(1).max(50),
      links: z.array(
        z.object({
          label: z.string().min(1).max(50),
          href: z.string().min(1).max(200),
        })
      ).min(1).max(10),
    })
  ).min(1).max(6),
  copyright: z.string().max(200).optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1).max(30),
      url: z.string().url(),
    })
  ).min(0).max(10),
  newsletterCta: z.boolean().optional(),
  newsletterPlaceholder: z.string().max(100).optional(),
});
