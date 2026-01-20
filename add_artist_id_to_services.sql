-- Add artist_id column to services table
ALTER TABLE services 
ADD COLUMN artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Optional: Create an index for better performance
CREATE INDEX idx_services_artist_id ON services(artist_id);

-- Update RLS policies (if any) to allow artists to manage their own services
-- (Assuming RLS is enabled on services table)
-- Example policy (adjust as needed based on existing policies):
-- CREATE POLICY "Artists can manage their own services" ON services
-- FOR ALL USING (auth.uid() = artist_id);
