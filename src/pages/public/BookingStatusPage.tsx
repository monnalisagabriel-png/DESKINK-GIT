import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export const BookingStatusPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            checkStatus();
        } else {
            setLoading(false);
        }
    }, [token]);

    const checkStatus = async () => {
        try {
            // We use the ID as token for now, or we could add a specific token column
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id, 
                    start_time, 
                    status, 
                    service_name,
                    artist:artist_id (full_name, avatar_url),
                    studio:studio_id (name, logo_url)
                `)
                .eq('id', token)
                .single();

            if (error) throw error;
            setAppointment(data);
        } catch (err) {
            console.error(err);
            setError('Richiesta non trovata o token non valido.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="animate-pulse">Caricamento stato...</div>
        </div>
    );

    if (error || !token) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Impossibile trovare la richiesta</h1>
            <p className="text-gray-400">{error || 'Link mancante.'}</p>
        </div>
    );

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    icon: <Clock className="w-16 h-16 text-yellow-500 mb-4" />,
                    title: 'Richiesta in Attesa',
                    desc: 'Il tuo artista sta valutando la richiesta. Riceverai una notifica appena confermata.',
                    color: 'text-yellow-500'
                };
            case 'CONFIRMED':
            case 'COMPLETED': // Treat completed as confirmed for this view
                return {
                    icon: <CheckCircle className="w-16 h-16 text-green-500 mb-4" />,
                    title: 'Richiesta Confermata!',
                    desc: 'Il tuo appuntamento è confermato. Ci vediamo in studio!',
                    color: 'text-green-500'
                };
            case 'REJECTED':
            case 'CANCELLED':
                return {
                    icon: <XCircle className="w-16 h-16 text-red-500 mb-4" />,
                    title: 'Richiesta Rifiutata',
                    desc: 'Ci dispiace, ma l\'artista non può accettare la richiesta per la data selezionata.',
                    color: 'text-red-500'
                };
            default:
                return {
                    icon: <Clock className="w-16 h-16 text-gray-500 mb-4" />,
                    title: 'Stato Sconosciuto',
                    desc: '',
                    color: 'text-gray-500'
                };
        }
    };

    const statusInfo = getStatusDisplay(appointment.status);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl text-center border border-gray-700">
                <div className="flex justify-center">{statusInfo.icon}</div>

                <h1 className="text-3xl font-bold mb-2">{statusInfo.title}</h1>
                <p className="text-gray-400 mb-8">{statusInfo.desc}</p>

                <div className="bg-gray-700/50 rounded-xl p-6 text-left space-y-4">
                    <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Artista</label>
                        <div className="flex items-center gap-3 mt-1">
                            {appointment.artist?.avatar_url && (
                                <img src={appointment.artist.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                            )}
                            <span className="font-medium text-lg">{appointment.artist?.full_name || 'Artista'}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Servizio</label>
                        <p className="text-lg font-medium text-white">{appointment.service_name}</p>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Data e Ora</label>
                        <p className="text-lg font-medium text-white capitalize">
                            {format(new Date(appointment.start_time), "EEEE d MMMM yyyy, 'ore' HH:mm", { locale: it })}
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    ID Richiesta: <span className="font-mono text-gray-400">{appointment.id.slice(0, 8)}</span>
                </div>
            </div>
        </div>
    );
};
