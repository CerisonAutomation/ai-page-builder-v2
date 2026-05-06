import { logger } from "@/lib/utils/logger";
/**
 * POST /api/versions/[pageId]/restore
 * ✅ One-click inline version restore
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

    return Response.json(result);
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
