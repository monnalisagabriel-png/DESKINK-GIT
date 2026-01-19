import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { api } from '../services/api';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';

export const PaymentStatusPage: React.FC = () => {
    const { user, refreshSubscription, refreshProfile } = useAuth(); // Assume we add refreshSubscription to AuthContext
    const navigate = useNavigate();
    const [status, setStatus] = useState<'checking' | 'active' | 'waiting' | 'error'>('checking');
    const [attempts, setAttempts] = useState(0);
    const [lastSub, setLastSub] = useState<any>(null);
    const [lastError, setLastError] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;
        const startTime = Date.now();

        const checkStatus = async () => {
            if (!isMounted) return;

            try {
                // Force fetch from DB via API (bypass cache)
                const sub = await api.subscription.getSubscription();
                if (isMounted) setLastSub(sub);

                if (!isMounted) return;

                if (sub?.status === 'active' || sub?.status === 'trialing') {
                    setStatus('active');
                    // Update context to reflect new account_status and subscription
                    if (refreshSubscription) await refreshSubscription();
                    if (refreshProfile) await refreshProfile();
                    console.log('Subscription active! Redirecting...');

                    setTimeout(() => {
                        if (isMounted) navigate('/dashboard');
                    }, 2000);
                } else {
                    // Stop after 60 seconds
                    if (Date.now() - startTime > 60000) {
                        setStatus('error');
                    } else {
                        setStatus('waiting');
                        setAttempts(prev => prev + 1);
                        // Schedule next check ONLY after this one completes
                        timeoutId = setTimeout(checkStatus, 3000);
                    }
                }
            } catch (err) {
                console.error("Polling error", err);
                if (isMounted) {
                    setLastError(err);
                    setStatus('error'); // Or just retry?
                    // Let's retry on error too, but slower
                    timeoutId = setTimeout(checkStatus, 5000);
                }
            }
        };

        checkStatus(); // Initial check

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [navigate, refreshSubscription]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-700">
                {status === 'active' ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confermato!</h2>
                        <p className="text-slate-400">Il tuo studio è attivo. Ti stiamo portando alla Dashboard...</p>
                    </div>
                ) : status === 'error' && attempts > 25 ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Tempo Scaduto</h2>
                        <p className="text-slate-400 mb-6">Non abbiamo ancora ricevuto la conferma da Stripe. Potrebbe esserci un ritardo.</p>
                        <button onClick={() => window.location.reload()} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors">
                            Riprova
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="w-16 h-16 mx-auto mb-6 relative">
                            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            <Loader className="absolute inset-0 m-auto text-indigo-500 opacity-0" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verifica in corso...</h2>
                        <p className="text-slate-400">Stiamo aspettando la conferma sicura dalla banca.</p>
                        <p className="text-xs text-slate-600 mt-4">Non chiudere questa pagina ({attempts})</p>

                        <div className="mt-8 p-4 bg-black/50 rounded text-left font-mono text-xs text-slate-400 overflow-auto max-h-32">
                            <p className="font-bold text-slate-200">Debug Info:</p>
                            <p>User: {user?.id}</p>
                            {lastError ? (
                                <p className="text-red-400">Error: {JSON.stringify(lastError, null, 2)}</p>
                            ) : (
                                <p>Status: {lastSub ? JSON.stringify(lastSub, null, 2) : 'Fetching...'}</p>
                            )}
                        </div>

                        <div className="mt-6 border-t border-slate-700 pt-6">
                            <a href="/dashboard" className="text-sm text-slate-400 hover:text-white underline transition-colors">
                                Salta attesa e vai alla Dashboard
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
