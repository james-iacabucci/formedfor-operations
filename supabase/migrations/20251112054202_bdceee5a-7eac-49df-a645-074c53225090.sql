-- Add import tracking fields to sculptures table
ALTER TABLE sculptures
ADD COLUMN IF NOT EXISTS import_source text DEFAULT 'manual' CHECK (import_source IN ('manual', 'excel_import')),
ADD COLUMN IF NOT EXISTS import_batch_id uuid,
ADD COLUMN IF NOT EXISTS last_import_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS import_metadata jsonb;

-- Create index for faster filtering by import source
CREATE INDEX IF NOT EXISTS idx_sculptures_import_source ON sculptures(import_source);
CREATE INDEX IF NOT EXISTS idx_sculptures_import_batch_id ON sculptures(import_batch_id);

-- Create import logs table for comprehensive logging
CREATE TABLE IF NOT EXISTS import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  level text NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message text NOT NULL,
  row_number integer,
  row_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create index for faster log queries
CREATE INDEX IF NOT EXISTS idx_import_logs_batch_id ON import_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_level ON import_logs(level);

-- Enable RLS on import_logs
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view logs
CREATE POLICY "Admins can view import logs"
ON import_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow system to insert logs
CREATE POLICY "Authenticated users can insert import logs"
ON import_logs FOR INSERT
WITH CHECK (true);

-- Create import batches table for tracking
CREATE TABLE IF NOT EXISTS import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  file_name text,
  total_rows integer,
  successful_rows integer DEFAULT 0,
  failed_rows integer DEFAULT 0,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')),
  completed_at timestamp with time zone
);

-- Enable RLS on import_batches
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

-- Allow admins to view batches
CREATE POLICY "Admins can view import batches"
ON import_batches FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));