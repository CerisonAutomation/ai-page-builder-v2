-- ============================================
-- Event Sourcing System
-- ============================================

-- Page events table (immutable audit log)
CREATE TABLE IF NOT EXISTS page_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  data JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX page_events_page_id_idx (page_id),
  INDEX page_events_type_idx (event_type),
  INDEX page_events_user_id_idx (user_id),
  INDEX page_events_created_at_idx (created_at DESC),
  INDEX page_events_page_created_idx (page_id, created_at DESC)
);

-- Enable RLS on page_events
ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view page events for pages they can access"
  ON page_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_events.page_id
      AND (
        pages.created_by = auth.uid()
        OR pages.workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert page events for pages they can edit"
  ON page_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_events.page_id
      AND (
        pages.created_by = auth.uid()
        OR pages.workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
          AND role IN ('admin', 'editor')
        )
      )
    )
  );

-- ============================================
-- Editorial Workflow Status
-- ============================================

-- Enum for page status
CREATE TYPE page_status_enum AS ENUM (
  'draft',
  'review',
  'approved',
  'published',
  'scheduled',
  'archived'
);

-- Add status column to pages table if not exists
ALTER TABLE pages ADD COLUMN IF NOT EXISTS status page_status_enum DEFAULT 'draft';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP;

-- Review requests table
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMP NOT NULL DEFAULT now(),
  message TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX review_requests_page_id_idx (page_id),
  INDEX review_requests_status_idx (status),
  INDEX review_requests_requested_by_idx (requested_by)
);

-- Enable RLS on review_requests
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view review requests for pages they can access"
  ON review_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = review_requests.page_id
      AND (
        pages.created_by = auth.uid()
        OR pages.workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- ============================================
-- Real-time Presence & Locking
-- ============================================

-- Field-level locking table
CREATE TABLE IF NOT EXISTS field_locks (
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  block_id VARCHAR(255) NOT NULL,
  field_path VARCHAR(500) NOT NULL,
  locked_by UUID NOT NULL REFERENCES auth.users(id),
  locked_at TIMESTAMP NOT NULL DEFAULT now(),
  expires_at TIMESTAMP NOT NULL DEFAULT (now() + INTERVAL '30 seconds'),
  
  PRIMARY KEY (page_id, block_id, field_path),
  INDEX field_locks_page_id_idx (page_id),
  INDEX field_locks_expires_at_idx (expires_at)
);

-- Enable RLS on field_locks
ALTER TABLE field_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view field locks for pages they can edit"
  ON field_locks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = field_locks.page_id
      AND pages.workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Presence table (for real-time who's editing what)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  block_id VARCHAR(255),
  field_path VARCHAR(500),
  cursor_position INT,
  cursor_start INT,
  cursor_end INT,
  last_activity TIMESTAMP NOT NULL DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  
  PRIMARY KEY (user_id, page_id),
  INDEX user_presence_page_id_idx (page_id),
  INDEX user_presence_last_activity_idx (last_activity DESC)
);

-- ============================================
-- Block Schema Registry
-- ============================================

-- Block schema definitions table
CREATE TABLE IF NOT EXISTS block_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_type VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,  -- Zod schema as JSON
  preview_component VARCHAR(255),
  icon_url VARCHAR(500),
  category VARCHAR(100),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX block_schemas_type_idx (block_type),
  INDEX block_schemas_category_idx (category)
);

-- Enable RLS on block_schemas
ALTER TABLE block_schemas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view block schemas"
  ON block_schemas FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- Rich Text Annotations
-- ============================================

-- Rich text blocks table
CREATE TABLE IF NOT EXISTS rich_text_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  block_id VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,  -- Portable Text format
  plain_text TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  INDEX rich_text_blocks_page_id_idx (page_id),
  INDEX rich_text_blocks_block_id_idx (block_id)
);

-- ============================================
-- Media with Metadata
-- ============================================

-- Extend media table with metadata
ALTER TABLE media ADD COLUMN IF NOT EXISTS alt_text VARCHAR(500);
ALTER TABLE media ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS tags VARCHAR[] DEFAULT ARRAY[]::VARCHAR[];
ALTER TABLE media ADD COLUMN IF NOT EXISTS focal_point JSONB;  -- { x: 0.5, y: 0.5 }
ALTER TABLE media ADD COLUMN IF NOT EXISTS crop JSONB;  -- { top: 10, left: 10, width: 200, height: 200 }
ALTER TABLE media ADD COLUMN IF NOT EXISTS metadata JSONB;  -- dimensions, format, etc.

-- ============================================
-- Content References
-- ============================================

-- Reference fields for linking content
CREATE TABLE IF NOT EXISTS content_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  source_block_id VARCHAR(255) NOT NULL,
  source_field VARCHAR(255) NOT NULL,
  target_type VARCHAR(50) NOT NULL,  -- 'page', 'block', 'media', etc.
  target_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  
  INDEX content_references_source_idx (source_page_id, source_block_id),
  INDEX content_references_target_idx (target_type, target_id)
);

-- ============================================
-- Audit Trail
-- ============================================

-- Comprehensive audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  
  INDEX audit_log_user_id_idx (user_id),
  INDEX audit_log_resource_idx (resource_type, resource_id),
  INDEX audit_log_created_at_idx (created_at DESC)
);

-- Enable RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their pages"
  ON audit_log FOR SELECT
  USING (
    resource_type = 'page'
    AND resource_id IN (
      SELECT id::VARCHAR FROM pages
      WHERE created_by = auth.uid()
      OR workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- Helper Functions
-- ============================================

-- Function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM field_locks WHERE expires_at < now();
  DELETE FROM user_presence WHERE last_activity < now() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create job to run cleanup every 5 minutes (with pg_cron if available)
-- SELECT cron.schedule('cleanup_expired_locks', '*/5 * * * *', 'SELECT cleanup_expired_locks()');

-- Function to create event on page update
CREATE OR REPLACE FUNCTION create_page_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO page_events (page_id, event_type, user_id, data)
  VALUES (
    NEW.id,
    'PAGE_UPDATED',
    auth.uid(),
    jsonb_build_object(
      'title', NEW.title,
      'slug', NEW.slug,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS page_update_trigger ON pages;
CREATE TRIGGER page_update_trigger
  AFTER UPDATE ON pages
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION create_page_event();

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_published_at ON pages(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_workspace_id ON pages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_page_events_full_text ON page_events USING gin(data);
