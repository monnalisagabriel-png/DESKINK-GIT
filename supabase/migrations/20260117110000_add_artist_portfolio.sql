-- Add portfolio fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS styles text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS portfolio_photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS excluded_styles text[] DEFAULT '{}';

-- Updates to security policies might not be needed if users update their own profile, 
-- which is usually covered by "Users can update their own profile" policy.
-- Reading these public fields is likely covered by "Public read access" or specific rules.
-- Ensure these fields are public readable for the booking page.
-- Existing policy for Public Booking usually allows reading users with is_public_booking_enabled = true.
