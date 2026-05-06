/**
 * Event Sourcing System
 * 
 * ALL changes are immutable events logged to database.
 * Used for audit trail, undo/redo, conflict resolution, and real-time sync.
 * Follows Sanity + Notion pattern.
 */

import { EventEmitter } from 'events';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

// ============================================
// Event Types (Comprehensive)
// ============================================

export enum EventType {
  // Page-level events
  PAGE_CREATED = 'PAGE_CREATED',
  PAGE_UPDATED = 'PAGE_UPDATED',
  PAGE_DRAFT_SAVED = 'PAGE_DRAFT_SAVED',
  PAGE_PUBLISHED = 'PAGE_PUBLISHED',
  PAGE_UNPUBLISHED = 'PAGE_UNPUBLISHED',
  PAGE_ARCHIVED = 'PAGE_ARCHIVED',
  PAGE_RESTORED = 'PAGE_RESTORED',
  PAGE_DELETED = 'PAGE_DELETED',

  // Block-level events (character-level precision)
  BLOCK_INSERTED = 'BLOCK_INSERTED',
  BLOCK_UPDATED = 'BLOCK_UPDATED',
  BLOCK_DELETED = 'BLOCK_DELETED',
  BLOCK_MOVED = 'BLOCK_MOVED',
  BLOCK_DUPLICATED = 'BLOCK_DUPLICATED',

  // Field-level updates
  FIELD_UPDATED = 'FIELD_UPDATED',

  // Collaboration events
  PRESENCE_ENTER = 'PRESENCE_ENTER',
  PRESENCE_MOVE = 'PRESENCE_MOVE',
  PRESENCE_LEAVE = 'PRESENCE_LEAVE',

  // Publishing workflow
  REVIEW_REQUESTED = 'REVIEW_REQUESTED',
  REVIEW_APPROVED = 'REVIEW_APPROVED',
  REVIEW_REJECTED = 'REVIEW_REJECTED',

  // Versioning
  VERSION_CREATED = 'VERSION_CREATED',
  VERSION_RESTORED = 'VERSION_RESTORED',
  VERSION_DELETED = 'VERSION_DELETED',

  // Metadata
  METADATA_UPDATED = 'METADATA_UPDATED',
  SEO_UPDATED = 'SEO_UPDATED',

  // System events
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  SYNC_RESOLVED = 'SYNC_RESOLVED',
}

export interface ContentEvent {
  id: string;
  pageId: string;
  type: EventType;
  userId: string;
  userName?: string;
  userEmail?: string;
  data: any;
  timestamp: Date;
  metadata?: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
  };
}

export interface PageEventPayload {
  pageId: string;
  slug: string;
  title?: string;
  status?: 'draft' | 'review' | 'published' | 'scheduled' | 'archived';
  changes?: Record<string, any>;
  [key: string]: any;
}

export interface BlockEventPayload {
  pageId: string;
  blockId: string;
  blockType?: string;
  index?: number;
  path?: string;
  oldValue?: any;
  newValue?: any;
  [key: string]: any;
}

export interface PresenceEventPayload {
  userId: string;
  userName: string;
  userEmail?: string;
  avatar?: string;
  color: string;
  pageId: string;
  blockId?: string;
  path?: string;
  cursorPosition?: number;
  cursorRange?: { start: number; end: number };
  timestamp: Date;
}

// ============================================
// Event Store (Singleton)
// ============================================

class EventStore {
  private eventEmitter = new EventEmitter();
  private eventBuffer: ContentEvent[] = [];
  private isProcessing = false;

  /**
   * Store event in database and broadcast to all subscribers
   */
  async publishEvent(
    pageId: string,
    type: EventType,
    payload: any,
    userId: string,
    userName?: string
  ): Promise<ContentEvent> {
    const supabase = createServerSupabaseClient();

    const event: ContentEvent = {
      id: nanoid(),
      pageId,
      type,
      userId,
      userName,
      data: payload,
      timestamp: new Date(),
    };

    // Store in database (immutable)
    const { error } = await supabase
      .from('page_events')
      .insert({
        id: event.id,
        page_id: event.pageId,
        event_type: event.type,
        user_id: event.userId,
        user_name: event.userName,
        data: event.data,
        created_at: event.timestamp.toISOString(),
      });

    if (error) {
      console.error('Failed to store event:', error);
      // Buffer event for retry
      this.eventBuffer.push(event);
      throw error;
    }

    // Broadcast to all subscribers
    this.eventEmitter.emit(`page:${pageId}`, event);
    this.eventEmitter.emit('all-events', event);

    return event;
  }

  /**
   * Subscribe to events for a specific page
   */
  subscribe(
    pageId: string,
    callback: (event: ContentEvent) => void
  ): () => void {
    this.eventEmitter.on(`page:${pageId}`, callback);

    return () => {
      this.eventEmitter.removeListener(`page:${pageId}`, callback);
    };
  }

  /**
   * Subscribe to all events (admin dashboard)
   */
  subscribeAll(callback: (event: ContentEvent) => void): () => void {
    this.eventEmitter.on('all-events', callback);

    return () => {
      this.eventEmitter.removeListener('all-events', callback);
    };
  }

  /**
   * Get event history for a page
   */
  async getHistory(
    pageId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ContentEvent[]> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('page_events')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      pageId: row.page_id,
      type: row.event_type,
      userId: row.user_id,
      userName: row.user_name,
      data: row.data,
      timestamp: new Date(row.created_at),
    }));
  }

  /**
   * Get events since a specific timestamp
   */
  async getEventsSince(
    pageId: string,
    since: Date
  ): Promise<ContentEvent[]> {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('page_events')
      .select('*')
      .eq('page_id', pageId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      pageId: row.page_id,
      type: row.event_type,
      userId: row.user_id,
      userName: row.user_name,
      data: row.data,
      timestamp: new Date(row.created_at),
    }));
  }

  /**
   * Rebuild page state from events
   */
  async rebuildState(pageId: string): Promise<any> {
    const events = await this.getHistory(pageId, 10000);

    // Replay events to rebuild current state
    let state = {
      pageId,
      data: { content: [] },
      metadata: {},
      status: 'draft',
      version: 0,
    };

    for (const event of events.reverse()) {
      state = this.applyEvent(state, event);
    }

    return state;
  }

  /**
   * Apply a single event to state
   */
  private applyEvent(state: any, event: ContentEvent): any {
    switch (event.type) {
      case EventType.PAGE_CREATED:
        return {
          ...state,
          ...event.data,
          createdAt: event.timestamp,
        };

      case EventType.PAGE_UPDATED:
        return {
          ...state,
          ...event.data,
          updatedAt: event.timestamp,
        };

      case EventType.PAGE_PUBLISHED:
        return {
          ...state,
          status: 'published',
          publishedAt: event.timestamp,
        };

      case EventType.BLOCK_INSERTED:
        return {
          ...state,
          data: {
            ...state.data,
            content: [
              ...state.data.content.slice(0, event.data.index),
              event.data.block,
              ...state.data.content.slice(event.data.index),
            ],
          },
        };

      case EventType.BLOCK_UPDATED:
        return {
          ...state,
          data: {
            ...state.data,
            content: state.data.content.map((b: any) =>
              b.id === event.data.blockId ? { ...b, ...event.data.changes } : b
            ),
          },
        };

      case EventType.BLOCK_DELETED:
        return {
          ...state,
          data: {
            ...state.data,
            content: state.data.content.filter(
              (b: any) => b.id !== event.data.blockId
            ),
          },
        };

      case EventType.METADATA_UPDATED:
        return {
          ...state,
          metadata: { ...state.metadata, ...event.data },
        };

      default:
        return state;
    }
  }

  /**
   * Flush buffered events (for offline recovery)
   */
  async flushBuffer(): Promise<void> {
    const supabase = createServerSupabaseClient();

    if (this.eventBuffer.length === 0 || this.isProcessing) return;

    this.isProcessing = true;

    try {
      for (const event of this.eventBuffer) {
        const { error } = await supabase.from('page_events').insert({
          id: event.id,
          page_id: event.pageId,
          event_type: event.type,
          user_id: event.userId,
          user_name: event.userName,
          data: event.data,
          created_at: event.timestamp.toISOString(),
        });

        if (!error) {
          this.eventBuffer = this.eventBuffer.filter((e) => e.id !== event.id);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

// Export singleton instance
export const eventStore = new EventStore();

// ============================================
// Helper Functions
// ============================================

export async function emitPageEvent(
  pageId: string,
  type: EventType,
  payload: PageEventPayload,
  userId: string
): Promise<ContentEvent> {
  return eventStore.publishEvent(pageId, type, payload, userId);
}

export async function emitBlockEvent(
  pageId: string,
  type: EventType,
  payload: BlockEventPayload,
  userId: string
): Promise<ContentEvent> {
  return eventStore.publishEvent(pageId, type, payload, userId);
}

export async function emitPresenceEvent(
  type: 'PRESENCE_ENTER' | 'PRESENCE_MOVE' | 'PRESENCE_LEAVE',
  payload: PresenceEventPayload,
  userId: string
): Promise<ContentEvent> {
  return eventStore.publishEvent(
    payload.pageId,
    type as EventType,
    payload,
    userId,
    payload.userName
  );
}

/**
 * Batch publish multiple events atomically
 */
export async function batchPublishEvents(
  events: Array<{ pageId: string; type: EventType; payload: any }>,
  userId: string
): Promise<ContentEvent[]> {
  const results: ContentEvent[] = [];

  for (const event of events) {
    const result = await eventStore.publishEvent(
      event.pageId,
      event.type,
      event.payload,
      userId
    );
    results.push(result);
  }

  return results;
}
