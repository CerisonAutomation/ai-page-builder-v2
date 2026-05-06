'use client';

/**
 * Plugin Manager UI - Manage installed plugins and discover new ones
 */

import { useState, useEffect } from 'react';
import { PluginInstaller } from '@/lib/plugins/installer/PluginInstaller';
import { PluginRegistry } from '@/lib/plugins/registry/PluginRegistry';
import { PluginCatalog } from '@/lib/plugins/catalog/PluginCatalog';
import { PluginLoadSource, InstalledPlugin, PluginPackageInfo } from '@/lib/plugins/types';

interface PluginManagerProps {
  registry: PluginRegistry;
  onPluginsChange?: () => void;
}

type Tab = 'installed' | 'discover' | 'settings';

export function PluginManager({ registry, onPluginsChange }: PluginManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('installed');
  const [installedPlugins, setInstalledPlugins] = useState<InstalledPlugin[]>([]);
  const [availablePlugins, setAvailablePlugins] = useState<PluginPackageInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginPackageInfo | null>(null);
  const [installProgress, setInstallProgress] = useState<string>('');

  const installer = new PluginInstaller(registry);
  const catalog = new PluginCatalog();

  useEffect(() => {
    loadInstalledPlugins();
    loadAvailablePlugins();
  }, []);

  const loadInstalledPlugins = async () => {
    try {
      const plugins = installer.getInstalledPlugins();
      setInstalledPlugins(plugins);
    } catch (err) {
      setError(`Failed to load installed plugins: ${err}`);
    }
  };

  const loadAvailablePlugins = async () => {
    try {
      const plugins = catalog.getCuratedPlugins();
      setAvailablePlugins(plugins);
    } catch (err) {
      setError(`Failed to load available plugins: ${err}`);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length === 0) {
      loadAvailablePlugins();
      return;
    }

    setIsLoading(true);
    try {
      const results = await catalog.search(query);
      setAvailablePlugins(results);
    } catch (err) {
      setError(`Search failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async (plugin: PluginPackageInfo) => {
    setIsLoading(true);
    setError(null);
    try {
      setInstallProgress('Installing...');
      await installer.install(plugin.source, plugin.packageUrl || plugin.id, (progress) => {
        setInstallProgress(`${progress.step} (${progress.progress}/${progress.total})`);
      });

      await loadInstalledPlugins();
      setSelectedPlugin(null);
      setInstallProgress('');
      onPluginsChange?.();
    } catch (err) {
      setError(`Installation failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    if (!confirm(`Uninstall plugin?`)) return;

    setIsLoading(true);
    try {
      await installer.uninstall(pluginId);
      await loadInstalledPlugins();
      onPluginsChange?.();
    } catch (err) {
      setError(`Uninstall failed: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (pluginId: string, enabled: boolean) => {
    try {
      await installer.togglePlugin(pluginId, enabled);
      await loadInstalledPlugins();
      onPluginsChange?.();
    } catch (err) {
      setError(`Failed to toggle plugin: ${err}`);
    }
  };

  return (
    <div className="plugin-manager">
      <div className="pm-header">
        <h1>Plugin Manager</h1>
        <p>Extend your page builder with custom blocks, fields, and integrations</p>
      </div>

      {error && <div className="pm-error">{error}</div>}

      <div className="pm-tabs">
        <button
          className={`pm-tab ${activeTab === 'installed' ? 'active' : ''}`}
          onClick={() => setActiveTab('installed')}
        >
          Installed ({installedPlugins.length})
        </button>
        <button
          className={`pm-tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover
        </button>
      </div>

      {activeTab === 'installed' && <InstalledPluginsTab plugins={installedPlugins} onUninstall={handleUninstall} onToggle={handleToggle} isLoading={isLoading} />}

      {activeTab === 'discover' && (
        <DiscoverPluginsTab
          plugins={availablePlugins}
          selectedPlugin={selectedPlugin}
          onSelect={setSelectedPlugin}
          onInstall={handleInstall}
          onSearch={handleSearch}
          isLoading={isLoading}
          installProgress={installProgress}
        />
      )}

      <style jsx>{`
        .plugin-manager {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .pm-header {
          margin-bottom: 32px;
        }

        .pm-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
        }

        .pm-header p {
          margin: 0;
          color: #666;
        }

        .pm-error {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 16px;
          color: #c33;
        }

        .pm-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #eee;
          margin-bottom: 24px;
        }

        .pm-tab {
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .pm-tab:hover {
          color: #333;
        }

        .pm-tab.active {
          color: #000;
          border-bottom-color: #000;
        }
      `}</style>
    </div>
  );
}

function InstalledPluginsTab({
  plugins,
  onUninstall,
  onToggle,
  isLoading,
}: {
  plugins: InstalledPlugin[];
  onUninstall: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  isLoading: boolean;
}) {
  if (plugins.length === 0) {
    return (
      <div className="empty-state">
        <p>No plugins installed yet. Discover plugins to get started.</p>
      </div>
    );
  }

  return (
    <div className="plugins-grid">
      {plugins.map((plugin) => (
        <div key={plugin.id} className="plugin-card installed">
          <div className="plugin-header">
            <div>
              <h3>{plugin.name}</h3>
              <p className="version">v{plugin.version}</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={plugin.enabled}
                onChange={(e) => onToggle(plugin.id, e.target.checked)}
                disabled={isLoading}
              />
              <span>{plugin.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <p className="plugin-source">
            {plugin.source === 'npm' && '📦 npm'}
            {plugin.source === 'github' && '🐙 GitHub'}
            {plugin.source === 'local' && '📁 Local'}
          </p>

          <div className="plugin-actions">
            <button onClick={() => onUninstall(plugin.id)} disabled={isLoading}>
              Uninstall
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: #666;
        }

        .plugins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .plugin-card {
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 16px;
          background: #fff;
        }

        .plugin-card.installed {
          border-color: #ddd;
        }

        .plugin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .plugin-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .version {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #999;
        }

        .plugin-source {
          margin: 8px 0;
          font-size: 12px;
          color: #666;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .toggle input {
          cursor: pointer;
        }

        .plugin-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .plugin-actions button {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f9f9f9;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .plugin-actions button:hover:not(:disabled) {
          background: #f0f0f0;
          border-color: #bbb;
        }

        .plugin-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function DiscoverPluginsTab({
  plugins,
  selectedPlugin,
  onSelect,
  onInstall,
  onSearch,
  isLoading,
  installProgress,
}: {
  plugins: PluginPackageInfo[];
  selectedPlugin: PluginPackageInfo | null;
  onSelect: (plugin: PluginPackageInfo | null) => void;
  onInstall: (plugin: PluginPackageInfo) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
  installProgress: string;
}) {
  return (
    <div className="discover-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search plugins..."
          onChange={(e) => onSearch(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="discover-layout">
        <div className="plugins-list">
          {plugins.length === 0 ? (
            <div className="no-results">No plugins found</div>
          ) : (
            plugins.map((plugin) => (
              <div
                key={plugin.id}
                className={`plugin-item ${selectedPlugin?.id === plugin.id ? 'selected' : ''}`}
                onClick={() => onSelect(plugin)}
              >
                <h4>{plugin.name}</h4>
                <p className="description">{plugin.description}</p>
                <div className="meta">
                  <span className="version">v{plugin.version}</span>
                  {plugin.rating && <span className="rating">⭐ {plugin.rating}</span>}
                  {plugin.downloads && <span className="downloads">{plugin.downloads} installs</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedPlugin && (
          <div className="plugin-details">
            <h3>{selectedPlugin.name}</h3>
            <p className="full-description">{selectedPlugin.description}</p>

            <div className="details-info">
              <div>
                <label>Version</label>
                <p>{selectedPlugin.version}</p>
              </div>
              <div>
                <label>Author</label>
                <p>{selectedPlugin.author}</p>
              </div>
              {selectedPlugin.rating && (
                <div>
                  <label>Rating</label>
                  <p>⭐ {selectedPlugin.rating} / 5</p>
                </div>
              )}
              {selectedPlugin.downloads && (
                <div>
                  <label>Downloads</label>
                  <p>{selectedPlugin.downloads}</p>
                </div>
              )}
            </div>

            {selectedPlugin.tags && selectedPlugin.tags.length > 0 && (
              <div className="tags">
                {selectedPlugin.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button
              className="install-btn"
              onClick={() => onInstall(selectedPlugin)}
              disabled={isLoading}
            >
              {installProgress || (isLoading ? 'Installing...' : 'Install Plugin')}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .discover-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-box {
          display: flex;
        }

        .search-box input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .discover-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 16px;
        }

        .plugins-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 600px;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 4px;
          background: #fafafa;
        }

        .plugin-item {
          padding: 12px;
          border-bottom: 1px solid #e8e8e8;
          cursor: pointer;
          transition: background 0.2s;
        }

        .plugin-item:hover {
          background: #f0f0f0;
        }

        .plugin-item.selected {
          background: #e8f4ff;
          border-left: 3px solid #0066cc;
          padding-left: 9px;
        }

        .plugin-item h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .description {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #666;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: #999;
        }

        .plugin-details {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 16px;
          background: #fff;
          max-height: 600px;
          overflow-y: auto;
        }

        .plugin-details h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
        }

        .full-description {
          margin: 0 0 16px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .details-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }

        .details-info label {
          font-size: 11px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
        }

        .details-info p {
          margin: 4px 0 0 0;
          font-size: 14px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .tag {
          display: inline-block;
          padding: 4px 8px;
          background: #f0f0f0;
          border-radius: 3px;
          font-size: 11px;
          color: #666;
        }

        .install-btn {
          width: 100%;
          padding: 10px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .install-btn:hover:not(:disabled) {
          background: #0052a3;
        }

        .install-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .no-results {
          padding: 24px;
          text-align: center;
          color: #999;
        }
      `}</style>
    </div>
  );
}
