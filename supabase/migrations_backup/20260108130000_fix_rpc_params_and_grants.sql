-- Fix RPC function signature and permissions
-- Drop the function with various potential signatures to be safe
DROP FUNCTION IF EXISTS get_client_by_contact(text, text, uuid);

-- Re-create with correct named parameters matching the TypeScript client
CREATE OR REPLACE FUNCTION get_client_by_contact(
  p_email text,
  p_phone text,
  p_studio_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Best practice for security definer functions
AS $$
DECLARE
  v_client_id uuid;
BEGIN
  SELECT id INTO v_client_id
  FROM public.clients 
  WHERE studio_id = p_studio_id
    AND (
      LOWER(email) = LOWER(p_email)
      OR 
      phone = p_phone
    )
  LIMIT 1;
  
  RETURN v_client_id;
END;
$$;

-- Explicitly grant execute permissions
GRANT EXECUTE ON FUNCTION get_client_by_contact(text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_client_by_contact(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_by_contact(text, text, uuid) TO service_role;
