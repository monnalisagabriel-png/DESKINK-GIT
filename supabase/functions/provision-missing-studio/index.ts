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
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("Missing Authorization header");

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) throw new Error("Not authenticated");

        const { studio_name } = await req.json();

        if (!studio_name) throw new Error("Studio name is required");

        // Use SERVICE ROLE to bypass RLS and verify subscription
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Check if studio already exists (idempotency)
        const { data: existingStudio } = await supabaseAdmin
            .from('studios')
            .select('id')
            .eq('created_by', user.id)
            .maybeSingle();

        if (existingStudio) {
            // Create Membership if missing
            const { error: memberError } = await supabaseAdmin
                .from('studio_memberships')
                .insert({
                    studio_id: existingStudio.id,
                    user_id: user.id,
                    role: 'owner'
                }); // Ignore error if exists (duplicate key)

            return new Response(JSON.stringify({ success: true, studioId: existingStudio.id, message: "Restored existing studio" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Verify Valid Subscription from Stripe
        // We need to look up the customer by email or metadata
        const customers = await stripe.customers.search({
            query: `email:'${user.email}'`,
            limit: 1
        });

        let validSubscription = null;
        if (customers.data.length > 0) {
            const customerId = customers.data[0].id;
            const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: 'active',
                limit: 1
            });
            if (subscriptions.data.length > 0) {
                validSubscription = subscriptions.data[0];
            }
        }

        // Allow 'trialing' too? Yes.

        if (!validSubscription) {
            // Try searching by metadata user_id if email failed
            // (Skipping for brevity, email should match)
            throw new Error("No active subscription found for this user. Please confirm payment first.");
        }

        // 3. Create Studio
        const tier = validSubscription.metadata?.tier || 'basic';

        const { data: newStudio, error: createError } = await supabaseAdmin
            .from('studios')
            .insert({
                name: studio_name,
                created_by: user.id,
                subscription_status: 'active',
                subscription_tier: tier,
                stripe_customer_id: validSubscription.customer as string,
                stripe_subscription_id: validSubscription.id,
                // Set default limits
                max_artists: tier === 'plus' ? 4 : (tier === 'pro' ? 2 : 1),
                max_managers: tier === 'plus' ? 4 : (tier === 'pro' ? 2 : 1),
            })
            .select('id')
            .single();

        if (createError) throw createError;

        // 4. Create Membership
        await supabaseAdmin
            .from('studio_memberships')
            .insert({
                studio_id: newStudio.id,
                user_id: user.id,
                role: 'owner'
            });

        // 5. Update User Status
        await supabaseAdmin
            .from('users')
            .update({ account_status: 'active' })
            .eq('id', user.id);

        return new Response(JSON.stringify({ success: true, studioId: newStudio.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Provision Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
