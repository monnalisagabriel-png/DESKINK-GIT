-- Add current_period_end to studios table
ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Comment
COMMENT ON COLUMN public.studios.current_period_end IS 'Date when the current subscription period ends';
