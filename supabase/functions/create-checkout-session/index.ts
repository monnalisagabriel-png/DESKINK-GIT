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
    // Basic Plan: €20/month
    basic: "price_1Squcg0hAMe4NIOXYkw5NaW3",
    // Pro Plan: €40/month
    pro: "price_1Squdl0hAMe4NIOX0ter6U0I",
    // Plus Plan: €70/month (Assuming this is distinct, user logs were ambiguous)
    plus: "price_1Squeq0hAMe4NIOXM03pRJj4",
    // Extra Seat: €10/month
    extra: "price_1Squhx0hAMe4NIOXS0pEUF3p"
};

serve(async (req) => {
    // Log the request for debugging
    console.log(`[Function] Received request: ${req.method}`);

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new Error("Missing Authorization header");
        }

        // Authenticate user
        // @ts-ignore
        const supabaseUrl = Deno.env.get("PROD_SUPABASE_URL") || Deno.env.get("SUPABASE_URL") || "";
        // @ts-ignore
        const supabaseKey = Deno.env.get("PROD_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";

        const supabaseClient = createClient(
            supabaseUrl,
            supabaseKey,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            console.error("Auth Error details:", authError);
            throw new Error(`Not authenticated: ${authError?.message || 'No user found'}`);
        }

        console.log(`[Function] User authenticated: ${user.id}`);

        // Use SERVICE ROLE client to bypass RLS for looking up the studio
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Get Studio for this user
        // Note: created_by should match user.id
        const { data: studio, error: studioError } = await supabaseAdmin
            .from('studios')
            .select('*')
            .eq('created_by', user.id)
            .maybeSingle();

        if (studioError) {
            console.error("Studio lookup error", studioError);
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            throw new Error("Invalid JSON body");
        }

        const { tier, interval, extra_seats = 0, success_url, cancel_url, studio_name } = body;

        console.log(`[Function] Processing checkout for tier: ${tier}, studio: ${studio?.id || 'New'}`);

        if (!PRICE_IDS[tier]) {
            console.error(`Invalid tier: ${tier}. Available: ${Object.keys(PRICE_IDS).join(', ')}`);
            throw new Error(`Invalid tier: ${tier}`);
        }

        // Allow missing studio ONLY if studio_name is provided (New User Flow)
        if (!studio && !studio_name) {
            throw new Error("Studio not found. Please provide a studio name to create one.");
        }

        let targetStudio = studio;

        // If no existing studio found, CREATE ONE NOW (Pre-Provisioning)
        // This ensures we have an ID to pass to Stripe as client_reference_id
        if (!targetStudio && studio_name) {
            console.log(`[Function] Creating 'pending' studio for pre-checkout: ${studio_name}`);

            // STRICT INSERT: No null fields to avoid constraint issues
            const { data: newStudio, error: createError } = await supabaseAdmin
                .from('studios')
                .insert({
                    name: studio_name,
                    created_by: user.id,
                    subscription_status: 'none', // Use allowed status (active/past_due/canceled/trialing/none)
                    subscription_tier: tier || 'basic',
                    max_artists: 1,
                    max_managers: 1,
                    extra_slots: 0
                })
                .select('*')
                .single();

            if (createError) {
                console.error("Failed to pre-create studio:", createError);
                throw new Error(`Failed to initialize studio: ${createError.message}`);
            }
            targetStudio = newStudio;

            // Create Owner Membership immediately
            const { error: memberError } = await supabaseAdmin.from('studio_memberships').insert({
                studio_id: targetStudio.id,
                user_id: user.id,
                role: 'owner'
            });

            if (memberError) {
                console.error("Failed to create initial membership:", memberError);
                // Continue, but log it. Webhook will retry upsert.
            }
        }

        const priceId = PRICE_IDS[tier];

        const line_items = [
            {
                price: priceId,
                quantity: 1,
            },
        ];

        if (extra_seats > 0) {
            if (!PRICE_IDS.extra) throw new Error("Extra member price not configured");
            line_items.push({
                price: PRICE_IDS.extra,
                quantity: extra_seats,
            });
        }

        const origin = req.headers.get("origin") || 'http://localhost:3000';

        // Check if Stripe Key is present
        if (!Deno.env.get("STRIPE_SECRET_KEY")) {
            throw new Error("Server configuration error: STRIPE_SECRET_KEY is missing");
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            // Attach to customer if exists (and has ID), else use email
            ...(targetStudio?.stripe_customer_id
                ? { customer: targetStudio.stripe_customer_id }
                : { customer_email: user.email }
            ),
            client_reference_id: targetStudio?.id, // CRITICAL: Link Stripe Session to Studio ID
            line_items: line_items,
            mode: "subscription",
            success_url: success_url || `${origin}/dashboard/settings?subscription=success`,
            cancel_url: cancel_url || `${origin}/dashboard/settings?subscription=canceled`,
            allow_promotion_codes: true,
            // automatic_payment_methods removed for subscription compatibility
            metadata: {
                studio_id: targetStudio?.id || '',
                user_id: user.id,
                tier: tier,
                extra_slots: extra_seats,
                studio_name: targetStudio?.name || ''
            },
            subscription_data: {
                metadata: {
                    studio_id: targetStudio?.id || '',
                    user_id: user.id,
                    tier: tier
                }
            }
        });


        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error handler:", error);
        return new Response(JSON.stringify({
            error: error.message,
            stack: error.stack,
            details: error
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
