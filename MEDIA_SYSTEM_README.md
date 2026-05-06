# Media Management System

## Overview
The media management system provides comprehensive image handling capabilities for the AI Page Builder.

## Features Implemented

### 1. `/lib/media/` Directory
- **types.ts** - TypeScript types for media items (MediaItem, MediaCategory, etc.)
- **categories.ts** - Category definitions and helpers (hero, gallery, logo, icon, background, content, other)
- **resize.ts** - Image resizing with Sharp (`resizeImage`, `generateResponsiveSizes`, `getImageMetadata`)

### 2. API Routes Updated
- **POST /api/media/upload** - Now accepts `category`, `altText`, `tags` fields
- **GET /api/media/list** - Added filtering by `category`, `tags`, and `search`
- **GET /api/media/resize** - New endpoint for on-the-fly image resizing

### 3. Components Created (`/components/media/`)
- **ImageUploader.tsx** - Drag-and-drop upload with react-dropzone, preview, category selection, alt text
- **ImageCategoryManager.tsx** - Category tabs/filter component
- **ImageResizer.tsx** - Modal for resizing images with quality/format options
- **ImagePicker.tsx** - Modal to pick images for editor insertion (grid/list view, category filter, search)
- **ImagePickerField.tsx** - Field component for use in forms/sidebars

### 4. Puck Editor Integration
- **Insert Image button** added to editor toolbar
- Opens ImagePicker modal
- Copies selected image URL to clipboard

### 5. Block Updates
- **HeroBlock** - Fields updated with proper image field support
- **GalleryBlock** - Fields updated with array-based image support

### 6. MediaLibrary Updates
- Category tabs for filtering
- Grid/List view toggle
- Search functionality
- Integrated ImageUploader component

## Database Migration
Run the SQL migration to update the media table:
```sql
-- See sql/migrations/003-media-categories.sql
```

## Usage

### Upload Images
```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('category', 'hero')
formData.append('altText', 'Hero background image')
formData.append('tags', JSON.stringify(['homepage', 'banner']))

fetch('/api/media/upload', { method: 'POST', body: formData })
```

### List Images with Filters
```typescript
fetch('/api/media/list?category=hero&search=banner&tags=homepage')
```

### Resize Images on-the-fly
```
GET /api/media/resize?url=...&width=800&height=600&quality=80&format=webp
```

## Dependencies
- `sharp@0.34.0` - Image processing
- `react-dropzone@14.3.0` - Drag-and-drop uploads
- `@supabase/ssr@0.10.2` - Auth handling
- `sonner@2.0.7` - Toast notifications
- `lucide-react@1.14.0` - Icons
