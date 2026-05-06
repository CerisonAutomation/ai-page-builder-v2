'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, Upload, Image as ImageIcon, Trash2, Search, Grid, List } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { ImageCategoryManager } from '@/components/media/ImageCategoryManager';
import { ImageUploader } from '@/components/media/ImageUploader';
import type { MediaCategory } from '@/lib/media/types';

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  width?: number;
  height?: number;
  category: string;
  alt_text?: string;
  created_at: string;
}

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploader, setShowUploader] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('admin.media');
  const tCommon = useTranslations('common');

  const loadMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (search) params.append('search', search);

      const response = await fetch(`/api/media/list?${params.toString()}`);
      if (!response.ok) throw new Error(tCommon('error'));
      const data = await response.json();
      setMedia(data.files || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : tCommon('error');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, search, tCommon]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(tCommon('error'));

      const data = await response.json();
      setMedia(prev => [...(data.files || []), ...prev]);
      toast.success(`${files.length} ${t('upload').toLowerCase()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : tCommon('error');
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`${tCommon('delete')} "${filename}"? ${tCommon('confirm')}`)) return;

    try {
      const response = await fetch(`/api/media/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(tCommon('error'));

      setMedia(prev => prev.filter(f => f.id !== fileId));
      toast.success(tCommon('success'));
    } catch (err) {
      const message = err instanceof Error ? err.message : tCommon('error');
      toast.error(message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            {t('upload')}
          </button>
        </div>
      </div>

      {showUploader && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <ImageUploader onUploadComplete={() => { loadMedia(); setShowUploader(false); }} />
        </div>
      )}

      <div className="mb-6 space-y-4">
        <ImageCategoryManager
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{error}</p>
          <button
            onClick={loadMedia}
            className="text-sm font-medium hover:underline"
          >
            {tCommon('retry')}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">{t('noMedia')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('dragDrop')}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((file) => (
            <div key={file.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={file.url}
                  alt={file.alt_text || file.filename}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDelete(file.id, file.filename)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  aria-label={`${tCommon('delete')} ${file.filename}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {media.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg hover:shadow-sm transition-shadow">
              <img
                src={file.url}
                alt={file.alt_text || file.filename}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {file.category} • {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(file.id, file.filename)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaLibrary;
