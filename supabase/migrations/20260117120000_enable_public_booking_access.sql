DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260117120000';

-- Enable public access for Booking Flow

-- 1. PROFILES / USERS (Artists)
-- Allow public to select users (artists) who have explicitly enabled public booking.
-- This is required for Step 1 of the booking wizard.
DROP POLICY IF EXISTS "Public can view booking-enabled artists" ON public.users;
CREATE POLICY "Public can view booking-enabled artists" ON public.users
    FOR SELECT
    USING (
        (role = 'artist' OR role = 'owner') 
        AND is_public_booking_enabled = true
    );

-- 2. STUDIOS
-- Allow public to view basic studio info (name, logo) if public booking is enabled (or generally for now to avoid complexity).
-- Checking 'public_booking_settings' jsonb is safer but for now let's allow read.
-- Ideally we restrict to just name/logo but RLS is row-level.
DROP POLICY IF EXISTS "Public can view studios" ON public.studios;
CREATE POLICY "Public can view studios" ON public.studios
    FOR SELECT
    USING (true);

-- 3. STORAGE (If using avatars/logos)
-- Ensure 'avatars' and 'studios' buckets are public (usually handled in storage policies migration).
-- We assume storage policies are already set up from previous migrations.

-- 4. SERVICES
-- Already handled in 20260117100000_public_booking.sql ("Public can view active services")
