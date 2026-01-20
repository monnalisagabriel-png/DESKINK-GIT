
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
// ACCESS RULE: Do NOT reintroduce subscription-based routing. Access depends ONLY on user.studio_id.

export const StudioGuard: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-bg-primary">
                <div className="text-xl font-bold text-accent animate-pulse">
                    Verifying access...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // SUPREME RULE — NO EXCEPTIONS
    // If user has a studio_id (meaning they belong to a studio), they get access.
    // We ignore subscription checks here to prevent loops.
    if (user?.studio_id && user.studio_id !== 'default') {
        console.log('✅ StudioGuard: studio_id present -> ACCESS GRANTED', user.studio_id);
        return <Outlet />;
    }

    console.warn('⛔ StudioGuard: No studio_id found -> Redirecting to /start-payment');
    return <Navigate to="/start-payment" replace />;
};
