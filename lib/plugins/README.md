# Plugin System for AI Page Builder

A powerful, extensible plugin architecture for the AI Page Builder that allows developers to create custom blocks, fields, integrations, and more.

## 📋 Features

✨ **Rich Plugin Capabilities**
- Custom Puck blocks and components
- Custom field types with validation
- External API integrations
- Plugin-specific settings and configuration
- Event-driven architecture

🔌 **Plugin Management**
- Install from npm, GitHub, or local filesystem
- Enable/disable plugins without uninstalling
- Plugin versioning and updates
- Settings persistence

📚 **Plugin Discovery**
- Searchable plugin catalog
- Curated plugins by category
- Featured and trending plugins
- Popular plugins by download count

🛠️ **Developer Tools**
- Fluent API plugin builder
- Pre-built block and integration builders
- Validation utilities
- Helper functions (fetch, debounce, throttle)
- TypeScript support

## 📁 Directory Structure

```
lib/plugins/
├── types.ts                          # Core type definitions
├── index.ts                          # Main export file
├── PLUGINS_GUIDE.md                  # Comprehensive guide
├── README.md                         # This file
├── registry/
│   ├── PluginRegistry.ts            # Central registry
│   ├── PluginLogger.ts              # Logging utility
│   └── PluginStorage.ts             # Data persistence
├── loaders/
│   ├── PluginLoader.ts              # Main loader
│   ├── LocalPluginLoader.ts         # Load from filesystem
│   ├── NpmPluginLoader.ts           # Load from npm
│   └── GithubPluginLoader.ts        # Load from GitHub
├── catalog/
│   └── PluginCatalog.ts             # Plugin discovery
├── installer/
│   └── PluginInstaller.ts           # Installation management
├── sdk/
│   └── PluginSDK.ts                 # Developer tools
├── utils/
│   └── EventEmitter.ts              # Event system
└── samples/
    ├── UnsplashPlugin.ts            # Unsplash images
    ├── ShopifyPlugin.ts             # Shopify products
    └── StripePlugin.ts              # Stripe checkout
```

## 🚀 Quick Start

### 1. Install Built-in Plugins

```typescript
import { getPluginRegistry } from '@/lib/plugins';
import { unsplashPlugin, shopifyPlugin, stripePlugin } from '@/lib/plugins/samples';

const registry = getPluginRegistry();

// Register sample plugins
await registry.registerPlugin(unsplashPlugin);
await registry.registerPlugin(shopifyPlugin);
await registry.registerPlugin(stripePlugin);
```

### 2. Use Plugin Manager UI

```typescript
'use client';
import { PluginManager } from '@/components/plugins/PluginManager';
import { getPluginRegistry } from '@/lib/plugins';

export function AdminPage() {
  const registry = getPluginRegistry();

  return (
    <PluginManager
      registry={registry}
      onPluginsChange={() => {
        // Reload page or trigger UI update
      }}
    />
  );
}
```

### 3. Use Plugins in Editor

```typescript
import { getPluginRegistry } from '@/lib/plugins';
import puckConfig from '@/lib/puck/config';

const registry = getPluginRegistry(puckConfig);

// Get all plugin blocks
const pluginBlocks = registry.getBlocks();

// Merge with Puck components
const enhancedConfig = {
  ...puckConfig,
  components: {
    ...puckConfig.components,
    ...Object.fromEntries(
      Array.from(pluginBlocks).map(([id, block]) => [
        id,
        {
          render: block.render,
          fields: block.fields,
          defaultProps: block.defaultProps,
        },
      ])
    ),
  },
};
```

## 🎨 Creating a Plugin

### Simple Block Plugin

```typescript
import { createPlugin, createBlock, PluginCategory } from '@/lib/plugins';

const MyPlugin = createPlugin()
  .setId('my-plugin')
  .setName('My Plugin')
  .setVersion('1.0.0')
  .setDescription('My awesome plugin')
  .setAuthor('Your Name')
  .setLicense('MIT')
  .setCategory(PluginCategory.BLOCK)
  .setKeywords(['custom', 'block'])
  
  // Add a custom block
  .addBlock('my_block', {
    name: 'my_block',
    label: 'My Block',
    description: 'A custom block',
    defaultProps: { title: 'Hello' },
    fields: {
      title: { type: 'text', label: 'Title' },
      description: { type: 'textarea', label: 'Description' },
    },
    render: ({ title, description }) => (
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    ),
  })
  
  .build();

export default MyPlugin;
```

### Plugin with Settings

```typescript
import { createPlugin, validators, PluginCategory } from '@/lib/plugins';

const MyPlugin = createPlugin()
  .setId('my-api-plugin')
  .setName('My API Plugin')
  .setVersion('1.0.0')
  .setDescription('Connect to my API')
  .setAuthor('Your Name')
  .setLicense('MIT')
  .setCategory(PluginCategory.INTEGRATION)
  .setKeywords(['api', 'integration'])
  
  // Add settings for API configuration
  .addSetting('api_key', {
    name: 'api_key',
    label: 'API Key',
    description: 'Your API key from myservice.com',
    type: 'string',
    required: true,
    validation: validators.isRequired,
  })
  
  .addSetting('base_url', {
    name: 'base_url',
    label: 'API Base URL',
    type: 'string',
    required: true,
    validation: validators.isUrl,
    default: 'https://api.example.com',
  })
  
  .onLoad(async (context) => {
    context.logger.info('Plugin loaded');
  })
  
  .build();
```

### Plugin with Integration

```typescript
import { createPlugin, createIntegration } from '@/lib/plugins';

const MyPlugin = createPlugin()
  // ... manifest setup ...
  
  .addIntegration('my_api', {
    id: 'my_api',
    name: 'My API',
    baseUrl: 'https://api.example.com',
    authenticate: async (credentials) => {
      try {
        const response = await fetch('https://api.example.com/verify', {
          headers: { 'Authorization': `Bearer ${credentials.apiKey}` },
        });
        return response.ok;
      } catch {
        return false;
      }
    },
    call: async (method, params) => {
      const response = await fetch(
        `https://api.example.com/${method}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${params.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        }
      );
      return response.json();
    },
  })
  
  .build();
```

## 📦 Sample Plugins Included

### 1. Unsplash Images Plugin
Display free images from Unsplash with automatic photo credits.

**Features:**
- Image search integration
- Customizable styling
- Photographer credit attribution

**Location:** `lib/plugins/samples/UnsplashPlugin.ts`

### 2. Shopify Products Plugin
Sell products directly from your Shopify store.

**Features:**
- Single product display
- Product grid layouts
- Cart integration ready
- Storefront API integration

**Location:** `lib/plugins/samples/ShopifyPlugin.ts`

### 3. Stripe Checkout Plugin
Accept payments securely with Stripe.

**Features:**
- Checkout summary display
- Payment form block
- Multiple payment methods
- PCI-compliant payment processing

**Location:** `lib/plugins/samples/StripePlugin.ts`

## 🔧 Plugin Registry API

### Register a Plugin

```typescript
const registry = getPluginRegistry();
await registry.registerPlugin(myPlugin);
```

### Get Registered Items

```typescript
// All blocks
const blocks = registry.getBlocks();

// Blocks from specific plugin
const unsplashBlocks = registry.getBlocks('unsplash-plugin');

// Specific block
const block = registry.getBlock('unsplash-plugin:image');

// All plugins
const plugins = registry.getPlugins();

// Plugins by category
const mediaPlugins = registry.getPlugins(PluginCategory.MEDIA);
```

### Manage Plugin State

```typescript
// Enable/disable a plugin
await registry.togglePlugin('plugin-id', false);

// Update plugin settings
await registry.updatePluginSettings('plugin-id', {
  apiKey: 'xxx',
  theme: 'dark',
});

// Get plugin settings
const settings = await registry.getPluginSettings('plugin-id');
```

## 📦 Plugin Installer API

### Install Plugins

```typescript
import { PluginInstaller, PluginLoadSource } from '@/lib/plugins';

const installer = new PluginInstaller(registry);

// From npm
await installer.install(
  PluginLoadSource.NPM,
  '@apb-plugins/stripe-checkout',
  (progress) => console.log(progress)
);

// From GitHub
await installer.install(
  PluginLoadSource.GITHUB,
  'owner/repo@main'
);

// From local file
await installer.install(
  PluginLoadSource.LOCAL,
  './plugins/my-plugin.ts'
);
```

### Manage Installations

```typescript
// Get installed plugins
const installed = installer.getInstalledPlugins();

// Check if installed
if (installer.isInstalled('plugin-id')) {
  // ...
}

// Uninstall
await installer.uninstall('plugin-id');

// Update
await installer.update('plugin-id', newLocation);

// Toggle enable/disable
await installer.togglePlugin('plugin-id', true);
```

## 🔍 Plugin Catalog API

### Browse Plugins

```typescript
import { getPluginCatalog } from '@/lib/plugins';

const catalog = getPluginCatalog();

// Get curated plugins
const curated = catalog.getCuratedPlugins();

// Get by category
const mediaPlugins = catalog.getByCategory(PluginCategory.MEDIA);

// Featured plugins (highest rated)
const featured = catalog.getFeaturedPlugins();

// Popular plugins
const popular = catalog.getPopularPlugins(10);

// Trending plugins
const trending = catalog.getTrendingPlugins();
```

### Search Plugins

```typescript
// Search all sources
const results = await catalog.search('stripe');

// Search specific source
const npmPlugins = await catalog.search('stripe', PluginLoadSource.NPM);

// Get plugin details
const details = await catalog.getPluginDetails(
  '@apb-plugins/stripe-checkout',
  PluginLoadSource.NPM
);
```

## 🛠️ Plugin SDK

### Plugin Builder

```typescript
import { createPlugin } from '@/lib/plugins/sdk/PluginSDK';

const plugin = createPlugin()
  .setId('my-plugin')
  .setName('My Plugin')
  .setVersion('1.0.0')
  // ... more configuration ...
  .build();
```

### Block Builder

```typescript
import { createBlock } from '@/lib/plugins/sdk/PluginSDK';

const block = createBlock()
  .setName('my_block')
  .setLabel('My Block')
  .setDefaultProps({ title: '' })
  .setFields({ title: { type: 'text' } })
  .setRender(MyComponent)
  .build();
```

### Validators

```typescript
import { validators } from '@/lib/plugins/sdk/PluginSDK';

validators.isUrl(value)              // Valid URL
validators.isEmail(value)            // Valid email
validators.isApiKey(value)           // 20+ chars
validators.isRequired(value)         // Not empty
validators.minLength(10)(value)      // Min 10 chars
validators.maxLength(100)(value)     // Max 100 chars
validators.range(1, 100)(value)      // Between 1-100
validators.isJSON(value)             // Valid JSON
```

### Helper Functions

```typescript
import {
  fetchWithAuth,
  debounce,
  throttle,
} from '@/lib/plugins/sdk/PluginSDK';

// Fetch with Bearer token
const response = await fetchWithAuth(url, apiKey);

// Debounce (wait 300ms after last call)
const search = debounce(query => { /* ... */ }, 300);

// Throttle (max 1 call per 1000ms)
const scroll = throttle(() => { /* ... */ }, 1000);
```

## 📚 Documentation

- **Complete Guide:** [PLUGINS_GUIDE.md](./PLUGINS_GUIDE.md)
- **Type Definitions:** [types.ts](./types.ts)
- **Sample Plugins:** [samples/](./samples/)

## 🎯 Best Practices

1. **Always validate settings** - Users may provide incorrect credentials
2. **Use TypeScript** - Type safety prevents bugs
3. **Handle errors gracefully** - Provide clear error messages
4. **Clean up resources** - Implement `onUnload` hook
5. **Semantic versioning** - Follow semver for plugin versions
6. **Document settings** - Explain what each setting does
7. **Test thoroughly** - Test all code paths
8. **Accessibility** - Make blocks keyboard and screen-reader friendly
9. **Performance** - Use debounce/throttle for callbacks
10. **Security** - Never expose API keys in frontend code

## 🚨 Troubleshooting

### Plugin won't load

1. Check console for errors
2. Verify manifest has all required fields
3. Check plugin export: `export default plugin`
4. Review logger: `registry.getLogger().getLogs()`

### Blocks not appearing

1. Confirm plugin is registered: `registry.getPlugins()`
2. Check Puck config includes blocks
3. Verify block render component exists
4. Check block field configuration

### Settings not saving

1. Verify storage is initialized
2. Check localStorage quota (browser)
3. Ensure valid settings structure
4. Review storage errors in logger

## 📝 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

Want to create a plugin? Follow this checklist:

- [ ] Create plugin using `createPlugin()` builder
- [ ] Include manifest with all required fields
- [ ] Add TypeScript types
- [ ] Write comprehensive README
- [ ] Include example usage
- [ ] Test in browser and Node environments
- [ ] Document all settings
- [ ] Handle errors gracefully
- [ ] Add plugin to catalog (contribute PR)

## Support

For questions or issues:

1. Check [PLUGINS_GUIDE.md](./PLUGINS_GUIDE.md)
2. Review sample plugins in [samples/](./samples/)
3. Check type definitions in [types.ts](./types.ts)
4. Search GitHub issues
5. Create a new issue with details

## 📦 Plugin Template

Start a new plugin with this template:

```typescript
import { createPlugin, PluginCategory } from '@/lib/plugins';

export default createPlugin()
  .setId('my-plugin')
  .setName('My Plugin')
  .setVersion('1.0.0')
  .setDescription('What does my plugin do?')
  .setAuthor('Your Name')
  .setLicense('MIT')
  .setCategory(PluginCategory.BLOCK)
  .setKeywords(['keyword1', 'keyword2'])
  
  // Add features here
  
  .onLoad(async (context) => {
    context.logger.info('Plugin loaded');
  })
  
  .build();
```

---

**Happy plugin building! 🎉**
