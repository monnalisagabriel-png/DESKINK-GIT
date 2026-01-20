import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase'; // Adjust path if needed, assuming src/lib/supabase
import { User as UserIcon, Calendar, ClipboardList, ArrowRight, Store, AlertTriangle } from 'lucide-react';

interface StudioDetails {
    name: string;
    logo_url: string | null;
    city: string | null;
    public_booking_settings?: {
        enabled: boolean;
    };
}

export const PublicHubPage: React.FC = () => {
    const { studioId } = useParams<{ studioId: string }>();
    const [studio, setStudio] = useState<StudioDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBookingAvailable, setIsBookingAvailable] = useState(false);

    useEffect(() => {
        if (studioId) loadStudioData();
    }, [studioId]);

    const loadStudioData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Studio Details
            const { data: studioData, error: studioError } = await supabase
                .from('studios')
                .select('name, logo_url, city, public_booking_settings')
                .eq('id', studioId)
                .single();

            if (studioError) throw studioError;
            setStudio(studioData);

            // 2. Check Booking Availability
            // Condition 1: Studio globally enabled
            const studioEnabled = studioData.public_booking_settings?.enabled === true;

            // Condition 2: At least one artist enabled
            const { count, error: artistError } = await supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('studio_id', studioId)
                .or('role.eq.artist,role.eq.owner')
                .eq('is_public_booking_enabled', true);

            if (artistError) console.warn("Error checking artist availability:", artistError);

            const hasActiveArtists = (count || 0) > 0;

            setIsBookingAvailable(studioEnabled || hasActiveArtists);

        } catch (err: any) {
            console.error("Error loading hub data:", err);
            setError("Impossibile caricare le informazioni dello studio.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
    );

    if (error || !studio) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
            <AlertTriangle size={48} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Studio non trovato</h1>
            <p className="text-gray-400">{error || "Il link potrebbe essere errato o scaduto."}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/10">
                <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-center relative">
                    {/* Logo/Name */}
                    <div className="flex items-center gap-3">
                        {studio.logo_url ? (
                            <img src={studio.logo_url} alt={studio.name} className="w-10 h-10 object-contain rounded-full bg-white/5" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
                                {studio.name[0]}
                            </div>
                        )}
                        <span className="font-bold text-lg tracking-tight">{studio.name}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto pt-28 px-6 pb-12 flex flex-col gap-6">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Come possiamo aiutarti?
                    </h1>
                    <p className="text-gray-400">
                        Scegli l'opzione corretta per te
                    </p>
                </div>

                {/* Card 1: Registrazione Cliente */}
                <Link
                    to={`/public/register/${studioId}`}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-3xl p-6 transition-all hover:translate-y-[-2px] hover:shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserIcon size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <ClipboardList size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Registrazione Cliente</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Questa registrazione va effettuata <strong className="text-white">SOLO</strong> se devi essere inserito nell’agenda dello studio per un appuntamento già concordato.
                            <br /><span className="italic opacity-80">Non è una prenotazione.</span>
                        </p>
                        <div className="flex items-center text-blue-400 text-sm font-bold group-hover:text-white transition-colors">
                            Compila modulo <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Card 2: Lista d'Attesa */}
                <Link
                    to={`/public/waitlist/${studioId}`}
                    className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-3xl p-6 transition-all hover:translate-y-[-2px] hover:shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Store size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <ClipboardList size={24} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Lista d'Attesa / Info</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Serve per richiedere una <strong className="text-white">consulenza</strong> o essere ricontattati dallo studio o dal tatuatore prima di prenotare un appuntamento.
                        </p>
                        <div className="flex items-center text-purple-400 text-sm font-bold group-hover:text-white transition-colors">
                            Invia richiesta <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Card 3: Prenotazione Online (CONDITIONAL) */}
                {isBookingAvailable ? (
                    <Link
                        to={`/book/${studioId}`}
                        className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-3xl p-6 transition-all hover:translate-y-[-2px] hover:shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                <Calendar size={24} />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Prenotazione Online</h2>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                Prenota direttamente il tuo appuntamento scegliendo artista, servizio e data, pagando l'acconto richiesto.
                            </p>
                            <div className="flex items-center text-green-400 text-sm font-bold group-hover:text-white transition-colors">
                                Prenota ora <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="p-6 rounded-3xl border border-zinc-800/50 bg-black/50 text-center opacity-50 grayscale select-none">
                        <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar size={24} className="text-gray-500" />
                        </div>
                        <h2 className="text-lg font-bold mb-1 text-gray-500">Prenotazioni Online</h2>
                        <p className="text-xs text-gray-600">Al momento non disponibili</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-600">
                    <p>&copy; {new Date().getFullYear()} {studio.name}</p>
                    {studio.city && <p>{studio.city}</p>}
                </div>

            </main>
        </div>
    );
};
