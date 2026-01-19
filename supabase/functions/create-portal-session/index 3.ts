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

        const { data: studio } = await supabaseAdmin
            .from('studios')
            .select('stripe_customer_id')
            .eq('created_by', user.id) // Or verify ownership via membership
            .single();

        if (!studio || !studio.stripe_customer_id) {
            throw new Error("No Stripe customer found for this studio");
        }

        const { return_url } = await req.json();

        const session = await stripe.billingPortal.sessions.create({
            customer: studio.stripe_customer_id,
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
