-- Check if there are any artists enabled for public booking
SELECT id, full_name, role, is_public_booking_enabled, studio_id 
FROM public.users
WHERE role IN ('artist', 'owner');
