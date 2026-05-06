'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Puzzle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Plugin {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
}

export function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/plugins');
      if (!response.ok) throw new Error('Failed to load plugins');
      const data = await response.json();
      setPlugins(data.plugins || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plugins';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (!response.ok) throw new Error('Failed to toggle plugin');

      setPlugins(plugins.map(p =>
        p.id === pluginId ? { ...p, enabled: !enabled } : p
      ));

      toast.success(`Plugin ${!enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle plugin';
      toast.error(message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold">Plugins</h1>
        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          Coming Soon
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={loadPlugins}
            className="ml-auto text-sm font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      ) : plugins.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Puzzle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No plugins available yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            The plugin system is under development and will be available soon.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                <p className="text-sm text-gray-600">{plugin.description}</p>
                <p className="text-xs text-gray-500 mt-1">v{plugin.version}</p>
              </div>
              <button
                onClick={() => togglePlugin(plugin.id, plugin.enabled)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  plugin.enabled
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                }`}
              >
                {plugin.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PluginManager;
