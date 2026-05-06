import type { FieldDef } from "@measured/puck";
import type { AllBlockProps } from "../types";

export const ctaFields: FieldDef = {
  headline: { type: "text", label: "Headline" },
  body: { type: "textarea", label: "Body" },
  primaryCta: { type: "text", label: "Primary Button Text" },
  primaryHref: { type: "text", label: "Primary Button Link" },
  secondaryCta: {
    type: "text",
    label: "Secondary Button Text (optional)",
  },
  secondaryHref: { type: "text", label: "Secondary Button Link" },
};

export const ctaDefaultProps: AllBlockProps["CTABlock"] = {
  headline: "Ready to get started?",
  body: "Description",
  primaryCta: "Start Free",
  primaryHref: "/signup",
};
