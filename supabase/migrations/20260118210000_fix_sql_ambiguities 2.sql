-- Fix 1: Resolve Ambiguous Column "name" in recover_orphaned_owner
CREATE OR REPLACE FUNCTION public.recover_orphaned_owner()
RETURNS TABLE(
  studio_id UUID,
  name TEXT,
  subscription_status TEXT,
  subscription_tier TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    found_studio_id UUID;
    found_studio_name TEXT;
    found_status TEXT;
    found_tier TEXT;
BEGIN
    -- Explicitly select from alias 's' to avoid ambiguity
    SELECT s.id, s.name, s.subscription_status, s.subscription_tier
    INTO found_studio_id, found_studio_name, found_status, found_tier
    FROM public.studios s
    WHERE s.created_by = auth.uid()
    LIMIT 1;

    IF found_studio_id IS NULL THEN
        RETURN; -- User owns no studios
    END IF;

    -- Ensure Membership Exists
    IF NOT EXISTS (
        SELECT 1 FROM public.studio_memberships sm
        WHERE sm.studio_id = found_studio_id AND sm.user_id = auth.uid()
    ) THEN
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (found_studio_id, auth.uid(), 'owner');
    END IF;

    -- Return Details
    RETURN QUERY SELECT 
        found_studio_id, 
        found_studio_name, 
        COALESCE(found_status, 'none'),
        COALESCE(found_tier, 'basic');
END;
$$;

-- Fix 2: Cast 'user_role' to TEXT in get_my_pending_invitations
CREATE OR REPLACE FUNCTION "public"."get_my_pending_invitations"() RETURNS TABLE("token" "text", "studio_name" "text", "role" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get current user's email
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
    IF user_email IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        i.token,
        s.name as studio_name,
        i.role::TEXT, -- Explicit cast to match RETURN TABLE type
        i.created_at
    FROM public.studio_invitations i
    JOIN public.studios s ON s.id = i.studio_id
    WHERE i.email = user_email
    AND i.used_at IS NULL;
END;
$$;
