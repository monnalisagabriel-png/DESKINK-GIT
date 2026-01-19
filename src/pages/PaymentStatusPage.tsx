
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { api } from '../services/api';
import { Loader, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

export const PaymentStatusPage: React.FC = () => {
    const { user, refreshSubscription, refreshProfile, hasStudio } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'checking' | 'active' | 'waiting' | 'error' | 'provisioning'>('checking');
    const [attempts, setAttempts] = useState(0);
    const [lastSub, setLastSub] = useState<any>(null);
    const [lastError, setLastError] = useState<any>(null);
    const [provisionResult, setProvisionResult] = useState<any>(null);

    // Effect to catch "Active" status from Context if it happens automatically
    useEffect(() => {
        if (hasStudio && status === 'active') {
            console.log('PaymentStatus: Studio confirmed in context. Navigating to Dashboard...');
            const timer = setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hasStudio, status, navigate]);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;
        const startTime = Date.now();
        let hasTriedProvisioning = false;

        const checkStatus = async () => {
            if (!isMounted) return;

            try {
                // Force fetch from DB via API (bypass cache)
                const sub = await api.subscription.getSubscription();
                if (isMounted) setLastSub(sub);

                if (!isMounted) return;

                if (sub?.status === 'active' || sub?.status === 'trialing') {
                    setStatus('active');

                    // Critical: Force Context Refresh
                    console.log('Subscription active! Refreshing context...');
                    try {
                        if (refreshSubscription) await refreshSubscription();
                        if (refreshProfile) await refreshProfile();
                    } catch (e) { console.warn(e); }

                    // We do NOT navigate here. We wait for `hasStudio` effect above.

                } else {
                    // IF NO SUBSCRIPTION FOUND (usually because Studio is missing)
                    // Check if we should try provisioning anyway
                    const pendingName = localStorage.getItem('pendingStudioName');

                    if (!sub && pendingName && !hasTriedProvisioning && attempts > 1) {
                        // We waited 2 cycles (~6s). Sub still null. Studio likely missing.
                        // Try provisioning!
                        console.log('Subscription missing, but pending name found. Attempting Force-Provision:', pendingName);
                        setStatus('provisioning');
                        hasTriedProvisioning = true;

                        try {
                            const res = await api.subscription.provisionMissingStudio(pendingName);
                            if (isMounted) setProvisionResult(res);

                            if (res.success) {
                                console.log('Force-Provision Success!');
                                if (refreshProfile) await refreshProfile();
                                // Clear storage
                                localStorage.removeItem('pendingStudioName');
                                // Force immediate re-check
                                checkStatus();
                                return;
                            } else {
                                console.error("Force-Provision failed", res.error);
                                // If failed, maybe they really didn't pay? Or other error.
                                // Go back to waiting/error
                                setStatus('waiting');
                            }
                        } catch (provErr) {
                            console.error("Provisioning Exception:", provErr);
                            setStatus('waiting');
                        }
                    }

                    // Stop after 120 seconds (extended)
                    if (Date.now() - startTime > 120000) {
                        setStatus('error');
                    } else {
                        // If checking and not active/provisioning, keep 'checking' or 'waiting'
                        if (status !== 'checking' && status !== 'provisioning') setStatus('waiting');

                        setAttempts(prev => prev + 1);
                        // Schedule next check
                        timeoutId = setTimeout(checkStatus, 3000);
                    }
                }
            } catch (err) {
                console.error("Polling error", err);
                if (isMounted) {
                    setLastError(err);
                    // Keep trying even on error (could be network glitch)
                    timeoutId = setTimeout(checkStatus, 5000);
                }
            }
        };

        checkStatus();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [refreshSubscription, refreshProfile, hasStudio]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-700">
                {status === 'active' ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confermato!</h2>

                        {!hasStudio ? (
                            <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-yellow-200 text-sm animate-pulse">
                                <p className="font-bold mb-1">Configurazione Studio in corso...</p>
                                <p className="text-xs opacity-80">Stiamo sincronizzando i dati con il server.</p>
                            </div>
                        ) : (
                            <p className="text-slate-400">Il tuo studio è attivo. Ti stiamo portando alla Dashboard...</p>
                        )}

                        {/* 
                           Fallback button if stuck for > 5 seconds in "active" but no studio 
                           Users can click it to force a reload which often fixes context 
                        */}
                        {!hasStudio && (
                            <div className="mt-6 opacity-0 animate-in fade-in duration-1000 delay-5000 fill-mode-forwards">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-xs text-slate-500 hover:text-white underline cursor-pointer"
                                >
                                    Se non succede nulla, clicca qui per ricaricare
                                </button>
                            </div>
                        )}
                    </div>
                ) : status === 'provisioning' ? (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 animate-pulse">
                            <Wrench size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Configurazione in corso...</h2>
                        <p className="text-slate-400">Rilevato problema sulla sincronizzazione automatica. Stiamo applicando una correzione manuale...</p>
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
                            <p>HasStudio: {hasStudio ? 'YES' : 'NO'}</p>
                            {lastError ? (
                                <p className="text-red-400">Error: {JSON.stringify(lastError, null, 2)}</p>
                            ) : (
                                <p>Status: {lastSub ? JSON.stringify(lastSub, null, 2) : 'Fetching...'}</p>
                            )}
                            {provisionResult && (
                                <p className="text-blue-300">Provision: {JSON.stringify(provisionResult)}</p>
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
