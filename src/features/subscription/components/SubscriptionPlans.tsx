import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

type PlanTier = 'basic' | 'pro' | 'plus';

interface Plan {
    id: PlanTier;
    name: string;
    price: number;
    features: string[];
    description: string;
    popular?: boolean;
}

const PLANS: Plan[] = [
    {
        id: 'basic',
        name: 'DeskInk Basic',
        price: 20,
        description: 'Ideale per studi individuali',
        features: [
            '1 Studio',
            '1 Manager',
            '1 Artist',
            'Gestione agenda digitale',
            'Lista d\'attesa online',
            'Database clienti'
        ]
    },
    {
        id: 'pro',
        name: 'DeskInk Pro',
        price: 40,
        description: 'Per studi in crescita',
        popular: true,
        features: [
            '1 Studio',
            '2 Managers',
            '2 Artists',
            'Tutte le funzioni Basic',
            'Gestione avanzata staff',
            'Maggiore controllo operativo'
        ]
    },
    {
        id: 'plus',
        name: 'DeskInk Plus',
        price: 70,
        description: 'Massima potenza scalabile',
        features: [
            '1 Studio',
            '4 Managers',
            '4 Artists',
            'Membri extra (+10€/mese)',
            'Tutte le funzioni Pro',
            'Nessun limite alla crescita'
        ]
    }
];

interface SubscriptionPlansProps {
    currentTier?: string;
    onCancel?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentTier, onCancel }) => {
    const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
    const [extraMembers, setExtraMembers] = useState(0);

    const handleSubscribe = async (tier: PlanTier) => {
        try {
            setLoadingTier(tier);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Non sei autenticato');
            }

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    tier,
                    interval: 'month',
                    extra_seats: tier === 'plus' ? extraMembers : 0
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Errore durante la creazione del checkout');
            }

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            alert('Errore durante l\'inizializzazione del pagamento. Riprova.');
        } finally {
            setLoadingTier(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-text-primary mb-2">Scegli il tuo piano</h3>
                <p className="text-text-muted">Potenzia il tuo studio con gli strumenti giusti</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-200 ${plan.popular
                            ? 'bg-bg-secondary border-accent shadow-lg shadow-accent/10 transform md:-translate-y-2'
                            : 'bg-bg-tertiary border-border hover:border-accent/50'
                            } ${currentTier === plan.id ? 'ring-2 ring-accent' : ''}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                                Più Popolare
                            </div>
                        )}

                        <div className="mb-6">
                            <h4 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h4>
                            <p className="text-sm text-text-muted h-10">{plan.description}</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-text-primary">€{plan.price}</span>
                                <span className="text-text-muted">/mese</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 mb-8">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className={`mt-1 p-0.5 rounded-full ${plan.popular ? 'bg-accent text-white' : 'bg-bg-primary text-text-muted'}`}>
                                        <Check size={12} />
                                    </div>
                                    <span className="text-sm text-text-muted">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Extra Members Selector for Plus Plan */}
                        {plan.id === 'plus' && (
                            <div className="mb-6 p-4 rounded-xl bg-bg-secondary border border-border">
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Membri Extra (+10€/mese cad.)
                                </label>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setExtraMembers(Math.max(0, extraMembers - 1))}
                                        className="w-8 h-8 rounded-lg bg-bg-primary border border-border hover:bg-bg-tertiary flex items-center justify-center font-bold text-text-primary"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-bold text-text-primary">{extraMembers}</span>
                                    <button
                                        onClick={() => setExtraMembers(extraMembers + 1)}
                                        className="w-8 h-8 rounded-lg bg-bg-primary border border-border hover:bg-bg-tertiary flex items-center justify-center font-bold text-text-primary"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={loadingTier !== null || currentTier === plan.id}
                            className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${currentTier === plan.id
                                ? 'bg-green-500/10 text-green-500 cursor-default border border-green-500/20'
                                : plan.popular
                                    ? 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20'
                                    : 'bg-bg-primary hover:bg-bg-secondary text-text-primary border border-border'
                                }`}
                        >
                            {loadingTier === plan.id ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : currentTier === plan.id ? (
                                <>
                                    <Check size={18} />
                                    Piano Attuale
                                </>
                            ) : (
                                'Scegli Piano'
                            )}
                        </button>
                    </div>
                ))}
            </div>

            {onCancel && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={onCancel}
                        className="text-text-muted hover:text-text-primary text-sm underline transition-colors"
                    >
                        Chiudi visualizzazione piani
                    </button>
                </div>
            )}
        </div>
    );
};
