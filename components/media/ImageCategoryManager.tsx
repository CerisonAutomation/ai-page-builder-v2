'use client'

import { useState, useCallback } from 'react'
import { LayoutGrid, Image, Award, Star, Layers, FileImage, Paperclip } from 'lucide-react'
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/media/categories'
import type { MediaCategory } from '@/lib/media/types'

interface ImageCategoryManagerProps {
  selectedCategory: MediaCategory | 'all'
  onCategoryChange: (category: MediaCategory | 'all') => void
  counts?: Partial<Record<MediaCategory, number>>
}

const ICON_MAP: Record<string, any> = {
  LayoutGrid,
  Image,
  Award,
  Star,
  Layers,
  FileImage,
  Paperclip,
}

export function ImageCategoryManager({
  selectedCategory,
  onCategoryChange,
  counts,
}: ImageCategoryManagerProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      <button
        onClick={() => onCategoryChange('all')}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
          selectedCategory === 'all'
            ? 'bg-violet-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        All
        {counts && Object.values(counts).reduce((a, b) => a + (b || 0), 0) > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded">
            {Object.values(counts).reduce((a, b) => a + (b || 0), 0)}
          </span>
        )}
      </button>

      {CATEGORIES.map((category) => {
        const IconComponent = ICON_MAP[CATEGORY_ICONS[category]] || FileImage
        const count = counts?.[category] || 0

        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <IconComponent className="w-4 h-4" />
            {CATEGORY_LABELS[category]}
            {count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${
                selectedCategory === category
                  ? 'bg-white/20'
                  : 'bg-gray-200'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
