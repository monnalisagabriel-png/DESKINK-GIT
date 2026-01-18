-- Check if the users actually exist in public.users
SELECT id, email, full_name, role 
FROM public.users 
WHERE email IN (
    'manager.test@inkflow.com', 
    'artist1.test@inkflow.com', 
    'artist2.test@inkflow.com',
    'student1.test@inkflow.com',
    'student2.test@inkflow.com'
);
