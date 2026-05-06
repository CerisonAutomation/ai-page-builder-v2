/**
 * Puck Editor Client Component
 * ✅ Receives pre-loaded data from server
 * Integrates AI panel, auto-save, and tabbed sidebar
 */

"use client";

import { useState, useCallback } from "react";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import type { Data } from "@measured/puck";
import { puckConfig } from "@/lib/puck/config";
import { Sidebar } from "@/components/editor/Sidebar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PuckEditorProps {
  slug: string;
  pageId: string | null;
  initialData: Data;
  title: string;
  description: string;
}

export default function PuckEditor({
  slug,
  pageId,
  initialData,
  title,
  description,
}: PuckEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ✅ EXPLICIT PUBLISH
  const handlePublish = useCallback(
    async (data: Data) => {
      setIsSaving(true);
      try {
        if (!data?.root?.props?.title) {
          throw new Error("Page title is required");
        }

        const method = pageId ? "PUT" : "POST";
        const url = pageId ? `/api/pages/${slug}` : "/api/pages";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            title: (data.root?.props?.title as string) || title,
            description: description,
            data,
          }),
        });

        if (!res.ok) {
          let errorMsg = `Save failed (${res.status})`;
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
          throw new Error("Invalid server response (not JSON)");
        }

        setLastSaved(new Date());
        toast.success(pageId ? "Page updated!" : "Page created!");

        if (!pageId && result?.slug) {
          setTimeout(() => {
            window.location.href = `/edit/${result.slug}`;
          }, 100);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save";
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [slug, pageId, title, description]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={handlePublish}
        overrides={{
          // ✅ CUSTOM ACTION BAR
          actionBar: ({ children }) => (
            <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {initialData?.root?.props?.title || "Untitled"}
                  </h2>
                  {lastSaved && (
                    <p className="text-xs text-slate-500">
                      Saved {lastSaved.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {children}
                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                )}
              </div>
            </div>
          ),

          // ✅ TABBED SIDEBAR (useAutoSave runs inside Puck context here)
          fields: ({ children }) => (
            <Sidebar>
              {children}
            </Sidebar>
          ),
        }}
      />
    </div>
  );
}
