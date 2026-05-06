import sharp from "sharp"
import type { ResizeOptions, ResponsiveSizes } from "./types"

export async function resizeImage(
  input: Buffer | string,
  options: ResizeOptions
): Promise<Buffer> {
  const {
    width,
    height,
    fit = "cover",
    quality = 80,
    format = "webp",
  } = options

  let pipeline = sharp(input)

  if (width || height) {
    pipeline = pipeline.resize(width, height, { fit: fit as any })
  }

  switch (format) {
    case "jpeg":
      return pipeline.jpeg({ quality }).toBuffer()
    case "png":
      return pipeline.png({ quality }).toBuffer()
    case "avif":
      return pipeline.avif({ quality }).toBuffer()
    case "webp":
    default:
      return pipeline.webp({ quality }).toBuffer()
  }
}

export async function generateResponsiveSizes(
  input: Buffer | string,
  baseWidth: number,
  baseHeight: number
): Promise<ResponsiveSizes> {
  const sizes = {
    original: { width: baseWidth, height: baseHeight },
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: Math.round((300 / baseWidth) * baseHeight) },
    medium: { width: 600, height: Math.round((600 / baseWidth) * baseHeight) },
    large: { width: 1200, height: Math.round((1200 / baseWidth) * baseHeight) },
  }

  const result: ResponsiveSizes = {
    original: sizes.original,
    thumbnail: sizes.thumbnail,
    small: sizes.small,
    medium: sizes.medium,
    large: sizes.large,
  }

  return result
}

export async function getImageMetadata(
  input: Buffer | string
): Promise<{ width: number; height: number; format: string }> {
  const metadata = await sharp(input).metadata()
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || "unknown",
  }
}
