import React, { useState } from 'react';
import type { Appointment } from '../../../services/types';
import { supabase } from '../../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, X, Clock, Calendar, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface BookingRequestsProps {
    appointments: Appointment[];
    onUpdate: () => void; // Callback to refresh dashboard data
}

export const BookingRequests: React.FC<BookingRequestsProps> = ({ appointments, onUpdate }) => {
    const [processing, setProcessing] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const pendingAppointments = appointments.filter(a => a.status === 'PENDING').sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const handleAction = async (id: string, action: 'CONFIRM' | 'REJECT') => {
        if (!confirm(action === 'CONFIRM' ? 'Vuoi accettare questa richiesta?' : 'Vuoi rifiutare questa richiesta?')) return;

        setProcessing(id);
        try {
            // Fetch Appointment with details
            const appt = appointments.find(a => a.id === id);
            if (!appt) throw new Error("Appuntamento non trovato");

            // Fetch Studio and Artist Details for Email
            const { data: studio, error: studioError } = await supabase
                .from('studios')
                .select('name, address, city')
                .eq('id', appt.studio_id)
                .single();
            if (studioError) console.error("Error fetching studio details:", studioError);
            const studioName = studio?.name || 'InkFlow';

            const { data: artist, error: artistError } = await supabase
                .from('users')
                .select('email, full_name')
                .eq('id', appt.artist_id)
                .single();
            if (artistError) console.error("Error fetching artist details:", artistError);
            const artistEmail = artist?.email;

            if (action === 'REJECT') {
                const { error } = await supabase
                    .from('appointments')
                    .update({ status: 'REJECTED' })
                    .eq('id', id);
                if (error) throw error;

                // Send REJECTED Email
                if (appt.client?.email) {
                    await supabase.functions.invoke('send-booking-email', {
                        body: {
                            to: appt.client.email,
                            sender_name: studioName,
                            reply_to: artistEmail,
                            subject: `Aggiornamento Prenotazione - ${studioName}`,
                            text: `Ciao ${appt.client.full_name}, la tua richiesta per ${appt.service_name} è stata rifiutata.`,
                            html: `
                                <div style="font-family: sans-serif; color: #333;">
                                    <h1 style="color: #ef4444;">Richiesta Rifiutata ❌</h1>
                                    <p>Ciao <strong>${appt.client.full_name}</strong>,</p>
                                    <p>Ci dispiace informarti che la tua richiesta presso <strong>${studioName}</strong> per il servizio <strong>${appt.service_name}</strong> non è stata accettata.</p>
                                    <p>L'acconto verrà rimborsato automaticamente.</p>
                                </div>
                            `
                        }
                    });
                }
            } else {
                const { error: updateError } = await supabase
                    .from('appointments')
                    .update({ status: 'CONFIRMED' })
                    .eq('id', id);
                if (updateError) throw updateError;

                // Create Transaction for Deposit if exists
                if ((appt.deposit || 0) > 0) {
                    const { error: txError } = await supabase
                        .from('transactions')
                        .insert([{
                            studio_id: appt.studio_id,
                            amount: appt.deposit,
                            type: 'INCOME',
                            category: 'ACCONTO',
                            description: `Acconto ${appt.service_name} - ${appt.client?.full_name}`,
                            date: new Date().toISOString(),
                            artist_id: appt.artist_id,
                            appointment_id: appt.id
                        }]);
                    if (txError) console.error("Failed to create deposit transaction", txError);
                }

                // Send CONFIRMED Email
                if (appt.client?.email) {
                    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-booking-email', {
                        body: {
                            to: appt.client.email,
                            sender_name: studioName,
                            reply_to: artistEmail,
                            subject: `Prenotazione Confermata - ${studioName}`,
                            text: `Ciao ${appt.client.full_name}, il tuo appuntamento per ${appt.service_name} è stato confermato!`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                                    <h1 style="color: #22c55e;">Prenotazione Confermata! ✅</h1>
                                    <p>Ciao <strong>${appt.client.full_name}</strong>,</p>
                                    <p>Il tuo appuntamento presso <strong>${studioName}</strong> per <strong>${appt.service_name}</strong> è stato confermato ufficialmente.</p>
                                    
                                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                        <h3 style="margin-top: 0;">Dettagli Appuntamento</h3>
                                        <p><strong>Servizio:</strong> ${appt.service_name}</p>
                                        <p><strong>Artista:</strong> ${artist?.full_name || 'InkFlow Artist'}</p>
                                        <p><strong>Data:</strong> ${format(parseISO(appt.start_time), 'dd/MM/yyyy')}</p>
                                        <p><strong>Ora:</strong> ${format(parseISO(appt.start_time), 'HH:mm')}</p>
                                        <p><strong>Indirizzo:</strong> ${studio?.address || ''}, ${studio?.city || ''}</p>
                                    </div>

                                    <p style="text-align: center; margin-top: 30px;">
                                        <a href="https://deskink.it/booking-status?token=${appt.id}" style="display: inline-block; padding: 15px 30px; background-color: #22c55e; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Vedi Dettagli Prenotazione</a>
                                    </p>
                                </div>
                            `
                        }
                    });
                    console.log('Email Result:', { emailData, emailError });
                } else {
                    console.warn('Cannot send email: Client email missing', appt?.client);
                }
            }
            onUpdate();
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Errore durante l\'aggiornamento della richiesta.');
        } finally {
            setProcessing(null);
        }
    };

    if (pendingAppointments.length === 0) {
        return (
            <div className="bg-bg-secondary border border-border rounded-lg p-6 text-center text-text-muted">
                <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={24} className="text-green-500" />
                </div>
                <p>Nessuna nuova richiesta in attesa.</p>
            </div>
        );
    }

    return (
        <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-accent/5 flex justify-between items-center">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Clock size={16} className="text-accent" />
                    Richieste in Attesa
                    <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">{pendingAppointments.length}</span>
                </h3>
            </div>

            <div className="divide-y divide-border">
                {pendingAppointments.map((appt) => (
                    <div key={appt.id} className="p-4 hover:bg-bg-tertiary/20 transition-colors">
                        <div className="flex flex-col gap-3">

                            {/* Header Row: Client & Time */}
                            <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm border border-border">
                                        {appt.client?.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary">{appt.client?.full_name || 'Cliente Sconosciuto'}</p>
                                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {format(parseISO(appt.start_time), 'd MMM yyyy', { locale: it })}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {format(parseISO(appt.start_time), 'HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-text-muted">
                                    {expandedId === appt.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Service Badge */}
                            <div className="flex gap-2">
                                <span className="text-xs font-medium px-2 py-1 bg-bg-tertiary border border-border rounded text-text-secondary">
                                    {appt.service_name}
                                </span>
                                {(appt.deposit || 0) > 0 && (
                                    <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded">
                                        Acconto: €{appt.deposit}
                                    </span>
                                )}
                            </div>

                            {/* Expanded Details */}
                            {expandedId === appt.id && (
                                <div className="mt-2 p-3 bg-bg-primary rounded border border-border text-sm space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">

                                    {/* Contact Info */}
                                    <div className="grid grid-cols-2 gap-2 text-text-secondary">
                                        <div>
                                            <span className="block text-xs text-text-muted mb-0.5">Email</span>
                                            {appt.client?.email || '-'}
                                        </div>
                                        <div>
                                            <span className="block text-xs text-text-muted mb-0.5">Telefono</span>
                                            {appt.client?.phone || '-'}
                                        </div>
                                    </div>

                                    {/* Description/Notes */}
                                    {appt.notes && (
                                        <div>
                                            <span className="block text-xs text-text-muted mb-0.5">Note Cliente</span>
                                            <p className="text-text-primary italic">"{appt.notes}"</p>
                                        </div>
                                    )}

                                    {/* Images */}
                                    {appt.images && appt.images.length > 0 && (
                                        <div>
                                            <span className="block text-xs text-text-muted mb-1 flex items-center gap-1"><ImageIcon size={12} /> Riferimenti</span>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {appt.images.map((img, idx) => (
                                                    <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 rounded border border-border overflow-hidden shrink-0 hover:opacity-80 transition-opacity">
                                                        <img src={img} alt="Reference" className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => handleAction(appt.id, 'REJECT')}
                                    disabled={processing === appt.id}
                                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={16} /> Rifiuta
                                </button>
                                <button
                                    onClick={() => handleAction(appt.id, 'CONFIRM')}
                                    disabled={processing === appt.id}
                                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Check size={16} /> Accetta
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
