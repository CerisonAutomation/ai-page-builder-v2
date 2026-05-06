import type { AllBlockProps } from "../types";

export const servicesGridBlockFields = {
  services: {
    type: "array",
    label: "Services",
    arrayFields: {
      icon: { type: "text", label: "Icon Name (optional)" },
      title: { type: "text", label: "Title" },
      description: { type: "textarea", label: "Description" },
      image: { type: "text", label: "Image URL (optional)" },
      href: { type: "text", label: "Link URL (optional)" },
    },
  },
  columns: { type: "number", label: "Columns", min: 1, max: 6 },
  layout: {
    type: "select",
    label: "Layout",
    options: [
      { label: "Card", value: "card" },
      { label: "List", value: "list" },
    ],
  },
  iconColor: { type: "text", label: "Icon Color (CSS value)" },
};

export const servicesGridBlockDefaultProps: AllBlockProps["ServicesGridBlock"] = {
  services: [
    { title: "Web Development", description: "Custom websites and applications built with modern technologies.", icon: "code" },
    { title: "UI/UX Design", description: "Beautiful, intuitive interfaces that convert visitors into customers.", icon: "palette" },
    { title: "SEO Optimization", description: "Rank higher in search results and drive more organic traffic.", icon: "search" },
  ],
  columns: 3,
  layout: "card",
  iconColor: "#6366f1",
};
