-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    v_owner_id UUID;
    v_manager_id UUID;
    v_artist_id UUID;
    v_student_id UUID;
    v_studio_id UUID;
    v_password TEXT := 'password123';
    v_encrypted_pw TEXT;
    v_now TIMESTAMP := now();
BEGIN
    -- Generate hashed password
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -------------------------------------------------------
    -- 1. Create/Get Test Owner (owner.test@inkflow.com)
    -------------------------------------------------------
    SELECT id INTO v_owner_id FROM auth.users WHERE email = 'owner.test@inkflow.com';
    
    IF v_owner_id IS NULL THEN
        v_owner_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (v_owner_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner.test@inkflow.com', v_encrypted_pw, v_now, '{"provider":"email","providers":["email"]}', '{"full_name":"Test Owner"}', v_now, v_now);
    END IF;

    -------------------------------------------------------
    -- 2. Create/Get Test Studio ("Test Studio")
    -------------------------------------------------------
    -- Check if owner already has a studio
    SELECT studio_id INTO v_studio_id FROM public.studio_memberships WHERE user_id = v_owner_id AND role = 'owner' LIMIT 1;

    IF v_studio_id IS NULL THEN
        v_studio_id := gen_random_uuid();
        INSERT INTO public.studios (id, name, created_by, created_at)
        VALUES (v_studio_id, 'Test Studio', v_owner_id, v_now);

        -- Link Owner to Studio
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_owner_id, 'owner');
    END IF;

    -------------------------------------------------------
    -- 3. Create Manager (manager.test@inkflow.com)
    -------------------------------------------------------
    SELECT id INTO v_manager_id FROM auth.users WHERE email = 'manager.test@inkflow.com';
    IF v_manager_id IS NULL THEN
        v_manager_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (v_manager_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager.test@inkflow.com', v_encrypted_pw, v_now, '{"provider":"email","providers":["email"]}', '{"full_name":"Test Manager"}', v_now, v_now);
    END IF;

    -- Link Manager
    IF NOT EXISTS (SELECT 1 FROM public.studio_memberships WHERE user_id = v_manager_id) THEN
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_manager_id, 'manager');
    END IF;

    -------------------------------------------------------
    -- 4. Create Artist (artist1.test@inkflow.com)
    -------------------------------------------------------
    SELECT id INTO v_artist_id FROM auth.users WHERE email = 'artist1.test@inkflow.com';
    IF v_artist_id IS NULL THEN
        v_artist_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (v_artist_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'artist1.test@inkflow.com', v_encrypted_pw, v_now, '{"provider":"email","providers":["email"]}', '{"full_name":"Test Artist 1"}', v_now, v_now);
    END IF;

    -- Link Artist
    IF NOT EXISTS (SELECT 1 FROM public.studio_memberships WHERE user_id = v_artist_id) THEN
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_artist_id, 'artist');
    END IF;
    
    -------------------------------------------------------
    -- 5. Create Student (student1.test@inkflow.com)
    -------------------------------------------------------
    SELECT id INTO v_student_id FROM auth.users WHERE email = 'student1.test@inkflow.com';
    IF v_student_id IS NULL THEN
        v_student_id := gen_random_uuid();
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (v_student_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student1.test@inkflow.com', v_encrypted_pw, v_now, '{"provider":"email","providers":["email"]}', '{"full_name":"Test Student 1"}', v_now, v_now);
    END IF;

    -- Link Student
    IF NOT EXISTS (SELECT 1 FROM public.studio_memberships WHERE user_id = v_student_id) THEN
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (v_studio_id, v_student_id, 'student');
    END IF;

    RAISE NOTICE 'Test environment created successfully!';
    RAISE NOTICE 'Studio ID: %', v_studio_id;
    RAISE NOTICE 'Owner: owner.test@inkflow.com';
    RAISE NOTICE 'Manager: manager.test@inkflow.com';
    RAISE NOTICE 'Artist: artist1.test@inkflow.com';

END $$;
