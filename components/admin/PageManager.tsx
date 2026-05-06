'use client';

/**
 * Page Manager - Tina CMS-style List View
 * ✅ List, search, filter, bulk actions, publish toggles
 */

import { useState, useCallback, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { listPages, deletePage, publishPage, unpublishPage } from '@/lib/db/pages';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import CreatePageModal from './CreatePageModal';
import PageEditor from './PageEditor';

interface Page {
  id: string;
  slug: string;
  title: string;
  description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface PageManagerProps {
  userId: string;
}

export default function PageManager({ userId }: PageManagerProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const pageSize = 20;
  const t = useTranslations('admin.pages');
  const tCommon = useTranslations('common');

  // Load pages
  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPages(userId, {
        limit: pageSize,
        offset,
        search: searchQuery || undefined,
        published: filterMode === 'all' ? undefined : filterMode === 'published',
      });

      setPages(result.pages as Page[]);
      setTotal(result.total);
    } catch (error) {
      logger.error('Failed to load pages', error);
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
  }, [userId, offset, searchQuery, filterMode, tCommon]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0);
      loadPages();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle page creation
  const handleCreatePage = async (title: string, slug: string) => {
    setShowCreateModal(false);
    setOffset(0);
    await loadPages();
  };

  // Handle publish toggle
  const handlePublishToggle = async (pageId: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await unpublishPage(pageId, userId);
        toast.success(t('draft'));
      } else {
        await publishPage(pageId, userId);
        toast.success(t('published'));
      }
      await loadPages();
    } catch (error) {
      logger.error('Failed to update publish status', error);
      toast.error(tCommon('error'));
    }
  };

  // Handle delete
  const handleDelete = async (pageId: string) => {
    if (!confirm(tCommon('confirm'))) return;

    try {
      await deletePage(pageId, userId);
      toast.success(t('deletePage'));
      await loadPages();
    } catch (error) {
      logger.error('Failed to delete page', error);
      toast.error(tCommon('error'));
    }
  };

  // Bulk actions
  const handleBulkPublish = async () => {
    try {
      await Promise.all(
        Array.from(selectedPages).map(id =>
          publishPage(id, userId)
        )
      );
      await loadPages();
      setSelectedPages(new Set());
      toast.success(`${selectedPages.size} ${t('published').toLowerCase()}`);
    } catch (error) {
      logger.error('Bulk publish failed', error);
      toast.error(tCommon('error'));
    }
  };

  const handleBulkUnpublish = async () => {
    try {
      await Promise.all(
        Array.from(selectedPages).map(id =>
          unpublishPage(id, userId)
        )
      );
      await loadPages();
      setSelectedPages(new Set());
      toast.success(`${selectedPages.size} ${t('draft').toLowerCase()}`);
    } catch (error) {
      logger.error('Bulk unpublish failed', error);
      toast.error(tCommon('error'));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${t('deletePage')} ${selectedPages.size} ${t('title').toLowerCase()}? ${tCommon('confirm')}`)) return;

    try {
      await Promise.all(
        Array.from(selectedPages).map(id =>
          deletePage(id, userId)
        )
      );
      await loadPages();
      setSelectedPages(new Set());
      toast.success(`${selectedPages.size} ${t('deletePage').toLowerCase()}`);
    } catch (error) {
      logger.error('Bulk delete failed', error);
      toast.error(tCommon('error'));
    }
  };

  // Toggle row selection
  const handleToggleSelect = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  // Select/deselect all
  const handleSelectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(p => p.id)));
    }
  };

  if (selectedPage) {
    return (
      <PageEditor
        page={selectedPage}
        onClose={() => {
          setSelectedPage(null);
          loadPages();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder={t('searchPages')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value as typeof filterMode);
              setOffset(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">{t('title')} ({t('status')})</option>
            <option value="published">{t('published')}</option>
            <option value="draft">{t('draft')}</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
          >
            + {t('createPage')}
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedPages.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedPages.size} {t('title').toLowerCase()}{selectedPages.size !== 1 ? 's' : ''} {tCommon('confirm').toLowerCase()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkPublish}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              {t('published')}
            </button>
            <button
              onClick={handleBulkUnpublish}
              className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              {t('draft')}
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              {tCommon('delete')}
            </button>
          </div>
        </div>
      )}

      {/* Pages table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedPages.size === pages.length && pages.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('pageTitle')}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('slug')}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('status')}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{tCommon('save')}</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {tCommon('loading')}
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {t('noPages')} {searchQuery && t('searchPages')}
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPages.has(page.id)}
                      onChange={() => handleToggleSelect(page.id)}
                      className="rounded"
                    />
                  </td>
                  <td
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => setSelectedPage(page)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPage(page);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${t('editPage')} ${page.title}`}
                  >
                    <div className="font-medium text-gray-900">{page.title}</div>
                    <div className="text-sm text-gray-600">{page.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{page.slug}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublishToggle(page.id, page.published);
                      }}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition ${
                        page.published
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {page.published ? `✓ ${t('published')}` : `○ ${t('draft')}`}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedPage(page)}
                      className="text-violet-600 hover:text-violet-900 text-sm font-medium"
                    >
                      {t('editPage')}
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium ml-3"
                    >
                      {tCommon('delete')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {t('pageTitle')} {offset + 1} {tCommon('to')} {Math.min(offset + pageSize, total)} {tCommon('of')} {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - pageSize))}
              disabled={offset === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              ← {tCommon('back')}
            </button>
            <button
              onClick={() => setOffset(offset + pageSize)}
              disabled={offset + pageSize >= total}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              {tCommon('next')} →
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePageModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreatePage}
        />
      )}
    </div>
  );
}
