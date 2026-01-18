-- Create saas_plans table
CREATE TABLE IF NOT EXISTS public.saas_plans (
    id TEXT PRIMARY KEY, -- 'starter', 'pro', 'plus'
    name TEXT NOT NULL,
    price_monthly NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    max_artists INTEGER NOT NULL, -- -1 for unlimited
    max_managers INTEGER NOT NULL, -- -1 for unlimited
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for saas_plans
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to plans" ON public.saas_plans FOR SELECT USING (true);

-- Insert default plans
INSERT INTO public.saas_plans (id, name, price_monthly, max_artists, max_managers, features)
VALUES 
    ('starter', 'Starter', 20.00, 2, 1, '["1 Studio", "1 Manager", "Fino a 2 Tatuatori", "Gestione agenda digitale", "Lista d''attesa online", "Database clienti"]'),
    ('pro', 'Pro', 40.00, 3, 2, '["1 Studio", "Fino a 2 Manager", "Fino a 3 Tatuatori", "Tutte le funzioni Starter", "Gestione avanzata staff", "Maggiore controllo operativo"]'),
    ('plus', 'Plus', 100.00, -1, 5, '["1 Studio", "Fino a 5 Manager", "Tatuatori illimitati", "Tutte le funzioni Pro", "Massima scalabilità", "Nessun limite alla crescita"]')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    max_artists = EXCLUDED.max_artists,
    max_managers = EXCLUDED.max_managers,
    features = EXCLUDED.features;

-- Create saas_subscriptions table
CREATE TABLE IF NOT EXISTS public.saas_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.saas_plans(id),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'trialing'
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(studio_id)
);

-- Enable RLS for saas_subscriptions
ALTER TABLE public.saas_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own studio's subscription
CREATE POLICY "View own studio subscription" ON public.saas_subscriptions
    FOR SELECT
    USING (
        exists (
            select 1 from public.studio_memberships
            where studio_memberships.studio_id = saas_subscriptions.studio_id
            and studio_memberships.user_id = auth.uid()
        )
    );

-- Policy: Only service role can update subscriptions (via webhooks)
-- OR for development, let authenticated users update (TEMPORARY - REMOVE IN PROD)
-- We will rely on Edge Functions for updates, but for now we might need manual inserts for testing.
CREATE POLICY "Dev: Allow update" ON public.saas_subscriptions FOR ALL USING (auth.role() = 'authenticated');
