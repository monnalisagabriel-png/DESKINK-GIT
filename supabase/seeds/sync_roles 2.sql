-- Update public.users roles to match what is in studio_memberships
-- This fixes the issue where backfilled users defaulted to 'student'

UPDATE public.users u
SET role = sm.role
FROM public.studio_memberships sm
WHERE u.id = sm.user_id
AND u.email IN (
    'manager.test@inkflow.com', 
    'artist1.test@inkflow.com', 
    'artist2.test@inkflow.com',
    'student1.test@inkflow.com',
    'student2.test@inkflow.com'
);
