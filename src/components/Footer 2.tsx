import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { api } from '../services/api';
import type { Studio } from '../services/types';

export const Footer: React.FC = () => {
    const { user } = useAuth();
    const [studio, setStudio] = React.useState<Studio | null>(null);

    React.useEffect(() => {
        if (user?.studio_id) {
            api.settings.getStudio(user.studio_id).then(setStudio).catch(console.error);
        }
    }, [user?.studio_id]);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="hidden md:block w-full bg-bg-secondary border-t border-border mt-auto py-8 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm text-text-muted">
                <div className="flex flex-col gap-2">
                    <p className="font-bold text-text-primary">
                        {studio?.company_name || studio?.name || 'DeskInk CRM'}
                    </p>
                    <p>
                        {studio?.address && <span>{studio.address}, </span>}
                        {studio?.city && <span>{studio.city}</span>}
                    </p>
                    <p>
                        {studio?.vat_number && <span>P.IVA: {studio.vat_number} </span>}
                        {studio?.fiscal_code && <span> | C.F.: {studio.fiscal_code}</span>}
                    </p>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                    <div className="flex gap-4">
                        <a href="/legal/privacy" className="hover:text-accent transition-colors">Privacy Policy</a>
                        <a href="/legal/terms" className="hover:text-accent transition-colors">Termini e Condizioni</a>
                        <a href="/legal/cookie" className="hover:text-accent transition-colors">Cookie Policy</a>
                    </div>
                    <p>© {currentYear} Powered by <a href="https://deskink.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">DESKINK</a></p>
                </div>
            </div>
        </footer>
    );
};
