'use client'

import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { ImagePicker } from './ImagePicker'

interface ImagePickerFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function ImagePickerField({ value, onChange, label }: ImagePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL..."
          className="flex-1 px-3 py-2 text-sm border rounded-lg"
        />
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="shrink-0 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
        >
          <ImageIcon className="w-4 h-4" />
          Pick
        </button>
      </div>

      {value && (
        <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {showPicker && (
        <ImagePicker
          onSelect={({ url }) => {
            onChange(url)
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
