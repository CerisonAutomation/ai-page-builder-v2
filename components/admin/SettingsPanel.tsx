'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Settings {
  apiKey: string;
  theme: 'light' | 'dark' | 'system';
  siteName: string;
  siteDescription: string;
}

const THEMES = [
  { value: 'light', label: 'Light', preview: 'bg-white border-gray-200' },
  { value: 'dark', label: 'Dark', preview: 'bg-gray-900 border-gray-700' },
  { value: 'system', label: 'System', preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400' },
] as const;

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    theme: 'system',
    siteName: '',
    siteDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin.settings');
  const tCommon = useTranslations('common');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error(tCommon('error'));
      const data = await res.json();
      setSettings({
        apiKey: data.apiKey || '',
        theme: data.theme || 'system',
        siteName: data.siteName || '',
        siteDescription: data.siteDescription || '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : tCommon('error');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error(tCommon('error'));

      toast.success(t('saved'));

      // Apply theme immediately
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (settings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : tCommon('error');
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeSelect = (theme: Settings['theme']) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Site Name */}
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
            {tCommon('siteName')}
          </label>
          <input
            id="siteName"
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            placeholder="My Awesome Site"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Site Description */}
        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-2">
            {tCommon('description')}
          </label>
          <textarea
            id="siteDescription"
            value={settings.siteDescription}
            onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
            placeholder="A brief description of your site"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
          />
        </div>

        {/* API Key */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="Enter your API key"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('apiKeyDescription')}
          </p>
        </div>

        {/* Theme Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('theme')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme.value}
                type="button"
                onClick={() => handleThemeSelect(theme.value)}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  settings.theme === theme.value
                    ? 'border-violet-600 ring-2 ring-violet-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-full h-8 rounded mb-2 border ${theme.preview}`} />
                <p className="text-sm font-medium text-gray-900">{theme.label}</p>
                {settings.theme === theme.value && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-violet-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {tCommon('saving')}
              </>
            ) : (
              <>{t('save')}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPanel;
