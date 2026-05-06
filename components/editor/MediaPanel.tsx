/**
 * Media Panel Component
 * ✅ Image upload to Supabase storage
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
}

export function MediaPanel() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ LOAD MEDIA LIST
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/media/list");
      if (!res.ok) throw new Error("Failed to load media");
      const data = await res.json();
      setMedia(data.media || []);
    } catch (error) {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ LOAD MEDIA ON MOUNT
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // ✅ HANDLE FILE UPLOAD
  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (!files || files.length === 0) return;

      try {
        setUploading(true);
        const file = files[0];

        if (!file.type.startsWith("image/")) {
          toast.error("Only images allowed");
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error("Max 10MB");
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        setMedia((prev) => [data, ...prev]);
        toast.success("Image uploaded!");

        // Reset input
        e.currentTarget.value = "";
      } catch (error) {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    []
  );

  // ✅ COPY URL TO CLIPBOARD
  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied!");
  }, []);

  // ✅ DELETE MEDIA
  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setMedia((prev) => prev.filter((m) => m.id !== id));
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  }, []);

  return (
    <div className="p-3 space-y-3 bg-slate-50 border-t">
      <h3 className="text-xs font-semibold text-slate-900">Media Library</h3>

      {/* ✅ UPLOAD */}
      <label className="block">
        <div className="flex items-center justify-center gap-2 w-full py-2 rounded-md border-2 border-dashed border-slate-300 hover:border-violet-400 cursor-pointer transition bg-white">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
              <span className="text-xs text-slate-600">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600">Upload image</span>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* ✅ MEDIA LIST */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          </div>
        ) : media.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            No images yet
          </p>
        ) : (
          media.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 bg-white rounded border text-xs"
            >
              <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-slate-900 font-medium">
                  {item.filename}
                </p>
                <p className="text-slate-500">
                  {(item.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                onClick={() => copyUrl(item.url)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 transition"
              >
                Copy
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 hover:bg-red-100 rounded transition"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MediaPanel;
