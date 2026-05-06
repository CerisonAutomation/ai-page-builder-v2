/**
 * Theme Token Definitions
 * Maps design tokens to CSS custom property names and runtime values.
 */

export interface ThemeTokens {
  // Base tokens
  colorPrimary: string;
  colorSecondary: string;
  colorBg: string;
  colorText: string;
  fontFamily: string;
  borderRadius: string;
  // Extended tokens
  colorAccent?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorError?: string;
  colorSurface?: string;
  fontHeading?: string;
  spacingUnit?: string;
  containerWidth?: string;
}

/**
 * Converts a ThemeTokens object into CSS custom properties for injection.
 * Values are sanitized to contain only safe CSS token characters.
 * Example output: "--color-primary: #6366f1; --color-secondary: #ec4899;"
 */
function sanitizeCssValue(value: string): string {
  // Validate known token shapes before accepting.
  // Color values: accept #RGB, #RRGGBB hex and common named colors.
  const hexColor = /^#[0-9a-fA-F]{3,6}$/;
  // Font families, border-radius, spacing: allow alphanumeric, spaces, hyphens, commas, dots, parentheses, /, %, rem, px, em.
  const safeCss = /^[a-zA-Z0-9 ,.\-()/%]+$/;

  const trimmed = value.trim();
  if (hexColor.test(trimmed) || safeCss.test(trimmed)) {
    return trimmed;
  }
  // Return empty string for anything that doesn't match safe patterns.
  return "";
}

// Map token keys to CSS custom property names
const tokenToCssMap: Record<string, string> = {
  colorPrimary: "--color-primary",
  colorSecondary: "--color-secondary",
  colorBg: "--color-bg",
  colorText: "--color-text",
  fontFamily: "--font-family",
  borderRadius: "--border-radius",
  colorAccent: "--color-accent",
  colorSuccess: "--color-success",
  colorWarning: "--color-warning",
  colorError: "--color-error",
  colorSurface: "--color-surface",
  fontHeading: "--font-heading",
  spacingUnit: "--spacing-unit",
  containerWidth: "--container-width",
};

export function tokensToCssVars(tokens: Partial<ThemeTokens>): string {
  return Object.entries(tokens)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => {
      const prop = tokenToCssMap[k];
      if (!prop) return "";
      const safe = sanitizeCssValue(String(v));
      return `${prop}: ${safe};`;
    })
    .filter(Boolean)
    .join(" ");
}
