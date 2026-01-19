
DO $$
BEGIN
    DELETE FROM auth.users WHERE email IN (
        'owner.test@inkflow.com',
        'manager.test@inkflow.com',
        'artist1.test@inkflow.com',
        'student1.test@inkflow.com'
    );

    DELETE FROM public.studios WHERE name = 'Test Studio';

    RAISE NOTICE 'Cleaned up test users and studio. You can now register manually.';
END $$;
