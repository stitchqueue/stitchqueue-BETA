-- ============================================================================
-- Onboarding flag on organizations table
-- Run in Supabase SQL Editor
-- ============================================================================

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
