# AI Page Builder - Plugin System Guide

A comprehensive plugin system for extending the AI Page Builder with custom blocks, fields, integrations, and features.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [Plugin Registry](#plugin-registry)
5. [Creating Plugins](#creating-plugins)
6. [Plugin SDK](#plugin-sdk)
7. [Managing Plugins](#managing-plugins)
8. [Plugin Catalog](#plugin-catalog)
9. [Sample Plugins](#sample-plugins)
10. [API Reference](#api-reference)

## Overview

The plugin system allows you to:

- **Extend Blocks**: Add custom visual components and Puck blocks
- **Custom Fields**: Create specialized input fields for content
- **Integrations**: Connect to external APIs and services
- **Forms**: Build custom form blocks with validation
- **Analytics**: Add tracking and monitoring capabilities
- **E-commerce**: Integrate payment and product systems
- **Media Management**: Custom media sources and handlers

### Architecture

```
Plugin System
├── Registry (PluginRegistry)
│   ├── Block Registration
│   ├── Field Registration
│   └── Integration Management
├── Loader (PluginLoader)
│   ├── LocalPluginLoader
│   ├── NpmPluginLoader
│   └── GithubPluginLoader
├── Catalog (PluginCatalog)
│   └── Discovery & Search
├── Installer (PluginInstaller)
│   └── Installation Management
└── SDK (PluginSDK)
    ├── PluginBuilder
    ├── BlockBuilder
    └── Validators
```

## Quick Start

### 1. Load and Register a Plugin

```typescript
import { getPluginRegistry } from '@/lib/plugins/registry/PluginRegistry';
import { unsplashPlugin } from '@/lib/plugins/samples/UnsplashPlugin';

const registry = getPluginRegistry();
await registry.registerPlugin(unsplashPlugin);

// Get registered blocks
const blocks = registry.getBlocks();
```

### 2. Install a Plugin from NPM

```typescript
import { PluginInstaller } from '@/lib/plugins/installer/PluginInstaller';
import { PluginLoadSource } from '@/lib/plugins/types';

const installer = new PluginInstaller(registry);

await installer.install(
  PluginLoadSource.NPM,
  '@apb-plugins/unsplash-images',
  (progress) => console.log(progress.step)
);
```

### 3. Use Plugin Blocks in Puck Config

```typescript
import { getPluginRegistry } from '@/lib/plugins/registry/PluginRegistry';

const registry = getPluginRegistry(puckConfig);
const blocks = registry.getBlocks();

// Add to Puck config
const enhancedConfig = {
  ...puckConfig,
  components: {
    ...puckConfig.components,
    ...Object.fromEntries(
      Array.from(blocks).map(([id, block]) => [
        id,
        { render: block.render, fields: block.fields },
      ])
    ),
  },
};
```

## Core Concepts

### Plugin Manifest

Every plugin starts with a manifest defining its metadata:

```typescript
interface PluginManifest {
  id: string;                              // Unique identifier
  name: string;                            // Display name
  version: string;                         // Semantic version
  description: string;                     // Brief description
  author: string;                          // Plugin author
  license: string;                         // License type
  homepage?: string;                       // Project homepage
  repository?: string;                     // Source repository
  keywords: string[];                      // Search keywords
  category: PluginCategory;                // Plugin category
  requiredPeerVersions?: Record<string, string>;
  dependencies?: Record<string, string>;   // NPM dependencies
}
```

### Plugin Categories

```typescript
enum PluginCategory {
  INTEGRATION = 'integration',
  BLOCK = 'block',
  FIELD = 'field',
  FORM = 'form',
  ECOMMERCE = 'ecommerce',
  ANALYTICS = 'analytics',
  MEDIA = 'media',
  CMS = 'cms',
  PAYMENT = 'payment',
  MARKETING = 'marketing',
  UTILITY = 'utility',
}
```

### Plugin Block

A plugin block is a Puck component with configuration:

```typescript
interface PluginBlock {
  name: string;
  label: string;
  description: string;
  icon?: string;
  defaultProps: Record<string, any>;
  fields: Record<string, any>;             // Puck field config
  render: ComponentType<any>;               // React component
  example?: Record<string, any>;
}
```

### Plugin Integration

Integrations connect to external APIs:

```typescript
interface PluginIntegration {
  id: string;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
  authenticate?: (credentials) => Promise<boolean>;
  call?: (method: string, params) => Promise<any>;
}
```

## Plugin Registry

The registry is the central hub for all plugins.

### Create a Registry Instance

```typescript
import { getPluginRegistry } from '@/lib/plugins/registry/PluginRegistry';

const registry = getPluginRegistry(puckConfig);
```

### Register a Plugin

```typescript
await registry.registerPlugin(myPlugin);
```

### Get Registered Items

```typescript
// Get all blocks
const blocks = registry.getBlocks();

// Get blocks from specific plugin
const unsplashBlocks = registry.getBlocks('unsplash-plugin');

// Get specific block
const block = registry.getBlock('unsplash-plugin:image');

// Get plugins by category
const mediaPlugins = registry.getPlugins(PluginCategory.MEDIA);
```

### Enable/Disable Plugins

```typescript
// Disable a plugin (keeps it installed but inactive)
await registry.togglePlugin('plugin-id', false);

// Re-enable it
await registry.togglePlugin('plugin-id', true);
```

### Plugin Settings

```typescript
// Update settings
await registry.updatePluginSettings('plugin-id', {
  apiKey: 'xxx',
  theme: 'dark',
});

// Get settings
const settings = await registry.getPluginSettings('plugin-id');
```

## Creating Plugins

### Method 1: Object Literal

```typescript
import { Plugin, PluginCategory } from '@/lib/plugins/types';

export const myPlugin: Plugin = {
  manifest: {
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'Does something awesome',
    author: 'Your Name',
    license: 'MIT',
    keywords: ['awesome', 'custom'],
    category: PluginCategory.BLOCK,
  },

  blocks: {
    my_block: {
      name: 'my_block',
      label: 'My Block',
      description: 'My custom block',
      defaultProps: { title: 'Hello' },
      fields: {
        title: { type: 'text', label: 'Title' },
      },
      render: (props) => <h1>{props.title}</h1>,
    },
  },

  onLoad: async (context) => {
    context.logger.info('Plugin loaded!');
  },
};
```

### Method 2: Builder API

```typescript
import { createPlugin, PluginCategory } from '@/lib/plugins/sdk/PluginSDK';

export const myPlugin = createPlugin()
  .setId('my-plugin')
  .setName('My Plugin')
  .setVersion('1.0.0')
  .setDescription('Does something awesome')
  .setAuthor('Your Name')
  .setLicense('MIT')
  .setCategory(PluginCategory.BLOCK)
  .setKeywords(['awesome', 'custom'])
  .addBlock('my_block', {
    name: 'my_block',
    label: 'My Block',
    defaultProps: { title: 'Hello' },
    fields: { title: { type: 'text', label: 'Title' } },
    render: (props) => <h1>{props.title}</h1>,
  })
  .onLoad(async (context) => {
    context.logger.info('Plugin loaded!');
  })
  .build();
```

### Plugin Lifecycle Hooks

```typescript
const plugin: Plugin = {
  manifest: { /* ... */ },

  // Called when plugin is first loaded
  onLoad: async (context: PluginContext) => {
    // Initialize plugin
    context.logger.info('Initializing');
    context.on(PluginEvent.PAGE_CREATED, () => {
      // Handle page creation
    });
  },

  // Called when plugin is activated
  onActivate: async () => {
    // Enable plugin features
  },

  // Called when plugin is deactivated
  onDeactivate: async () => {
    // Disable plugin features
  },

  // Called when plugin is unloaded
  onUnload: async () => {
    // Cleanup
  },
};
```

## Plugin SDK

The SDK provides helpers for building plugins.

### PluginBuilder

```typescript
import { createPlugin, PluginCategory } from '@/lib/plugins/sdk/PluginSDK';

const plugin = createPlugin()
  .setId('my-plugin')
  .setName('My Plugin')
  .setVersion('1.0.0')
  .setDescription('Description')
  .setAuthor('Author')
  .setLicense('MIT')
  .setCategory(PluginCategory.BLOCK)
  .setKeywords(['keyword1', 'keyword2'])
  .setHomepage('https://example.com')
  .setRepository('https://github.com/user/repo')
  .addBlock('block-id', blockConfig)
  .addField('field-id', fieldConfig)
  .addIntegration('integration-id', integrationConfig)
  .addSetting('setting-id', settingConfig)
  .onLoad(loadHandler)
  .build();
```

### BlockBuilder

```typescript
import { createBlock } from '@/lib/plugins/sdk/PluginSDK';

const block = createBlock()
  .setName('my_block')
  .setLabel('My Block')
  .setDescription('Description')
  .setIcon('icon-name')
  .setDefaultProps({ title: '' })
  .setFields({
    title: { type: 'text', label: 'Title' },
  })
  .setRender(MyBlockComponent)
  .setExample({ title: 'Example' })
  .build();
```

### Validators

```typescript
import { validators } from '@/lib/plugins/sdk/PluginSDK';

// Built-in validators
validators.isUrl(value)              // Validate URL
validators.isEmail(value)            // Validate email
validators.isApiKey(value)           // Validate API key (20+ chars)
validators.isRequired(value)         // Required field
validators.minLength(10)(value)      // Minimum length
validators.maxLength(100)(value)     // Maximum length
validators.range(1, 100)(value)      // Number range
validators.isJSON(value)             // Valid JSON

// Use in settings
const plugin = createPlugin()
  .addSetting('api_key', {
    name: 'api_key',
    label: 'API Key',
    type: 'string',
    required: true,
    validation: validators.isRequired,
  })
  .build();
```

### Helper Functions

```typescript
import {
  fetchWithAuth,
  debounce,
  throttle,
} from '@/lib/plugins/sdk/PluginSDK';

// Fetch with bearer token
const response = await fetchWithAuth(url, apiKey, options);

// Debounce function (wait 300ms after last call)
const debouncedSearch = debounce((query) => {
  // Search API call
}, 300);

// Throttle function (limit to 1 call per 1000ms)
const throttledScroll = throttle(() => {
  // Scroll handler
}, 1000);
```

## Managing Plugins

### Plugin Installer

```typescript
import { PluginInstaller } from '@/lib/plugins/installer/PluginInstaller';
import { PluginLoadSource } from '@/lib/plugins/types';

const installer = new PluginInstaller(registry);

// Install from npm
await installer.install(
  PluginLoadSource.NPM,
  '@apb-plugins/unsplash-images',
  (progress) => {
    console.log(`${progress.step}: ${progress.progress}/${progress.total}`);
  }
);

// Install from GitHub
await installer.install(
  PluginLoadSource.GITHUB,
  'owner/repo@main'
);

// Install from local
await installer.install(
  PluginLoadSource.LOCAL,
  './plugins/my-plugin.ts'
);

// Get installed plugins
const installed = installer.getInstalledPlugins();

// Uninstall
await installer.uninstall('plugin-id');

// Update
await installer.update('plugin-id', newLocation);

// Enable/disable
await installer.togglePlugin('plugin-id', false);
```

## Plugin Catalog

Discover and list available plugins.

```typescript
import { getPluginCatalog } from '@/lib/plugins/catalog/PluginCatalog';

const catalog = getPluginCatalog();

// Get curated plugins
const curated = catalog.getCuratedPlugins();

// Get by category
const mediaPlugins = catalog.getByCategory(PluginCategory.MEDIA);

// Search
const results = await catalog.search('stripe');
const npmOnly = await catalog.search('stripe', PluginLoadSource.NPM);

// Get details
const plugin = await catalog.getPluginDetails(
  '@apb-plugins/stripe-checkout',
  PluginLoadSource.NPM
);

// Featured plugins (highest rated)
const featured = catalog.getFeaturedPlugins();

// Popular plugins
const popular = catalog.getPopularPlugins(10);

// Trending
const trending = catalog.getTrendingPlugins();
```

## Sample Plugins

### 1. Unsplash Images Plugin

Adds a block to display free images from Unsplash.

**Features:**
- Search Unsplash API
- Display images with credits
- Customizable styling

**Location:** `lib/plugins/samples/UnsplashPlugin.ts`

**Usage:**

```typescript
import { unsplashPlugin } from '@/lib/plugins/samples/UnsplashPlugin';

await registry.registerPlugin(unsplashPlugin);
```

### 2. Shopify Products Plugin

Display and sell products from your Shopify store.

**Features:**
- Single product display
- Product grid layout
- Storefront API integration
- Shopping cart integration

**Location:** `lib/plugins/samples/ShopifyPlugin.ts`

### 3. Stripe Checkout Plugin

Accept payments with Stripe.

**Features:**
- Checkout summary
- Payment form
- Multiple payment methods
- Secure payment processing

**Location:** `lib/plugins/samples/StripePlugin.ts`

### 4. Google Analytics Plugin (Future)

Track page views and events with Google Analytics.

### 5. Mailchimp Forms Plugin (Future)

Collect emails and manage subscribers.

## API Reference

### PluginContext

Available in plugin lifecycle hooks.

```typescript
interface PluginContext {
  // Access to Puck config
  puckConfig: any;

  // Logger for debugging
  logger: IPluginLogger;

  // Persistent storage
  storage: IPluginStorage;

  // Registration methods
  registerBlock: (id: string, block: PluginBlock) => void;
  registerField: (id: string, field: PluginField) => void;
  registerIntegration: (id: string, integration: PluginIntegration) => void;

  // Event system
  on: (event: PluginEvent, handler: (...args) => void) => void;
  off: (event: PluginEvent, handler: (...args) => void) => void;
  emit: (event: PluginEvent, ...args) => void;

  // Version info
  builderVersion: string;
}
```

### PluginEvent

Events plugins can listen to.

```typescript
enum PluginEvent {
  PAGE_CREATED = 'page:created',
  PAGE_UPDATED = 'page:updated',
  PAGE_DELETED = 'page:deleted',
  BLOCK_RENDERED = 'block:rendered',
  BLOCK_CHANGED = 'block:changed',
  SETTINGS_CHANGED = 'settings:changed',
}
```

### IPluginStorage

Key-value storage for plugin data.

```typescript
interface IPluginStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  setWithExpiry(key: string, value: any, ttlMs: number): Promise<void>;
  keys(): Promise<string[]>;
  entries(): Promise<Array<[string, any]>>;
}
```

### IPluginLogger

Logging interface for plugins.

```typescript
interface IPluginLogger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
  getLogs(level?: LogLevel): LogEntry[];
  clear(): void;
}
```

## Best Practices

1. **Semantic Versioning**: Follow semver for plugin versions
2. **Type Safety**: Use TypeScript for all plugins
3. **Documentation**: Include README and examples
4. **Error Handling**: Gracefully handle API errors
5. **Settings Validation**: Validate all user-provided settings
6. **Performance**: Use debounce/throttle for callbacks
7. **Testing**: Include unit tests for plugin logic
8. **Security**: Never expose sensitive keys in frontend code
9. **Accessibility**: Ensure blocks are keyboard and screen-reader friendly
10. **Cleanup**: Implement onUnload to clean up resources

## Troubleshooting

### Plugin won't load

- Check manifest required fields
- Verify plugin exports correctly
- Check browser console for errors
- Review logger output: `registry.getLogger().getLogs()`

### Blocks not appearing

- Ensure plugin is registered: `registry.getPlugins()`
- Check Puck config includes plugin blocks
- Verify block render component exists

### Settings not persisting

- Ensure storage is properly initialized
- Check for localStorage quota issues
- Verify plugin settings structure

## Support

For issues or questions:

1. Check sample plugins for examples
2. Review error logs via `registry.getLogger()`
3. Consult the API Reference
4. Check plugin's README/documentation

## License

The plugin system is MIT licensed. Individual plugins may have their own licenses.
