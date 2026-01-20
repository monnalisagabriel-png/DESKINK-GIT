-- Migration to ensure automation_settings column exists
-- Run this in Supabase SQL Editor

ALTER TABLE studios 
ADD COLUMN IF NOT EXISTS automation_settings JSONB DEFAULT '{}'::jsonb;

-- Optional: Initialize null values to empty object
UPDATE studios 
SET automation_settings = '{}'::jsonb 
WHERE automation_settings IS NULL;
