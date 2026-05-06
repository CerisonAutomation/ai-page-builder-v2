/**
 * Plugin Storage - Persistent storage for plugin data
 */

import { logger } from '@/lib/utils/logger';
import { IPluginStorage } from '../types';

type StorageBackend = 'memory' | 'localStorage' | 'custom';

interface StorageItem {
  key: string;
  value: any;
  expiredAt?: number;
}

export class PluginStorage implements IPluginStorage {
  private data: Map<string, any> = new Map();
  private backend: StorageBackend;
  private prefix: string = 'plugin:';

  constructor(backend: StorageBackend = 'memory', prefix?: string) {
    this.backend = backend;
    if (prefix) {
      this.prefix = prefix;
    }
    this.initialize();
  }

  private initialize(): void {
    if (this.backend === 'localStorage' && typeof window !== 'undefined') {
      // Load from localStorage
      try {
        const stored = localStorage.getItem('__plugin_storage__');
        if (stored) {
          const items = JSON.parse(stored) as StorageItem[];
          for (const item of items) {
            if (!item.expiredAt || item.expiredAt > Date.now()) {
              this.data.set(item.key, item.value);
            }
          }
        }
      } catch (error) {
        logger.warn("Failed to load plugin storage from localStorage", error);
      }
    }
  }

  async get(key: string): Promise<any> {
    const fullKey = this.getFullKey(key);
    return this.data.get(fullKey);
  }

  async set(key: string, value: any): Promise<void> {
    const fullKey = this.getFullKey(key);
    this.data.set(fullKey, value);
    await this.persist();
  }

  async remove(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    this.data.delete(fullKey);
    await this.persist();
  }

  async clear(): Promise<void> {
    // Only clear plugin-prefixed keys
    for (const [key] of this.data) {
      if (key.startsWith(this.prefix)) {
        this.data.delete(key);
      }
    }
    await this.persist();
  }

  /**
   * Set value with expiration
   */
  async setWithExpiry(
    key: string,
    value: any,
    ttlMs: number
  ): Promise<void> {
    const fullKey = this.getFullKey(key);
    const item = {
      value,
      expiredAt: Date.now() + ttlMs,
    };
    this.data.set(fullKey, item);
    await this.persist();
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (const key of this.data.keys()) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }

  /**
   * Get all entries
   */
  async entries(): Promise<Array<[string, any]>> {
    const entries: Array<[string, any]> = [];
    for (const [key, value] of this.data) {
      if (key.startsWith(this.prefix)) {
        entries.push([key.substring(this.prefix.length), value]);
      }
    }
    return entries;
  }

  /**
   * Persist to backend
   */
  private async persist(): Promise<void> {
    if (this.backend === 'localStorage' && typeof window !== 'undefined') {
      try {
        const items: StorageItem[] = Array.from(this.data).map(([key, value]) => ({
          key,
          value,
        }));
        localStorage.setItem('__plugin_storage__', JSON.stringify(items));
      } catch (error) {
        logger.warn("Failed to persist plugin storage to localStorage", error);
      }
    }
  }

  /**
   * Get full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
