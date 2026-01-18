-- Fix false positive 'active' status caused by previous migration
-- If a studio is marked 'active' but has NO stripe_subscription_id, it means it was activated by mistake.
-- We reset it to 'none' so the user is forced to pay.

UPDATE public.studios
SET subscription_status = 'none'
WHERE subscription_status = 'active'
AND (stripe_subscription_id IS NULL OR stripe_subscription_id = '');
