-- Migration to ensure contact columns exist in 'studios' table
-- Run this in Supabase SQL Editor

ALTER TABLE studios 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Update RLS policies if necessary (usually public read is fine for studio contact info if not already)
