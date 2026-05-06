import type { ThemeDefinition } from '../types';

export const corporate: ThemeDefinition = {
  name: 'corporate',
  label: 'Corporate Professional',
  tokens: {
    colorPrimary: '#1e40af',      // Blue
    colorSecondary: '#0d9488',    // Teal
    colorBg: '#ffffff',
    colorText: '#1e293b',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontHeading: 'Montserrat, sans-serif',
    borderRadius: '0.375rem',
    // Extended tokens:
    colorAccent: '#f59e0b',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorSurface: '#f8fafc',
    spacingUnit: '1rem',
    containerWidth: '1200px',
  },
};
