-- Migration: Add category, alt_text, tags to media table
-- Run this in Supabase SQL Editor

-- Add category column with default 'other'
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';

-- Add tags column as array
ALTER TABLE media 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT NULL;

-- Rename columns to match our code
ALTER TABLE media 
RENAME COLUMN bucket_path TO storage_path;

ALTER TABLE media 
RENAME COLUMN mimetype TO mime_type;

ALTER TABLE media 
RENAME COLUMN uploaded_by TO user_id;

-- Add index for category filtering
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_user_id_category ON media(user_id, category);

-- Update existing rows to have 'other' as category if null
UPDATE media SET category = 'other' WHERE category IS NULL;

-- Add constraint for valid categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_category_check'
  ) THEN
    ALTER TABLE media 
    ADD CONSTRAINT media_category_check 
    CHECK (category IN ('hero', 'gallery', 'logo', 'icon', 'background', 'content', 'other'));
  END IF;
END $$;
