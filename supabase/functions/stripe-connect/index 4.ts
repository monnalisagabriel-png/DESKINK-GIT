import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

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

    const { pathname, searchParams } = new URL(req.url);
    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        if (!Deno.env.get("STRIPE_SECRET_KEY")) {
            console.error("STRIPE_SECRET_KEY is missing from env!");
            throw new Error("Server Misconfiguration: connection to Stripe unavailable.");
        }

        let action = '';
        let user_id = '';

        // Handle POST (JSON body)
        if (req.method === 'POST') {
            try {
                const body = await req.json();
                action = body.action;
                user_id = body.user_id;
            } catch (e) {
                console.warn("Failed to parse body:", e);
                // Fallback to params if body fails? Or just empty
            }
        } else {
            // Handle GET
            action = searchParams.get('action') || (pathname.endsWith('/connect') ? 'connect' : 'status');
            user_id = searchParams.get('user_id') || '';
        }

        // 1. Initiate Connect Flow
        if (action === 'connect' || pathname.endsWith("/connect")) {
            if (!user_id) throw new Error("Missing user_id");
            console.log("Creating Stripe Account for user:", user_id);

            const account = await stripe.accounts.create({
                type: 'standard',
            });
            console.log("Stripe Account Created:", account.id);

            const accountLink = await stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${req.headers.get("origin")}/dashboard/settings?stripe_connect=refresh`,
                return_url: `${req.headers.get("origin")}/dashboard/settings?stripe_connect=success&account_id=${account.id}`,
                type: 'account_onboarding',
            });
            console.log("Account Link Created:", accountLink.url);

            // Save the pending account ID to the user record
            await supabaseClient.from("users").update({
                stripe_account_id: account.id,
                stripe_account_status: 'pending'
            }).eq("id", user_id);

            return new Response(JSON.stringify({ url: accountLink.url }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Check Account Status (Optional utility)
        if (action === 'status' || pathname.endsWith("/status")) {
            const user_id = searchParams.get("user_id");
            if (!user_id) throw new Error("Missing user_id");

            const { data: user } = await supabaseClient.from("users").select("stripe_account_id").eq("id", user_id).single();
            if (!user?.stripe_account_id) return new Response(JSON.stringify({ connected: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

            const account = await stripe.accounts.retrieve(user.stripe_account_id);

            const isComplete = account.details_submitted && account.charges_enabled;

            if (isComplete) {
                await supabaseClient.from("users").update({ stripe_onboarding_completed: true, stripe_account_status: 'active' }).eq("id", user_id);
            }

            return new Response(JSON.stringify({
                connected: true,
                details_submitted: account.details_submitted,
                charges_enabled: account.charges_enabled
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response("Not Found", { status: 404 });

    } catch (error: any) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
