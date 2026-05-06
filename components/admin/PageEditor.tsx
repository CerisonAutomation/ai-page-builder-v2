'use client';

/**
 * Quick Page Editor
 * ✅ Edit page metadata and summary
 */

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { updatePage } from '@/lib/db/pages';
import { logger } from '@/lib/utils/logger';
import Link from 'next/link';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePage(page.id, '', {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });

      toast.success('Page updated');
      onClose();
    } catch (error) {
      logger.error('Failed to update page', error);
      toast.error('Failed to update page');
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
          ← Back to Pages
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/edit/${slug}`}
                className="block text-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
              >
                Edit Page
              </Link>
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
              >
                View Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
