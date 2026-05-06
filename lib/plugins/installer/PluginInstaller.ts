/**
 * Plugin Installer - Installs and manages plugin installations
 */

import { Plugin, PluginLoadSource, InstalledPlugin } from '../types';
import { PluginLoader } from '../loaders/PluginLoader';
import { PluginRegistry } from '../registry/PluginRegistry';
import { PluginStorage } from '../registry/PluginStorage';

interface InstallationProgress {
  step: string;
  progress: number;
  total: number;
}

type ProgressCallback = (progress: InstallationProgress) => void;

export class PluginInstaller {
  private loader: PluginLoader;
  private registry: PluginRegistry;
  private storage: PluginStorage;
  private installedPlugins: Map<string, InstalledPlugin> = new Map();

  constructor(registry: PluginRegistry) {
    this.loader = new PluginLoader();
    this.registry = registry;
    this.storage = registry.getStorage();
    this.loadInstalledPlugins();
  }

  /**
   * Install a plugin
   */
  async install(
    source: PluginLoadSource,
    location: string,
    onProgress?: ProgressCallback
  ): Promise<InstalledPlugin> {
    this.reportProgress(onProgress, 'Fetching plugin', 1, 5);

    try {
      // Load plugin
      const plugin = await this.loader.loadPlugin(source, location);

      this.reportProgress(onProgress, 'Validating plugin', 2, 5);
      this.validatePlugin(plugin);

      // Check if already installed
      if (this.installedPlugins.has(plugin.manifest.id)) {
        const existing = this.installedPlugins.get(plugin.manifest.id)!;
        if (
          existing.version === plugin.manifest.version &&
          existing.source === source
        ) {
          throw new Error(
            `Plugin "${plugin.manifest.name}" v${plugin.manifest.version} is already installed`
          );
        }
      }

      this.reportProgress(onProgress, 'Registering plugin', 3, 5);

      // Register with registry
      await this.registry.registerPlugin(plugin);

      this.reportProgress(onProgress, 'Saving installation', 4, 5);

      // Create installation record
      const installed: InstalledPlugin = {
        id: plugin.manifest.id,
        name: plugin.manifest.name,
        version: plugin.manifest.version,
        enabled: true,
        source,
        location,
        installedAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        manifest: plugin.manifest,
      };

      // Persist installation
      this.installedPlugins.set(plugin.manifest.id, installed);
      await this.persistInstalledPlugins();

      this.reportProgress(onProgress, 'Installation complete', 5, 5);

      return installed;
    } catch (error) {
      throw new Error(`Failed to install plugin: ${error}`);
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(pluginId: string): Promise<void> {
    const installed = this.installedPlugins.get(pluginId);
    if (!installed) {
      throw new Error(`Plugin "${pluginId}" is not installed`);
    }

    try {
      // Unregister from registry
      await this.registry.unregisterPlugin(pluginId);

      // Remove installation record
      this.installedPlugins.delete(pluginId);
      await this.persistInstalledPlugins();

      this.registry.getLogger().info(`Plugin uninstalled: ${pluginId}`);
    } catch (error) {
      throw new Error(`Failed to uninstall plugin: ${error}`);
    }
  }

  /**
   * Update a plugin
   */
  async update(
    pluginId: string,
    newLocation: string,
    onProgress?: ProgressCallback
  ): Promise<InstalledPlugin> {
    const installed = this.installedPlugins.get(pluginId);
    if (!installed) {
      throw new Error(`Plugin "${pluginId}" is not installed`);
    }

    try {
      // Uninstall current version
      await this.uninstall(pluginId);

      // Install new version
      return this.install(installed.source, newLocation, onProgress);
    } catch (error) {
      throw new Error(`Failed to update plugin: ${error}`);
    }
  }

  /**
   * Get all installed plugins
   */
  getInstalledPlugins(): InstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  /**
   * Get an installed plugin
   */
  getInstalledPlugin(pluginId: string): InstalledPlugin | undefined {
    return this.installedPlugins.get(pluginId);
  }

  /**
   * Check if plugin is installed
   */
  isInstalled(pluginId: string): boolean {
    return this.installedPlugins.has(pluginId);
  }

  /**
   * Enable/disable plugin
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<void> {
    const installed = this.installedPlugins.get(pluginId);
    if (!installed) {
      throw new Error(`Plugin "${pluginId}" is not installed`);
    }

    try {
      installed.enabled = enabled;
      installed.updatedAt = new Date();
      await this.registry.togglePlugin(pluginId, enabled);
      await this.persistInstalledPlugins();

      const action = enabled ? 'enabled' : 'disabled';
      this.registry.getLogger().info(`Plugin ${action}: ${pluginId}`);
    } catch (error) {
      throw new Error(`Failed to toggle plugin: ${error}`);
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.manifest) {
      throw new Error('Plugin must have a manifest');
    }

    const required = ['id', 'name', 'version', 'description', 'author'];
    for (const field of required) {
      if (!plugin.manifest[field as keyof typeof plugin.manifest]) {
        throw new Error(`Plugin manifest missing required field: ${field}`);
      }
    }
  }

  /**
   * Load installed plugins from storage
   */
  private async loadInstalledPlugins(): Promise<void> {
    try {
      const stored = await this.storage.get('installed-plugins');
      if (stored && Array.isArray(stored)) {
        for (const plugin of stored) {
          this.installedPlugins.set(plugin.id, plugin);
        }
      }
    } catch (error) {
      this.registry.getLogger().warn('Failed to load installed plugins', error);
    }
  }

  /**
   * Persist installed plugins to storage
   */
  private async persistInstalledPlugins(): Promise<void> {
    try {
      const plugins = Array.from(this.installedPlugins.values());
      await this.storage.set('installed-plugins', plugins);
    } catch (error) {
      this.registry.getLogger().error('Failed to persist installed plugins', error);
      throw error;
    }
  }

  /**
   * Report progress
   */
  private reportProgress(
    onProgress: ProgressCallback | undefined,
    step: string,
    current: number,
    total: number
  ): void {
    if (onProgress) {
      onProgress({
        step,
        progress: current,
        total,
      });
    }
  }
}
