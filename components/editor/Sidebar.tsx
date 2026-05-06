/**
 * Editor Sidebar — Tabbed panel: Fields / AI / Media / History
 * Calls useAutoSave here since Sidebar renders inside Puck context.
 */

"use client";

import { useState } from "react";
import { Wand2, Image, Clock, LayoutGrid } from "lucide-react";
import { AIEnhancedPanel } from "./AIPanel.enhanced";
import { MediaPanel } from "./MediaPanel";
import { VersionControl } from "./VersionControl";
import { useAutoSave } from "@/lib/hooks/useAutoSave";

interface SidebarProps {
  /** Children = Puck's native fields panel */
  children: React.ReactNode;
  slug: string;
  pageId: string | null;
  title: string;
  description: string;
  onSaved?: () => void;
}

const TABS = [
  { id: "blocks", label: "Fields", icon: LayoutGrid },
  { id: "ai", label: "AI", icon: Wand2 },
  { id: "media", label: "Media", icon: Image },
  { id: "history", label: "History", icon: Clock },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Sidebar({
  children,
  slug,
  pageId,
  title,
  description,
  onSaved,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabId>("blocks");

  // ✅ AUTO-SAVE — must run inside Puck context (Sidebar is in the fields override)
  useAutoSave({ slug, title, description, onSaved });

  return (
    <div className="flex flex-col h-full w-80 border-r bg-white overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              activeTab === id
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "blocks" && <div className="h-full">{children}</div>}
        {activeTab === "ai" && <AIEnhancedPanel slug={slug} />}
        {activeTab === "media" && <MediaPanel />}
        {activeTab === "history" && (
          <VersionControl pageId={pageId} slug={slug} />
        )}
      </div>
    </div>
  );
}

export default Sidebar;
