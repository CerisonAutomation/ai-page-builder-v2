import { logger } from "@/lib/utils/logger";
/**
 * POST /api/versions/[pageId]/compare
 * ✅ Compare current version with a historical version
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import { compareVersions, getVersionWithMetadata } from "@/lib/db/versions";
import type { Data } from "@measured/puck";

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
    const { versionId, currentData } = body;

    if (!versionId || !currentData) {
      return Response.json(
        { error: "Missing versionId or currentData" },
        { status: 400 }
      );
    }

    // Get version
    const version = await getVersionWithMetadata(versionId, params.pageId);
    if (!version) {
      return Response.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    // Compare
    const diff = compareVersions(version.data as Data, currentData);

    return Response.json({ diff });
  } catch (error: unknown) {
    logger.error("Failed to compare versions", error, { pageId: params.pageId });
    let message = "Failed to compare versions";
    if (error instanceof Error) {
      message = error.message;
    }
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
