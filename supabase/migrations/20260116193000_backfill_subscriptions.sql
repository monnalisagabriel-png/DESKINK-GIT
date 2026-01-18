-- Backfill existing studios to 'starter' plan
INSERT INTO public.saas_subscriptions (studio_id, plan_id, status)
SELECT id, 'starter', 'active'
FROM public.studios
WHERE id NOT IN (SELECT studio_id FROM public.saas_subscriptions);
