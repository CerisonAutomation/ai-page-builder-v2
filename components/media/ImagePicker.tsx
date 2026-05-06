'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, Image as ImageIcon, Grid, List, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ImageCategoryManager } from './ImageCategoryManager'
import { CATEGORY_LABELS } from '@/lib/media/categories'
import type { MediaCategory } from '@/lib/media/types'

interface MediaItem {
  id: string
  url: string
  filename: string
  size: number
  mime_type: string
  width?: number
  height?: number
  category: string
  alt_text?: string
  created_at: string
}

interface ImagePickerProps {
  onSelect: (image: { url: string; alt?: string }) => void
  onClose: () => void
}

export function ImagePicker({ onSelect, onClose }: ImagePickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryCounts, setCategoryCounts] = useState<Partial<Record<MediaCategory, number>>>({})

  const loadMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (search) params.append('search', search)

      const response = await fetch(`/api/media/list?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to load media')

      const data = await response.json()
      setMedia(data.files || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, search])

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  const handleSelect = (item: MediaItem) => {
    onSelect({
      url: item.url,
      alt: item.alt_text || item.filename,
    })
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Select Image
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b space-y-3">
          <ImageCategoryManager
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            counts={categoryCounts}
          />

          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No images found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left group"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={item.url}
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {item.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.size)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex items-center gap-4 w-full p-3 border rounded-lg hover:shadow-sm transition-shadow text-left"
                >
                  <img
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {CATEGORY_LABELS[item.category as MediaCategory] || item.category} • {formatFileSize(item.size)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
