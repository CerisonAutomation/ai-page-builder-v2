/**
 * Puck Editor Client Component
 * Receives pre-loaded data from server, integrates AI panel + autosave.
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import type { Data } from "@measured/puck";
import { puckConfig } from "@/lib/puck/config";
import { AIEnhancedPanel } from "@/components/editor/AIPanel.enhanced";
import { MediaPanel } from "@/components/editor/MediaPanel";
import { VersionControl } from "@/components/editor/VersionControl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/** Milliseconds to wait after the last change before autosaving. */
const AUTOSAVE_DEBOUNCE_MS = 3000;

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
  const [isPublished, setIsPublished] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist page data (called both on explicit Publish and on autosave)
  const savePage = useCallback(
    async (data: Data, { silent = false }: { silent?: boolean } = {}) => {
      if (!data?.root?.props?.title) {
        if (!silent) toast.error("Page title is required");
        return;
      }

      setIsSaving(true);
      try {
        const method = pageId ? "PUT" : "POST";
        const url = pageId ? `/api/pages/${slug}` : "/api/pages";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            title: data.root.props.title || title,
            description: data.root.props.description || description,
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
        if (!silent) {
          toast.success(pageId ? "Page saved!" : "Page created!");
          setIsPublished(true);
        }

        if (!pageId && result?.slug) {
          setTimeout(() => {
            window.location.href = `/edit/${result.slug}`;
          }, 100);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save";
        if (!silent) toast.error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [slug, pageId, title, description]
  );

  // Autosave: debounce saves AUTOSAVE_DEBOUNCE_MS after the last change
  const handleChange = useCallback(
    (data: Data) => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        savePage(data, { silent: true });
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [savePage]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Puck
        config={puckConfig}
        data={initialData}
        onPublish={savePage}
        onChange={handleChange}
        overrides={{
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

          canvas: ({ children }) => (
            <div className="flex h-full overflow-hidden">
              <div className="flex-1 overflow-auto">{children}</div>
            </div>
          ),

          fields: ({ children }) => (
            <div className="flex flex-col h-full w-80 border-r bg-white overflow-hidden">
              <div className="flex-1 overflow-y-auto">{children}</div>

              {/* AI panel with text refinement */}
              <div className="border-t">
                <AIEnhancedPanel slug={slug} />
              </div>

              {/* Media panel */}
              <div className="border-t">
                <MediaPanel />
              </div>

              {/* Version history */}
              <VersionControl pageId={pageId} slug={slug} />
            </div>
          ),
        }}
      />
    </div>
  );
}
