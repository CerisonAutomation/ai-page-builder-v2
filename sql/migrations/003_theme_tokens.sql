-- Migration: Add theme_tokens JSONB column to site_settings
-- Run this in the Supabase SQL editor or via the migration tool.

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS theme_tokens JSONB DEFAULT '{}';

COMMENT ON COLUMN site_settings.theme_tokens IS
  'Structured theme design tokens (colorPrimary, colorSecondary, fontFamily, etc.)';
