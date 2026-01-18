DROP FUNCTION IF EXISTS public.recover_orphaned_owner();

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
    -- 1. Find a studio created by this user
    SELECT id, name, subscription_status, subscription_tier
    INTO found_studio_id, found_studio_name, found_status, found_tier
    FROM public.studios
    WHERE created_by = auth.uid()
    LIMIT 1;

    IF found_studio_id IS NULL THEN
        RETURN; -- User owns no studios
    END IF;

    -- 2. Ensure Membership Exists (Restore if missing)
    IF NOT EXISTS (
        SELECT 1 FROM public.studio_memberships 
        WHERE studio_id = found_studio_id AND user_id = auth.uid()
    ) THEN
        INSERT INTO public.studio_memberships (studio_id, user_id, role)
        VALUES (found_studio_id, auth.uid(), 'owner');
    END IF;

    -- 3. Return Details
    RETURN QUERY SELECT 
        found_studio_id, 
        found_studio_name, 
        COALESCE(found_status, 'none'),
        COALESCE(found_tier, 'basic');
END;
$$;
