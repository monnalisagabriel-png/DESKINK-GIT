-- Debug: Check users specifically for the Studio ID appearing in your logs
-- Studio ID from logs: 83f68f98-1082-4273-9cda-5822f5ef723a

SELECT 
    id, 
    email, 
    full_name, 
    role, 
    is_public_booking_enabled,
    studio_id
FROM public.users 
WHERE studio_id = '83f68f98-1082-4273-9cda-5822f5ef723a';

-- Also check if Monnalisa exists but has a DIFFERENT Studio ID
SELECT 
    id, 
    email, 
    studio_id as "Monnalisa Studio ID", 
    is_public_booking_enabled
FROM public.users
WHERE email = 'monnalisagabriel@gmail.com';
