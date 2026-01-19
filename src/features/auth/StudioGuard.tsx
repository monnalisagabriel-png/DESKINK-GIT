
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

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

    // 2. POLL IF PENDING/PROVISIONING
    React.useEffect(() => {
        if (effectiveStatus === 'pending_provisioning') {
            const interval = setInterval(async () => {
                console.log('Polling for activation (Status: pending_provisioning)...');
                await refreshProfile?.();
                await refreshSubscription?.();
            }, 1000); // 1s aggressive polling

            return () => clearInterval(interval);
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
