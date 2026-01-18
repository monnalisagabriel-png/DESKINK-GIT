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
        if (!user.email) throw new Error("User has no email");

        console.log(`Checking subscriptions for user ${user.email}`);

        // 1. Search Stripe Customer by Email
        const customers = await stripe.customers.search({
            query: `email:'${user.email}'`,
            limit: 1
        });

        if (customers.data.length === 0) {
            throw new Error("Nessun account Stripe trovato per questa email.");
        }

        const customer = customers.data[0];
        console.log(`Found customer: ${customer.id}`);

        // 2. Search Active Subscriptions for this Customer
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1
        });

        if (subscriptions.data.length === 0) {
            throw new Error("Nessun abbonamento attivo trovato su Stripe.");
        }

        const subscription = subscriptions.data[0];
        console.log(`Found subscription: ${subscription.id} status: ${subscription.status}`);

        // Determine plan from price ID (simplified mapping, could be robustified)
        const priceId = subscription.items.data[0].price.id;
        let tier = 'basic';
        let extraSlots = 0;

        // Basic mapping (needs to match create-checkout-session IDs if possible, or just default to tier found)
        // Ideally we check product metadata or price nickname.
        // For recovery, we can default to 'basic' if unknown, or try to guess.
        // Or better: read metadata from subscription/product if available?
        // Let's rely on webhook logic for tier determination if possible, OR just hardcode mapping if we know it.
        // Based on create-checkout-session:
        // basic: "price_1Squcg0hAMe4NIOXYkw5NaW3"
        // pro: "price_1Squdl0hAMe4NIOX0ter6U0I"
        // plus: "price_1Squeq0hAMe4NIOXM03pRJj4"

        switch (priceId) {
            case "price_1Squdl0hAMe4NIOX0ter6U0I": tier = 'pro'; break;
            case "price_1Squeq0hAMe4NIOXM03pRJj4": tier = 'plus'; break;
            default: tier = 'basic';
        }

        // Logic for limits
        let maxArtists = 1;
        let maxManagers = 1;
        if (tier === 'pro') { maxArtists = 2; maxManagers = 2; }
        if (tier === 'plus') { maxArtists = 4; maxManagers = 4; }

        // 3. Update Supabase
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Find studio by owner
        const { data: studio } = await supabaseAdmin
            .from('studios')
            .select('id')
            .eq('created_by', user.id)
            .single();

        if (!studio) throw new Error("Studio not found for user.");

        const { error: updateError } = await supabaseAdmin
            .from('studios')
            .update({
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id,
                subscription_status: 'active',
                subscription_tier: tier,
                max_artists: maxArtists,
                max_managers: maxManagers,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', studio.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({
            success: true,
            message: "Subscription restored",
            tier: tier
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Restore Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
