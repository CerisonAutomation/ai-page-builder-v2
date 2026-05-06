/**
 * Admin Dashboard Page
 * ✅ Overview of pages, media, recent activity
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import { listPages } from "@/lib/db/pages";
import { listMedia } from "@/lib/db/media";
import { FileText, Image, Zap, Calendar } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const pages = await listPages(user.id);
  const media = await listMedia(user.id);

  const stats = [
    {
      label: "Total Pages",
      value: pages.length,
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Media Files",
      value: media.length,
      icon: Image,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Active Editors",
      value: "0",
      icon: Zap,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here's your page builder overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Pages</h2>
            <Link
              href="/admin/pages"
              className="text-sm text-violet-600 hover:text-violet-700"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {pages.slice(0, 5).map((page) => (
              <Link
                key={page.id}
                href={`/edit/${page.slug}`}
                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition border border-slate-100"
              >
                <div>
                  <p className="font-medium text-slate-900">{page.title}</p>
                  <p className="text-xs text-slate-500">/{page.slug}</p>
                </div>
                <Calendar className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
            {pages.length === 0 && (
              <p className="text-sm text-slate-600 py-4 text-center">No pages yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>

          <div className="space-y-2">
            <Link
              href="/admin/pages"
              className="block w-full px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium text-center"
            >
              Create New Page
            </Link>

            <Link
              href="/admin/media"
              className="block w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition font-medium text-center"
            >
              Upload Media
            </Link>

            <Link
              href="/admin/plugins"
              className="block w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition font-medium text-center"
            >
              Browse Plugins
            </Link>

            <Link
              href="/admin/settings"
              className="block w-full px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition font-medium text-center"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
