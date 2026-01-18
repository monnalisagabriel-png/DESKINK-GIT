-- Clean up the manually created test users that are causing errors
DELETE FROM auth.users 
WHERE email IN (
    'manager.test@inkflow.com', 
    'artist1.test@inkflow.com', 
    'artist2.test@inkflow.com',
    'student1.test@inkflow.com',
    'student2.test@inkflow.com'
);

-- Delete from public.users as well just in case of leftovers
DELETE FROM public.users 
WHERE email IN (
    'manager.test@inkflow.com', 
    'artist1.test@inkflow.com', 
    'artist2.test@inkflow.com',
    'student1.test@inkflow.com',
    'student2.test@inkflow.com'
);
