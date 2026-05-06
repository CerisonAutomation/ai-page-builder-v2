/**
 * Puck Editor Client Component
 * ✅ Receives pre-loaded data from server
 * Integrates AI panel for block generation
 */

"use client";

import { useState, useCallback } from "react";
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import type { Data } from "@measured/puck";
import { puckConfig } from "@/lib/puck/config";
import { AIEnhancedPanel } from "@/components/editor/AIPanel.enhanced";
import { MediaPanel } from "@/components/editor/MediaPanel";
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
  // ✅ PRE-LOADED DATA (from server)
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ✅ SAVE PAGE
  const handlePublish = useCallback(
    async (data: Data) => {
      setIsSaving(true);
      try {
        // Validate state before sending
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
            title: data.root.props.title || title,
            description: data.root.props.description || description,
            data,
          }),
        });

        if (!res.ok) {
          // Safely parse error response
          let errorMsg = `Save failed (${res.status})`;
          try {
            const errorData = await res.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch {
            // Response wasn't JSON, use status text
            errorMsg = res.statusText || errorMsg;
          }
          throw new Error(errorMsg);
        }

        // Safely parse success response
        let result: any;
        try {
          result = await res.json();
        } catch {
          throw new Error("Invalid server response (not JSON)");
        }

        setLastSaved(new Date());
        toast.success(pageId ? "Page updated!" : "Page created!");
        setIsPublished(true);

        // ✅ Navigate to newly created page if POST
        if (!pageId && result?.slug) {
          // Use a microtask to ensure state updates finish
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
      {/* ✅ PUCK EDITOR */}
      <Puck
        config={puckConfig}
        data={initialData} // ✅ Pre-loaded from server
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

          // ✅ INJECT PANELS INTO SIDEBAR
          canvas: ({ children }) => (
            <div className="flex h-full overflow-hidden">
              <div className="flex-1 overflow-auto">{children}</div>
            </div>
          ),

          // ✅ CUSTOM SIDEBAR
          fields: ({ children }) => (
            <div className="flex flex-col h-full w-80 border-r bg-white overflow-hidden">
              <div className="flex-1 overflow-y-auto">{children}</div>

              {/* ✅ AI PANEL AT BOTTOM */}
              <div className="border-t">
                <AIEnhancedPanel slug={slug} />
              </div>

              {/* ✅ MEDIA PANEL */}
              <div className="border-t">
                <MediaPanel />
              </div>
            </div>
          ),
        }}
      />

      {/* ✅ TOAST CONTAINER (Sonner) */}
      <div className="fixed bottom-0 right-0 z-50" />
    </div>
  );
}
