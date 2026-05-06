/**
 * Settings Page
 * ✅ Site settings, preferences, configuration
 */

import { createServerSupabaseClient } from "@/lib/db/supabase";
import SettingsPanel from "@/components/admin/SettingsPanel";
import ThemeSettings from "@/components/admin/ThemeSettings";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const t = await getTranslations('admin.settings');

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
        <p className="text-slate-600 mt-1">{t('description')}</p>
      </div>

      <div className="space-y-8">
        <section>
          <SettingsPanel />
        </section>

        <section className="border-t pt-8">
          <ThemeSettings />
        </section>
      </div>
    </div>
  );
}
