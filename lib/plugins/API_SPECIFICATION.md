# Plugin System - API Specification

Complete API reference for the AI Page Builder plugin system.

## Table of Contents

1. [Types & Enums](#types--enums)
2. [Plugin Registry](#plugin-registry)
3. [Plugin Loader](#plugin-loader)
4. [Plugin Installer](#plugin-installer)
5. [Plugin Catalog](#plugin-catalog)
6. [Plugin Context](#plugin-context)
7. [SDK Helpers](#sdk-helpers)

## Types & Enums

### PluginCategory

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

### PluginLoadSource

```typescript
enum PluginLoadSource {
  LOCAL = 'local',
  NPM = 'npm',
  GITHUB = 'github',
  CUSTOM = 'custom',
}
```

### PluginEvent

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

### PluginManifest

```typescript
interface PluginManifest {
  id: string;                              // Unique identifier (required)
  name: string;                            // Display name (required)
  version: string;                         // Semantic version (required)
  description: string;                     // Brief description (required)
  author: string;                          // Plugin author (required)
  license: string;                         // License type (required)
  homepage?: string;                       // Project homepage
  repository?: string;                     // Source repository
  keywords: string[];                      // Search keywords (required)
  category: PluginCategory;                // Plugin category (required)
  requiredPeerVersions?: Record<string, string>;
  dependencies?: Record<string, string>;   // NPM dependencies
}
```

### PluginBlock

```typescript
interface PluginBlock {
  name: string;                            // Block name (required)
  label: string;                           // Display label (required)
  description: string;                     // Block description (required)
  icon?: string;                           // Icon name or emoji
  defaultProps: Record<string, any>;       // Default properties (required)
  fields: Record<string, any>;             // Puck field config (required)
  render: ComponentType<any>;              // React component (required)
  example?: Record<string, any>;           // Example data for preview
}
```

### PluginField

```typescript
interface PluginField {
  name: string;                            // Field name (required)
  type: string;                            // Field type (required)
  label: string;                           // Display label (required)
  description?: string;                    // Field description
  validate?: (value: any) => boolean | string;
  render: ComponentType<any>;              // React component (required)
  defaultValue?: any;                      // Default value
}
```

### PluginIntegration

```typescript
interface PluginIntegration {
  id: string;                              // Integration ID (required)
  name: string;                            // Display name (required)
  baseUrl?: string;                        // API base URL
  apiKey?: string;                         // API key (if applicable)
  webhookSecret?: string;                  // Webhook secret
  authenticate?: (credentials: Record<string, string>) => Promise<boolean>;
  call?: (method: string, params: Record<string, any>) => Promise<any>;
}
```

### PluginSetting

```typescript
interface PluginSetting {
  name: string;                            // Setting name (required)
  label: string;                           // Display label (required)
  description?: string;                    // Setting description
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  required?: boolean;                      // Is required
  default?: any;                           // Default value
  placeholder?: string;                    // Input placeholder
  options?: Array<{ label: string; value: any }>;
  validation?: (value: any) => boolean | string;
}
```

### Plugin

```typescript
interface Plugin {
  manifest: PluginManifest;                // Plugin metadata (required)
  
  // Lifecycle hooks
  onLoad?: (context: PluginContext) => Promise<void>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onUnload?: () => Promise<void>;

  // Plugin features
  blocks?: Record<string, PluginBlock>;
  fields?: Record<string, PluginField>;
  integrations?: Record<string, PluginIntegration>;
  middleware?: PluginMiddleware[];
  
  // Settings/config
  settings?: Record<string, PluginSetting>;
  settingsComponent?: ComponentType<PluginSettingsProps>;
}
```

### InstalledPlugin

```typescript
interface InstalledPlugin {
  id: string;                              // Plugin ID
  name: string;                            // Plugin name
  version: string;                         // Installed version
  enabled: boolean;                        // Is enabled
  source: PluginLoadSource;                // Installation source
  location: string;                        // Installation location
  installedAt: Date;                       // Installation date
  updatedAt: Date;                         // Last update date
  settings: Record<string, any>;           // Current settings
  manifest?: PluginManifest;               // Plugin manifest
}
```

## Plugin Registry

### Class: PluginRegistry

Main registry for managing all plugins.

#### Constructor

```typescript
constructor(puckConfig?: any)
```

Parameters:
- `puckConfig?` - Puck configuration object

#### Methods

##### registerPlugin

```typescript
async registerPlugin(plugin: Plugin): Promise<void>
```

Register a plugin with the registry.

**Parameters:**
- `plugin` - Plugin to register

**Throws:**
- `Error` if plugin already registered
- `Error` if plugin validation fails

**Example:**
```typescript
const registry = getPluginRegistry();
await registry.registerPlugin(myPlugin);
```

##### unregisterPlugin

```typescript
async unregisterPlugin(pluginId: string): Promise<void>
```

Unregister a plugin from the registry.

**Parameters:**
- `pluginId` - Plugin ID to unregister

**Throws:**
- `Error` if plugin not found

##### togglePlugin

```typescript
async togglePlugin(pluginId: string, enabled: boolean): Promise<void>
```

Enable or disable a plugin.

**Parameters:**
- `pluginId` - Plugin ID
- `enabled` - Enable (true) or disable (false)

**Throws:**
- `Error` if plugin not found
- `Error` if toggle fails

##### getBlocks

```typescript
getBlocks(pluginId?: string): Map<string, PluginBlock>
```

Get registered blocks.

**Parameters:**
- `pluginId?` - Filter by plugin ID

**Returns:**
- Map of block ID to block definition

##### getFields

```typescript
getFields(pluginId?: string): Map<string, PluginField>
```

Get registered fields.

**Parameters:**
- `pluginId?` - Filter by plugin ID

**Returns:**
- Map of field ID to field definition

##### getIntegrations

```typescript
getIntegrations(pluginId?: string): Map<string, PluginIntegration>
```

Get registered integrations.

**Parameters:**
- `pluginId?` - Filter by plugin ID

**Returns:**
- Map of integration ID to integration definition

##### getBlock

```typescript
getBlock(id: string): PluginBlock | undefined
```

Get a specific block.

**Parameters:**
- `id` - Block ID

**Returns:**
- Block definition or undefined

##### getField

```typescript
getField(id: string): PluginField | undefined
```

Get a specific field.

**Parameters:**
- `id` - Field ID

**Returns:**
- Field definition or undefined

##### getIntegration

```typescript
getIntegration(id: string): PluginIntegration | undefined
```

Get a specific integration.

**Parameters:**
- `id` - Integration ID

**Returns:**
- Integration definition or undefined

##### getPlugins

```typescript
getPlugins(category?: PluginCategory): Array<{
  id: string;
  manifest: PluginManifest;
  enabled: boolean;
}>
```

Get all registered plugins.

**Parameters:**
- `category?` - Filter by category

**Returns:**
- Array of plugin info

##### getPlugin

```typescript
getPlugin(pluginId: string): Plugin | undefined
```

Get a specific plugin.

**Parameters:**
- `pluginId` - Plugin ID

**Returns:**
- Plugin or undefined

##### updatePluginSettings

```typescript
async updatePluginSettings(
  pluginId: string,
  settings: Record<string, any>
): Promise<void>
```

Update plugin settings.

**Parameters:**
- `pluginId` - Plugin ID
- `settings` - New settings

**Throws:**
- `Error` if plugin not found
- `Error` if settings invalid

##### getPluginSettings

```typescript
async getPluginSettings(
  pluginId: string
): Promise<Record<string, any>>
```

Get plugin settings.

**Parameters:**
- `pluginId` - Plugin ID

**Returns:**
- Plugin settings object

##### getEventEmitter

```typescript
getEventEmitter(): EventEmitter
```

Get the event emitter.

**Returns:**
- EventEmitter instance

##### getLogger

```typescript
getLogger(): PluginLogger
```

Get the logger.

**Returns:**
- PluginLogger instance

##### getStorage

```typescript
getStorage(): PluginStorage
```

Get the storage.

**Returns:**
- PluginStorage instance

#### Singleton

```typescript
function getPluginRegistry(puckConfig?: any): PluginRegistry
```

Get or create the global registry instance.

```typescript
function resetPluginRegistry(): void
```

Reset the global registry instance.

## Plugin Loader

### Class: PluginLoader

Loads plugins from various sources.

#### Methods

##### loadPlugin

```typescript
async loadPlugin(
  source: PluginLoadSource,
  location: string
): Promise<Plugin>
```

Load a plugin from the specified source.

**Parameters:**
- `source` - Plugin source (NPM, GitHub, Local, Custom)
- `location` - Plugin location/identifier

**Returns:**
- Loaded plugin

**Throws:**
- `Error` if plugin not found
- `Error` if plugin invalid

## Plugin Installer

### Class: PluginInstaller

Manages plugin installation and lifecycle.

#### Constructor

```typescript
constructor(registry: PluginRegistry)
```

#### Methods

##### install

```typescript
async install(
  source: PluginLoadSource,
  location: string,
  onProgress?: (progress: InstallationProgress) => void
): Promise<InstalledPlugin>
```

Install a plugin.

**Parameters:**
- `source` - Plugin source
- `location` - Plugin location
- `onProgress?` - Progress callback

**Returns:**
- Installed plugin info

**Throws:**
- `Error` if already installed
- `Error` if validation fails

##### uninstall

```typescript
async uninstall(pluginId: string): Promise<void>
```

Uninstall a plugin.

**Parameters:**
- `pluginId` - Plugin ID

**Throws:**
- `Error` if not installed

##### update

```typescript
async update(
  pluginId: string,
  newLocation: string,
  onProgress?: (progress: InstallationProgress) => void
): Promise<InstalledPlugin>
```

Update a plugin to a new version.

**Parameters:**
- `pluginId` - Plugin ID
- `newLocation` - New plugin location
- `onProgress?` - Progress callback

**Returns:**
- Updated plugin info

##### getInstalledPlugins

```typescript
getInstalledPlugins(): InstalledPlugin[]
```

Get all installed plugins.

**Returns:**
- Array of installed plugins

##### getInstalledPlugin

```typescript
getInstalledPlugin(pluginId: string): InstalledPlugin | undefined
```

Get a specific installed plugin.

**Parameters:**
- `pluginId` - Plugin ID

**Returns:**
- Installed plugin info or undefined

##### isInstalled

```typescript
isInstalled(pluginId: string): boolean
```

Check if a plugin is installed.

**Parameters:**
- `pluginId` - Plugin ID

**Returns:**
- true if installed, false otherwise

##### togglePlugin

```typescript
async togglePlugin(pluginId: string, enabled: boolean): Promise<void>
```

Enable or disable an installed plugin.

**Parameters:**
- `pluginId` - Plugin ID
- `enabled` - Enable or disable

**Throws:**
- `Error` if not installed

## Plugin Catalog

### Class: PluginCatalog

Discover and list available plugins.

#### Methods

##### getCuratedPlugins

```typescript
getCuratedPlugins(): PluginPackageInfo[]
```

Get all curated plugins.

**Returns:**
- Array of curated plugins

##### getByCategory

```typescript
getByCategory(category: PluginCategory): PluginPackageInfo[]
```

Get plugins by category.

**Parameters:**
- `category` - Plugin category

**Returns:**
- Array of plugins in category

##### search

```typescript
async search(
  query: string,
  source?: PluginLoadSource
): Promise<PluginPackageInfo[]>
```

Search for plugins.

**Parameters:**
- `query` - Search query
- `source?` - Limit to source (NPM, GitHub, etc.)

**Returns:**
- Array of matching plugins

##### getPluginDetails

```typescript
async getPluginDetails(
  pluginId: string,
  source: PluginLoadSource
): Promise<PluginPackageInfo | null>
```

Get plugin details.

**Parameters:**
- `pluginId` - Plugin ID
- `source` - Plugin source

**Returns:**
- Plugin details or null

##### getFeaturedPlugins

```typescript
getFeaturedPlugins(): PluginPackageInfo[]
```

Get featured plugins (highest rated).

**Returns:**
- Array of featured plugins

##### getPopularPlugins

```typescript
getPopularPlugins(limit?: number): PluginPackageInfo[]
```

Get popular plugins by download count.

**Parameters:**
- `limit?` - Maximum results (default: 10)

**Returns:**
- Array of popular plugins

##### getTrendingPlugins

```typescript
getTrendingPlugins(): PluginPackageInfo[]
```

Get trending plugins.

**Returns:**
- Array of trending plugins

#### Singleton

```typescript
function getPluginCatalog(): PluginCatalog
```

Get or create the global catalog instance.

## Plugin Context

Interface provided to plugins during initialization.

### PluginContext

```typescript
interface PluginContext {
  // Core APIs
  puckConfig: any;
  logger: IPluginLogger;
  storage: IPluginStorage;
  
  // Registration
  registerBlock: (id: string, block: PluginBlock) => void;
  registerField: (id: string, field: PluginField) => void;
  registerIntegration: (id: string, integration: PluginIntegration) => void;
  
  // Events
  on: (event: PluginEvent, handler: (...args) => void) => void;
  off: (event: PluginEvent, handler: (...args) => void) => void;
  emit: (event: PluginEvent, ...args) => void;
  
  // Version info
  builderVersion: string;
}
```

## SDK Helpers

### Plugin Builder

```typescript
class PluginBuilder {
  setManifest(manifest: Partial<PluginManifest>): this
  setId(id: string): this
  setName(name: string): this
  setVersion(version: string): this
  setDescription(description: string): this
  setAuthor(author: string): this
  setCategory(category: PluginCategory): this
  setLicense(license: string): this
  setKeywords(keywords: string[]): this
  setHomepage(homepage: string): this
  setRepository(repository: string): this
  setDependencies(dependencies: Record<string, string>): this
  addBlock(id: string, block: PluginBlock): this
  addField(id: string, field: PluginField): this
  addIntegration(id: string, integration: PluginIntegration): this
  addSetting(id: string, setting: PluginSetting): this
  onLoad(handler: (context: PluginContext) => Promise<void>): this
  onActivate(handler: () => Promise<void>): this
  onDeactivate(handler: () => Promise<void>): this
  onUnload(handler: () => Promise<void>): this
  build(): Plugin
}

function createPlugin(): PluginBuilder
```

### Block Builder

```typescript
class BlockBuilder {
  setName(name: string): this
  setLabel(label: string): this
  setDescription(description: string): this
  setIcon(icon: string): this
  setDefaultProps(props: Record<string, any>): this
  setFields(fields: Record<string, any>): this
  setRender(component: ComponentType<any>): this
  setExample(example: Record<string, any>): this
  build(): PluginBlock
}

function createBlock(): BlockBuilder
```

### Integration Builder

```typescript
class IntegrationBuilder {
  setId(id: string): this
  setName(name: string): this
  setBaseUrl(baseUrl: string): this
  setApiKey(apiKey: string): this
  setWebhookSecret(secret: string): this
  setAuthenticate(handler: (credentials) => Promise<boolean>): this
  setCall(handler: (method, params) => Promise<any>): this
  build(): PluginIntegration
}

function createIntegration(): IntegrationBuilder
```

### Validators

```typescript
const validators = {
  isUrl: (value: any) => boolean | string
  isEmail: (value: any) => boolean | string
  isApiKey: (value: any) => boolean | string
  isRequired: (value: any) => boolean | string
  minLength: (min: number) => (value: any) => boolean | string
  maxLength: (max: number) => (value: any) => boolean | string
  range: (min: number, max: number) => (value: any) => boolean | string
  isJSON: (value: any) => boolean | string
}
```

### Helper Functions

```typescript
async function fetchWithAuth(
  url: string,
  apiKey: string,
  options?: RequestInit
): Promise<Response>

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void

function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void
```

---

This specification covers all public APIs of the plugin system. For implementation details, see the source files.
