ALTER TABLE public.studios 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Index for faster lookups by customer ID (used by webhooks)
CREATE INDEX IF NOT EXISTS idx_studios_stripe_customer_id ON public.studios(stripe_customer_id);
