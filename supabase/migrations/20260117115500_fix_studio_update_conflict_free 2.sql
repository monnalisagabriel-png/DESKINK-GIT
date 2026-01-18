-- FIX: Allow Owners to update their Studio (Conflict-Free)

-- 1. Ensure RLS is enabled
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update policy specific to this fix
DROP POLICY IF EXISTS "Owners can update own studio" ON studios;

-- 3. Create Update Policy
CREATE POLICY "Owners can update own studio"
ON studios
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM studio_memberships 
        WHERE studio_memberships.studio_id = studios.id 
        AND studio_memberships.user_id = auth.uid() 
        AND (studio_memberships.role::text = 'owner' OR studio_memberships.role::text = 'OWNER')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM studio_memberships 
        WHERE studio_memberships.studio_id = studios.id 
        AND studio_memberships.user_id = auth.uid() 
        AND (studio_memberships.role::text = 'owner' OR studio_memberships.role::text = 'OWNER')
    )
);

-- Note: We removed the "Public can view studios" policy creation 
-- because it already exists in your database.
