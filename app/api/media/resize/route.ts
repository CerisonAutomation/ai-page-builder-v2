import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/db/supabase"
import { resizeImage } from "@/lib/media/resize"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")
    const width = searchParams.get("width")
    const height = searchParams.get("height")
    const quality = searchParams.get("quality")
    const format = (searchParams.get("format") as "jpeg" | "png" | "webp" | "avif") || "webp"

    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

    // ✅ Verify auth
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Fetch the image
    const imageResponse = await fetch(url)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 })
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)

    // ✅ Resize image
    const resizedBuffer = await resizeImage(imageBuffer, {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: quality ? parseInt(quality) : 80,
      format,
    })

    // ✅ Return resized image
    const contentType = `image/${format === "jpeg" ? "jpeg" : format}`
    return new NextResponse(resizedBuffer as any, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: unknown) {
    let message = "Resize failed"
    if (error instanceof Error) {
      message = error.message
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
