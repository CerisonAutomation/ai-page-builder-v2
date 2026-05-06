/**
 * Media Library Page
 * ✅ Upload, manage, delete media files
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default async function MediaPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Media Library</h1>
        <p className="text-slate-600 mt-1">Upload and manage your images and files</p>
      </div>
      <MediaLibrary />
    </div>
  );
}
