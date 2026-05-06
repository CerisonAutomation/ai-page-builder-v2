import type { FieldDef } from "@measured/puck";
import type { AllBlockProps } from "../types";

export const featureListFields: FieldDef = {
  features: {
    type: "array",
    label: "Features",
    arrayFields: {
      icon: { type: "text", label: "Icon (lucide name)" },
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
    },
  },
};

export const featureListDefaultProps: AllBlockProps["FeatureListBlock"] = {
  features: [{ icon: "✓", title: "Feature", description: "Description" }],
};
