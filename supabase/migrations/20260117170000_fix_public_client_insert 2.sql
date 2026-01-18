-- Allow public to INSERT new clients (needed for UPSERT when client doesn't exist)
DROP POLICY IF EXISTS "Allow public client insert" ON "public"."clients";
CREATE POLICY "Allow public client insert" ON "public"."clients"
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Ensure public can read the client they just created/updated (needed for .select())
DROP POLICY IF EXISTS "Allow public client select" ON "public"."clients";
CREATE POLICY "Allow public client select" ON "public"."clients"
    FOR SELECT
    TO public
    USING (true);
