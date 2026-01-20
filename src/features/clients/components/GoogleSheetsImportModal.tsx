
import React, { useState } from 'react';
import { X, Check, FileSpreadsheet, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useToast } from '../../../components/Toast';

interface GoogleSheetsImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    studioId: string;
    onSuccess: () => void; // To refresh list
}

export const GoogleSheetsImportModal: React.FC<GoogleSheetsImportModalProps> = ({ isOpen, onClose, studioId, onSuccess }) => {
    const { success, error: toastError } = useToast();
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [sheetName, setSheetName] = useState('Ingresso');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ total: number, imported: number, updated: number, errors: number } | null>(null);

    if (!isOpen) return null;

    const handleImport = async () => {
        if (!spreadsheetId) {
            toastError("Inserisci l'ID del foglio Google.");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // Helper to extract ID from URL if user pastes URL
            let cleanId = spreadsheetId;
            const urlMatch = spreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (urlMatch && urlMatch[1]) {
                cleanId = urlMatch[1];
            }

            const { data, error } = await supabase.functions.invoke('pull-google-sheets', {
                body: {
                    studio_id: studioId,
                    spreadsheet_id: cleanId,
                    sheet_name: sheetName
                }
            });

            if (error) {
                // Parse error body if available
                let msg = error.message;
                try {
                    const body = await error.context.json();
                    if (body.error) msg = body.error;
                } catch (e) { }

                throw new Error(msg || "Errore durante l'importazione.");
            }

            if (data.error) {
                throw new Error(data.error);
            }

            setResult(data.stats);
            success('Sincronizzazione completata!');
            onSuccess();

        } catch (err: any) {
            console.error(err);
            toastError(err.message || "Errore sconosciuto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bg-primary border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-border bg-bg-secondary/50">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <FileSpreadsheet className="text-green-500" size={20} />
                        Importa da Google Sheets
                    </h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {!result ? (
                        <>
                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-lg text-sm flex gap-3">
                                <AlertTriangle className="shrink-0" size={18} />
                                <div>
                                    <p className="font-bold mb-1">Backup Iniziale</p>
                                    <p>Usa questa funzione una sola volta per importare i clienti esistenti. I duplicati (stessa email) verranno aggiornati.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">ID Foglio o URL Completo</label>
                                <input
                                    type="text"
                                    value={spreadsheetId}
                                    onChange={(e) => setSpreadsheetId(e.target.value)}
                                    placeholder="https://docs.google.com/spreadsheets/d/ID-FOGLIO/edit..."
                                    className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                                />
                                <p className="text-[10px] text-text-muted mt-1">L'ID è la parte lunga nell'URL tra /d/ e /edit</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Nome del Foglio (Tab)</label>
                                <input
                                    type="text"
                                    value={sheetName}
                                    onChange={(e) => setSheetName(e.target.value)}
                                    placeholder="Ingresso"
                                    className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center p-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-500 mb-3">
                                    <Check size={24} />
                                </div>
                                <h4 className="text-lg font-bold text-text-primary mb-1">Importazione Completata</h4>
                                <p className="text-sm text-text-muted">I dati sono stati elaborati correttamente.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-bg-secondary p-3 rounded border border-border text-center">
                                    <span className="block text-2xl font-bold text-text-primary">{result.imported}</span>
                                    <span className="text-xs text-text-muted">Nuovi Clienti</span>
                                </div>
                                <div className="bg-bg-secondary p-3 rounded border border-border text-center">
                                    <span className="block text-2xl font-bold text-accent">{result.updated}</span>
                                    <span className="text-xs text-text-muted">Aggiornati</span>
                                </div>
                                <div className="bg-bg-secondary p-3 rounded border border-border text-center">
                                    <span className="block text-2xl font-bold text-red-400">{result.errors}</span>
                                    <span className="text-xs text-text-muted">Errori / Saltati</span>
                                </div>
                                <div className="bg-bg-secondary p-3 rounded border border-border text-center">
                                    <span className="block text-2xl font-bold text-gray-400">{result.total}</span>
                                    <span className="text-xs text-text-muted">Totale Righe</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                        {!result ? (
                            <>
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={loading}
                                    className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
                                    {loading ? 'Importazione in corso...' : 'Sincronizza Ora'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="bg-bg-secondary hover:bg-border text-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Chiudi
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
