
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { studio_id, spreadsheet_id, sheet_name } = await req.json();

        if (!studio_id || !spreadsheet_id || !sheet_name) {
            throw new Error("Missing arguments: studio_id, spreadsheet_id, sheet_name");
        }

        // 0. Init Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Authenticate Request
        const authHeader = req.headers.get('Authorization')!;
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

        if (authError || !user) {
            throw new Error("Unauthorized");
        }

        // 2. Identify Token Source (Studio Owner)
        const { data: studio, error: studioError } = await supabase
            .from('studios')
            .select('owner_id, google_sheets_config')
            .eq('id', studio_id)
            .single();

        if (studioError || !studio) {
            throw new Error("Studio not found");
        }

        const tokenUserId = studio.owner_id;

        // Security Check: Ensure caller is Owner OR belongs to this Studio
        if (user.id !== tokenUserId) {
            const { data: member } = await supabase.from('users').select('studio_id').eq('id', user.id).single();
            if (!member || member.studio_id !== studio_id) {
                throw new Error("Unauthorized Access to Studio");
            }
        }

        // Fetch integration for the OWNER
        const { data: integration, error: intError } = await supabase
            .from('user_integrations')
            .select('*')
            .eq('user_id', tokenUserId)
            .eq('provider', 'google')
            .maybeSingle();

        if (intError || !integration) {
            return new Response(JSON.stringify({ error: "L'integrazione Google non è stata trovata per il proprietario dello studio. Vai su Impostazioni > Integrazioni e connetti Google." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        // 2. Refresh Token Logic
        let accessToken = integration.access_token;
        const expiresAt = integration.expires_at ? new Date(integration.expires_at).getTime() : 0;

        if (integration.refresh_token && (Date.now() > expiresAt - 60000)) {
            console.log('Refreshing Google Token...');
            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
                    client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
                    refresh_token: integration.refresh_token,
                    grant_type: 'refresh_token',
                }),
            });

            const refreshData = await refreshResponse.json();
            if (!refreshResponse.ok) {
                throw new Error("Failed to refresh Google Token");
            }

            accessToken = refreshData.access_token;
            // Update DB
            await supabase.from('user_integrations').update({
                access_token: accessToken,
                expires_at: new Date(Date.now() + ((refreshData.expires_in || 3599) * 1000)).toISOString()
            }).eq('user_id', tokenUserId);
        }

        // 3. Get Studio Mapping
        const config = studio?.google_sheets_config;

        // Resolve Mapping
        let mapping: Record<string, string> = {};
        if (config?.input && config.input.mapping) {
            mapping = config.input.mapping; // { "Header Name": "db_column" }
        } else if (config?.mapping) {
            mapping = config.mapping;
        } else {
            // Default
            mapping = {
                'Nome': 'first_name',
                'Cognome': 'last_name',
                'Email': 'email',
                'Telefono': 'phone'
            };
        }

        // 4. Fetch Sheets Data
        const range = `${sheet_name}!A:ZZ`;
        const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${encodeURIComponent(range)}`;

        const sheetRes = await fetch(sheetsUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const sheetJson = await sheetRes.json();

        if (!sheetRes.ok) {
            throw new Error(sheetJson.error?.message || "Error fetching sheet");
        }

        const rows = sheetJson.values || [];
        if (rows.length < 2) {
            return new Response(JSON.stringify({ message: "Sheet is empty or has only headers.", stats: { total: 0 } }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        const headers = rows[0].map((h: string) => h.trim());
        const dataRows = rows.slice(1);

        console.log(`Processing ${dataRows.length} rows...`);

        // 5. Process Rows
        let imported = 0;
        let updated = 0;
        let errors = 0;

        for (const row of dataRows) {
            // Build Client Object
            const clientPayload: any = { studio_id };
            let hasData = false;

            // Map standard fields
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                const value = row[i];
                if (!header || !value) continue;

                // Check mapping
                // Mapping keys might be exact string match
                const dbField = mapping[header];
                if (dbField) {
                    clientPayload[dbField] = value;
                    hasData = true;
                }
            }

            if (!hasData) continue; // Skip completely empty mapped rows

            // Normalize Name
            if (!clientPayload.full_name) {
                const first = clientPayload.first_name || '';
                const last = clientPayload.last_name || '';
                if (first || last) {
                    clientPayload.full_name = `${first} ${last}`.trim();
                } else {
                    // Fallback
                    clientPayload.full_name = clientPayload.email || clientPayload.phone || 'Sconosciuto (Import)';
                }
            }

            // Remove derived fields if not in DB schema (helper fields)
            delete clientPayload.first_name;
            delete clientPayload.last_name;

            // Normalize Email (convert "n/d" to text, but try to avoid conflict?)
            // We use the same loose logic: just send it.
            // But we need to handle duplicates in the DB.
            // If we use 'onConflict' (studio_id, email), we must ensure email is unique in payload.

            // Try to find existing client to Update
            let existingId: string | null = null;

            if (clientPayload.email) {
                const { data: existing } = await supabase.from('clients')
                    .select('id')
                    .eq('studio_id', studio_id)
                    .ilike('email', clientPayload.email) // Case insensitive match
                    .maybeSingle();
                if (existing) existingId = existing.id;
            }

            // If email didn't match, maybe phone? (Optional, user didn't strict ask for phone match, but good practice).
            // We removed phone matching in webhook to avoid false positives, so let's stick to Email or Create.

            try {
                if (existingId) {
                    // Update
                    const { error } = await supabase.from('clients').update(clientPayload).eq('id', existingId);
                    if (error) throw error;
                    updated++;
                } else {
                    // Create
                    const { error } = await supabase.from('clients').insert(clientPayload);
                    if (error) {
                        // If typical error (unique constraint), try to catch it?
                        if (error.code === '23505') { // Unique violation
                            console.warn('Duplicate found during insert, skipping or updating?', error.message);
                            // If duplicate, it means we missed it in search? Or race condition.
                            // We count as updated (or skipped).
                            updated++;
                        } else {
                            throw error;
                        }
                    } else {
                        imported++;
                    }
                }
            } catch (err) {
                console.error("Error processing row:", err);
                errors++;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            stats: {
                total: dataRows.length,
                imported,
                updated,
                errors
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});
