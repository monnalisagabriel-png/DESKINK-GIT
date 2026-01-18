
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://onwvisahipnlpdijqzoa.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ud3Zpc2FoaXBubHBkaWpxem9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4MTQ3MSwiZXhwIjoyMDg0MDU3NDcxfQ.dvMHnIDCNYGN1VXUiFqWmaqqoJesae-_fxJ7N5_H2zw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log('Inspecting Tables...');

    // Method 1: Try selecting from common table names to see if they exist
    const tables = ['studios', 'profiles', 'users', 'services', 'appointments'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table '${table}': Error - ${error.message}`);
        } else {
            console.log(`Table '${table}': Exists. Columns:`, data && data.length > 0 ? Object.keys(data[0]) : 'Empty table');
        }
    }
}

main();
