-- Link monnalisagabriel@gmail.com to the studio as an Artist
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

    -- 2. Find the user 'monnalisagabriel@gmail.com'
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'monnalisagabriel@gmail.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User monnalisagabriel@gmail.com not found.';
    END IF;

    IF v_studio_id IS NULL THEN
        RAISE EXCEPTION 'Studio for trimarchitattoostudio@gmail.com not found.';
    END IF;

    -- 3. Insert/Update Membership
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (v_studio_id, v_user_id, 'artist')
    ON CONFLICT (studio_id, user_id) DO UPDATE SET role = 'artist';

    -- 4. Update public.users role
    UPDATE public.users 
    SET role = 'artist' 
    WHERE id = v_user_id;

    -- 5. IMPORTANT: Ensure instance_id matches (just in case)
    UPDATE auth.users
    SET instance_id = (SELECT instance_id FROM auth.users WHERE email = 'trimarchitattoostudio@gmail.com')
    WHERE id = v_user_id;
    
    RAISE NOTICE 'SUCCESS: Linked monnalisagabriel@gmail.com as ARTIST to studio %', v_studio_id;
END $$;
