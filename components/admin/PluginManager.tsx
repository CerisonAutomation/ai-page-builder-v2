'use client';

import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      // TODO: Fetch plugins from API
      setPlugins([]);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      // TODO: Call API to toggle plugin
      setPlugins(plugins.map(p => 
        p.id === pluginId ? { ...p, enabled: !enabled } : p
      ));
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Plugins</h1>
      
      {isLoading ? (
        <p>Loading plugins...</p>
      ) : plugins.length === 0 ? (
        <p className="text-gray-600">No plugins available</p>
      ) : (
        <div className="space-y-4">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{plugin.name}</h3>
                <p className="text-sm text-gray-600">{plugin.description}</p>
                <p className="text-xs text-gray-500">v{plugin.version}</p>
              </div>
              <button
                onClick={() => togglePlugin(plugin.id, plugin.enabled)}
                className={`px-4 py-2 rounded ${
                  plugin.enabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
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
