'use client';

/**
 * Create Page Modal
 * ✅ Form to create new pages with validation
 */

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createPage } from '@/lib/db/pages';
import { logger } from '@/lib/utils/logger';

interface CreatePageModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: (title: string, slug: string) => void;
}

export default function CreatePageModal({
  userId,
  onClose,
  onSuccess,
}: CreatePageModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    setLoading(true);
    try {
      await createPage({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        data: {
          content: [
            {
              type: 'HeroBlock',
              props: {
                headline: title,
                subheadline: 'Start editing',
                primaryCta: 'Get Started',
                primaryHref: '#',
              },
            },
          ],
          root: { props: { title } },
        },
        published: false,
        user_id: userId,
      });

      toast.success('Page created successfully');
      onSuccess(title, slug);
    } catch (error) {
      logger.error('Failed to create page', error);
      toast.error('Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Page</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g., Product Overview"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="product-overview"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be unique and URL-friendly
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
