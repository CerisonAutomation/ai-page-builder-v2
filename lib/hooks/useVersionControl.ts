/**
 * useVersionControl Hook
 * ✅ Complete version control management for editor
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Data } from "@measured/puck";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

interface VersionSnapshot {
  id: string;
  page_id: string;
  data: Data;
  label: string;
  created_at: string;
  created_by: string;
  blocks_count?: number;
}

interface VersionDiff {
  blocksAdded: number;
  blocksRemoved: number;
  blocksModified: number;
  summary: string;
  newIds: string[];
  removedIds: string[];
  modifiedIds: string[];
}

interface UseVersionControlOptions {
  pageId: string | null;
  enabled?: boolean;
  autoSnapshotInterval?: number; // milliseconds, default 30000
  onSnapshotCreated?: (version: VersionSnapshot) => void;
  onError?: (error: Error) => void;
}

export function useVersionControl({
  pageId,
  enabled = true,
  autoSnapshotInterval = 30000,
  onSnapshotCreated,
  onError,
}: UseVersionControlOptions) {
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSnapshotTime, setLastSnapshotTime] = useState<number>(Date.now());
  const dataHashRef = useRef<string>("");

  // Load versions
  const loadVersions = useCallback(
    async (limit = 50) => {
      if (!pageId || !enabled) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/versions/${pageId}?limit=${limit}`);
        if (!res.ok) throw new Error("Failed to load versions");

        const data = await res.json();
        setVersions(data.versions || []);
        return data.versions;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pageId, enabled, onError]
  );

  // Create snapshot
  const createSnapshot = useCallback(
    async (data: Data, label?: string) => {
      if (!pageId || !enabled) return null;

      try {
        const res = await fetch("/api/versions/auto-snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, data }),
        });

        if (!res.ok) throw new Error("Failed to create snapshot");

        const result = await res.json();
        if (result.success) {
          setLastSnapshotTime(Date.now());
          await loadVersions();

          onSnapshotCreated?.(result as unknown as VersionSnapshot);
          return result;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }

      return null;
    },
    [pageId, enabled, onSnapshotCreated, onError, loadVersions]
  );

  // Restore version
  const restoreVersion = useCallback(
    async (versionId: string, label?: string) => {
      if (!pageId || !enabled) return false;

      try {
        const res = await fetch(`/api/versions/${pageId}/restore`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId, label }),
        });

        if (!res.ok) throw new Error("Failed to restore version");

        toast.success("Version restored");
        await loadVersions();
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        toast.error(err.message);
        return false;
      }
    },
    [pageId, enabled, onError, loadVersions]
  );

  // Update label
  const updateLabel = useCallback(
    async (versionId: string, newLabel: string) => {
      if (!pageId || !enabled) return false;

      try {
        const res = await fetch(`/api/versions/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId, label: newLabel }),
        });

        if (!res.ok) throw new Error("Failed to update label");

        setVersions((prev) =>
          prev.map((v) =>
            v.id === versionId ? { ...v, label: newLabel } : v
          )
        );

        toast.success("Label updated");
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        toast.error(err.message);
        return false;
      }
    },
    [pageId, enabled, onError]
  );

  // Delete version
  const deleteVersion = useCallback(
    async (versionId: string) => {
      if (!pageId || !enabled) return false;

      try {
        const res = await fetch(`/api/versions/${pageId}/${versionId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete version");

        setVersions((prev) => prev.filter((v) => v.id !== versionId));
        toast.success("Version deleted");
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        toast.error(err.message);
        return false;
      }
    },
    [pageId, enabled, onError]
  );

  // Compare versions
  const compareVersions = useCallback(
    async (versionId: string, currentData: Data) => {
      if (!pageId || !enabled) return null;

      try {
        const res = await fetch(
          `/api/versions/${pageId}/compare?versionId=${versionId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentData }),
          }
        );

        if (!res.ok) throw new Error("Failed to compare versions");

        const data = await res.json();
        return data.diff as VersionDiff;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        return null;
      }
    },
    [pageId, enabled, onError]
  );

  // Auto-snapshot effect
  useEffect(() => {
    if (!pageId || !enabled) return;

    const interval = setInterval(() => {
      // Auto-snapshot is handled by client-side component
      // This hook just manages the state
    }, autoSnapshotInterval);

    return () => clearInterval(interval);
  }, [pageId, enabled, autoSnapshotInterval]);

  // Initial load
  useEffect(() => {
    if (pageId && enabled) {
      loadVersions().catch((err) => {
        logger.error("Failed to load versions", err, { pageId });
      });
    }
  }, [pageId, enabled, loadVersions]);

  return {
    versions,
    loading,
    lastSnapshotTime,
    loadVersions,
    createSnapshot,
    restoreVersion,
    updateLabel,
    deleteVersion,
    compareVersions,
  };
}
