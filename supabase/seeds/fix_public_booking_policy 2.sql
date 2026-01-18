-- Enable public read access to users (artists) for booking
-- This is necessary because the booking page fetches artists before services
-- Restrict to only necessary fields if possible, but for now Select * is filtered by RLS condition

CREATE POLICY "Public can view artists" ON public.users
    FOR SELECT
    USING (
        -- Only allow viewing users who have public booking enabled
        is_public_booking_enabled = true
        -- AND role IN ('artist', 'owner') -- Optional extra safety
    );

-- Also ensure public can view studio info if needed (though not queried directly in the component yet, the URL params use it)
-- Usually checking studio existence is good.
-- Let's check permissions for studios table too just in case.
CREATE POLICY "Public can view studios" ON public.studios
    FOR SELECT
    USING (true); -- Or restricts to active studios
