/**
 * Text Refine Panel Component
 * ✅ Select text in any block, refine with AI (shorter, engaging, professional, grammar)
 * ✅ Edit-in-place UI with streaming responses and diff preview
 * ✅ Accept or reject refined content
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePuck } from "@measured/puck";
import {
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Copy,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { DiffPreview } from "./DiffPreview";

type RefinementMode = "shorter" | "engaging" | "professional" | "grammar" | "custom";

interface TextRefinePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  fieldPath?: string; // e.g., "content[0].props.headline"
  context?: string; // e.g., "hero headline", "product description"
}

export function TextRefinePanel({
  isOpen,
  onClose,
  selectedText,
  fieldPath = "",
  context = "",
}: TextRefinePanelProps) {
  const { dispatch, state } = usePuck();
  const [mode, setMode] = useState<RefinementMode>("shorter");
  const [customPrompt, setCustomPrompt] = useState("");
  const [refined, setRefined] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  // ✅ REFINE TEXT VIA STREAMING API
  const handleRefine = useCallback(async () => {
    if (!selectedText.trim()) {
      toast.error("No text selected");
      return;
    }

    setLoading(true);
    setStreaming(true);
    setError(null);
    setRefined("");

    // Cancel previous request if any
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
    }

    streamAbortRef.current = new AbortController();

    try {
      const requestBody = {
        text: selectedText.trim(),
        instruction: mode,
        customPrompt: mode === "custom" ? customPrompt.trim() : undefined,
        context: context || undefined,
      };

      const response = await fetch("/api/ai/refine-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: streamAbortRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Refinement failed");
      }

      // ✅ READ STREAMING RESPONSE
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse individual JSON objects from streaming response
        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1]; // Keep incomplete line in buffer

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            const data = JSON.parse(line);
            if (data.refined) {
              setRefined(data.refined);
            }
            if (data.isComplete) {
              setStreaming(false);
            }
          } catch (e) {
            // Ignore JSON parse errors for incomplete lines
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.refined) {
            setRefined(data.refined);
          }
        } catch (e) {
          // Ignore
        }
      }
    } catch (e: any) {
      if (e.name === "AbortError") {
        // Refinement was cancelled by user - no error needed
      } else {
        const message = e.message || "Refinement failed";
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [selectedText, mode, customPrompt, context]);

  // Accept refined text and apply it to the Puck editor state
  const handleAccept = useCallback(() => {
    if (!refined.trim()) {
      toast.error("No refined text to accept");
      return;
    }

    // Update Puck data with refined text
    if (fieldPath) {
      // Parse fieldPath like "content[0].props.headline"
      const pathParts = fieldPath.match(/\w+/g) || [];

      // FIX: deep-clone the data before mutation so React detects the change
      const clonedData = JSON.parse(JSON.stringify(state.data));

      let current: any = clonedData;

      // Navigate to the parent of the target field
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const index = Number(part);
        current = isNaN(index) ? current[part] : current[index];
        if (current === undefined || current === null) {
          toast.error("Could not locate field in page data");
          return;
        }
      }

      // Set the final field value
      const finalKey = pathParts[pathParts.length - 1];
      const finalIndex = Number(finalKey);
      if (!isNaN(finalIndex)) {
        current[finalIndex] = refined.trim();
      } else if (current && typeof current === "object") {
        current[finalKey] = refined.trim();
      }

      dispatch({ type: "SET_DATA", data: clonedData });
    }

    toast.success("Text refined and applied!");
    onClose();
  }, [refined, fieldPath, state.data, dispatch, onClose]);

  // ✅ COPY REFINED TEXT
  const handleCopy = useCallback(() => {
    if (refined) {
      navigator.clipboard.writeText(refined);
      toast.success("Copied to clipboard");
    }
  }, [refined]);

  // ✅ CANCEL STREAMING
  const handleCancel = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
    }
    setLoading(false);
    setStreaming(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h2 className="font-semibold text-slate-900">Refine Text</h2>
            {context && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
                {context}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white rounded-md transition text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Refinement Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(
                [
                  { id: "shorter", label: "Shorter", desc: "More concise" },
                  { id: "engaging", label: "Engaging", desc: "More compelling" },
                  {
                    id: "professional",
                    label: "Professional",
                    desc: "Formal tone",
                  },
                  { id: "grammar", label: "Grammar", desc: "Fix errors" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setMode(option.id);
                    setRefined("");
                  }}
                  className={`p-2 rounded-lg border transition text-left ${
                    mode === option.id
                      ? "bg-violet-100 border-violet-400 ring-2 ring-violet-300"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-medium text-xs text-slate-900">
                    {option.label}
                  </div>
                  <div className="text-[10px] text-slate-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt (if custom mode) */}
          {mode === "custom" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Custom Instructions
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Make this more technical, add emojis, etc."
                className="w-full text-xs border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[60px]"
              />
            </div>
          )}

          {/* Original Text */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Original Text
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed max-h-[100px] overflow-y-auto">
              {selectedText}
            </div>
          </div>

          {/* Refined Text with Diff */}
          {refined && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Refined Version
              </label>
              <DiffPreview original={selectedText} refined={refined} />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {streaming ? "Refining text..." : "Processing..."}
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="border-t bg-slate-50 px-4 py-3 flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white border rounded-lg transition"
          >
            Cancel
          </button>

          {refined ? (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white border rounded-lg transition"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={() => setRefined("")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white border rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
                Refine Again
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept
              </button>
            </>
          ) : (
            <button
              onClick={handleRefine}
              disabled={loading || !selectedText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Refine Text
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextRefinePanel;
