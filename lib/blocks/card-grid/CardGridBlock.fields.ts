import type { AllBlockProps } from "../types";

export const cardGridFields= {
  title: { type: "text", label: "Section Title" },
  columns: { type: "number", label: "Columns", min: 1, max: 4 },
  cards: {
    type: "array",
    label: "Cards",
    arrayFields: {
      title: { type: "text", label: "Title" },
      body: { type: "textarea", label: "Description" },
      icon: { type: "text", label: "Icon (lucide name)" },
      href: { type: "text", label: "Link" },
    },
  },
};

export const cardGridDefaultProps: AllBlockProps["CardGridBlock"] = {
  title: "Features",
  columns: 3,
  cards: [
    { title: "Feature 1", body: "Description", icon: "✨", href: "/" },
    { title: "Feature 2", body: "Description", icon: "⚡", href: "/" },
    { title: "Feature 3", body: "Description", icon: "🎯", href: "/" },
  ],
};
