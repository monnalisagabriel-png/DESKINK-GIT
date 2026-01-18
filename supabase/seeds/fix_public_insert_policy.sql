-- Allow public (anon) to insert into clients and appointments for booking
-- NOTE: In production, consider using a securely signed Edge Function instead of opening up INSERT permissions.
-- For this MVP/Demo, RLS with validation or a simple Allow policy works.

-- 1. Clients Table - Allow Insert for public
CREATE POLICY "Public can create client profiles" ON public.clients
    FOR INSERT
    WITH CHECK (true); -- Ideally validate studio_id matches a public studio

-- 2. Appointments Table - Allow Insert for public
CREATE POLICY "Public can create appointments" ON public.appointments
    FOR INSERT
    WITH CHECK (true);

-- 3. Studio Invitations/Memberships not needed for public.

-- Optional: Allow public to "Select" the appointment they just created? 
-- Usually not needed if we just return the ID.

-- Ensure RLS is enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
