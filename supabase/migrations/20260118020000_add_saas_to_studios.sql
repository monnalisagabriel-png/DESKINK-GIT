DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260118020000';

-- Add SaaS Subscription fields to studios table

ALTER TABLE public.studios 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none', -- active, past_due, canceled, trialing, none
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'basic', -- basic, pro, plus
ADD COLUMN IF NOT EXISTS max_artists integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_managers integer DEFAULT 1;

-- Update existing studios to have a default (e.g., Basic or Trial)
UPDATE public.studios 
SET subscription_status = 'active',
    subscription_tier = 'basic',
    max_artists = 1,
    max_managers = 1
WHERE subscription_status = 'none';

-- Add check constraints for valid tiers and status
ALTER TABLE public.studios DROP CONSTRAINT IF EXISTS check_subscription_tier;
ALTER TABLE public.studios 
ADD CONSTRAINT check_subscription_tier CHECK (subscription_tier IN ('basic', 'pro', 'plus'));

ALTER TABLE public.studios DROP CONSTRAINT IF EXISTS check_subscription_status;
ALTER TABLE public.studios 
ADD CONSTRAINT check_subscription_status CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing', 'none'));

-- Comment on columns
COMMENT ON COLUMN public.studios.stripe_customer_id IS 'Stripe Customer ID for the studio owner';
COMMENT ON COLUMN public.studios.stripe_subscription_id IS 'Active Stripe Subscription ID';
COMMENT ON COLUMN public.studios.subscription_status IS 'Current status of the subscription';
COMMENT ON COLUMN public.studios.subscription_tier IS 'Selected plan tier (basic, pro, plus)';
