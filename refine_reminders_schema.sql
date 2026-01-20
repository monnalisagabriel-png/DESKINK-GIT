-- Migration: Refine appointments table for multi-stage reminders

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS reminder_7d_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE;

-- Optional: Create indexes if we query these often for background jobs
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_7d ON appointments(reminder_7d_sent);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h ON appointments(reminder_24h_sent);
