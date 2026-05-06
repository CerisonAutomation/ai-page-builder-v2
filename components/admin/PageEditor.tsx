'use client';

/**
 * Quick Page Editor
 * ✅ Edit page metadata and summary
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import { updatePage } from '@/lib/db/pages';
import { logger } from '@/lib/utils/logger';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface PageEditorProps {
  page: {
    id: string;
    slug: string;
    title: string;
    description?: string;
  };
  onClose: () => void;
}

export default function PageEditor({ page, onClose }: PageEditorProps) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [description, setDescription] = useState(page.description || '');
  const [loading, setLoading] = useState(false);
  const t = useTranslations('admin.pages');
  const tCommon = useTranslations('common');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePage(page.id, '', {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      toast.success(t('updated'));
      onClose();
    } catch (error) {
      logger.error('Failed to update page', error);
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{page.title}</h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
        >
          ← {tCommon('back')} {t('title')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
<div>
              <label htmlFor="edit-page-title" className="block text-sm font-medium text-gray-700 mb-1">
                {t('pageTitle')}
              </label>
              <input
                id="edit-page-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>

<div>
              <label htmlFor="edit-page-slug" className="block text-sm font-medium text-gray-700 mb-1">
                {t('slug')}
              </label>
              <input
                id="edit-page-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>

<div>
              <label htmlFor="edit-page-description" className="block text-sm font-medium text-gray-700 mb-1">
                {tCommon('description')}
              </label>
              <textarea
                id="edit-page-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? tCommon('loading') : tCommon('save')}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('actions')}</h3>
            <div className="space-y-2">
              <Link
                href={`/edit/${slug}`}
                className="block text-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
              >
                {t('editPage')}
              </Link>
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
              >
                {tCommon('view')} {t('title')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
