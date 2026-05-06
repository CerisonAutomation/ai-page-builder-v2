import type { FieldDef } from "@measured/puck";
import type { AllBlockProps } from "../types";

export const heroBlockFields: FieldDef = {
  headline: { type: "text", label: "Headline" },
  subheadline: { type: "textarea", label: "Subheadline" },
  ctaLabel: { type: "text", label: "CTA Button Text" },
  ctaHref: { type: "text", label: "CTA Link" },
  bgImage: { type: "text", label: "Background Image URL (optional)" },
  bgColor: { type: "text", label: "Background Color" },
};

export const heroBlockDefaultProps: AllBlockProps["HeroBlock"] = {
  headline: "Your Headline Here",
  subheadline: "Supporting subheadline",
  ctaLabel: "Get Started",
  ctaHref: "/",
  bgColor: "#1e293b",
};
