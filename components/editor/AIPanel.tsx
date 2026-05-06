/**
 * AI Panel Component
 * Block & page generation in editor sidebar
 */

"use client";

import { useState, useCallback } from "react";
import { usePuck } from "@measured/puck";
import type { Data } from "@measured/puck";
import { puckConfig } from "@/lib/puck/config";
import { Loader2, Sparkles, Wand2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

type Tone = "professional" | "casual" | "bold" | "minimal";

interface AIPanelProps {
  slug: string;
}

export function AIPanel({ slug }: AIPanelProps) {
  // FIX: destructure both dispatch AND state from usePuck
  const { dispatch, state } = usePuck();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"block" | "page">("block");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [industry, setIndustry] = useState("technology");
  const [tone, setTone] = useState<Tone>("professional");

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "block") {
        const res = await fetch("/api/ai/generate-block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt.trim(),
            context: `${industry} page, ${tone} tone`,
          }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const output = await res.json();

        // Validate component exists
        if (!(output.componentName in puckConfig.components)) {
          throw new Error(
            `Invalid block: ${output.componentName}. Contact support.`
          );
        }

        // FIX: use state.data (not dispatch.state which is undefined)
        if (!state?.data?.content) {
          throw new Error("Invalid editor state: content array missing");
        }

        const updatedData: Data = {
          ...state.data,
          content: [
            ...state.data.content,
            { type: output.componentName, props: output.props },
          ],
        };

        dispatch({ type: "SET_DATA", data: updatedData });
        toast.success(`${output.componentName} added!`);
        setPrompt("");
      } else {
        const res = await fetch("/api/ai/generate-page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: prompt.trim(),
            industry,
            tone,
          }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const pageData = await res.json();

        dispatch({ type: "SET_DATA", data: pageData as Data });
        toast.success("Page generated! Review and customize.");
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
  }, [prompt, mode, slug, dispatch, state, industry, tone]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  return (
    <div className="p-3 space-y-3 bg-slate-50">
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

      {/* Advanced options: industry + tone */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700 transition"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          />
          Advanced options
        </button>
        {showAdvanced && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., technology, healthcare..."
                className="w-full text-xs border rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full text-xs border rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-violet-400"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="bold">Bold</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 rounded p-2">
          {error}
        </div>
      )}

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

      <p className="text-[10px] text-slate-400 text-center">
        ⌘↵ or Ctrl+↵ to generate
      </p>
    </div>
  );
}

export default AIPanel;
