
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    try {
        const { amount, currency, service_name, customer_email, stripe_account_id } = await req.json();

        if (!amount || !currency) {
            throw new Error("Missing required params");
        }

        const paymentConfig: any = {
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            automatic_payment_methods: { enabled: true },
            description: `Deposit for ${service_name}`,
            receipt_email: customer_email,
        };

        // If an artist connected account is provided, route the funds to them
        if (stripe_account_id) {
            paymentConfig.transfer_data = {
                destination: stripe_account_id,
            };
        }

        const paymentIntent = await stripe.paymentIntents.create(paymentConfig);

        return new Response(
            JSON.stringify({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }),
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
