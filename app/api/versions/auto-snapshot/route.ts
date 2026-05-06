import { logger } from "@/lib/utils/logger";
/**
 * POST /api/versions/auto-snapshot
 * Auto-save snapshots every 30 seconds if the page data has changed.
 * Uses the last saved version in the DB for deduplication instead of an
 * in-memory Map (which is reset on every serverless cold-start).
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import { createVersionSnapshot } from "@/lib/db/versions";
import type { Data } from "@measured/puck";

function stableHash(data: Data): string {
  // A deterministic hash based on the full JSON content
  return JSON.stringify(data);
}

export async function POST(request: Request) {
  let body: any;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    body = await request.json();
    const { pageId, data } = body;

    if (!pageId || !data) {
      return Response.json(
        { error: "Missing pageId or data" },
        { status: 400 }
      );
    }

    // FIX: Use DB-backed deduplication — compare against the most recent snapshot
    // instead of an in-memory Map that resets on every cold-start.
    const { data: lastVersion } = await supabase
      .from("page_versions")
      .select("data")
      .eq("page_id", pageId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastVersion && stableHash(lastVersion.data as Data) === stableHash(data)) {
      return Response.json({
        success: false,
        reason: "No changes since last snapshot",
      });
    }

    const version = await createVersionSnapshot(
      pageId,
      data,
      userData.user.id,
      `Auto-saved at ${new Date().toLocaleTimeString()}`
    );

    return Response.json({
      success: true,
      versionId: version.id,
      createdAt: version.created_at,
    });
  } catch (error: unknown) {
    logger.error("Failed to create auto-snapshot", error, { pageId: body?.pageId });
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
