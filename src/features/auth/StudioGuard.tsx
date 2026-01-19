
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const StudioGuard: React.FC = () => {
    const { isAuthenticated, isLoading, hasStudio, subscriptionStatus, refreshProfile, refreshSubscription } = useAuth();

    // Check for payment override
    const queryParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = queryParams.get('payment') === 'success';

    // Effect to poll if we are in "Payment Success" mode but data isn't ready
    React.useEffect(() => {
        if (isPaymentSuccess && (!hasStudio || subscriptionStatus !== 'active')) {
            const interval = setInterval(async () => {
                console.log('Polling for studio/subscription activation...');
                await refreshProfile?.();
                await refreshSubscription?.();
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [isPaymentSuccess, hasStudio, subscriptionStatus, refreshProfile, refreshSubscription]);


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

    // BYPASS: If returning from successful payment, ALLOW ACCESS (show loading overlay if needed)
    // The user wants "Entrare nel menu dello STUDIO senza blocchi"
    if (isPaymentSuccess) {
        if (!hasStudio || subscriptionStatus !== 'active') {
            // Render the App Layout but maybe with a "Finishing Setup..." banner / overlay
            // Or just let them in (Application might break if studio_id is missing, so we safely render a loader)
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-bg-primary space-y-4">
                    <div className="text-2xl font-bold text-accent animate-pulse">
                        Configurazione Studio in corso...
                    </div>
                    <p className="text-text-muted">Il pagamento è stato ricevuto. Stiamo preparando il tuo ambiente.</p>
                </div>
            );
        }
        // Once active, fall through to render Outlet
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
