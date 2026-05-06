/**
 * Version Control UI Component
 * ✅ Full revision history, diff viewer, inline restore, annotations
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { usePuck } from "@measured/puck";
import type { Data } from "@measured/puck";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit2,
  Eye,
  Loader2,
  Redo2,
  Trash2,
  Filter,
  Search,
  Tag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistance } from "date-fns";
import { logger } from "@/lib/utils/logger";

interface VersionSnapshot {
  id: string;
  page_id: string;
  data: Data;
  label: string;
  created_at: string;
  created_by: string;
  blocks_count?: number;
  diff_summary?: string;
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

interface VersionControlProps {
  pageId: string | null;
  slug: string;
}

export function VersionControl({ pageId, slug }: VersionControlProps) {
  const { state, dispatch } = usePuck();
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<VersionDiff | null>(
    null
  );
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "labeled" | "recent">(
    "all"
  );
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Load versions
  const loadVersions = useCallback(async () => {
    if (!pageId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/versions/${pageId}?limit=50`);
      if (!res.ok) throw new Error("Failed to load versions");

      const data = await res.json();
      setVersions(data.versions || []);
    } catch (error) {
      logger.error("Failed to load version history", error, { pageId });
      toast.error("Failed to load version history");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (expanded && pageId) {
      loadVersions();
    }
  }, [expanded, pageId, loadVersions]);

  // Auto-snapshot every 30 seconds (if changed)
  useEffect(() => {
    if (!pageId) return;

    const interval = setInterval(async () => {
      try {
        await fetch("/api/versions/auto-snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId,
            data: state.data,
          }),
        });
      } catch (error) {
        // Silent fail for auto-snapshots - no logging needed
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [pageId, state.data]);

  // Compare current with version
  const handleCompare = useCallback(
    async (versionId: string) => {
      try {
        setComparing(versionId);
        const res = await fetch(`/api/versions/${pageId}/compare`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // FIX: include versionId in body (route reads from body, not query param)
            versionId,
            currentData: state.data,
          }),
        });

        if (!res.ok) throw new Error("Comparison failed");
        const diff = await res.json();
        setComparisonResult(diff);
      } catch (error) {
        toast.error("Failed to compare versions");
      } finally {
        setComparing(null);
      }
    },
    [pageId, state.data]
  );

  // Restore version
  const handleRestore = useCallback(
    async (versionId: string) => {
      if (
        !confirm(
          "Restore this version? Current changes will be saved as a snapshot."
        )
      ) {
        return;
      }

      setRestoringId(versionId);
      try {
        const res = await fetch(`/api/versions/${pageId}/restore`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ versionId }),
        });

        if (!res.ok) throw new Error("Restore failed");

        const result = await res.json();

        // FIX: apply restored data to the editor immediately instead of
        // asking the user to refresh the page.
        if (result.restoredData) {
          dispatch({ type: "SET_DATA", data: result.restoredData });
        }

        toast.success("Version restored!");
        await loadVersions();
      } catch (error) {
        toast.error("Failed to restore version");
      } finally {
        setRestoringId(null);
      }
    },
    [pageId, loadVersions, dispatch]
  );

  // Update label — FIX: use the correct /[pageId]/[versionId] sub-route
  const handleUpdateLabel = useCallback(
    async (versionId: string) => {
      if (!newLabel.trim()) {
        toast.error("Label cannot be empty");
        return;
      }

      try {
        const res = await fetch(`/api/versions/${pageId}/${versionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: newLabel }),
        });

        if (!res.ok) throw new Error("Update failed");

        setVersions((prev) =>
          prev.map((v) =>
            v.id === versionId ? { ...v, label: newLabel } : v
          )
        );
        setEditingLabel(null);
        setNewLabel("");
        toast.success("Label updated");
      } catch (error) {
        toast.error("Failed to update label");
      }
    },
    [pageId, newLabel]
  );

  // Delete version — FIX: use the correct /[pageId]/[versionId] sub-route
  const handleDeleteVersion = useCallback(
    async (versionId: string) => {
      if (!confirm("Delete this version? This cannot be undone.")) return;

      try {
        const res = await fetch(`/api/versions/${pageId}/${versionId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Delete failed");

        setVersions((prev) => prev.filter((v) => v.id !== versionId));
        toast.success("Version deleted");
      } catch (error) {
        toast.error("Failed to delete version");
      }
    },
    [pageId]
  );

  // Filter versions
  const filteredVersions = versions.filter((v) => {
    // "labeled": only versions that have a custom label (not auto-generated)
    if (filterMode === "labeled" && !v.label) return false;
    // FIX: "recent" = last 24 hours, not same as "labeled"
    if (filterMode === "recent") {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      if (new Date(v.created_at).getTime() < cutoff) return false;
    }

    if (searchQuery.trim()) {
      return (v.label ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  if (!pageId) {
    return (
      <div className="p-3 text-xs text-slate-400 border-t bg-slate-50">
        Create page to enable version control
      </div>
    );
  }

  return (
    <div className="border-t bg-slate-50">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-medium text-sm">Version History</span>
          {versions.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {versions.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t">
          {/* Controls */}
          <div className="p-3 space-y-2 border-b bg-white">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search versions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border rounded bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              {(["all", "labeled", "recent"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    filterMode === mode
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Status */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading versions...
              </div>
            )}
          </div>

          {/* Comparison View */}
          {comparisonResult && (
            <div className="p-3 border-b bg-amber-50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-900">
                    Comparison
                  </span>
                  <button
                    onClick={() => {
                      setComparisonResult(null);
                      setComparing(null);
                    }}
                    className="text-xs text-amber-600 hover:text-amber-700"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {comparisonResult.blocksAdded > 0 && (
                    <div className="flex items-center gap-1 text-green-700 bg-green-50 p-2 rounded">
                      <CheckCircle className="w-3 h-3" />
                      <span>+{comparisonResult.blocksAdded}</span>
                    </div>
                  )}
                  {comparisonResult.blocksRemoved > 0 && (
                    <div className="flex items-center gap-1 text-red-700 bg-red-50 p-2 rounded">
                      <AlertCircle className="w-3 h-3" />
                      <span>-{comparisonResult.blocksRemoved}</span>
                    </div>
                  )}
                  {comparisonResult.blocksModified > 0 && (
                    <div className="flex items-center gap-1 text-blue-700 bg-blue-50 p-2 rounded">
                      <Edit2 className="w-3 h-3" />
                      <span>~{comparisonResult.blocksModified}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 bg-white p-2 rounded">
                  {comparisonResult.summary}
                </p>
              </div>
            </div>
          )}

          {/* Versions List */}
          <div className="divide-y max-h-96 overflow-y-auto">
            {filteredVersions.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No versions yet</p>
                <p className="text-xs opacity-70">
                  Auto-saves happen every 30s
                </p>
              </div>
            ) : (
              filteredVersions.map((version, idx) => (
                <div key={version.id} className="p-3 hover:bg-slate-50">
                  {/* Label Section */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      {editingLabel === version.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Enter label..."
                            autoFocus
                            className="flex-1 text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateLabel(version.id);
                              } else if (e.key === "Escape") {
                                setEditingLabel(null);
                              }
                            }}
                          />
                          <button
                            onClick={() =>
                              handleUpdateLabel(version.id)
                            }
                            className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          className="group flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setEditingLabel(version.id);
                            setNewLabel(version.label);
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">
                              {version.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDistance(
                                new Date(version.created_at),
                                new Date(),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                          <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      )}
                    </div>

                    {/* Version Index */}
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded flex-shrink-0">
                      v{filteredVersions.length - idx}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
                    {version.blocks_count && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {version.blocks_count} blocks
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCompare(version.id)}
                      disabled={comparing === version.id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs px-2 py-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors"
                    >
                      {comparing === version.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Comparing...
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          Compare
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleRestore(version.id)}
                      disabled={restoringId === version.id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs px-2 py-1.5 border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors rounded"
                    >
                      {restoringId === version.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <Redo2 className="w-3 h-3" />
                          Restore
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteVersion(version.id)}
                      className="text-xs px-2 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete version"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 text-xs text-slate-500 bg-slate-100 border-t">
            Auto-snapshots every 30s • Showing {filteredVersions.length} of{" "}
            {versions.length}
          </div>
        </div>
      )}
    </div>
  );
}
