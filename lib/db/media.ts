/**
 * Media Management — Supabase Storage
 * ✅ Upload, delete, list images with signed URLs
 */

import { createServerSupabaseClient, createAdminClient } from "./supabase";
import { logger } from "@/lib/utils/logger";
import { v4 as uuid } from "uuid";

const BUCKET_NAME = "page-media";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface MediaMetadata {
  id: string;
  filename: string;
  bucket_path: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  signed_url?: string;
}

// ✅ UPLOAD IMAGE TO STORAGE
export async function uploadMedia(
  file: File,
  userId: string
): Promise<MediaMetadata> {
  // Validate file
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  try {
    const supabase = await createServerSupabaseClient();

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${uuid()}.${ext}`;
    const bucketPath = `${userId}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(bucketPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get signed URL (valid for 1 year)
    const { data: signedData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(bucketPath, 60 * 60 * 24 * 365);

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${bucketPath}`;

    // Record in database
    const { data: mediaRecord, error: dbError } = await supabase
      .from("media")
      .insert([
        {
          bucket_path: bucketPath,
          filename: file.name,
          mimetype: file.type,
          size: file.size,
          uploaded_by: userId,
        },
      ])
      .select()
      .single();

    if (dbError) {
      // Clean up storage if DB fails
      await supabase.storage.from(BUCKET_NAME).remove([bucketPath]);
      throw dbError;
    }

    return {
      id: mediaRecord.id,
      filename: mediaRecord.filename,
      bucket_path: mediaRecord.bucket_path,
      mimetype: mediaRecord.mimetype,
      size: mediaRecord.size,
      url: publicUrl,
      signed_url: signedData?.signedUrl,
    };
  } catch (error) {
    logger.error("Failed to upload media", error);
    throw error;
  }
}

// ✅ DELETE MEDIA (soft delete)
export async function deleteMedia(
  mediaId: string,
  userId: string
): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get media record to verify ownership
    const { data: media, error: getError } = await supabase
      .from("media")
      .select("*")
      .eq("id", mediaId)
      .single();

    if (getError) throw getError;
    if (!media) throw new Error("Media not found");
    if (media.uploaded_by !== userId) throw new Error("Unauthorized");

    // Soft delete in database
    const { error: deleteError } = await supabase
      .from("media")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", mediaId);

    if (deleteError) throw deleteError;

    // Delete from storage
    await supabase.storage.from(BUCKET_NAME).remove([media.bucket_path]);
  } catch (error) {
    logger.error("Failed to delete media", error);
    throw error;
  }
}

// ✅ LIST MEDIA (paginated)
export async function listMedia(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<MediaMetadata[]> {
  try {
    const supabase = await createServerSupabaseClient();

    // ✅ OPTIMIZATION: Only fetch needed columns (performance improvement)
    const { data: media, error } = await supabase
      .from("media")
      .select(
        "id,filename,bucket_path,mimetype,size,width,height,created_at"
      )
      .eq("uploaded_by", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (media || []).map((m) => ({
      id: m.id,
      filename: m.filename,
      bucket_path: m.bucket_path,
      mimetype: m.mimetype,
      size: m.size,
      width: m.width,
      height: m.height,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${m.bucket_path}`,
    }));
  } catch (error) {
    logger.error("Failed to list media", error);
    return [];
  }
}

// ✅ GET SIGNED URL (for private media)
export async function getSignedUrl(
  mediaId: string,
  userId: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient();

    // Verify ownership
    const { data: media, error: getError } = await supabase
      .from("media")
      .select("bucket_path")
      .eq("id", mediaId)
      .eq("uploaded_by", userId)
      .single();

    if (getError) throw getError;
    if (!media) throw new Error("Media not found");

    const { data } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(media.bucket_path, expiresIn);

    if (!data) throw new Error("Failed to generate signed URL");
    return data.signedUrl;
  } catch (error) {
    logger.error("Failed to get signed URL", error, { mediaId });
    throw error;
  }
}

// ✅ GET OPTIMIZED IMAGE URL (with transformation)
export function getOptimizedImageUrl(
  bucketPath: string,
  width?: number,
  height?: number,
  quality: "low" | "medium" | "high" = "high"
): string {
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${bucketPath}`;

  // Supabase doesn't have built-in image transforms in free tier
  // For now, return base URL. In production, use Supabase Image Optimization add-on
  return baseUrl;
}
