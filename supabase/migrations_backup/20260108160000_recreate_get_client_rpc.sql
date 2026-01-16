-- Create a new version of the function to bypass any potential caching or corruption
CREATE OR REPLACE FUNCTION get_client_by_contact_v2(
  p_email text,
  p_phone text,
  p_studio_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Simple lookup
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

-- Grant permissions explicitly
GRANT EXECUTE ON FUNCTION get_client_by_contact_v2(text, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_client_by_contact_v2(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_by_contact_v2(text, text, uuid) TO service_role;
