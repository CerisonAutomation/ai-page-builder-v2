/**
 * Pages Manager Page
 * ✅ List, create, edit, delete pages
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import PageManager from "@/components/admin/PageManager";

export default async function PagesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Pages</h1>
        <p className="text-slate-600 mt-1">Manage all your pages</p>
      </div>
      <PageManager userId={user.id} />
    </div>
  );
}
