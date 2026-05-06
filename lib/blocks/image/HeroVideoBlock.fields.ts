import type { AllBlockProps } from "../types";

export const heroVideoBlockFields = {
  videoUrl: { type: "text", label: "Video URL (YouTube/Vimeo)" },
  fallbackImage: { type: "text", label: "Fallback Image URL" },
  autoplay: { type: "select", label: "Autoplay", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  loop: { type: "select", label: "Loop", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  muted: { type: "select", label: "Muted", options: [{ label: "No", value: "false" }, { label: "Yes", value: "true" }] },
  headline: { type: "text", label: "Overlay Headline" },
  subheadline: { type: "textarea", label: "Overlay Subheadline" },
};

export const heroVideoBlockDefaultProps: AllBlockProps["HeroVideoBlock"] = {
  videoUrl: "",
  autoplay: false,
  loop: false,
  muted: true,
  headline: "Video Headline",
  subheadline: "Watch our story",
};
