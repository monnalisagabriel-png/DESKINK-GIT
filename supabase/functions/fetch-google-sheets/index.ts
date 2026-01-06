
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // Create Admin client for DB access (bypass RLS)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get User from the Request Token (Auth check)
        // Debug Auth
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.error('Missing Authorization header');
            return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

        if (authError || !user) {
            console.error('Auth Error:', authError);
            return new Response(JSON.stringify({ error: `Auth Failed: ${authError?.message || 'No user found'}` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Get tokens from user_integrations using Admin Client
        const { data: integration, error: dbError } = await supabaseAdmin
            .from('user_integrations')
            .select('access_token, refresh_token, expires_at')
            .eq('user_id', user.id)
            .eq('provider', 'google')
            .single();

        if (dbError || !integration) {
            console.error('DB Error or No Integration:', dbError);
            throw new Error('Google account not connected');
        }

        // Check if token needs refresh (simple check)
        let accessToken = integration.access_token;
        if (new Date(integration.expires_at) < new Date()) {
            // TODO: Implement refresh flow if needed, for now assume re-auth
            console.log('Token expired for user', user.id);
        }

        const { action, spreadsheetId, sheetName } = await req.json();

        if (action === 'list_spreadsheets') {
            const response = await fetch(
                "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id, name)",
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data = await response.json();

            if (!response.ok) {
                console.error('Google Drive API Error:', data);
                return new Response(JSON.stringify({ error: data.error?.message || 'Failed to list spreadsheets' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            return new Response(JSON.stringify(data.files || []), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        } else if (action === 'get_sheet_data') {
            if (!spreadsheetId || !sheetName) return new Response(JSON.stringify({ error: 'Missing spreadsheetId or sheetName' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z1000`; // Limit to 1000 rows/Z cols for safety
            const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
            const data = await response.json();

            if (!response.ok) {
                console.error('Google Sheets API Error:', data);
                return new Response(JSON.stringify({ error: data.error?.message || 'Failed to get sheet data' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            return new Response(JSON.stringify(data.values || []), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        } else if (action === 'get_sheets_metadata') {
            if (!spreadsheetId) return new Response(JSON.stringify({ error: 'Missing spreadsheetId' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`;
            const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
            const data = await response.json();

            if (!response.ok) {
                console.error('Google Sheets Metadata API Error:', data);
                return new Response(JSON.stringify({ error: data.error?.message || 'Failed to get sheet metadata' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            const sheets = data.sheets?.map((s: any) => s.properties.title) || [];
            return new Response(JSON.stringify(sheets), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        // Return 200 for logical errors so the client can read the message
        return new Response(JSON.stringify({ error: error.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});

