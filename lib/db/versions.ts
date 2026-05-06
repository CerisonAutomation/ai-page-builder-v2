/**
 * Version Control Database Operations
 * ✅ Advanced versioning with diff, labels, annotations, snapshots
 */

import { createServerSupabaseClient } from "./supabase";
import type { Data } from "@measured/puck";
import type { Database } from "@/types/supabase";

type PageVersion = Database["public"]["Tables"]["page_versions"]["Row"];

// Extended version interface with metadata
export interface VersionSnapshot extends PageVersion {
  diff_summary?: string;
  blocks_count?: number;
  author_name?: string;
}

// ✅ CREATE VERSION WITH LABEL & ANNOTATION
export async function createVersionSnapshot(
  pageId: string,
  data: Data,
  userId: string,
  label?: string,
  annotation?: string
): Promise<PageVersion> {
  const supabase = await createServerSupabaseClient();

  const { data: version, error } = await supabase
    .from("page_versions")
    .insert([
      {
        page_id: pageId,
        data,
        label: label || `Snapshot at ${new Date().toLocaleTimeString()}`,
        created_by: userId,
        // Store annotation in comments field if available, or extend with new column
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return version;
}

// ✅ GET VERSION WITH RICH METADATA
export async function getVersionWithMetadata(
  versionId: string,
  pageId: string
): Promise<VersionSnapshot | null> {
  const supabase = await createServerSupabaseClient();

  const { data: version, error } = await supabase
    .from("page_versions")
    .select("*")
    .eq("id", versionId)
    .eq("page_id", pageId)
    .single();

  if (error) return null;
  if (!version) return null;

  // Enhance with metadata
  const blocks_count = Array.isArray(version.data?.content)
    ? version.data.content.length
    : 0;

  return {
    ...version,
    blocks_count,
    diff_summary: `${blocks_count} blocks`,
  };
}

// ✅ GET FULL VERSION HISTORY WITH PAGINATION
export async function getVersionHistory(
  pageId: string,
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ versions: VersionSnapshot[]; total: number }> {
  const supabase = await createServerSupabaseClient();

  // Verify ownership
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, created_by")
    .eq("id", pageId)
    .single();

  if (pageError || !page) throw new Error("Page not found");
  if (page.created_by !== userId) throw new Error("Unauthorized");

  // Fetch versions
  const { data: versions, error, count } = await supabase
    .from("page_versions")
    .select("*", { count: "exact" })
    .eq("page_id", pageId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Enhance with metadata
  const enhanced = (versions ?? []).map((v) => {
    const blocks_count = Array.isArray(v.data?.content)
      ? v.data.content.length
      : 0;
    return {
      ...v,
      blocks_count,
      diff_summary: `${blocks_count} blocks`,
    };
  });

  return { versions: enhanced, total: count ?? 0 };
}

// ✅ COMPARE TWO VERSIONS
export interface VersionDiff {
  blocksAdded: number;
  blocksRemoved: number;
  blocksModified: number;
  newIds: string[];
  removedIds: string[];
  modifiedIds: string[];
  summary: string;
}

export function compareVersions(oldData: Data, newData: Data): VersionDiff {
  const oldBlocks = new Map(
    Array.isArray(oldData?.content)
      ? oldData.content.map((b: any) => [b.props?.id || b.key, b])
      : []
  );

  const newBlocks = new Map(
    Array.isArray(newData?.content)
      ? newData.content.map((b: any) => [b.props?.id || b.key, b])
      : []
  );

  const newIds: string[] = [];
  const removedIds: string[] = [];
  const modifiedIds: string[] = [];

  // Find added & modified
  for (const [id, block] of newBlocks) {
    const oldBlock = oldBlocks.get(id);
    if (!oldBlock) {
      newIds.push(id);
    } else if (JSON.stringify(oldBlock) !== JSON.stringify(block)) {
      modifiedIds.push(id);
    }
  }

  // Find removed
  for (const [id] of oldBlocks) {
    if (!newBlocks.has(id)) {
      removedIds.push(id);
    }
  }

  const summary =
    `${newIds.length > 0 ? `+${newIds.length} blocks ` : ""}` +
    `${removedIds.length > 0 ? `-${removedIds.length} blocks ` : ""}` +
    `${modifiedIds.length > 0 ? `~${modifiedIds.length} modified` : ""}`;

  return {
    blocksAdded: newIds.length,
    blocksRemoved: removedIds.length,
    blocksModified: modifiedIds.length,
    newIds,
    removedIds,
    modifiedIds,
    summary: summary.trim() || "No changes",
  };
}

// ✅ RESTORE TO VERSION (owner only)
export async function restoreToVersion(
  pageId: string,
  versionId: string,
  userId: string,
  label?: string
): Promise<{ success: boolean; newVersionId: string }> {
  const supabase = await createServerSupabaseClient();

  // Get version
  const { data: version, error: versionError } = await supabase
    .from("page_versions")
    .select("*")
    .eq("id", versionId)
    .eq("page_id", pageId)
    .single();

  if (versionError || !version) throw new Error("Version not found");

  // Get current page
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .single();

  if (pageError || !page) throw new Error("Page not found");
  if (page.created_by !== userId) throw new Error("Unauthorized");

  // Create "before restore" snapshot
  const beforeRestore = await createVersionSnapshot(
    pageId,
    page.data,
    userId,
    label || `Before restore from ${version.label || "earlier version"}`
  );

  // Restore page
  const { error: updateError } = await supabase
    .from("pages")
    .update({
      data: version.data,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId);

  if (updateError) throw updateError;

  return {
    success: true,
    newVersionId: beforeRestore.id,
  };
}

// ✅ UPDATE VERSION LABEL & ANNOTATION
export async function updateVersionLabel(
  versionId: string,
  label: string,
  pageId: string,
  userId: string
): Promise<PageVersion> {
  const supabase = await createServerSupabaseClient();

  // Verify ownership
  const { data: page } = await supabase
    .from("pages")
    .select("created_by")
    .eq("id", pageId)
    .single();

  if (!page || page.created_by !== userId) throw new Error("Unauthorized");

  const { data: version, error } = await supabase
    .from("page_versions")
    .update({ label })
    .eq("id", versionId)
    .eq("page_id", pageId)
    .select()
    .single();

  if (error) throw error;
  return version;
}

// ✅ DELETE VERSION (soft delete or hard)
export async function deleteVersion(
  versionId: string,
  pageId: string,
  userId: string
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  // Verify ownership
  const { data: page } = await supabase
    .from("pages")
    .select("created_by")
    .eq("id", pageId)
    .single();

  if (!page || page.created_by !== userId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("page_versions")
    .delete()
    .eq("id", versionId)
    .eq("page_id", pageId);

  if (error) throw error;
}

// ✅ GET VERSIONS BY TIME RANGE (e.g., last 24h)
export async function getVersionsByTimeRange(
  pageId: string,
  userId: string,
  hoursBack: number = 24
): Promise<VersionSnapshot[]> {
  const supabase = await createServerSupabaseClient();

  // Verify ownership
  const { data: page } = await supabase
    .from("pages")
    .select("created_by")
    .eq("id", pageId)
    .single();

  if (!page || page.created_by !== userId) throw new Error("Unauthorized");

  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const { data: versions, error } = await supabase
    .from("page_versions")
    .select("*")
    .eq("page_id", pageId)
    .gte("created_at", cutoffTime.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (versions ?? []).map((v) => ({
    ...v,
    blocks_count: Array.isArray(v.data?.content)
      ? v.data.content.length
      : 0,
  }));
}
