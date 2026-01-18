-- Fix EVERYTHING for monnalisagabriel@gmail.com
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    v_user_id UUID;
    v_instance_id UUID;
    v_password TEXT := 'password123';
    v_encrypted_pw TEXT;
    v_studio_id UUID;
BEGIN
    -- 1. Get the user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'monnalisagabriel@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users';
    END IF;

    -- 2. Get the correct instance_id and studio_id from the owner
    SELECT instance_id INTO v_instance_id FROM auth.users WHERE email = 'trimarchitattoostudio@gmail.com' LIMIT 1;
    
    SELECT m.studio_id INTO v_studio_id
    FROM public.users u
    JOIN public.studio_memberships m ON u.id = m.user_id
    WHERE u.email = 'trimarchitattoostudio@gmail.com'
    LIMIT 1;

    -- 3. Update auth.users (Password, InstanceID, Confirmed)
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));
    
    UPDATE auth.users
    SET 
        encrypted_password = v_encrypted_pw,
        email_confirmed_at = NOW(),
        instance_id = v_instance_id,
        raw_app_meta_data = '{"provider":"email","providers":["email"]}',
        updated_at = NOW()
    WHERE id = v_user_id;

    -- 4. Ensure public.users record exists
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (v_user_id, 'monnalisagabriel@gmail.com', 'Monnalisa Gabriel', 'artist')
    ON CONFLICT (id) DO UPDATE SET role = 'artist';

    -- 5. Ensure Studio Membership exists
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (v_studio_id, v_user_id, 'artist')
    ON CONFLICT (studio_id, user_id) DO UPDATE SET role = 'artist';

    RAISE NOTICE 'Fixed Monnalisa account. New password is password123';
END $$;
