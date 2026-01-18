import React from 'react';
import { Footer } from '../../components/Footer';

export const CookiePolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col">
            <div className="max-w-4xl mx-auto px-6 py-12 flex-1 text-text-primary">
                <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
                <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
                    <p className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500">
                        <strong>ATTENZIONE:</strong> Questo è un documento generico. Si prega di consultare un professionista legale per redigere una Cookie Policy conforme alla direttiva ePrivacy e al GDPR.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Cosa sono i Cookie?</h2>
                        <p>
                            I cookie sono piccoli file di testo che i siti visitati dagli utenti inviano ai loro terminali, dove vengono memorizzati per essere ritrasmessi agli stessi siti in occasione di visite successive.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">2. Tipologie di Cookie Utilizzati</h2>
                        <p>
                            Questo sito utilizza le seguenti tipologie di cookie:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li>
                                <strong>Cookie Tecnici:</strong> Necessari per il funzionamento del sito (es. gestione della sessione di login). Non richiedono consenso.
                            </li>
                            <li>
                                <strong>Cookie Analitici:</strong> Utilizzati per raccogliere informazioni, in forma aggregata, sul numero degli utenti e su come questi visitano il sito stesso.
                            </li>
                            {/* Add Profiling cookies if actually used, otherwise omission is safer for generic templates */}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">3. Gestione dei Cookie</h2>
                        <p>
                            L'utente può decidere se accettare o meno i cookie utilizzando le impostazioni del proprio browser.
                            Attenzione: la disabilitazione totale o parziale dei cookie tecnici può compromettere l'utilizzo delle funzionalità del sito riservate agli utenti registrati.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
};
