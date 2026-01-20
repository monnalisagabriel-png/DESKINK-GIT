
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '../../lib/supabase';

export const StudioGuard: React.FC = () => {
    const { isAuthenticated, isLoading, hasStudio, subscriptionStatus } = useAuth();
    const [verifiedActive, setVerifiedActive] = React.useState(false);

    const queryParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = queryParams.get('payment') === 'success';



    let effectiveStatus = subscriptionStatus;
    if (isPaymentSuccess && subscriptionStatus !== 'active') {
        effectiveStatus = 'pending_provisioning';
    }

    // 3. UNIVERSAL DIRECT DB CHECK (The Ultimate Fail-Safe)
    React.useEffect(() => {
        const verifyDirectly = async () => {
            if (hasStudio && subscriptionStatus === 'active') return;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: directStudio } = await supabase
                        .from('studios')
                        .select('subscription_status')
                        .eq('created_by', user.id)
                        .maybeSingle();

                    if (directStudio?.subscription_status === 'active') {
                        setVerifiedActive(true);
                    }
                }
            } catch (err) { console.error('Verification error', err); }
        };
        verifyDirectly();
    }, [hasStudio, subscriptionStatus]);

    if (isLoading && !verifiedActive) {
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

    // SUPREME RULE: If active (via Context OR Direct Check) -> ALLOW ACCESS
    if ((hasStudio && subscriptionStatus === 'active') || verifiedActive) {
        return <Outlet />;
    }

    // IF we are here, user is NOT active.
    // Allow pending provisioning to show loading screen
    if (effectiveStatus === 'pending_provisioning') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-bg-primary space-y-4">
                <div className="text-2xl font-bold text-accent animate-pulse">
                    Configurazione Studio in corso...
                </div>
                <p className="text-text-muted">Stiamo attivando il tuo piano. Attendi qualche secondo...</p>
            </div>
        );
    }

    // STRICT BLOCK: Finally, if not active and not provisioning, redirect to payment
    return <Navigate to="/start-payment" replace />;
};
