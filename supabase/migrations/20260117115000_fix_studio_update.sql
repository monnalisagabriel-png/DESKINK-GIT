-- FIX: Allow Owners to update their Studio (Corrected)
-- Uses studio_memberships table instead of invalid 'owner_id' column.

-- 1. Ensure RLS is enabled
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update policy
DROP POLICY IF EXISTS "Owners can update own studio" ON studios;

-- 3. Create Update Policy based on Studio Membership
CREATE POLICY "Owners can update own studio"
ON studios
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM studio_memberships 
        WHERE studio_memberships.studio_id = studios.id 
        AND studio_memberships.user_id = auth.uid() 
        AND (studio_memberships.role::text = 'owner' OR studio_memberships.role::text = 'OWNER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM studio_memberships 
        WHERE studio_memberships.studio_id = studios.id 
        AND studio_memberships.user_id = auth.uid() 
        AND (studio_memberships.role::text = 'owner' OR studio_memberships.role::text = 'OWNER')
    )
);

-- 4. Ensure Select Policy
DROP POLICY IF EXISTS "Public can view studios" ON studios;
CREATE POLICY "Public can view studios"
ON studios
FOR SELECT
TO public
USING (true);
