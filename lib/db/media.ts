/**
 * Media Database Layer
 * ✅ File uploads, storage, and metadata management
 */

import { createServerSupabaseClient, createBrowserSupabaseClient } from "./supabase";
import { z } from "zod";

export const MediaSchema = z.object({
  id: z.string(),
  filename: z.string(),
  storage_path: z.string(),
  url: z.string(),
  mime_type: z.string(),
  size: z.number(),
  user_id: z.string(),
  created_at: z.string(),
});

export type Media = z.infer<typeof MediaSchema>;

const BUCKET_NAME = "media";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload media file (wrapper for uploadFile for API compatibility)
 */
export async function uploadMedia(
  file: File,
  userId: string
): Promise<Media> {
  return uploadFile(file, userId);
}

/**
 * List all media files for a user
 */
export async function listMedia(
    userId: string,
    options?: { limit?: number; offset?: number }
  ) {
    const supabase = await createServerSupabaseClient();
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    const { data: files, error, count } = await supabase
      .from("media")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { files: (files ?? []) as Media[], total: count ?? 0 };
  }

/**
 * Get single media file
 */
export async function getMediaById(mediaId: string, userId: string) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("id", mediaId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as Media | null;
  }

/**
 * Get media (overloaded: by user for list, by id for single file)
 */
export async function getMedia(mediaIdOrUserId: string, userId?: string) {
    // If only one arg, treat as userId for list
    if (!userId) {
      return listMedia(mediaIdOrUserId);
    }
    
    // If two args, treat as single file lookup
    return getMediaById(mediaIdOrUserId, userId);
  }

/**
 * Upload file to storage
 * Returns file URL and metadata
 */
export async function uploadFile(
  file: File,
  userId: string
): Promise<Media> {
  const supabase = await createServerSupabaseClient();

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const storagePath = `${userId}/${timestamp}-${random}.${ext}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  // Save metadata to database
  const { data: mediaData, error: dbError } = await supabase
    .from("media")
    .insert([
      {
        filename: file.name,
        storage_path: storagePath,
        url: publicUrl,
        mime_type: file.type,
        size: file.size,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (dbError) throw dbError;

  return mediaData as Media;
}

/**
 * Delete media file
 */
export async function deleteMedia(mediaId: string, userId: string) {
    const supabase = await createServerSupabaseClient();

    // Get media to find storage path
    const media = await getMediaById(mediaId, userId);
    if (!media) {
      throw new Error("Media not found");
    }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([media.storage_path]);

  if (storageError) throw storageError;

  // Delete from database
  const { error: dbError } = await supabase
    .from("media")
    .delete()
    .eq("id", mediaId)
    .eq("user_id", userId);

  if (dbError) throw dbError;
}

/**
 * Generate signed URL for private file (valid for 1 hour)
 */
export async function getSignedUrl(mediaId: string, userId: string) {
    const supabase = await createServerSupabaseClient();

    const media = await getMediaById(mediaId, userId);
  if (!media) {
    throw new Error("Media not found");
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(media.storage_path, 3600); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Get media usage stats
 */
export async function getMediaStats(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("media")
    .select("size")
    .eq("user_id", userId);

  if (error) throw error;

  const totalSize = (data ?? []).reduce((sum, f) => sum + f.size, 0);
  const count = data?.length ?? 0;

  return {
    count,
    totalSize,
    totalSizeMB: Math.round(totalSize / 1024 / 1024),
  };
}

/**
 * Client-side upload helper
 * Use in browser components
 */
export async function clientUploadFile(file: File, userId: string) {
  const supabase = createBrowserSupabaseClient();

  // Validate file
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Generate storage path
  const ext = file.name.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const storagePath = `${userId}/${timestamp}-${random}.${ext}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  return {
    filename: file.name,
    url: publicUrl,
    storagePath,
    size: file.size,
  };
}
