-- Migration: Add account_status to public.users
-- Description: Adds a status field to track if a user has completed the payment flow.

-- Add column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'pending';

-- Add check constraint for valid statuses
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_account_status;
ALTER TABLE public.users 
ADD CONSTRAINT check_account_status CHECK (account_status IN ('pending', 'active', 'suspended'));

-- Comment
COMMENT ON COLUMN public.users.account_status IS 'Status of the user account: pending (unpaid), active (paid/verified), suspended.';

-- Update existing users to 'active' to avoid locking out current valid users
UPDATE public.users SET account_status = 'active' WHERE account_status = 'pending';
