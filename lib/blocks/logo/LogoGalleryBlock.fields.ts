import type { AllBlockProps } from "../types";

export const logoGalleryBlockFields = {
  logos: {
    type: "array",
    label: "Logos",
    arrayFields: {
      image: { type: "text", label: "Logo Image URL" },
      alt: { type: "text", label: "Alt Text" },
      href: { type: "text", label: "Link URL (optional)" },
    },
  },
  columns: { type: "number", label: "Columns", min: 1, max: 6 },
  grayscale: { type: "select", label: "Grayscale Filter", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  carouselMode: { type: "select", label: "Carousel Mode", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
};

export const logoGalleryBlockDefaultProps: AllBlockProps["LogoGalleryBlock"] = {
  logos: [
    { image: "/placeholders/logo-placeholder.svg", alt: "Partner 1" },
    { image: "/placeholders/logo-placeholder.svg", alt: "Partner 2" },
    { image: "/placeholders/logo-placeholder.svg", alt: "Partner 3" },
    { image: "/placeholders/logo-placeholder.svg", alt: "Partner 4" },
  ],
  columns: 4,
  grayscale: true,
  carouselMode: false,
};
