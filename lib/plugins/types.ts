/**
 * AI Page Builder - Plugin System Types
 * Defines core plugin interfaces and types for extensibility
 */

import { ComponentType } from 'react';

/**
 * Plugin metadata for registry and discovery
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage?: string;
  repository?: string;
  keywords: string[];
  category: PluginCategory;
  requiredPeerVersions?: {
    'ai-page-builder'?: string;
  };
  dependencies?: Record<string, string>;
}

/**
 * Plugin categories for filtering and organization
 */
export enum PluginCategory {
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

/**
 * Plugin block definition - extends Puck with custom blocks
 */
export interface PluginBlock {
  name: string;
  label: string;
  description: string;
  icon?: string;
  defaultProps: Record<string, any>;
  fields: Record<string, any>; // Puck field config
  render: ComponentType<any>;
  example?: Record<string, any>;
}

/**
 * Plugin field definition - custom field types
 */
export interface PluginField {
  name: string;
  type: string;
  label: string;
  description?: string;
  validate?: (value: any) => boolean | string;
  render: ComponentType<any>;
  defaultValue?: any;
}

/**
 * Plugin integration - backend APIs, webhooks, services
 */
export interface PluginIntegration {
  id: string;
  name: string;
  baseUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
  authenticate?: (credentials: Record<string, string>) => Promise<boolean>;
  call?: (method: string, params: Record<string, any>) => Promise<any>;
}

/**
 * Core plugin interface
 */
export interface Plugin {
  manifest: PluginManifest;
  
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

/**
 * Plugin context - provided to plugin during initialization
 */
export interface PluginContext {
  // Core APIs
  puckConfig: any;
  logger: IPluginLogger;
  storage: IPluginStorage;
  
  // Plugin registry access
  registerBlock: (id: string, block: PluginBlock) => void;
  registerField: (id: string, field: PluginField) => void;
  registerIntegration: (id: string, integration: PluginIntegration) => void;
  
  // Event system
  on: (event: PluginEvent, handler: (...args: any[]) => void) => void;
  off: (event: PluginEvent, handler: (...args: any[]) => void) => void;
  emit: (event: PluginEvent, ...args: any[]) => void;
  
  // Version info
  builderVersion: string;
}

/**
 * Plugin events that can be hooked
 */
export enum PluginEvent {
  PAGE_CREATED = 'page:created',
  PAGE_UPDATED = 'page:updated',
  PAGE_DELETED = 'page:deleted',
  BLOCK_RENDERED = 'block:rendered',
  BLOCK_CHANGED = 'block:changed',
  SETTINGS_CHANGED = 'settings:changed',
}

/**
 * Plugin middleware for request/response interception
 */
export interface PluginMiddleware {
  name: string;
  match?: (method: string, path: string) => boolean;
  onRequest?: (req: any) => Promise<any>;
  onResponse?: (res: any) => Promise<any>;
  onError?: (error: any) => Promise<void>;
}

/**
 * Plugin setting for configuration UI
 */
export interface PluginSetting {
  name: string;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  required?: boolean;
  default?: any;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: (value: any) => boolean | string;
}

/**
 * Plugin settings component props
 */
export interface PluginSettingsProps {
  settings: Record<string, any>;
  onSettingsChange: (settings: Record<string, any>) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Plugin logger interface
 */
export interface IPluginLogger {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
}

/**
 * Plugin storage interface for persisting plugin data
 */
export interface IPluginStorage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

/**
 * Plugin load source
 */
export enum PluginLoadSource {
  LOCAL = 'local',
  NPM = 'npm',
  GITHUB = 'github',
  CUSTOM = 'custom',
}

/**
 * Plugin package info from registry
 */
export interface PluginPackageInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  downloads?: number;
  rating?: number;
  tags: string[];
  repositoryUrl?: string;
  packageUrl?: string;
  source: PluginLoadSource;
  manifest?: PluginManifest;
}

/**
 * Installed plugin info
 */
export interface InstalledPlugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  source: PluginLoadSource;
  location: string;
  installedAt: Date;
  updatedAt: Date;
  settings: Record<string, any>;
  manifest?: PluginManifest;
}
