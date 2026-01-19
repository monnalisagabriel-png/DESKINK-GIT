-- FORCE COMPLETE TEST USERS SETUP
-- Includes auth.identities (crucial for login) and Subscription Bypass

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    v_owner_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_manager_id UUID := 'a0000000-0000-0000-0000-000000000002';
    v_artist_id UUID := 'a0000000-0000-0000-0000-000000000003';
    v_studio_id UUID := 'b0000000-0000-0000-0000-000000000001';
    
    v_password TEXT := 'password123';
    v_encrypted_pw TEXT;
    v_now TIMESTAMP := now();
BEGIN
    -- 0. Cleanup Old Data
    DELETE FROM auth.identities WHERE user_id IN (v_owner_id, v_manager_id, v_artist_id);
    DELETE FROM public.studio_memberships WHERE studio_id = v_studio_id;
    DELETE FROM public.saas_subscriptions WHERE studio_id = v_studio_id;
    DELETE FROM public.studios WHERE id = v_studio_id;
    DELETE FROM auth.users WHERE id IN (v_owner_id, v_manager_id, v_artist_id);
    DELETE FROM auth.users WHERE email IN ('owner.test@inkflow.com', 'manager.test@inkflow.com', 'artist1.test@inkflow.com'); -- Safety catch

    -- Generate Hash
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    --------------------------------------------------------------------------------
    -- 1. Create OWNER (owner.test@inkflow.com)
    --------------------------------------------------------------------------------
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token)
    VALUES (
        v_owner_id, 
        '00000000-0000-0000-0000-000000000000', 
        'authenticated', 
        'authenticated', 
        'owner.test@inkflow.com', 
        v_encrypted_pw, 
        v_now, 
        '{"provider":"email","providers":["email"]}', 
        '{"full_name":"Test Owner"}', 
        v_now, 
        v_now,
        ''
    );

    -- Identity (CRITICAL FOR LOGIN)
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
        v_owner_id, 
        v_owner_id,
        v_owner_id::text,
        jsonb_build_object('sub', v_owner_id, 'email', 'owner.test@inkflow.com'),
        'email',
        v_now,
        v_now,
        v_now
    );

    --------------------------------------------------------------------------------
    -- 2. Create STUDIO (Test Studio)
    --------------------------------------------------------------------------------
    INSERT INTO public.studios (id, name, created_by, created_at)
    VALUES (v_studio_id, 'Test Studio', v_owner_id, v_now);

    -- Owner Membership
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (v_studio_id, v_owner_id, 'owner');

    -- Subscription Bypass (PLUS Plan)
    INSERT INTO public.saas_subscriptions (studio_id, plan_id, status, current_period_end)
    VALUES (v_studio_id, 'plus', 'active', v_now + interval '100 years');

    --------------------------------------------------------------------------------
    -- 3. Create MANAGER (manager.test@inkflow.com)
    --------------------------------------------------------------------------------
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        v_manager_id, 
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

    -- Manager Identity
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
        v_manager_id,
        v_manager_id,
        v_manager_id::text,
        jsonb_build_object('sub', v_manager_id, 'email', 'manager.test@inkflow.com'),
        'email',
        v_now,
        v_now,
        v_now
    );

    -- Manager Membership
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (v_studio_id, v_manager_id, 'manager');

    --------------------------------------------------------------------------------
    -- 4. Create ARTIST (artist1.test@inkflow.com)
    --------------------------------------------------------------------------------
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
        v_artist_id, 
        '00000000-0000-0000-0000-000000000000', 
        'authenticated', 
        'authenticated', 
        'artist1.test@inkflow.com', 
        v_encrypted_pw, 
        v_now, 
        '{"provider":"email","providers":["email"]}', 
        '{"full_name":"Test Artist"}', 
        v_now, 
        v_now
    );

    -- Artist Identity
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
        v_artist_id,
        v_artist_id,
        v_artist_id::text,
        jsonb_build_object('sub', v_artist_id, 'email', 'artist1.test@inkflow.com'),
        'email',
        v_now,
        v_now,
        v_now
    );

    -- Artist Membership
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (v_studio_id, v_artist_id, 'artist');

    RAISE NOTICE 'DONE! Users created with password123 and Subscription ACTIVE.';
    RAISE NOTICE 'Owner: owner.test@inkflow.com';

END $$;
