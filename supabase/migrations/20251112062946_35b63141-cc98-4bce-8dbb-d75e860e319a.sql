-- Add missing columns to profiles and sculptures tables

-- Add avatar_url to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Add image_url to sculptures if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sculptures' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.sculptures ADD COLUMN image_url TEXT;
  END IF;
END $$;