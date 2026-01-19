import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';
import { Loader2, Check } from 'lucide-react';

const PLANS = [
    {
        id: 'starter', // Changed from 'basic' to match DB and LoginPage
        name: 'DeskInk Basic',
        price: 20,
        description: 'Ideale per studi individuali',
        features: ['1 Studio', '1 Manager', '1 Artist']
    },
    {
        id: 'pro',
        name: 'DeskInk Pro',
        price: 40,
        description: 'Per studi in crescita',
        popular: true,
        features: ['1 Studio', '2 Managers', '2 Artists']
    },
    {
        id: 'plus',
        name: 'DeskInk Plus',
        price: 70,
        description: 'Massima potenza scalabile',
        features: ['1 Studio', '4 Managers', '4 Artists', 'Membri Extra (+10€)']
    }
];

export const StartPaymentPage: React.FC = () => {
    const { user, signOut } = useAuth();
    const [studioName, setStudioName] = useState('');

    // Auto-select plan from URL OR LocalStorage (from Login/Signup flow)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        let plan = queryParams.get('plan');

        if (!plan) {
            plan = localStorage.getItem('pendingPlanPreference');
        }

        // Map 'basic' to 'starter' just in case
        if (plan === 'basic') plan = 'starter';

        if (plan && ['starter', 'pro', 'plus'].includes(plan)) {
            setSelectedPlan(plan);
        }
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!navigator.onLine) {
            setError('Nessuna connessione internet. Controlla la tua rete e riprova.');
            return;
        }

        if (!studioName.trim()) {
            setError('Inserisci il nome del tuo studio');
            return;
        }
        if (!selectedPlan) {
            setError('Seleziona un piano');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`[Payment] Initiating checkout for plan: ${selectedPlan}, studio: ${studioName}`);
            // Save studio name for potential recovery in PaymentStatusPage
            if (studioName) {
                localStorage.setItem('pendingStudioName', studioName);
            }

            const checkoutUrl = await api.subscription.createCheckoutSession(
                selectedPlan,
                `${window.location.origin}/dashboard?payment=success`,
                `${window.location.origin}/pricing`, // Cancel URL to Pricing as requested
                0, // Extra seats default 0
                studioName // Studio Name for creation
            );

            if (checkoutUrl) {
                console.log('[Payment] Redirecting to:', checkoutUrl);
                window.location.href = checkoutUrl;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err: any) {
            console.error('Payment Init Error:', err);

            const msg = err.message || JSON.stringify(err);
            console.log("Detailed Error for Debug:", JSON.stringify(err, null, 2));

            setError(msg);

            // SUPER VERBOSE ALERT FOR DEBUGGING
            alert(`ERRORE REGISTRAZIONE:\n\nMessaggio: ${msg}\n\nSe l'errore persiste, invia uno screenshot di questo messaggio.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">Benvenuto in DeskInk, {user?.full_name}</h1>
                    <p className="text-text-muted">Per attivare il tuo account e creare lo studio, completa la sottoscrizione.</p>
                </div>

                <div className="bg-bg-secondary p-8 rounded-2xl border border-border">
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Nome del tuo Studio
                        </label>
                        <input
                            type="text"
                            value={studioName}
                            onChange={(e) => setStudioName(e.target.value)}
                            placeholder="Es. Inkflow Tattoo Studio"
                            className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`cursor-pointer relative p-6 rounded-xl border-2 transition-all ${selectedPlan === plan.id
                                    ? 'border-accent bg-accent/5'
                                    : 'border-border bg-bg-tertiary hover:border-accent/50'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                        POPOLARE
                                    </div>
                                )}
                                <h3 className="font-bold text-lg text-text-primary mb-1">{plan.name}</h3>
                                <div className="text-2xl font-bold text-text-primary mb-4">
                                    €{plan.price}<span className="text-sm font-normal text-text-muted">/mese</span>
                                </div>
                                <ul className="space-y-2">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="text-xs text-text-muted flex items-center gap-2">
                                            <Check size={12} className="text-green-500" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold text-lg shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Attiva Account e Crea Studio'}
                    </button>

                    <div className="mt-4 text-center">
                        <button onClick={signOut} className="text-sm text-text-muted hover:text-text-primary underline">
                            Esci e usa un altro account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

