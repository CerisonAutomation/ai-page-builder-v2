/**
 * ThemeProvider — injects site theme tokens as CSS custom properties.
 * Server component: reads tokens once per request; no client overhead.
 */

import { getThemeSettings } from "@/lib/db/settings";
import { tokensToCssVars } from "@/lib/theme/tokens";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export async function ThemeProvider({ children }: ThemeProviderProps) {
  const tokens = await getThemeSettings();
  const cssVars = tokensToCssVars(tokens);

  return (
    <>
      {cssVars && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `:root { ${cssVars} }`,
          }}
        />
      )}
      {children}
    </>
  );
}

export default ThemeProvider;
