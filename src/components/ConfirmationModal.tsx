import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Conferma',
    cancelText = 'Annulla',
    isDestructive = false,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-bg-secondary border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center gap-4">
                    {isDestructive && (
                        <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                    )}
                    <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                    <p className="text-text-muted">
                        {message}
                    </p>
                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-bg-tertiary hover:bg-white/10 text-text-primary rounded-lg font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2 text-white rounded-lg font-bold transition-colors disabled:opacity-50 ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent-hover'}`}
                        >
                            {isLoading ? 'Attendi...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
