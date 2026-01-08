-- Migration to enable public access for Waitlist and Client Registration forms
-- Date: 2026-01-08

-- 1. CLIENTS TABLE
-- Allow public to INSERT (register)
DROP POLICY IF EXISTS "Allow public registration" ON public.clients;
CREATE POLICY "Allow public registration" ON public.clients
  FOR INSERT WITH CHECK (true);

-- 2. WAITLIST ENTRIES TABLE
-- Allow public to INSERT
DROP POLICY IF EXISTS "Allow public waitlist entry" ON public.waitlist_entries;
CREATE POLICY "Allow public waitlist entry" ON public.waitlist_entries
  FOR INSERT WITH CHECK (true);

-- 3. CLIENT CONSENTS TABLE
-- Allow public to INSERT (save signature)
DROP POLICY IF EXISTS "Allow public consent signature" ON public.client_consents;
CREATE POLICY "Allow public consent signature" ON public.client_consents
  FOR INSERT WITH CHECK (true);

-- 4. STORAGE: CONSENTS BUCKET
-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('consents', 'consents', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for uploading signatures
DROP POLICY IF EXISTS "Give public access to consents bucket" ON storage.objects; -- clean up potential conflicts
DROP POLICY IF EXISTS "Allow public upload to consents" ON storage.objects;

CREATE POLICY "Allow public upload to consents"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'consents' );

-- Policy for reading signatures (needed for PDF generation?)
-- Usually PDF gen happens on client or server. If client generates it, it needs to read the signature image.
DROP POLICY IF EXISTS "Allow public read from consents" ON storage.objects;
CREATE POLICY "Allow public read from consents"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'consents' );


-- 5. RPC Function for Secure Client Retrieval (Public)
-- Returns client ID if exists, NULL otherwise.
-- Allows public forms to link to existing clients without exposing full client data.
CREATE OR REPLACE FUNCTION get_client_by_contact(
  p_email text,
  p_phone text,
  p_studio_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (admin)
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
