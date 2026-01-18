-- Force enable public booking for the test artist and output the correct Link
DO $$
DECLARE
    v_user_email TEXT := 'monnalisagabriel@gmail.com';
    v_studio_id UUID;
BEGIN
    -- 1. Update the user to ensure they are visible
    UPDATE public.users
    SET 
        is_public_booking_enabled = true,
        role = 'artist' -- Ensure lowercase
    WHERE email = v_user_email;

    -- 2. Get the studio ID
    SELECT studio_id INTO v_studio_id
    FROM public.users
    WHERE email = v_user_email;

    -- 3. Output the result
    IF v_studio_id IS NOT NULL THEN
        RAISE NOTICE '---------------------------------------------------';
        RAISE NOTICE 'SUCCESS! Artist % is now enabled.', v_user_email;
        RAISE NOTICE 'Use this URL to book:';
        RAISE NOTICE 'http://localhost:5173/book/%', v_studio_id;
        RAISE NOTICE '---------------------------------------------------';
    ELSE
        RAISE NOTICE 'ERROR: Could not find studio_id for user %. Make sure they are linked to a studio.', v_user_email;
    END IF;
END $$;
