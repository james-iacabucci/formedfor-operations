-- Drop the existing constraint that doesn't include 'zip_import'
ALTER TABLE sculptures 
DROP CONSTRAINT IF EXISTS sculptures_import_source_check;

-- Add the updated constraint that includes 'zip_import'
ALTER TABLE sculptures 
ADD CONSTRAINT sculptures_import_source_check 
CHECK (import_source = ANY (ARRAY['manual'::text, 'excel_import'::text, 'zip_import'::text]));