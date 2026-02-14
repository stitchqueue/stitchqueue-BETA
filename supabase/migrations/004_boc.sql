-- ============================================================================
-- BOC (Business Overhead Calculator) Tables
-- Run in Supabase SQL Editor
-- ============================================================================

-- boc_settings: one row per user for their rate calculator inputs
CREATE TABLE boc_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rate calculator inputs
  target_hourly_wage numeric DEFAULT 0,
  experience_level text DEFAULT 'experienced' CHECK (experience_level IN ('novice', 'experienced', 'expert')),
  sph_rate numeric DEFAULT 2000,

  -- Overhead (computed total + itemized breakdown)
  monthly_overhead numeric DEFAULT 0,
  overhead_items jsonb DEFAULT '{"machinePayment":0,"insurance":0,"rentSpace":0,"utilities":0,"software":0,"other":0}'::jsonb,

  -- Incidentals (computed total + itemized breakdown)
  incidentals_minutes numeric DEFAULT 0,
  incidentals_items jsonb DEFAULT '{"consultationPlanning":0,"threadingPrep":0,"loadingUnloading":0,"packaging":0,"photos":0,"billingAdmin":0}'::jsonb,

  -- Project parameters
  projects_per_month numeric DEFAULT 10,
  avg_project_size numeric DEFAULT 6000,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- One row per user
  UNIQUE(user_id)
);

-- RLS policies for boc_settings
ALTER TABLE boc_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own BOC settings"
ON boc_settings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own BOC settings"
ON boc_settings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own BOC settings"
ON boc_settings FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_boc_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER boc_settings_updated_at
  BEFORE UPDATE ON boc_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_boc_settings_updated_at();

-- Index for fast lookup
CREATE INDEX idx_boc_settings_user_id ON boc_settings(user_id);


-- ============================================================================
-- boc_manual_projects: manual project entries for overhead tracking (UI later)
-- ============================================================================

CREATE TABLE boc_manual_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  project_date date DEFAULT CURRENT_DATE,
  sq_inches numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  project_type text DEFAULT 'regular' CHECK (project_type IN ('regular', 'gift', 'charitable')),
  materials_cost numeric DEFAULT 0,
  mileage_miles numeric DEFAULT 0,
  charity_name text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS policies for boc_manual_projects
ALTER TABLE boc_manual_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own BOC projects"
ON boc_manual_projects FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own BOC projects"
ON boc_manual_projects FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own BOC projects"
ON boc_manual_projects FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own BOC projects"
ON boc_manual_projects FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_boc_manual_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER boc_manual_projects_updated_at
  BEFORE UPDATE ON boc_manual_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_boc_manual_projects_updated_at();

-- Index for fast lookup
CREATE INDEX idx_boc_manual_projects_user_id ON boc_manual_projects(user_id);
CREATE INDEX idx_boc_manual_projects_date ON boc_manual_projects(user_id, project_date);
