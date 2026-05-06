import type { ThemeTokens } from '../types';
import type { ThemeDefinition } from '../types';
import { corporate } from './corporate';
import { modern } from './modern';
import { minimal } from './minimal';

export type { ThemeDefinition };
export const themes: ThemeDefinition[] = [corporate, modern, minimal];

export function getTheme(name: string): ThemeDefinition | undefined {
  return themes.find(theme => theme.name === name);
}

export function getDefaultTheme(): ThemeDefinition {
  return corporate; // Default to corporate theme
}

export function getAllThemeNames(): string[] {
  return themes.map(theme => theme.name);
}

// Helper to merge theme tokens with defaults
export function mergeThemeTokens(base: ThemeTokens, override?: Partial<ThemeTokens>): ThemeTokens {
  return {
    ...base,
    ...override,
  };
}
