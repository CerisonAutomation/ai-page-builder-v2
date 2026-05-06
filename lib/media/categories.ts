import type { MediaCategory } from "./types"

export const CATEGORIES: MediaCategory[] = [
  "hero",
  "gallery",
  "logo",
  "icon",
  "background",
  "content",
  "other",
]

export const CATEGORY_LABELS: Record<MediaCategory, string> = {
  hero: "Hero Images",
  gallery: "Gallery",
  logo: "Logos",
  icon: "Icons",
  background: "Backgrounds",
  content: "Content Images",
  other: "Other",
}

export const CATEGORY_ICONS: Record<MediaCategory, string> = {
  hero: "Image",
  gallery: "Images",
  logo: "Award",
  icon: "Star",
  background: "Layers",
  content: "FileImage",
  other: "Paperclip",
}

export function getCategoryLabel(category: MediaCategory): string {
  return CATEGORY_LABELS[category] || category
}

export function isValidCategory(category: string): category is MediaCategory {
  return CATEGORIES.includes(category as MediaCategory)
}

export function normalizeCategory(category?: string): MediaCategory {
  if (category && isValidCategory(category)) {
    return category
  }
  return "other"
}
