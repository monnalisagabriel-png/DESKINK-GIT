
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            console.error('Reset password failed:', err);
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            <div className="w-full max-w-md p-8 bg-bg-secondary rounded-lg border border-border shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-red-500 bg-clip-text text-transparent mb-2">
                        Recupero Password
                    </h1>
                    <p className="text-text-muted">
                        Inserisci la tua email per reimpostare la password.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded text-green-500 text-sm">
                            <p className="font-bold mb-1">Email Inviata!</p>
                            <p>Controlla la tua casella di posta e clicca sul link presente nell'email per creare una nuova password.</p>
                        </div>
                        <Link to="/login" className="inline-block text-accent hover:text-accent-hover underline">
                            Torna al Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-white focus:ring-accent focus:border-accent"
                                placeholder="nome@esempio.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Invio in corso...' : 'Invia Link di Reset'}
                        </button>

                        <div className="pt-4 text-center">
                            <Link to="/login" className="text-sm text-text-muted hover:text-white flex items-center justify-center gap-1 transition-colors">
                                <ArrowLeft size={14} /> Torna al Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
