import React from 'react';
import { Footer } from '../../components/Footer';

export const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col">
            <div className="max-w-4xl mx-auto px-6 py-12 flex-1 text-text-primary">
                <h1 className="text-3xl font-bold mb-8">Termini e Condizioni di Utilizzo</h1>
                <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
                    <p className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500">
                        <strong>ATTENZIONE:</strong> Questo è un documento generico. Si prega di consultare un professionista legale per redigere Termini e Condizioni completi e validi.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Oggetto del Servizio</h2>
                        <p>
                            InkFlow CRM fornisce un software gestionale in modalità SaaS (Software as a Service) per la gestione di studi di tatuaggi, inclusi appuntamenti, clienti, fatturazione e marketing.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">2. Registrazione e Account</h2>
                        <p>
                            L'utilizzo del servizio richiede la registrazione. L'utente è responsabile della custodia delle proprie credenziali di accesso e della veridicità dei dati forniti.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">3. Pagamenti e Abbonamenti</h2>
                        <p>
                            Il servizio è fornito in abbonamento (mensile o annuale). Il mancato pagamento comporta la sospensione dell'accesso al servizio. I prezzi sono indicati nel listino e possono subire variazioni con preavviso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">4. Limitazione di Responsabilità</h2>
                        <p>
                            Il fornitore non è responsabile per danni diretti o indiretti derivanti dall'uso o dal mancato uso del servizio, salvo i casi di dolo o colpa grave. Il servizio è fornito "così com'è".
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">5. Modifiche ai Termini</h2>
                        <p>
                            Ci riserviamo il diritto di modificare i presenti termini in qualsiasi momento. Le modifiche saranno comunicate agli utenti e si intenderanno accettate con l'uso continuato del servizio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">6. Legge Applicabile</h2>
                        <p>
                            Il presente contratto è regolato dalla legge italiana. Per qualsiasi controversia è competente il Foro di [Città competente].
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
};
