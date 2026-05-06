/**
 * Extended Theme Token Definitions
 * Supports base and extended tokens for full theme customization.
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

export interface ThemeDefinition {
  name: string;
  label: string;
  tokens: ThemeTokens;
}
