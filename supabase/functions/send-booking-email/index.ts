import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
    to: string;
    subject: string;
    text: string;
    html?: string;
    sender_name?: string;
    reply_to?: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error("Missing RESEND_API_KEY");
        }

        const { to, subject, text, html, sender_name, reply_to } = await req.json() as EmailRequest;
        const fromName = sender_name || "InkFlow Bookings";

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: `${fromName} <prenotazioni@deskink.it>`,
                to: [to],
                reply_to: reply_to || undefined,
                subject: subject,
                text: text,
                html: html || `<p>${text}</p>`,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            // Fallback for demo purposes if API key is invalid/missing in dev:
            console.error("Resend Error Details:", JSON.stringify(data));
            // console.log("Email mock sent to:", to);
            // Return 200 so the client can read the error body easily
            return new Response(JSON.stringify({ success: false, error: data, original_status: 400 }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }
});
