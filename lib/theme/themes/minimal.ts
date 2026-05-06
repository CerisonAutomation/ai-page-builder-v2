import type { ThemeDefinition } from '../types';

export const minimal: ThemeDefinition = {
  name: 'minimal',
  label: 'Minimal Clean',
  tokens: {
    colorPrimary: '#000000',      // Black
    colorSecondary: '#6b7280',    // Gray
    colorBg: '#ffffff',
    colorText: '#111827',
    fontFamily: 'Georgia, serif',
    fontHeading: 'Playfair Display, serif',
    borderRadius: '0',           // Sharp corners
    // Extended tokens:
    colorAccent: '#9ca3af',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorSurface: '#f9fafb',
    colorBorder: '#e5e7eb',
    spacingUnit: '0.75rem',
    containerWidth: '900px',
  },
};
