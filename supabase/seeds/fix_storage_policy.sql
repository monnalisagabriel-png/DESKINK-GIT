-- Allow public uploads to 'attachments' bucket in 'booking-uploads' folder
-- Ideally, create a separate bucket 'public-uploads' or similar, but 'attachments' is used by AppointmentDrawer.

-- 1. Ensure bucket exists (usually idempotent if using insert/on conflict)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Allow anon to upload files to 'booking-uploads' folder
CREATE POLICY "Public Booking Uploads" ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = 'booking-uploads'
);

-- 3. Policy: Allow anon to read files (if bucket is public, this is handled, but good to be explicit for 'booking-uploads')
CREATE POLICY "Public Read Booking Uploads" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'attachments');
