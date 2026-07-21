import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge, Card, CardHeader, CardBody } from '@/Components/UI';

const STATUS_COLORS = {
    trial: 'info', active: 'success', grace: 'warning',
    expired: 'danger', cancelled: 'neutral',
};

/** Modal de confirmation suspension */
function SuspendModal({ company, onClose }) {
    const { data, setData, post, processing, errors } = useForm({ reason: '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/superadmin/clients/${company.id}/suspend`, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Suspendre le compte
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Le compte <strong>{company.name}</strong> sera suspendu et tous ses utilisateurs
                    recevront un email de notification.
                </p>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="form-label">Raison de la suspension *</label>
                        <textarea
                            className="form-input w-full"
                            rows={4}
                            placeholder="Ex : Non-paiement de la facture, violation des CGU…"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            required
                            maxLength={500}
                        />
                        {errors.reason && (
                            <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{data.reason.length}/500</p>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={processing}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-danger"
                            disabled={processing || !data.reason.trim()}
                        >
                            {processing ? 'Suspension…' : 'Confirmer la suspension'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ClientShow({ company, subscriptions, plans }) {
    const [showSuspendModal, setShowSuspendModal] = useState(false);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        plan_id: plans[0]?.id ?? '',
        billing_cycle: 'monthly',
        duration_months: 1,
        is_trial: false,
    });

    const { post: reactivatePost, processing: reactivating } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(`/superadmin/clients/${company.id}/subscription`);
    };

    const handleReactivate = () => {
        reactivatePost(`/superadmin/clients/${company.id}/reactivate`);
    };

    const isSuspended = company.status === 'suspended';

    return (
        <AppLayout title={`SuperAdmin — ${company.name}`}>
            {showSuspendModal && (
                <SuspendModal
                    company={company}
                    onClose={() => setShowSuspendModal(false)}
                />
            )}

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
                                {isSuspended ? (
                                    <Badge variant="danger">Suspendu</Badge>
                                ) : (
                                    <Badge variant={company.is_active ? 'success' : 'danger'}>
                                        {company.is_active ? 'Actif' : 'Bloqué'}
                                    </Badge>
                                )}
                            </div>
                            {isSuspended && company.suspended_at && (
                                <div className="col-span-2">
                                    <span className="text-slate-400">Suspendu le :</span>{' '}
                                    <span className="text-red-500">{company.suspended_at}</span>
                                </div>
                            )}
                            {isSuspended && company.suspension_reason && (
                                <div className="col-span-2">
                                    <span className="text-slate-400">Raison :</span>{' '}
                                    <span className="text-slate-700 dark:text-slate-300 italic">
                                        {company.suspension_reason}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions compte */}
                        <div className="mt-5 flex flex-wrap gap-3">
                            {/* Toggle actif/bloqué (sans email) */}
                            <form action={`/superadmin/clients/${company.id}/toggle`} method="POST">
                                <input type="hidden" name="_method" value="PATCH" />
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                <button
                                    type="submit"
                                    className={`btn btn-sm ${company.is_active && !isSuspended ? 'btn-secondary' : 'btn-primary'}`}
                                >
                                    {company.is_active && !isSuspended ? 'Désactiver (sans email)' : 'Activer (sans email)'}
                                </button>
                            </form>

                            {/* Suspension avec email */}
                            {!isSuspended ? (
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => setShowSuspendModal(true)}
                                >
                                    Suspendre le compte
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    disabled={reactivating}
                                    onClick={handleReactivate}
                                >
                                    {reactivating ? 'Réactivation…' : 'Réactiver le compte'}
                                </button>
                            )}
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
                            {recentlySuccessful && <span className="text-sm text-green-600">Abonnement accordé</span>}
                        </form>
                    </CardBody>
                </Card>
            </div>
        </AppLayout>
    );
}
