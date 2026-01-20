import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { UserRole } from '../../services/types';

interface RoleGuardProps {
    allowedRoles?: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-bg-primary">
                <div className="text-xl font-bold text-accent animate-pulse">
                    Caricamento in corso...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // STRICT PAYMENT FLOW: Block access if account is pending
    // Allow access ONLY to /start-payment if pending
    // EXCEPTION: If returning from payment (payment=success), let them through to StudioGuard
    // EXCEPTION: If they ALREADY have a studio (hasStudio=true), they are assumed provisioned.
    const isPaymentSuccess = new URLSearchParams(location.search).get('payment') === 'success';

    // Ensure we don't block users who actually have a studio (even if status says pending)
    // This breaks the "Dashboard -> RoleGuard -> StartPayment -> Dashboard" loop.
    const { hasStudio, subscriptionStatus } = useAuth();

    // DEEP CHECK STATE: If context says NO, but we want to be sure.
    const [isDeepChecking, setIsDeepChecking] = React.useState(false);
    const [deepCheckPassed, setDeepCheckPassed] = React.useState(false);

    // Effect: If pending and !hasStudio, try a deep check before redirecting
    React.useEffect(() => {
        const performDeepCheck = async () => {
            if (user?.account_status === 'pending' && !hasStudio && !isPaymentSuccess && !deepCheckPassed) {
                setIsDeepChecking(true);
                console.log('RoleGuard: Account pending & No Studio in Context. Performing DEEP CHECK...');
                try {
                    const { supabase } = await import('../../lib/supabase'); // Lazy import to avoid cycle if any
                    const { data: ownedStudio } = await supabase
                        .from('studios')
                        .select('id')
                        .eq('created_by', user.id)
                        .maybeSingle();

                    if (ownedStudio) {
                        console.log('RoleGuard: DEEP CHECK PASSED. Studio found:', ownedStudio.id);
                        setDeepCheckPassed(true);
                    } else {
                        console.log('RoleGuard: DEEP CHECK FAILED. No studio found.');
                    }
                } catch (err) {
                    console.error('RoleGuard Deep Check Error:', err);
                } finally {
                    setIsDeepChecking(false);
                }
            }
        };
        performDeepCheck();
    }, [user, hasStudio, isPaymentSuccess, deepCheckPassed]);

    // If deep checking, show loading
    if (isDeepChecking) {
        return (
            <div className="flex items-center justify-center h-screen bg-bg-primary">
                <div className="text-xl font-bold text-accent animate-pulse">
                    Verifica Account in corso...
                </div>
            </div>
        );
    }

    // CONDITION: 
    // Redirect if: 
    // 1. Account is pending
    // 2. Not a payment success return
    // 3. DOES NOT have studio (Context)
    // 4. DEEP CHECK also failed (or haven't passed)

    // --- SUPREME RULE CHECK ---
    const isActuallyActive = subscriptionStatus === 'active' || deepCheckPassed;

    if (user?.account_status === 'pending' && !isPaymentSuccess && !hasStudio && !isActuallyActive) {

        console.error("REDIRECT_START_PAYMENT", {
            guard: "RoleGuard",
            reason: "Account pending & No Studio & Not Active",
            path: location.pathname,
            userId: user.id,
            studioId: user.studio_id,
            status: user.account_status,
            role: user.role,
            membershipsCount: hasStudio ? 1 : 0,
            subscriptionStatus: subscriptionStatus
        });

        if (location.pathname !== '/start-payment') {
            return <Navigate to="/start-payment" replace />;
        }
        // If on /start-payment, allow thorough
    } else if (isActuallyActive && location.pathname.includes('/start-payment')) {
        // PREVENT active users from seeing start-payment (Supreme Rule Block)
        console.log('RoleGuard: Active user tried start-payment. FORCE Redirecting to Dashboard.');
        return <Navigate to="/dashboard" replace />;
    } else {
        // Allow through for verified users
    }

    if (allowedRoles && user) {
        // Case-insensitive check
        const normalizedUserRole = user.role.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
            // Redirect to dashboard if authorized generally but not for this specific route
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};
