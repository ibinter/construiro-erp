import { useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge, Card, CardHeader, CardBody } from '@/Components/UI';

const STATUS_LABELS = {
    trial: { label: 'Essai gratuit', variant: 'info' },
    active: { label: 'Actif', variant: 'success' },
    grace: { label: 'Période de grâce', variant: 'warning' },
    expired: { label: 'Expiré', variant: 'danger' },
    cancelled: { label: 'Annulé', variant: 'neutral' },
};

const INVOICE_STATUS = {
    paid: { label: 'Payée', variant: 'success' },
    pending: { label: 'En attente', variant: 'warning' },
    failed: { label: 'Échouée', variant: 'danger' },
};

function formatPrice(amount, currency) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency || 'XOF', maximumFractionDigits: 0 }).format(amount);
}

export default function BillingIndex({ subscription, plans, invoices }) {
    const { data, setData, post, processing, errors } = useForm({ activation_key: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('billing.activate'));
    };

    const sub = subscription;
    const statusInfo = sub ? STATUS_LABELS[sub.status] : null;

    return (
        <AppLayout title="Abonnement & Facturation">
            <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
                <PageHeader
                    title="Abonnement & Facturation"
                    subtitle="Gérez votre plan CONSTRUIRO"
                />

                {/* Abonnement actuel */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Abonnement actuel</h3>
                            {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
                        </div>
                    </CardHeader>
                    <CardBody>
                        {sub ? (
                            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <p><span className="font-medium">Plan :</span> {sub.plan?.name ?? '—'}</p>
                                <p><span className="font-medium">Cycle :</span> {sub.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}</p>
                                {sub.trial_ends_at && <p><span className="font-medium">Fin d'essai :</span> {sub.trial_ends_at}</p>}
                                {sub.ends_at && <p><span className="font-medium">Expiration :</span> {sub.ends_at}</p>}
                                {sub.grace_ends_at && (
                                    <p className="text-orange-600 font-medium">
                                        Période de grâce jusqu'au : {sub.grace_ends_at}
                                    </p>
                                )}
                                {sub.days_remaining > 0 && (
                                    <p className={sub.days_remaining <= 7 ? 'text-orange-600 font-semibold' : ''}>
                                        {sub.days_remaining} jour(s) restant(s)
                                    </p>
                                )}
                                {['trial', 'grace', 'expired'].includes(sub.status) && (
                                    <div className="pt-3">
                                        <Link
                                            href={route('billing.payment.index')}
                                            className="btn btn-primary inline-flex items-center gap-2"
                                        >
                                            Payer / Renouveler →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Aucun abonnement actif.</p>
                        )}
                    </CardBody>
                </Card>

                {/* Activation par clé */}
                <Card>
                    <CardHeader>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Activer un abonnement</h3>
                    </CardHeader>
                    <CardBody>
                        <p className="text-sm text-slate-500 mb-4">
                            Entrez la clé d'activation reçue après votre paiement.
                        </p>
                        <form onSubmit={submit} className="flex gap-3">
                            <input
                                type="text"
                                value={data.activation_key}
                                onChange={(e) => setData('activation_key', e.target.value)}
                                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                                className="form-input flex-1 font-mono text-sm"
                                maxLength={32}
                            />
                            <button type="submit" className="btn btn-primary" disabled={processing}>
                                {processing ? '…' : 'Activer'}
                            </button>
                        </form>
                        {errors.activation_key && (
                            <p className="mt-2 text-sm text-red-600">{errors.activation_key}</p>
                        )}
                    </CardBody>
                </Card>

                {/* Plans disponibles */}
                <div>
                    <h3 className="section-title mb-4">Nos plans</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div key={plan.id} className="card flex flex-col">
                                <div className="card-header">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{plan.name}</h4>
                                    {plan.description && (
                                        <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                                    )}
                                </div>
                                <div className="card-body flex-1 space-y-2">
                                    <p className="text-2xl font-bold text-orange-500">
                                        {formatPrice(plan.price_monthly, plan.currency)}
                                        <span className="text-sm font-normal text-slate-400">/mois</span>
                                    </p>
                                    {plan.price_yearly > 0 && (
                                        <p className="text-sm text-slate-500">
                                            ou {formatPrice(plan.price_yearly, plan.currency)}/an
                                        </p>
                                    )}
                                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                        <li>👥 {plan.max_users} utilisateurs</li>
                                        <li>🏗 {plan.max_projects} projets</li>
                                        {plan.trial_days > 0 && <li>🎁 {plan.trial_days} jours d'essai gratuit</li>}
                                    </ul>
                                </div>
                                <div className="card-footer">
                                    <a
                                        href="mailto:sales@construiro.com"
                                        className="btn btn-primary w-full text-center"
                                    >
                                        Contacter pour souscrire
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Historique factures */}
                {invoices.length > 0 && (
                    <Card>
                        <CardHeader>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Historique de facturation</h3>
                        </CardHeader>
                        <CardBody>
                            <div className="overflow-x-auto">
                                <table className="table-construiro w-full">
                                    <thead>
                                        <tr>
                                            <th>Référence</th>
                                            <th>Montant</th>
                                            <th>Statut</th>
                                            <th>Date de paiement</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((inv) => {
                                            const s = INVOICE_STATUS[inv.status] ?? { label: inv.status, variant: 'neutral' };
                                            return (
                                                <tr key={inv.id}>
                                                    <td className="font-mono text-sm">{inv.reference}</td>
                                                    <td>{formatPrice(inv.amount, inv.currency)}</td>
                                                    <td><Badge variant={s.variant}>{s.label}</Badge></td>
                                                    <td>{inv.paid_at ?? '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
