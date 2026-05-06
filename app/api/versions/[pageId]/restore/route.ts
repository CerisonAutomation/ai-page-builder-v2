import { logger } from "@/lib/utils/logger";
/**
 * POST /api/versions/[pageId]/restore
 * Returns the restored page data so the editor can apply it immediately.
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import { restoreToVersion } from "@/lib/db/versions";

export async function POST(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { versionId, label } = body;

    if (!versionId) {
      return Response.json(
        { error: "Missing versionId" },
        { status: 400 }
      );
    }

    const result = await restoreToVersion(
      params.pageId,
      versionId,
      userData.user.id,
      label
    );

    // Fetch the version's data so the frontend can update the editor immediately
    // without requiring a page refresh.
    const supabaseClient = await createServerSupabaseClient();
    const { data: versionRow } = await supabaseClient
      .from("page_versions")
      .select("data")
      .eq("id", versionId)
      .single();

    return Response.json({ ...result, restoredData: versionRow?.data ?? null });
  } catch (error: unknown) {
    logger.error("Failed to restore version", error, { pageId: params.pageId });
    let message = "Failed to restore version";
    let status = 500;
    if (error instanceof Error) {
      message = error.message || message;
      status = error.message?.includes("Unauthorized") ? 403 : 500;
    }
    return Response.json(
      { error: message },
      { status }
    );
  }
}
