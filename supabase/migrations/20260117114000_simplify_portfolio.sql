-- SIMPLIFIED FIX: Portfolio Uploads
-- Using string matching instead of array parsing for reliability.

-- 1. Ensure Avatars bucket is public clearly
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- 2. Drop previous complex policies
DROP POLICY IF EXISTS "Auth Upload Portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Portfolio Simple" ON storage.objects;

-- 3. Create Simplified Policy using LIKE
-- Allows upload if the file path starts with "portfolio/{USER_ID}/"
CREATE POLICY "Auth Upload Portfolio Simple" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND name LIKE 'portfolio/' || auth.uid() || '/%'
);

-- 4. Ensure same logic for Update/Delete
DROP POLICY IF EXISTS "Auth Manage Own Files" ON storage.objects;
CREATE POLICY "Auth Manage Own Files Simple" ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (
        name LIKE 'portfolio/' || auth.uid() || '/%'
        OR
        name LIKE 'avatars/' || auth.uid() || '/%'
        OR
        (storage.foldername(name))[2] = auth.uid()::text -- fallback
    )
);
