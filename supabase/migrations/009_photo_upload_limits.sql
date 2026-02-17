-- Migration: v5.0 Security — Photo upload server-side limits
-- Date: 2026-02-17
-- Purpose: Enforce photo count and upload rate limits at the database level
--
-- Fixes two audit findings:
--   MEDIUM-1: Photo count limit (10 per project) was client-side only
--   MEDIUM-2: No rate limiting on photo uploads
--
-- The trigger function runs BEFORE INSERT on project_photos and:
--   1. Rejects the insert if the project already has 10 photos
--   2. Rejects the insert if the organization has uploaded 30+ photos
--      in the last 10 minutes (rate limit)

-- ============================================================================
-- STEP 1: Index for efficient rate-limit lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_project_photos_org_uploaded_at
  ON project_photos(organization_id, uploaded_at);

-- ============================================================================
-- STEP 2: Trigger function — enforces count + rate limits
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_photo_limits()
RETURNS TRIGGER AS $$
DECLARE
  photo_count integer;
  recent_uploads integer;
BEGIN
  -- 1. Max 10 photos per project
  SELECT COUNT(*) INTO photo_count
  FROM project_photos
  WHERE project_id = NEW.project_id;

  IF photo_count >= 10 THEN
    RAISE EXCEPTION 'Maximum 10 photos per project reached'
      USING ERRCODE = 'check_violation';
  END IF;

  -- 2. Rate limit: max 30 uploads per organization per 10 minutes
  SELECT COUNT(*) INTO recent_uploads
  FROM project_photos
  WHERE organization_id = NEW.organization_id
    AND uploaded_at > NOW() - INTERVAL '10 minutes';

  IF recent_uploads >= 30 THEN
    RAISE EXCEPTION 'Upload rate limit exceeded. Please wait before uploading more photos.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Attach trigger to project_photos table
-- ============================================================================

-- Drop if exists (idempotent re-run)
DROP TRIGGER IF EXISTS enforce_photo_limits_trigger ON project_photos;

CREATE TRIGGER enforce_photo_limits_trigger
  BEFORE INSERT ON project_photos
  FOR EACH ROW
  EXECUTE FUNCTION enforce_photo_limits();
