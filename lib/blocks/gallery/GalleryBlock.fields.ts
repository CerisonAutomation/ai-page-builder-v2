import type { AllBlockProps } from "../types";

export const galleryFields= {
  images: {
    type: "array",
    label: "Images",
    arrayFields: { image: { type: "text", label: "Image URL" } },
  },
  columns: { type: "number", label: "Columns", min: 1, max: 6 },
  gap: { type: "number", label: "Gap (px)", min: 0, max: 16 },
};

export const galleryDefaultProps: AllBlockProps["GalleryBlock"] = {
  images: [],
  columns: 3,
  gap: 4,
};
