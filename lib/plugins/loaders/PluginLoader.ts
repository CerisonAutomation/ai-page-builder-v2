/**
 * Plugin Loader - Loads plugins from various sources
 */

import { Plugin, PluginLoadSource } from '../types';
import { LocalPluginLoader } from './LocalPluginLoader';
import { NpmPluginLoader } from './NpmPluginLoader';
import { GithubPluginLoader } from './GithubPluginLoader';

export class PluginLoader {
  private localLoader: LocalPluginLoader;
  private npmLoader: NpmPluginLoader;
  private githubLoader: GithubPluginLoader;

  constructor() {
    this.localLoader = new LocalPluginLoader();
    this.npmLoader = new NpmPluginLoader();
    this.githubLoader = new GithubPluginLoader();
  }

  /**
   * Load a plugin from various sources
   */
  async loadPlugin(
    source: PluginLoadSource,
    location: string
  ): Promise<Plugin> {
    switch (source) {
      case PluginLoadSource.LOCAL:
        return this.localLoader.load(location);
      case PluginLoadSource.NPM:
        return this.npmLoader.load(location);
      case PluginLoadSource.GITHUB:
        return this.githubLoader.load(location);
      case PluginLoadSource.CUSTOM:
        return this.loadFromCustom(location);
      default:
        throw new Error(`Unknown plugin source: ${source}`);
    }
  }

  /**
   * Load from custom source (expects a plugin object or URL)
   */
  private async loadFromCustom(location: string): Promise<Plugin> {
    // Try to load as URL first
    if (location.startsWith('http')) {
      const response = await fetch(location);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin from ${location}`);
      }
      const plugin = await response.json();
      return this.validatePlugin(plugin);
    }

    // Try to parse as JSON
    try {
      const plugin = JSON.parse(location);
      return this.validatePlugin(plugin);
    } catch (error) {
      throw new Error(`Invalid custom plugin source: ${location}`);
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: any): Plugin {
    if (!plugin.manifest) {
      throw new Error('Plugin must have a manifest property');
    }

    const requiredFields = ['id', 'name', 'version', 'description', 'author'];
    for (const field of requiredFields) {
      if (!plugin.manifest[field]) {
        throw new Error(`Plugin manifest missing required field: ${field}`);
      }
    }

    return plugin as Plugin;
  }
}
