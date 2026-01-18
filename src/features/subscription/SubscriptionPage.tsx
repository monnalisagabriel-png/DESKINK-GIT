import React from 'react';
import { supabase } from '../../lib/supabase';

import { Check } from 'lucide-react';

const PLANS = [
    {
        id: 'basic',
        name: 'DeskInk Basic',
        price: '20€',
        features: ['1 Studio', '1 Manager', '1 Artist'],
        color: 'bg-blue-500'
    },
    {
        id: 'pro',
        name: 'DeskInk Pro',
        price: '40€',
        features: ['1 Studio', '2 Managers', '2 Artists'],
        color: 'bg-purple-500',
        popular: true
    },
    {
        id: 'plus',
        name: 'DeskInk Plus',
        price: '70€',
        features: ['1 Studio', '4 Managers', '4 Artists', 'Add extra users (+10€/mo)'],
        color: 'bg-orange-500'
    }
];

export const SubscriptionPage = () => {
    const [loading, setLoading] = React.useState(false);
    const [extraMembers, setExtraMembers] = React.useState(0);

    const handleSubscribe = async (tier: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    tier,
                    extra_seats: tier === 'plus' ? extraMembers : 0
                }
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Errore durante l\'inizializzazione del pagamento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-4">Scegli il tuo piano</h1>
                <p className="text-gray-400">Potenzia il tuo studio con DeskInk</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {PLANS.map((plan) => (
                    <div key={plan.id} className={`relative rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-bold px-4 py-1 rounded-full text-sm">
                                Più richiesto
                            </div>
                        )}
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-sm font-normal text-gray-400">/mese</span></div>

                        <ul className="space-y-4 mb-8 flex-grow">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Extra Members Selector for Plus Plan */}
                        {plan.id === 'plus' && (
                            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Membri Extra (+10€/mese cad.)
                                </label>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setExtraMembers(Math.max(0, extraMembers - 1))}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-bold">{extraMembers}</span>
                                    <button
                                        onClick={() => setExtraMembers(extraMembers + 1)}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={loading}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${plan.color} hover:opacity-90 disabled:opacity-50 text-white shadow-lg`}
                        >
                            {loading ? 'Caricamento...' : 'Seleziona Piano'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
