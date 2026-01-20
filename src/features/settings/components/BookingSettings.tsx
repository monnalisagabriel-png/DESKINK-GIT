import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Link as LinkIcon, Download, User as UserIcon, Check, BookOpen, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../../services/api';
import type { Service, User } from '../../../services/types';
import { QRCodeSVG } from 'qrcode.react';

export const BookingSettings: React.FC = () => {
    const { user } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [artists, setArtists] = useState<User[]>([]);
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<Service | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Hub Link State
    const hubUrl = `${window.location.origin}/connect/${user?.studio_id}`;

    // Selected Artist Settings
    const [isArtistPublicEnabled, setIsArtistPublicEnabled] = useState(false);
    const [workStart, setWorkStart] = useState<string>("10:00");
    const [workEnd, setWorkEnd] = useState<string>("19:00");
    const [daysOff, setDaysOff] = useState<number[]>([0, 1]); // Sunday (0), Monday (1) default

    // Public Profile State
    const [bio, setBio] = useState('');
    const [styles, setStyles] = useState<string[]>([]);
    const [excludedStyles, setExcludedStyles] = useState<string[]>([]);
    const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
    const [newStyle, setNewStyle] = useState('');
    const [newExcludedStyle, setNewExcludedStyle] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Form Stats
    const [formData, setFormData] = useState<Partial<Service>>({
        name: '',
        duration: 60,
        price: 0,
        deposit_amount: 0,
        is_active: true
    });

    useEffect(() => {
        if (user?.studio_id) {
            loadArtists();
        }
    }, [user?.studio_id]);

    useEffect(() => {
        if (selectedArtistId) {
            loadArtistSettings(selectedArtistId);
            fetchServices(selectedArtistId);
        } else if (artists.length > 0) {
            // Default to first artist if none selected
            setSelectedArtistId(artists[0].id);
        }
    }, [selectedArtistId, artists]);

    const loadArtists = async () => {
        if (!user?.studio_id) return;
        try {
            const team = await api.settings.listTeamMembers(user.studio_id);
            // Filter only artists (exclude owners/managers from this list unless they are artists)
            const validArtists = team.filter(m => m.role === 'artist');
            setArtists(validArtists);

            // Should select current user if in list, otherwise first one
            if (validArtists.length > 0) {
                const myself = validArtists.find(a => a.id === user.id);
                setSelectedArtistId(myself ? myself.id : validArtists[0].id);
            }
        } catch (err) {
            console.error('Error loading artists:', err);
        }
    };

    const loadArtistSettings = async (artistId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('is_public_booking_enabled, availability, bio, styles, excluded_styles, portfolio_photos')
                .eq('id', artistId)
                .single();

            if (error) throw error;

            setIsArtistPublicEnabled(data.is_public_booking_enabled || false);

            if (data.availability) {
                const avail = data.availability as any;
                setWorkStart(avail.work_start || "10:00");
                setWorkEnd(avail.work_end || "19:00");
                setDaysOff(avail.days_off || []);
            } else {
                // Defaults
                setWorkStart("10:00");
                setWorkEnd("19:00");
                setDaysOff([0, 1]);
            }

            // Load Profile Data
            setBio(data.bio || '');
            setStyles(data.styles || []);
            setExcludedStyles(data.excluded_styles || []);
            setPortfolioPhotos(data.portfolio_photos || []);

        } catch (err) {
            console.error('Error loading artist settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!selectedArtistId) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('users').update({
                bio,
                styles,
                excluded_styles: excludedStyles,
                portfolio_photos: portfolioPhotos
            }).eq('id', selectedArtistId);

            if (error) throw error;
            alert('Profilo aggiornato con successo!');
        } catch (err) {
            console.error('Error saving profile:', err);
            alert('Errore nel salvataggio del profilo');
        } finally {
            setLoading(false);
        }
    };

    const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedArtistId || !e.target.files || !e.target.files[0]) return;
        if (portfolioPhotos.length >= 3) {
            alert("Puoi caricare massimo 3 foto.");
            return;
        }

        setIsUploading(true);
        const file = e.target.files[0];
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `portfolio/${selectedArtistId}/${Date.now()}_${sanitizedName}`;

        try {
            const publicUrl = await api.storage.upload('avatars', path, file);
            setPortfolioPhotos(prev => [...prev, publicUrl]);
        } catch (error: any) {
            console.error('Failed to upload photo:', error);
            alert('Errore caricamento foto: ' + (error.message || error.error_description));
        } finally {
            setIsUploading(false);
        }
    };

    const addStyle = () => {
        if (newStyle && !styles.includes(newStyle)) {
            setStyles([...styles, newStyle]);
            setNewStyle('');
        }
    };

    const addExcludedStyle = () => {
        if (newExcludedStyle && !excludedStyles.includes(newExcludedStyle)) {
            setExcludedStyles([...excludedStyles, newExcludedStyle]);
            setNewExcludedStyle('');
        }
    };

    const fetchServices = async (artistId: string) => {
        if (!user?.studio_id) return;
        try {
            // Updated to filter by artist_id
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('studio_id', user.studio_id)
                .eq('artist_id', artistId)
                .order('name');

            if (error) throw error;
            setServices(data || []);
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const handleSaveAvailability = async () => {
        if (!selectedArtistId) return;
        try {
            // 1. Update Availability JSON
            const availability = {
                work_start: workStart,
                work_end: workEnd,
                days_off: daysOff
            };

            const { error: availError } = await supabase
                .from('users')
                .update({ availability })
                .eq('id', selectedArtistId);

            if (availError) throw availError;

            alert("Impostazioni aggiornate con successo!");

        } catch (err) {
            console.error("Error saving settings:", err);
            alert("Errore nel salvataggio.");
        }
    };

    const handleToggleOnlineBooking = async (enabled: boolean) => {
        if (!selectedArtistId) return;
        try {
            const { error } = await supabase
                .from('users')
                .update({ is_public_booking_enabled: enabled })
                .eq('id', selectedArtistId);

            if (error) throw error;
            setIsArtistPublicEnabled(enabled);
        } catch (err) {
            console.error("Error toggling booking:", err);
            alert("Errore durante l'aggiornamento.");
        }
    };

    const handleSaveService = async () => {
        if (!user?.studio_id || !selectedArtistId) return;
        try {
            const serviceData = {
                ...formData,
                studio_id: user.studio_id,
                artist_id: selectedArtistId // Bind to selected artist
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
            fetchServices(selectedArtistId);
        } catch (err) {
            console.error('Error saving service:', err);
            alert('Errore nel salvataggio del servizio');
        }
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm('Sei sicuro di voler eliminare questo servizio?') || !selectedArtistId) return;
        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
            fetchServices(selectedArtistId);
        } catch (err) {
            console.error('Error deleting service:', err);
        }
    };

    const handleEditService = (service: Service) => {
        setIsEditing(service);
        setFormData(service);
        setShowForm(true);
    };

    const toggleDayOff = (day: number) => {
        setDaysOff(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const downloadQR = (elementId: string) => {
        const svg = document.getElementById(elementId);
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
            downloadLink.download = `${elementId}.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const selectedArtist = artists.find(a => a.id === selectedArtistId);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Prenotazioni Pubbliche</h2>
                    <p className="text-text-secondary">Gestisci il link unificato e la configurazione per ogni tatuatore.</p>
                </div>
            </div>

            {/* Public Hub Section */}
            <div className="bg-bg-secondary p-4 md:p-6 rounded-lg border border-border">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded">HUB UNIFICATO</span>
                            <h3 className="text-lg font-bold text-text-primary">Link unico per i Clienti</h3>
                        </div>
                        <p className="text-sm text-text-secondary">
                            Usa questo link su Instagram e Social Media. Include: <strong>Registrazione</strong>, <strong>Lista d'Attesa</strong> e <strong>Prenotazione Online</strong>.
                        </p>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 bg-bg-tertiary rounded border border-border overflow-hidden">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <LinkIcon size={16} className="text-text-muted flex-shrink-0" />
                                <a
                                    href={hubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-accent break-all hover:underline decoration-dotted"
                                >
                                    {hubUrl}
                                </a>
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(hubUrl)}
                                className="flex items-center justify-center gap-2 text-xs bg-bg-primary px-4 py-2 md:py-1.5 rounded border border-border hover:bg-bg-secondary text-text-primary flex-shrink-0 font-medium whitespace-nowrap transition-colors"
                            >
                                <span className="md:hidden">Copia Link</span>
                                <span className="hidden md:inline">Copia</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-white p-2 rounded">
                            <QRCodeSVG id="hub-qr" value={hubUrl} size={120} />
                        </div>
                        <button onClick={() => downloadQR('hub-qr')} className="flex items-center gap-1 text-sm text-accent hover:underline">
                            <Download size={14} /> Scarica QR
                        </button>
                    </div>
                </div>
            </div>

            <hr className="border-border/50" />

            {/* ARTIST SETTINGS SECTION */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <UserIcon className="text-accent" />
                        Configurazione Tatuatore
                    </h3>

                    {/* Artist Selector */}
                    <div className="relative min-w-[250px]">
                        <select
                            value={selectedArtistId || ''}
                            onChange={(e) => setSelectedArtistId(e.target.value)}
                            className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2 text-text-primary focus:border-accent appearance-none cursor-pointer"
                        >
                            {artists.map(artist => (
                                <option key={artist.id} value={artist.id}>
                                    {artist.full_name || artist.email}
                                </option>
                            ))}
                        </select>
                        <UserIcon size={16} className="absolute right-3 top-3 text-text-secondary pointer-events-none" />
                    </div>
                </div>

                {!selectedArtistId ? (
                    <div className="p-8 text-center bg-bg-secondary rounded-xl border border-border border-dashed text-text-muted">
                        Seleziona un tatuatore per configurare le sue impostazioni.
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* 1. ENABLE ONLINE BOOKING */}
                        <div className="bg-bg-secondary p-6 rounded-xl border border-border flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-text-primary mb-1">Prenotazione Online</h4>
                                <p className="text-sm text-text-secondary">Abilita o disabilita la possibilità di prenotare questo artista online.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isArtistPublicEnabled}
                                    onChange={(e) => handleToggleOnlineBooking(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-700/50 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>

                        {/* 2. AVAILABILITY */}
                        <div className="bg-bg-secondary p-6 rounded-xl border border-border">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">Orari & Disponibilità</h3>
                                    <p className="text-sm text-text-secondary">Definisci i giorni di riposo e gli orari di lavoro per <strong>{selectedArtist?.full_name}</strong>.</p>
                                </div>
                                <button
                                    onClick={handleSaveAvailability}
                                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                    <Check size={16} /> Salva Disponibilità
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* WORK HOURS */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-text-muted mb-1">Inizio Lavoro</label>
                                            <input
                                                type="time"
                                                value={workStart}
                                                onChange={e => setWorkStart(e.target.value)}
                                                className="w-full bg-bg-tertiary border border-border rounded p-2 text-text-primary"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-text-muted mb-1">Fine Lavoro</label>
                                            <input
                                                type="time"
                                                value={workEnd}
                                                onChange={e => setWorkEnd(e.target.value)}
                                                className="w-full bg-bg-tertiary border border-border rounded p-2 text-text-primary"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-xs">
                                        Gli orari di inizio e fine definiscono la finestra temporale giornaliera in cui è possibile prenotare appuntamenti.
                                    </div>
                                </div>

                                {/* DAYS OFF */}
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
                                    <p className="text-xs text-text-muted mt-2">I giorni in rosso non saranno prenotabili.</p>
                                </div>
                            </div>



                        </div>



                        {/* 3. PUBLIC PROFILE & PORTFOLIO */}
                        <div className="bg-bg-secondary p-6 rounded-xl border border-border">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                        <BookOpen size={18} className="text-accent" /> Profilo & Portfolio
                                    </h3>
                                    <p className="text-sm text-text-secondary">Configura come appare questo artista nella pagina di prenotazione.</p>
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                    <Save size={16} /> Salva Profilo
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* BIO */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Bio / Descrizione</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-bg-tertiary border border-border rounded-lg p-3 text-text-primary focus:border-accent outline-none min-h-[100px]"
                                        placeholder="Racconta brevemente lo stile e l'esperienza..."
                                    />
                                </div>

                                {/* STYLES */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Stili Eseguiti</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newStyle}
                                                onChange={(e) => setNewStyle(e.target.value)}
                                                className="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none"
                                                placeholder="es. Realistico"
                                            />
                                            <button onClick={addStyle} className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark">+</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {styles.map(style => (
                                                <span key={style} className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs flex items-center gap-1 border border-green-500/20">
                                                    {style}
                                                    <button onClick={() => setStyles(styles.filter(s => s !== style))} className="hover:text-white">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Stili NON Eseguiti</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newExcludedStyle}
                                                onChange={(e) => setNewExcludedStyle(e.target.value)}
                                                className="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-accent outline-none"
                                                placeholder="es. Maorì"
                                            />
                                            <button onClick={addExcludedStyle} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">+</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {excludedStyles.map(style => (
                                                <span key={style} className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs flex items-center gap-1 border border-red-500/20">
                                                    {style}
                                                    <button onClick={() => setExcludedStyles(excludedStyles.filter(s => s !== style))} className="hover:text-white">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* PORTFOLIO */}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Foto Lavori (Max 3)</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {portfolioPhotos.map((photo, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-border bg-bg-tertiary">
                                                <img src={photo} alt="Portfolio" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setPortfolioPhotos(portfolioPhotos.filter(p => p !== photo))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {portfolioPhotos.length < 3 && (
                                            <label className="aspect-square bg-bg-tertiary border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-all group">
                                                {isUploading ? (
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                                                ) : (
                                                    <>
                                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2 group-hover:bg-accent group-hover:text-white transition-colors">
                                                            <Plus size={18} />
                                                        </div>
                                                        <span className="text-xs text-text-muted group-hover:text-text-primary">Aggiungi Foto</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={handlePortfolioUpload} disabled={isUploading} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. SERVICES */}
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">Listino Servizi - {selectedArtist?.full_name}</h3>
                                    <p className="text-sm text-text-secondary">Servizi specifici offerti da questo tatuatore.</p>
                                </div>
                                <button
                                    onClick={() => { setShowForm(true); setIsEditing(null); setFormData({ name: '', duration: 60, price: 0, deposit_amount: 0, is_active: true }); }}
                                    className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors"
                                >
                                    <Plus size={18} /> Nuovo Servizio
                                </button>
                            </div>

                            {/* SERVICE FORM */}
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
                                        <button onClick={handleSaveService} className="bg-accent text-white px-4 py-2 rounded">Salva per {selectedArtist?.full_name}</button>
                                    </div>
                                </div>
                            )}

                            {/* SERVICES TABLE */}
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
                                                        <button onClick={() => handleEditService(service)} className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteService(service.id)} className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {services.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-text-muted">
                                                    Nessun servizio configurato per {selectedArtist?.full_name}.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

