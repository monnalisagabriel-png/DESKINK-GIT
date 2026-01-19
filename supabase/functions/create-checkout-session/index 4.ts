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

const PRICE_IDS = {
    basic: "price_1Squcg0hAMe4NIOXYkw5NaW3",
    pro: "price_1Squdl0hAMe4NIOX0ter6U0I",
    plus: "price_1Squeq0hAMe4NIOXM03pRJj4",
    extra: "price_1Squhx0hAMe4NIOXS0pEUF3p"
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Authenticate user
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) throw new Error("Not authenticated");

        // Use SERVICE ROLE client to bypass RLS for looking up the studio
        // This is safe because we check `created_by` matches the authenticated user.
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Get Studio for this user
        const { data: studio } = await supabaseAdmin
            .from('studios')
            .select('*')
            // Match 'created_by' (which is the correct column name from migration) OR 'owner_id' if schema changed
            // Migration says 'created_by'
            .eq('created_by', user.id)
            .single();

        if (!studio) {
            throw new Error("Studio not found or you are not the owner.");
        }

        const { tier, interval, extra_seats = 0, success_url, cancel_url } = await req.json(); // tier: 'basic' | 'pro' | 'plus'

        if (!PRICE_IDS[tier]) throw new Error("Invalid tier");

        const priceId = PRICE_IDS[tier];

        const line_items = [
            {
                price: priceId,
                quantity: 1,
            },
        ];

        // Add extra seats if applicable (and valid for the plan? assuming yes for now or specifically for Plus)
        // The prompt implies a general available option or specific to one config. 
        // Using "extra" price ID.
        if (extra_seats > 0) {
            if (!PRICE_IDS.extra) throw new Error("Extra member price not configured");
            line_items.push({
                price: PRICE_IDS.extra,
                quantity: extra_seats,
            });
        }

        const origin = req.headers.get("origin");

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            ...(studio.stripe_customer_id
                ? { customer: studio.stripe_customer_id }
                : { customer_email: user.email }
            ),
            line_items: line_items,
            mode: "subscription",
            success_url: success_url || `${origin}/dashboard/settings?subscription=success`,
            cancel_url: cancel_url || `${origin}/dashboard/settings?subscription=canceled`,
            allow_promotion_codes: true,
            metadata: {
                studio_id: studio.id,
                user_id: user.id,
                tier: tier,
                extra_slots: extra_seats
            }
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
