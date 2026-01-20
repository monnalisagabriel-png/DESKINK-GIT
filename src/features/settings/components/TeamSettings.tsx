import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Settings } from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../auth/AuthContext';
import type { User, ArtistContract } from '../../../services/types';
// import clsx from 'clsx';

export const TeamSettings: React.FC = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

    useEffect(() => {
        loadTeam();
    }, [user?.studio_id]);

    const loadTeam = async () => {
        if (!user?.studio_id) return;
        setLoading(true);
        try {
            const data = await api.settings.listTeamMembers(user.studio_id);
            setMembers(data);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail || !user?.studio_id) return;
        try {
            const newUser = await api.settings.inviteMember(inviteEmail, 'ARTIST', user.studio_id);
            setMembers([...members, newUser]);
            setInviteEmail('');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end gap-4 p-6 bg-bg-secondary rounded-lg border border-border">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Invite New Member</label>
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="colleague@inkflow.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full bg-bg-primary border border-border rounded-lg pl-10 pr-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none"
                        />
                        <Mail className="absolute left-3 top-2.5 text-text-muted" size={18} />
                    </div>
                </div>
                <div className="w-48">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Role</label>
                    <select className="w-full bg-bg-primary border border-border rounded-lg px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent outline-none appearance-none">
                        <option value="ARTIST">Artist</option>
                        <option value="MANAGER">Manager</option>
                        <option value="STUDENT">Student</option>
                    </select>
                </div>
                <button
                    onClick={handleInvite}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} />
                    <span>Invite</span>
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-primary">Active Members</h3>
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="text-text-muted text-center py-8">Loading team...</div>
                    ) : (
                        members.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-bg-secondary border border-border rounded-lg hover:border-accent/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-primary font-bold">
                                        {member.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-text-primary">{member.full_name}</div>
                                        <div className="text-xs text-text-muted flex items-center gap-1">
                                            {member.email} • <span className="text-accent">{member.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setSelectedArtistId(member.id); setIsContractModalOpen(true); }}
                                        className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                                        title="Gestione Contratto"
                                    >
                                        <Settings size={18} />
                                    </button>
                                    <button onClick={() => { }} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {
                isContractModalOpen && selectedArtistId && (
                    <ContractModal
                        artistId={selectedArtistId}
                        onClose={() => { setIsContractModalOpen(false); setSelectedArtistId(null); }}
                    />
                )
            }
        </div >
    );
};

interface ContractModalProps {
    artistId: string;
    onClose: () => void;
}

const ContractModal: React.FC<ContractModalProps> = ({ artistId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [contract, setContract] = useState<Partial<ArtistContract>>({
        rent_type: 'PERCENTAGE',
        commission_rate: 50,
        rent_fixed_amount: 0
    });

    useEffect(() => {
        const loadContract = async () => {
            try {
                const data = await api.artists.getContract(artistId);
                if (data) setContract(data);
            } catch (e) {
                console.error("Failed to load contract", e);
            } finally {
                setLoading(false);
            }
        };
        loadContract();
    }, [artistId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.artists.updateContract(artistId, contract);
            alert("Contratto aggiornato con successo!");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Errore durante il salvataggio.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-bg-secondary w-full max-w-md p-6 rounded-xl border border-border flex flex-col gap-4">
                <h3 className="text-xl font-bold text-text-primary">Gestione Contratto</h3>

                {loading ? (
                    <div className="text-center py-8 text-text-muted">Caricamento...</div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm text-text-muted mb-1">Tipo di Contratto</label>
                            <select
                                value={contract.rent_type}
                                onChange={e => setContract({ ...contract, rent_type: e.target.value as any })}
                                className="w-full bg-bg-tertiary border border-border rounded-lg p-2 text-text-primary"
                            >
                                <option value="PERCENTAGE">Percentuale (Commissione)</option>
                                <option value="FIXED">Affitto Fisso (Resident)</option>
                                <option value="PRESENCES">Pacchetto Presenze (Guest)</option>
                            </select>
                        </div>

                        {contract.rent_type === 'PERCENTAGE' && (
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Commissione Artista (%)</label>
                                <input
                                    type="number"
                                    value={contract.commission_rate}
                                    onChange={e => setContract({ ...contract, commission_rate: parseFloat(e.target.value) })}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg p-2 text-text-primary"
                                />
                                <p className="text-xs text-text-muted mt-1">Percentuale che rimane all'artista. Il resto va allo studio.</p>
                            </div>
                        )}

                        {contract.rent_type === 'FIXED' && (
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Affitto Mensile (€)</label>
                                <input
                                    type="number"
                                    value={contract.rent_fixed_amount}
                                    onChange={e => setContract({ ...contract, rent_fixed_amount: parseFloat(e.target.value) })}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg p-2 text-text-primary"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-1">P.IVA / C.F.</label>
                                <input
                                    type="text"
                                    value={contract.vat_number || ''}
                                    onChange={e => setContract({ ...contract, vat_number: e.target.value })}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg p-2 text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-1">IBAN</label>
                                <input
                                    type="text"
                                    value={contract.iban || ''}
                                    onChange={e => setContract({ ...contract, iban: e.target.value })}
                                    className="w-full bg-bg-tertiary border border-border rounded-lg p-2 text-text-primary"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-text-muted hover:text-text-primary">Annulla</button>
                            <button type="submit" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">Salva</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
