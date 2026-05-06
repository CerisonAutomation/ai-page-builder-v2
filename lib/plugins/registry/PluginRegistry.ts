/**
 * Plugin Registry - Central registry for managing all plugins
 */

import {
  Plugin,
  PluginBlock,
  PluginField,
  PluginIntegration,
  PluginContext,
  PluginEvent,
  PluginCategory,
} from '../types';
import { PluginLogger } from './PluginLogger';
import { PluginStorage } from './PluginStorage';
import { EventEmitter } from '../utils/EventEmitter';

interface PluginEntry {
  id: string;
  plugin: Plugin;
  enabled: boolean;
  version: string;
}

export class PluginRegistry {
  private plugins: Map<string, PluginEntry> = new Map();
  private blocks: Map<string, PluginBlock> = new Map();
  private fields: Map<string, PluginField> = new Map();
  private integrations: Map<string, PluginIntegration> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private logger: PluginLogger;
  private storage: PluginStorage;
  private puckConfig: any;
  private builderVersion: string = '1.0.0';

  constructor(puckConfig?: any) {
    this.logger = new PluginLogger();
    this.storage = new PluginStorage();
    this.puckConfig = puckConfig || {};
  }

  /**
   * Register a plugin with the registry
   */
  async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.manifest.id)) {
      throw new Error(
        `Plugin "${plugin.manifest.id}" is already registered`
      );
    }

    const context = this.createPluginContext(plugin);

    try {
      // Call plugin load hook
      if (plugin.onLoad) {
        await plugin.onLoad(context);
      }

      // Register blocks
      if (plugin.blocks) {
        for (const [id, block] of Object.entries(plugin.blocks)) {
          this.registerBlock(`${plugin.manifest.id}:${id}`, block);
        }
      }

      // Register fields
      if (plugin.fields) {
        for (const [id, field] of Object.entries(plugin.fields)) {
          this.registerField(`${plugin.manifest.id}:${id}`, field);
        }
      }

      // Register integrations
      if (plugin.integrations) {
        for (const [id, integration] of Object.entries(plugin.integrations)) {
          this.registerIntegration(`${plugin.manifest.id}:${id}`, integration);
        }
      }

      // Store plugin entry
      this.plugins.set(plugin.manifest.id, {
        id: plugin.manifest.id,
        plugin,
        enabled: true,
        version: plugin.manifest.version,
      });

      this.logger.info(`Plugin registered: ${plugin.manifest.id}`);
    } catch (error) {
      this.logger.error(`Failed to register plugin: ${plugin.manifest.id}`, error);
      throw error;
    }
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    try {
      // Call plugin unload hook
      if (entry.plugin.onUnload) {
        await entry.plugin.onUnload();
      }

      // Remove blocks
      const blockPrefix = `${pluginId}:`;
      for (const [id] of this.blocks) {
        if (id.startsWith(blockPrefix)) {
          this.blocks.delete(id);
        }
      }

      // Remove fields
      for (const [id] of this.fields) {
        if (id.startsWith(blockPrefix)) {
          this.fields.delete(id);
        }
      }

      // Remove integrations
      for (const [id] of this.integrations) {
        if (id.startsWith(blockPrefix)) {
          this.integrations.delete(id);
        }
      }

      this.plugins.delete(pluginId);
      this.logger.info(`Plugin unregistered: ${pluginId}`);
    } catch (error) {
      this.logger.error(`Failed to unregister plugin: ${pluginId}`, error);
      throw error;
    }
  }

  /**
   * Enable/disable a plugin
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    try {
      if (enabled && !entry.enabled) {
        if (entry.plugin.onActivate) {
          await entry.plugin.onActivate();
        }
        entry.enabled = true;
        this.logger.info(`Plugin activated: ${pluginId}`);
      } else if (!enabled && entry.enabled) {
        if (entry.plugin.onDeactivate) {
          await entry.plugin.onDeactivate();
        }
        entry.enabled = false;
        this.logger.info(`Plugin deactivated: ${pluginId}`);
      }

      // Persist state
      await this.storage.set(`plugin:${pluginId}:enabled`, enabled);
    } catch (error) {
      this.logger.error(`Failed to toggle plugin: ${pluginId}`, error);
      throw error;
    }
  }

  /**
   * Register a block from a plugin
   */
  private registerBlock(id: string, block: PluginBlock): void {
    this.blocks.set(id, block);
    this.logger.debug(`Block registered: ${id}`);
  }

  /**
   * Register a field from a plugin
   */
  private registerField(id: string, field: PluginField): void {
    this.fields.set(id, field);
    this.logger.debug(`Field registered: ${id}`);
  }

  /**
   * Register an integration from a plugin
   */
  private registerIntegration(id: string, integration: PluginIntegration): void {
    this.integrations.set(id, integration);
    this.logger.debug(`Integration registered: ${id}`);
  }

  /**
   * Get all registered blocks
   */
  getBlocks(pluginId?: string): Map<string, PluginBlock> {
    if (!pluginId) {
      return new Map(this.blocks);
    }

    const result = new Map<string, PluginBlock>();
    const prefix = `${pluginId}:`;
    for (const [id, block] of this.blocks) {
      if (id.startsWith(prefix)) {
        result.set(id, block);
      }
    }
    return result;
  }

  /**
   * Get all registered fields
   */
  getFields(pluginId?: string): Map<string, PluginField> {
    if (!pluginId) {
      return new Map(this.fields);
    }

    const result = new Map<string, PluginField>();
    const prefix = `${pluginId}:`;
    for (const [id, field] of this.fields) {
      if (id.startsWith(prefix)) {
        result.set(id, field);
      }
    }
    return result;
  }

  /**
   * Get all registered integrations
   */
  getIntegrations(pluginId?: string): Map<string, PluginIntegration> {
    if (!pluginId) {
      return new Map(this.integrations);
    }

    const result = new Map<string, PluginIntegration>();
    const prefix = `${pluginId}:`;
    for (const [id, integration] of this.integrations) {
      if (id.startsWith(prefix)) {
        result.set(id, integration);
      }
    }
    return result;
  }

  /**
   * Get a specific block
   */
  getBlock(id: string): PluginBlock | undefined {
    return this.blocks.get(id);
  }

  /**
   * Get a specific field
   */
  getField(id: string): PluginField | undefined {
    return this.fields.get(id);
  }

  /**
   * Get a specific integration
   */
  getIntegration(id: string): PluginIntegration | undefined {
    return this.integrations.get(id);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(category?: PluginCategory): Array<{
    id: string;
    manifest: any;
    enabled: boolean;
  }> {
    const result = [];
    for (const entry of this.plugins.values()) {
      if (!category || entry.plugin.manifest.category === category) {
        result.push({
          id: entry.id,
          manifest: entry.plugin.manifest,
          enabled: entry.enabled,
        });
      }
    }
    return result;
  }

  /**
   * Get a specific plugin
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)?.plugin;
  }

  /**
   * Update plugin settings
   */
  async updatePluginSettings(
    pluginId: string,
    settings: Record<string, any>
  ): Promise<void> {
    const entry = this.plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    await this.storage.set(`plugin:${pluginId}:settings`, settings);
    this.eventEmitter.emit(PluginEvent.SETTINGS_CHANGED, {
      pluginId,
      settings,
    });
  }

  /**
   * Get plugin settings
   */
  async getPluginSettings(pluginId: string): Promise<Record<string, any>> {
    return (
      (await this.storage.get(`plugin:${pluginId}:settings`)) || {}
    );
  }

  /**
   * Create plugin context for initialization
   */
  private createPluginContext(plugin: Plugin): PluginContext {
    return {
      puckConfig: this.puckConfig,
      logger: this.logger,
      storage: this.storage,
      builderVersion: this.builderVersion,

      registerBlock: (id: string, block: PluginBlock) => {
        this.registerBlock(`${plugin.manifest.id}:${id}`, block);
      },

      registerField: (id: string, field: PluginField) => {
        this.registerField(`${plugin.manifest.id}:${id}`, field);
      },

      registerIntegration: (id: string, integration: PluginIntegration) => {
        this.registerIntegration(`${plugin.manifest.id}:${id}`, integration);
      },

      on: (event: PluginEvent, handler: (...args: any[]) => void) => {
        this.eventEmitter.on(event, handler);
      },

      off: (event: PluginEvent, handler: (...args: any[]) => void) => {
        this.eventEmitter.off(event, handler);
      },

      emit: (event: PluginEvent, ...args: any[]) => {
        this.eventEmitter.emit(event, ...args);
      },
    };
  }

  /**
   * Get event emitter for external event listening
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Get logger
   */
  getLogger(): PluginLogger {
    return this.logger;
  }

  /**
   * Get storage
   */
  getStorage(): PluginStorage {
    return this.storage;
  }
}

// Singleton instance
let registryInstance: PluginRegistry;

export function getPluginRegistry(
  puckConfig?: any
): PluginRegistry {
  if (!registryInstance) {
    registryInstance = new PluginRegistry(puckConfig);
  }
  return registryInstance;
}

export function resetPluginRegistry(): void {
  registryInstance = null as any;
}
