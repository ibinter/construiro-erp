import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

export default function SupportSessionsIndex({ sessions, companies }) {
    const { data, setData, post, processing, reset } = useForm({
        company_id: '', reason: '', duration_hours: 2,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/superadmin/support-sessions', { onSuccess: () => reset() });
    };

    const end = (id) => {
        if (confirm('Terminer cette session de support ?')) {
            post(`/superadmin/support-sessions/${id}/end`);
        }
    };

    return (
        <AppLayout title="Sessions de support">
            <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
                <PageHeader title="Sessions de support SuperAdmin" subtitle="Chaque accès est tracé dans le journal d'audit" />

                {/* Créer une session */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Démarrer une session de support</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={submit} className="grid sm:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="form-label">Entreprise *</label>
                                <select className="form-select" value={data.company_id} onChange={e => setData('company_id', e.target.value)}>
                                    <option value="">— Sélectionnez —</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Durée (heures) *</label>
                                <input type="number" className="form-input" min={1} max={24} value={data.duration_hours}
                                    onChange={e => setData('duration_hours', parseInt(e.target.value))} />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="form-label">Raison de l'intervention *</label>
                                <input type="text" className="form-input" placeholder="Ex: Correction bug facturation, ticket #TICK-000042"
                                    value={data.reason} onChange={e => setData('reason', e.target.value)} />
                            </div>
                            <div>
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? '…' : 'Démarrer la session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Historique */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Historique des sessions</h3>
                    </div>
                    <div className="card-body overflow-x-auto">
                        <table className="table-construiro w-full">
                            <thead>
                                <tr>
                                    <th>Agent</th>
                                    <th>Entreprise</th>
                                    <th>Raison</th>
                                    <th>Expire le</th>
                                    <th>Statut</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((s) => (
                                    <tr key={s.id}>
                                        <td>{s.support_user}</td>
                                        <td>{s.company}</td>
                                        <td className="max-w-xs truncate text-slate-500">{s.reason}</td>
                                        <td className="text-slate-500">{s.expires_at}</td>
                                        <td>
                                            <Badge variant={s.is_active ? 'success' : 'neutral'}>
                                                {s.is_active ? 'Active' : s.ended_at ? 'Terminée' : 'Expirée'}
                                            </Badge>
                                        </td>
                                        <td>
                                            {s.is_active && (
                                                <button onClick={() => end(s.id)} className="text-xs text-red-500 hover:underline">
                                                    Terminer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
