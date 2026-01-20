import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "./cors.ts";

console.log("Hello from Google Sheets Webhook!");

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { studio_id, secret, data } = await req.json();

        if (!studio_id || !secret || !data) {
            throw new Error("Missing required fields: studio_id, secret, or data");
        }

        console.log(`Received webhook for studio: ${studio_id}`);

        // 1. Verify Studio & Secret
        const { data: studio, error: studioError } = await supabaseClient
            .from('studios')
            .select('google_sheets_config')
            .eq('id', studio_id)
            .single();

        if (studioError || !studio) {
            console.error('Studio lookup error:', studioError);
            throw new Error("Invalid Studio ID");
        }

        const config = studio.google_sheets_config;

        // Check if configured (Support Legacy & New Nested Structure)
        // New: config.input.enabled
        // Legacy: config.auto_sync_enabled
        let inputConfig: any = {};

        if (config?.input) {
            inputConfig = config.input;
        } else {
            // Fallback for transition
            inputConfig = {
                enabled: config?.auto_sync_enabled,
                secret: config?.webhook_secret,
                mapping: config?.mapping
            };
        }

        if (!inputConfig || !inputConfig.secret) {
            throw new Error("Google Sheets (Input) integration not configured.");
        }

        // Verify Secret
        if (inputConfig.secret !== secret) {
            console.error(`Secret Mismatch! Expected (DB): ${inputConfig.secret?.slice(0, 4)}... Received (Script): ${secret?.slice(0, 4)}...`);
            return new Response(JSON.stringify({ error: "Unauthorized: Invalid Secret. Please CLICK SAVE in Inkflow Settings." }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 2. Map Data
        // mapping is expected to be { "Sheet Header": "db_column" }
        // data is expected to be { "Sheet Header": "Value", ... }

        const mapping = inputConfig.mapping || {};
        const clientData: any = {
            studio_id: studio_id,
            // Default note only if not mapped later
            notes: Object.values(mapping).includes('notes') ? '' : `Imported from Google Sheet via Webhook at ${new Date().toISOString()}`
        };

        let tempFirstName = '';
        let tempLastName = '';

        // Iterate over incoming data columns (keys)
        for (const [sheetHeader, value] of Object.entries(data)) {
            const dbColumn = mapping[sheetHeader];

            if (dbColumn) {
                // Handle specific logic for certain columns
                if (dbColumn === 'preferred_styles' && typeof value === 'string') {
                    // Split comma separated string into array, handling potential extra spaces
                    clientData[dbColumn] = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                } else if (dbColumn === 'whatsapp_broadcast_opt_in') {
                    // Convert boolean-ish strings
                    const v = String(value).toLowerCase();
                    clientData[dbColumn] = (v === 'si' || v === 'yes' || v === 'vero' || v === 'true');
                } else if (dbColumn === 'first_name') {
                    tempFirstName = String(value).trim();
                } else if (dbColumn === 'last_name') {
                    tempLastName = String(value).trim();
                } else {
                    // Default direct assignment
                    clientData[dbColumn] = value;
                }
            }
        }

        // Construct full_name if missing but parts are available
        if (!clientData.full_name && (tempFirstName || tempLastName)) {
            clientData.full_name = `${tempFirstName} ${tempLastName}`.trim();
        }

        // Explicit check for identifier
        // RELAXED VALIDATION (2026-01-20): 
        // Allow import even if no email/phone, as long as we have a name.
        if (!clientData.full_name && !clientData.email && !clientData.phone) {
            console.warn("Skipping row: No Name, Email, or Phone.");
            return new Response(JSON.stringify({ message: "Skipped: Empty Row" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        // 3. Upsert Client
        // We try to find match by Email OR Phone
        let existingClientId = null;

        if (clientData.email) {
            // Use ilike for case-insensitive matching
            const { data: byEmail } = await supabaseClient
                .from('clients')
                .select('id')
                .eq('studio_id', studio_id)
                .ilike('email', clientData.email)
                .maybeSingle();

            if (byEmail) existingClientId = byEmail.id;
        }

        /* 
        // PHONE MATCHING DISABLED BY USER REQUEST (2026-01-20)
        // User wants to allow duplicates if they only share a phone number.
        if (!existingClientId && clientData.phone) {
            // Try raw match
            const { data: byPhone } = await supabaseClient
                .from('clients')
                .select('id')
                .eq('studio_id', studio_id)
                .eq('phone', clientData.phone)
                .maybeSingle();

            if (byPhone) {
                existingClientId = byPhone.id;
            } else {
                // Try stripping spaces/dashes if the provided phone has them
                const cleanPhone = String(clientData.phone).replace(/[\s-]/g, '');
                if (cleanPhone !== clientData.phone) {
                    const { data: byCleanPhone } = await supabaseClient
                        .from('clients')
                        .select('id')
                        .eq('studio_id', studio_id)
                        .eq('phone', cleanPhone)
                        .maybeSingle();
                    if (byCleanPhone) existingClientId = byCleanPhone.id;
                }
            }
        }
        */

        let result;
        if (existingClientId) {
            // Update
            console.log(`Updating existing client: ${existingClientId}`);

            // Only update fields that are provided (undefined check might be needed if I didn't want to overwrite with nulls, 
            // but here clientData only has mapped fields. 
            // Ideally we shouldn't overwrite existing data with empty strings if that wasn't intended, but usually sync means "make it like sheet")

            const { data: updated, error } = await supabaseClient
                .from('clients')
                .update(clientData)
                .eq('id', existingClientId)
                .select()
                .single();

            if (error) throw error;
            result = updated;
        } else {
            // Create
            console.log(`Creating new client`);
            // Ensure full_name is present (required)
            if (!clientData.full_name) {
                clientData.full_name = clientData.email?.split('@')[0] || clientData.phone || 'Sconosciuto';
            }

            const { data: created, error } = await supabaseClient
                .from('clients')
                .insert(clientData)
                .select()
                .single();

            if (error) throw error;
            result = created;
        }

        return new Response(JSON.stringify({ success: true, client_id: result.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("Webhook Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
