/**
 * RefinableText Component
 * ✅ Wraps text fields to enable inline AI refinement
 * ✅ Shows visual indicator for refinement on selection
 * ✅ Integrates with TextRefinePanel via context
 */

"use client";

import { useRef, useEffect, ReactNode } from "react";
import { Edit3 } from "lucide-react";

interface RefinableTextProps {
  text: string;
  onRefine: (selectedText: string) => void;
  children?: ReactNode;
  className?: string;
  isEditable?: boolean; // Show refinement indicator
  context?: string; // e.g., "hero headline"
}

export function RefinableText({
  text,
  onRefine,
  children,
  className = "",
  isEditable = true,
  context = "",
}: RefinableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditable || !containerRef.current) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && selectedText.length > 5) {
        // Minimum 5 chars to refine
        onRefine(selectedText);
      }

      // Clear selection
      selection?.removeAllRanges();
    };

    const container = containerRef.current;
    container.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isEditable, onRefine]);

  return (
    <div
      ref={containerRef}
      className={`group relative cursor-text ${className} ${
        isEditable ? "hover:bg-violet-50 rounded px-1 py-0.5 transition" : ""
      }`}
      title={isEditable ? "Select text to refine" : ""}
    >
      {children || text}

      {/* Visual Indicator */}
      {isEditable && (
        <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition text-violet-500 text-xs">
          <Edit3 className="w-3 h-3" />
        </span>
      )}
    </div>
  );
}

export default RefinableText;
