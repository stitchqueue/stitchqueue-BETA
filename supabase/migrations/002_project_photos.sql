-- Migration: v4.0 Phase 4 — Project Photos
-- Date: 2026-02-14
-- Purpose: Create project_photos table and storage policies for photo uploads
--
-- Storage bucket "project-photos" must be created manually in Supabase Dashboard.
-- See BUCKET SETUP INSTRUCTIONS at bottom of this file.
--
-- Folder structure: project-photos/{project_id}/{filename}

-- ============================================================================
-- STEP 1: Create project_photos table
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  uploaded_by text NOT NULL DEFAULT 'quilter' CHECK (uploaded_by IN ('quilter', 'client')),
  photo_type text CHECK (photo_type IN ('intake', 'progress', 'completed')),
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  uploaded_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- STEP 2: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_project_photos_project_id
  ON project_photos(project_id);

CREATE INDEX IF NOT EXISTS idx_project_photos_org_id
  ON project_photos(organization_id);

CREATE INDEX IF NOT EXISTS idx_project_photos_display_order
  ON project_photos(project_id, display_order);

-- ============================================================================
-- STEP 3: Enable RLS and create policies for project_photos table
-- ============================================================================

ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view photos belonging to their organization
CREATE POLICY "Users can view their project photos"
  ON project_photos
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- INSERT: Users can add photos to projects in their organization
CREATE POLICY "Users can upload photos to their projects"
  ON project_photos
  FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    AND project_id IN (
      SELECT id FROM projects
      WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- UPDATE: Users can update photo metadata in their organization
CREATE POLICY "Users can update their project photos"
  ON project_photos
  FOR UPDATE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- DELETE: Users can delete photos from their organization
CREATE POLICY "Users can delete their project photos"
  ON project_photos
  FOR DELETE
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 4: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_project_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_photos_timestamp
  BEFORE UPDATE ON project_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_project_photos_updated_at();

-- ============================================================================
-- STEP 5: Storage bucket RLS policies
-- ============================================================================
-- These policies control access to files in the "project-photos" bucket.
-- The folder structure is: project-photos/{project_id}/{filename}
-- (storage.foldername(name))[1] extracts the project_id from the path.

-- Upload: Authenticated users can upload to their own project folders
CREATE POLICY "Users can upload to their project folders"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'project-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Read: Authenticated users can view files in their own project folders
CREATE POLICY "Users can view their project storage files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Update: Authenticated users can update files in their own project folders
CREATE POLICY "Users can update their project storage files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'project-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Delete: Authenticated users can delete files in their own project folders
CREATE POLICY "Users can delete their project storage files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'project-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE organization_id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- BUCKET SETUP INSTRUCTIONS (Manual — Supabase Dashboard)
-- ============================================================================
--
-- The storage bucket must be created manually before running this migration.
--
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click "Storage" in the left sidebar
-- 4. Click "New Bucket"
-- 5. Configure:
--    - Bucket name: project-photos
--    - Public bucket: OFF (private, auth required)
--    - File size limit: 10485760 (10 MB)
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/heic
-- 6. Click "Create Bucket"
--
-- After creating the bucket, run this migration to set up the table and policies.
-- ============================================================================
