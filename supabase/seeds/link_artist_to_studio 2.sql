-- Link the manually registered artist to the studio
DO $$
DECLARE
    v_studio_id UUID;
    v_user_id UUID;
BEGIN
    -- 1. Find the Studio ID for 'trimarchitattoostudio@gmail.com'
    SELECT m.studio_id INTO v_studio_id
    FROM public.users u
    JOIN public.studio_memberships m ON u.id = m.user_id
    WHERE u.email = 'trimarchitattoostudio@gmail.com'
    LIMIT 1;

    -- 2. Find the newly registered user 'artist1.test@inkflow.com'
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'artist1.test@inkflow.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User artist1.test@inkflow.com not found. Make sure you registered via the Login page first!';
    END IF;

    IF v_studio_id IS NULL THEN
        RAISE EXCEPTION 'Studio for trimarchitattoostudio@gmail.com not found.';
    END IF;

    -- 3. Insert/Update Membership
    -- We use ON CONFLICT in case they already joined a studio (though unlikely for new user)
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (v_studio_id, v_user_id, 'artist')
    ON CONFLICT (studio_id, user_id) DO UPDATE SET role = 'artist';

    -- 4. Update public.users role
    UPDATE public.users 
    SET role = 'artist' 
    WHERE id = v_user_id;
    
    RAISE NOTICE 'SUCCESS: Linked artist1.test to studio with ID %', v_studio_id;
END $$;
