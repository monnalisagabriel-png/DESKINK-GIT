-- 1. Ensure 'avatars' bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Avatars" ON storage.objects;

-- 3. Policy: Public Read Access
CREATE POLICY "Public Read Avatars" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 4. Policy: Authenticated Upload (own folder)
-- Path convention: avatars/{user_id}/{filename}
CREATE POLICY "Auth Upload Avatars" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy: Authenticated Update (own folder)
CREATE POLICY "Auth Update Avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Policy: Authenticated Delete (own folder)
CREATE POLICY "Auth Delete Avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
