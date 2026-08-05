import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

/* Libellés lisibles pour les clés de modules du guide (fallback = clé brute). */
const MODULE_LABELS = {
    projects:      'Projets / Chantiers',
    quotes:        'Devis',
    invoicing:     'Facturation',
    invoices:      'Factures',
    materials:     'Matériaux',
    stocks:        'Stocks',
    warehouses:    'Entrepôts',
    equipment:     'Équipements',
    hr:            'Ressources humaines',
    employees:     'Employés',
    payroll:       'Paie',
    attendance:    'Pointage',
    accounting:    'Comptabilité',
    treasury:      'Trésorerie',
    contracts:     'Contrats',
    purchases:     'Achats',
    suppliers:     'Fournisseurs',
    clients:       'Clients',
    crm:           'CRM',
    design_office: "Bureau d'études",
    laboratory:    'Laboratoire',
    e_signature:   'Signature électronique',
    bi:            'BI & Rapports',
    ai:            'Assistant IA',
    hse:           'HSE / Sécurité',
    quality:       'Qualité',
};

function moduleLabel(key) {
    return MODULE_LABELS[key] ?? key;
}

export default function GuideRevisionsIndex({ flags = [], stats = {} }) {
    const pending  = flags.filter(f => f.needs_revision);
    const resolved = flags.filter(f => !f.needs_revision);

    const resolve = (f) =>
        router.post(route('superadmin.guide-revisions.resolve', f.id), {}, { preserveScroll: true });

    const reopen = (f) =>
        router.post(route('superadmin.guide-revisions.reopen', f.id), {}, { preserveScroll: true });

    const remove = (f) => {
        if (confirm(`Supprimer définitivement l'alerte pour « ${moduleLabel(f.module_key)} » ?`)) {
            router.delete(route('superadmin.guide-revisions.destroy', f.id), { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="SuperAdmin — Révisions du guide">
            <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">

                <PageHeader
                    title="📖 Révisions du guide utilisateur"
                    subtitle="Modules dont le guide doit être mis à jour suite à une évolution des fonctionnalités ou des plans."
                />

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.pending ?? 0}</div>
                        <div className="text-xs font-medium text-amber-800/80 dark:text-amber-400">À réviser</div>
                    </div>
                    <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.resolved ?? 0}</div>
                        <div className="text-xs font-medium text-green-800/80 dark:text-green-400">Révisés</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4">
                        <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{stats.total ?? 0}</div>
                        <div className="text-xs font-medium text-slate-500">Total</div>
                    </div>
                </div>

                {/* À réviser */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        À réviser ({pending.length})
                    </h2>

                    {pending.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">
                            ✅ Aucun guide en attente de révision. Tout est à jour.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pending.map(f => (
                                <div key={f.id} className="rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 p-4">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {moduleLabel(f.module_key)}
                                                </span>
                                                <Badge variant="warning">À réviser</Badge>
                                                <span className="font-mono text-[11px] text-slate-400">{f.module_key}</span>
                                            </div>
                                            {f.reason && (
                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.reason}</p>
                                            )}
                                            <p className="mt-1 text-xs text-slate-400">
                                                Signalé {f.flagged_at ? `le ${f.flagged_at}` : ''}{f.flagged_by ? ` · par ${f.flagged_by}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => resolve(f)} className="btn btn-primary btn-sm">
                                                ✓ Marquer révisé
                                            </button>
                                            <button onClick={() => remove(f)} className="btn btn-ghost btn-sm text-red-600">
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Historique révisés */}
                {resolved.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Révisés ({resolved.length})
                        </h2>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-2">Module</th>
                                        <th className="px-4 py-2">Motif</th>
                                        <th className="px-4 py-2">Révisé le</th>
                                        <th className="px-4 py-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {resolved.map(f => (
                                        <tr key={f.id} className="text-slate-700 dark:text-slate-300">
                                            <td className="px-4 py-2 font-medium">{moduleLabel(f.module_key)}</td>
                                            <td className="px-4 py-2 max-w-xs truncate text-slate-500">{f.reason ?? '—'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-slate-500">{f.resolved_at ?? '—'}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button onClick={() => reopen(f)} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                                                    Rouvrir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
