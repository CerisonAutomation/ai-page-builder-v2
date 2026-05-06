export type MediaCategory =
  | "hero"
  | "gallery"
  | "logo"
  | "icon"
  | "background"
  | "content"
  | "other"

export interface MediaItem {
  id: string
  filename: string
  storage_path: string
  url: string
  mime_type: string
  size: number
  width?: number
  height?: number
  category: MediaCategory
  alt_text?: string
  tags?: string[]
  user_id: string
  created_at: string
  updated_at?: string
}

export interface MediaUploadOptions {
  category?: MediaCategory
  altText?: string
  tags?: string[]
}

export interface MediaListOptions {
  limit?: number
  offset?: number
  category?: MediaCategory
  tags?: string[]
  search?: string
}

export interface ResizeOptions {
  width?: number
  height?: number
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
  quality?: number
  format?: "jpeg" | "png" | "webp" | "avif"
}

export interface ResponsiveSizes {
  original: { width: number; height: number }
  thumbnail: { width: number; height: number; url?: string }
  small: { width: number; height: number; url?: string }
  medium: { width: number; height: number; url?: string }
  large: { width: number; height: number; url?: string }
}

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
