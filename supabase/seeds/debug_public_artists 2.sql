-- Debug script to check why artists are not showing up
-- We verify the data in public.users to see if is_public_booking_enabled is true, 
-- and if the studio_id matches what we expect.

SELECT 
    id, 
    email, 
    full_name, 
    role, 
    studio_id, 
    is_public_booking_enabled
FROM public.users
WHERE role IN ('artist', 'owner')
ORDER BY created_at DESC;

-- Also check if the policies are actually active
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check if anonymous role has access (basic check)
-- This won't simulate anon but confirms policy existence
