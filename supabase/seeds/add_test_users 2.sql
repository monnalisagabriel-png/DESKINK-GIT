-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    v_studio_id UUID;
    v_password TEXT := 'password123';
    v_encrypted_pw TEXT;
    v_user_id UUID;
    v_now TIMESTAMP := now();
BEGIN
    -- 1. Find the Studio ID for 'trimarchitattoostudio@gmail.com'
    SELECT m.studio_id INTO v_studio_id
    FROM public.users u
    JOIN public.studio_memberships m ON u.id = m.user_id
    WHERE u.email = 'trimarchitattoostudio@gmail.com'
    LIMIT 1;

    IF v_studio_id IS NULL THEN
        RAISE EXCEPTION 'Studio associated with trimarchitattoostudio@gmail.com not found. Ensure this user is a member of a studio.';
    END IF;

    -- Generate hashed password
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -------------------------------------------------------
    -- 2. Create Manager (manager.test@inkflow.com)
    -------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager.test@inkflow.com') THEN
        v_user_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (
            v_user_id, 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            'manager.test@inkflow.com', 
            v_encrypted_pw, 
            v_now, 
            '{"provider":"email","providers":["email"]}', 
            '{"full_name":"Test Manager"}', 
            v_now, 
            v_now
        );

        -- Insert into public.users (if not handled by trigger, safe to upsert usually, but let's assume trigger might run. 
        -- If trigger runs, this might duplicate or error. 
        -- Safer approach: Insert into studio_memberships directly using v_user_id. 
        -- If public.users is needed for foreign key, we might need to wait or insert. 
        -- INKVLOW likely has a trigger 'on_auth_user_created' -> 'public.handle_new_user'.
        -- We will just insert membership. If FK fails, it means trigger didn't run or public.users entry missing.
        -- Standard Supabase: trigger runs sync.
        
        -- Link to Studio
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_user_id, 'manager');
    END IF;

    -------------------------------------------------------
    -- 3. Create Artist 1 (artist1.test@inkflow.com)
    -------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'artist1.test@inkflow.com') THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'artist1.test@inkflow.com', v_encrypted_pw, v_now, '{"provider":"email","providers":["email"]}', '{"full_name":"Test Artist 1"}', v_now, v_now);
        
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_user_id, 'artist');
    END IF;

    -------------------------------------------------------
    -- 4. Create Artist 2 (artist2.test@inkflow.com)
    -------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'artist2.test@inkflow.com') THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'artist2.test@inkflow.com', v_encrypted_pw, v_now, '{"provider":"email","providers":["email"]}', '{"full_name":"Test Artist 2"}', v_now, v_now);
        
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_user_id, 'artist');
    END IF;

    -------------------------------------------------------
    -- 5. Create Student 1 (student1.test@inkflow.com)
    -------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student1.test@inkflow.com') THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student1.test@inkflow.com', v_encrypted_pw, v_now, '{"provider":"email","providers":["email"]}', '{"full_name":"Test Student 1"}', v_now, v_now);
        
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_user_id, 'student');
    END IF;

    -------------------------------------------------------
    -- 6. Create Student 2 (student2.test@inkflow.com)
    -------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student2.test@inkflow.com') THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student2.test@inkflow.com', v_encrypted_pw, v_now, '{"provider":"email","providers":["email"]}', '{"full_name":"Test Student 2"}', v_now, v_now);
        
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_user_id, 'student');
    END IF;

END $$;
