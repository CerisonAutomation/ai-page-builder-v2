'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/media/categories'
import type { MediaCategory } from '@/lib/media/types'

interface ImageUploaderProps {
  onUploadComplete?: (media: any) => void
  onClose?: () => void
}

export function ImageUploader({ onUploadComplete, onClose }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<{ file: File; preview: string; category: MediaCategory; altText: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('other')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviews = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      category: selectedCategory,
      altText: '',
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
  }, [selectedCategory])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const removed = prev[index]
      if (removed) {
        URL.revokeObjectURL(removed.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const updatePreviewCategory = (index: number, category: MediaCategory) => {
    setPreviews((prev) =>
      prev.map((item, i) => (i === index ? { ...item, category } : item))
    )
  }

  const updatePreviewAltText = (index: number, altText: string) => {
    setPreviews((prev) =>
      prev.map((item, i) => (i === index ? { ...item, altText } : item))
    )
  }

  const handleUpload = async () => {
    if (previews.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = previews.map(async ({ file, category, altText }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)
        if (altText) formData.append('altText', altText)

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        return response.json()
      })

      const results = await Promise.all(uploadPromises)
      toast.success(`${results.length} file(s) uploaded successfully`)
      setPreviews([])
      onUploadComplete?.(results)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-300 hover:border-violet-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        {isDragActive ? (
          <p className="text-violet-600">Drop the files here...</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">Drag & drop images here</p>
            <p className="text-sm text-gray-500 mt-1">or click to select files</p>
            <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF, WebP up to 10MB</p>
          </>
        )}
      </div>

      {previews.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((item, index) => (
              <div key={index} className="border rounded-lg overflow-hidden bg-white">
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={item.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePreview(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Alt text..."
                    value={item.altText}
                    onChange={(e) => updatePreviewAltText(index, e.target.value)}
                    className="w-full px-2 py-1 text-xs border rounded"
                  />
                  <select
                    value={item.category}
                    onChange={(e) => updatePreviewCategory(index, e.target.value as MediaCategory)}
                    className="w-full px-2 py-1 text-xs border rounded"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                previews.forEach((p) => URL.revokeObjectURL(p.preview))
                setPreviews([])
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Upload {previews.length} File(s)
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
