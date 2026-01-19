import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SubscriptionPage } from './features/subscription/SubscriptionPage';
import { AuthProvider } from './features/auth/AuthContext';
import { RoleGuard } from './features/auth/RoleGuard';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './features/auth/LoginPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { UpdatePasswordPage } from './features/auth/UpdatePasswordPage';
import { Dashboard as DashboardPage } from './features/dashboard/Dashboard';
import { Calendar as CalendarPage } from './features/calendar/Calendar';
import { ClientsList as ClientsPage } from './features/clients/ClientsList';
import { ClientProfile as ClientProfilePage } from './features/clients/ClientProfile';
import { FinancialsPage } from './features/finance/FinancialsPage';
import { AcademyPage } from './features/academy/AcademyPage';
import { ConsentsPage } from './features/consents/ConsentsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ArtistsPage } from './features/artists/ArtistsPage';
import { ArtistProfilePage } from './features/artists/ArtistProfilePage';
import { MarketingPage } from './features/marketing/MarketingPage';
import { WaitlistManager } from './features/waitlist/WaitlistManager';
import { CommunicationsPage } from './features/communications/CommunicationsPage';
import { WaitlistForm } from './features/waitlist/WaitlistForm';
import { PublicClientForm } from './features/clients/PublicClientForm';
import { DebugSupabase } from './pages/DebugSupabase';
import { StartPaymentPage } from './pages/StartPaymentPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { StudioGuard } from './features/auth/StudioGuard';
import { TeamPage } from './features/team/TeamPage';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
import { CookiePolicy } from './pages/legal/CookiePolicy';
import { TutorialsPage } from './pages/TutorialsPage';
import { PublicBookingPage } from './features/booking';
import { BookingStatusPage } from './pages/public/BookingStatusPage';
import { PaymentStatusPage } from './pages/PaymentStatusPage';

import { useLayoutStore } from './stores/layoutStore';

function App() {
    // Global Theme Effect
    const { theme, accentColor } = useLayoutStore();

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }

        // Apply Accent Color
        if (accentColor) {
            document.documentElement.style.setProperty('--color-accent', accentColor);
            // Simple hover variant (same or slightly adjusted logic could be added)
            document.documentElement.style.setProperty('--color-accent-hover', accentColor);
        }
    }, [theme, accentColor]);

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/debug-supabase" element={<DebugSupabase />} />


                    {/* Public Routes */}
                    <Route path="/public/waitlist/:studioId" element={<WaitlistForm />} />
                    <Route path="/public/register/:studioId" element={<PublicClientForm />} />
                    <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                    <Route path="/legal/terms" element={<TermsOfService />} />
                    <Route path="/legal/cookie" element={<CookiePolicy />} />
                    <Route path="/book/:studioId" element={<PublicBookingPage />} />
                    <Route path="/booking-status" element={<BookingStatusPage />} />
                    <Route path="/pricing" element={<SubscriptionPage />} />

                    {/* Invitation Acceptance */}
                    <Route path="/accept-invite" element={<AcceptInvitePage />} />

                    {/* Password Recovery */}
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/update-password" element={<UpdatePasswordPage />} />



                    // ... (existing imports)

                    <Route element={<RoleGuard />}>
                        {/* Routes that require Login but NOT Studio yet */}
                        <Route path="/start-payment" element={<StartPaymentPage />} />
                        <Route path="/register-studio" element={<Navigate to="/start-payment" replace />} /> {/* Redirect old route */}
                        <Route path="/payment-status" element={<PaymentStatusPage />} />

                        {/* Routes that require Login AND Studio Membership */}
                        <Route element={<StudioGuard />}>
                            <Route element={<AppLayout />}>
                                <Route path="/" element={<DashboardPage />} />
                                <Route path="/dashboard" element={<DashboardPage />} />

                                {/* Financials (Owner, Admin, Manager, Artist) */}
                                <Route element={<RoleGuard allowedRoles={['owner', 'STUDIO_ADMIN', 'MANAGER', 'ARTIST', 'artist']} />}>
                                    <Route path="/financials" element={<FinancialsPage />} />
                                </Route>

                                {/* Calendar, Clients, Consents, Chat, Comms (Owner + Management + Artists) */}
                                <Route element={<RoleGuard allowedRoles={['owner', 'STUDIO_ADMIN', 'MANAGER', 'ARTIST', 'artist']} />}>
                                    <Route path="/calendar" element={<CalendarPage />} />
                                    <Route path="/clients" element={<ClientsPage />} />
                                    <Route path="/clients/:id" element={<ClientProfilePage />} />
                                    <Route path="/consents" element={<ConsentsPage />} />
                                    <Route path="/communications" element={<CommunicationsPage />} />
                                </Route>

                                {/* Artists (Owner, Admin, Manager) */}
                                <Route element={<RoleGuard allowedRoles={['owner', 'STUDIO_ADMIN', 'MANAGER']} />}>
                                    <Route path="/artists" element={<ArtistsPage />} />
                                    <Route path="/artists/:id" element={<ArtistProfilePage />} />
                                </Route>

                                {/* Settings (All Roles) */}
                                <Route element={<RoleGuard allowedRoles={['owner', 'STUDIO_ADMIN', 'MANAGER', 'ARTIST', 'STUDENT']} />}>
                                    <Route path="/settings" element={<SettingsPage />} />
                                </Route>

                                <Route element={<RoleGuard allowedRoles={['owner']} />}>
                                    <Route path="/team" element={<TeamPage />} />
                                </Route>

                                {/* Waitlist, Marketing (Owner + Management) */}
                                <Route element={<RoleGuard allowedRoles={['owner', 'STUDIO_ADMIN', 'MANAGER']} />}>
                                    <Route path="/waitlist" element={<WaitlistManager />} />
                                    <Route path="/marketing" element={<MarketingPage />} />
                                    <Route path="/tutorials" element={<TutorialsPage />} />
                                </Route>

                                {/* Academy (Owner, Admin, Student) */}
                                <Route element={<RoleGuard allowedRoles={['owner', 'STUDIO_ADMIN', 'STUDENT']} />}>
                                    <Route path="/academy" element={<AcademyPage />} />
                                </Route>

                            </Route>
                        </Route>
                    </Route>

                    {/* Catch all - Redirect to Dashboard if logged in, else Login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
