/**
 * useAutoSave Hook
 * Debounced auto-save: fires 2 seconds after the last change.
 * Only saves when the page data has actually changed (dirty-state guard).
 * Uses structural comparison to avoid JSON.stringify on every render.
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePuck } from "@measured/puck";
import type { Data } from "@measured/puck";

interface UseAutoSaveOptions {
  slug: string;
  title: string;
  description: string;
  debounceMs?: number;
  onSaved?: () => void;
}

export function useAutoSave({
  slug,
  title,
  description,
  debounceMs = 2000,
  onSaved,
}: UseAutoSaveOptions) {
  const { state } = usePuck();
  const prevDataRef = useRef<Data | null>(null);
  const prevStringRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(
    async (data: Data) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      try {
        const res = await fetch(`/api/pages/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            title: data.root?.props?.title || title,
            description: data.root?.props?.description || description,
            data,
          }),
        });

        if (res.ok) {
          prevDataRef.current = data;
          prevStringRef.current = JSON.stringify(data);
          onSaved?.();
        }
      } catch {
        // Silent fail — auto-save errors shouldn't interrupt the user
      } finally {
        isSavingRef.current = false;
      }
    },
    [slug, title, description, onSaved]
  );

  useEffect(() => {
    // Structural comparison first (avoid stringify if references match)
    if (state.data === prevDataRef.current) return;

    // Only stringify if data actually changed structurally
    const currentJson = JSON.stringify(state.data);

    if (currentJson === prevStringRef.current) {
      // Update ref to avoid future stringify
      prevDataRef.current = state.data;
      return;
    }

    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Schedule save
    timerRef.current = setTimeout(() => {
      save(state.data);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.data, save, debounceMs]);

  return {
    forceSave: () => save(state.data),
  };
}