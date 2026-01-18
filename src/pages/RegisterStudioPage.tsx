
import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Check, Shield, Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { api } from '../services/api';
// Use window.location for hard reload or navigate for soft? 
// Prompt said "redirect to /dashboard". Soft is nicer, but we need to re-check membership.
// Since AuthContext doesn't expose a re-check, I'll use window.location.href to force a clean slate reload.
// import { useNavigate } from 'react-router-dom';

export const RegisterStudioPage = () => {
    const { user, signOut } = useAuth();
    // navigate unused

    const [studioName, setStudioName] = useState('');
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'plus'>('starter');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingInvites, setPendingInvites] = useState<{ token: string; studio_name: string; role: string; created_at: string }[]>([]);
    const [extraMembers, setExtraMembers] = useState(0);

    React.useEffect(() => {
        if (user) {
            checkInvites();
            checkRecovery();

            // Check for pending plan preference from Login
            const pendingPlan = localStorage.getItem('pendingPlanPreference');
            if (pendingPlan && ['starter', 'pro', 'plus'].includes(pendingPlan)) {
                setSelectedPlan(pendingPlan as any);
                setStep(2); // Skip straight to naming studio
                // Clear it so it doesn't persist forever
                localStorage.removeItem('pendingPlanPreference');
            }
        }
    }, [user]);

    const checkRecovery = async () => {
        try {
            const recoveredStudio = await api.settings.recoverOrphanedOwner();
            if (recoveredStudio && recoveredStudio.id) {
                // Check payment status
                const safeStatus = recoveredStudio.status || 'none';
                if (['active', 'trialing'].includes(safeStatus)) {
                    alert(`Bentornato! Abbiamo ripristinato il tuo accesso allo studio: ${recoveredStudio.name}`);
                    window.location.href = '/dashboard';
                } else {
                    // Studio exists but NOT active -> Force Payment
                    console.log('Studio found but unpaid:', recoveredStudio);
                    setCreatedStudioId(recoveredStudio.id);
                    setStudioName(recoveredStudio.name);

                    // Pre-select tier if available, otherwise default
                    if (recoveredStudio.tier && ['starter', 'pro', 'plus'].includes(recoveredStudio.tier)) {
                        setSelectedPlan(recoveredStudio.tier as any);
                    }

                    if (step === 1) setStep(2); // Move to confirm step to show "Complete Payment"
                    setError("Attenzione: Lo studio esiste ma l'abbonamento non è attivo. Completa il pagamento.");
                }
            }
        } catch (err) {
            console.error('Recovery check failed:', err);
        }
    };

    const checkInvites = async () => {
        try {
            const invites = await api.settings.getMyPendingInvitations();
            if (invites && invites.length > 0) {
                setPendingInvites(invites);
            }
        } catch (err) {
            console.error('Failed to check invites:', err);
        }
    };

    // State to track if studio was created but payment failed
    const [createdStudioId, setCreatedStudioId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            let studioId = createdStudioId;

            // 1. Create Studio (if not already created)
            if (!studioId) {
                const studio = await api.settings.registerStudio(studioName, user.id);
                console.log('Studio created:', studio);

                if (studio && studio.id) {
                    studioId = studio.id;
                    setCreatedStudioId(studio.id); // Save for retry

                    // 2. Create Subscription (Initial Status)
                    const { error: subError } = await supabase
                        .from('saas_subscriptions')
                        .insert({
                            studio_id: studio.id,
                            plan_id: selectedPlan,
                            status: 'incomplete'
                        });

                    if (subError && subError.code !== '23505') {
                        console.error('Failed to init subscription:', subError);
                    }
                } else {
                    throw new Error("Errore: Lo studio non è stato creato correttamente.");
                }
            }

            if (studioId) {
                // 3. Call Stripe Checkout
                try {
                    const checkoutUrl = await api.subscription.createCheckoutSession(
                        selectedPlan,
                        `${window.location.origin}/payment-status`,
                        `${window.location.origin}/dashboard?payment_cancelled=true`,
                        selectedPlan === 'plus' ? extraMembers : 0
                    );

                    if (checkoutUrl) {
                        window.location.href = checkoutUrl;
                        return; // Stop execution here
                    } else {
                        throw new Error("Nessun URL di checkout restituito.");
                    }
                } catch (stripeErr: any) {
                    console.error('Stripe Checkout Failed:', stripeErr);
                    // Do NOT redirect to dashboard on error. Force retry.
                    setError(`Errore Pagamento: ${stripeErr.message}. Riprova.`);
                    // We keep 'createdStudioId' so next click checks out immediately.
                }
            }
        } catch (err: any) {
            console.error('Registration failed:', err);
            setError(err.message || 'Impossibile completare la registrazione.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4 text-center">
            <div className="max-w-md w-full bg-bg-secondary p-8 rounded-lg shadow-xl border border-border text-left">
                <h1 className="text-2xl font-bold text-text-primary mb-2">Benvenuto in DESKINK</h1>
                <p className="text-text-secondary mb-6">
                    Ciao, <span className="text-text-primary font-bold">{user?.full_name || user?.email}</span>! <br />
                    Al momento non sei collegato a nessuno studio.
                </p>

                {pendingInvites.length > 0 ? (
                    <div className="bg-accent/10 border border-accent p-4 rounded-lg mb-6 text-center animate-pulse">
                        <h3 className="text-accent font-bold mb-2">🎉 Hai un invito in sospeso!</h3>
                        <p className="text-text-primary text-sm mb-4">
                            Sei stato invitato a unirti a <span className="font-bold">{pendingInvites[0].studio_name}</span>.
                        </p>
                        <button
                            onClick={() => window.location.href = `/accept-invite?token=${pendingInvites[0].token}`}
                            className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-bold transition-colors w-full"
                        >
                            Accetta Invito
                        </button>
                    </div>
                ) : (
                    <div className="bg-bg-tertiary p-4 rounded-lg border border-yellow-500/20 mb-6">
                        <p className="text-sm text-yellow-500 mb-2">
                            Se fai parte di un team, chiedi al tuo admin di inviarti un nuovo link di invito.
                        </p>
                        <p className="text-xs text-text-muted">
                            Oppure, se sei un Titolare, crea il tuo nuovo spazio di lavoro qui sotto.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-accent' : 'w-2 bg-text-muted/30'}`} />
                    <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-accent' : 'w-2 bg-text-muted/30'}`} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold text-text-primary text-center mb-6">Scegli il tuo piano</h2>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Starter Plan */}
                                <div
                                    onClick={() => setSelectedPlan('starter')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'starter' ? 'border-accent bg-accent/5' : 'border-border bg-bg-tertiary hover:border-accent/50'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Shield size={18} /></div>
                                            <h3 className="font-bold text-text-primary">DeskInk Basic</h3>
                                        </div>
                                        <span className="text-xl font-bold text-text-primary">20€<span className="text-xs font-normal text-text-muted">/mese</span></span>
                                    </div>
                                    <ul className="text-sm text-text-muted space-y-1 mb-2">
                                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1 Tatuatore</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1 Manager</li>
                                    </ul>
                                </div>

                                {/* Pro Plan */}
                                <div
                                    onClick={() => setSelectedPlan('pro')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'pro' ? 'border-accent bg-accent/5' : 'border-border bg-bg-tertiary hover:border-accent/50'}`}
                                >
                                    {selectedPlan === 'pro' && <div className="absolute -top-3 right-4 bg-accent text-white text-xs px-2 py-0.5 rounded-full font-bold">CONSIGLIATO</div>}
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Star size={18} /></div>
                                            <h3 className="font-bold text-text-primary">DeskInk Pro</h3>
                                        </div>
                                        <span className="text-xl font-bold text-text-primary">40€<span className="text-xs font-normal text-text-muted">/mese</span></span>
                                    </div>
                                    <ul className="text-sm text-text-muted space-y-1 mb-2">
                                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 2 Tatuatori</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 2 Manager</li>
                                    </ul>
                                </div>

                                {/* Plus Plan */}
                                <div
                                    onClick={() => setSelectedPlan('plus')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'plus' ? 'border-accent bg-accent/5' : 'border-border bg-bg-tertiary hover:border-accent/50'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Zap size={18} /></div>
                                            <h3 className="font-bold text-text-primary">DeskInk Plus</h3>
                                        </div>
                                        <span className="text-xl font-bold text-text-primary">70€<span className="text-xs font-normal text-text-muted">/mese</span></span>
                                    </div>
                                    <ul className="text-sm text-text-muted space-y-1 mb-2">
                                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 4 Tatuatori (+extra)</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 4 Manager</li>
                                    </ul>

                                    <div className="mt-3 pt-3 border-t border-border/50" onClick={(e) => { e.stopPropagation(); setSelectedPlan('plus'); }}>
                                        <label className="block text-xs font-medium text-text-primary mb-1">
                                            Membri Extra (+10€/mese)
                                        </label>
                                        <div className="flex items-center justify-between bg-bg-primary rounded-lg p-1">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setExtraMembers(Math.max(0, extraMembers - 1)); }}
                                                className="w-6 h-6 rounded bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-center font-bold text-text-primary text-sm"
                                            >
                                                -
                                            </button>
                                            <span className="text-sm font-bold text-text-primary">{extraMembers}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setExtraMembers(extraMembers + 1); }}
                                                className="w-6 h-6 rounded bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-center font-bold text-text-primary text-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-bold transition-colors mt-4"
                            >
                                Continua
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-text-primary">Chiama il tuo Studio</h2>
                                <p className="text-sm text-text-muted mt-1">Stai creando uno studio con piano <span className="font-bold capitalize text-accent">{selectedPlan}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nome del tuo Studio</label>
                                <input
                                    type="text"
                                    value={studioName}
                                    onChange={(e) => setStudioName(e.target.value)}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-accent focus:border-accent"
                                    placeholder="Es. DESKINK Tattoo Milano"
                                    required
                                    minLength={3}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-2 bg-bg-tertiary hover:bg-white/5 text-text-muted hover:text-text-primary rounded-lg font-medium transition-colors"
                                >
                                    Indietro
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Elaborazione...' : (createdStudioId ? 'Completa Pagamento' : 'Conferma e Crea')}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="mt-6 pt-4 border-t border-border text-center">
                    <button
                        onClick={() => signOut()}
                        className="text-sm text-red-500 hover:text-red-400 underline transition-colors"
                    >
                        Esci / Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
