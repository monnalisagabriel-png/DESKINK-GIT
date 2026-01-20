import React from 'react';
import type { Transaction, ArtistContract } from '../../../services/types';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { User, Building } from 'lucide-react';

interface OnlineBookingBreakdownProps {
    transaction: Transaction;
    contract?: ArtistContract;
    artistName: string;
}

export const OnlineBookingBreakdown: React.FC<OnlineBookingBreakdownProps> = ({ transaction, contract, artistName }) => {
    // 1. Calculate Shares
    // Default to 50% if no contract or rate defined, but UI should indicate this.
    // Logic: 
    // - Input Amount is the GROSS paid by client to Studio.
    // - Artist Share is calculated based on contract.
    // - Studio Share is Remainder.

    const grossAmount = transaction.amount;
    let artistRate = 50; // Default
    let artistShare = 0;

    // Determine Rate/Share based on Contract
    if (contract) {
        if (contract.rent_type === 'PERCENTAGE' || !contract.rent_type) {
            artistRate = contract.commission_rate ?? 50;
            artistShare = grossAmount * (artistRate / 100);
        } else if (contract.rent_type === 'FIXED' || contract.rent_type === 'PRESENCES') {
            // For FIXED (Resident) and PRESENCES (Guest Spot), the artist usually keeps 100% of the session price.
            // The Studio income comes from the fixed monthly rent or the daily guest fee, which are tracked separately as expenses/income.
            // Therefore, for the specific booking transaction, the split is 100% Artist.
            artistRate = 100;
            artistShare = grossAmount;
        }
    }

    const studioShare = grossAmount - artistShare;
    const studioRate = 100 - artistRate;

    return (
        <div className="bg-bg-tertiary rounded-lg border border-border p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Prenotazione Online
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                        {format(new Date(transaction.date), 'dd MMMM yyyy', { locale: it })} • {artistName}
                    </p>
                </div>
                <div className="text-right">
                    <span className="block font-bold text-lg text-green-500">€ {grossAmount.toFixed(2)}</span>
                    <span className="text-[10px] text-text-muted uppercase tracking-wider">Incasso Totale</span>
                </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-4 bg-bg-primary rounded-full overflow-hidden flex mb-4 border border-border/50">
                {/* Studio Part */}
                <div
                    className="h-full bg-blue-500/80 flex items-center justify-center relative group"
                    style={{ width: `${Math.max(studioRate, 0)}%` }}
                >
                    {studioRate > 15 && <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">Studio</span>}
                </div>
                {/* Artist Part */}
                <div
                    className="h-full bg-orange-500/80 flex items-center justify-center relative group"
                    style={{ width: `${Math.max(artistRate, 0)}%` }}
                >
                    {artistRate > 15 && <span className="text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">Artista</span>}
                </div>
            </div>

            {/* Detailed Numbers */}
            <div className="grid grid-cols-2 gap-4">
                {/* Studio Box */}
                <div className="bg-bg-secondary p-3 rounded border border-border/50 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-1">
                        <Building size={14} className="text-blue-400" />
                        <span className="text-xs text-text-muted font-medium">Margine Studio</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-blue-400">€ {studioShare.toFixed(2)}</span>
                        <span className="text-xs text-text-muted">{studioRate}%</span>
                    </div>
                </div>

                {/* Artist Box */}
                <div className="bg-bg-secondary p-3 rounded border border-border/50 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-1">
                        <User size={14} className="text-orange-400" />
                        <span className="text-xs text-text-muted font-medium">Da Riconoscere</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-orange-400">€ {artistShare.toFixed(2)}</span>
                        <span className="text-xs text-text-muted">{artistRate}%</span>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-text-muted text-center mt-3 bg-white/5 py-1 rounded">
                * Calcolo indicativo basato sul contratto ({contract?.rent_type === 'PERCENTAGE' ? 'Percentuale' : 'Fisso/Altro'}).
            </p>
        </div>
    );
};
