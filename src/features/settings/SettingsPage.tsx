import React, { useState } from 'react';
import { User, Building, FileText, Palette, Moon, Link } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../auth/AuthContext';
import { useLayoutStore } from '../../stores/layoutStore';
import { ProfileSettings } from './components/ProfileSettings';
import { TeamSettings } from './components/TeamSettings';
import { StudioSettings } from './components/StudioSettings';
import { ArtistContractSettings } from './components/ArtistContractSettings';
import { BookingSettings } from './components/BookingSettings';
import { IntegrationsTab } from '../artists/components/IntegrationsTab';

import { useLocation } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
    const { user, refreshProfile } = useAuth();
    const { theme, setTheme, accentColor, setAccentColor } = useLayoutStore();
    const location = useLocation();

    // Parse query param ?tab=...
    const searchParams = new URLSearchParams(location.search);
    const initialTab = searchParams.get('tab') || 'profile';

    const [activeTab, setActiveTab] = useState(initialTab);

    // Update activeTab if URL changes
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const googleSuccess = params.get('google_sync_success');

        if (googleSuccess === 'true') {
            setActiveTab('integrations');
        } else if (tab) {
            setActiveTab(tab);
        }
    }, [location.search]);

    const isStudent = user?.role?.toLowerCase() === 'student';

    const normalizedRole = user?.role?.toLowerCase() || '';

    const tabs = [
        { id: 'profile', label: isStudent ? 'Scheda Studente' : 'Profilo', icon: User },
        // Show Team Management removed as requested (present in sidebar)
        // ...(['owner', 'studio_admin', 'manager'].includes(normalizedRole) ? [{ id: 'team', label: 'Gestione Team', icon: Users }] : []),
        // Show Studio Info for OWNER, STUDIO_ADMIN
        ...(['owner', 'studio_admin'].includes(normalizedRole) ? [
            { id: 'studio', label: 'Info Studio', icon: Building },
        ] : []),

        // Show Booking for OWNER, STUDIO_ADMIN, AND ARTIST
        ...(['owner', 'studio_admin', 'artist'].includes(normalizedRole) ? [
            { id: 'booking', label: 'Prenotazioni', icon: Link }
        ] : []),
        // Show Contract for ARTIST
        ...(['artist'].includes(normalizedRole) ? [{ id: 'contract', label: 'Il Mio Contratto', icon: FileText }] : []),
        ...(['owner'].includes(normalizedRole) ? [{ id: 'integrations', label: 'Integrazioni', icon: Link }] : []),
        { id: 'appearance', label: 'Aspetto', icon: Palette },
    ];

    // Split tabs into contexts
    const studioGroup = ['studio', 'team', 'booking'];
    const isStudioContext = studioGroup.includes(activeTab);

    const handleUpdate = React.useCallback(async () => {
        // Avoid full reload, just refresh profile to get new integration status
        await refreshProfile();
        // Also ensure URL is clean if not already
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, '', newUrl);
    }, [refreshProfile]);

    const visibleTabs = tabs.filter(t => {
        if (isStudioContext) return studioGroup.includes(t.id);
        return !studioGroup.includes(t.id); // Show settings/appearance tabs
    });

    return (
        <div className="w-full p-4 md:p-8 flex flex-col md:flex-row gap-8 overflow-x-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex-shrink-0">
                <h1 className="text-2xl font-bold text-text-primary mb-6">
                    {isStudioContext ? 'Studio' : 'Impostazioni'}
                </h1>
                <nav className="space-y-2">
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                                activeTab === tab.id
                                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                                    : "text-text-muted hover:text-text-primary hover:bg-bg-secondary"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-[500px] max-w-full">
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'team' && <TeamSettings />}
                {activeTab === 'studio' && <StudioSettings />}
                {activeTab === 'booking' && <BookingSettings />}
                {activeTab === 'contract' && <ArtistContractSettings />}
                {activeTab === 'integrations' && user && <IntegrationsTab artist={user} onUpdate={handleUpdate} />}

                {activeTab === 'appearance' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Aspetto e Tema</h2>
                        <div className="bg-bg-secondary p-6 rounded-xl border border-border">
                            <h3 className="text-lg font-semibold text-text-primary mb-4">Modalità Visualizzazione</h3>
                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={clsx(
                                        "p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
                                        theme === 'dark'
                                            ? "bg-accent/10 border-accent text-accent"
                                            : "bg-bg-tertiary border-transparent text-text-muted hover:bg-bg-primary"
                                    )}
                                >
                                    <Moon size={24} />
                                    <span className="font-medium">Dark Mode</span>
                                </button>
                                <button
                                    onClick={() => setTheme('light')}
                                    className={clsx(
                                        "p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
                                        theme === 'light'
                                            ? "bg-accent/10 border-accent text-accent"
                                            : "bg-bg-tertiary border-transparent text-text-muted hover:bg-bg-primary"
                                    )}
                                >
                                    <span className="font-medium">Light Mode</span>
                                </button>
                            </div>
                        </div>

                        {/* Branding / Accent Color */}
                        <div className="bg-bg-secondary p-6 rounded-xl border border-border">
                            <h3 className="text-lg font-semibold text-text-primary mb-4">Colore Principale (Branding)</h3>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { color: '#39FF14', name: 'Neon Green' },
                                    { color: '#FF6B35', name: 'Brand Orange' },
                                    { color: '#3B82F6', name: 'Blue' },
                                    { color: '#8B5CF6', name: 'Purple' },
                                    { color: '#EC4899', name: 'Pink' }
                                ].map((swatch) => (
                                    <button
                                        key={swatch.color}
                                        onClick={() => setAccentColor(swatch.color)}
                                        className={clsx(
                                            "w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center",
                                            accentColor === swatch.color
                                                ? "border-text-primary scale-110 shadow-lg"
                                                : "border-transparent hover:scale-105"
                                        )}
                                        style={{ backgroundColor: swatch.color }}
                                        title={swatch.name}
                                    >
                                        {accentColor === swatch.color && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                                    </button>
                                ))}

                                {/* Custom Color Picker */}
                                <div className="relative group">
                                    <input
                                        type="color"
                                        value={accentColor}
                                        onChange={(e) => setAccentColor(e.target.value)}
                                        className="w-12 h-12 rounded-full p-0 border-0 overflow-hidden cursor-pointer opacity-0 absolute inset-0 z-10"
                                    />
                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-text-muted flex items-center justify-center group-hover:border-text-primary transition-colors bg-bg-tertiary">
                                        <Palette size={18} className="text-text-muted group-hover:text-text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
