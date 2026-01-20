import React, { useState } from 'react';
import { MessageSquare, Mail, Lock, Save } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../../services/api';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import type { Studio } from '../../../services/types';
import clsx from 'clsx';

interface AutomationSettingsProps {
    studio: Studio;
    onUpdate: () => void;
}

export const AutomationSettings: React.FC<AutomationSettingsProps> = ({ studio, onUpdate }) => {
    const { user } = useAuth();
    const { data: subscription } = useSubscription();

    // Assuming a valid subscription is required. 
    // We check if plan exists and status is active or trialing.
    // Adjust logic based on specific plan names if needed (e.g. only 'PRO' has it).
    // For now, any active paid plan unlocks this.
    const hasActiveSubscription = subscription &&
        (subscription.status === 'active' || subscription.status === 'trialing');

    // Local state for form
    const [settings, setSettings] = useState({
        whatsapp_enabled: studio.automation_settings?.whatsapp_enabled || false,
        whatsapp_business_id: studio.automation_settings?.whatsapp_business_id || '',
        email_enabled: studio.automation_settings?.email_enabled || false,
        sender_email: studio.automation_settings?.sender_email || '',
        preferences: {
            appointment_confirmation: studio.automation_settings?.preferences?.appointment_confirmation ?? true,
            appointment_reminder: studio.automation_settings?.preferences?.appointment_reminder ?? true,
            booking_cancellation: studio.automation_settings?.preferences?.booking_cancellation ?? true
        }
    });

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user?.studio_id) return;
        setSaving(true);
        try {
            await api.settings.updateStudio(user.studio_id, {
                automation_settings: settings
            });
            onUpdate();
            alert('Impostazioni salvate con successo!');
        } catch (error) {
            console.error(error);
            alert(`Errore durante il salvataggio: ${(error as any).message || 'Dettagli sconosciuti'}`);
        } finally {
            setSaving(false);
        }
    };

    const togglePreference = (key: keyof typeof settings.preferences) => {
        setSettings(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: !prev.preferences[key]
            }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                    Comunicazioni Automatiche (Opzionale)
                </h3>
                <p className="text-sm text-text-muted mb-6">
                    Invia automaticamente conferme e promemoria via WhatsApp Business o Email.
                    Le comunicazioni manuali via WhatsApp resteranno sempre attive.
                </p>

                {/* WhatsApp Business Section */}
                <div className={clsx(
                    "p-6 rounded-xl border mb-6 transition-all relative overflow-hidden",
                    hasActiveSubscription ? "bg-bg-tertiary border-border" : "bg-bg-secondary border-border/50 opacity-80"
                )}>
                    {!hasActiveSubscription && (
                        <div className="absolute inset-0 z-10 bg-bg-primary/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-bg-secondary p-4 rounded-full mb-3 shadow-lg">
                                <Lock className="text-accent" size={24} />
                            </div>
                            <h4 className="font-bold text-text-primary mb-1">Disponibile con Piano PRO</h4>
                            <p className="text-sm text-text-muted mb-4 max-w-xs">Aggiorna il tuo abbonamento per automatizzare i messaggi WhatsApp e Email.</p>
                            <button className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
                                Vedi Piani
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary">WhatsApp Business API</h4>
                                <p className="text-xs text-text-muted">Messaggi automatici dal numero dello studio.</p>
                            </div>
                        </div>
                        <div className="flex items-center h-6">
                            <input
                                type="checkbox"
                                checked={settings.whatsapp_enabled}
                                onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                                disabled={!hasActiveSubscription}
                                className="toggle-checkbox"
                            />
                        </div>
                    </div>

                    {settings.whatsapp_enabled && hasActiveSubscription && (
                        <div className="animate-in fade-in slide-in-from-top-2 ml-14 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">WhatsApp Business Account ID</label>
                                <input
                                    type="text"
                                    value={settings.whatsapp_business_id || ''}
                                    onChange={(e) => setSettings({ ...settings, whatsapp_business_id: e.target.value })}
                                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
                                    placeholder="ES: 10039483..."
                                />
                                <p className="text-[10px] text-text-muted mt-1">Trovi questo ID nel tuo pannello Meta Business Manager.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Email Automation Section */}
                <div className={clsx(
                    "p-6 rounded-xl border mb-6 transition-all relative overflow-hidden",
                    hasActiveSubscription ? "bg-bg-tertiary border-border" : "bg-bg-secondary border-border/50 opacity-80"
                )}>
                    {hasActiveSubscription && (
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-primary">Reminder Email</h4>
                                    <p className="text-xs text-text-muted">Invia email di promemoria automatiche.</p>
                                </div>
                            </div>
                            <div className="flex items-center h-6">
                                <input
                                    type="checkbox"
                                    checked={settings.email_enabled}
                                    onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
                                    disabled={!hasActiveSubscription}
                                    className="toggle-checkbox"
                                />
                            </div>
                        </div>
                    )}

                    {/* Render Lock separately if needed, or handle above */}

                    {settings.email_enabled && hasActiveSubscription && (
                        <div className="animate-in fade-in slide-in-from-top-2 ml-14 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">
                                    Email Mittente (Reply-To) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={settings.sender_email || ''}
                                    onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })}
                                    placeholder="es. info@tuostudio.com"
                                    className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent outline-none"
                                />
                                <p className="text-[10px] text-text-muted mt-1">
                                    I clienti vedranno questa email se cliccano su "Rispondi".
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preferences Section (Only visible if enabled) */}
                {(settings.whatsapp_enabled || settings.email_enabled) && hasActiveSubscription && (
                    <div className="bg-bg-secondary p-6 rounded-xl border border-border animate-in fade-in">
                        <h4 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-wider">Eventi Attivati</h4>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={settings.preferences.appointment_confirmation}
                                    onChange={() => togglePreference('appointment_confirmation')}
                                    className="w-4 h-4 rounded border-border bg-bg-primary text-accent focus:ring-accent"
                                />
                                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Conferma Prenotazione (immediata)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={settings.preferences.appointment_reminder}
                                    onChange={() => togglePreference('appointment_reminder')}
                                    className="w-4 h-4 rounded border-border bg-bg-primary text-accent focus:ring-accent"
                                />
                                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Reminder Appuntamento (24h prima)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={settings.preferences.booking_cancellation}
                                    onChange={() => togglePreference('booking_cancellation')}
                                    className="w-4 h-4 rounded border-border bg-bg-primary text-accent focus:ring-accent"
                                />
                                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Notifica Cancellazione</span>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Save size={18} />
                                {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
