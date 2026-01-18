import React, { useState, useEffect } from 'react';

export const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieconfig_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieconfig_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-accent p-6 shadow-2xl z-50 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm text-text-secondary">
                    <p className="mb-2">
                        <strong className="text-text-primary">Informativa sui Cookie:</strong> Utilizziamo cookie tecnici per garantire il corretto funzionamento del sito e, previo tuo consenso, cookie di terze parti per migliorare l'esperienza di navigazione.
                    </p>
                    <p>
                        Chiudendo questo banner o continuando la navigazione, acconsenti all'uso dei cookie. Per maggiori informazioni, consulta la nostra <a href="/legal/cookie" className="text-accent hover:underline">Cookie Policy</a>.
                    </p>
                </div>
                <div className="flex gap-4 min-w-max">
                    <button
                        onClick={acceptCookies}
                        className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-bold transition-colors text-sm"
                    >
                        Accetto
                    </button>
                    {/* Optional: Add "Reject" or "Manage" buttons for full GDPR compliance if using non-technical cookies */}
                </div>
            </div>
        </div>
    );
};
