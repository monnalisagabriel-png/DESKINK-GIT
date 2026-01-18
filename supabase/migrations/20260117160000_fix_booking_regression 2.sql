-- Ensure availability column exists on users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{
    "default_slots": ["10:00", "14:00", "16:00"], 
    "days_off": [0]
}'::jsonb;

-- Ensure public can read all users (including availability)
DROP POLICY IF EXISTS "Public can view users" ON public.users;
DROP POLICY IF EXISTS "Hotfix: View all users" ON public.users;

CREATE POLICY "Public can view users" ON public.users
FOR SELECT
TO public
USING (true);

-- Ensure public can read services
DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services" ON public.services
FOR SELECT
TO public
USING (true);

-- Ensure public can read studio details
DROP POLICY IF EXISTS "Public can view studios" ON public.studios;
CREATE POLICY "Public can view studios" ON public.studios
FOR SELECT
TO public
USING (true);
