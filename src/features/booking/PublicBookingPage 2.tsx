import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { startOfDay } from 'date-fns';
import type { User, Service } from '../../services/types';
import { supabase } from '../../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ChevronRight, ChevronLeft, User as UserIcon, CheckCircle, CreditCard, Image as ImageIcon, AlertTriangle, Calendar, Clock, Search, Eraser, PenTool, Lock } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

// Steps: Artist -> Service -> Date -> Details -> Consent -> Payment -> Success
type Step = 'ARTIST' | 'SERVICE' | 'DATE' | 'DETAILS' | 'CONSENT' | 'PAYMENT' | 'SUCCESS';


// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess }: { amount: number, onSuccess: (id: string) => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message || "Qualcosa è andato storto.");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            setMessage("Stato del pagamento: " + paymentIntent?.status);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {message && <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm">{message}</div>}
            <button
                disabled={isProcessing || !stripe || !elements}
                className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Elaborazione...
                    </>
                ) : (
                    <>
                        Paga €{amount} e Prenota <CreditCard size={20} />
                    </>
                )}
            </button>
        </form>
    );
};

export const PublicBookingPage: React.FC = () => {
    const { studioId } = useParams<{ studioId: string }>();
    const [step, setStep] = useState<Step>('ARTIST');
    const [loading, setLoading] = useState(true);
    const [studioName, setStudioName] = useState<string>('');
    const [studioLogo, setStudioLogo] = useState<string | null>(null);
    const [studioAddress, setStudioAddress] = useState<string>(''); // New State
    const [consentText, setConsentText] = useState<string>(''); // Studio Consent Text
    const [consentTemplateId, setConsentTemplateId] = useState<string | null>(null);
    const [consentTemplateVersion, setConsentTemplateVersion] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [paymentOption, setPaymentOption] = useState<'DEPOSIT' | 'FULL'>('DEPOSIT');



    const [artists, setArtists] = useState<User[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedArtist, setSelectedArtist] = useState<User | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [dayAppointments, setDayAppointments] = useState<any[]>([]); // Store appointments for the selected day

    useEffect(() => {
        if (selectedArtist && selectedDate && step === 'DATE') {
            fetchDayAppointments();
        }
    }, [selectedArtist, selectedDate, step]);

    const fetchDayAppointments = async () => {
        if (!selectedArtist || !selectedDate) return;
        try {
            const startStr = startOfDay(selectedDate).toISOString();
            const endStr = new Date(startOfDay(selectedDate).getTime() + 24 * 60 * 60 * 1000).toISOString(); // End of day

            const { data, error } = await supabase
                .from('appointments')
                .select('start_time, end_time, duration, status')
                .eq('artist_id', selectedArtist.id)
                .gte('start_time', startStr)
                .lt('start_time', endStr)
                .not('status', 'eq', 'CANCELLED'); // Exclude cancelled

            if (error) throw error;
            setDayAppointments(data || []);
        } catch (err) {
            console.error("Error fetching day appointments:", err);
        }
    };

    const [clientData, setClientData] = useState({
        full_name: '',
        email: '',
        phone: '',
        description: ''
    });
    const [referenceImages, setReferenceImages] = useState<File[]>([]);
    const [consentSigned, setConsentSigned] = useState(false);
    const sigCanvas = React.useRef<SignatureCanvas>(null);
    const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        if (studioId) loadInitialData();
    }, [studioId]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch Artists
            const { data: artistData, error: artistError } = await supabase
                .from('users')
                .select('id, full_name, email, role, avatar_url, bio, styles, portfolio_photos, excluded_styles, calendar_color, availability, stripe_account_id')
                .eq('studio_id', studioId)
                .or('role.eq.artist,role.eq.owner')
                .eq('is_public_booking_enabled', true);

            if (artistError) throw artistError;
            setArtists(artistData || []);

            // Fetch Services
            const { data: serviceData, error: serviceError } = await supabase
                .from('services')
                .select('*')
                .eq('studio_id', studioId)
                .eq('is_active', true);

            if (serviceError) throw serviceError;
            if (serviceError) throw serviceError;
            setServices(serviceData || []);

            // Fetch Studio Details
            const { data: studioData, error: studioError } = await supabase
                .from('studios')
                .select('name, logo_url, address, city, consent_text') // Expanded Query
                .eq('id', studioId)
                .single();

            if (studioError) console.error("Error loading studio:", studioError);
            if (studioData) {
                setStudioName(studioData.name);
                setStudioLogo(studioData.logo_url);
                setStudioAddress(`${studioData.address || ''}, ${studioData.city || ''}`);

                // Fetch Active Consent Template
                const { data: templateData } = await supabase
                    .from('consent_templates')
                    .select('id, content, version')
                    .eq('studio_id', studioId)
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (templateData?.content) {
                    setConsentText(templateData.content);
                    setConsentTemplateId(templateData.id);
                    setConsentTemplateVersion(templateData.version);
                } else {
                    setConsentText(studioData.consent_text || "Il sottoscritto dichiara di essere maggiorenne e consapevole dei rischi.");
                }
            }

        } catch (err: any) {
            console.error("Error loading booking data:", err);
            setError(err.message || "Errore durante il caricamento.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setReferenceImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeImage = (index: number) => {
        setReferenceImages(prev => prev.filter((_, i) => i !== index));
    };

    const clearSignature = () => {
        sigCanvas.current?.clear();
        setConsentSigned(false);
    };

    const nextStep = async () => {
        console.log(studioAddress, setClientSecret); // Prevent unused variable errors

        // Validation logic
        if (step === 'ARTIST' && !selectedArtist) return;
        if (step === 'SERVICE' && !selectedService) return;
        if (step === 'DATE' && (!selectedDate || !selectedTime)) return;
        if (step === 'DETAILS' && (!clientData.full_name || !clientData.email || !clientData.description)) {
            alert("Compila tutti i campi obbligatori (Nome, Email, Descrizione).");
            return;
        }

        if (step === 'CONSENT') {
            if (!consentSigned) {
                alert("Devi firmare il consenso per procedere.");
                return;
            }

            try {
                setLoading(true);
                const amount = paymentOption === 'FULL' ? selectedService!.price : selectedService!.deposit_amount;

                const { data, error } = await supabase.functions.invoke('payment-intent', {
                    body: {
                        amount: amount,
                        currency: 'eur',
                        service_name: selectedService!.name,
                        customer_email: clientData.email,
                        stripe_account_id: selectedArtist?.stripe_account_id // Pass Connect Account ID
                    }
                });

                if (error || !data?.clientSecret) throw new Error('Errore inizializzazione pagamento');

                setClientSecret(data.clientSecret);
                setStep('PAYMENT');
            } catch (err: any) {
                console.error("Payment Intent Error:", err);
                alert("Errore caricamento pagamenti. Riprova.");
            } finally {
                setLoading(false);
            }
            return;
        }

        switch (step) {
            case 'ARTIST': setStep('SERVICE'); break;
            case 'SERVICE': setStep('DATE'); break;
            case 'DATE': setStep('DETAILS'); break;
            case 'DETAILS': setStep('CONSENT'); break;
            case 'SUCCESS': break;
        }
    };


    const finalizeBooking = async (paymentIntentId?: string) => {
        try {
            setLoading(true);

            // 1. Create or Get Client (Upsert)
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .upsert([{
                    studio_id: studioId,
                    full_name: clientData.full_name,
                    email: clientData.email,
                    phone: clientData.phone,
                    notes: 'Public Booking Client'
                }], {
                    onConflict: 'studio_id, email'
                })
                .select()
                .single();

            if (clientError) throw new Error("Errore creazione cliente: " + clientError.message);

            // 2. Upload Reference Images (if any)
            const imageUrls: string[] = [];
            if (referenceImages.length > 0) {
                for (const img of referenceImages) {
                    const fileExt = img.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
                    const filePath = `booking-uploads/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('attachments')
                        .upload(filePath, img);

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('attachments')
                            .getPublicUrl(filePath);
                        imageUrls.push(publicUrl);
                    }
                }
            }

            // 3. Parse Date/Time
            const [hours, minutes] = selectedTime!.split(':').map(Number);
            const startTime = new Date(selectedDate!);
            startTime.setHours(hours, minutes, 0, 0);

            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + (selectedService!.duration || 60));

            // 4. Create Appointment
            const amountToPay = paymentOption === 'FULL' ? selectedService!.price : selectedService!.deposit_amount;

            // Prepare notes with Payment ID
            let notes = clientData.description;
            if (paymentIntentId) {
                notes += `\n\n[Pagamento Stripe ID: ${paymentIntentId}]`;
            }

            const { data, error: apptError } = await supabase
                .from('appointments')
                .insert([{
                    studio_id: studioId,
                    artist_id: selectedArtist!.id,
                    client_id: client.id,
                    service_name: selectedService!.name,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: 'PENDING',
                    price: selectedService!.price,
                    deposit: amountToPay,
                    notes: notes,
                    images: imageUrls
                }])
                .select()
                .single();

            if (apptError) throw new Error("Errore creazione appuntamento: " + apptError.message);

            if (data) {
                setCreatedAppointmentId(data.id);

                // 5. Save Consent
                if (consentSigned && sigCanvas.current) {
                    try {
                        const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                        const sigFileName = `signatures/${data.id}_${Date.now()}.png`;
                        const { error: sigUploadError } = await supabase.storage
                            .from('attachments')
                            .upload(sigFileName, await (await fetch(signatureDataUrl)).blob());

                        let signaturePublicUrl = null;
                        if (!sigUploadError) {
                            const { data: { publicUrl } } = supabase.storage
                                .from('attachments')
                                .getPublicUrl(sigFileName);
                            signaturePublicUrl = publicUrl;
                        }

                        if (consentTemplateId) {
                            await supabase.from('client_consents').insert([{
                                client_id: client.id,
                                template_id: consentTemplateId,
                                template_version: consentTemplateVersion,
                                status: 'SIGNED',
                                signature_url: signaturePublicUrl,
                                signed_at: new Date().toISOString(),
                                role: 'client'
                            }]);
                        } else {
                            await supabase.from('consents').insert([{
                                studio_id: studioId,
                                client_id: client.id,
                                appointment_id: data.id,
                                status: 'SIGNED',
                                signature_url: signaturePublicUrl,
                                signed_at: new Date().toISOString(),
                                signed_by_role: 'client'
                            }]);
                        }
                    } catch (consentErr) {
                        console.error("Error saving consent:", consentErr);
                    }
                }

                // Send Confirmation Email
                try {
                    await supabase.functions.invoke('send-booking-email', {
                        body: {
                            to: clientData.email,
                            sender_name: studioName,
                            reply_to: selectedArtist?.email,
                            subject: `Conferma Richiesta Prenotazione - ${studioName}`,
                            text: `Ciao ${clientData.full_name}, la richiesta è stata ricevuta.`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                                    <h1 style="color: #000;">Richiesta Ricevuta! 🎉</h1>
                                    <p>Ciao <strong>${clientData.full_name}</strong>,</p>
                                    <p>La tua richiesta di prenotazione presso <strong>${studioName}</strong> è stata inviata con successo.</p>
                                    ${paymentIntentId ? `<p style="color: green; font-weight: bold;">Acconto Pagato con Successo.</p>` : ''}
                                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                        <h3 style="margin-top: 0;">Riepilogo Prenotazione</h3>
                                        <p><strong>Servizio:</strong> ${selectedService?.name}</p>
                                        <p><strong>Artista:</strong> ${selectedArtist?.full_name}</p>
                                        <p><strong>Data:</strong> ${selectedDate?.toLocaleDateString()} alle ${selectedTime}</p>
                                        <p><strong>Importo Versato (Acconto):</strong> €${amountToPay}</p>
                                    </div>
                                    <p style="text-align: center; margin-top: 30px;">
                                        <a href="https://deskink.it/booking-status?token=${data.id}" 
                                            style="display: inline-block; padding: 15px 30px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                            Vedi Dettagli Prenotazione
                                        </a>
                                    </p>
                                </div>
                            `
                        }
                    });
                } catch (mailErr: any) {
                    console.error("Failed to send email (non-blocking):", mailErr);
                }
            }

            setStep('SUCCESS');

        } catch (err: any) {
            console.error("Booking Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const prevStep = () => {
        if (step === 'SERVICE') setStep('ARTIST');
        if (step === 'DATE') setStep('SERVICE');
        if (step === 'DETAILS') setStep('DATE');
        if (step === 'CONSENT') setStep('DETAILS');
        if (step === 'PAYMENT') setStep('CONSENT');
    };

    // --- Render Components ---

    const ProgressBar = () => {
        const steps: Step[] = ['ARTIST', 'SERVICE', 'DATE', 'DETAILS', 'CONSENT', 'PAYMENT'];
        const currentIdx = steps.indexOf(step);
        const percentage = Math.min(100, ((currentIdx + 1) / steps.length) * 100);

        return (
            <div className="w-full bg-gray-800 h-1 mb-8 rounded-full overflow-hidden">
                <div
                    className="bg-white h-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-lg font-medium text-gray-900 animate-pulse">Caricamento...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center text-black">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Ops! Qualcosa non va.</h2>
            <p className="text-gray-600 mb-6 max-w-md">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg">
                Riprova
            </button>
        </div>
    );

    if (step === 'SUCCESS') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 text-green-600 shadow-xl scale-110">
                    <CheckCircle size={48} />
                </div>
                <h1 className="text-4xl font-extrabold mb-4 text-black tracking-tight">Richiesta Inviata!</h1>
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed mb-6">
                    Grazie <span className="font-semibold text-black">{clientData.full_name}</span>. <br />
                    La tua richiesta per <span className="font-semibold text-black">{selectedService?.name}</span> è in attesa di approvazione da parte del tatuatore.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md text-left flex gap-3">
                    <div className="text-yellow-600 mt-1">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-yellow-800 text-sm uppercase mb-1">In attesa di conferma</p>
                        <p className="text-sm text-yellow-700 leading-snug">
                            L'appuntamento non è ancora confermato. Riceverai una notifica appena il tatuatore validerà la richiesta.
                            <br /><br />
                            <strong>Nota:</strong> In caso di mancata accettazione, l'acconto versato ti verrà interamente restituito.
                        </p>
                    </div>
                </div>

                {createdAppointmentId && (
                    <div className="mt-8 animate-bounce-in">
                        <a
                            href={`/booking-status?token=${createdAppointmentId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            Controlla lo Stato della Prenotazione <ChevronRight size={20} />
                        </a>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            {/* Header / Navbar */}
            <header className="bg-black border-b border-white/10 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 h-32 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        {/* Studio Logo/Identifier */}
                        {studioLogo ? (
                            <div className="w-20 h-20 bg-transparent rounded-xl flex items-center justify-center overflow-hidden">
                                <img src={studioLogo} alt={studioName} className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-black font-bold text-3xl shadow-lg">
                                {studioName?.[0] || 'I'}
                            </div>
                        )}
                        <h1 className="font-bold text-3xl tracking-tighter text-accent uppercase">{studioName || 'InkFlow'}</h1>
                    </div>
                </div>
            </header>

            {/* Sticky Selected Artist Banner */}
            {selectedArtist && (step as string) !== 'ARTIST' && (step as string) !== 'SUCCESS' && (
                <div className="sticky top-32 z-10 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-xl transition-all animate-in slide-in-from-top-2">
                    <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 ring-2 ring-green-500">
                                {selectedArtist.avatar_url ? (
                                    <img src={selectedArtist.avatar_url} className="w-full h-full object-cover" alt={selectedArtist.full_name} />
                                ) : (
                                    <UserIcon className="w-full h-full p-2 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Booking with</p>
                                <p className="font-bold text-white leading-none">{selectedArtist.full_name}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setStep('ARTIST')}
                            className="text-xs font-bold text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white transition-all"
                        >
                            Change
                        </button>
                    </div>
                </div>
            )}

            <main className="max-w-3xl mx-auto p-6 md:p-12 pb-48 md:pb-64">
                <ProgressBar />

                {/* ANIMATED CONTENT CONTAINER */}
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">

                    {/* STEP 1: ARTIST */}
                    {step === 'ARTIST' && (
                        <div>
                            <h2 className="text-4xl font-extrabold mb-2 text-white tracking-tight">Scegli il Tatuatore</h2>
                            <p className="text-gray-400 mb-10 text-lg">Seleziona l'artista con cui desideri prenotare.</p>

                            {artists.length === 0 ? (
                                <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400">
                                    <Search size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-medium text-lg">Nessun artista disponibile online.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {artists.map(artist => (
                                        <button
                                            key={artist.id}
                                            onClick={() => setSelectedArtist(artist)}
                                            className={`group relative p-6 rounded-3xl border text-left transition-all duration-300 hover:shadow-xl flex flex-col gap-4 h-full
                                                ${selectedArtist?.id === artist.id
                                                    ? 'border-green-600 bg-green-600 text-white ring-4 ring-green-100 shadow-2xl scale-[1.02]'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 transition-transform duration-500 group-hover:scale-105 ${selectedArtist?.id === artist.id ? 'ring-2 ring-white/20' : 'bg-gray-100'}`}>
                                                    {artist.avatar_url ? (
                                                        <img src={artist.avatar_url} className="w-full h-full object-cover" alt={artist.full_name} />
                                                    ) : (
                                                        <UserIcon className={`w-full h-full p-5 ${selectedArtist?.id === artist.id ? 'text-green-200' : 'text-gray-300'}`} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className={`text-xl font-bold mb-1 ${selectedArtist?.id === artist.id ? 'text-white' : 'text-black'}`}>{artist.full_name}</h3>
                                                    <p className={`text-sm ${selectedArtist?.id === artist.id ? 'text-green-100' : 'text-gray-500'}`}>Resident Artist</p>
                                                </div>
                                            </div>

                                            {/* Details Section */}
                                            <div className="space-y-3 w-full">
                                                {/* Styles */}
                                                {artist.styles && artist.styles.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {artist.styles.map(style => (
                                                            <span key={style} className={`text-xs px-2 py-1 rounded-md ${selectedArtist?.id === artist.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                                {style}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Bio */}
                                                {artist.bio && (
                                                    <p className={`text-sm line-clamp-2 ${selectedArtist?.id === artist.id ? 'text-green-50' : 'text-gray-500'}`}>
                                                        {artist.bio}
                                                    </p>
                                                )}

                                                {/* Portfolio Photos - Tiny Grid */}
                                                {artist.portfolio_photos && artist.portfolio_photos.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                                        {artist.portfolio_photos.slice(0, 3).map((photo, i) => (
                                                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-white/10">
                                                                <img src={photo} alt="Portfolio" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Excluded Styles Warning */}
                                                {artist.excluded_styles && artist.excluded_styles.length > 0 && (
                                                    <div className={`mt-2 text-xs p-2 rounded-lg flex items-start gap-1.5 ${selectedArtist?.id === artist.id ? 'bg-black/20 text-white' : 'bg-red-50 text-red-600'}`}>
                                                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                                        <span>
                                                            <span className="font-bold">No:</span> {artist.excluded_styles.join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                    }
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: SERVICE */}
                    {step === 'SERVICE' && (
                        <div>
                            <h2 className="text-4xl font-extrabold mb-2 text-white tracking-tight">Scegli il Servizio</h2>
                            <p className="text-gray-400 mb-10 text-lg">Cosa vorresti realizzare oggi?</p>

                            <div className="space-y-4">
                                {services.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => setSelectedService(service)}
                                        className={`w-full p-6 rounded-2xl border text-left transition-all duration-200 hover:shadow-lg group
                                            ${selectedService?.id === service.id
                                                ? 'border-green-600 bg-green-600 text-white shadow-xl scale-[1.02]'
                                                : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className={`text-xl font-bold mb-1 ${selectedService?.id === service.id ? 'text-white' : 'text-black'}`}>{service.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className={selectedService?.id === service.id ? 'text-green-200' : 'text-gray-400'} />
                                                    <span className={`text-sm ${selectedService?.id === service.id ? 'text-green-100' : 'text-gray-600'}`}>
                                                        {service.duration ? service.duration / 60 : 0} ore
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold mb-1 ${selectedService?.id === service.id ? 'text-white' : 'text-black'}`}>€{service.price}</div>
                                                <div className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md inline-block
                                                    ${selectedService?.id === service.id ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                                                    Acconto €{service.deposit_amount}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: DATE */}
                    {step === 'DATE' && (
                        <div>
                            <h2 className="text-4xl font-extrabold mb-2 text-white tracking-tight">Data e Ora</h2>
                            <p className="text-gray-400 mb-10 text-lg">Scegli quando vuoi venire in studio.</p>

                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                                <div className="mb-8">
                                    <label className="block text-left text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Seleziona Giorno</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none z-10" size={20} />
                                        <input
                                            type="date"
                                            className="w-full p-4 pl-12 rounded-xl border-2 border-gray-200 bg-white text-lg font-bold text-gray-900 focus:border-black focus:ring-0 outline-none transition-colors appearance-none min-h-[60px]"
                                            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {selectedDate && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2">
                                        <label className="block text-left text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Orari Disponibili</label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                            {/* Real Slots Logic */}
                                            {selectedDate ? (
                                                (() => {
                                                    // 1. Check for Full Day Block
                                                    const hasFullDayBooking = dayAppointments.some(a => (a.duration || 0) >= 240);
                                                    if (hasFullDayBooking) {
                                                        return <p className="col-span-full text-center text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">Nessuna disponibilità per questa data (Giornata Completa).</p>;
                                                    }

                                                    // 2. Get Available Slots
                                                    // Dynamic Generation from Work Hours or Default Slots
                                                    const avail = selectedArtist?.availability as any;
                                                    const workStartStr = avail?.work_start || "10:00";
                                                    const workEndStr = avail?.work_end || "19:00";

                                                    // Parse work hours (needed for validation later)
                                                    const [workStartHour, workStartMin] = workStartStr.split(':').map(Number);
                                                    const [workEndHour, workEndMin] = workEndStr.split(':').map(Number);

                                                    const defaultSlots = avail?.default_slots as string[] | undefined;

                                                    let generatedSlots: string[] = [];

                                                    if (defaultSlots && defaultSlots.length > 0) {
                                                        // Use configured slots
                                                        generatedSlots = defaultSlots.sort();
                                                    } else {
                                                        // Fallback: Generate slots every 30 mins
                                                        let currentHour = workStartHour;
                                                        let currentMin = workStartMin;

                                                        while (currentHour < workEndHour || (currentHour === workEndHour && currentMin < workEndMin)) {
                                                            const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
                                                            generatedSlots.push(timeStr);

                                                            currentMin += 30;
                                                            if (currentMin >= 60) {
                                                                currentMin -= 60;
                                                                currentHour += 1;
                                                            }
                                                        }
                                                    }

                                                    // Filter by Day Off
                                                    const dayOfWeek = selectedDate.getDay(); // 0=Sun, 6=Sat
                                                    const daysOff = avail?.days_off || [0, 1]; // Default Sun, Mon off if not set
                                                    if (daysOff.includes(dayOfWeek)) {
                                                        return <p className="col-span-full text-center text-gray-400">Giorno di riposo.</p>;
                                                    }

                                                    // 3. Filter by Time Overlap with 1 Hour Buffer
                                                    const serviceDurationDetails = selectedService?.duration || 60; // Minutes

                                                    const validSlots = generatedSlots.filter(slotTimeStr => {
                                                        const [hours, minutes] = slotTimeStr.split(':').map(Number);
                                                        const slotStart = new Date(selectedDate);
                                                        slotStart.setHours(hours, minutes, 0, 0);

                                                        // Calculate Slot End based on service duration
                                                        const slotEnd = new Date(slotStart.getTime() + serviceDurationDetails * 60000);

                                                        // Check if Slot ends after Work End Time
                                                        const workEndDate = new Date(selectedDate);
                                                        workEndDate.setHours(workEndHour, workEndMin, 0, 0);
                                                        if (slotEnd > workEndDate) return false;

                                                        // Check collision with ANY existing appointment + BUFFER
                                                        const isBlocked = dayAppointments.some(appt => {
                                                            const apptStart = new Date(appt.start_time);
                                                            // Calculate Appointment End (Default 60 min if null)
                                                            let apptEnd = new Date(appt.end_time);
                                                            if (!appt.end_time) {
                                                                apptEnd = new Date(apptStart.getTime() + (appt.duration || 60) * 60000);
                                                            }

                                                            // 1 HOUR BUFFER logic:
                                                            // The artist is busy from [Start] to [End + 1 Hour]
                                                            // So effective end is End + 60 mins.
                                                            const effectiveApptEnd = new Date(apptEnd.getTime() + 60 * 60000);

                                                            // Overlap check: 
                                                            // Slot is blocked if it starts before effective end AND ends after start
                                                            return (slotStart < effectiveApptEnd && slotEnd > apptStart);
                                                        });

                                                        return !isBlocked;
                                                    });

                                                    if (validSlots.length === 0) {
                                                        return <p className="col-span-full text-center text-gray-400">Nessun orario disponibile.</p>;
                                                    }

                                                    return validSlots.map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setSelectedTime(time)}
                                                            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all
                                                                ${selectedTime === time
                                                                    ? 'bg-black border-black text-white shadow-lg scale-105'
                                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'}`}
                                                        >
                                                            {time}
                                                        </button>
                                                    ));
                                                })()
                                            ) : (
                                                <p className="col-span-full text-center text-gray-400">Seleziona prima una data</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: DETAILS */}
                    {step === 'DETAILS' && (
                        <div>
                            <h2 className="text-4xl font-extrabold mb-2 text-white tracking-tight">I Tuoi Dati</h2>
                            <p className="text-gray-400 mb-10 text-lg">Dicci chi sei e parlaci della tua idea.</p>

                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={clientData.full_name}
                                            onChange={e => setClientData({ ...clientData, full_name: e.target.value })}
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-400"
                                            placeholder="Mario Rossi"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={clientData.email}
                                            onChange={e => setClientData({ ...clientData, email: e.target.value })}
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-400"
                                            placeholder="mario@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Telefono</label>
                                    <input
                                        type="tel"
                                        value={clientData.phone}
                                        onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                        className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-black outline-none transition-all placeholder:text-gray-400"
                                        placeholder="+39 333 1234567"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">La tua Idea <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={clientData.description}
                                        onChange={e => setClientData({ ...clientData, description: e.target.value })}
                                        className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-black outline-none transition-all min-h-[120px] placeholder:text-gray-400 resize-none"
                                        placeholder="Descrivi cosa vorresti tatuarti, posizione e dimensione approssimativa..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Immagini di Riferimento (Opzionale)</label>
                                    <div className="relative group cursor-pointer">
                                        <input type="file" multiple onChange={handleFileUpload} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                                        <div className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all border-gray-300 bg-gray-50 group-hover:bg-white group-hover:border-black`}>
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-3 group-hover:scale-110 transition-transform">
                                                <ImageIcon size={24} />
                                            </div>
                                            <p className="font-bold text-gray-700 group-hover:text-black">Carica immagini</p>
                                            <p className="text-xs text-gray-500 mt-1">Puoi selezionarne più di una</p>
                                        </div>
                                    </div>

                                    {/* Image Preview List */}
                                    {referenceImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {referenceImages.map((img, idx) => (
                                                <div key={idx} className="relative group/img">
                                                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 border border-gray-200 pr-8 truncate max-w-[200px]">
                                                        {img.name}
                                                    </div>
                                                    <button
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500 hover:bg-red-50 rounded-full p-1"
                                                    >
                                                        <Eraser size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: CONSENT */}
                    {step === 'CONSENT' && (
                        <div>
                            <h2 className="text-4xl font-extrabold mb-2 text-white tracking-tight">Consenso</h2>
                            <p className="text-gray-400 mb-10 text-lg">Leggi attentamente e firma per accettare.</p>

                            <div className="bg-white p-1 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="h-64 overflow-y-auto p-6 bg-gray-50 text-gray-700 text-sm leading-relaxed border-b border-gray-100 mb-4">
                                    <h4 className="font-bold text-black mb-2 upppercase">Modulo di Consenso Informato</h4>
                                    <div
                                        className="prose prose-sm max-w-none text-gray-600"
                                        dangerouslySetInnerHTML={{ __html: consentText }}
                                    />
                                </div>

                                <div className="p-6">
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex justify-between items-center">
                                        <span>Firma Digitale</span>
                                        <button onClick={clearSignature} className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1">
                                            <Eraser size={12} /> Pulisci
                                        </button>
                                    </p>

                                    <div className={`h-48 bg-white border-2 rounded-xl relative transition-colors overflow-hidden border-gray-300 hover:border-black`}>

                                        {!consentSigned && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="text-gray-300 text-center">
                                                    <PenTool size={32} className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-xs">Traccia la tua firma qui</p>
                                                </div>
                                            </div>
                                        )}

                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            penColor="black"
                                            canvasProps={{
                                                className: 'sigCanvas w-full h-full cursor-crosshair relative z-10'
                                            }}
                                            onEnd={() => setConsentSigned(true)}
                                        />
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={consentSigned}
                                            // readOnly // Don't make it readOnly, let user check it manually if they want (or keep logic)
                                            onChange={() => { }} // Dummy handler 
                                            className="w-5 h-5 accent-black rounded"
                                        />
                                        <label className="text-sm text-gray-600">Confermo la firma apposta.</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: PAYMENT */}
                    {step === 'PAYMENT' && clientSecret && (
                        <div>
                            <h2 className="text-4xl font-extrabold mb-2 text-white tracking-tight">Pagamento</h2>
                            <p className="text-gray-400 mb-10 text-lg">Salda l'acconto per bloccare l'appuntamento.</p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="font-bold text-gray-900 uppercase tracking-wide mb-6">Riepilogo</h3>
                                        <div className="space-y-4 text-gray-700">
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span>Servizio</span>
                                                <span className="font-medium text-black">{selectedService?.name}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span>Data</span>
                                                <span className="font-medium text-black">{selectedDate?.toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span>Ora</span>
                                                <span className="font-medium text-black">{selectedTime}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span>Artista</span>
                                                <span className="font-medium text-black">{selectedArtist?.full_name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-6 border-t-2 border-gray-100">
                                        <div className="flex justify-between text-lg text-gray-500 mb-4">
                                            <span>Prezzo Totale</span>
                                            <span>€{selectedService?.price}</span>
                                        </div>

                                        {/* Payment Options */}
                                        <div className="space-y-3 mb-6">
                                            <button
                                                onClick={() => setPaymentOption('DEPOSIT')}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentOption === 'DEPOSIT' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === 'DEPOSIT' ? 'border-black' : 'border-gray-300'}`}>
                                                        {paymentOption === 'DEPOSIT' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-gray-900">Paga solo Acconto</p>
                                                        <p className="text-xs text-gray-500">Blocca l'appuntamento</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold">€{selectedService?.deposit_amount}</span>
                                            </button>

                                            <button
                                                onClick={() => setPaymentOption('FULL')}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentOption === 'FULL' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === 'FULL' ? 'border-black' : 'border-gray-300'}`}>
                                                        {paymentOption === 'FULL' && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-gray-900">Paga Intero Importo</p>
                                                        <p className="text-xs text-gray-500">Saldo completo immediato</p>
                                                    </div>
                                                </div>
                                                <span className="font-bold">€{selectedService?.price}</span>
                                            </button>
                                        </div>

                                        <div className="flex justify-between text-2xl font-extrabold text-black items-end pt-4 border-t border-gray-100">
                                            <span>Totale da pagare</span>
                                            <span>€{paymentOption === 'FULL' ? selectedService?.price : selectedService?.deposit_amount}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col justify-center relative overflow-hidden">
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm
                                            amount={paymentOption === 'FULL' ? selectedService?.price || 0 : selectedService?.deposit_amount || 0}
                                            onSuccess={(intentId) => finalizeBooking(intentId)}
                                        />
                                    </Elements>

                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <Lock size={12} />
                                        Pagamento sicuro SSL e protetto da Stripe
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 7: SUCCESS */}
                    {(step as string) === 'SUCCESS' && (
                        <div className="flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                                <CheckCircle size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Richiesta Inviata!</h2>
                            <p className="text-gray-600 mb-6">
                                Grazie {clientData.full_name}, abbiamo ricevuto la tua richiesta di prenotazione.
                            </p>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left max-w-md mx-auto mb-8">
                                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                    <Clock size={18} />
                                    Cosa succede ora?
                                </h4>
                                <ul className="space-y-3 text-sm text-blue-900">
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-blue-500">•</span>
                                        <span>L'artista valuterà la tua richiesta <strong>entro 24-48 ore</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-blue-500">•</span>
                                        <span>Riceverai una email di conferma appena la prenotazione sarà accettata.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-bold text-blue-500">•</span>
                                        <span><strong>Se la richiesta viene rifiutata</strong>, l'importo versato sarà rimborsato automaticamente sulla tua carta entro 5-10 giorni lavorativi.</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => window.location.reload()}
                                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
                            >
                                Torna alla Home
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-30">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    {step !== 'ARTIST' && (
                        <button
                            onClick={prevStep}
                            className="px-6 py-4 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft size={20} /> Indietro
                        </button>
                    )}
                    <div className="flex-1"></div>
                    {/* Header with Persistent Summary if Context is Selected */}
                    {/* Wrapper for Middle Content */}
                    <div className="flex flex-col items-center justify-center mx-4">

                        {/* Context Summary (Hidden on ARTIST step) */}
                        {(step as string) !== 'ARTIST' && (step as string) !== 'SUCCESS' && selectedArtist && (
                            <div className="hidden md:flex items-center gap-3 text-sm text-gray-500 animate-in fade-in slide-in-from-left-2 mb-2">
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                    <UserIcon size={12} />
                                    <span className="font-medium text-gray-700">{selectedArtist.full_name}</span>
                                </div>
                                {selectedService && (
                                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <span>{selectedService.name}</span>
                                    </div>
                                )}
                                {(selectedDate && selectedTime) && (
                                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                        <Calendar size={12} />
                                        <span>{selectedDate.toLocaleDateString()} {selectedTime}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile Context Summary (Simplified) */}
                        {(step as string) !== 'ARTIST' && (step as string) !== 'SUCCESS' && selectedArtist && (
                            <div className="md:hidden text-xs text-gray-500 mb-1">
                                <span className="font-bold">{selectedArtist.full_name}</span>
                                {selectedService && <span> • {selectedService.name}</span>}
                            </div>
                        )}

                        {/* Step Indicator */}
                        {(step as string) !== 'SUCCESS' && (
                            <div className="text-xs font-medium text-gray-400">
                                Step {['ARTIST', 'SERVICE', 'DATE', 'DETAILS', 'CONSENT', 'PAYMENT'].indexOf(step) + 1}/6
                            </div>
                        )}
                    </div>
                    {/* Footer Navigation (Hidden in PAYMENT step to let Stripe handle it) */}
                    {step !== 'PAYMENT' && (
                        <button
                            onClick={nextStep}
                            disabled={
                                (step === 'ARTIST' && !selectedArtist) ||
                                (step === 'SERVICE' && !selectedService) ||
                                (step === 'DATE' && (!selectedDate || !selectedTime)) ||
                                (step === 'DETAILS' && (!clientData.full_name || !clientData.description)) ||
                                (step === 'CONSENT' && !consentSigned)
                            }
                            className="px-8 py-4 bg-black text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all duration-300 flex items-center gap-2"
                        >
                            Continua <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};
