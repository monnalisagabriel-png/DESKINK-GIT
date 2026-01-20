import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, TrendingUp,
    Clock, CheckCircle, ChevronRight,
    DollarSign, FileText, BookOpen,
    Eye, EyeOff, X, UserCheck, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { StatsCard } from './components/StatsCard';
import { api } from '../../services/api';
import type { Appointment, Studio, Course, CourseEnrollment } from '../../services/types';
import { format, addWeeks, startOfDay, endOfWeek, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { useRealtime } from '../../hooks/useRealtime';
import { it } from 'date-fns/locale';
import { useLayoutStore } from '../../stores/layoutStore';
import { BookingRequests } from './components/BookingRequests';
import clsx from 'clsx';

interface DashboardStats {
    revenue_today: number;
    revenue_month: number;
    waitlist_count: number;
    staff_present: number;
    staff_total: number;
}

export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isPrivacyMode, togglePrivacyMode } = useLayoutStore();

    // -- State Definitions --
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        revenue_today: 0,
        revenue_month: 0,
        waitlist_count: 0,
        staff_present: 0,
        staff_total: 0
    });

    const [artistRealEarnings, setArtistRealEarnings] = useState(0);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [studio, setStudio] = useState<Studio | null>(null);

    // Student State
    const [studentCourse, setStudentCourse] = useState<Course | null>(null);
    const [studentEnrollment, setStudentEnrollment] = useState<CourseEnrollment | null>(null);

    // UI State
    const [isTermsViewOpen, setIsTermsViewOpen] = useState(false);
    const [viewTermsContent, setViewTermsContent] = useState('');

    const loadDashboardData = async () => {
        if (!user) return;
        try {
            if (user.role === 'STUDENT' || user.role === 'student') {
                const courses = await api.academy.listCourses();
                const enrolledCourse = courses.find(c => c.student_ids.includes(user.id));

                if (enrolledCourse) {
                    setStudentCourse(enrolledCourse);
                    const enroll = await api.academy.getEnrollment(enrolledCourse.id, user.id);
                    setStudentEnrollment(enroll);
                }
            }

            if (user.studio_id) {
                const s = await api.settings.getStudio(user.studio_id);
                setStudio(s);
                if (s && (user.role === 'STUDENT' || user.role === 'student') && s.academy_terms) {
                    setViewTermsContent(s.academy_terms);
                }
            }

            const today = startOfDay(new Date());
            const endNextWeek = endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
            const isArtist = user.role === 'ARTIST' || user.role === 'artist';
            const artistIdFilter = isArtist ? user.id : undefined;

            const appts = await api.appointments.list(today, endNextWeek, artistIdFilter, user.studio_id);
            const validAppts = appts.filter(a => !['CANCELLED', 'REJECTED', 'DECLINED'].includes(a.status));

            const enhancedAppts = await Promise.all(validAppts.map(async (appt) => {
                if (appt.client) return appt;
                const client = await api.clients.getById(appt.client_id);
                return { ...appt, client: client || undefined };
            }));

            // Sort by time
            enhancedAppts.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
            setAppointments(enhancedAppts);

            // Fetch Real Earnings from Transactions (Artist Only)
            if (isArtist) {
                const startMonth = startOfMonth(today);
                const endMonth = endOfMonth(today);
                const txs = await api.financials.listTransactions(startMonth, endMonth, user.studio_id);
                const myTxs = txs.filter(t => t.artist_id === user.id && t.type === 'INCOME');
                const gross = myTxs.reduce((sum, t) => sum + Number(t.amount), 0);

                const contract = await api.artists.getContract(user.id);
                const rate = contract?.commission_rate || 50;
                const net = (gross * rate) / 100;

                setArtistRealEarnings(net);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.id) loadDashboardData();
    }, [user, user?.id, user?.role, user?.studio_id]);

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;
            if (user.role === 'owner' || user.role === 'STUDIO_ADMIN' || user.role === 'MANAGER') {
                try {
                    if (!user.studio_id) return;
                    const fStats = await api.financials.getStats(new Date(), user.studio_id);
                    let wCount = 0;
                    if (user.studio_id) {
                        const wList = await api.waitlist.list(user.studio_id);
                        wCount = wList.filter(w => w.status === 'PENDING').length;
                    }

                    let sPresent = 0;
                    let sTotal = 0;
                    if (user.studio_id) {
                        const team = await api.settings.listTeamMembers(user.studio_id);
                        sTotal = team.length;
                        sPresent = team.length;
                    }

                    setStats({
                        revenue_today: fStats.revenue_today,
                        revenue_month: fStats.revenue_month,
                        waitlist_count: wCount,
                        staff_present: sPresent,
                        staff_total: sTotal
                    });
                } catch (e) {
                    console.error('Stats load error', e);
                }
            }
        };
        loadStats();
    }, [user]);

    // -- Realtime Hooks --
    useRealtime('appointments', () => {
        console.log('Realtime: refreshing appointments');
        loadDashboardData();
    });

    useRealtime('waitlist_entries', () => {
        if (user?.role === 'owner' || user?.role === 'MANAGER') {
            loadDashboardData();
        }
    });

    useRealtime('transactions', () => {
        if (user?.role === 'owner' || user?.role === 'MANAGER') {
            loadDashboardData();
        }
    });

    const sendWhatsAppReminder = (appt: Appointment, type: 'WEEK_NOTICE' | 'CONFIRMATION') => {
        if (!appt.client?.phone) {
            alert('Numero di telefono non disponibile per questo cliente.');
            return;
        }

        const dateStr = format(parseISO(appt.start_time), "d MMMM", { locale: it });
        const timeStr = format(parseISO(appt.start_time), "HH:mm");
        const studioName = studio?.name || "InkFlow Studio";
        const location = studio ? `${studio.address}, ${studio.city}` : "Via Loreto Balatelle, 208, Acireale";

        let message = '';
        if (type === 'WEEK_NOTICE') {
            message = `Ciao ${appt.client.full_name},\nti ricordiamo il tuo appuntamento per il ${dateStr} ${timeStr} presso ${studioName} (${location}).\nTi invitiamo a rispondere a questo messaggio per confermare, altrimenti il tuo appuntamento potrebbe subire variazioni o cancellazioni.\nA presto!`;
        } else {
            // Confirmation message (slightly different or generic)
            message = `Ciao ${appt.client.full_name},\nconfermiamo il tuo appuntamento per il ${dateStr} ${timeStr} presso ${studioName} (${location}).\nA presto!`;
        }

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${appt.client.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
    };

    if (!user) return <div className="p-8 text-center text-text-muted">Caricamento utente...</div>;

    const renderAdminWidgets = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Incasso Oggi"
                    value={`€ ${stats.revenue_today.toLocaleString()}`}
                    icon={DollarSign}
                    change="12%"
                    isPositive={true}
                    color="cyan"
                />
                <StatsCard
                    title="Incasso Mese"
                    value={`€ ${stats.revenue_month.toLocaleString()}`}
                    icon={TrendingUp}
                    change="8%"
                    isPositive={true}
                    color="purple"
                />
                <StatsCard
                    title="Waitlist"
                    value={stats.waitlist_count.toString()}
                    icon={Users}
                    color="pink"
                />
                <StatsCard
                    title="Staff Presente"
                    value={`${stats.staff_present}/${stats.staff_total}`}
                    icon={UserCheck}
                    color="orange"
                />
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-text-primary mb-4">Richieste Appuntamenti</h2>
                <div className="bg-bg-secondary rounded-xl border border-border p-4 shadow-sm">
                    <BookingRequests appointments={appointments} onUpdate={loadDashboardData} />
                </div>
            </div>
        </>
    );

    const renderArtistWidgets = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Prossimo Appuntamento"
                    value={appointments.length > 0 ? format(parseISO(appointments[0].start_time), "HH:mm") : "--:--"}
                    icon={Clock}
                    color="cyan"
                />
                <StatsCard
                    title="Appuntamenti Oggi"
                    value={appointments.length.toString()}
                    icon={Calendar}
                    color="purple"
                />
                <StatsCard
                    title="I Tuoi Guadagni (Mese)"
                    value={isPrivacyMode ? "****" : `€ ${artistRealEarnings.toLocaleString()}`}
                    icon={DollarSign}
                    color="green"
                />
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-text-primary mb-4">Richieste in Sospeso</h2>
                <div className="bg-bg-secondary rounded-xl border border-border p-4 shadow-sm">
                    <BookingRequests appointments={appointments} onUpdate={loadDashboardData} />
                </div>
            </div>
        </>
    );

    const renderStudentWidgets = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
                title="Il Tuo Corso"
                value={studentCourse?.title || "Nessun Corso"}
                icon={BookOpen}
                color="cyan"
            />
            <StatsCard
                title="Giorni Frequentati"
                value={studentEnrollment ? `${studentEnrollment.attended_days} / ${studentEnrollment.allowed_days}` : "0 / 0"}
                icon={CheckCircle}
                color="purple"
            />
        </div>
    );

    return (
        <div className="w-full p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <LayoutDashboard className="text-accent" size={32} />
                        Dashboard
                    </h1>
                    <p className="text-text-muted mt-1">
                        Bentornato, {user.full_name}
                    </p>
                </div>

                <div className="flex items-center gap-3 min-w-max">
                    <button
                        onClick={togglePrivacyMode}
                        className="p-2.5 bg-bg-secondary border border-border rounded-lg hover:border-accent/50 text-text-muted hover:text-text-primary transition-all"
                        title={isPrivacyMode ? "Mostra valori" : "Nascondi valori"}
                    >
                        {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {(user.role === 'STUDENT' || user.role === 'student') && studio?.academy_terms && (
                        <button
                            onClick={() => {
                                setViewTermsContent(studio.academy_terms || '');
                                setIsTermsViewOpen(true);
                            }}
                            className="bg-bg-secondary border border-border hover:border-cyan-500/50 text-cyan-500 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium"
                        >
                            <FileText size={18} />
                            <span>Regolamento</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Widgets Sections */}
            {(user.role === 'owner' || user.role === 'MANAGER' || user.role === 'STUDIO_ADMIN') && renderAdminWidgets()}
            {(user.role === 'ARTIST' || user.role === 'artist') && renderArtistWidgets()}
            {(user.role === 'STUDENT' || user.role === 'student') && renderStudentWidgets()}


            {/* Main Content Area - Appointments List */}
            <div className="bg-bg-secondary rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <Calendar className="text-accent" />
                        Appuntamenti di Oggi
                    </h2>
                    <button
                        onClick={() => navigate('/calendar')}
                        className="text-sm text-text-muted hover:text-accent flex items-center gap-1 transition-colors font-medium"
                    >
                        Vedi Calendario <ChevronRight size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-text-muted animate-pulse">Caricamento appuntamenti...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-16 bg-bg-tertiary/50 rounded-xl border border-dashed border-border group hover:border-accent/30 transition-colors">
                        <div className="bg-bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border group-hover:scale-110 transition-transform">
                            <Calendar size={32} className="text-text-muted group-hover:text-accent transition-colors" />
                        </div>
                        <p className="text-text-muted font-medium">Nessun appuntamento in programma per oggi</p>
                        <button
                            onClick={() => navigate('/calendar')}
                            className="mt-4 text-accent hover:underline font-medium text-sm"
                        >
                            Vai al calendario
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appt) => (
                            <div
                                key={appt.id}
                                className="bg-bg-tertiary p-4 rounded-xl border border-border hover:border-accent/50 transition-all group flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                            >
                                <div className="flex items-start md:items-center gap-4 w-full">
                                    <div className="flex flex-col items-center justify-center bg-bg-primary min-w-[3.5rem] h-14 rounded-lg border border-border group-hover:border-accent/30 transition-colors">
                                        <span className="text-lg font-bold text-text-primary">
                                            {format(parseISO(appt.start_time), 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-text-primary group-hover:text-accent transition-colors truncate">
                                            {appt.client?.full_name || 'Cliente Occasionale'}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 text-text-muted text-sm mt-1">
                                            <span className="px-2 py-0.5 rounded-md bg-bg-primary border border-border text-xs font-medium truncate max-w-[150px]">
                                                {appt.service_name}
                                            </span>
                                            {appt.notes && (
                                                <span className="text-text-muted truncate max-w-[200px] text-xs flex items-center gap-1">
                                                    <FileText size={10} /> {appt.notes}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto justify-end mt-2 md:mt-0">
                                    {appt.client?.phone && (
                                        <button
                                            onClick={() => sendWhatsAppReminder(appt, 'WEEK_NOTICE')}
                                            className="p-2 hover:bg-green-500/10 text-text-muted hover:text-green-500 rounded-lg transition-colors border border-transparent hover:border-green-500/20"
                                            title="Invia promemoria WhatsApp"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
                                        </button>
                                    )}
                                    <div className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider",
                                        {
                                            'bg-green-500/10 text-green-500 border-green-500/20': appt.status === 'CONFIRMED',
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20': appt.status === 'PENDING',
                                            'bg-blue-500/10 text-blue-500 border-blue-500/20': appt.status === 'COMPLETED',
                                            'bg-red-500/10 text-red-500 border-red-500/20': appt.status === 'CANCELLED'
                                        }
                                    )}>
                                        {appt.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Terms Modal */}
            {isTermsViewOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-bg-secondary rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-border shadow-2xl scale-100 animate-in zoom-in-95">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-bold text-accent flex items-center gap-2">
                                <FileText size={24} />
                                Regolamento Accademia
                            </h2>
                            <button
                                onClick={() => setIsTermsViewOpen(false)}
                                className="p-2 hover:bg-bg-tertiary rounded-full text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="prose prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-text-secondary leading-relaxed text-sm">
                                    {viewTermsContent || "Nessun regolamento disponibile."}
                                </pre>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end">
                            <button
                                onClick={() => setIsTermsViewOpen(false)}
                                className="px-6 py-2 bg-bg-tertiary hover:bg-bg-primary text-text-primary border border-border rounded-lg transition-colors font-medium"
                            >
                                Chiudi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
