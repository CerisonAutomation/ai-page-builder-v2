/**
 * Pages Database Layer
 * ✅ Full CRUD + search + filtering with RLS
 */

import { createServerSupabaseClient } from "./supabase";
import { z } from "zod";

// Schema for page data
export const PageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  data: z.object({}).passthrough(),
  published: z.boolean(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

export const SavePageSchema = z.object({
  slug: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  data: z.object({}).passthrough(),
  published: z.boolean().default(false),
});

export type Page = z.infer<typeof PageSchema>;
export type SavePageInput = z.infer<typeof SavePageSchema>;

/**
 * List all pages for a user with pagination
 */
export async function listPages(
  userId: string,
  options?: { limit?: number; offset?: number; search?: string; published?: boolean }
) {
  const supabase = await createServerSupabaseClient();
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;
  const search = options?.search?.trim();
  const published = options?.published;

  let query = supabase
    .from("pages")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (published !== undefined) {
    query = query.eq("published", published);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`
    );
  }

  const { data: pages, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { pages: (pages ?? []) as Page[], total: count ?? 0 };
}

/**
 * Get single page by slug
 */
export async function getPageBySlug(slug: string, userId?: string) {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .single();

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data as Page | null;
}

/**
 * Get page by ID
 */
export async function getPageById(pageId: string, userId?: string) {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .is("deleted_at", null)
    .single();

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Page | null;
}

/**
 * Create new page
 */
export async function createPage(input: SavePageInput & { user_id: string }) {
  const supabase = await createServerSupabaseClient();

  // Validate slug is unique
  const existing = await getPageBySlug(input.slug, input.user_id);
  if (existing) {
    throw new Error(`Slug "${input.slug}" already exists`);
  }

  const { data, error } = await supabase
    .from("pages")
    .insert([
      {
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        data: input.data,
        published: input.published ?? false,
        user_id: input.user_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Page;
}

/**
 * Update page
 */
export async function updatePage(
  pageId: string,
  userId: string,
  updates: Partial<SavePageInput>
) {
  const supabase = await createServerSupabaseClient();

  // Verify ownership
  const page = await getPageById(pageId, userId);
  if (!page) {
    throw new Error("Page not found or access denied");
  }

  // Check slug uniqueness if changing
  if (updates.slug && updates.slug !== page.slug) {
    const existing = await getPageBySlug(updates.slug, userId);
    if (existing) {
      throw new Error(`Slug "${updates.slug}" already exists`);
    }
  }

  const { data, error } = await supabase
    .from("pages")
    .update({
      ...(updates.slug && { slug: updates.slug }),
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.data && { data: updates.data }),
      ...(updates.published !== undefined && { published: updates.published }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Page;
}

/**
 * Publish page (make public)
 */
export async function publishPage(pageId: string, userId: string) {
  return updatePage(pageId, userId, { published: true });
}

/**
 * Unpublish page (make private)
 */
export async function unpublishPage(pageId: string, userId: string) {
  return updatePage(pageId, userId, { published: false });
}

/**
 * Soft delete page (mark deleted_at)
 */
export async function deletePage(pageId: string, userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("pages")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Page;
}

/**
 * Permanently delete page (hard delete)
 */
export async function hardDeletePage(pageId: string, userId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", pageId)
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Search pages by title/description with fuzzy matching
 */
export async function searchPages(userId: string, query: string) {
  if (!query.trim()) {
    return { pages: [], total: 0 };
  }

  // Use Postgres ilike for case-insensitive matching
  const supabase = await createServerSupabaseClient();
  const searchTerm = `%${query}%`;

  const { data: pages, error, count } = await supabase
    .from("pages")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .or(
      `title.ilike.${searchTerm},description.ilike.${searchTerm},slug.ilike.${searchTerm}`
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return { pages: (pages ?? []) as Page[], total: count ?? 0 };
}

/**
 * Get page with versions
 */
export async function getPageWithVersions(pageId: string, userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select(
      `
      *,
      page_versions (
        id,
        label,
        created_at,
        user_id
      )
    `
    )
    .eq("id", pageId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (pageError) throw pageError;

  return page;
}

/**
 * Count pages by status
 */
export async function countPages(userId: string) {
  const supabase = await createServerSupabaseClient();

  const [
    { count: total },
    { count: published },
    { count: draft },
  ] = await Promise.all([
    supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null),
    supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("published", true)
      .is("deleted_at", null),
    supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("published", false)
      .is("deleted_at", null),
  ]);

  return { total: total ?? 0, published: published ?? 0, draft: draft ?? 0 };
}
