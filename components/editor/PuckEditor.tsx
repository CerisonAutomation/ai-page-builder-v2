"use client";

import { useState, useCallback, memo } from "react";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import type { Data } from "@measured/puck";
import { puckConfig } from "@/lib/puck/config";
import { Sidebar } from "@/components/editor/Sidebar";
import { ImagePicker } from "@/components/media/ImagePicker";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface PuckEditorProps {
  slug: string;
  pageId: string | null;
  initialData: Data;
  title: string;
  description: string;
}

function PuckEditor({
  slug,
  pageId,
  initialData,
  title,
  description,
}: PuckEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const t = useTranslations('editor');
  const tCommon = useTranslations('common');

  const handlePublish = useCallback(
    async (data: Data) => {
      setIsSaving(true);
      try {
        if (!data?.root?.props?.title) {
          throw new Error(t('pageTitleRequired'));
        }

        const method = pageId ? "PUT" : "POST";
        const url = pageId ? `/api/pages/${slug}` : "/api/pages";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            title: (data.root?.props?.title as string) || title,
            description,
            data,
          }),
        });

        if (!res.ok) {
          let errorMsg = `${t('saveFailed')} (${res.status})`;
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch {
            errorMsg = res.statusText || errorMsg;
          }
          throw new Error(errorMsg);
        }

        let result: any;
        try {
          result = await res.json();
        } catch {
          throw new Error(t('invalidResponse'));
        }

        setLastSaved(new Date());
        toast.success(pageId ? t('pageUpdated') : t('pageCreated'));

        if (!pageId && result?.slug) {
          setTimeout(() => {
            window.location.href = `/edit/${result.slug}`;
          }, 100);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('failedToSave');
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [slug, pageId, title, description, t]
  );

  const handleImageSelect = (image: { url: string; alt?: string }) => {
    // Copy URL to clipboard for manual paste
    navigator.clipboard.writeText(image.url).then(() => {
      toast.success('Image URL copied to clipboard!');
    }).catch(() => {
      toast.info(`Image URL: ${image.url}`);
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
        overrides={{
          actionBar: ({ children }) => (
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {initialData?.root?.props?.title || t('untitled')}
                  </h2>
                  {lastSaved && (
                    <p className="text-xs text-slate-500">
                      {t('saved')} {lastSaved.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowImagePicker(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  Insert Image
                </button>
                {children}
                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('saving')}
                  </div>
                )}
              </div>
            </div>
          ),

          fields: ({ children }) => (
            <Sidebar>
              {children}
            </Sidebar>
          ),
        }}
      />

      {showImagePicker && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
}

export default memo(PuckEditor);
