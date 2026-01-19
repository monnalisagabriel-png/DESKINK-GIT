-- Link manually registered user to Test Studio

DO $$
DECLARE
    v_user_email TEXT := 'owner.test@inkflow.com'; -- The email the user signed up with
    v_user_id UUID;
    v_studio_id UUID;
BEGIN
    -- 1. Get User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User % not found. Please sign up manually first!', v_user_email;
    END IF;

    -- 2. Create Test Studio if not exists
    SELECT id INTO v_studio_id FROM public.studios WHERE name = 'Test Studio';
    
    IF v_studio_id IS NULL THEN
        v_studio_id := gen_random_uuid();
        INSERT INTO public.studios (id, name, created_by, created_at)
        VALUES (v_studio_id, 'Test Studio', v_user_id, now());
    END IF;

    -- 3. Link User as Owner
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (v_studio_id, v_user_id, 'owner')
    ON CONFLICT (studio_id, user_id) DO UPDATE SET role = 'owner';

    -- 4. Set Metadata
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb), 
        '{full_name}', 
        '"Test Owner"'
    )
    WHERE id = v_user_id;

    -- 5. Bypass Subscription (Free 'Plus' Plan)
    INSERT INTO public.saas_subscriptions (studio_id, plan_id, status, current_period_end)
    VALUES (v_studio_id, 'plus', 'active', now() + interval '100 years')
    ON CONFLICT (studio_id) 
    DO UPDATE SET status = 'active', plan_id = 'plus', current_period_end = now() + interval '100 years';

    RAISE NOTICE 'Success! User % linked to Test Studio as Owner with Active PLUS Subscription.', v_user_email;

END $$;
