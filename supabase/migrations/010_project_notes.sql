-- Add freeform text notes field to projects
-- Separate from existing 'notes' JSONB column (structured Note[] array)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_notes text DEFAULT NULL;
