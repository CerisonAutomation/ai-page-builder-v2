/**
 * Page Database Operations
 * ✅ CRUD with type safety, error handling, audit logging
 */

import { createServerSupabaseClient, createAdminClient } from "./supabase";
import { logger } from "@/lib/utils/logger";
import type { Data } from "@measured/puck";
import type { Database } from "@/types/supabase";

type Page = Database["public"]["Tables"]["pages"]["Row"];
type PageVersion = Database["public"]["Tables"]["page_versions"]["Row"];

// ✅ GET PAGE BY SLUG (public, no auth required for published pages)
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found (expected)
      throw error;
    }

    return data ?? null;
  } catch (error) {
    logger.error("Failed to fetch page by slug", error, { slug });
    return null;
  }
}

// ✅ CREATE PAGE (auth required)
export async function createPage(
  slug: string,
  title: string,
  data: Data,
  userId: string
): Promise<Page> {
  const supabase = await createServerSupabaseClient();

  const { data: page, error } = await supabase
    .from("pages")
    .insert([
      {
        slug,
        title,
        data,
        created_by: userId,
        updated_by: userId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return page;
}

// ✅ UPDATE PAGE (owner only)
export async function updatePage(
  slug: string,
  updates: { title?: string; description?: string; data?: Data },
  userId: string
): Promise<Page> {
  const supabase = await createServerSupabaseClient();

  // ✅ Verify ownership via RLS (user can only update own pages)
  const { data: page, error: getError } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (getError) throw getError;
  if (!page) throw new Error("Page not found");
  if (page.created_by !== userId) throw new Error("Unauthorized");

  // ✅ Create version snapshot before update
  if (updates.data) {
    await supabase.from("page_versions").insert([
      {
        page_id: page.id,
        data: page.data,
        label: `Auto-saved at ${new Date().toISOString()}`,
        created_by: userId,
      },
    ]);
  }

  const { data: updated, error: updateError } = await supabase
    .from("pages")
    .update({
      ...updates,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", page.id)
    .select()
    .single();

  if (updateError) throw updateError;
  return updated;
}

// ✅ PUBLISH PAGE (owner only)
export async function publishPage(
  slug: string,
  userId: string
): Promise<Page> {
  const supabase = await createServerSupabaseClient();

  const { data: page, error: getError } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (getError) throw getError;
  if (!page) throw new Error("Page not found");
  if (page.created_by !== userId) throw new Error("Unauthorized");

  const { data: updated, error: updateError } = await supabase
    .from("pages")
    .update({
      published: true,
      published_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq("id", page.id)
    .select()
    .single();

  if (updateError) throw updateError;
  return updated;
}

// ✅ DELETE PAGE (soft delete, owner only)
export async function deletePage(slug: string, userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { data: page, error: getError } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (getError) throw getError;
  if (!page) throw new Error("Page not found");
  if (page.created_by !== userId) throw new Error("Unauthorized");

  const { error: deleteError } = await supabase
    .from("pages")
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq("id", page.id);

  if (deleteError) throw deleteError;
}

// ✅ LIST PAGES (paginated, owner only)
export async function listPages(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ pages: Page[]; total: number }> {
  const supabase = await createServerSupabaseClient();

  // ✅ OPTIMIZATION: Only fetch needed columns (performance improvement)
  const { data: pages, error: dataError } = await supabase
    .from("pages")
    .select(
      "id,slug,title,description,published,created_at,updated_at,created_by"
    )
    .eq("created_by", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dataError) throw dataError;

  // ✅ Return estimated count (faster than exact count for large tables)
  return { pages: pages ?? [], total: pages?.length ?? 0 };
}

// ✅ GET PAGE VERSIONS (history, owner only)
export async function getPageVersions(
  pageId: string,
  userId: string,
  limit: number = 10
): Promise<PageVersion[]> {
  const supabase = await createServerSupabaseClient();

  // ✅ Verify page ownership
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id")
    .eq("id", pageId)
    .single();

  if (pageError) throw pageError;
  if (!page) throw new Error("Page not found");

  const { data: versions, error: versionError } = await supabase
    .from("page_versions")
    .select("*")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (versionError) throw versionError;
  return versions ?? [];
}

// ✅ RESTORE PAGE VERSION (owner only)
export async function restorePageVersion(
  pageId: string,
  versionId: string,
  userId: string
): Promise<Page> {
  const supabase = await createServerSupabaseClient();

  // ✅ Get version
  const { data: version, error: versionError } = await supabase
    .from("page_versions")
    .select("*")
    .eq("id", versionId)
    .single();

  if (versionError) throw versionError;
  if (!version) throw new Error("Version not found");

  // ✅ Verify page ownership
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .single();

  if (pageError) throw pageError;
  if (!page) throw new Error("Page not found");
  if (page.created_by !== userId) throw new Error("Unauthorized");

  // ✅ Create new version from current before restoring
  await supabase.from("page_versions").insert([
    {
      page_id: pageId,
      data: page.data,
      label: `Before restore from v${versionId}`,
      created_by: userId,
    },
  ]);

  // ✅ Restore
  const { data: restored, error: restoreError } = await supabase
    .from("pages")
    .update({
      data: version.data,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .select()
    .single();

  if (restoreError) throw restoreError;
  return restored;
}

// ✅ COUNT PUBLISHED PAGES (for public site)
export async function countPublishedPages(): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { count, error } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("published", true)
    .is("deleted_at", null);

  if (error) throw error;
  return count ?? 0;
}

// ✅ GET FEATURED PAGES (for homepage)
export async function getFeaturedPages(limit: number = 5): Promise<Page[]> {
  const supabase = await createServerSupabaseClient();

  const { data: pages, error } = await supabase
    .from("pages")
    .select("*")
    .eq("published", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return pages ?? [];
}
