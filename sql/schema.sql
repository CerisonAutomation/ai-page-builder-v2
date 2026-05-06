-- ✅ SUPABASE SCHEMA — COPY AND PASTE INTO SQL EDITOR

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== PAGES TABLE ====================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  description TEXT,
  data JSONB NOT NULL DEFAULT '{"content":[],"root":{"props":{"title":""}}}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(published);
CREATE INDEX idx_pages_created_by ON pages(created_by);
CREATE INDEX idx_pages_updated_at ON pages(updated_at DESC);

-- RLS: Published pages public read, authenticated users can only see their own pages
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- FIX: Removed "OR auth.role() = 'authenticated'" which was exposing all drafts
-- to any authenticated user. Each policy now has a single, clear purpose.
CREATE POLICY "public_read_published" ON pages
  FOR SELECT USING (published = true);

CREATE POLICY "owner_all" ON pages
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "authenticated_can_create" ON pages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==================== MEDIA TABLE ====================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mimetype TEXT,
  size INT,
  width INT,
  height INT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- ✅ PERFORMANCE: Composite indices for common queries
CREATE INDEX IF NOT EXISTS idx_pages_created_by_deleted_at 
  ON pages(created_by, deleted_at);

CREATE INDEX IF NOT EXISTS idx_pages_published_deleted_at 
  ON pages(published, deleted_at);

CREATE INDEX IF NOT EXISTS idx_media_uploaded_by_deleted_at 
  ON media(uploaded_by, deleted_at);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_media" ON media
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "owner_manage_media" ON media
  FOR ALL USING (uploaded_by = auth.uid());

CREATE POLICY "authenticated_can_upload" ON media
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ==================== PAGE_VERSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS page_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  label TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX idx_page_versions_created_at ON page_versions(created_at DESC);

ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_versions" ON page_versions
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM pages WHERE pages.id = page_versions.page_id AND pages.created_by = auth.uid())
  );

-- FIX: Add write policies that were missing, causing server-side inserts to fail
-- when using the anon-key client (which respects RLS).
CREATE POLICY "owner_insert_versions" ON page_versions
  FOR INSERT WITH CHECK (
    EXISTS(SELECT 1 FROM pages WHERE pages.id = page_versions.page_id AND pages.created_by = auth.uid())
  );

CREATE POLICY "owner_update_versions" ON page_versions
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM pages WHERE pages.id = page_versions.page_id AND pages.created_by = auth.uid())
  );

CREATE POLICY "owner_delete_versions" ON page_versions
  FOR DELETE USING (
    EXISTS(SELECT 1 FROM pages WHERE pages.id = page_versions.page_id AND pages.created_by = auth.uid())
  );

-- ==================== REALTIME SUBSCRIPTIONS ====================
-- For collaborative editing: track who's editing which page
CREATE TABLE IF NOT EXISTS active_editors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursor_position INT,
  selected_block_id TEXT,
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_id, user_id)
);

ALTER TABLE active_editors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "see_active_editors" ON active_editors
  FOR SELECT USING (true);

CREATE POLICY "manage_own_session" ON active_editors
  FOR ALL USING (user_id = auth.uid());

-- ==================== BLOCKS LIBRARY ====================
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO blocks (name, label, category, description, icon_name) VALUES
  ('HeroBlock', 'Hero Section', 'Hero', 'Full-width hero with headline and CTA', 'Zap'),
  ('CardGridBlock', 'Card Grid', 'Content', 'Grid of feature cards', 'Grid'),
  ('FeatureListBlock', 'Feature List', 'Features', 'Vertical feature list', 'List'),
  ('StatsBlock', 'Stats', 'Social Proof', 'Key metrics with numbers', 'BarChart'),
  ('CTABlock', 'Call to Action', 'CTA', 'Prominent conversion button section', 'Target'),
  ('FAQBlock', 'FAQ', 'Content', 'Accordion FAQ section', 'HelpCircle'),
  ('PricingBlock', 'Pricing Table', 'Commerce', 'Pricing plans comparison', 'DollarSign'),
  ('TestimonialBlock', 'Testimonials', 'Social Proof', 'Customer quotes', 'Quote'),
  ('TimelineBlock', 'Timeline', 'Content', 'Chronological events', 'Calendar'),
  ('GalleryBlock', 'Gallery', 'Media', 'Image gallery grid', 'Image')
ON CONFLICT (name) DO NOTHING;

-- ==================== SETTINGS ====================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'My Site',
  site_description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  theme_primary_color TEXT DEFAULT '#6366f1',
  theme_secondary_color TEXT DEFAULT '#ec4899',
  og_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO site_settings (id, site_name) VALUES (uuid_generate_v4(), 'My Site')
ON CONFLICT DO NOTHING;

-- ==================== AUDIT LOG ====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==================== STORAGE BUCKETS ====================
-- Run via Supabase dashboard or CLI:
-- supabase storage create-bucket page-media --public

-- After bucket creation, set RLS policies:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('page-media', 'page-media', true);

-- ==================== TRIGGERS ====================
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (action, entity_type, entity_id, user_id, changes)
  VALUES (
    TG_ARGV[0],
    TG_TABLE_NAME,
    NEW.id,
    auth.uid(),
    jsonb_build_object('old', OLD, 'new', NEW)
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER audit_pages_update AFTER UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION audit_changes('UPDATE');

CREATE TRIGGER audit_pages_insert AFTER INSERT ON pages
  FOR EACH ROW EXECUTE FUNCTION audit_changes('INSERT');

-- ==================== VIEWS ====================
CREATE OR REPLACE VIEW public.pages_with_stats AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.published,
  p.created_at,
  p.updated_at,
  (SELECT COUNT(*) FROM page_versions WHERE page_id = p.id) as version_count,
  (SELECT COUNT(*) FROM active_editors WHERE page_id = p.id) as active_editors_count
FROM pages p
WHERE p.deleted_at IS NULL;

-- ==================== MIGRATIONS COMPLETE ==================
-- Run migrations:
-- npx drizzle-kit push --config=drizzle.config.ts
