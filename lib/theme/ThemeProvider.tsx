/**
 * ThemeProvider — injects site theme tokens as CSS custom properties.
 * Server component: reads tokens once per request; no client overhead.
 * Supports theme switching via cookie or query parameter.
 */

import { cookies } from 'next/headers';
import { getThemeSettings } from "@/lib/db/settings";
import { tokensToCssVars } from "@/lib/theme/tokens";
import { getTheme, getDefaultTheme } from "@/lib/theme/themes";
import type { ThemeTokens } from "@/lib/theme/types";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export async function ThemeProvider({ children }: ThemeProviderProps) {
  // Check for theme in query params or cookies
  const cookieStore = await cookies();
  const themeName = cookieStore.get('theme')?.value;
  const selectedTheme = themeName ? getTheme(themeName) : null;

  let tokens: ThemeTokens;
  let currentThemeName: string;

  if (selectedTheme) {
    tokens = selectedTheme.tokens;
    currentThemeName = selectedTheme.name;
  } else {
    // Fall back to database settings
    const dbTokens = await getThemeSettings();
    tokens = dbTokens;
    currentThemeName = 'custom';
  }

  const cssVars = tokensToCssVars(tokens);

  return (
    <>
      {cssVars && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `:root { ${cssVars} --theme-name: "${currentThemeName}"; }`,
          }}
        />
      )}
      {children}
    </>
  );
}

export default ThemeProvider;
