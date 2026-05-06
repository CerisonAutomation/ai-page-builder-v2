/**
 * Diff Preview Component
 * ✅ Shows side-by-side comparison of original vs refined text
 * Highlights changes using color coding
 */

"use client";

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";

interface DiffPreviewProps {
  original: string;
  refined: string;
  compact?: boolean;
}

// ✅ WORD-LEVEL DIFF ALGORITHM (simple)
function diffWords(original: string, refined: string): Array<{
  text: string;
  type: 'equal' | 'removed' | 'added';
}> {
  const origWords = original.split(/(\s+)/);
  const refinedWords = refined.split(/(\s+)/);

  // Simple word-level diff (not perfect but good for preview)
  const result: Array<{ text: string; type: 'equal' | 'removed' | 'added' }> = [];
  
  let origIdx = 0;
  let refinedIdx = 0;

  while (origIdx < origWords.length && refinedIdx < refinedWords.length) {
    if (origWords[origIdx] === refinedWords[refinedIdx]) {
      result.push({ text: origWords[origIdx], type: 'equal' });
      origIdx++;
      refinedIdx++;
    } else {
      // Look ahead for matches
      let found = false;
      for (let i = refinedIdx + 1; i < Math.min(refinedIdx + 5, refinedWords.length); i++) {
        if (origWords[origIdx] === refinedWords[i]) {
          // Words between refined[refinedIdx..i-1] are additions
          for (let j = refinedIdx; j < i; j++) {
            result.push({ text: refinedWords[j], type: 'added' });
          }
          result.push({ text: origWords[origIdx], type: 'equal' });
          origIdx++;
          refinedIdx = i + 1;
          found = true;
          break;
        }
      }
      if (!found) {
        result.push({ text: origWords[origIdx], type: 'removed' });
        origIdx++;
      }
    }
  }

  // Add remaining original words as removed
  while (origIdx < origWords.length) {
    result.push({ text: origWords[origIdx], type: 'removed' });
    origIdx++;
  }

  // Add remaining refined words as added
  while (refinedIdx < refinedWords.length) {
    result.push({ text: refinedWords[refinedIdx], type: 'added' });
    refinedIdx++;
  }

  return result;
}

// ✅ STATS COMPONENT
function DiffStats({ original, refined }: { original: string; refined: string }) {
  const origLength = original.length;
  const refinedLength = refined.length;
  const diffPercent = Math.round(((refinedLength - origLength) / origLength) * 100);
  const origWords = original.split(/\s+/).length;
  const refinedWords = refined.split(/\s+/).length;

  return (
    <div className="flex gap-4 text-xs text-slate-600 mb-3 pb-3 border-b">
      <div>
        <span className="font-semibold text-slate-700">{origLength}</span> chars
      </div>
      <div>
        <span className="font-semibold text-slate-700">{refinedLength}</span> chars{" "}
        <span className={diffPercent < 0 ? "text-green-600" : "text-orange-600"}>
          ({diffPercent > 0 ? "+" : ""}{diffPercent}%)
        </span>
      </div>
      <div>
        <span className="font-semibold text-slate-700">{origWords}</span> →{" "}
        <span className="font-semibold text-slate-700">{refinedWords}</span> words
      </div>
    </div>
  );
}

export function DiffPreview({ original, refined, compact = false }: DiffPreviewProps) {
  const diff = useMemo(() => diffWords(original, refined), [original, refined]);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-600">Original</div>
        <p className="text-sm text-slate-700 leading-relaxed line-through opacity-60">
          {original}
        </p>
        <div className="flex justify-center py-2">
          <ArrowRight className="w-4 h-4 text-violet-400" />
        </div>
        <div className="text-xs font-medium text-slate-600">Refined</div>
        <p className="text-sm font-medium text-slate-900 leading-relaxed bg-green-50 p-2 rounded border border-green-200">
          {refined}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-white border rounded-lg p-3">
      <DiffStats original={original} refined={refined} />

      <div className="grid grid-cols-2 gap-3">
        {/* Original */}
        <div>
          <div className="text-xs font-medium text-slate-600 mb-2">Original</div>
          <div className="text-sm leading-relaxed text-slate-700 p-2 bg-slate-50 rounded border border-slate-200 min-h-[60px]">
            {original}
          </div>
        </div>

        {/* Refined with diff highlights */}
        <div>
          <div className="text-xs font-medium text-slate-600 mb-2">Refined</div>
          <div className="text-sm leading-relaxed p-2 bg-green-50 rounded border border-green-200 min-h-[60px]">
            {diff.map((item, idx) => (
              <span
                key={idx}
                className={`${
                  item.type === "removed"
                    ? "line-through text-red-600 opacity-50"
                    : item.type === "added"
                    ? "bg-green-200 font-semibold text-green-900 px-0.5 rounded"
                    : "text-slate-900"
                }`}
              >
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiffPreview;
