
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const StudioGuard: React.FC = () => {
    const { isAuthenticated, isLoading, hasStudio, subscriptionStatus, refreshProfile, refreshSubscription } = useAuth();

    // 1. Detect Payment Return
    // Use sessionStorage to persist state in case URL params are stripped
    const queryParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = queryParams.get('payment') === 'success';

    // Initialize persistent provisioning state if URL param is present
    if (isPaymentSuccess && !sessionStorage.getItem('provisioning_mode')) {
        sessionStorage.setItem('provisioning_mode', 'true');
    }

    const isProvisioning = sessionStorage.getItem('provisioning_mode') === 'true';

    // 2. Poll for Activation
    React.useEffect(() => {
        if (isProvisioning && (!hasStudio || subscriptionStatus !== 'active')) {
            const interval = setInterval(async () => {
                console.log('Polling for activation...', subscriptionStatus);
                await refreshProfile?.();
                await refreshSubscription?.();
            }, 1000); // 1s aggressive polling

            // Safety Timeout (e.g. 60s)
            const timeout = setTimeout(() => {
                sessionStorage.removeItem('provisioning_mode');
                // Allow fall-through to error/redirect after timeout
            }, 60000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        } else if (hasStudio && subscriptionStatus === 'active') {
            // Success! Clear mode
            sessionStorage.removeItem('provisioning_mode');
        }
    }, [isProvisioning, hasStudio, subscriptionStatus, refreshProfile, refreshSubscription]);

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

    // 3. BLOCKING LOADING STATE
    // Strictly block access while provisioning
    if (isProvisioning) {
        if (!hasStudio || subscriptionStatus !== 'active') {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-bg-primary space-y-4">
                    <div className="text-2xl font-bold text-accent animate-pulse">
                        Configurazione Studio in corso...
                    </div>
                    <p className="text-text-muted">Il pagamento è stato ricevuto. Attendi l'attivazione (max 30s)...</p>
                    <div className="text-sm text-text-muted">Status: {subscriptionStatus || 'waiting'}</div>
                </div>
            );
        }
        // Once active, we drop through (Effect handles cleanup)
    }

    // Normal Protection Logic
    if (hasStudio === false) {
        // Fail-safe logic for pending studio is removed in favor of strict flow compliance
        // User Rule 5: If not paid/active -> pricing only (start-payment)
        return <Navigate to="/start-payment" replace />;
    }

    if (!subscriptionStatus || subscriptionStatus === 'none' || subscriptionStatus === 'canceled' || subscriptionStatus === 'incomplete') {
        // User Rule 5: Strict Block
        // If we are here, hasStudio is true, but sub is bad.
        // Redirect to pricing/payment
        return <Navigate to="/start-payment" replace />;
    }

    // Allow Access
    return <Outlet />;
};
