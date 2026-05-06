/**
 * Plugin System - Main entry point
 */

// Types
export * from './types';

// Registry
export { PluginRegistry, getPluginRegistry, resetPluginRegistry } from './registry/PluginRegistry';
export { PluginLogger } from './registry/PluginLogger';
export { PluginStorage } from './registry/PluginStorage';

// Loaders
export { PluginLoader } from './loaders/PluginLoader';
export { LocalPluginLoader } from './loaders/LocalPluginLoader';
export { NpmPluginLoader } from './loaders/NpmPluginLoader';
export { GithubPluginLoader } from './loaders/GithubPluginLoader';

// Catalog
export { PluginCatalog, getPluginCatalog } from './catalog/PluginCatalog';

// Installer
export { PluginInstaller } from './installer/PluginInstaller';

// SDK
export {
  PluginBuilder,
  BlockBuilder,
  IntegrationBuilder,
  createPlugin,
  createBlock,
  createIntegration,
  validators,
  fetchWithAuth,
  debounce,
  throttle,
} from './sdk/PluginSDK';

// Utilities
export { EventEmitter } from './utils/EventEmitter';

// Sample Plugins - Commented out, implement as needed
// export { unsplashPlugin, createUnsplashPluginWithBuilder } from './samples/UnsplashPlugin';
// export { shopifyPlugin } from './samples/ShopifyPlugin';
// export { stripePlugin } from './samples/StripePlugin';
