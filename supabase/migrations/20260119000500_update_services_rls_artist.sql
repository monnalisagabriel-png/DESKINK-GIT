-- Add Artist to Services RLS Policies

-- Drop existing policies first to ensure clean update
DROP POLICY IF EXISTS "Owners can manage services" ON services;
DROP POLICY IF EXISTS "Members can create services" ON services;

-- Owners/Admins/Artists can manage services for their studio
CREATE POLICY "Owners, Managers and Artists can manage services"
ON services FOR ALL
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM studio_memberships 
        WHERE studio_id = services.studio_id 
        AND role IN ('owner', 'manager', 'artist')
    )
);

-- Allow INSERT if user is a member of the studio
CREATE POLICY "Members can create services"
ON services FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id 
        FROM studio_memberships 
        WHERE studio_id = studio_id
        AND role IN ('owner', 'manager', 'artist')
    )
);
