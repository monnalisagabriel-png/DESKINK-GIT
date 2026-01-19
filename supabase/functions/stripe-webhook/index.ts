import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
    const signature = req.headers.get("Stripe-Signature");
    const body = await req.text(); // Read raw body for signature verification

    try {
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET") ?? "",
            undefined,
            cryptoProvider
        );

        console.log(`Event received: ${event.type}`);

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                console.log(`Processing checkout.session.completed for session ${session.id}`);

                let studioId = session.metadata?.studio_id;
                const userId = session.metadata?.user_id;
                const tier = session.metadata?.tier; // 'basic', 'pro', 'plus'
                const extraSlots = parseInt(session.metadata?.extra_slots || '0');

                console.log(`Metadata: studio_id=${studioId}, user_id=${userId}, tier=${tier}`);

                if (!studioId && userId) {
                    console.log(`Studio ID missing in metadata for user ${userId}`);

                    // NEW: Check for studio_name to CREATE a new studio
                    const studioName = session.metadata?.studio_name;
                    if (studioName) {
                        console.log(`Creating NEW studio "${studioName}" for user ${userId}`);
                        const { data: newStudio, error: createError } = await supabaseClient
                            .from('studios')
                            .insert({
                                name: studioName,
                                created_by: userId,
                                subscription_status: 'active', // Will be updated below anyway
                                subscription_tier: tier || 'basic'
                            })
                            .select('id')
                            .single();

                        if (createError) {
                            console.error('Failed to create studio (might exist):', createError);
                            // FALLBACK: User might already have a studio, try to find it
                            const { data: existingStudio } = await supabaseClient
                                .from('studios')
                                .select('id')
                                .eq('created_by', userId)
                                .maybeSingle();

                            if (existingStudio) {
                                studioId = existingStudio.id;
                                console.log(`Fallback: Found existing studio ID ${studioId}`);
                            }
                        } else if (newStudio) {
                            studioId = newStudio.id;
                            console.log(`Studio created: ${studioId}`);

                            // Create Membership
                            const { error: memberError } = await supabaseClient
                                .from('studio_memberships')
                                .insert({
                                    studio_id: studioId,
                                    user_id: userId,
                                    role: 'owner'
                                });
                            if (memberError) console.error('Failed to create membership:', memberError);

                            // Activate User
                            const { error: userError } = await supabaseClient
                                .from('users')
                                .update({ account_status: 'active' })
                                .eq('id', userId);
                            if (userError) console.error('Failed to activate user:', userError);
                        }
                    } else {
                        // Fallback: Find existing studio owned by user if no name provided
                        const { data: studioVal } = await supabaseClient
                            .from('studios')
                            .select('id')
                            .eq('created_by', userId)
                            .single();

                        if (studioVal) {
                            studioId = studioVal.id;
                            console.log(`Found existing studio ${studioId} for user ${userId}`);
                        } else {
                            console.error(`Could not find or create studio for user ${userId}`);
                        }
                    }
                }

                if (studioId && tier) {
                    // Update Studio Subscription
                    // Set limits based on tier
                    let maxArtists = 1;
                    let maxManagers = 1;

                    if (tier === 'basic') { maxArtists = 1; maxManagers = 1; }
                    if (tier === 'pro') { maxArtists = 2; maxManagers = 2; }
                    if (tier === 'plus') { maxArtists = 4; maxManagers = 4; } // Base plus

                    const { error: updateError } = await supabaseClient.from("studios").update({
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                        subscription_status: 'active',
                        subscription_tier: tier,
                        max_artists: maxArtists,
                        max_managers: maxManagers,
                        extra_slots: extraSlots,
                        currency: session.currency
                    }).eq("id", studioId);

                    if (updateError) {
                        console.error(`Failed to update studio ${studioId}: ${updateError.message}`);
                    } else {
                        console.log(`Studio ${studioId} activated on ${tier} with ${extraSlots} extra slots`);
                    }
                } else {
                    console.error(`Missing required metadata for activation: studioId=${studioId}, tier=${tier}`);
                }

                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;

                if (subscriptionId) {
                    await supabaseClient.from("studios").update({
                        subscription_status: 'active'
                    }).eq("stripe_subscription_id", subscriptionId);
                    console.log(`Invoice paid for subscription ${subscriptionId}, status kept active.`);
                }
                break;
            }

            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const status = subscription.status;
                const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

                await supabaseClient.from("studios").update({
                    subscription_status: status,
                    current_period_end: currentPeriodEnd
                }).eq("stripe_subscription_id", subscription.id);

                console.log(`Subscription ${subscription.id} updated to ${status}, renews: ${currentPeriodEnd}`);
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(err.message, { status: 400 });
    }
});
