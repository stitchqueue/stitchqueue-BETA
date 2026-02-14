-- ============================================================================
-- Intake Form columns on organizations table
-- Run in Supabase SQL Editor
-- ============================================================================

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS intake_form_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS intake_form_slug text UNIQUE,
ADD COLUMN IF NOT EXISTS intake_auto_response text DEFAULT 'Hi {client_name}, thank you for your quilting request! We''ve received your information and will be in touch soon.',
ADD COLUMN IF NOT EXISTS intake_notification_email text;

-- Index for slug lookups (public route)
CREATE INDEX IF NOT EXISTS idx_organizations_intake_slug ON organizations(intake_form_slug)
WHERE intake_form_slug IS NOT NULL;

-- ============================================================================
-- Add intake-related columns to projects table
-- ============================================================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS client_supplies_backing boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_type text;
