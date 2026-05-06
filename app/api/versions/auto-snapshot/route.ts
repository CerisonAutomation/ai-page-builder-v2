import { logger } from "@/lib/utils/logger";
/**
 * POST /api/versions/auto-snapshot
 * ✅ Auto-save snapshots every 30 seconds
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import { createVersionSnapshot } from "@/lib/db/versions";
import type { Data } from "@measured/puck";

// Store last snapshot hash per page to avoid duplicates
const lastSnapshotHash = new Map<string, string>();

function hashData(data: Data): string {
  return JSON.stringify(data).substring(0, 100); // Simple hash
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pageId, data } = body;

    if (!pageId || !data) {
      return Response.json(
        { error: "Missing pageId or data" },
        { status: 400 }
      );
    }

    // Check if data has changed since last snapshot
    const dataHash = hashData(data);
    const lastHash = lastSnapshotHash.get(pageId);

    if (lastHash === dataHash) {
      // No changes, skip snapshot
      return Response.json({
        success: false,
        reason: "No changes since last snapshot",
      });
    }

    // Create snapshot
    const version = await createVersionSnapshot(
      pageId,
      data,
      userData.user.id,
      `Auto-saved at ${new Date().toLocaleTimeString()}`
    );

    // Store hash
    lastSnapshotHash.set(pageId, dataHash);

    return Response.json({
      success: true,
      versionId: version.id,
      createdAt: version.created_at,
    });
  } catch (error: unknown) {
    logger.error("Failed to create auto-snapshot", error, { pageId: body.pageId });
    // Don't throw for auto-snapshots, just log
    let message = "Auto-snapshot failed";
    if (error instanceof Error) {
      message = error.message;
    }
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
