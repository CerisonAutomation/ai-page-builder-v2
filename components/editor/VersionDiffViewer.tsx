/**
 * Version Diff Viewer Component
 * ✅ Visual comparison of two versions with block-level diff
 */

"use client";

import { useState } from "react";
import type { Data } from "@measured/puck";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit as EditIcon,
  Eye,
  EyeOff,
} from "lucide-react";

interface Block {
  type: string;
  props?: Record<string, any>;
  [key: string]: any;
}

interface DiffBlock {
  type: "added" | "removed" | "modified";
  block: Block;
  oldBlock?: Block;
  index: number;
}

interface VersionDiffViewerProps {
  oldData: Data;
  newData: Data;
  oldLabel?: string;
  newLabel?: string;
}

export function VersionDiffViewer({
  oldData,
  newData,
  oldLabel = "Previous Version",
  newLabel = "Current Version",
}: VersionDiffViewerProps) {
  const [expandedDiffs, setExpandedDiffs] = useState<Set<number>>(
    new Set()
  );
  const [showRemoved, setShowRemoved] = useState(true);
  const [showAdded, setShowAdded] = useState(true);
  const [showModified, setShowModified] = useState(true);

  // Extract blocks
  const oldBlocks = (oldData?.content || []) as Block[];
  const newBlocks = (newData?.content || []) as Block[];

  const oldBlockMap = new Map(
    oldBlocks.map((b: Block, i) => [b.props?.id || i, { block: b, index: i }])
  );
  const newBlockMap = new Map(
    newBlocks.map((b: Block, i) => [b.props?.id || i, { block: b, index: i }])
  );

  // Compute diffs
  const diffs: DiffBlock[] = [];

  // Added blocks
  for (const [key, { block, index }] of newBlockMap) {
    if (!oldBlockMap.has(key)) {
      diffs.push({
        type: "added",
        block,
        index,
      });
    }
  }

  // Removed blocks
  for (const [key, { block, index }] of oldBlockMap) {
    if (!newBlockMap.has(key)) {
      diffs.push({
        type: "removed",
        block,
        index,
      });
    }
  }

  // Modified blocks
  for (const [key, { block: newBlock, index }] of newBlockMap) {
    const oldEntry = oldBlockMap.get(key);
    if (oldEntry && JSON.stringify(oldEntry.block) !== JSON.stringify(newBlock)) {
      diffs.push({
        type: "modified",
        block: newBlock,
        oldBlock: oldEntry.block,
        index,
      });
    }
  }

  // Sort by index
  diffs.sort((a, b) => a.index - b.index);

  // Filter
  const filteredDiffs = diffs.filter((diff) => {
    if (diff.type === "removed") return showRemoved;
    if (diff.type === "added") return showAdded;
    if (diff.type === "modified") return showModified;
    return true;
  });

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedDiffs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDiffs(newExpanded);
  };

  const getTypeColor = (
    type: "added" | "removed" | "modified"
  ): string => {
    switch (type) {
      case "added":
        return "border-green-300 bg-green-50";
      case "removed":
        return "border-red-300 bg-red-50";
      case "modified":
        return "border-blue-300 bg-blue-50";
    }
  };

  const getTypeIcon = (
    type: "added" | "removed" | "modified"
  ) => {
    switch (type) {
      case "added":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "removed":
        return <Minus className="w-4 h-4 text-red-600" />;
      case "modified":
        return <EditIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeLabel = (
    type: "added" | "removed" | "modified"
  ): string => {
    switch (type) {
      case "added":
        return "Added";
      case "removed":
        return "Removed";
      case "modified":
        return "Modified";
    }
  };

  return (
    <div className="bg-white rounded border">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-sm mb-3">Version Comparison</h3>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1 bg-green-50 text-green-700 p-2 rounded">
            <Plus className="w-3 h-3" />
            <span>{diffs.filter((d) => d.type === "added").length} added</span>
          </div>
          <div className="flex items-center gap-1 bg-red-50 text-red-700 p-2 rounded">
            <Minus className="w-3 h-3" />
            <span>{diffs.filter((d) => d.type === "removed").length} removed</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 p-2 rounded">
            <EditIcon className="w-3 h-3" />
            <span>{diffs.filter((d) => d.type === "modified").length} modified</span>
          </div>
        </div>

        {/* Toggle Filters */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setShowAdded(!showAdded)}
            className={`px-2 py-1 rounded border transition-colors ${
              showAdded
                ? "bg-green-100 border-green-300 text-green-700"
                : "bg-slate-100 border-slate-300 text-slate-600"
            }`}
          >
            {showAdded ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
            Added
          </button>
          <button
            onClick={() => setShowRemoved(!showRemoved)}
            className={`px-2 py-1 rounded border transition-colors ${
              showRemoved
                ? "bg-red-100 border-red-300 text-red-700"
                : "bg-slate-100 border-slate-300 text-slate-600"
            }`}
          >
            {showRemoved ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
            Removed
          </button>
          <button
            onClick={() => setShowModified(!showModified)}
            className={`px-2 py-1 rounded border transition-colors ${
              showModified
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-slate-100 border-slate-300 text-slate-600"
            }`}
          >
            {showModified ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
            Modified
          </button>
        </div>
      </div>

      {/* Diffs List */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {filteredDiffs.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <p className="text-sm">No changes to display</p>
          </div>
        ) : (
          filteredDiffs.map((diff, idx) => (
            <div
              key={idx}
              className={`border-l-4 ${getTypeColor(diff.type)}`}
            >
              <button
                onClick={() => toggleExpanded(idx)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getTypeIcon(diff.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {diff.block.type || "Block"}
                    </p>
                    <p className="text-xs text-slate-600">
                      {getTypeLabel(diff.type)} at position {diff.index}
                    </p>
                  </div>
                </div>

                {expandedDiffs.has(idx) ? (
                  <ChevronUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                )}
              </button>

              {/* Details */}
              {expandedDiffs.has(idx) && (
                <div className="px-4 py-3 bg-white text-xs border-t">
                  {diff.type === "modified" && diff.oldBlock && (
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-slate-700 mb-1">
                          {oldLabel}
                        </p>
                        <pre className="bg-red-50 text-red-700 p-2 rounded text-xs overflow-auto max-h-24 border border-red-200">
                          {JSON.stringify(diff.oldBlock.props, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 mb-1">
                          {newLabel}
                        </p>
                        <pre className="bg-green-50 text-green-700 p-2 rounded text-xs overflow-auto max-h-24 border border-green-200">
                          {JSON.stringify(diff.block.props, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {diff.type === "added" && (
                    <pre className="bg-green-50 text-green-700 p-2 rounded border border-green-200 overflow-auto max-h-32">
                      {JSON.stringify(diff.block.props, null, 2)}
                    </pre>
                  )}

                  {diff.type === "removed" && (
                    <pre className="bg-red-50 text-red-700 p-2 rounded border border-red-200 overflow-auto max-h-32">
                      {JSON.stringify(diff.block.props, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
