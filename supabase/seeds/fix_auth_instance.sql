-- Fix instance_id for test users
-- We copy the instance_id from the existing working user 'trimarchitattoostudio@gmail.com'

DO $$
DECLARE
    v_instance_id UUID;
BEGIN
    -- 1. Get the correct instance_id
    SELECT instance_id INTO v_instance_id
    FROM auth.users
    WHERE email = 'trimarchitattoostudio@gmail.com'
    LIMIT 1;

    IF v_instance_id IS NULL THEN
        RAISE NOTICE 'Could not find source user, looking for any user...';
        SELECT instance_id INTO v_instance_id FROM auth.users LIMIT 1;
    END IF;

    -- 2. Update the test users
    UPDATE auth.users
    SET instance_id = v_instance_id
    WHERE email IN (
        'manager.test@inkflow.com', 
        'artist1.test@inkflow.com', 
        'artist2.test@inkflow.com',
        'student1.test@inkflow.com',
        'student2.test@inkflow.com'
    );
    
    RAISE NOTICE 'Updated instance_id to %', v_instance_id;
END $$;
