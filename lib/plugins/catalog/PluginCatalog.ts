/**
 * Plugin Catalog - Discover and list available plugins
 */

import { logger } from '@/lib/utils/logger';
import { PluginPackageInfo, PluginLoadSource, PluginCategory } from '../types';
import { NpmPluginLoader } from '../loaders/NpmPluginLoader';
import { GithubPluginLoader } from '../loaders/GithubPluginLoader';

/**
 * Built-in curated plugins
 */
const CURATED_PLUGINS: PluginPackageInfo[] = [
  {
    id: '@apb-plugins/unsplash-images',
    name: 'Unsplash Images',
    version: '1.0.0',
    description: 'Add beautiful free images from Unsplash to your pages',
    author: 'AI Page Builder',
    license: 'MIT',
    tags: ['images', 'media', 'unsplash', 'stock-photos'],
    downloads: 1250,
    rating: 4.8,
    source: PluginLoadSource.NPM,
    packageUrl: 'https://npmjs.org/package/@apb-plugins/unsplash-images',
  },
  {
    id: '@apb-plugins/shopify-products',
    name: 'Shopify Products',
    version: '1.0.0',
    description: 'Display and sell products directly from Shopify',
    author: 'AI Page Builder',
    license: 'MIT',
    tags: ['shopify', 'ecommerce', 'products', 'sales'],
    downloads: 2150,
    rating: 4.9,
    source: PluginLoadSource.NPM,
    packageUrl: 'https://npmjs.org/package/@apb-plugins/shopify-products',
  },
  {
    id: '@apb-plugins/stripe-checkout',
    name: 'Stripe Checkout',
    version: '1.0.0',
    description: 'Accept payments with Stripe checkout integration',
    author: 'AI Page Builder',
    license: 'MIT',
    tags: ['stripe', 'payments', 'checkout', 'billing'],
    downloads: 3420,
    rating: 4.95,
    source: PluginLoadSource.NPM,
    packageUrl: 'https://npmjs.org/package/@apb-plugins/stripe-checkout',
  },
  {
    id: '@apb-plugins/google-analytics',
    name: 'Google Analytics',
    version: '1.0.0',
    description: 'Track page views and user events with Google Analytics',
    author: 'AI Page Builder',
    license: 'MIT',
    tags: ['analytics', 'google', 'tracking', 'metrics'],
    downloads: 4210,
    rating: 4.85,
    source: PluginLoadSource.NPM,
    packageUrl: 'https://npmjs.org/package/@apb-plugins/google-analytics',
  },
  {
    id: '@apb-plugins/mailchimp-forms',
    name: 'Mailchimp Forms',
    version: '1.0.0',
    description: 'Collect emails and manage subscribers with Mailchimp',
    author: 'AI Page Builder',
    license: 'MIT',
    tags: ['mailchimp', 'forms', 'email', 'marketing'],
    downloads: 2890,
    rating: 4.7,
    source: PluginLoadSource.NPM,
    packageUrl: 'https://npmjs.org/package/@apb-plugins/mailchimp-forms',
  },
];

export class PluginCatalog {
  private npmLoader: NpmPluginLoader;
  private githubLoader: GithubPluginLoader;
  private cache: Map<string, PluginPackageInfo[]> = new Map();
  private cacheExpiry: number = 3600000; // 1 hour

  constructor() {
    this.npmLoader = new NpmPluginLoader();
    this.githubLoader = new GithubPluginLoader();
  }

  /**
   * Get all curated plugins
   */
  getCuratedPlugins(): PluginPackageInfo[] {
    return [...CURATED_PLUGINS];
  }

  /**
   * Get plugins by category
   */
  getByCategory(category: PluginCategory): PluginPackageInfo[] {
    return CURATED_PLUGINS.filter((plugin) => {
      // Map category enum to plugin tags
      const categoryTag = this.categoryToTag(category);
      return plugin.tags.includes(categoryTag);
    });
  }

  /**
   * Search plugins
   */
  async search(
    query: string,
    source?: PluginLoadSource
  ): Promise<PluginPackageInfo[]> {
    const results: PluginPackageInfo[] = [];

    // Always include curated plugins that match query
    const queryLower = query.toLowerCase();
    const curatedMatches = CURATED_PLUGINS.filter(
      (plugin) =>
        plugin.name.toLowerCase().includes(queryLower) ||
        plugin.description.toLowerCase().includes(queryLower) ||
        plugin.tags.some((tag) => tag.includes(queryLower))
    );
    results.push(...curatedMatches);

    // Search npm if specified or no source specified
    if (!source || source === PluginLoadSource.NPM) {
      try {
        const npmResults = await this.npmLoader.search(query);
        results.push(
          ...npmResults.map((npm) => ({
            id: npm.name,
            name: npm.name,
            version: npm.version,
            description: npm.description,
            author: 'Unknown',
            license: 'Unknown',
            tags: ['npm'],
            source: PluginLoadSource.NPM,
            packageUrl: `https://npmjs.org/package/${npm.name}`,
          }))
        );
      } catch (error) {
        logger.warn("Failed to search npm", error);
      }
    }

    // Search GitHub if specified or no source specified
    if (!source || source === PluginLoadSource.GITHUB) {
      try {
        const githubResults = await this.githubLoader.search(query);
        results.push(
          ...githubResults.map((gh) => ({
            id: `${gh.owner}/${gh.name}`,
            name: gh.name,
            version: '1.0.0',
            description: gh.description,
            author: gh.owner,
            license: 'Unknown',
            tags: ['github'],
            downloads: gh.stars,
            repositoryUrl: gh.url,
            source: PluginLoadSource.GITHUB,
          }))
        );
      } catch (error) {
        logger.warn("Failed to search GitHub", error);
      }
    }

    // Remove duplicates
    const seen = new Set<string>();
    return results.filter((plugin) => {
      if (seen.has(plugin.id)) {
        return false;
      }
      seen.add(plugin.id);
      return true;
    });
  }

  /**
   * Get plugin details
   */
  async getPluginDetails(
    pluginId: string,
    source: PluginLoadSource
  ): Promise<PluginPackageInfo | null> {
    // Check curated plugins
    const curated = CURATED_PLUGINS.find((p) => p.id === pluginId);
    if (curated) {
      return curated;
    }

    // Check npm
    if (source === PluginLoadSource.NPM) {
      try {
        const npmResults = await this.npmLoader.search(pluginId);
        const match = npmResults.find((npm) => npm.name === pluginId);
        if (match) {
          return {
            id: match.name,
            name: match.name,
            version: match.version,
            description: match.description,
            author: 'Unknown',
            license: 'Unknown',
            tags: [],
            source: PluginLoadSource.NPM,
            packageUrl: `https://npmjs.org/package/${match.name}`,
          };
        }
      } catch (error) {
        logger.warn("Failed to get npm plugin details", error, { pluginId });
      }
    }

    // Check GitHub
    if (source === PluginLoadSource.GITHUB) {
      try {
        const [owner, repo] = pluginId.split('/');
        const info = await this.githubLoader.getRepositoryInfo(owner, repo);
        return {
          id: pluginId,
          name: info.name,
          version: '1.0.0',
          description: info.description,
          author: owner,
          license: info.license || 'Unknown',
          tags: [],
          repositoryUrl: info.url,
          source: PluginLoadSource.GITHUB,
        };
      } catch (error) {
        logger.warn("Failed to get GitHub plugin details", error, { pluginId });
      }
    }

    return null;
  }

  /**
   * Get featured plugins
   */
  getFeaturedPlugins(): PluginPackageInfo[] {
    // Return highest rated plugins
    return CURATED_PLUGINS.filter((p) => p.rating && p.rating >= 4.7).sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );
  }

  /**
   * Get popular plugins by download count
   */
  getPopularPlugins(limit: number = 10): PluginPackageInfo[] {
    return CURATED_PLUGINS.filter((p) => p.downloads)
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, limit);
  }

  /**
   * Get trending plugins
   */
  getTrendingPlugins(): PluginPackageInfo[] {
    // In real implementation, this would track recent installs
    return this.getPopularPlugins(5);
  }

  /**
   * Map PluginCategory to tag
   */
  private categoryToTag(category: PluginCategory): string {
    const categoryMap: Record<PluginCategory, string> = {
      [PluginCategory.INTEGRATION]: 'integration',
      [PluginCategory.BLOCK]: 'block',
      [PluginCategory.FIELD]: 'field',
      [PluginCategory.FORM]: 'forms',
      [PluginCategory.ECOMMERCE]: 'ecommerce',
      [PluginCategory.ANALYTICS]: 'analytics',
      [PluginCategory.MEDIA]: 'images',
      [PluginCategory.CMS]: 'cms',
      [PluginCategory.PAYMENT]: 'payments',
      [PluginCategory.MARKETING]: 'marketing',
      [PluginCategory.UTILITY]: 'utility',
    };
    return categoryMap[category];
  }
}

// Singleton instance
let catalogInstance: PluginCatalog;

export function getPluginCatalog(): PluginCatalog {
  if (!catalogInstance) {
    catalogInstance = new PluginCatalog();
  }
  return catalogInstance;
}
