import type { AllBlockProps } from "../types";

export const statsCounterBlockFields = {
  stats: {
    type: "array",
    label: "Statistics",
    arrayFields: {
      value: { type: "number", label: "Value" },
      label: { type: "text", label: "Label" },
      icon: { type: "text", label: "Icon Name (optional)" },
      prefix: { type: "text", label: "Prefix (e.g. $)" },
      suffix: { type: "text", label: "Suffix (e.g. %)" },
    },
  },
  animated: { type: "select", label: "Animated Counter", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  columns: { type: "number", label: "Columns", min: 1, max: 6 },
  bgColor: { type: "text", label: "Background Color" },
};

export const statsCounterBlockDefaultProps: AllBlockProps["StatsCounterBlock"] = {
  stats: [
    { value: 10000, label: "Customers", prefix: "", suffix: "+" },
    { value: 99, label: "Satisfaction", prefix: "", suffix: "%" },
    { value: 50, label: "Countries", prefix: "", suffix: "" },
    { value: 24, label: "Support", prefix: "", suffix: "/7" },
  ],
  animated: true,
  columns: 4,
  bgColor: "#f8fafc",
};
