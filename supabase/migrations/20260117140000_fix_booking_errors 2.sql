-- 1. Add duration column to appointments if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'duration') THEN
        ALTER TABLE "public"."appointments" ADD COLUMN "duration" integer DEFAULT 60;
    END IF;
END $$;

-- 2. Fix Storage RLS for public booking uploads
-- Ensure the bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone (public) to upload to specific folder
DROP POLICY IF EXISTS "Public can upload booking images" ON storage.objects;
CREATE POLICY "Public can upload booking images" ON storage.objects
    FOR INSERT 
    TO public
    WITH CHECK (
        bucket_id = 'attachments' AND 
        (storage.foldername(name))[1] = 'booking-uploads'
    );

-- Policy to allow public to view their uploaded images (read access)
DROP POLICY IF EXISTS "Public can view booking images" ON storage.objects;
CREATE POLICY "Public can view booking images" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'attachments');
