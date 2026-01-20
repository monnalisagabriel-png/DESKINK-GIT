import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { corsHeaders } from "./cors.ts";

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

        const { client, studio_id } = await req.json();

        if (!client || !studio_id) {
            throw new Error("Missing required fields: client, studio_id");
        }

        console.log(`[Push-Master] Processing for studio: ${studio_id}, client: ${client.id}`);

        // 1. Load Studio Config (Output)
        const { data: studio, error: studioError } = await supabaseClient
            .from('studios')
            .select('google_sheets_config')
            .eq('id', studio_id)
            .single();

        if (studioError || !studio) {
            throw new Error("Invalid Studio ID or Config load failed");
        }

        const config = studio.google_sheets_config;
        const outputConfig = config?.output;

        if (!outputConfig || !outputConfig.enabled || !outputConfig.script_url) {
            console.log("[Push-Master] Output sync not configured or disabled. Skipping.");
            return new Response(JSON.stringify({ skipped: true, reason: "Not configured" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        // 2. Map Data
        // mapping: { "DB Column": "Sheet Header" }
        const mapping = outputConfig.mapping || {};

        // Prepare payload for Apps Script
        // The Apps Script expects specific keys based on HEADERS
        // We need to send { "header_name": "value" }
        const payload: Record<string, any> = {};

        for (const [dbField, sheetHeader] of Object.entries(mapping)) {
            let value = (client as any)[dbField];

            // Modifications for specific types
            if (Array.isArray(value)) {
                value = value.join(', ');
            }
            if (typeof value === 'boolean') {
                value = value ? 'Sì' : 'No';
            }
            if (value === undefined || value === null) {
                value = "";
            }

            payload[sheetHeader] = value;
        }

        // Add ID always for updating
        payload["ID"] = client.id;
        // Also send "Email" or "Phone" if not mapped, as fallbacks for matching?
        // Actually, the Script will need ID to find the row to update.
        // Let's ensure the script knows how to handle this.

        console.log("[Push-Master] Sending payload to Apps Script:", outputConfig.script_url);

        // 3. Send to Google Apps Script Web App
        const response = await fetch(outputConfig.script_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'upsert_client',
                data: payload,
                match_key: 'ID' // Tell script to match by our DB ID
            })
        });

        const respText = await response.text();
        console.log("[Push-Master] Apps Script Response:", respText);

        if (!response.ok) {
            throw new Error(`Apps Script returned ${response.status}: ${respText}`);
        }

        return new Response(JSON.stringify({ success: true, upstream: respText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error("[Push-Master] Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
