-- Add notes column to waitlist_entries
ALTER TABLE public.waitlist_entries 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Comment
COMMENT ON COLUMN public.waitlist_entries.notes IS 'Internal notes for the studio (highlighted in red)';
