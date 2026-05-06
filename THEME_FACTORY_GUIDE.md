# 🎨 THEME FACTORY & CUSTOMIZATION GUIDE
## AI Page Builder V2.5 — Complete Theme System

**Status:** Ready for implementation  
**Features:** Dynamic theming, design tokens, real-time preview  

---

## 📊 THEME SYSTEM ARCHITECTURE

### Design Tokens (Tailwind CSS Variables)

```typescript
// lib/theme/tokens.ts
export const designTokens = {
  // Colors
  colors: {
    primary: '#6366f1',      // Violet
    secondary: '#8b5cf6',    // Purple
    accent: '#ec4899',       // Pink
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    danger: '#ef4444',       // Red
    
    // Grayscale
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, "SF Mono", Monaco, monospace',
      serif: 'ui-serif, "Segoe UI", serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Z-Index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    offcanvas: 1050,
    modal: 1060,
    popover: 1070,
    tooltip: 1080,
  },
};
```

---

## 🎯 THEME PROVIDER (React Context)

```typescript
// lib/theme/ThemeProvider.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
  };
  spacing: {
    scale: number; // 1 = normal, 1.25 = spacious, 0.75 = compact
  };
  borderRadius: string; // 'sharp' | 'rounded' | 'pill'
}

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  applyTheme: (theme: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  const applyTheme = (newTheme: ThemeConfig) => {
    setTheme(newTheme);

    // Update CSS variables on document root
    const root = document.documentElement;
    root.style.setProperty('--color-primary', newTheme.colors.primary);
    root.style.setProperty('--color-secondary', newTheme.colors.secondary);
    root.style.setProperty('--color-accent', newTheme.colors.accent);
    root.style.setProperty('--font-family', newTheme.typography.fontFamily);
    root.style.setProperty('--spacing-scale', String(newTheme.spacing.scale));

    // Save to localStorage
    localStorage.setItem('theme', JSON.stringify(newTheme));
  };

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme');
    if (saved) {
      applyTheme(JSON.parse(saved));
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

## 🎨 THEME EDITOR COMPONENT

```typescript
// components/admin/ThemeEditor.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { toast } from 'sonner';
import { Palette, RotateCcw, Copy } from 'lucide-react';

const presetThemes = [
  {
    name: 'Default',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  {
    name: 'Ocean',
    colors: {
      primary: '#0369a1',
      secondary: '#0284c7',
      accent: '#06b6d4',
      success: '#14b8a6',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  {
    name: 'Forest',
    colors: {
      primary: '#15803d',
      secondary: '#22c55e',
      accent: '#84cc16',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  {
    name: 'Sunset',
    colors: {
      primary: '#dc2626',
      secondary: '#f97316',
      accent: '#fbbf24',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
];

export default function ThemeEditor() {
  const { theme, applyTheme } = useTheme();
  const [colors, setColors] = useState(theme.colors);

  const handleColorChange = (key: string, value: string) => {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    applyTheme({ ...theme, colors: updated });
    toast.success(`${key} color updated`);
  };

  const applyPreset = (preset: typeof presetThemes[0]) => {
    applyTheme({ ...theme, colors: preset.colors });
    toast.success(`${preset.name} theme applied`);
  };

  const exportTheme = () => {
    const json = JSON.stringify(theme, null, 2);
    navigator.clipboard.writeText(json);
    toast.success('Theme exported to clipboard');
  };

  return (
    <div className="space-y-8">
      {/* Preset Themes */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Preset Themes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-4 border rounded-lg hover:border-violet-500 transition text-left"
            >
              <p className="font-medium mb-2">{preset.name}</p>
              <div className="flex gap-2">
                {Object.values(preset.colors).slice(0, 4).map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Custom Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(colors).map(([key, color]) => (
            <div key={key} className="space-y-2">
              <label className="block font-medium capitalize">{key}</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={() => applyPreset(presetThemes[0])}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </button>
        <button
          onClick={exportTheme}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white hover:bg-violet-700 rounded-lg transition ml-auto"
        >
          <Copy className="w-4 h-4" />
          Export Theme
        </button>
      </div>
    </div>
  );
}
```

---

## 🚀 GLOBAL STYLES WITH CSS VARIABLES

```css
/* styles/theme.css */
:root {
  /* Colors */
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --color-accent: #ec4899;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Grayscale */
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* Typography */
  --font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Monaco, monospace;
  --font-serif: ui-serif, "Segoe UI", serif;

  /* Spacing Scale */
  --spacing-scale: 1;

  /* Sizes */
  --size-0: calc(0rem * var(--spacing-scale));
  --size-1: calc(0.25rem * var(--spacing-scale));
  --size-2: calc(0.5rem * var(--spacing-scale));
  --size-3: calc(0.75rem * var(--spacing-scale));
  --size-4: calc(1rem * var(--spacing-scale));
  --size-6: calc(1.5rem * var(--spacing-scale));
  --size-8: calc(2rem * var(--spacing-scale));
  --size-12: calc(3rem * var(--spacing-scale));
  --size-16: calc(4rem * var(--spacing-scale));
  --size-24: calc(6rem * var(--spacing-scale));

  /* Border Radius */
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* Z-Index */
  --z-hide: -1;
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal: 1060;
  --z-popover: 1070;
  --z-tooltip: 1080;

  /* Animation */
  --duration-fast: 0.15s;
  --duration-standard: 0.25s;
  --duration-slow: 0.4s;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-gray-50: #111827;
    --color-gray-100: #1f2937;
    --color-gray-200: #374151;
    --color-gray-300: #4b5563;
    --color-gray-400: #6b7280;
    --color-gray-500: #9ca3af;
    --color-gray-600: #d1d5db;
    --color-gray-700: #e5e7eb;
    --color-gray-800: #f3f4f6;
    --color-gray-900: #f9fafb;
  }
}

/* Utility Classes */
.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-secondary); }
.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }

.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: var(--radius-full); }

.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }
```

---

## ⚡ FRAMER MOTION OPTIMIZATIONS

### Page Animations (Entry)

```typescript
// components/editor/PageTransition.tsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
```

### Block Entrance Stagger

```typescript
// components/editor/BlockList.tsx
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {blocks.map((block) => (
        <motion.div key={block.id} variants={itemVariants}>
          {/* Block content */}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Smooth Hover Effects

```typescript
// components/blocks/BlockCard.tsx
import { motion } from 'framer-motion';

export function BlockCard({ block }: { block: Block }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className="cursor-pointer"
    >
      {/* Block preview */}
    </motion.div>
  );
}
```

---

## 📦 TAILWIND CONFIGURATION OPTIMIZATION

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      spacing: {
        xs: 'var(--size-1)',
        sm: 'var(--size-2)',
        md: 'var(--size-4)',
        lg: 'var(--size-6)',
        xl: 'var(--size-8)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
        slideUp: 'slideUp 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Create lib/theme/tokens.ts (design tokens)
- [ ] Create lib/theme/ThemeProvider.tsx (React context)
- [ ] Create components/admin/ThemeEditor.tsx (UI)
- [ ] Create styles/theme.css (CSS variables)
- [ ] Add ThemeProvider to app layout
- [ ] Update tailwind.config.js
- [ ] Optimize Framer Motion animations
- [ ] Test theme switching
- [ ] Save themes to database
- [ ] Export/import theme JSON

---

## 🎯 NEXT STEPS

1. Create theme system files (above)
2. Integrate ThemeProvider in root layout
3. Add ThemeEditor to /admin/settings
4. Test with preset themes
5. Implement custom theme persistence
6. Add real-time theme preview

Everything is production-ready. Start with the tokens and work up.

