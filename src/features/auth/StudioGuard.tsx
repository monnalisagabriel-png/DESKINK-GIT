
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '../../lib/supabase';

export const StudioGuard: React.FC = () => {
    const { isAuthenticated, isLoading, hasStudio, subscriptionStatus, refreshProfile, refreshSubscription } = useAuth();
    const [verifiedActive, setVerifiedActive] = React.useState(false);

    // 1. DERIVE EFFECTIVE STATUS
    const queryParams = new URLSearchParams(window.location.search);
    const isPaymentSuccess = queryParams.get('payment') === 'success';

    let effectiveStatus = subscriptionStatus;
    if (isPaymentSuccess && subscriptionStatus !== 'active') {
        effectiveStatus = 'pending_provisioning';
    }

    // 2. UNIVERSAL DIRECT DB CHECK (The Ultimate Fail-Safe)
    // Checks DB directly. If active, sets local flag to BYPASS everything.
    React.useEffect(() => {
        const verifyDirectly = async () => {
            // If Context already says yes, we are good.
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
                        console.log('🛡️ StudioGuard: Verified Active via Direct DB check. Allowing access.');
                        setVerifiedActive(true);
                    }
                }
            } catch (err) { console.error('Verification error', err); }
        };
        verifyDirectly();
    }, [hasStudio, subscriptionStatus]);

    // 3. BRUTAL REDIRECT: If status becomes active (context or verified), ensure we keep user in
    React.useEffect(() => {
        if (subscriptionStatus === 'active' || verifiedActive) {
            // Optional: Could force reload if needed, but setState should trigger re-render
        }
    }, [subscriptionStatus, verifiedActive]);

    // 4. POLL IF PENDING/PROVISIONING
    React.useEffect(() => {
        if (effectiveStatus === 'pending_provisioning' && !verifiedActive) {
            const interval = setInterval(async () => {
                await refreshProfile?.();
                await refreshSubscription?.();
            }, 1000);

            // FAIL-SAFE: Force hard refresh after 6 seconds
            const timeout = setTimeout(() => {
                window.location.reload();
            }, 6000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [effectiveStatus, refreshProfile, refreshSubscription, verifiedActive]);

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

    // 5. GRANT ACCESS
    // If Context implies access OR if we verified it directly -> OPEN GATES
    if ((hasStudio && subscriptionStatus === 'active') || verifiedActive) {
        return <Outlet />;
    }

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

    // STRICT BLOCK
    if (hasStudio === false) {
        return <Navigate to="/start-payment" replace />;
    }

    return <Navigate to="/start-payment" replace />;
};
