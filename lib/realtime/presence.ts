/**
 * Presence Awareness System
 * 
 * Shows who's editing what in real-time.
 * Tracks cursor positions, active blocks, and user info.
 * Follows Sanity + Google Docs pattern.
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

// ============================================
// Types
// ============================================

export interface UserPresence {
  userId: string;
  userName: string;
  userEmail?: string;
  avatar?: string;
  color: string;
  pageId: string;
  blockId?: string;
  path?: string; // e.g., "blocks.2.content.title"
  cursorPosition?: number;
  cursorRange?: { start: number; end: number };
  lastActivity: Date;
  isActive: boolean;
}

export interface PresenceAwareness {
  pageId: string;
  users: Map<string, UserPresence>;
  lastUpdated: Date;
}

// ============================================
// Presence Manager
// ============================================

class PresenceManager {
  private awareness = new Map<string, PresenceAwareness>();
  private emitter = new EventEmitter();
  private cleanupIntervals = new Map<string, NodeJS.Timeout>();
  private readonly PRESENCE_TIMEOUT = 30000; // 30 seconds

  /**
   * Update user presence
   */
  updatePresence(presence: UserPresence): void {
    const { pageId, userId } = presence;

    if (!this.awareness.has(pageId)) {
      this.awareness.set(pageId, {
        pageId,
        users: new Map(),
        lastUpdated: new Date(),
      });
    }

    const pageAwareness = this.awareness.get(pageId)!;
    pageAwareness.users.set(userId, {
      ...presence,
      lastActivity: new Date(),
      isActive: true,
    });
    pageAwareness.lastUpdated = new Date();

    // Broadcast to all subscribers
    this.emitter.emit(`page:${pageId}:presence`, Array.from(pageAwareness.users.values()));
  }

  /**
   * Remove user presence
   */
  removePresence(pageId: string, userId: string): void {
    const awareness = this.awareness.get(pageId);
    if (!awareness) return;

    awareness.users.delete(userId);
    awareness.lastUpdated = new Date();

    this.emitter.emit(`page:${pageId}:presence`, Array.from(awareness.users.values()));
  }

  /**
   * Get presence for a page
   */
  getPresence(pageId: string): UserPresence[] {
    const awareness = this.awareness.get(pageId);
    if (!awareness) return [];

    // Filter out inactive users
    return Array.from(awareness.users.values()).filter((u) => u.isActive);
  }

  /**
   * Subscribe to presence changes for a page
   */
  subscribe(pageId: string, callback: (presence: UserPresence[]) => void): () => void {
    const handler = (presence: UserPresence[]) => {
      callback(presence);
    };

    this.emitter.on(`page:${pageId}:presence`, handler);

    // Setup cleanup timer for this page if not already done
    if (!this.cleanupIntervals.has(pageId)) {
      const interval = setInterval(() => {
        this._cleanupInactiveUsers(pageId);
      }, 10000); // Check every 10 seconds

      this.cleanupIntervals.set(pageId, interval);
    }

    // Return unsubscribe function
    return () => {
      this.emitter.removeListener(`page:${pageId}:presence`, handler);

      // Stop cleanup timer if no more subscribers
      const listeners = this.emitter.listenerCount(`page:${pageId}:presence`);
      if (listeners === 0) {
        const interval = this.cleanupIntervals.get(pageId);
        if (interval) {
          clearInterval(interval);
          this.cleanupIntervals.delete(pageId);
        }
      }
    };
  }

  /**
   * Update cursor position
   */
  updateCursor(
    pageId: string,
    userId: string,
    blockId: string,
    path: string,
    position: number
  ): void {
    const awareness = this.awareness.get(pageId);
    if (!awareness) return;

    const presence = awareness.users.get(userId);
    if (!presence) return;

    presence.blockId = blockId;
    presence.path = path;
    presence.cursorPosition = position;
    presence.lastActivity = new Date();
    presence.isActive = true;

    this.emitter.emit(`page:${pageId}:presence`, Array.from(awareness.users.values()));
  }

  /**
   * Update cursor range (for text selection)
   */
  updateSelection(
    pageId: string,
    userId: string,
    blockId: string,
    path: string,
    start: number,
    end: number
  ): void {
    const awareness = this.awareness.get(pageId);
    if (!awareness) return;

    const presence = awareness.users.get(userId);
    if (!presence) return;

    presence.blockId = blockId;
    presence.path = path;
    presence.cursorRange = { start, end };
    presence.lastActivity = new Date();
    presence.isActive = true;

    this.emitter.emit(`page:${pageId}:presence`, Array.from(awareness.users.values()));
  }

  /**
   * Mark user as idle
   */
  markIdle(pageId: string, userId: string): void {
    const awareness = this.awareness.get(pageId);
    if (!awareness) return;

    const presence = awareness.users.get(userId);
    if (presence) {
      presence.isActive = false;
    }
  }

  /**
   * Get users editing a specific block
   */
  getUsersOnBlock(pageId: string, blockId: string): UserPresence[] {
    const awareness = this.awareness.get(pageId);
    if (!awareness) return [];

    return Array.from(awareness.users.values()).filter(
      (u) => u.blockId === blockId && u.isActive
    );
  }

  /**
   * Get users editing a specific field
   */
  getUsersOnField(pageId: string, path: string): UserPresence[] {
    const awareness = this.awareness.get(pageId);
    if (!awareness) return [];

    return Array.from(awareness.users.values()).filter(
      (u) => u.path === path && u.isActive
    );
  }

  /**
   * Cleanup inactive users
   */
  private _cleanupInactiveUsers(pageId: string): void {
    const awareness = this.awareness.get(pageId);
    if (!awareness) return;

    const now = new Date();
    let removed = false;

    awareness.users.forEach((presence, userId) => {
      const timeSinceActivity = now.getTime() - presence.lastActivity.getTime();
      if (timeSinceActivity > this.PRESENCE_TIMEOUT) {
        awareness.users.delete(userId);
        removed = true;
      }
    });

    if (removed) {
      this.emitter.emit(`page:${pageId}:presence`, Array.from(awareness.users.values()));
    }

    // Cleanup page awareness if no users
    if (awareness.users.size === 0) {
      this.awareness.delete(pageId);
    }
  }
}

// Export singleton
export const presenceManager = new PresenceManager();

// ============================================
// React Hook for Presence
// ============================================

export function usePresence(pageId: string) {
  const [presence, setPresence] = React.useState<UserPresence[]>([]);

  React.useEffect(() => {
    const unsubscribe = presenceManager.subscribe(pageId, setPresence);
    return unsubscribe;
  }, [pageId]);

  return presence;
}

/**
 * Component to display presence avatars
 */
export function PresenceAvatars({ pageId, size = 'md' }: { pageId: string; size?: 'sm' | 'md' | 'lg' }) {
  const presence = usePresence(pageId);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className="flex items-center gap-1">
      {presence.map((user) => (
        <div
          key={user.userId}
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold`}
          style={{ backgroundColor: user.color }}
          title={`${user.userName}${user.path ? ` editing ${user.path}` : ''}`}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.userName} className="w-full h-full rounded-full" />
          ) : (
            user.userName[0].toUpperCase()
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Component to show detailed presence info
 */
export function PresencePanel({ pageId }: { pageId: string }) {
  const presence = usePresence(pageId);

  if (presence.length === 0) {
    return (
      <div className="text-sm text-slate-500 p-4">
        No one else is editing this page
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="font-semibold text-sm mb-3">Currently editing</h3>
      {presence.map((user) => (
        <div key={user.userId} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: user.color }}
          />
          <div className="flex-1">
            <div className="font-medium">{user.userName}</div>
            {user.blockId && (
              <div className="text-xs text-slate-500">
                Editing block {user.blockId}
                {user.path && ` - ${user.path}`}
              </div>
            )}
          </div>
          {user.isActive && (
            <div className="text-xs text-green-600 font-medium">Active</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Cursor Renderer for Live Cursors
// ============================================

export function RemoteCursor({
  presence,
}: {
  presence: UserPresence;
}) {
  return (
    <div
      className="absolute w-0.5 h-4 pointer-events-none animate-pulse"
      style={{
        backgroundColor: presence.color,
        left: 0,
      }}
    >
      <div
        className="absolute top-0 -translate-y-full whitespace-nowrap text-xs font-medium text-white px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: presence.color,
        }}
      >
        {presence.userName}
      </div>
    </div>
  );
}

// ============================================
// Server-side Presence Broadcast
// ============================================

export function broadcastPresence(presence: UserPresence): void {
  presenceManager.updatePresence(presence);
}

export function broadcastPresenceRemoval(pageId: string, userId: string): void {
  presenceManager.removePresence(pageId, userId);
}
