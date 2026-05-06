/**
 * Theme database helpers
 * Reads/writes theme tokens from the site_settings table.
 */

import { createAdminClient } from "@/lib/db/supabase";
import { defaultTheme } from "@/lib/theme/defaultTheme";
import type { ThemeTokens } from "@/lib/theme/tokens";

/**
 * Fetch the active theme tokens, merged with defaults.
 * Falls back to defaultTheme if the table is unavailable.
 */
export async function getThemeSettings(): Promise<ThemeTokens> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("theme_primary_color, theme_secondary_color, theme_tokens")
      .limit(1)
      .single();

    if (error || !data) return defaultTheme;

    return {
      ...defaultTheme,
      // Legacy single-column overrides
      ...(data.theme_primary_color
        ? { colorPrimary: data.theme_primary_color }
        : {}),
      ...(data.theme_secondary_color
        ? { colorSecondary: data.theme_secondary_color }
        : {}),
      // Structured token blob takes highest precedence
      ...(data.theme_tokens ?? {}),
    };
  } catch {
    return defaultTheme;
  }
}

interface SiteSettingsUpdate {
  theme_primary_color?: string;
  theme_secondary_color?: string;
  theme_tokens?: Partial<ThemeTokens>;
}

/**
 * Persist partial theme token updates to the site_settings table.
 */
export async function updateThemeSettings(
  tokens: Partial<ThemeTokens>
): Promise<void> {
  const supabase = createAdminClient();

  const update: SiteSettingsUpdate = {
    theme_tokens: tokens,
  };
  if (tokens.colorPrimary) update.theme_primary_color = tokens.colorPrimary;
  if (tokens.colorSecondary)
    update.theme_secondary_color = tokens.colorSecondary;

  const { error } = await supabase
    .from("site_settings")
    .update(update)
    .limit(1);

  if (error) {
    throw new Error(`Failed to update theme: ${error.message}`);
  }
}
