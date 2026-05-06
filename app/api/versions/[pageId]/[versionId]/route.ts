import { logger } from "@/lib/utils/logger";
/**
 * PATCH /api/versions/[pageId]/[versionId] — Update version label
 * DELETE /api/versions/[pageId]/[versionId] — Delete a specific version
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import { updateVersionLabel, deleteVersion } from "@/lib/db/versions";

export async function PATCH(
  request: Request,
  { params }: { params: { pageId: string; versionId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { label } = body;

    if (!label) {
      return Response.json({ error: "Missing label" }, { status: 400 });
    }

    const version = await updateVersionLabel(
      params.versionId,
      label,
      params.pageId,
      userData.user.id
    );

    return Response.json({ version });
  } catch (error: unknown) {
    logger.error("Failed to update version label", error, {
      pageId: params.pageId,
      versionId: params.versionId,
    });
    let message = "Failed to update version";
    let status = 500;
    if (error instanceof Error) {
      message = error.message || message;
      status = error.message?.includes("Unauthorized") ? 403 : 500;
    }
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { pageId: string; versionId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteVersion(params.versionId, params.pageId, userData.user.id);

    return Response.json({ success: true });
  } catch (error: unknown) {
    logger.error("Failed to delete version", error, {
      pageId: params.pageId,
      versionId: params.versionId,
    });
    let message = "Failed to delete version";
    let status = 500;
    if (error instanceof Error) {
      message = error.message || message;
      status = error.message?.includes("Unauthorized") ? 403 : 500;
    }
    return Response.json({ error: message }, { status });
  }
}
