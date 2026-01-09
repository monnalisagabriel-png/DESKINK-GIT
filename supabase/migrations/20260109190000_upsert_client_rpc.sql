-- Make create_client_public idempotent (Get or Create)
-- This ensures that if a client already exists, we return their ID instead of failing with a duplicate key error
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
  -- First, attempt to find an existing client with the same email in this studio
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE studio_id = p_studio_id
    AND LOWER(email) = LOWER(p_email)
  LIMIT 1;

  -- If found, return it immediately
  IF v_client_id IS NOT NULL THEN
    v_result := json_build_object('id', v_client_id, 'full_name', p_full_name, 'email', p_email, 'is_new', false);
    RETURN v_result;
  END IF;

  -- If not found, create a new client
  INSERT INTO public.clients (
    studio_id, full_name, email, phone, fiscal_code, 
    address, city, zip_code, preferred_styles, whatsapp_broadcast_opt_in
  )
  VALUES (
    p_studio_id, p_full_name, p_email, p_phone, p_fiscal_code,
    p_address, p_city, p_zip_code, p_preferred_styles, p_whatsapp_broadcast_opt_in
  )
  RETURNING id INTO v_client_id;
  
  v_result := json_build_object('id', v_client_id, 'full_name', p_full_name, 'email', p_email, 'is_new', true);
  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- Fallback for concurrent inserts or other errors
  -- Try one last fetch
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE studio_id = p_studio_id
    AND LOWER(email) = LOWER(p_email)
  LIMIT 1;

  IF v_client_id IS NOT NULL THEN
      v_result := json_build_object('id', v_client_id, 'full_name', p_full_name, 'email', p_email, 'is_new', false);
      RETURN v_result;
  ELSE
      RAISE; -- Re-throw if truly failed
  END IF;
END;
$$;
