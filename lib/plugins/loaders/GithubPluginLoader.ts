/**
 * GitHub Plugin Loader - Loads plugins from GitHub repositories
 */

import { logger } from '@/lib/utils/logger';
import { Plugin } from '../types';

export class GithubPluginLoader {
  private githubApi: string = 'https://api.github.com';

  /**
   * Load plugin from GitHub
   * Format: owner/repo or owner/repo@branch
   */
  async load(repo: string): Promise<Plugin> {
    try {
      const [path, branch] = repo.split('@');
      const [owner, name] = path.split('/');

      if (!owner || !name) {
        throw new Error('Invalid GitHub repository format. Use: owner/repo or owner/repo@branch');
      }

      // Fetch plugin.json from repository
      const branchName = branch || 'main';
      const response = await fetch(
        `${this.githubApi}/repos/${owner}/${name}/contents/plugin.json?ref=${branchName}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3.raw',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch plugin.json from ${owner}/${name} at ${branchName}`
        );
      }

      const pluginConfig = await response.json();
      const plugin = this.createPluginFromConfig(pluginConfig, owner, name);

      return this.validatePlugin(plugin);
    } catch (error) {
      throw new Error(`Failed to load GitHub plugin: ${error}`);
    }
  }

  /**
   * Search for plugins on GitHub
   */
  async search(query: string): Promise<Array<{
    name: string;
    owner: string;
    description: string;
    url: string;
    stars: number;
  }>> {
    try {
      const response = await fetch(
        `${this.githubApi}/search/repositories?q=ai-page-builder-plugin ${query}&sort=stars&order=desc`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search GitHub');
      }

      const data = await response.json();

      return (data.items || []).slice(0, 10).map((item: any) => ({
        name: item.name,
        owner: item.owner.login,
        description: item.description || 'No description',
        url: item.html_url,
        stars: item.stargazers_count,
      }));
    } catch (error) {
      logger.warn("Failed to search GitHub", error);
      return [];
    }
  }

  /**
   * Get repository info
   */
  async getRepositoryInfo(
    owner: string,
    repo: string
  ): Promise<{
    name: string;
    description: string;
    url: string;
    stars: number;
    license: string | null;
  }> {
    try {
      const response = await fetch(
        `${this.githubApi}/repos/${owner}/${repo}`
      );

      if (!response.ok) {
        throw new Error(`Repository not found: ${owner}/${repo}`);
      }

      const data = await response.json();

      return {
        name: data.name,
        description: data.description || 'No description',
        url: data.html_url,
        stars: data.stargazers_count,
        license: data.license?.spdx_id || null,
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository info: ${error}`);
    }
  }

  /**
   * Create plugin from config
   */
  private createPluginFromConfig(
    config: any,
    owner: string,
    repo: string
  ): Plugin {
    return {
      manifest: {
        id: config.id || `${owner}/${repo}`,
        name: config.name || repo,
        version: config.version || '1.0.0',
        description: config.description || '',
        author: config.author || owner,
        license: config.license || 'MIT',
        homepage: config.homepage || `https://github.com/${owner}/${repo}`,
        repository: `https://github.com/${owner}/${repo}`,
        keywords: config.keywords || [],
        category: config.category || 'utility',
        requiredPeerVersions: config.requiredPeerVersions,
        dependencies: config.dependencies,
      },
      blocks: config.blocks || {},
      fields: config.fields || {},
      integrations: config.integrations || {},
    };
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
