/**
 * Plugin SDK - Helper utilities for plugin development
 */

import {
  Plugin,
  PluginManifest,
  PluginBlock,
  PluginField,
  PluginIntegration,
  PluginSetting,
  PluginCategory,
} from '../types';

/**
 * Plugin builder for creating plugins with fluent API
 */
export class PluginBuilder {
  private manifest: Partial<PluginManifest> = {};
  private blocks: Record<string, PluginBlock> = {};
  private fields: Record<string, PluginField> = {};
  private integrations: Record<string, PluginIntegration> = {};
  private settings: Record<string, PluginSetting> = {};
  private hooks: Partial<Plugin> = {};

  setManifest(manifest: Partial<PluginManifest>): this {
    this.manifest = manifest;
    return this;
  }

  setId(id: string): this {
    this.manifest.id = id;
    return this;
  }

  setName(name: string): this {
    this.manifest.name = name;
    return this;
  }

  setVersion(version: string): this {
    this.manifest.version = version;
    return this;
  }

  setDescription(description: string): this {
    this.manifest.description = description;
    return this;
  }

  setAuthor(author: string): this {
    this.manifest.author = author;
    return this;
  }

  setCategory(category: PluginCategory): this {
    this.manifest.category = category;
    return this;
  }

  setLicense(license: string): this {
    this.manifest.license = license;
    return this;
  }

  setKeywords(keywords: string[]): this {
    this.manifest.keywords = keywords;
    return this;
  }

  setHomepage(homepage: string): this {
    this.manifest.homepage = homepage;
    return this;
  }

  setRepository(repository: string): this {
    this.manifest.repository = repository;
    return this;
  }

  setDependencies(dependencies: Record<string, string>): this {
    this.manifest.dependencies = dependencies;
    return this;
  }

  addBlock(id: string, block: PluginBlock): this {
    this.blocks[id] = block;
    return this;
  }

  addField(id: string, field: PluginField): this {
    this.fields[id] = field;
    return this;
  }

  addIntegration(id: string, integration: PluginIntegration): this {
    this.integrations[id] = integration;
    return this;
  }

  addSetting(id: string, setting: PluginSetting): this {
    this.settings[id] = setting;
    return this;
  }

  onLoad(handler: any): this {
    this.hooks.onLoad = handler;
    return this;
  }

  onActivate(handler: any): this {
    this.hooks.onActivate = handler;
    return this;
  }

  onDeactivate(handler: any): this {
    this.hooks.onDeactivate = handler;
    return this;
  }

  onUnload(handler: any): this {
    this.hooks.onUnload = handler;
    return this;
  }

  build(): Plugin {
    // Validate manifest
    const requiredFields = [
      'id',
      'name',
      'version',
      'description',
      'author',
      'license',
      'category',
      'keywords',
    ];
    for (const field of requiredFields) {
      if (!this.manifest[field as keyof PluginManifest]) {
        throw new Error(`Plugin manifest missing required field: ${field}`);
      }
    }

    return {
      manifest: this.manifest as PluginManifest,
      blocks: Object.keys(this.blocks).length > 0 ? this.blocks : undefined,
      fields: Object.keys(this.fields).length > 0 ? this.fields : undefined,
      integrations: Object.keys(this.integrations).length > 0 ? this.integrations : undefined,
      settings: Object.keys(this.settings).length > 0 ? this.settings : undefined,
      ...this.hooks,
    };
  }
}

/**
 * Create a new plugin with fluent API
 */
export function createPlugin(): PluginBuilder {
  return new PluginBuilder();
}

/**
 * Block builder helper
 */
export class BlockBuilder {
  private block: Partial<PluginBlock> = {
    defaultProps: {},
    fields: {},
  };

  setName(name: string): this {
    this.block.name = name;
    return this;
  }

  setLabel(label: string): this {
    this.block.label = label;
    return this;
  }

  setDescription(description: string): this {
    this.block.description = description;
    return this;
  }

  setIcon(icon: string): this {
    this.block.icon = icon;
    return this;
  }

  setDefaultProps(props: Record<string, any>): this {
    this.block.defaultProps = props;
    return this;
  }

  setFields(fields: Record<string, any>): this {
    this.block.fields = fields;
    return this;
  }

  setRender(component: any): this {
    this.block.render = component;
    return this;
  }

  setExample(example: Record<string, any>): this {
    this.block.example = example;
    return this;
  }

  build(): PluginBlock {
    if (!this.block.name || !this.block.label || !this.block.render) {
      throw new Error(
        'Block must have name, label, and render component'
      );
    }

    return this.block as PluginBlock;
  }
}

/**
 * Create a new block with fluent API
 */
export function createBlock(): BlockBuilder {
  return new BlockBuilder();
}

/**
 * Integration builder helper
 */
export class IntegrationBuilder {
  private integration: Partial<PluginIntegration> = {};

  setId(id: string): this {
    this.integration.id = id;
    return this;
  }

  setName(name: string): this {
    this.integration.name = name;
    return this;
  }

  setBaseUrl(baseUrl: string): this {
    this.integration.baseUrl = baseUrl;
    return this;
  }

  setApiKey(apiKey: string): this {
    this.integration.apiKey = apiKey;
    return this;
  }

  setWebhookSecret(secret: string): this {
    this.integration.webhookSecret = secret;
    return this;
  }

  setAuthenticate(handler: any): this {
    this.integration.authenticate = handler;
    return this;
  }

  setCall(handler: any): this {
    this.integration.call = handler;
    return this;
  }

  build(): PluginIntegration {
    if (!this.integration.id || !this.integration.name) {
      throw new Error('Integration must have id and name');
    }

    return this.integration as PluginIntegration;
  }
}

/**
 * Create a new integration with fluent API
 */
export function createIntegration(): IntegrationBuilder {
  return new IntegrationBuilder();
}

/**
 * Validation helpers
 */
export const validators = {
  /**
   * Validate URL
   */
  isUrl: (value: any): boolean | string => {
    if (typeof value !== 'string') return 'Must be a string';
    try {
      new URL(value);
      return true;
    } catch {
      return 'Must be a valid URL';
    }
  },

  /**
   * Validate email
   */
  isEmail: (value: any): boolean | string => {
    if (typeof value !== 'string') return 'Must be a string';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Must be a valid email';
  },

  /**
   * Validate API key (at least 20 chars)
   */
  isApiKey: (value: any): boolean | string => {
    if (typeof value !== 'string') return 'Must be a string';
    return value.length >= 20 || 'API key must be at least 20 characters';
  },

  /**
   * Validate required field
   */
  isRequired: (value: any): boolean | string => {
    return (value !== null && value !== undefined && value !== '') || 'This field is required';
  },

  /**
   * Validate minimum length
   */
  minLength: (min: number) => (value: any): boolean | string => {
    if (typeof value !== 'string') return 'Must be a string';
    return value.length >= min || `Must be at least ${min} characters`;
  },

  /**
   * Validate maximum length
   */
  maxLength: (max: number) => (value: any): boolean | string => {
    if (typeof value !== 'string') return 'Must be a string';
    return value.length <= max || `Must be at most ${max} characters`;
  },

  /**
   * Validate number range
   */
  range: (min: number, max: number) => (value: any): boolean | string => {
    if (typeof value !== 'number') return 'Must be a number';
    return (value >= min && value <= max) || `Must be between ${min} and ${max}`;
  },

  /**
   * Validate JSON
   */
  isJSON: (value: any): boolean | string => {
    if (typeof value !== 'string') return 'Must be a string';
    try {
      JSON.parse(value);
      return true;
    } catch {
      return 'Must be valid JSON';
    }
  },
};

/**
 * Helper to fetch with API key
 */
export async function fetchWithAuth(
  url: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Helper to debounce callbacks
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Helper to throttle callbacks
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
