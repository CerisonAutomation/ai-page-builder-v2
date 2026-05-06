import { logger } from "@/lib/utils/logger";
/**
 * Media Upload API Route
 * ✅ POST /api/media/upload
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { uploadMedia } from "@/lib/db/media";

export async function POST(req: NextRequest) {
  try {
    // ✅ Verify auth
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ✅ Upload
    const media = await uploadMedia(file, user.id);

    return NextResponse.json(media);
  } catch (error: unknown) {
    logger.error("Failed to upload media", error);
    let message = "Upload failed";
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
