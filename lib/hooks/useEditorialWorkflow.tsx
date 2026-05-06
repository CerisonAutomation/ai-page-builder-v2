/**
 * useEditorialWorkflow Hook
 * 
 * Manages page publishing workflow: draft → review → approved → published
 * Follows Tina CMS editorial workflow pattern.
 * Tracks status changes, approvals, and scheduling.
 */

import { useState, useCallback, useEffect } from 'react';
import { eventStore, EventType, emitPageEvent } from '@/lib/realtime/eventSourcing';

// ============================================
// Types
// ============================================

export enum PageStatus {
  Draft = 'draft',
  ReviewRequested = 'review',
  Approved = 'approved',
  Published = 'published',
  Scheduled = 'scheduled',
  Archived = 'archived',
}

export interface PublishSchedule {
  type: 'now' | 'scheduled' | 'recurring';
  scheduledAt?: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endAt?: Date;
  };
}

export interface ReviewRequest {
  requestedBy: string;
  requestedAt: Date;
  message?: string;
}

export interface ReviewApproval {
  approvedBy: string;
  approvedAt: Date;
  feedback?: string;
}

export interface WorkflowState {
  pageId: string;
  status: PageStatus;
  version: number;
  currentUser: string;
  reviewRequest?: ReviewRequest;
  lastApproval?: ReviewApproval;
  publishedAt?: Date;
  publishedBy?: string;
  scheduledPublishAt?: Date;
  archivedAt?: Date;
  archivedBy?: string;
}

export interface WorkflowActions {
  saveAsDraft: () => Promise<void>;
  requestReview: (message?: string) => Promise<void>;
  approveReview: (feedback?: string) => Promise<void>;
  rejectReview: (feedback: string) => Promise<void>;
  publish: (schedule?: PublishSchedule) => Promise<void>;
  unpublish: () => Promise<void>;
  archive: () => Promise<void>;
  restore: () => Promise<void>;
  canApprove: () => boolean;
  canPublish: () => boolean;
  canArchive: () => boolean;
}

export interface EditorialStats {
  totalVersions: number;
  draftCount: number;
  publishedCount: number;
  reviewRequests: number;
  lastEditedAt: Date;
  lastEditedBy: string;
}

// ============================================
// useEditorialWorkflow Hook
// ============================================

export function useEditorialWorkflow(
  pageId: string,
  initialStatus: PageStatus = PageStatus.Draft
) {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    pageId,
    status: initialStatus,
    version: 1,
    currentUser: '', // Will be set by auth
  });

  const [history, setHistory] = useState<WorkflowState[]>([workflow]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workflow state from database
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const response = await fetch(`/api/pages/${pageId}/workflow`);
        if (!response.ok) throw new Error('Failed to load workflow');
        
        const data = await response.json();
        setWorkflow(data.workflow);
        setHistory(data.history || [data.workflow]);
      } catch (err) {
        console.error('Error loading workflow:', err);
      }
    };

    loadWorkflow();
  }, [pageId]);

  // Subscribe to workflow events
  useEffect(() => {
    const unsubscribe = eventStore.subscribe(pageId, (event) => {
      switch (event.type) {
        case EventType.PAGE_PUBLISHED:
          setWorkflow((prev) => ({
            ...prev,
            status: PageStatus.Published,
            publishedAt: event.timestamp,
            publishedBy: event.userName,
          }));
          break;

        case EventType.REVIEW_REQUESTED:
          setWorkflow((prev) => ({
            ...prev,
            status: PageStatus.ReviewRequested,
            reviewRequest: {
              requestedBy: event.userName || '',
              requestedAt: event.timestamp,
              message: event.data.message,
            },
          }));
          break;

        case EventType.REVIEW_APPROVED:
          setWorkflow((prev) => ({
            ...prev,
            status: PageStatus.Approved,
            lastApproval: {
              approvedBy: event.userName || '',
              approvedAt: event.timestamp,
              feedback: event.data.feedback,
            },
          }));
          break;

        case EventType.PAGE_ARCHIVED:
          setWorkflow((prev) => ({
            ...prev,
            status: PageStatus.Archived,
            archivedAt: event.timestamp,
            archivedBy: event.userName,
          }));
          break;
      }
    });

    return unsubscribe;
  }, [pageId]);

  // ============================================
  // Workflow Actions
  // ============================================

  const saveAsDraft = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: PageStatus.Draft }),
      });

      if (!response.ok) throw new Error('Failed to save draft');

      setWorkflow((prev) => ({
        ...prev,
        status: PageStatus.Draft,
        version: prev.version + 1,
      }));

      await emitPageEvent(
        pageId,
        EventType.PAGE_DRAFT_SAVED,
        { version: workflow.version + 1 },
        workflow.currentUser
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pageId, workflow.currentUser, workflow.version]);

  const requestReview = useCallback(
    async (message?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/pages/${pageId}/request-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) throw new Error('Failed to request review');

        const newState: WorkflowState = {
          ...workflow,
          status: PageStatus.ReviewRequested,
          reviewRequest: {
            requestedBy: workflow.currentUser,
            requestedAt: new Date(),
            message,
          },
          version: workflow.version + 1,
        };

        setWorkflow(newState);
        setHistory((prev) => [...prev, newState]);

        await emitPageEvent(
          pageId,
          EventType.REVIEW_REQUESTED,
          { message },
          workflow.currentUser
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [pageId, workflow]
  );

  const approveReview = useCallback(
    async (feedback?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/pages/${pageId}/approve-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback }),
        });

        if (!response.ok) throw new Error('Failed to approve review');

        const newState: WorkflowState = {
          ...workflow,
          status: PageStatus.Approved,
          lastApproval: {
            approvedBy: workflow.currentUser,
            approvedAt: new Date(),
            feedback,
          },
          version: workflow.version + 1,
        };

        setWorkflow(newState);
        setHistory((prev) => [...prev, newState]);

        await emitPageEvent(
          pageId,
          EventType.REVIEW_APPROVED,
          { feedback },
          workflow.currentUser
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [pageId, workflow]
  );

  const rejectReview = useCallback(
    async (feedback: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/pages/${pageId}/reject-review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback }),
        });

        if (!response.ok) throw new Error('Failed to reject review');

        const newState: WorkflowState = {
          ...workflow,
          status: PageStatus.Draft,
          reviewRequest: undefined,
          version: workflow.version + 1,
        };

        setWorkflow(newState);
        setHistory((prev) => [...prev, newState]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [pageId, workflow]
  );

  const publish = useCallback(
    async (schedule?: PublishSchedule) => {
      setIsLoading(true);
      setError(null);

      try {
        const isScheduled = schedule?.type === 'scheduled' || schedule?.type === 'recurring';

        const response = await fetch(`/api/pages/${pageId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedule,
            isScheduled,
            scheduledAt: schedule?.scheduledAt,
          }),
        });

        if (!response.ok) throw new Error('Failed to publish');

        const newState: WorkflowState = {
          ...workflow,
          status: isScheduled ? PageStatus.Scheduled : PageStatus.Published,
          publishedAt: isScheduled ? undefined : new Date(),
          publishedBy: workflow.currentUser,
          scheduledPublishAt: schedule?.scheduledAt,
          version: workflow.version + 1,
        };

        setWorkflow(newState);
        setHistory((prev) => [...prev, newState]);

        await emitPageEvent(
          pageId,
          EventType.PAGE_PUBLISHED,
          { scheduledAt: schedule?.scheduledAt },
          workflow.currentUser
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [pageId, workflow]
  );

  const unpublish = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pages/${pageId}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to unpublish');

      const newState: WorkflowState = {
        ...workflow,
        status: PageStatus.Draft,
        publishedAt: undefined,
        publishedBy: undefined,
        version: workflow.version + 1,
      };

      setWorkflow(newState);
      setHistory((prev) => [...prev, newState]);

      await emitPageEvent(
        pageId,
        EventType.PAGE_UNPUBLISHED,
        {},
        workflow.currentUser
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pageId, workflow]);

  const archive = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pages/${pageId}/archive`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to archive');

      const newState: WorkflowState = {
        ...workflow,
        status: PageStatus.Archived,
        archivedAt: new Date(),
        archivedBy: workflow.currentUser,
        version: workflow.version + 1,
      };

      setWorkflow(newState);
      setHistory((prev) => [...prev, newState]);

      await emitPageEvent(
        pageId,
        EventType.PAGE_ARCHIVED,
        {},
        workflow.currentUser
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pageId, workflow]);

  const restore = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pages/${pageId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to restore');

      const newState: WorkflowState = {
        ...workflow,
        status: PageStatus.Draft,
        archivedAt: undefined,
        archivedBy: undefined,
        version: workflow.version + 1,
      };

      setWorkflow(newState);
      setHistory((prev) => [...prev, newState]);

      await emitPageEvent(
        pageId,
        EventType.PAGE_RESTORED,
        {},
        workflow.currentUser
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pageId, workflow]);

  // ============================================
  // Permissions Checks
  // ============================================

  const canApprove = useCallback(() => {
    return workflow.status === PageStatus.ReviewRequested;
  }, [workflow.status]);

  const canPublish = useCallback(() => {
    return (
      workflow.status === PageStatus.Draft ||
      workflow.status === PageStatus.Approved ||
      workflow.status === PageStatus.Published
    );
  }, [workflow.status]);

  const canArchive = useCallback(() => {
    return workflow.status !== PageStatus.Archived;
  }, [workflow.status]);

  return {
    workflow,
    history,
    isLoading,
    error,
    actions: {
      saveAsDraft,
      requestReview,
      approveReview,
      rejectReview,
      publish,
      unpublish,
      archive,
      restore,
      canApprove,
      canPublish,
      canArchive,
    },
  };
}

/**
 * Helper component for editorial workflow UI
 */
export function WorkflowStatusBadge({ status }: { status: PageStatus }) {
  const statusConfig = {
    [PageStatus.Draft]: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      label: 'Draft',
    },
    [PageStatus.ReviewRequested]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Review Requested',
    },
    [PageStatus.Approved]: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Approved',
    },
    [PageStatus.Published]: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Published',
    },
    [PageStatus.Scheduled]: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'Scheduled',
    },
    [PageStatus.Archived]: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'Archived',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
