-- Enable RLS on services if not already enabled
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON services;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON services;
DROP POLICY IF EXISTS "Enable update for owners" ON services;
DROP POLICY IF EXISTS "Enable delete for owners" ON services;
DROP POLICY IF EXISTS "Owners can manage services" ON services;
DROP POLICY IF EXISTS "Public read access" ON services;

-- 1. Public Read Access (Needed for public booking page)
CREATE POLICY "Public read access"
ON services FOR SELECT
USING (true);

-- 2. Owners/Admins can manage services for their studio
CREATE POLICY "Owners can manage services"
ON services FOR ALL
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM studio_memberships 
        WHERE studio_id = services.studio_id 
        AND role IN ('owner', 'manager', 'artist')
    )
);

-- 3. Allow INSERT if user is a member of the studio (Check studio_id in the new row)
CREATE POLICY "Members can create services"
ON services FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM studio_memberships 
        WHERE studio_id = studio_id -- resolves to the new row's studio_id
        AND role IN ('owner', 'manager', 'artist')
    )
);
