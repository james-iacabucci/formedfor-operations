-- Add new 'name' column to sculptures table
ALTER TABLE sculptures ADD COLUMN IF NOT EXISTS name text;

-- Populate the name column with existing data (prefer manual_name, fall back to ai_generated_name)
UPDATE sculptures SET name = COALESCE(manual_name, ai_generated_name, '');

-- Make name NOT NULL with default empty string
ALTER TABLE sculptures ALTER COLUMN name SET NOT NULL;
ALTER TABLE sculptures ALTER COLUMN name SET DEFAULT '';