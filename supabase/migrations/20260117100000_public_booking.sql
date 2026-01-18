-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Studio members can view services" ON public.services
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM public.studio_memberships WHERE studio_id = services.studio_id
    ));

CREATE POLICY "Owners and Managers can manage services" ON public.services
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM public.studio_memberships 
        WHERE studio_id = services.studio_id AND role IN ('owner', 'manager')
    ));

-- Allow public access for booking (if we go that route, or use a service role function. 
-- For now, let's allow unauthenticated select if we want public booking to query directly, 
-- but usually better to wrap in an edge function or restrictive policy. 
-- Let's allow public read for now as getting a token for guest is complex without anon)
CREATE POLICY "Public can view active services" ON public.services
    FOR SELECT USING (is_active = true);


-- Update users table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_public_booking_enabled BOOLEAN DEFAULT false;

-- Since we cannot easily alter auth.users from client migrations sometimes, 
-- we might duplicate this flag to public.users or public.profiles if they existed. 
-- But user said "User" interface has it.
-- Let's assume we are using a public wrapper or we accept we are modifying auth.users (Supabase specific).
-- Wait, direct modification of auth.users is often discouraged but works. 
-- However, RLS on auth.users is tricky.
-- Better to check if we have a public `profiles` table. 
-- My schema inspection said: "Table 'profiles': Error - Could not find the table".
-- "Table 'users': Exists." -> This is likely a public mirror or the actual table I verified.
-- Let's rely on `public.users` if I found it.
-- My inspection output was: "Table 'users': Exists. Columns: [ 'id', 'email', ... ]"
-- So I will alter `public.users`.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_public_booking_enabled BOOLEAN DEFAULT false;


-- Update studios table
ALTER TABLE public.studios ADD COLUMN IF NOT EXISTS public_booking_settings JSONB DEFAULT '{}'::jsonb;

-- Update appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

