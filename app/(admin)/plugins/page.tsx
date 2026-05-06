/**
 * Plugins Manager Page
 * ✅ Install, enable, disable plugins
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import PluginManager from "@/components/admin/PluginManager";

export default async function PluginsPage() {
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
        <h1 className="text-3xl font-bold text-slate-900">Plugins</h1>
        <p className="text-slate-600 mt-1">Extend your page builder with plugins</p>
      </div>
      <PluginManager />
    </div>
  );
}
