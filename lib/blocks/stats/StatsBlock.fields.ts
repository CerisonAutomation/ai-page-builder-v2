import type { AllBlockProps } from "../types";

export const statsFields= {
  stats: {
    type: "array",
    label: "Statistics",
    arrayFields: {
      value: { type: "text", label: "Number/Value" },
      label: { type: "text", label: "Label" },
      unit: { type: "text", label: "Unit (e.g., %, M, K)" },
    },
  },
};

export const statsDefaultProps: AllBlockProps["StatsBlock"] = {
  stats: [
    { value: "100", label: "Users", unit: "K" },
    { value: "99.9", label: "Uptime", unit: "%" },
  ],
};
