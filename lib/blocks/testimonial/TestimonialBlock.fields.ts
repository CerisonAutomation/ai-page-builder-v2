import type { AllBlockProps } from "../types";

export const testimonialFields= {
  quotes: {
    type: "array",
    label: "Testimonials",
    arrayFields: {
      text: { type: "textarea", label: "Quote" },
      author: { type: "text", label: "Author Name" },
      role: { type: "text", label: "Author Role/Company" },
      avatar: { type: "text", label: "Avatar URL (optional)" },
    },
  },
};

export const testimonialDefaultProps: AllBlockProps["TestimonialBlock"] = {
  quotes: [{ text: "Great product!", author: "John", role: "CEO" }],
};
