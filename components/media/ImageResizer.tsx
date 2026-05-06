'use client'

import { useState } from 'react'
import { X, Crop, Download } from 'lucide-react'
import { toast } from 'sonner'

interface ImageResizerProps {
  imageUrl: string
  imageName: string
  onClose: () => void
  onResizeComplete?: (newUrl: string) => void
}

export function ImageResizer({ imageUrl, imageName, onClose, onResizeComplete }: ImageResizerProps) {
  const [width, setWidth] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [quality, setQuality] = useState(80)
  const [format, setFormat] = useState<'webp' | 'jpeg' | 'png' | 'avif'>('webp')
  const [resizing, setResizing] = useState(false)

  const handleResize = async () => {
    setResizing(true)
    try {
      const params = new URLSearchParams()
      params.append('url', imageUrl)
      if (width) params.append('width', width)
      if (height) params.append('height', height)
      params.append('quality', quality.toString())
      params.append('format', format)

      const resizedUrl = `/api/media/resize?${params.toString()}`

      // Verify the resize works
      const response = await fetch(resizedUrl)
      if (!response.ok) throw new Error('Resize failed')

      toast.success('Image resized successfully')
      onResizeComplete?.(resizedUrl)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Resize failed')
    } finally {
      setResizing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Resize Image
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Auto"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quality ({quality}%)
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="webp">WebP (recommended)</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="avif">AVIF</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleResize}
              disabled={resizing}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {resizing ? (
                <>
                  <Download className="w-4 h-4 animate-spin" />
                  Resizing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Resize & Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
