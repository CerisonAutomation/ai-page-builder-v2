/**
 * Settings Page
 * ✅ Site settings, preferences, configuration
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import SettingsPanel from "@/components/admin/SettingsPanel";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Configure your page builder preferences</p>
      </div>
      <SettingsPanel />
    </div>
  );
}
