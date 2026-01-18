-- Enable RLS on client_consents if not already
ALTER TABLE client_consents ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert consents (validating studio_id or client_id happens via FK constraints)
-- Or ideally strictly link to public booking. For now, allow insert for authenticated/anon.
CREATE POLICY "Public booking client consent insert" ON client_consents
    FOR INSERT
    WITH CHECK (true);

-- Allow reading own consents (optional, but good for clients if they log in)
-- Policies for staff viewing are likely already there or need ensuring.
CREATE POLICY "Staff view client consents" ON client_consents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clients
            JOIN studios ON clients.studio_id = studios.id
            JOIN users ON users.studio_id = studios.id
            WHERE clients.id = client_consents.client_id
            AND users.id = auth.uid()
            AND users.role IN ('owner', 'manager', 'artist')
        )
    );
