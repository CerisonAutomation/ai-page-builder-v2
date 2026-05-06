'use client';

import React from 'react';

interface SidebarProps {
  children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-72 bg-slate-50 border-r border-slate-200 overflow-y-auto">
      {children}
    </aside>
  );
}
