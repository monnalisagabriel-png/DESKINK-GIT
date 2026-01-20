import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
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
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Use SERVICE ROLE to look up studio details (read-only for this purpose is safe-ish, but let's be strict)
        // We need to find the studio owned by this user
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: studio, error: studioError } = await supabaseAdmin
            .from('studios')
            .select('id, stripe_customer_id')
            .eq('created_by', user.id)
            .maybeSingle();

        if (studioError || !studio) {
            throw new Error("Studio not found for this user");
        }

        let customerId = studio.stripe_customer_id;

        // 1. If customer ID is missing, create it (Fix for Legacy/Inconsistent state)
        if (!customerId) {
            console.log(`[Portal] Missing stripe_customer_id for studio ${studio.id}. Provisioning new Customer...`);

            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    studio_id: studio.id,
                    user_id: user.id,
                    source: 'portal_fix'
                }
            });

            customerId = customer.id;
            console.log(`[Portal] Created Stripe Customer ${customerId}. Saving to DB...`);

            // 2. Save immediately to DB
            const { error: updateError } = await supabaseAdmin
                .from('studios')
                .update({ stripe_customer_id: customerId })
                .eq('id', studio.id);

            if (updateError) {
                console.error('[Portal] Failed to save stripe_customer_id:', updateError);
                throw new Error("Failed to persist Stripe Customer ID");
            }
        }

        const { return_url } = await req.json();

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: return_url || req.headers.get("origin") || 'http://localhost:3000',
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
