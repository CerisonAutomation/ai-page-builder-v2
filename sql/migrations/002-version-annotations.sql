-- ==================== VERSION ANNOTATIONS MIGRATION ====================
-- ✅ Adds advanced annotation and metadata columns to page_versions
-- Run this migration after the initial schema

-- Add new columns to page_versions (if they don't exist)
ALTER TABLE page_versions
ADD COLUMN IF NOT EXISTS annotation TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS change_summary TEXT,
ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS restored_from UUID REFERENCES page_versions(id) ON DELETE SET NULL;

-- Create index for milestone versions
CREATE INDEX IF NOT EXISTS idx_page_versions_is_milestone 
ON page_versions(page_id, is_milestone DESC);

-- Create index for tag-based queries
CREATE INDEX IF NOT EXISTS idx_page_versions_tags 
ON page_versions USING gin(tags);

-- ==================== VERSION CHANGE LOG TABLE ====================
-- Optional: Track detailed change events
CREATE TABLE IF NOT EXISTS version_change_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES page_versions(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL, -- 'block_added', 'block_removed', 'block_modified', 'property_changed'
  block_id TEXT,
  block_type TEXT,
  property_name TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_version_change_log_version_id 
ON version_change_log(version_id);

CREATE INDEX IF NOT EXISTS idx_version_change_log_change_type 
ON version_change_log(change_type);

-- ==================== MIGRATION COMPLETE ====================
