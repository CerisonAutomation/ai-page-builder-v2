/**
 * Local Plugin Loader - Loads plugins from local filesystem
 */

import { Plugin } from '../types';

export class LocalPluginLoader {
  /**
   * Load plugin from local path
   */
  async load(path: string): Promise<Plugin> {
    try {
      // In browser environment, we can't load from filesystem directly
      // Instead, we expect plugins to be pre-bundled or dynamically imported
      if (typeof window !== 'undefined') {
        return this.loadFromDynamicImport(path);
      }

      // In Node environment
      const module = await import(path);
      const plugin = module.default || module;
      return this.validatePlugin(plugin);
    } catch (error) {
      throw new Error(`Failed to load local plugin from ${path}: ${error}`);
    }
  }

  /**
   * Load from dynamic import (browser)
   */
  private async loadFromDynamicImport(path: string): Promise<Plugin> {
    try {
      const module = await import(path);
      const plugin = module.default || module;
      return this.validatePlugin(plugin);
    } catch (error) {
      throw new Error(`Failed to dynamically import plugin from ${path}: ${error}`);
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: any): Plugin {
    if (!plugin || typeof plugin !== 'object') {
      throw new Error('Plugin must be an object');
    }

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
