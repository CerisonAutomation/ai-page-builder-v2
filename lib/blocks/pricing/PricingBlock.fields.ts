import type { FieldDef } from "@measured/puck";
import type { AllBlockProps } from "../types";

export const pricingFields: FieldDef = {
  title: { type: "text", label: "Section Title" },
  plans: {
    type: "array",
    label: "Pricing Plans",
    arrayFields: {
      name: { type: "text", label: "Plan Name" },
      price: { type: "text", label: "Price (e.g., $29/mo)" },
      features: {
        type: "array",
        label: "Features",
        arrayFields: { feature: { type: "text", label: "Feature" } },
      },
      cta: { type: "text", label: "Button Text" },
      ctaHref: { type: "text", label: "Button Link" },
      highlighted: {
        type: "select",
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
        label: "Featured Plan?",
      },
    },
  },
};

export const pricingDefaultProps: AllBlockProps["PricingBlock"] = {
  title: "Simple, Transparent Pricing",
  plans: [
    {
      name: "Starter",
      price: "$29",
      features: ["Feature 1", "Feature 2"],
      cta: "Get Started",
      ctaHref: "/signup",
    },
  ],
};
