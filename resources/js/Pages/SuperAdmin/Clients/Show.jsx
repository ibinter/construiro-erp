import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge, Card, CardHeader, CardBody } from '@/Components/UI';

const STATUS_COLORS = {
    trial: 'info', active: 'success', grace: 'warning',
    expired: 'danger', cancelled: 'neutral',
};

export default function ClientShow({ company, subscriptions, plans }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        plan_id: plans[0]?.id ?? '',
        billing_cycle: 'monthly',
        duration_months: 1,
        is_trial: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/superadmin/clients/${company.id}/subscription`);
    };

    return (
        <AppLayout title={`SuperAdmin — ${company.name}`}>
            <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
                <PageHeader
                    title={company.name}
                    subtitle={company.legal_name}
                    actions={
                        <Link href="/superadmin/clients" className="btn btn-secondary">← Retour</Link>
                    }
                />

                {/* Info entreprise */}
                <Card>
                    <CardHeader><h3 className="font-semibold">Informations</h3></CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-400">Email :</span> {company.email ?? '—'}</div>
                            <div><span className="text-slate-400">Téléphone :</span> {company.phone ?? '—'}</div>
                            <div><span className="text-slate-400">Pays / Ville :</span> {company.country} / {company.city}</div>
                            <div><span className="text-slate-400">Utilisateurs :</span> {company.users_count}</div>
                            <div><span className="text-slate-400">Inscrite le :</span> {company.created_at}</div>
                            <div>
                                <span className="text-slate-400">Statut compte :</span>{' '}
                                <Badge variant={company.is_active ? 'success' : 'danger'}>
                                    {company.is_active ? 'Actif' : 'Bloqué'}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-4">
                            <form action={`/superadmin/clients/${company.id}/toggle`} method="POST">
                                <input type="hidden" name="_method" value="PATCH" />
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                <button type="submit" className={`btn ${company.is_active ? 'btn-danger' : 'btn-primary'} btn-sm`}>
                                    {company.is_active ? 'Bloquer le compte' : 'Réactiver le compte'}
                                </button>
                            </form>
                        </div>
                    </CardBody>
                </Card>

                {/* Historique abonnements */}
                <Card>
                    <CardHeader><h3 className="font-semibold">Abonnements</h3></CardHeader>
                    <CardBody>
                        {subscriptions.length === 0 ? (
                            <p className="text-slate-400 text-sm">Aucun abonnement.</p>
                        ) : (
                            <table className="table-construiro w-full">
                                <thead>
                                    <tr>
                                        <th>Plan</th>
                                        <th>Statut</th>
                                        <th>Cycle</th>
                                        <th>Début</th>
                                        <th>Fin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.map((s) => (
                                        <tr key={s.id}>
                                            <td>{s.plan ?? '—'}</td>
                                            <td><Badge variant={STATUS_COLORS[s.status] ?? 'neutral'}>{s.status}</Badge></td>
                                            <td>{s.billing_cycle}</td>
                                            <td>{s.starts_at ?? s.trial_ends_at ?? '—'}</td>
                                            <td>{s.ends_at ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardBody>
                </Card>

                {/* Accorder un abonnement */}
                <Card>
                    <CardHeader><h3 className="font-semibold">Accorder un abonnement</h3></CardHeader>
                    <CardBody>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Plan</label>
                                    <select className="form-select" value={data.plan_id} onChange={(e) => setData('plan_id', e.target.value)}>
                                        {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Cycle</label>
                                    <select className="form-select" value={data.billing_cycle} onChange={(e) => setData('billing_cycle', e.target.value)}>
                                        <option value="monthly">Mensuel</option>
                                        <option value="yearly">Annuel</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Durée (mois)</label>
                                    <input type="number" className="form-input" min={1} max={24} value={data.duration_months}
                                        onChange={(e) => setData('duration_months', parseInt(e.target.value))} />
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <input type="checkbox" id="is_trial" checked={data.is_trial}
                                        onChange={(e) => setData('is_trial', e.target.checked)} />
                                    <label htmlFor="is_trial" className="text-sm text-slate-700 dark:text-slate-300">Essai gratuit</label>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? 'Traitement…' : 'Accorder l\'abonnement'}
                            </button>
                            {recentlySuccessful && <span className="text-sm text-green-600">Abonnement accordé ✓</span>}
                        </form>
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
