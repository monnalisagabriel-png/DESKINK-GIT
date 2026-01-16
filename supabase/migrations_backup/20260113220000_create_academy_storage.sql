-- Create 'academy' bucket for course materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('academy', 'academy', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to view all files in 'academy'
DROP POLICY IF EXISTS "Authenticated users can view academy files" ON storage.objects;
CREATE POLICY "Authenticated users can view academy files"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'academy' );

-- Policy: Allow authenticated users to upload files to 'academy'
DROP POLICY IF EXISTS "Authenticated users can upload academy files" ON storage.objects;
CREATE POLICY "Authenticated users can upload academy files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'academy' );

-- Policy: Allow authenticated users to update their own files in 'academy'
DROP POLICY IF EXISTS "Authenticated users can update academy files" ON storage.objects;
CREATE POLICY "Authenticated users can update academy files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'academy' );

-- Policy: Allow authenticated users to delete files in 'academy'
DROP POLICY IF EXISTS "Authenticated users can delete academy files" ON storage.objects;
CREATE POLICY "Authenticated users can delete academy files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'academy' );
