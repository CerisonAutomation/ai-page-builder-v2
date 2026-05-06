import { logger } from "@/lib/utils/logger";
/**
 * Media List API Route
 * ✅ GET /api/media/list
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { listMedia } from "@/lib/db/media";

export async function GET(req: NextRequest) {
  try {
    // ✅ Verify auth
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Get query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // ✅ Fetch media
    const result = await listMedia(user.id, { limit, offset });

    return NextResponse.json(
      { files: result.files, total: result.total },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: unknown) {
    logger.error("Failed to list media", error);
    return NextResponse.json(
      { error: "Failed to list media" },
      { status: 500 }
    );
  }
}
