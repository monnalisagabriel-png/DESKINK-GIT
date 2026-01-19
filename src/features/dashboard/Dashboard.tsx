import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, TrendingUp,
    Clock, CheckCircle, ChevronRight,
    DollarSign, FileText, PlayCircle, BookOpen,
    Share2, Eye, EyeOff, X, UserCheck
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { StatsCard } from './components/StatsCard';
import { api } from '../../services/api';
import type { ArtistContract, Appointment, Studio, Course, CourseEnrollment } from '../../services/types';
import { format, addWeeks, startOfDay, endOfWeek, parseISO, isSameWeek, startOfMonth, endOfMonth } from 'date-fns';
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

    // Artist/Owner State
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [contract, setContract] = useState<ArtistContract | null>(null);
    const [studio, setStudio] = useState<Studio | null>(null);

    // Student State
    const [studentCourse, setStudentCourse] = useState<Course | null>(null);
    const [studentEnrollment, setStudentEnrollment] = useState<CourseEnrollment | null>(null);

    // UI State
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isTermsViewOpen, setIsTermsViewOpen] = useState(false);
    const [viewTermsContent, setViewTermsContent] = useState('');

    const loadDashboardData = async () => {
        if (!user) return;
        try {
            if (user.role === 'STUDENT' || user.role === 'student') {
                // Fetch student course
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
                // Pre-load terms if student for the view modal
                if (s && (user.role === 'STUDENT' || user.role === 'student') && s.academy_terms) {
                    setViewTermsContent(s.academy_terms);
                }
            }

            const today = startOfDay(new Date());
            const endNextWeek = endOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });

            // Pass user.studio_id to filter by studio
            // If user is ARTIST, also pass user.id as artistId (3rd arg) to filter their appointments
            const isArtist = user.role === 'ARTIST' || user.role === 'artist';
            if (isArtist) {
                const c = await api.artists.getContract(user.id);
                setContract(c);
            }

            const artistIdFilter = isArtist ? user.id : undefined;
            const appts = await api.appointments.list(today, endNextWeek, artistIdFilter, user.studio_id);

            // Filter out cancelled/rejected appointments
            const validAppts = appts.filter(a => !['CANCELLED', 'REJECTED', 'DECLINED'].includes(a.status));

            const enhancedAppts = await Promise.all(validAppts.map(async (appt) => {
                if (appt.client) return appt;
                const client = await api.clients.getById(appt.client_id);
                return { ...appt, client: client || undefined };
            }));

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
            message = `Ciao ${appt.client.full_name},\nti ricordiamo il tuo appuntamento per il ${dateStr} ${timeStr} presso ${studioName} (${location}).\nTi invitiamo a rispondere a questo messaggio per confermare, altrimenti il tuo appuntamento potrebbe subire variazioni o cancellazioni.\nA presto!`;
        }

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${appt.client.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
    };

    if (!user) return <div className="p-8 text-center text-white">Caricamento utente...</div>;

    const renderAdminWidgets = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Incasso Oggi"
                    value={`€ ${stats.revenue_today.toLocaleString()}`}
                    icon={DollarSign}
                    trend="+12%"
                    color="cyan"
                    onClick={() => navigate('/financials')}
                />
                <StatsCard
                    title="Incasso Mese"
                    value={`€ ${stats.revenue_month.toLocaleString()}`}
                    icon={TrendingUp}
                    trend="+8%"
                    color="purple"
                    onClick={() => navigate('/financials')}
                />
                <StatsCard
                    title="Waitlist"
                    value={stats.waitlist_count.toString()}
                    icon={Users}
                    trend="In attesa"
                    color="pink"
                    onClick={() => navigate('/waitlist')}
                />
                <StatsCard
                    title="Staff Presente"
                    value={`${stats.staff_present}/${stats.staff_total}`}
                    icon={UserCheck}
                    trend="Oggi"
                    color="orange"
                    onClick={() => navigate('/team')}
                />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Richieste Appuntamenti</h2>
                <BookingRequests />
            </div>
        </>
    );

    const renderArtistWidgets = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
                title="Prossimo Appuntamento"
                value={appointments.length > 0 ? format(parseISO(appointments[0].start_time), "HH:mm") : "--:--"}
                icon={Clock}
                trend={appointments.length > 0 ? "Oggi" : "Nessuno"}
                color="cyan"
            />
            <StatsCard
                title="Appuntamenti Oggi"
                value={appointments.length.toString()}
                icon={Calendar}
                trend="Confermati"
                color="purple"
            />
            <StatsCard
                title="I Tuoi Guadagni (Mese)"
                value={isPrivacyMode ? "****" : `€ ${artistRealEarnings.toLocaleString()}`}
                icon={DollarSign}
                trend="Netto (Stimato)"
                color="green"
            />
        </div>
    );

    const renderStudentWidgets = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard
                title="Il Tuo Corso"
                value={studentCourse?.title || "Nessun Corso"}
                icon={BookOpen}
                trend={studentEnrollment?.status === 'ACTIVE' ? "Attivo" : "Non Attivo"}
                color="cyan"
                onClick={() => navigate('/academy')}
            />
            <StatsCard
                title="Lezioni Completate"
                value={studentEnrollment ? `${studentEnrollment.completed_lessons.length} / ${studentCourse?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0}` : "0 / 0"}
                icon={CheckCircle}
                trend="Progresso"
                color="purple"
            />
            {/* Presenze Rimanenti removed as per previous request or kept if relevant, kept simple for now */}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 pb-20 md:pb-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Benvenuto, {user?.full_name}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={togglePrivacyMode}
                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        title={isPrivacyMode ? "Mostra valori" : "Nascondi valori"}
                    >
                        {isPrivacyMode ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
                    </button>
                    {(user.role === 'STUDENT' || user.role === 'student') && studio?.academy_terms && (
                        <button
                            onClick={() => {
                                setViewTermsContent(studio.academy_terms || '');
                                setIsTermsViewOpen(true);
                            }}
                            className="bg-gray-800 hover:bg-gray-700 text-cyan-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <FileText size={18} />
                            <span>Regolamento</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Widgets Section */}
            {(user.role === 'owner' || user.role === 'MANAGER' || user.role === 'STUDIO_ADMIN') && renderAdminWidgets()}
            {(user.role === 'ARTIST' || user.role === 'artist') && renderArtistWidgets()}
            {(user.role === 'STUDENT' || user.role === 'student') && renderStudentWidgets()}


            {/* Main Content Area - Appointments List */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-cyan-400" />
                        Appuntamenti di Oggi
                    </h2>
                    <button
                        onClick={() => navigate('/calendar')}
                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                    >
                        Vedi Calendario <ChevronRight size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-400">Caricamento appuntamenti...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                        <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">Nessun appuntamento in programma per oggi</p>
                        <button
                            onClick={() => navigate('/calendar')}
                            className="mt-4 text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                            Aggiungi Appuntamento
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appt) => (
                            <div
                                key={appt.id}
                                className="bg-gray-900 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center justify-center bg-gray-800 w-16 h-16 rounded-lg border border-gray-700">
                                            <span className="text-xl font-bold text-white">
                                                {format(parseISO(appt.start_time), 'HH:mm')}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {format(parseISO(appt.end_time), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                                                {appt.client?.full_name || 'Cliente Occasionale'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                                <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-600 text-xs">
                                                    {appt.service_id ? 'Servizio' : 'Consulenza'}
                                                </span>
                                                {appt.notes && (
                                                    <span className="text-gray-500 truncate max-w-[200px]">
                                                        • {appt.notes}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => sendWhatsAppReminder(appt, 'WEEK_NOTICE')}
                                            className="p-2 hover:bg-green-500/10 text-gray-400 hover:text-green-500 rounded-lg transition-colors"
                                            title="Invia promemoria WhatsApp"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                        <div className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-medium border",
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
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Terms Modal */}
            {isTermsViewOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700 shadow-2xl">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                                <FileText size={24} />
                                Regolamento Accademia
                            </h2>
                            <button
                                onClick={() => setIsTermsViewOpen(false)}
                                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="prose prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                                    {viewTermsContent || "Nessun regolamento disponibile."}
                                </pre>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-700 flex justify-end">
                            <button
                                onClick={() => setIsTermsViewOpen(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
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
