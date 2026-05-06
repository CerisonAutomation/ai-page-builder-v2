import { logger } from "@/lib/utils/logger";
/**
 * GET /api/versions/[pageId]
 * POST /api/versions/[pageId] — Create version with label
 * PATCH /api/versions/[pageId]/[versionId] — Update label
 * DELETE /api/versions/[pageId]/[versionId] — Delete version
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import {
  getVersionHistory,
  updateVersionLabel,
  deleteVersion,
} from "@/lib/db/versions";

export async function GET(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const { versions, total } = await getVersionHistory(
      params.pageId,
      userData.user.id,
      limit,
      offset
    );

    return Response.json({ versions, total, limit, offset });
  } catch (error: unknown) {
    logger.error("Failed to fetch versions", error, { pageId: params.pageId });
    let message = "Failed to fetch versions";
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

export async function PATCH(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { versionId, label } = body;

    if (!versionId || !label) {
      return Response.json(
        { error: "Missing versionId or label" },
        { status: 400 }
      );
    }

    const version = await updateVersionLabel(
      versionId,
      label,
      params.pageId,
      userData.user.id
    );

    return Response.json({ version });
  } catch (error: unknown) {
    logger.error("Failed to update version", error, { pageId: params.pageId });
    let message = "Failed to update version";
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

export async function DELETE(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const versionId = url.pathname.split("/").pop();

    if (!versionId) {
      return Response.json(
        { error: "Missing versionId" },
        { status: 400 }
      );
    }

    await deleteVersion(versionId, params.pageId, userData.user.id);

    return Response.json({ success: true });
  } catch (error: unknown) {
    logger.error("Failed to delete version", error, { pageId: params.pageId });
    let message = "Failed to delete version";
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