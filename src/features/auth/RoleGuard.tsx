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
    const isPaymentSuccess = new URLSearchParams(location.search).get('payment') === 'success';

    if (user?.account_status === 'pending' && !isPaymentSuccess) {
        if (location.pathname !== '/start-payment') {
            return <Navigate to="/start-payment" replace />;
        }
        // If on /start-payment, allow thorough
    } else {
        // If Active (or suspended?)
        // If they stick to /start-payment, normally redirect to dashboard.
        // BUT, if they don't have a studio yet, they MIGHT need to be here to create one (via payment).
        // Check hasStudio from useAuth() - Note: RoleGuard needs to ensure useAuth provides this.
        // Ideally we check: if (location.pathname === '/start-payment' && hasStudio) -> redirect to /

        // However, RoleGuard doesn't strictly depend on 'hasStudio' being populated yet (might be loading).
        // But 'isLoading' check at top handles the unset state mostly.

        // For now, let's just ALLOW /start-payment always, or filter by studio existence if we can.
        // Safer: If they are active and go to start-payment, let them! Maybe they want to buy another studio? (Future proof)
        // OR better to fix the loop:

        // if (location.pathname === '/start-payment' && hasStudio) {
        //    return <Navigate to="/" replace />;
        // }
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
