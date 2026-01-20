
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '../../lib/supabase';

export const StudioGuard: React.FC = () => {
    const { isAuthenticated, isLoading, hasStudio, subscriptionStatus, refreshProfile, refreshSubscription } = useAuth();

    // 1. DERIVE EFFECTIVE STATUS
    const queryParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = queryParams.get('payment') === 'success';

    let effectiveStatus = subscriptionStatus;

    // Treat "payment=success" as a virtual "pending" state if DB isn't active yet
    if (isPaymentSuccess && subscriptionStatus !== 'active') {
        effectiveStatus = 'pending_provisioning';
    }

    // 3. BRUTAL REDIRECT: If status becomes active, force entry
    React.useEffect(() => {
        if (subscriptionStatus === 'active') {
            console.log('Subscription ACTIVE detected. Forcing redirect to Dashboard...');
            window.location.href = '/dashboard';
        }
    }, [subscriptionStatus]);

    // 2. POLL IF PENDING/PROVISIONING
    React.useEffect(() => {
        if (effectiveStatus === 'pending_provisioning') {
            const interval = setInterval(async () => {
                console.log('Polling for activation (Status: pending_provisioning)...');

                // 1. STANDARD REFRESH (Keep existing logic)
                await refreshProfile?.();
                await refreshSubscription?.();

                // 2. DIRECT DB CHECK (Bypass AuthContext/Membership issues)
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        const { data: directStudio } = await supabase
                            .from('studios')
                            .select('subscription_status')
                            .eq('created_by', user.id)
                            .maybeSingle();

                        console.log('Direct DB Check Status:', directStudio?.subscription_status);

                        if (directStudio?.subscription_status === 'active') {
                            console.log('🚨 DIRECT DB HIT: ACTIVE! REDIRECTING NOW! 🚨');
                            window.location.replace('/dashboard');
                            return;
                        }
                    }
                } catch (err) { (console.error('Direct poll error', err)); }

            }, 1000); // 1s aggressive polling

            // FAIL-SAFE: Force hard refresh after 6 seconds if still pending
            // This fixes cases where the SPA state gets stuck despite DB update
            const timeout = setTimeout(() => {
                console.warn('Provisioning timeout reached. Forcing page reload...');
                window.location.reload();
            }, 6000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [effectiveStatus, refreshProfile, refreshSubscription]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-bg-primary">
                <div className="text-xl font-bold text-accent animate-pulse">
                    Verifying membership...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. HANDLE STATES
    if (hasStudio && subscriptionStatus === 'active') {
        // Access Granted
        return <Outlet />;
    }

    if (effectiveStatus === 'pending_provisioning') {
        // Loading State (NO REDIRECT)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-bg-primary space-y-4">
                <div className="text-2xl font-bold text-accent animate-pulse">
                    Configurazione Studio in corso...
                </div>
                <p className="text-text-muted">Stiamo attivando il tuo piano. Attendi qualche secondo...</p>
                <div className="text-sm text-text-muted">Non ricaricare la pagina.</div>
            </div>
        );
    }

    // STRICT BLOCK: If we are here, status is NOT active and NOT pending
    // Redirect to pricing
    if (hasStudio === false) {
        return <Navigate to="/start-payment" replace />;
    }

    return <Navigate to="/start-payment" replace />;
};
