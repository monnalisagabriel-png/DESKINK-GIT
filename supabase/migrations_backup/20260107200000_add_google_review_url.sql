-- Add google_review_url column to studios table
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS google_review_url TEXT;

-- No special RLS needed as generic studio generic update/select policies already cover 'all columns' usually.
-- But checking if specific column policies exist? No, usually it's row-level.
