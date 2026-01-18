-- Add availability settings to users (artists)
-- This column allows artists to define their default working slots or hours.
-- Structure example:
-- {
--   "default_slots": ["10:00", "14:00"], 
--   "days_off": [0, 6], -- 0=Sunday, 6=Saturday
--   "overrides": { "2024-05-20": ["10:00", "12:00", "16:00"] }
-- }

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{
    "default_slots": ["10:00", "14:00", "16:00"],
    "days_off": [0]
}'::jsonb;
