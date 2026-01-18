-- 1. Create the Trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Backfill missing public.users for the new test users
-- This inserts public.users records for any auth.users that don't have one matching ID.
INSERT INTO public.users (id, email, full_name, role)
SELECT 
    au.id, 
    au.email, 
    au.raw_user_meta_data->>'full_name', 
    'STUDENT' -- Default fallback, but we'll update memberships in a moment if needed
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Note: The trigger sets role to 'STUDENT' by default. 
-- The previous seed script inserted studio_memberships with correct roles ('manager', 'artist', 'student').
-- The application relies on studio_memberships for permissions, so 'student' in public.users is acceptable 
-- as long as strict RLS doesn't block it. 
-- Ideally public.users.role should match, but usually it's just a default.
