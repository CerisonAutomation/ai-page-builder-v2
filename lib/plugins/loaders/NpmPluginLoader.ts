/**
 * NPM Plugin Loader - Loads plugins from npm registry
 */

import { logger } from '@/lib/utils/logger';
import { Plugin } from '../types';

export class NpmPluginLoader {
  private npmRegistry: string = 'https://registry.npmjs.org';

  /**
   * Load plugin from npm
   */
  async load(packageName: string): Promise<Plugin> {
    try {
      // Fetch package metadata from npm
      const response = await fetch(
        `${this.npmRegistry}/${encodeURIComponent(packageName)}`
      );

      if (!response.ok) {
        throw new Error(`Package not found: ${packageName}`);
      }

      const metadata = await response.json();
      const latest = metadata.versions[metadata['dist-tags'].latest];

      if (!latest.pluginConfig) {
        throw new Error(
          `Package ${packageName} is not a valid AI Page Builder plugin`
        );
      }

      // In production, you would load the actual package and extract the plugin
      // For now, we return the plugin config from package metadata
      const plugin: Plugin = {
        manifest: {
          id: latest.pluginConfig.id || packageName,
          name: latest.pluginConfig.name || metadata.name,
          version: metadata.version,
          description: metadata.description || '',
          author: metadata.author?.name || 'Unknown',
          license: metadata.license || 'MIT',
          homepage: metadata.homepage,
          repository: metadata.repository?.url,
          keywords: metadata.keywords || [],
          category: latest.pluginConfig.category || 'utility',
          requiredPeerVersions: latest.pluginConfig.requiredPeerVersions,
          dependencies: latest.dependencies,
        },
        blocks: latest.pluginConfig.blocks || {},
        fields: latest.pluginConfig.fields || {},
        integrations: latest.pluginConfig.integrations || {},
      };

      return this.validatePlugin(plugin);
    } catch (error) {
      throw new Error(`Failed to load npm plugin ${packageName}: ${error}`);
    }
  }

  /**
   * Search for plugins on npm
   */
  async search(query: string): Promise<Array<{
    name: string;
    version: string;
    description: string;
  }>> {
    try {
      const response = await fetch(
        `https://api.npms.io/v2/search?q=${encodeURIComponent(
          'ai-page-builder-plugin ' + query
        )}`
      );

      if (!response.ok) {
        throw new Error('Failed to search npm registry');
      }

      const data = await response.json();

      return (data.results || []).map((result: any) => ({
        name: result.package.name,
        version: result.package.version,
        description: result.package.description,
      }));
    } catch (error) {
      logger.warn("Failed to search npm registry", error);
      return [];
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
