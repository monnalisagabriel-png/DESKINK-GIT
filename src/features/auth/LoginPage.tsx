
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, Shield, Star, Zap } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [signupStep, setSignupStep] = useState<1 | 2>(1); // 1: Plans, 2: Form
    const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'plus'>('starter');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (activeTab === 'signup') {
                if (signupStep === 1) {
                    setSignupStep(2);
                    setLoading(false);
                    return;
                }
                // Store selected plan for next step (RegisterStudio)
                localStorage.setItem('pendingPlanPreference', selectedPlan);

                const autoLogin = await signUp(email, password);
                if (autoLogin) {
                    navigate(from, { replace: true });
                } else {
                    setMessage('Registrazione avvenuta con successo! Controlla la tua email per confermare l\'account.');
                }
            } else {
                // 1. Perform Sign In
                const session = await signIn(email, password); // Note: signIn signature in context returns void, but we might need to rely on direct check

                // 2. RESOLVE STUDIO STATUS MANUALLY (To ensure 100% correct routing)
                // We cannot rely on 'from' because it might be '/start-payment' from a previous failed access.
                // We cannot rely on 'user' from useAuth because it's stale in this function scope.

                const { data: { user: currentUser } } = await import('../../lib/supabase').then(m => m.supabase.auth.getUser());

                if (currentUser) {
                    console.log('Login successful. Resolving Post-Login Route for:', currentUser.id);

                    // Check Ownership & Status directly
                    const { supabase } = await import('../../lib/supabase');
                    const { data: studio } = await supabase
                        .from('studios')
                        .select('subscription_status')
                        .eq('created_by', currentUser.id)
                        .maybeSingle();

                    const isStudioActive = studio?.subscription_status === 'active';
                    console.log('Login Resolution -> Studio Status:', studio?.subscription_status);

                    if (isStudioActive) {
                        console.log('LOGIN RESOLVED -> STUDIO ACTIVE -> DASHBOARD');
                        // Force Dashboard if they were stuck on start-payment or generic login
                        if (!from || from === '/' || from === '/login' || from.includes('/start-payment')) {
                            navigate('/dashboard', { replace: true });
                        } else {
                            navigate(from, { replace: true });
                        }
                    } else {
                        console.log('LOGIN RESOLVED -> NO ACTIVE STUDIO -> START PAYMENT');
                        console.error("REDIRECT_START_PAYMENT", {
                            guard: "LoginPage",
                            reason: "Login Resolved - Studio Not Active",
                            path: '/start-payment',
                            userId: currentUser.id,
                            studioStatus: studio?.subscription_status
                        });
                        navigate('/start-payment', { replace: true });
                    }
                } else {
                    // Fallback if something weird happens (should catch in error block)
                    navigate(from, { replace: true });
                }

            }
        } catch (err: any) {
            console.error('Auth failed:', err);
            // Handle specific cases
            if (activeTab === 'login' && (err.message.includes('Invalid login credentials') || err.status === 400)) {
                setError('Credenziali non valide. Se non hai ancora un account, registrati nella scheda "Crea nuovo account".');
            } else {
                // Show more details for debugging
                const detail = err.message || JSON.stringify(err);
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'NOT SET (using mock?)';
                setError(`Errore: ${detail} (Status: ${err.status || 'N/A'})\nTarget: ${supabaseUrl.substring(0, 15)}...`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            <div className="w-full max-w-md p-8 bg-bg-secondary rounded-lg border border-border shadow-2xl">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/deskink_logo.jpg"
                            alt="DESKINK CRM"
                            className="w-24 h-24 rounded-full object-cover shadow-xl"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-text-primary mb-2">DESKINK</h1>
                    <p className="text-text-muted text-sm px-4">
                        Gestisci il tuo studio di tatuaggi con efficienza. Agenda, Clienti e Contabilità tutto in un'unica app.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex mb-6 bg-bg-tertiary p-1 rounded-lg">
                    <button
                        onClick={() => { setActiveTab('login'); setError(null); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'login' ? 'bg-bg-primary text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Ho già un account
                    </button>
                    <button
                        onClick={() => { setActiveTab('signup'); setSignupStep(1); setError(null); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'signup' ? 'bg-bg-primary text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Crea nuovo account
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center animate-in fade-in zoom-in-95">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-500 text-sm text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'login' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-accent focus:border-accent transition-all"
                                    placeholder="nome@esempio.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-accent focus:border-accent pr-10 transition-all"
                                        placeholder="Inserisci la password"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="flex justify-end mt-1">
                                    <Link to="/forgot-password" className="text-xs text-accent hover:text-accent-hover transition-colors">
                                        Password dimenticata?
                                    </Link>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? 'Elaborazione...' : 'Accedi'}
                            </button>
                        </>
                    )}

                    {activeTab === 'signup' && signupStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-lg font-bold text-center text-text-primary">Scegli il tuo piano ideale</h3>
                            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
                                {/* Starter Plan */}
                                <div
                                    onClick={() => setSelectedPlan('starter')}
                                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'starter' ? 'border-accent bg-accent/5' : 'border-border bg-bg-tertiary hover:border-accent/50'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500"><Shield size={16} /></div>
                                            <h3 className="font-bold text-text-primary text-sm">DeskInk Basic</h3>
                                        </div>
                                        <span className="text-lg font-bold text-text-primary">20€<span className="text-xs font-normal text-text-muted">/mese</span></span>
                                    </div>
                                    <ul className="text-xs text-text-muted space-y-1">
                                        <li className="flex items-center gap-1"><Check size={12} className="text-green-500" /> 1 Tatuatore</li>
                                        <li className="flex items-center gap-1"><Check size={12} className="text-green-500" /> 1 Manager</li>
                                    </ul>
                                </div>

                                {/* Pro Plan */}
                                <div
                                    onClick={() => setSelectedPlan('pro')}
                                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'pro' ? 'border-accent bg-accent/5' : 'border-border bg-bg-tertiary hover:border-accent/50'}`}
                                >
                                    {selectedPlan === 'pro' && <div className="absolute -top-2 right-4 bg-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold">TOP</div>}
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><Star size={16} /></div>
                                            <h3 className="font-bold text-text-primary text-sm">DeskInk Pro</h3>
                                        </div>
                                        <span className="text-lg font-bold text-text-primary">40€<span className="text-xs font-normal text-text-muted">/mese</span></span>
                                    </div>
                                    <ul className="text-xs text-text-muted space-y-1">
                                        <li className="flex items-center gap-1"><Check size={12} className="text-green-500" /> 2 Tatuatori</li>
                                        <li className="flex items-center gap-1"><Check size={12} className="text-green-500" /> 2 Manager</li>
                                    </ul>
                                </div>

                                {/* Plus Plan */}
                                <div
                                    onClick={() => setSelectedPlan('plus')}
                                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'plus' ? 'border-accent bg-accent/5' : 'border-border bg-bg-tertiary hover:border-accent/50'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500"><Zap size={16} /></div>
                                            <h3 className="font-bold text-text-primary text-sm">DeskInk Plus</h3>
                                        </div>
                                        <span className="text-lg font-bold text-text-primary">70€<span className="text-xs font-normal text-text-muted">/mese</span></span>
                                    </div>
                                    <ul className="text-xs text-text-muted space-y-1">
                                        <li className="flex items-center gap-1"><Check size={12} className="text-green-500" /> 4 Tatuatori (+extra)</li>
                                        <li className="flex items-center gap-1"><Check size={12} className="text-green-500" /> 4 Manager</li>
                                    </ul>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
                            >
                                Seleziona {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} e Continua
                            </button>
                        </div>
                    )}

                    {activeTab === 'signup' && signupStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="text-center mb-4">
                                <span className="text-sm text-text-muted">Hai scelto il piano <span className="text-accent font-bold capitalize">{selectedPlan}</span></span>
                                <button type="button" onClick={() => setSignupStep(1)} className="text-xs text-accent hover:underline block mx-auto mt-1">Modifica</button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-accent focus:border-accent transition-all"
                                    placeholder="nome@esempio.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-accent focus:border-accent pr-10 transition-all"
                                        placeholder="Min. 6 caratteri"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? 'Creazione Account...' : 'Crea Account'}
                            </button>
                        </div>
                    )}
                </form>

                {/* Deprecated toggle link removed in favor of Tabs */}
            </div>
        </div>
    );
};
