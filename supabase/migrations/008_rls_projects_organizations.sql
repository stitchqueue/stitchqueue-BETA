-- 008_rls_projects_organizations.sql
-- Enable RLS and add tenant-isolation policies for projects, organizations, and profiles.
-- Safe to re-run — all policies use IF NOT EXISTS checks.
--
-- IMPORTANT: Apply this manually via Supabase Dashboard SQL editor or CLI.
-- Do NOT run blindly — review each section for your environment.

-- ============================================================
-- PROJECTS TABLE
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only see projects belonging to their organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Users can view own org projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own org projects" ON projects FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))';
  END IF;
END $$;

-- INSERT: users can only create projects in their organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Users can insert own org projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own org projects" ON projects FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))';
  END IF;
END $$;

-- UPDATE: users can only update projects in their organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Users can update own org projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own org projects" ON projects FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))';
  END IF;
END $$;

-- DELETE: users can only delete projects in their organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'projects' AND policyname = 'Users can delete own org projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own org projects" ON projects FOR DELETE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))';
  END IF;
END $$;


-- ============================================================
-- ORGANIZATIONS TABLE
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only view their own organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'organizations' AND policyname = 'Users can view own organization'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own organization" ON organizations FOR SELECT USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))';
  END IF;
END $$;

-- UPDATE: users can only update their own organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'organizations' AND policyname = 'Users can update own organization'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own organization" ON organizations FOR UPDATE USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))';
  END IF;
END $$;

-- INSERT is handled via service role during signup (no user policy needed)


-- ============================================================
-- PROFILES TABLE (verify/add if missing)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid())';
  END IF;
END $$;

-- UPDATE: users can only update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid())';
  END IF;
END $$;


-- ============================================================
-- VERIFICATION QUERY (run after applying)
-- ============================================================
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
