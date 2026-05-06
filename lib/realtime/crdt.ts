/**
 * CRDT (Conflict-free Replicated Data Type) Integration
 * 
 * Uses Yjs for automatic conflict resolution during concurrent edits.
 * Multiple editors can edit simultaneously without locking.
 * Follows Sanity's approach to multiplayer editing.
 */

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';

// ============================================
// Types
// ============================================

export interface CRDTDocument {
  data: Y.Map<any>;
  metadata: Y.Map<any>;
  blocks: Y.Array<Y.Map<any>>;
  awareness: any; // For presence tracking
}

export interface RemoteUpdate {
  update: Uint8Array;
  origin: string;
}

// ============================================
// Document Store (Browser-side)
// ============================================

export class CRDTPageDocument {
  private ydoc: Y.Doc;
  private data: Y.Map<any>;
  private metadata: Y.Map<any>;
  private blocks: Y.Array<Y.Map<any>>;
  private awareness: any;
  private provider: WebsocketProvider | null = null;
  private pageId: string;
  private userId: string;

  constructor(pageId: string, userId: string, userName: string) {
    this.pageId = pageId;
    this.userId = userId;

    // Initialize Yjs document
    this.ydoc = new Y.Doc();

    // Create shared types
    this.data = this.ydoc.getMap('data');
    this.metadata = this.ydoc.getMap('metadata');
    this.blocks = this.ydoc.getArray('blocks');
    this.awareness = this.ydoc.awareness;

    // Set up persistence (IndexedDB)
    this._setupPersistence();

    // Update awareness (presence)
    this.awareness.setLocalState({
      user: {
        name: userName,
        color: this._generateUserColor(),
      },
      cursor: null,
    });
  }

  /**
   * Setup persistence to IndexedDB
   */
  private _setupPersistence() {
    if (typeof window !== 'undefined') {
      new IndexeddbPersistence(`page-${this.pageId}`, this.ydoc);
    }
  }

  /**
   * Connect to WebSocket provider for real-time sync
   */
  connectWebSocket(wsUrl: string): void {
    this.provider = new WebsocketProvider(
      wsUrl,
      `page:${this.pageId}`,
      this.ydoc,
      {
        awareness: this.awareness,
        resyncInterval: 5000,
      }
    );

    // Handle connection events
    this.provider.on('sync', (isSynced: boolean) => {
      console.log('Synced with server:', isSynced);
    });

    this.provider.on('connection-error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }
  }

  /**
   * Insert a block at index
   */
  insertBlock(index: number, block: any): void {
    const yblock = new Y.Map();

    Object.entries(block).forEach(([key, value]) => {
      yblock.set(key, value);
    });

    this.blocks.insert(index, [yblock]);
  }

  /**
   * Update a block's field
   */
  updateBlock(blockId: string, path: string[], newValue: any): void {
    // Find block by ID
    let targetBlock: Y.Map<any> | null = null;

    this.blocks.forEach((block) => {
      if (block.get('id') === blockId) {
        targetBlock = block;
      }
    });

    if (!targetBlock) return;

    // Navigate to nested path and update
    let current = targetBlock;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!current.has(key)) {
        current.set(key, new Y.Map());
      }
      current = current.get(key);
    }

    const lastKey = path[path.length - 1];
    current.set(lastKey, newValue);
  }

  /**
   * Delete a block
   */
  deleteBlock(blockId: string): void {
    let targetIndex = -1;

    this.blocks.forEach((block, index) => {
      if (block.get('id') === blockId) {
        targetIndex = index;
      }
    });

    if (targetIndex >= 0) {
      this.blocks.delete(targetIndex, 1);
    }
  }

  /**
   * Move a block to a new position
   */
  moveBlock(blockId: string, newIndex: number): void {
    let sourceIndex = -1;

    this.blocks.forEach((block, index) => {
      if (block.get('id') === blockId) {
        sourceIndex = index;
      }
    });

    if (sourceIndex >= 0) {
      const block = this.blocks.get(sourceIndex);
      this.blocks.delete(sourceIndex);
      this.blocks.insert(newIndex, [block]);
    }
  }

  /**
   * Update page metadata
   */
  updateMetadata(path: string[], newValue: any): void {
    let current = this.metadata;

    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!current.has(key)) {
        current.set(key, new Y.Map());
      }
      current = current.get(key);
    }

    const lastKey = path[path.length - 1];
    current.set(lastKey, newValue);
  }

  /**
   * Get current document state
   */
  getState(): any {
    return {
      data: this.data.toJSON(),
      metadata: this.metadata.toJSON(),
      blocks: this.blocks.map((block) => block.toJSON()),
    };
  }

  /**
   * Subscribe to document changes
   */
  onChange(callback: (state: any) => void): () => void {
    const observer = () => {
      callback(this.getState());
    };

    this.ydoc.on('update', observer);

    return () => {
      this.ydoc.off('update', observer);
    };
  }

  /**
   * Subscribe to awareness changes (presence)
   */
  onPresenceChange(callback: (awareness: any) => void): () => void {
    const observer = () => {
      callback(this.awareness.getStates());
    };

    this.awareness.on('change', observer);

    return () => {
      this.awareness.off('change', observer);
    };
  }

  /**
   * Update cursor position for presence
   */
  updateCursor(blockId: string, path: string, position: number): void {
    this.awareness.setLocalState({
      ...this.awareness.getLocalState(),
      cursor: {
        blockId,
        path,
        position,
      },
    });
  }

  /**
   * Export document state to JSON
   */
  toJSON(): any {
    return {
      data: this.data.toJSON(),
      metadata: this.metadata.toJSON(),
      blocks: this.blocks.toArray().map((block) => block.toJSON()),
    };
  }

  /**
   * Import document state from JSON
   */
  fromJSON(json: any): void {
    const transaction = this.ydoc.transact(() => {
      // Clear existing
      this.data.clear();
      this.metadata.clear();
      this.blocks.clear();

      // Load new
      if (json.data) {
        Object.entries(json.data).forEach(([key, value]) => {
          this.data.set(key, value);
        });
      }

      if (json.metadata) {
        Object.entries(json.metadata).forEach(([key, value]) => {
          this.metadata.set(key, value);
        });
      }

      if (json.blocks && Array.isArray(json.blocks)) {
        json.blocks.forEach((blockData: any) => {
          const yblock = new Y.Map();
          Object.entries(blockData).forEach(([key, value]) => {
            yblock.set(key, value);
          });
          this.blocks.push([yblock]);
        });
      }
    });
  }

  /**
   * Get update (for sending to other clients)
   */
  getUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc);
  }

  /**
   * Apply update from other client
   */
  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.ydoc, update, 'remote');
  }

  /**
   * Get diff since state vector
   */
  getDiff(stateVector: Uint8Array): Uint8Array {
    return Y.encodeDiffUpdate(this.ydoc, stateVector);
  }

  private _generateUserColor(): string {
    const colors = [
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#f7b731',
      '#5f27cd',
      '#00d2d3',
      '#ff9ff3',
      '#54a0ff',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// ============================================
// Server-side CRDT Manager
// ============================================

export class CRDTServerManager {
  private documents = new Map<string, Y.Doc>();
  private subscriptions = new Map<string, Set<(update: any) => void>>();

  /**
   * Get or create document for page
   */
  getDocument(pageId: string): Y.Doc {
    if (!this.documents.has(pageId)) {
      this.documents.set(pageId, new Y.Doc());
    }
    return this.documents.get(pageId)!;
  }

  /**
   * Apply update from client
   */
  applyUpdate(pageId: string, update: Uint8Array, userId: string): void {
    const doc = this.getDocument(pageId);
    Y.applyUpdate(doc, update, userId);

    // Notify all other subscribers
    const subscribers = this.subscriptions.get(pageId) || new Set();
    subscribers.forEach((callback) => {
      callback({
        update,
        userId,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Subscribe to document updates
   */
  subscribe(pageId: string, callback: (update: any) => void): () => void {
    if (!this.subscriptions.has(pageId)) {
      this.subscriptions.set(pageId, new Set());
    }

    const subs = this.subscriptions.get(pageId)!;
    subs.add(callback);

    return () => {
      subs.delete(callback);
      if (subs.size === 0) {
        this.subscriptions.delete(pageId);
      }
    };
  }

  /**
   * Get current state
   */
  getState(pageId: string): any {
    const doc = this.getDocument(pageId);
    return {
      update: Y.encodeStateAsUpdate(doc),
      stateVector: Y.encodeStateVector(doc),
    };
  }

  /**
   * Cleanup document (e.g., when all clients disconnect)
   */
  cleanup(pageId: string): void {
    const doc = this.documents.get(pageId);
    if (doc) {
      doc.destroy();
      this.documents.delete(pageId);
    }
    this.subscriptions.delete(pageId);
  }
}

export const crdtManager = new CRDTServerManager();
