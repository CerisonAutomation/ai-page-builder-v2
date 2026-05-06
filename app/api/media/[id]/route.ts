import { logger } from "@/lib/utils/logger";
/**
 * Media Delete API Route
 * ✅ DELETE /api/media/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { deleteMedia } from "@/lib/db/media";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      
      // ✅ Verify auth
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // ✅ Delete
      await deleteMedia(id, user.id);

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("Failed to delete media", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
