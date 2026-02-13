-- Migration: v4.0 Stage Refactor (Fixed - No Tax Column Dependencies)
-- Date: 2026-02-13
-- Purpose: Refactor from 5-stage to 3-stage workflow with new checklist fields

-- ============================================================================
-- STEP 1: Add new columns to projects table
-- ============================================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS approval_status BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS approval_date DATE,
  ADD COLUMN IF NOT EXISTS invoiced BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS invoiced_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS invoiced_date DATE,
  ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS paid_date DATE,
  ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivery_method TEXT CHECK (delivery_method IN ('pickup', 'shipped', 'mailed')),
  ADD COLUMN IF NOT EXISTS delivery_date DATE,
  ADD COLUMN IF NOT EXISTS balance_remaining NUMERIC,
  ADD COLUMN IF NOT EXISTS donated_value NUMERIC,
  ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'regular' CHECK (project_type IN ('regular', 'gift', 'charitable'));

-- ============================================================================
-- STEP 2: Add new enum values (keeping old ones temporarily for migration)
-- ============================================================================

-- Add new stage values to existing enum
ALTER TYPE project_stage ADD VALUE IF NOT EXISTS 'estimates';
ALTER TYPE project_stage ADD VALUE IF NOT EXISTS 'completed';

-- ============================================================================
-- STEP 3: Migrate existing data to new stage values
-- ============================================================================

-- Update stage values according to migration rules
UPDATE projects SET stage =
  CASE
    WHEN stage IN ('intake', 'estimate') THEN 'estimates'::project_stage
    WHEN stage = 'in_progress' THEN 'in_progress'::project_stage
    WHEN stage IN ('invoiced', 'paid_shipped') THEN 'completed'::project_stage
    WHEN stage = 'archived' THEN 'archived'::project_stage
    ELSE stage
  END;

-- ============================================================================
-- STEP 4: Populate new fields from existing data for completed projects
-- ============================================================================

-- For projects that moved to 'completed' stage, populate new fields from old data
UPDATE projects
SET
  -- Set invoiced = true for all completed projects
  invoiced = true,

  -- Copy estimate amount to invoiced_amount
  invoiced_amount = COALESCE(
    (estimate_data->>'total')::numeric,
    0
  ),

  -- Set paid = true if project was in 'paid_shipped' stage
  paid = CASE
    WHEN stage = 'completed' AND (
      SELECT stage FROM projects p2
      WHERE p2.id = projects.id
      AND p2.stage IN ('paid_shipped')
    ) IS NOT NULL
    THEN true
    ELSE false
  END,

  -- Copy final_payment_amount to paid_amount if it exists
  paid_amount = final_payment_amount,

  -- Calculate balance_remaining (invoiced - deposit - paid)
  balance_remaining = COALESCE(
    (estimate_data->>'total')::numeric,
    0
  ) - COALESCE(deposit_paid_amount, 0) - COALESCE(final_payment_amount, 0)

WHERE stage = 'completed';

-- ============================================================================
-- STEP 5: Remove old enum values (must be done after all data is migrated)
-- ============================================================================

-- Note: PostgreSQL doesn't support ALTER TYPE ... DROP VALUE directly
-- We need to create a new enum and swap it out

-- Create new enum with only the new stage values
CREATE TYPE project_stage_new AS ENUM ('estimates', 'in_progress', 'completed', 'archived');

-- Update the column to use the new enum
ALTER TABLE projects
  ALTER COLUMN stage TYPE project_stage_new
  USING stage::text::project_stage_new;

-- Drop old enum and rename new one
DROP TYPE project_stage;
ALTER TYPE project_stage_new RENAME TO project_stage;

-- ============================================================================
-- STEP 6: Add indexes for performance on new columns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_approval_status ON projects(approval_status);
CREATE INDEX IF NOT EXISTS idx_projects_invoiced ON projects(invoiced);
CREATE INDEX IF NOT EXISTS idx_projects_paid ON projects(paid);
CREATE INDEX IF NOT EXISTS idx_projects_delivered ON projects(delivered);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verification query (uncomment to check results):
-- SELECT
--   stage,
--   COUNT(*) as count,
--   COUNT(CASE WHEN approval_status THEN 1 END) as approved_count,
--   COUNT(CASE WHEN invoiced THEN 1 END) as invoiced_count,
--   COUNT(CASE WHEN paid THEN 1 END) as paid_count,
--   COUNT(CASE WHEN delivered THEN 1 END) as delivered_count
-- FROM projects
-- GROUP BY stage
-- ORDER BY
--   CASE stage
--     WHEN 'estimates' THEN 1
--     WHEN 'in_progress' THEN 2
--     WHEN 'completed' THEN 3
--     WHEN 'archived' THEN 4
--   END;
