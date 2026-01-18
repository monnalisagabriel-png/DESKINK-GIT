import React, { useState } from 'react';
import {
    BookOpen,
    LayoutDashboard,
    Calendar,
    Users,
    MessageCircle,
    FileSignature,
    Palette,
    ClipboardList,
    Megaphone,
    DollarSign,
    GraduationCap,
    Settings,
    Building,
    UserCog,
    ChevronRight,
    Search
} from 'lucide-react';

interface GuideSection {
    id: string;
    title: string;
    icon: React.ElementType;
    content: React.ReactNode;
}

const GUIDES: GuideSection[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: LayoutDashboard,
        content: (
            <div className="space-y-4">
                <p>La <strong>Dashboard</strong> è il tuo centro di controllo principale. Appena accedi, ti offre una visione d'insieme immediata dell'andamento dello studio.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Appuntamenti di Oggi:</strong> Vedi subito chi devi tatuare oggi, con orari e dettagli.</li>
                    <li><strong>Statistiche Rapide:</strong> Tieni d'occhio il fatturato giornaliero, il numero di clienti e altri KPI importanti.</li>
                    <li><strong>Notifiche:</strong> Avvisi su nuovi messaggi, richieste di appuntamento o scadenze.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'calendar',
        title: 'Calendario',
        icon: Calendar,
        content: (
            <div className="space-y-4">
                <p>Il <strong>Calendario</strong> è il cuore operativo del tuo lavoro. Qui gestisci il tuo tempo e gli appuntamenti.</p>
                <div className="space-y-3">
                    <h4 className="font-bold text-text-primary">Funzionalità principali:</h4>
                    <ul className="list-disc pl-5 text-text-secondary space-y-2">
                        <li><strong>Nuovo Appuntamento:</strong> Clicca su uno spazio vuoto o sul tasto "+" per creare un appuntamento. Puoi assegnare un cliente, scegliere il servizio e impostare un acconto.</li>
                        <li><strong>Viste Multiple:</strong> Scegli tra vista giornaliera, settimanale o mensile per organizzarti meglio.</li>
                        <li><strong>Colori:</strong> Ogni artista ha un colore diverso per distinguere facilmente gli impegni a colpo d'occhio.</li>
                        <li><strong>Sync Google:</strong> Se attivato, i tuoi appuntamenti si sincronizzano automaticamente con il tuo Google Calendar personale.</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'clients',
        title: 'Clienti',
        icon: Users,
        content: (
            <div className="space-y-4">
                <p>Nella sezione <strong>Clienti</strong> trovi l'elenco completo di tutte le persone che sono passate dal tuo studio.</p>
                <div className="space-y-3">
                    <h4 className="font-bold text-text-primary">Scheda Cliente:</h4>
                    <p>Cliccando su un nome, accedi alla scheda personale dove puoi vedere:</p>
                    <ul className="list-disc pl-5 text-text-secondary space-y-2">
                        <li><strong>Storico Appuntamenti:</strong> Tutti i tatuaggi fatti in passato e quelli futuri.</li>
                        <li><strong>Galleria Foto:</strong> Carica le foto dei lavori eseguiti su quel cliente.</li>
                        <li><strong>Consensi Firmati:</strong> Archivio digitale dei moduli privacy e scarico di responsabilità firmati.</li>
                        <li><strong>Note:</strong> Aggiungi note su allergie, preferenze o idee per futuri progetti.</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'communications',
        title: 'Bacheca',
        icon: MessageCircle,
        content: (
            <div className="space-y-4">
                <p>La <strong>Bacheca</strong> è lo strumento di comunicazione interna dello studio.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Comunicazioni Importanti:</strong> L'owner o i manager possono pubblicare avvisi visibili a tutto il team (es. "Studio chiuso per ferie", "Nuove regole igieniche").</li>
                    <li><strong>Chat interna:</strong> Scambia messaggi veloci con i colleghi senza dover usare WhatsApp.</li>
                    <li><strong>Notifiche di lettura:</strong> Vedi chi ha letto i messaggi importanti.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'consents',
        title: 'Consensi',
        icon: FileSignature,
        content: (
            <div className="space-y-4">
                <p>Digitalizza completamente la burocrazia con la sezione <strong>Consensi</strong>.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Moduli Digitali:</strong> Crea e personalizza i moduli per il consenso informato e la privacy.</li>
                    <li><strong>Firma su Tablet:</strong> Fai firmare il cliente direttamente sul tablet prima dell'appuntamento.</li>
                    <li><strong>Archiviazione Sicura:</strong> I moduli firmati vengono salvati automaticamente nel cloud e collegati alla scheda del cliente, eliminando la carta.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'financials',
        title: 'Finanze',
        icon: DollarSign,
        content: (
            <div className="space-y-4">
                <p>Tieni sotto controllo la salute economica dello studio con la sezione <strong>Finanze</strong>.</p>
                <div className="space-y-3">
                    <h4 className="font-bold text-text-primary">Cosa puoi fare:</h4>
                    <ul className="list-disc pl-5 text-text-secondary space-y-2">
                        <li><strong>Registro Transazioni:</strong> Ogni pagamento (acconto o saldo) viene registrato qui.</li>
                        <li><strong>Spese:</strong> Inserisci le spese dello studio (affitto, forniture, bollette) per avere un bilancio reale.</li>
                        <li><strong>Analisi:</strong> Grafici chiari ti mostrano l'andamento del fatturato nel tempo.</li>
                        <li><strong>Gestione Provvigioni:</strong> (Per Owner) Calcola facilmente le percentuali dovute agli artisti in base agli accordi (Fixed, Percentage, ecc.).</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'marketing',
        title: 'Marketing',
        icon: Megaphone,
        content: (
            <div className="space-y-4">
                <p>La sezione <strong>Marketing</strong> ti aiuta a far crescere il tuo business e fidelizzare i clienti.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Campagne Email/SMS:</strong> Invia promozioni o auguri di compleanno ai tuoi clienti.</li>
                    <li><strong>AI Copywriter:</strong> Usa l'intelligenza artificiale integrata per generare testi accattivanti per i tuoi post su Instagram o Facebook.</li>
                    <li><strong>Recensioni:</strong> Monitora e gestisci le recensioni dei clienti (integrazione Google).</li>
                </ul>
            </div>
        )
    },
    {
        id: 'waitlist',
        title: 'Lista Attesa',
        icon: ClipboardList,
        content: (
            <div className="space-y-4">
                <p>Gestisci le richieste dei clienti che non hanno ancora un appuntamento fissato nella <strong>Lista Attesa</strong>.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Form Pubblico:</strong> Fornisci un link ai clienti per iscriversi autonomamente alla lista d'attesa online.</li>
                    <li><strong>Gestione Richieste:</strong> Rivedi le idee dei clienti, approvale e convertile in appuntamenti quando si libera un posto.</li>
                    <li><strong>Priorità:</strong> Organizza le richieste per urgenza o data di iscrizione.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'academy',
        title: 'Academy',
        icon: GraduationCap,
        content: (
            <div className="space-y-4">
                <p>Se il tuo studio fa formazione, la sezione <strong>Academy</strong> è dedicata alla gestione degli studenti.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Corsi:</strong> Crea e gestisci i corsi offerti.</li>
                    <li><strong>Studenti:</strong> Tieni traccia degli iscritti e dei loro progressi.</li>
                    <li><strong>Presenze:</strong> Registra la frequenza alle lezioni.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'team',
        title: 'Team',
        icon: UserCog,
        content: (
            <div className="space-y-4">
                <p>Nella sezione <strong>Team</strong> (visibile solo all'Owner) gestisci i membri del tuo staff.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Inviti:</strong> Invia inviti via email per aggiungere nuovi artisti o manager allo studio.</li>
                    <li><strong>Ruoli e Permessi:</strong> Assegna i ruoli corretti (Manager, Artist, Studio Admin) per definire cosa possono vedere e fare.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'artists',
        title: 'Artisti',
        icon: Palette,
        content: (
            <div className="space-y-4">
                <p>Gestisci i profili dei tatuatori che lavorano nel tuo studio.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Profili:</strong> Visualizza e modifica le info degli artisti, inclusi stili e bio.</li>
                    <li><strong>Contratti:</strong> Tieni traccia dei termini contrattuali e delle percentuali di guadagno.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'studio',
        title: 'Studio',
        icon: Building,
        content: (
            <div className="space-y-4">
                <p>Le impostazioni generali del tuo business.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Info Generali:</strong> Nome, indirizzo, logo e contatti dello studio.</li>
                    <li><strong>Dati Fiscali:</strong> P.IVA, Codice SDI e PEC per la fatturazione elettronica.</li>
                    <li><strong>Abbonamento:</strong> Gestisci il tuo piano InkFlow e i pagamenti.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'settings',
        title: 'Impostazioni',
        icon: Settings,
        content: (
            <div className="space-y-4">
                <p>Configura l'esperienza d'uso dell'applicazione.</p>
                <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li><strong>Tema:</strong> Scegli tra modalità chiara o scura.</li>
                    <li><strong>Sicurezza:</strong> Cambia la tua password.</li>
                    <li><strong>Integrazioni:</strong> Collega servizi esterni come Google Calendar o Stripe.</li>
                </ul>
            </div>
        )
    }
];

export const TutorialsPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>(GUIDES[0].id);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGuides = GUIDES.filter(guide =>
        guide.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeGuide = GUIDES.find(g => g.id === activeSection);

    return (
        <div className="flex h-full bg-bg-primary overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-80 border-r border-border bg-bg-secondary flex flex-col hidden md:flex">
                <div className="p-6 border-b border-border">
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 mb-4">
                        <BookOpen className="text-accent" />
                        Guida Utente
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Cerca argomento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-tertiary border border-border rounded-lg pl-10 pr-4 py-2 text-text-primary focus:border-accent focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {filteredGuides.map(guide => (
                        <button
                            key={guide.id}
                            onClick={() => setActiveSection(guide.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeSection === guide.id
                                ? 'bg-accent/10 text-accent font-medium'
                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <guide.icon size={18} />
                                <span>{guide.title}</span>
                            </div>
                            {activeSection === guide.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Mobile Nav (visible only on small screens) */}
            <div className="md:hidden w-full absolute top-16 left-0 right-0 bg-bg-secondary border-b border-border z-10 overflow-x-auto whitespace-nowrap p-2 flex gap-2">
                {filteredGuides.map(guide => (
                    <button
                        key={guide.id}
                        onClick={() => setActiveSection(guide.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${activeSection === guide.id
                            ? 'bg-accent text-white border-accent'
                            : 'bg-bg-tertiary text-text-secondary border-border'
                            }`}
                    >
                        <guide.icon size={14} />
                        {guide.title}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12 mt-12 md:mt-0">
                <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
                    {activeGuide ? (
                        <>
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                    <activeGuide.icon size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-text-primary">{activeGuide.title}</h2>
                                    <p className="text-text-muted">Guida all'uso</p>
                                </div>
                            </div>
                            <div className="prose prose-invert max-w-none prose-lg">
                                {activeGuide.content}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 text-text-muted">
                            <BookOpen size={64} className="mx-auto mb-4 opacity-20" />
                            <p>Seleziona un argomento dalla guida per iniziare.</p>
                        </div>
                    )}


                </div>
            </main>
        </div>
    );
};
