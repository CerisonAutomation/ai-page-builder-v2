import type { ThemeDefinition } from '../types';

export const modern: ThemeDefinition = {
  name: 'modern',
  label: 'Modern Creative',
  tokens: {
    colorPrimary: '#8b5cf6',      // Purple
    colorSecondary: '#ec4899',    // Pink
    colorBg: '#0f172a',          // Dark bg
    colorText: '#f1f5f9',        // Light text
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontHeading: 'Space Grotesk, sans-serif',
    borderRadius: '1rem',
    // Extended tokens:
    colorAccent: '#06b6d4',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorSurface: '#1e293b',
    spacingUnit: '1.25rem',
    containerWidth: '1400px',
  },
};
