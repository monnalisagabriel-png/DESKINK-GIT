-- Update/Insert SaaS Plans to match DeskInk 2026 Configuration

-- 1. Starter/Basic (Mapped from 'basic' in frontend/code to 'starter' in DB currently, or we can unify)
-- We will update 'starter' to match "DeskInk Basic"
INSERT INTO public.saas_plans (id, name, price_monthly, max_artists, max_managers, features)
VALUES 
    ('starter', 'DeskInk Basic', 20.00, 1, 1, '["1 Studio", "1 Manager", "1 Artist"]'::jsonb),
    ('pro', 'DeskInk Pro', 40.00, 2, 2, '["1 Studio", "2 Managers", "2 Artists"]'::jsonb),
    ('plus', 'DeskInk Plus', 70.00, 4, 4, '["1 Studio", "4 Managers", "4 Artists", "Add extra users (+10€/mo)"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    max_artists = EXCLUDED.max_artists,
    max_managers = EXCLUDED.max_managers,
    features = EXCLUDED.features;

-- Ensure 'extra' definition exists if we want to track it, though usually plans table tracks base tiers.
-- We could add a generic item or just handle extra logic in code as done.
