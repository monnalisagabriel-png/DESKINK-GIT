DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260117113000';

-- FORCE FIX: Portfolio Uploads
-- This script creates a dedicated, explicit policy for portfolio uploads.

-- 1. Drop potential conflicting policies (again, to be safe)
DROP POLICY IF EXISTS "Auth Upload Avatars Flexible" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Portfolio" ON storage.objects;

-- 2. Create Explicit Policy for Portfolio folder
-- Path structure: portfolio/{user_id}/{filename}
-- Bucket: avatars
CREATE POLICY "Auth Upload Portfolio" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = 'portfolio'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. Re-create Avatar Policy (standard)
-- Path structure: avatars/{user_id}/{filename} (as used in ProfileSettings)
DROP POLICY IF EXISTS "Auth Upload Avatars Standard" ON storage.objects;
CREATE POLICY "Auth Upload Avatars Standard" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- 4. Ensure Update/Delete permissions for both
DROP POLICY IF EXISTS "Auth Manage Avatars & Portfolio" ON storage.objects;
CREATE POLICY "Auth Manage Avatars & Portfolio" ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (
        (storage.foldername(name))[2] = auth.uid()::text
    )
);
