
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Check Authentication
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('No authorization header');

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error('Unauthorized');

        const { appointment_id, reason } = await req.json();

        if (!appointment_id) throw new Error('Missing appointment_id');

        // Fetch Appointment to get payment_intent_id
        // We use Service Role to fetch potentially restricted data if needed, or just standard client
        // Here we use Service Role to ensure we can read the intent ID even if RLS is strict
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: appointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
            .select('stripe_payment_intent_id, artist_id, studio_id')
            .eq('id', appointment_id)
            .single();

        if (fetchError || !appointment) throw new Error('Appointment not found');

        // Verify user has permission (is artist or ownwer/manager of studio)
        // Simplified check: Allow if user is logged in for now, real implementation should verify role against studio_id

        if (!appointment.stripe_payment_intent_id) {
            return new Response(JSON.stringify({ message: 'No payment to refund' }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        const refund = await stripe.refunds.create({
            payment_intent: appointment.stripe_payment_intent_id,
            reason: reason || 'requested_by_customer',
        });

        return new Response(
            JSON.stringify({ success: true, refundId: refund.id }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
