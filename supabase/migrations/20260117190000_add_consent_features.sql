-- Add consent_text to studios if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'studios' AND column_name = 'consent_text') THEN
        ALTER TABLE studios ADD COLUMN consent_text TEXT;
    END IF;
END $$;

-- Create consents table if it doesn't exist
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID REFERENCES studios(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    template_version INTEGER DEFAULT 1,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    signature_url TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'SIGNED',
    signed_by_role TEXT DEFAULT 'client'
);

-- Enable RLS
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Allow public insert (needed for public booking)
CREATE POLICY "Public booking consent insert" ON consents
    FOR INSERT
    WITH CHECK (true);

-- Allow artists/owners to view consents
CREATE POLICY "Staff view consents" ON consents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.studio_id = consents.studio_id
            AND users.role IN ('owner', 'manager', 'artist')
        )
    );
