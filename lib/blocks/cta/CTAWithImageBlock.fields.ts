import type { AllBlockProps } from "../types";

export const ctaWithImageBlockFields = {
  headline: { type: "text", label: "Headline" },
  subheadline: { type: "textarea", label: "Subheadline" },
  image: { type: "text", label: "Image URL" },
  primaryCta: { type: "text", label: "Primary CTA Text" },
  primaryHref: { type: "text", label: "Primary CTA Link" },
  secondaryCta: { type: "text", label: "Secondary CTA Text" },
  secondaryHref: { type: "text", label: "Secondary CTA Link" },
  imagePosition: {
    type: "select",
    label: "Image Position",
    options: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
  },
  bgColor: { type: "text", label: "Background Color" },
};

export const ctaWithImageBlockDefaultProps: AllBlockProps["CTAWithImageBlock"] = {
  headline: "Ready to get started?",
  subheadline: "Join thousands of satisfied customers today.",
  primaryCta: "Get Started",
  primaryHref: "/",
  secondaryCta: "Learn More",
  secondaryHref: "/about",
  imagePosition: "right",
  bgColor: "#f8fafc",
};
