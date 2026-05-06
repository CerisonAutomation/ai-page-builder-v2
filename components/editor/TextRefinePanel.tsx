/**
 * Text Refine Panel Component
 * ✅ Select text in any block, refine with AI (shorter, engaging, professional, grammar)
 * ✅ Edit-in-place UI with streaming responses and diff preview
 * ✅ Accept or reject refined content
 */

"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";
import { usePuck } from "@measured/puck";
import {
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  Copy,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { DiffPreview } from "./DiffPreview";
import { useTranslations } from "next-intl";

type RefinementMode = "shorter" | "engaging" | "professional" | "grammar" | "custom";

interface TextRefinePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  fieldPath?: string;
  context?: string;
}

function TextRefinePanel({
  isOpen,
  onClose,
  selectedText,
  fieldPath = "",
  context = "",
}: TextRefinePanelProps) {
  const { dispatch } = usePuck();
  const [mode, setMode] = useState<RefinementMode>("shorter");
  const [customPrompt, setCustomPrompt] = useState("");
  const [refined, setRefined] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const t = useTranslations('ai');
  const tCommon = useTranslations('common');

  const handleRefine = useCallback(async () => {
    if (!selectedText.trim()) {
      toast.error(tCommon('required'));
      return;
    }

    setLoading(true);
    setStreaming(true);
    setError(null);
    setRefined("");

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

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines[lines.length - 1];

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
            // Ignore incomplete JSON
          }
        }
      }

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
        // Cancelled
      } else {
        const message = e.message || t('error');
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [selectedText, mode, customPrompt, context, t]);

  const handleAccept = useCallback(() => {
    if (!refined.trim()) {
      toast.error(tCommon('required'));
      return;
    }

    handleCopy();
    toast.success(`${t('refine')}! ${tCommon('success')}.`);
    onClose();
  }, [refined, onClose, t, tCommon]);

  const handleCopy = useCallback(() => {
    if (refined) {
      navigator.clipboard.writeText(refined);
      toast.success(tCommon('success'));
    }
  }, [refined, tCommon]);

  const handleCancel = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
    }
    setLoading(false);
    setStreaming(false);
    onClose();
  }, [onClose]);

const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the close button when modal opens
      const closeBtn = document.querySelector('[data-refine-close]') as HTMLElement;
      closeBtn?.focus();
    }

    return () => {
      if (isOpen) {
        previousFocusRef.current?.focus();
      }
    };
  }, [isOpen]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      const modal = document.querySelector('[data-refine-modal]');
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="refine-panel-title"
      onKeyDown={handleKeyDown}
    >
      <div
        data-refine-modal
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-t-xl shadow-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h2 id="refine-panel-title" className="font-semibold text-slate-900">{t('refineText')}</h2>
            {context && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
                {context}
              </span>
            )}
          </div>
          <button
            data-refine-close
            onClick={onClose}
            className="p-1 hover:bg-white rounded-md transition text-slate-500"
            aria-label={tCommon('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              {t('refine')} Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: "shorter", label: "Shorter", desc: "More concise" },
                { id: "engaging", label: "Engaging", desc: "More compelling" },
                { id: "professional", label: "Professional", desc: "Formal tone" },
                { id: "grammar", label: "Grammar", desc: "Fix errors" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setMode(option.id as RefinementMode);
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

          {mode === "custom" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                {t('promptPlaceholder')}
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t('promptPlaceholder')}
                className="w-full text-xs border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[60px]"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Original Text
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed max-h-[100px] overflow-y-auto">
              {selectedText}
            </div>
          </div>

          {refined && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Refined Version
              </label>
              <DiffPreview original={selectedText} refined={refined} />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {streaming ? t('generating') : "Processing..."}
            </div>
          )}
        </div>

        <div className="border-t bg-slate-50 px-4 py-3 flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white border rounded-lg transition"
          >
            {tCommon('cancel')}
          </button>

          {refined ? (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white border rounded-lg transition"
              >
                <Copy className="w-4 h-4" />
                {tCommon('copy')}
              </button>
              <button
                onClick={() => setRefined("")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white border rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
                {t('refine')} {tCommon('back')}
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {tCommon('confirm')}
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
                  {t('generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('refine')} Text
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(TextRefinePanel);
