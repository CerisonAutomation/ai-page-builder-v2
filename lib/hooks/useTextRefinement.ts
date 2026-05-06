/**
 * useTextRefinement Hook
 * ✅ Manages text selection, refinement panel state, and field tracking
 * ✅ Integrates with Puck editor context
 */

import { useCallback, useState, useRef } from "react";

export interface TextSelection {
  text: string;
  fieldPath?: string; // Puck field path for updates
  context?: string; // Human-readable context
  blockId?: string;
}

export function useTextRefinement() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [fieldPath, setFieldPath] = useState<string | undefined>();
  const [context, setContext] = useState<string | undefined>();
  const selectionRef = useRef<TextSelection>({
    text: "",
  });

  // ✅ SELECT TEXT FOR REFINEMENT
  const selectText = useCallback(
    (selection: TextSelection) => {
      selectionRef.current = selection;
      setSelectedText(selection.text);
      setFieldPath(selection.fieldPath);
      setContext(selection.context);
      setIsPanelOpen(true);
    },
    []
  );

  // ✅ CLOSE REFINEMENT PANEL
  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedText("");
    setFieldPath(undefined);
    setContext(undefined);
    selectionRef.current = { text: "" };
  }, []);

  // ✅ GET SELECTION FROM DOM (for inline text)
  const getSelectedTextFromDOM = useCallback((): string => {
    if (typeof window === "undefined") return "";
    const selection = window.getSelection();
    return selection?.toString() || "";
  }, []);

  // ✅ ENABLE INLINE REFINEMENT ON TEXT ELEMENTS
  const enableInlineRefinement = useCallback(
    (element: HTMLElement, options?: { context?: string; fieldPath?: string }) => {
      const handleSelection = () => {
        const selectedText = getSelectedTextFromDOM();
        if (selectedText.trim().length > 0) {
          selectText({
            text: selectedText,
            context: options?.context,
            fieldPath: options?.fieldPath,
          });
        }
      };

      element.addEventListener("mouseup", handleSelection);

      return () => {
        element.removeEventListener("mouseup", handleSelection);
      };
    },
    [selectText, getSelectedTextFromDOM]
  );

  return {
    // State
    isPanelOpen,
    selectedText,
    fieldPath,
    context,
    selectionRef,

    // Actions
    selectText,
    closePanel,
    getSelectedTextFromDOM,
    enableInlineRefinement,
  };
}

export default useTextRefinement;
