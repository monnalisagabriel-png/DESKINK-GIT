DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260118010000';

-- Add Stripe Connect fields to public.users to allow Artists to receive payments
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_account_status text DEFAULT 'pending';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_id ON public.users(stripe_account_id);

-- Comment
COMMENT ON COLUMN public.users.stripe_account_id IS 'Connected Stripe Account ID (acct_...) for direct payouts';
