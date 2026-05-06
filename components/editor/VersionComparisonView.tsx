/**
 * Version Comparison View Component
 * ✅ Side-by-side comparison with timeline, annotations, detailed block-level diff
 */

"use client";

import { useState, useMemo } from "react";
import type { Data } from "@measured/puck";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Copy,
  Download,
  Share2,
} from "lucide-react";
import { formatDistance } from "date-fns";
import { VersionDiffViewer } from "./VersionDiffViewer";

interface VersionSnapshot {
  id: string;
  data: Data;
  label: string;
  created_at: string;
  blocks_count?: number;
}

interface VersionComparisonViewProps {
  versions: VersionSnapshot[];
  currentData: Data;
  onRestore?: (versionId: string) => void;
  onAddLabel?: (versionId: string, label: string) => void;
}

type ComparisonMode = "timeline" | "sidebyside" | "detailed";

export function VersionComparisonView({
  versions,
  currentData,
  onRestore,
  onAddLabel,
}: VersionComparisonViewProps) {
  const [mode, setMode] = useState<ComparisonMode>("timeline");
  const [selectedVersion, setSelectedVersion] = useState<string | null>(
    versions[0]?.id || null
  );
  const [annotationOpen, setAnnotationOpen] = useState(false);

  // Get selected version
  const selectedVersionData = useMemo(() => {
    return versions.find((v) => v.id === selectedVersion);
  }, [versions, selectedVersion]);

  // Calculate blocks count for current
  const currentBlocksCount = Array.isArray(currentData?.content)
    ? currentData.content.length
    : 0;

  // Export comparison
  const handleExportComparison = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      mode,
      currentVersion: {
        blocksCount: currentBlocksCount,
        data: currentData,
      },
      selectedVersion: selectedVersionData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `version-comparison-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded border">
        <div className="flex gap-2">
          {(["timeline", "sidebyside", "detailed"] as const).map(
            (m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  mode === m
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                }`}
              >
                {m === "timeline"
                  ? "Timeline"
                  : m === "sidebyside"
                    ? "Side-by-Side"
                    : "Detailed"}
              </button>
            )
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportComparison}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-slate-50 transition-colors"
            title="Export comparison as JSON"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Timeline Mode */}
      {mode === "timeline" && (
        <div className="bg-white rounded border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm mb-4">Version Timeline</h3>

            {/* Timeline */}
            <div className="space-y-2">
              {versions.map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVersion(v.id)}
                  className={`w-full p-3 rounded border-2 transition-all text-left ${
                    selectedVersion === v.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {v.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDistance(new Date(v.created_at), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {v.blocks_count || 0} blocks
                      </p>
                    </div>

                    {/* Version Badge */}
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded flex-shrink-0">
                      v{versions.length - idx}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          {selectedVersionData && (
            <div className="p-4 border-t bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-sm">Comparison Details</h4>
                {onRestore && (
                  <button
                    onClick={() => onRestore(selectedVersionData.id)}
                    className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    Restore This Version
                  </button>
                )}
              </div>

              <VersionDiffViewer
                oldData={selectedVersionData.data}
                newData={currentData}
                oldLabel={selectedVersionData.label}
                newLabel="Current Version"
              />
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Mode */}
      {mode === "sidebyside" && selectedVersionData && (
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Selected Version */}
          <div className="bg-white rounded border">
            <div className="px-4 py-3 border-b bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-900">
                {selectedVersionData.label}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {formatDistance(
                  new Date(selectedVersionData.created_at),
                  new Date(),
                  { addSuffix: true }
                )}
              </p>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="text-xs space-y-3">
                <div>
                  <p className="font-medium text-slate-700 mb-2">Blocks:</p>
                  <p className="text-slate-600">
                    {selectedVersionData.blocks_count || 0} blocks
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-700 mb-2">Structure:</p>
                  <pre className="bg-slate-50 p-2 rounded text-xs overflow-auto max-h-48 border">
                    {JSON.stringify(
                      selectedVersionData.data?.content || [],
                      null,
                      2
                    ).substring(0, 500)}
                    ...
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Current Version */}
          <div className="bg-white rounded border">
            <div className="px-4 py-3 border-b bg-green-50">
              <h3 className="font-semibold text-sm text-slate-900">
                Current Version
              </h3>
              <p className="text-xs text-slate-600 mt-1">Latest changes</p>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="text-xs space-y-3">
                <div>
                  <p className="font-medium text-slate-700 mb-2">Blocks:</p>
                  <p className="text-slate-600">{currentBlocksCount} blocks</p>
                </div>

                <div>
                  <p className="font-medium text-slate-700 mb-2">Structure:</p>
                  <pre className="bg-slate-50 p-2 rounded text-xs overflow-auto max-h-48 border">
                    {JSON.stringify(currentData?.content || [], null, 2).substring(
                      0,
                      500
                    )}
                    ...
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Mode */}
      {mode === "detailed" && selectedVersionData && (
        <div className="bg-white rounded border p-4">
          <VersionDiffViewer
            oldData={selectedVersionData.data}
            newData={currentData}
            oldLabel={selectedVersionData.label}
            newLabel="Current Version"
          />
        </div>
      )}

      {/* Navigation */}
      {versions.length > 1 && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => {
              const currentIdx = versions.findIndex(
                (v) => v.id === selectedVersion
              );
              if (currentIdx < versions.length - 1) {
                setSelectedVersion(versions[currentIdx + 1].id);
              }
            }}
            disabled={
              selectedVersion === versions[versions.length - 1]?.id
            }
            className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            Earlier
          </button>

          <button
            onClick={() => {
              const currentIdx = versions.findIndex(
                (v) => v.id === selectedVersion
              );
              if (currentIdx > 0) {
                setSelectedVersion(versions[currentIdx - 1].id);
              }
            }}
            disabled={selectedVersion === versions[0]?.id}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Later
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
