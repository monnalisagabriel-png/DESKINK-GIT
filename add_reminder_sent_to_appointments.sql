-- Migration: Add reminder_sent column to appointments table

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Optional: Add index for performance if querying by this often
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent ON appointments(reminder_sent);
