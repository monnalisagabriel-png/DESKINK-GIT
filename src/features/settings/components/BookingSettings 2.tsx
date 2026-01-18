
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Link as LinkIcon, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';
import type { Service } from '../../../services/types';
import { QRCodeSVG } from 'qrcode.react';

export const BookingSettings: React.FC = () => {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<Service | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Studio Settings State
    const [isPublicEnabled, setIsPublicEnabled] = useState(false);
    const [stripeEnabled, setStripeEnabled] = useState(false);
    const [currency, setCurrency] = useState('EUR');

    // Form Stats
    const [formData, setFormData] = useState<Partial<Service>>({
        name: '',
        duration: 60,
        price: 0,
        deposit_amount: 0,
        is_active: true
    });

    const publicUrl = `${window.location.origin}/book/${user?.studio_id}`;

    useEffect(() => {
        if (user?.studio_id) {
            fetchServices();
            loadStudioSettings();
        }
    }, [user?.studio_id]);

    const loadStudioSettings = async () => {
        if (!user?.studio_id) return;
        try {
            const { data } = await supabase
                .from('studios')
                .select('public_booking_settings')
                .eq('id', user.studio_id)
                .single();

            if (data?.public_booking_settings) {
                const settings = data.public_booking_settings;
                setIsPublicEnabled(settings.enabled || false);
                setStripeEnabled(settings.stripe_enabled || false);
                setCurrency(settings.deposit_currency || 'EUR');
            }
        } catch (error) {
            console.error('Error loading studio settings:', error);
        }
    };

    const fetchServices = async () => {
        if (!user?.studio_id) return;
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('studio_id', user.studio_id)
                .order('name');

            if (error) throw error;
            setServices(data || []);
        } catch (err) {
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStudioSettings = async (updates: any) => {
        if (!user?.studio_id) return;
        try {
            const newSettings = {
                enabled: updates.enabled !== undefined ? updates.enabled : isPublicEnabled,
                stripe_enabled: updates.stripe_enabled !== undefined ? updates.stripe_enabled : stripeEnabled,
                deposit_currency: updates.deposit_currency || currency
            };

            const { error } = await supabase
                .from('studios')
                .update({ public_booking_settings: newSettings })
                .eq('id', user.studio_id);

            if (error) throw error;

            // Update local state
            if (updates.enabled !== undefined) setIsPublicEnabled(updates.enabled);
            if (updates.stripe_enabled !== undefined) setStripeEnabled(updates.stripe_enabled);
            if (updates.deposit_currency) setCurrency(updates.deposit_currency);

        } catch (error) {
            console.error('Failed to update settings:', error);
            alert('Errore durante l\'aggiornamento delle impostazioni.');
        }
    };

    const handleSaveService = async () => {
        if (!user?.studio_id) return;
        try {
            const serviceData = {
                ...formData,
                studio_id: user.studio_id
            };

            let error;
            if (isEditing) {
                const { error: err } = await supabase
                    .from('services')
                    .update(serviceData)
                    .eq('id', isEditing.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('services')
                    .insert([serviceData]);
                error = err;
            }

            if (error) throw error;

            setShowForm(false);
            setIsEditing(null);
            setFormData({ name: '', duration: 60, price: 0, deposit_amount: 0, is_active: true });
            fetchServices();
        } catch (err) {
            console.error('Error saving service:', err);
            alert('Errore nel salvataggio del servizio');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Sei sicuro di voler eliminare questo servizio?')) return;
        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
            fetchServices();
        } catch (err) {
            console.error('Error deleting service:', err);
        }
    };

    const handleEdit = (service: Service) => {
        setIsEditing(service);
        setFormData(service);
        setShowForm(true);
    };

    const handleTogglePublicBooking = async (enabled: boolean) => {
        if (!user?.studio_id) return;
        try {
            await updateStudioSettings({
                enabled,
                stripe_enabled: stripeEnabled, // keep existing
                deposit_currency: currency // keep existing
            });
        } catch (err) {
            console.error(err);
        }
    };

    const downloadQR = () => {
        const svg = document.getElementById("booking-qr");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.download = "booking-qr.png";
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    // Availability State
    const [workStart, setWorkStart] = useState<string>("10:00");
    const [workEnd, setWorkEnd] = useState<string>("19:00");
    const [daysOff, setDaysOff] = useState<number[]>([0, 1]); // Sunday (0), Monday (1) default
    const [defaultSlots, setDefaultSlots] = useState<string[]>(["10:00", "14:00", "16:00"]);

    useEffect(() => {
        if (user?.id) {
            loadAvailability();
        }
    }, [user?.id]);

    const loadAvailability = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('availability')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            if (data?.availability) {
                const avail = data.availability as any;
                if (avail.work_start) setWorkStart(avail.work_start);
                if (avail.work_end) setWorkEnd(avail.work_end);
                if (avail.days_off) setDaysOff(avail.days_off || []);
                if (avail.default_slots) setDefaultSlots(avail.default_slots);
            }
        } catch (err) {
            console.error("Error loading availability:", err);
        }
    };

    const saveAvailability = async () => {
        try {
            const availability = {
                work_start: workStart,
                work_end: workEnd,
                days_off: daysOff,
                default_slots: defaultSlots
            };

            const { error } = await supabase
                .from('users')
                .update({ availability })
                .eq('id', user?.id);

            if (error) throw error;
            alert("Disponibilità aggiornata con successo!");
        } catch (err) {
            console.error("Error saving availability:", err);
            alert("Errore nel salvataggio.");
        }
    };

    const toggleDayOff = (day: number) => {
        setDaysOff(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const addSlot = () => {
        const time = prompt("Inserisci nuovo orario (es. 15:30):");
        if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
            setDefaultSlots(prev => [...prev, time].sort());
        } else if (time) {
            alert("Formato non valido. Usa HH:MM");
        }
    };

    const removeSlot = (slotToRemove: string) => {
        setDefaultSlots(prev => prev.filter(slot => slot !== slotToRemove));
    };



    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Prenotazioni Pubbliche</h2>
                    <p className="text-text-secondary">Gestisci i servizi e il link per le prenotazioni online.</p>
                </div>
            </div>

            {/* Public Link Section */}
            <div className="bg-bg-secondary p-4 md:p-6 rounded-lg border border-border">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text-primary">Link Prenotazione</h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isPublicEnabled}
                                    onChange={(e) => handleTogglePublicBooking(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 bg-bg-tertiary rounded border border-border overflow-hidden">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <LinkIcon size={16} className="text-text-muted flex-shrink-0" />
                                <a
                                    href={publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-accent break-all hover:underline decoration-dotted"
                                >
                                    {publicUrl}
                                </a>
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(publicUrl)}
                                className="flex items-center justify-center gap-2 text-xs bg-bg-primary px-4 py-2 md:py-1.5 rounded border border-border hover:bg-bg-secondary text-text-primary flex-shrink-0 font-medium whitespace-nowrap transition-colors"
                            >
                                <span className="md:hidden">Copia Link</span>
                                <span className="hidden md:inline">Copia</span>
                            </button>
                        </div>

                        <p className="text-sm text-text-secondary">
                            Condividi questo link sui social o stampare il QR Code per permettere ai clienti di prenotare autonomamente.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-white p-2 rounded">
                            <QRCodeSVG id="booking-qr" value={publicUrl} size={150} />
                        </div>
                        <button onClick={downloadQR} className="flex items-center gap-1 text-sm text-accent hover:underline">
                            <Download size={14} /> Scarica PNG
                        </button>
                    </div>
                </div>
            </div>

            {/* Availability Section */}
            <div className="bg-bg-secondary p-4 md:p-6 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">Orari & Disponibilità</h3>
                        <p className="text-sm text-text-secondary">Imposta i giorni di riposo e gli orari standard per gli appuntamenti.</p>
                    </div>
                    <button
                        onClick={saveAvailability}
                        className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors font-medium text-sm"
                    >
                        Salva Disponibilità
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Days Off */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-3">Giorni di Riposo</label>
                        <div className="flex gap-2 flex-wrap">
                            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day, index) => (
                                <button
                                    key={day}
                                    onClick={() => toggleDayOff(index)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                        ${daysOff.includes(index)
                                            ? 'bg-red-500/10 text-red-500 border-2 border-red-500'
                                            : 'bg-bg-tertiary text-text-secondary border border-transparent hover:border-accent'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-text-muted mt-2">I giorni rossi sono considerati di riposo.</p>
                    </div>

                    {/* Slots */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-3">Orari Standard</label>
                        <div className="flex flex-wrap gap-2">
                            {defaultSlots.map(slot => (
                                <div key={slot} className="group relative flex items-center bg-bg-tertiary px-3 py-2 rounded border border-border">
                                    <span className="text-sm font-mono text-text-primary">{slot}</span>
                                    <button
                                        onClick={() => removeSlot(slot)}
                                        className="ml-2 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addSlot}
                                className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-2 rounded border border-transparent hover:border-accent transition-all text-sm font-medium"
                            >
                                <Plus size={14} /> Aggiungi
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Management */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-text-primary">Listino Servizi</h3>
                    <button
                        onClick={() => { setShowForm(true); setIsEditing(null); setFormData({ name: '', duration: 60, price: 0, deposit_amount: 0, is_active: true }); }}
                        className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors"
                    >
                        <Plus size={18} /> Nuovo Servizio
                    </button>
                </div>

                {showForm && (
                    <div className="bg-bg-secondary p-6 rounded-lg border border-border animate-in fade-in slide-in-from-top-4">
                        <h4 className="font-bold text-text-primary mb-4">{isEditing ? 'Modifica Servizio' : 'Nuovo Servizio'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nome Servizio</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-bg-tertiary border border-border rounded p-2 text-text-primary focus:border-accent outline-none"
                                    placeholder="es. Tatuaggio Piccolo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Durata (ore)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.duration ? formData.duration / 60 : ''}
                                    onChange={e => setFormData({ ...formData, duration: Math.round(parseFloat(e.target.value) * 60) })}
                                    className="w-full bg-bg-tertiary border border-border rounded p-2 text-text-primary focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Prezzo Totale (€)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="w-full bg-bg-tertiary border border-border rounded p-2 text-text-primary focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Acconto Richiesto (€)</label>
                                <input
                                    type="number"
                                    value={formData.deposit_amount}
                                    onChange={e => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) })}
                                    className="w-full bg-bg-tertiary border border-border rounded p-2 text-text-primary focus:border-accent outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-text-secondary hover:text-text-primary">Annulla</button>
                            <button onClick={handleSaveService} className="bg-accent text-white px-4 py-2 rounded">Salva</button>
                        </div>
                    </div>
                )}

                <div className="bg-bg-secondary rounded-lg border border-border overflow-hidden overflow-x-auto w-full">
                    <table className="w-full text-left">
                        <thead className="bg-bg-tertiary text-text-secondary text-sm">
                            <tr>
                                <th className="p-3 md:p-4">Nome</th>
                                <th className="hidden md:table-cell p-4">Durata</th>
                                <th className="p-3 md:p-4">Prezzo</th>
                                <th className="hidden md:table-cell p-4">Acconto</th>
                                <th className="hidden md:table-cell p-4">Stato</th>
                                <th className="p-3 md:p-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {services.map(service => (
                                <tr key={service.id} className="hover:bg-bg-tertiary/50">
                                    <td className="p-3 md:p-4 font-medium text-text-primary">
                                        <div>{service.name}</div>
                                        {/* Mobile-only details */}
                                        <div className="md:hidden text-xs text-text-muted mt-0.5 flex gap-2">
                                            <span>{(service.duration || 0) / 60}h</span>
                                            <span className={service.is_active ? "text-green-500" : "text-red-500"}>
                                                • {service.is_active ? 'Attivo' : 'Inattivo'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="hidden md:table-cell p-4 text-text-secondary">{service.duration ? service.duration / 60 : 0} ore</td>
                                    <td className="p-3 md:p-4 text-text-secondary">
                                        €{service.price}
                                        {service.deposit_amount > 0 && <div className="md:hidden text-xs text-green-500">Acc. €{service.deposit_amount}</div>}
                                    </td>
                                    <td className="hidden md:table-cell p-4 text-green-500 font-medium">€{service.deposit_amount}</td>
                                    <td className="hidden md:table-cell p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${service.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {service.is_active ? 'Attivo' : 'Inattivo'}
                                        </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(service)} className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(service.id)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {services.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-text-muted">
                                        Nessun servizio configurato. Aggiungine uno per iniziare.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
