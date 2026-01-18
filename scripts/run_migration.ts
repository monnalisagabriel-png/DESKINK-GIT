
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://onwvisahipnlpdijqzoa.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ud3Zpc2FoaXBubHBkaWpxem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4MTQ3MSwiZXhwIjoyMDg0MDU3NDcxfQ.dvMHnIDCNYGN1VXUiFqWmaqqoJesae-_fxJ7N5_H2zw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log('Running Migration...');

    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260117100000_public_booking.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Supabase JS client doesn't support raw SQL execution directly on the DB without an RPC function.
    // However, I can try to use the REST API via fetch if I have the URL and key, which I do.

    // REST API SQL Execution
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
            "Prefer": "return=minimal" // Just to check connectivity
        }
    });

    // Since I cannot run DDL via REST easily without a specific endpoint or stored procedure,
    // I will resort to creating a highly privileged function if possible, OR just notify the user.
    // BUT, I previously used `grant_lifetime.ts` to manipulate data.
    // Manipulating schema is harder.
    // Let's try to see if there is a `exec_sql` function commonly added by some starters.

    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
        console.error('RPC exec_sql failed (expected if not defined):', error.message);
        console.log('ATTENTION USER: Please run the migration file manually in your Supabase Dashboard SQL Editor.');
    } else {
        console.log('Migration successfully applied via RPC!');
    }
}

main();
