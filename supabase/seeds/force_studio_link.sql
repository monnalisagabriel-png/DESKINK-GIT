-- FORCE LINK Monnalisa to the specific Studio ID found in logs
-- Studio ID: 83f68f98-1082-4273-9cda-5822f5ef723a

DO $$
DECLARE
    v_user_email TEXT := 'monnalisagabriel@gmail.com';
    v_target_studio_id UUID := '83f68f98-1082-4273-9cda-5822f5ef723a';
    v_user_id UUID;
BEGIN
    -- 1. Get User ID
    SELECT id INTO v_user_id FROM public.users WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User % not found in public.users', v_user_email;
    END IF;

    -- 2. Update public.users
    UPDATE public.users
    SET 
        studio_id = v_target_studio_id,
        role = 'artist',
        is_public_booking_enabled = true
    WHERE id = v_user_id;

    -- 3. Update/Insert Studio Membership
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (v_target_studio_id, v_user_id, 'artist')
    ON CONFLICT (studio_id, user_id) 
    DO UPDATE SET role = 'artist';

    RAISE NOTICE 'SUCCESS: Forced % into Studio %', v_user_email, v_target_studio_id;
END $$;
