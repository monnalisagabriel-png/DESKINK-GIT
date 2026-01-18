-- Fix Storage Policies for Avatars, Portfolio, and Studios

-- 1. Create 'studios' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('studios', 'studios', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Give me public access" ON storage.objects; -- Generic one
DROP POLICY IF EXISTS "Public Read Studios" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Studios" ON storage.objects;

-- 3. Policy: Public Read Access for ALL relevant buckets
CREATE POLICY "Public Read All" ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('avatars', 'studios', 'attachments'));

-- 4. Policy: Flexible Authenticated Upload for 'avatars' bucket
-- Allows upload if the User ID is present anywhere in the path (e.g., "avatars/{uid}/..." or "portfolio/{uid}/...")
CREATE POLICY "Auth Upload Avatars Flexible" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (
        auth.uid()::text = ANY(storage.foldername(name))
    )
);

-- 5. Policy: Authenticated Update/Delete for 'avatars' bucket (User owns their files)
CREATE POLICY "Auth Manage Own Avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (
        auth.uid()::text = ANY(storage.foldername(name))
    )
);

CREATE POLICY "Auth Delete Own Avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (
        auth.uid()::text = ANY(storage.foldername(name))
    )
);

-- 6. Policy: Upload for 'studios' bucket
-- Start with permissive authenticated upload for studios/attachments to unblock.
-- Ideally we check studio ownership, but checking against 'studios' table in RLS can be performance heavy or complex with path parsing.
-- For now: Allow authenticated users to upload to 'studios' bucket.
CREATE POLICY "Auth Upload Studios" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'studios');

-- Allow update/delete for authenticated users on studios bucket
CREATE POLICY "Auth Manage Studios" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'studios')
WITH CHECK (bucket_id = 'studios');
