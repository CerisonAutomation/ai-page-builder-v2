import type { AllBlockProps } from "../types";

export const heroBlockFields = {
  headline: { type: "text" as const, label: "Headline" },
  subheadline: { type: "textarea" as const, label: "Subheadline" },
  ctaLabel: { type: "text" as const, label: "CTA Button Text" },
  ctaHref: { type: "text" as const, label: "CTA Link" },
  bgImage: { type: "text" as const, label: "Background Image URL" },
  bgColor: { type: "text" as const, label: "Background Color (optional)" },
};

export const heroBlockDefaultProps: AllBlockProps["HeroBlock"] = {
  headline: "Your Headline Here",
  subheadline: "Supporting subheadline",
  ctaLabel: "Get Started",
  ctaHref: "/",
  bgImage: undefined,
  bgColor: undefined,
};
