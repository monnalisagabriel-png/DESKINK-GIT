-- RPC for Public Client Registration
-- Bypasses RLS to allow creation and returning the ID without needing SELECT permissions on the table
DROP FUNCTION IF EXISTS create_client_public;
CREATE OR REPLACE FUNCTION create_client_public(
  p_studio_id uuid,
  p_full_name text,
  p_email text,
  p_phone text,
  p_fiscal_code text,
  p_address text,
  p_city text,
  p_zip_code text,
  p_preferred_styles text[],
  p_whatsapp_broadcast_opt_in boolean
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id uuid;
  v_result json;
BEGIN
  INSERT INTO public.clients (
    studio_id, full_name, email, phone, fiscal_code, 
    address, city, zip_code, preferred_styles, whatsapp_broadcast_opt_in
  )
  VALUES (
    p_studio_id, p_full_name, p_email, p_phone, p_fiscal_code,
    p_address, p_city, p_zip_code, p_preferred_styles, p_whatsapp_broadcast_opt_in
  )
  RETURNING id INTO v_client_id;
  
  -- Return a minimal JSON object with the ID, mimicking a partial Client object
  v_result := json_build_object('id', v_client_id, 'full_name', p_full_name, 'email', p_email);
  RETURN v_result;
END;
$$;

-- RPC for Public Waitlist Entry
-- Bypasses RLS to allow insertion and verification
DROP FUNCTION IF EXISTS create_waitlist_entry_public;
CREATE OR REPLACE FUNCTION create_waitlist_entry_public(
  p_studio_id uuid,
  p_client_id uuid,
  p_client_name text,
  p_email text,
  p_phone text,
  p_styles text[],
  p_interest_type text,
  p_description text,
  p_artist_pref_id uuid,
  p_images text[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_id uuid;
  v_result json;
BEGIN
  INSERT INTO public.waitlist_entries (
    studio_id, client_id, client_name, email, phone, 
    styles, interest_type, description, artist_pref_id, images
  )
  VALUES (
    p_studio_id, p_client_id, p_client_name, p_email, p_phone,
    p_styles, p_interest_type, p_description, p_artist_pref_id, p_images
  )
  RETURNING id INTO v_entry_id;

  v_result := json_build_object('id', v_entry_id);
  RETURN v_result;
END;
$$;


-- Grants
GRANT EXECUTE ON FUNCTION create_client_public(uuid, text, text, text, text, text, text, text, text[], boolean) TO anon;
GRANT EXECUTE ON FUNCTION create_client_public(uuid, text, text, text, text, text, text, text, text[], boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION create_client_public(uuid, text, text, text, text, text, text, text, text[], boolean) TO service_role;

GRANT EXECUTE ON FUNCTION create_waitlist_entry_public(uuid, uuid, text, text, text, text[], text, text, uuid, text[]) TO anon;
GRANT EXECUTE ON FUNCTION create_waitlist_entry_public(uuid, uuid, text, text, text, text[], text, text, uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION create_waitlist_entry_public(uuid, uuid, text, text, text, text[], text, text, uuid, text[]) TO service_role;
