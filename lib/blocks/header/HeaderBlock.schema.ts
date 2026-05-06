import { z } from "zod";

export const HeaderBlockSchema = z.object({
  logo: z.string().url().optional(),
  logoAlt: z.string().max(100).optional(),
  navItems: z.array(
    z.object({
      label: z.string().min(1).max(50),
      href: z.string().min(1).max(200),
      isExternal: z.boolean().optional(),
    })
  ).min(1).max(12),
  ctaLabel: z.string().max(40).optional(),
  ctaHref: z.string().max(200).optional(),
  sticky: z.boolean().optional(),
  transparentBg: z.boolean().optional(),
  mobileBreakpoint: z.number().min(320).max(1280).optional(),
});
