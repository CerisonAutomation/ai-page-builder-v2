import type { AllBlockProps } from "../types";

export const testimonialsCarouselBlockFields = {
  testimonials: {
    type: "array",
    label: "Testimonials",
    arrayFields: {
      text: { type: "textarea", label: "Quote Text" },
      author: { type: "text", label: "Author Name" },
      role: { type: "text", label: "Author Role/Company" },
      avatar: { type: "text", label: "Avatar Image URL" },
      rating: { type: "number", label: "Rating (1-5)", min: 1, max: 5 },
    },
  },
  autoplay: { type: "select", label: "Autoplay Carousel", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  layout: {
    type: "select",
    label: "Layout Variant",
    options: [
      { label: "Card", value: "card" },
      { label: "Minimal", value: "minimal" },
      { label: "Full Grid", value: "full" },
    ],
  },
  showRating: { type: "select", label: "Show Rating Stars", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
};

export const testimonialsCarouselBlockDefaultProps: AllBlockProps["TestimonialsCarouselBlock"] = {
  testimonials: [
    { text: "This product changed our business completely.", author: "Jane Doe", role: "CEO, Company", rating: 5 },
    { text: "Absolutely fantastic experience from start to finish.", author: "John Smith", role: "CTO, TechCorp", rating: 5 },
  ],
  autoplay: true,
  layout: "card",
  showRating: true,
};
