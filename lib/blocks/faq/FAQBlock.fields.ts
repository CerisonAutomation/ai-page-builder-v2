import type { FieldDef } from "@measured/puck";
import type { AllBlockProps } from "../types";

export const faqFields: FieldDef = {
  title: { type: "text", label: "Section Title (optional)" },
  items: {
    type: "array",
    label: "FAQ Items",
    arrayFields: {
      question: { type: "text", label: "Question" },
      answer: { type: "textarea", label: "Answer" },
    },
  },
};

export const faqDefaultProps: AllBlockProps["FAQBlock"] = {
  title: "Frequently Asked Questions",
  items: [{ question: "Q?", answer: "A." }],
};
