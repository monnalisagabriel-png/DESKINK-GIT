import React from 'react';
import { Footer } from '../../components/Footer';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col">
            <div className="max-w-4xl mx-auto px-6 py-12 flex-1 text-text-primary">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
                    <p className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500">
                        <strong>ATTENZIONE:</strong> Questo è un documento generico. Si prega di consultare un professionista legale per redigere una Privacy Policy conforme al GDPR e specifica per la propria attività.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Titolare del Trattamento</h2>
                        <p>
                            Il titolare del trattamento dei dati è [Nome Ragione Sociale], con sede legale in [Indirizzo], P.IVA [P.IVA], contattabile all'indirizzo email: [Email Contatto].
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">2. Tipologia di Dati Raccolti</h2>
                        <p>
                            Raccogliamo i seguenti dati personali:
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Dati di contatto (nome, cognome, email, telefono)</li>
                                <li>Dati di fatturazione (indirizzo, P.IVA, codice fiscale)</li>
                                <li>Dati di utilizzo del servizio</li>
                                <li>Cookie tecnici e di analisi</li>
                            </ul>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">3. Finalità del Trattamento</h2>
                        <p>
                            I dati vengono trattati per:
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Erogazione del servizio SaaS</li>
                                <li>Gestione amministrativa e contabile</li>
                                <li>Comunicazioni di servizio e assistenza</li>
                                <li>Adempimento di obblighi di legge</li>
                            </ul>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">4. Base Giuridica</h2>
                        <p>
                            Il trattamento è basato sull'esecuzione del contratto, sull'adempimento di obblighi legali e sul legittimo interesse del Titolare.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3">5. Diritti dell'Interessato</h2>
                        <p>
                            L'utente ha diritto di accedere, rettificare, cancellare i propri dati, limitarne il trattamento o opporsi allo stesso, inviando una richiesta ai contatti del Titolare.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
};
