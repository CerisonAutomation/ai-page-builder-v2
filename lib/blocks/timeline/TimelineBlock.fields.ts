import type { FieldDef } from "@measured/puck";
import type { AllBlockProps } from "../types";

export const timelineFields: FieldDef = {
  events: {
    type: "array",
    label: "Events",
    arrayFields: {
      date: { type: "text", label: "Date" },
      title: { type: "text", label: "Title" },
      body: { type: "textarea", label: "Description" },
    },
  },
};

export const timelineDefaultProps: AllBlockProps["TimelineBlock"] = {
  events: [{ date: "2024", title: "Launch", body: "Big launch" }],
};
