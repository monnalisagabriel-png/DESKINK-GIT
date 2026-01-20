import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const now = new Date();
        const results = [];

        // --- 1. REMINDER 7 DAYS BEFORE ---
        // Window: [Now + 7d, Now + 7d + 2h]
        const start7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const end7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString();

        console.log(`Checking 7d reminders between ${start7d} and ${end7d}`);

        const { data: apt7d, error: err7d } = await supabase
            .from('appointments')
            .select('*, client:clients(*), studio:studios(*)')
            .or('status.eq.CONFIRMED,status.eq.PENDING')
            .is('reminder_7d_sent', false)
            .gte('start_time', start7d)
            .lte('start_time', end7d);

        if (err7d) console.error("Error fetching 7d apts:", err7d);

        if (apt7d && apt7d.length > 0) {
            console.log(`Found ${apt7d.length} appointments for 7-day reminder.`);
            for (const apt of apt7d) {
                const studio = apt.studio;
                const settings = studio?.automation_settings;

                // Check if automation is enabled
                if (settings?.email_enabled && settings?.preferences?.appointment_reminder) {
                    const clientEmail = apt.client?.email;
                    if (clientEmail) {
                        const studioName = studio.name || 'InkFlow Studio';
                        const senderEmail = settings.sender_email;

                        console.log(`Sending 7d reminder to ${clientEmail} for apt ${apt.id}`);

                        // Studio Info for Footer
                        const studioAddress = [studio.address, studio.city].filter(Boolean).join(', ');
                        const whatsappContact = studio.phone ? `WhatsApp: ${studio.phone}` : '';
                        const footerText = [studioAddress, whatsappContact].filter(Boolean).join(' | ');

                        const htmlFooter = `
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #666; font-size: 12px;">
                                <strong>${studioName}</strong><br/>
                                ${studioAddress ? `${studioAddress}<br/>` : ''}
                                ${studio.phone ? `WhatsApp: ${studio.phone}` : ''}
                            </p>
                        `;

                        await supabase.functions.invoke('send-booking-email', {
                            body: {
                                to: clientEmail,
                                subject: `${studioName}: Promemoria Appuntamento (-7 Giorni)`,
                                sender_name: studioName,
                                reply_to: senderEmail,
                                text: `Ciao ${apt.client.full_name},\n\nTi ricordiamo il tuo appuntamento tra una settimana, il ${new Date(apt.start_time).toLocaleDateString()} alle ${new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.\n\nServizio: ${apt.service_name || 'Servizio'}\n\nA presto,\n${studioName}\n${footerText}`,
                                html: `
                                     <div style="font-family: sans-serif; color: #333; background-color: #ffffff; padding: 20px; border-radius: 8px;">
                                         <h2>Promemoria Appuntamento</h2>
                                         <p>Ciao <strong>${apt.client.full_name}</strong>,</p>
                                         <p>Ti ricordiamo che tra una settimana hai un appuntamento presso <strong>${studioName}</strong>.</p>
                                         <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
                                             <p><strong>Quando:</strong> ${new Date(apt.start_time).toLocaleDateString()} alle ${new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                             <p><strong>Servizio:</strong> ${apt.service_name || 'Servizio'}</p>
                                         </div>

                                         <div style="margin-bottom: 20px;">
                                            <p><strong>Dove siamo:</strong><br/>
                                            ${studioName}<br/>
                                            ${studioAddress || 'Indirizzo non disponibile'}</p>
                                         </div>

                                         <p>Per modifiche all'appuntamento, contattaci <strong>esclusivamente su WhatsApp</strong>${studio.phone ? ' al numero ' + studio.phone : ''}.</p>
                                         <p>A presto,<br/>${studioName}</p>
                                         ${htmlFooter}
                                     </div>
                                 `
                            }
                        });
                        // Mark as sent
                        await supabase.from('appointments').update({ reminder_7d_sent: true }).eq('id', apt.id);
                        results.push({ id: apt.id, type: '7d', status: 'sent', email: clientEmail });
                    } else {
                        console.log(`Skipping 7d apt ${apt.id}: No client email.`);
                    }
                }
            }
        }

        // --- 2. REMINDER 24 HOURS BEFORE ---
        // Window: [Now + 23h, Now + 25h]
        const start24h = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
        const end24h = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

        console.log(`Checking 24h reminders between ${start24h} and ${end24h}`);

        const { data: apt24h, error: err24h } = await supabase
            .from('appointments')
            .select('*, client:clients(*), studio:studios(*)')
            .or('status.eq.CONFIRMED,status.eq.PENDING')
            .is('reminder_24h_sent', false)
            .gte('start_time', start24h)
            .lte('start_time', end24h);

        if (err24h) console.error("Error fetching 24h apts:", err24h);

        if (apt24h && apt24h.length > 0) {
            console.log(`Found ${apt24h.length} appointments for 24h reminder.`);
            for (const apt of apt24h) {
                const studio = apt.studio;
                const settings = studio?.automation_settings;

                if (settings?.email_enabled && settings?.preferences?.appointment_reminder) {
                    const clientEmail = apt.client?.email;
                    if (clientEmail) {
                        const studioName = studio.name || 'InkFlow Studio';
                        const senderEmail = settings.sender_email;

                        console.log(`Sending 24h reminder to ${clientEmail} for apt ${apt.id}`);

                        // Studio Info for Footer (Reuse logic if possible, or duplicate for speed)
                        const studioAddress = [studio.address, studio.city].filter(Boolean).join(', ');
                        const whatsappContact = studio.phone ? `WhatsApp: ${studio.phone}` : '';
                        const footerText = [studioAddress, whatsappContact].filter(Boolean).join(' | ');

                        const htmlFooter = `
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #666; font-size: 12px;">
                                <strong>${studioName}</strong><br/>
                                ${studioAddress ? `${studioAddress}<br/>` : ''}
                                ${studio.phone ? `WhatsApp: ${studio.phone}` : ''}
                            </p>
                        `;

                        await supabase.functions.invoke('send-booking-email', {
                            body: {
                                to: clientEmail,
                                subject: `${studioName}: Promemoria Appuntamento (Domani)`,
                                sender_name: studioName,
                                reply_to: senderEmail,
                                text: `Ciao ${apt.client.full_name},\n\nTi ricordiamo il tuo appuntamento di domani alle ${new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.\nServizio: ${apt.service_name || 'Servizio'}\n\nA domani,\n${studioName}\n${footerText}`,
                                html: `
                                     <div style="font-family: sans-serif; color: #333; background-color: #ffffff; padding: 20px; border-radius: 8px;">
                                         <h2>Promemoria Appuntamento</h2>
                                         <p>Ciao <strong>${apt.client.full_name}</strong>,</p>
                                         <p>Ti ricordiamo che domani hai un appuntamento presso <strong>${studioName}</strong>.</p>
                                         <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                                             <p><strong>Quando:</strong> ${new Date(apt.start_time).toLocaleDateString()} alle ${new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                             <p><strong>Servizio:</strong> ${apt.service_name || 'Servizio'}</p>
                                         </div>

                                         <div style="margin-bottom: 20px;">
                                            <p><strong>Dove siamo:</strong><br/>
                                            ${studioName}<br/>
                                            ${studioAddress || 'Indirizzo non disponibile'}</p>
                                         </div>

                                         <p>Per modifiche all'appuntamento, contattaci <strong>esclusivamente su WhatsApp</strong>${studio.phone ? ' al numero ' + studio.phone : ''}.</p>
                                         <p>A domani,<br/>${studioName}</p>
                                         ${htmlFooter}
                                     </div>
                                 `
                            }
                        });
                        // Mark as sent
                        await supabase.from('appointments').update({ reminder_24h_sent: true }).eq('id', apt.id);
                        results.push({ id: apt.id, type: '24h', status: 'sent', email: clientEmail });
                    } else {
                        console.log(`Skipping 24h apt ${apt.id}: No client email.`);
                    }
                }
            }
        }

        return new Response(JSON.stringify({ success: true, processed: results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Error processing reminders:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
