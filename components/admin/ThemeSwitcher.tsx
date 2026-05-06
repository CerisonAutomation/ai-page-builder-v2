'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Palette } from 'lucide-react';
import { themes, getTheme, type ThemeDefinition } from '@/lib/theme/themes';

interface ThemeSwitcherProps {
  currentTheme?: string;
  onThemeChange?: (themeName: string) => void;
}

export function ThemeSwitcher({ currentTheme = 'corporate', onThemeChange }: ThemeSwitcherProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(currentTheme);
  const [previewTheme, setPreviewTheme] = useState<ThemeDefinition | null>(null);

  useEffect(() => {
    // Load saved theme from cookie on mount
    const savedTheme = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme='))
      ?.split('=')[1];

    if (savedTheme && themes.find(t => t.name === savedTheme)) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  const handleThemeSelect = useCallback((themeName: string) => {
    setSelectedTheme(themeName);
    setPreviewTheme(null);

    // Save to cookie
    document.cookie = `theme=${themeName}; path=/; max-age=31536000; SameSite=Lax`;

    // Apply theme immediately by reloading (server will pick up cookie)
    if (onThemeChange) {
      onThemeChange(themeName);
    } else {
      // Reload to apply theme server-side
      window.location.reload();
    }
  }, [onThemeChange]);

  const handlePreview = useCallback((theme: ThemeDefinition) => {
    setPreviewTheme(theme);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewTheme(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Theme Selector</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Choose a theme to customize the look and feel of your pages. The theme will be applied instantly.
      </p>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.name}
            className={`relative border-2 rounded-lg overflow-hidden transition-all cursor-pointer ${
              selectedTheme === theme.name
                ? 'border-blue-600 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleThemeSelect(theme.name)}
            onMouseEnter={() => handlePreview(theme)}
            onMouseLeave={handleClosePreview}
          >
            {/* Theme Preview */}
            <div
              className="h-32 p-4 flex flex-col justify-end"
              style={{
                backgroundColor: theme.tokens.colorBg,
                color: theme.tokens.colorText,
                fontFamily: theme.tokens.fontFamily,
              }}
            >
              <div
                className="w-16 h-4 rounded mb-2"
                style={{ backgroundColor: theme.tokens.colorPrimary }}
              />
              <div
                className="w-24 h-3 rounded"
                style={{ backgroundColor: theme.tokens.colorSecondary }}
              />
              <p className="text-xs mt-2 opacity-70" style={{ fontFamily: theme.tokens.fontHeading }}>
                {theme.label}
              </p>
            </div>

            {/* Theme Info */}
            <div className="p-3 bg-white border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{theme.label}</p>
                  <p className="text-xs text-gray-500">{theme.name}</p>
                </div>
                {selectedTheme === theme.name && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {/* Color Palette */}
              <div className="flex gap-1 mt-2">
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: theme.tokens.colorPrimary }}
                  title="Primary"
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: theme.tokens.colorSecondary }}
                  title="Secondary"
                />
                {theme.tokens.colorAccent && (
                  <div
                    className="w-6 h-6 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.tokens.colorAccent }}
                    title="Accent"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Theme Preview Modal */}
      {previewTheme && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClosePreview}
        >
          <div
            className="max-w-2xl w-full m-4 rounded-xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: previewTheme.tokens.colorBg,
              color: previewTheme.tokens.colorText,
              fontFamily: previewTheme.tokens.fontFamily,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ fontFamily: previewTheme.tokens.fontHeading }}
              >
                {previewTheme.label} Preview
              </h2>

              <div className="space-y-4">
                <p style={{ color: previewTheme.tokens.colorText }}>
                  This is how your content will look with the {previewTheme.label} theme.
                </p>

                <div
                  className="p-4 rounded"
                  style={{
                    backgroundColor: previewTheme.tokens.colorSurface || previewTheme.tokens.colorBg,
                    border: `1px solid ${previewTheme.tokens.colorSecondary}`,
                    borderRadius: previewTheme.tokens.borderRadius,
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ fontFamily: previewTheme.tokens.fontHeading }}
                  >
                    Sample Card
                  </h3>
                  <p className="text-sm opacity-80">
                    Cards and components will use the theme's border radius and colors.
                  </p>
                  <button
                    className="mt-3 px-4 py-2 text-white rounded"
                    style={{
                      backgroundColor: previewTheme.tokens.colorPrimary,
                      borderRadius: previewTheme.tokens.borderRadius,
                    }}
                  >
                    Primary Button
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      backgroundColor: previewTheme.tokens.colorPrimary,
                      color: '#fff',
                      borderRadius: previewTheme.tokens.borderRadius,
                    }}
                  >
                    Primary
                  </span>
                  <span
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      backgroundColor: previewTheme.tokens.colorSecondary,
                      color: '#fff',
                      borderRadius: previewTheme.tokens.borderRadius,
                    }}
                  >
                    Secondary
                  </span>
                  {previewTheme.tokens.colorAccent && (
                    <span
                      className="px-3 py-1 text-xs rounded"
                      style={{
                        backgroundColor: previewTheme.tokens.colorAccent,
                        color: '#fff',
                        borderRadius: previewTheme.tokens.borderRadius,
                      }}
                    >
                      Accent
                    </span>
                  )}
                </div>
              </div>

              <button
                className="mt-6 px-4 py-2 rounded hover:opacity-90"
                style={{
                  backgroundColor: previewTheme.tokens.colorPrimary,
                  color: '#fff',
                  borderRadius: previewTheme.tokens.borderRadius,
                }}
                onClick={handleClosePreview}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Theme Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <p className="text-sm text-gray-600">
          <strong>Current theme:</strong> {themes.find(t => t.name === selectedTheme)?.label || selectedTheme}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Theme will be applied to all pages. Changes take effect immediately.
        </p>
      </div>
    </div>
  );
}

export default ThemeSwitcher;
