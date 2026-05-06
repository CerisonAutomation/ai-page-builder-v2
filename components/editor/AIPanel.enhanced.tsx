/**
 * Enhanced AI Panel Component
 * ✅ Block & page generation + inline text refinement
 * ✅ Integrated TextRefinePanel for edit-in-place workflow
 */

"use client";

import { useState, useCallback } from "react";
import { usePuck } from "@measured/puck";
import type { Data } from "@measured/puck";
import { puckConfig, emptyPage } from "@/lib/puck/config";
import { Loader2, Sparkles, Wand2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { TextRefinePanel } from "./TextRefinePanel";
import { useTextRefinement } from "@/lib/hooks/useTextRefinement";

interface AIEnhancedPanelProps {
  slug: string;
}

export function AIEnhancedPanel({ slug }: AIEnhancedPanelProps) {
  const { dispatch } = usePuck();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"block" | "page">("block");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ TEXT REFINEMENT INTEGRATION
  const textRefinement = useTextRefinement();

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "block") {
        // ✅ GENERATE SINGLE BLOCK
        const res = await fetch("/api/ai/generate-block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt.trim(),
            context: slug,
          }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const output = await res.json();

        // ✅ Validate component exists
        if (!(output.componentName in puckConfig.components)) {
          throw new Error(
            `Invalid block: ${output.componentName}. Contact support.`
          );
        }

        // ✅ CREATE NEW BLOCK
        const blockId = `ai-${uuid()}`;

        dispatch({
          type: "INSERT",
          componentType: output.componentName,
          destinationIndex: Number.MAX_SAFE_INTEGER,
          id: blockId,
          destinationZone: "content",
        });

        // ✅ SET PROPS
        dispatch({
          type: "SET_DATA",
          data: {
            ...dispatch.state.data,
            content: [
              ...dispatch.state.data.content,
              {
                type: output.componentName,
                props: output.props,
              },
            ],
          } as Data,
        });

        toast.success(`${output.componentName} added! Double-click text to refine.`);
        setPrompt("");
      } else {
        // ✅ GENERATE FULL PAGE
        const res = await fetch("/api/ai/generate-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: prompt.trim(),
            industry: "technology",
            tone: "professional",
          }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const pageData = await res.json();

        // ✅ REPLACE ENTIRE PAGE
        dispatch({
          type: "SET_DATA",
          data: pageData as Data,
        });

        toast.success("Page generated! Select text to refine details.");
        setPrompt("");
      }
    } catch (error: unknown) {
      let message = "Generation failed";

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [prompt, mode, slug, dispatch]);

  // ✅ KEYBOARD SHORTCUT
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  return (
    <>
      <div className="p-3 space-y-3 bg-gradient-to-b from-slate-50 to-white">
        {/* Tab Selection */}
        <div className="flex gap-1">
          <button
            onClick={() => setMode("block")}
            className={`flex-1 text-xs py-2 rounded font-medium transition ${
              mode === "block"
                ? "bg-violet-600 text-white"
                : "bg-white text-slate-600 border"
            }`}
          >
            <Wand2 className="w-3 h-3 inline mr-1" />
            Block
          </button>
          <button
            onClick={() => setMode("page")}
            className={`flex-1 text-xs py-2 rounded font-medium transition ${
              mode === "page"
                ? "bg-violet-600 text-white"
                : "bg-white text-slate-600 border"
            }`}
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            Page
          </button>
        </div>

        {/* Prompt Input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "block"
              ? "e.g., Blue hero with headline and CTA..."
              : "e.g., SaaS landing page for project management..."
          }
          rows={3}
          className="w-full text-xs border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
        />

        {/* Error State */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 rounded p-2">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 disabled:opacity-50 transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-3 h-3" />
              {mode === "block" ? "Generate Block" : "Generate Page"}
            </>
          )}
        </button>

        {/* Keyboard Hint */}
        <p className="text-[10px] text-slate-400 text-center">
          ⌘↵ or Ctrl+↵ to generate
        </p>

        {/* Text Refinement Hint */}
        <div className="border-t pt-3 mt-3">
          <p className="text-[10px] text-slate-500 text-center mb-2 flex items-center justify-center gap-1">
            <Edit3 className="w-3 h-3" />
            Select any text in blocks to refine
          </p>
        </div>
      </div>

      {/* ✅ TEXT REFINEMENT PANEL */}
      <TextRefinePanel
        isOpen={textRefinement.isPanelOpen}
        onClose={textRefinement.closePanel}
        selectedText={textRefinement.selectedText}
        fieldPath={textRefinement.fieldPath}
        context={textRefinement.context}
      />
    </>
  );
}

export default AIEnhancedPanel;
