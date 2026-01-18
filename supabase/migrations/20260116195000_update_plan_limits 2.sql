UPDATE public.saas_plans 
SET max_artists = 2, max_managers = 1 
WHERE id = 'starter';

UPDATE public.saas_plans 
SET max_artists = 3, max_managers = 2 
WHERE id = 'pro';

UPDATE public.saas_plans 
SET max_artists = 999999, max_managers = 5 
WHERE id = 'plus';
