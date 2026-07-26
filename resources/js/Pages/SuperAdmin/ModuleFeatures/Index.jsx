import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader, Badge } from '@/Components/UI';

const PLAN_LABELS = {
    starter:    { label: 'Starter',    variant: 'neutral' },
    pro:        { label: 'Pro',        variant: 'warning' },
    enterprise: { label: 'Enterprise', variant: 'success' },
};

function PlanBadge({ plan }) {
    const cfg = PLAN_LABELS[plan] ?? { label: plan, variant: 'neutral' };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function PlanCheckboxes({ name, plans, checked, onChange }) {
    return (
        <div className="flex flex-wrap gap-3">
            {plans.map(plan => (
                <label key={plan} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                        checked={checked.includes(plan)}
                        onChange={() => {
                            const next = checked.includes(plan)
                                ? checked.filter(p => p !== plan)
                                : [...checked, plan];
                            onChange(next);
                        }}
                    />
                    <span className="text-sm font-medium capitalize">{plan}</span>
                </label>
            ))}
        </div>
    );
}

/* ────────────────────── Formulaire de création ────────────────────── */
function CreateFeatureForm({ plans, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        module_key:         '',
        feature_key:        '',
        label_fr:           '',
        label_en:           '',
        available_in_plans: [],
        is_active:          true,
    });

    function submit(e) {
        e.preventDefault();
        router.post(route('superadmin.module-features.store'), data, {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <form onSubmit={submit} className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Nouvelle fonctionnalité</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="label">Module <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="input"
                        placeholder="ex: facturation"
                        value={data.module_key}
                        onChange={e => setData('module_key', e.target.value)}
                    />
                    {errors.module_key && <p className="text-red-500 text-xs mt-1">{errors.module_key}</p>}
                </div>
                <div>
                    <label className="label">Clé feature <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="input"
                        placeholder="ex: facturation.export_pdf"
                        value={data.feature_key}
                        onChange={e => setData('feature_key', e.target.value)}
                    />
                    {errors.feature_key && <p className="text-red-500 text-xs mt-1">{errors.feature_key}</p>}
                </div>
                <div>
                    <label className="label">Label FR <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Exporter en PDF"
                        value={data.label_fr}
                        onChange={e => setData('label_fr', e.target.value)}
                    />
                    {errors.label_fr && <p className="text-red-500 text-xs mt-1">{errors.label_fr}</p>}
                </div>
                <div>
                    <label className="label">Label EN</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Export to PDF"
                        value={data.label_en}
                        onChange={e => setData('label_en', e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="label">Plans d'accès <span className="text-red-500">*</span></label>
                <PlanCheckboxes
                    plans={plans}
                    checked={data.available_in_plans}
                    onChange={v => setData('available_in_plans', v)}
                />
                {errors.available_in_plans && <p className="text-red-500 text-xs mt-1">{errors.available_in_plans}</p>}
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="is_active_new"
                    checked={data.is_active}
                    onChange={e => setData('is_active', e.target.checked)}
                    className="rounded border-slate-300 text-orange-500"
                />
                <label htmlFor="is_active_new" className="text-sm">Active</label>
            </div>

            <div className="flex gap-2 pt-1">
                <button type="submit" disabled={processing} className="btn btn-primary">
                    {processing ? 'Création…' : 'Créer la feature'}
                </button>
                <button type="button" onClick={onClose} className="btn btn-ghost">
                    Annuler
                </button>
            </div>
        </form>
    );
}

/* ────────────────────── Ligne éditable ────────────────────── */
function FeatureRow({ feature, plans }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, processing, reset } = useForm({
        label_fr:           feature.label_fr,
        label_en:           feature.label_en ?? '',
        available_in_plans: feature.available_in_plans ?? [],
        is_active:          feature.is_active,
    });

    function save() {
        router.put(route('superadmin.module-features.update', feature.id), data, {
            onSuccess: () => setEditing(false),
        });
    }

    function destroy() {
        if (!confirm(`Supprimer la feature « ${feature.feature_key} » ?`)) return;
        router.delete(route('superadmin.module-features.destroy', feature.id));
    }

    if (editing) {
        return (
            <tr className="bg-orange-50 dark:bg-orange-950/20">
                <td className="px-3 py-2 font-mono text-xs text-slate-500">{feature.feature_key}</td>
                <td className="px-3 py-2">
                    <input
                        type="text"
                        className="input input-sm w-full"
                        value={data.label_fr}
                        onChange={e => setData('label_fr', e.target.value)}
                    />
                </td>
                <td className="px-3 py-2">
                    <PlanCheckboxes
                        plans={plans}
                        checked={data.available_in_plans}
                        onChange={v => setData('available_in_plans', v)}
                    />
                </td>
                <td className="px-3 py-2">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={e => setData('is_active', e.target.checked)}
                        className="rounded border-slate-300 text-orange-500"
                    />
                </td>
                <td className="px-3 py-2">
                    <div className="flex gap-2">
                        <button
                            onClick={save}
                            disabled={processing}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                            Sauver
                        </button>
                        <button
                            onClick={() => { reset(); setEditing(false); }}
                            className="text-xs text-slate-500 hover:text-slate-700"
                        >
                            Annuler
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-3 py-2 font-mono text-xs text-slate-500">{feature.feature_key}</td>
            <td className="px-3 py-2 text-sm text-slate-800 dark:text-slate-200">{feature.label_fr}</td>
            <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                    {(feature.available_in_plans ?? []).map(p => (
                        <PlanBadge key={p} plan={p} />
                    ))}
                    {(!feature.available_in_plans || feature.available_in_plans.length === 0) && (
                        <span className="text-xs text-slate-400 italic">Aucun plan</span>
                    )}
                </div>
            </td>
            <td className="px-3 py-2">
                {feature.is_active
                    ? <Badge variant="success">Active</Badge>
                    : <Badge variant="neutral">Inactive</Badge>
                }
            </td>
            <td className="px-3 py-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditing(true)}
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                    >
                        Éditer
                    </button>
                    <button
                        onClick={destroy}
                        className="text-xs text-red-500 hover:text-red-600"
                    >
                        Supprimer
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* ────────────────────── Page principale ────────────────────── */
export default function ModuleFeaturesIndex({ features, plans, revisionFlags }) {
    const [showCreate, setShowCreate] = useState(false);
    const [openModules, setOpenModules] = useState({});

    function toggleModule(key) {
        setOpenModules(prev => ({ ...prev, [key]: !prev[key] }));
    }

    function resolveFlag(moduleKey) {
        router.post(route('superadmin.module-features.resolve-flag', moduleKey));
    }

    // features est un objet groupé { module_key: [...features] }
    const moduleKeys = Object.keys(features);
    const totalFeatures = Object.values(features).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <AppLayout title="SuperAdmin — Modules & Plans">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">

                {/* En-tête */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <PageHeader
                        title="Source de vérité — Modules × Plans"
                        subtitle={`${moduleKeys.length} module(s) · ${totalFeatures} feature(s) définies`}
                    />
                    <button
                        onClick={() => setShowCreate(v => !v)}
                        className="btn btn-primary shrink-0"
                    >
                        {showCreate ? '✕ Annuler' : '+ Nouvelle feature'}
                    </button>
                </div>

                {/* Alertes de révision guides */}
                {revisionFlags.length > 0 && (
                    <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-4">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                            ⚠ Guides à réviser après évolutions récentes
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {revisionFlags.map(mk => (
                                <div key={mk} className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/40 rounded px-3 py-1">
                                    <span className="font-mono text-xs text-amber-900 dark:text-amber-200">{mk}</span>
                                    <button
                                        onClick={() => resolveFlag(mk)}
                                        className="text-xs text-green-700 hover:text-green-800 font-medium"
                                    >
                                        Résolu
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Formulaire de création */}
                {showCreate && (
                    <CreateFeatureForm plans={plans} onClose={() => setShowCreate(false)} />
                )}

                {/* Liste par module */}
                {moduleKeys.length === 0 && (
                    <div className="card">
                        <div className="card-body text-center text-slate-400 py-12">
                            Aucune feature définie. Commencez par en créer une.
                        </div>
                    </div>
                )}

                {moduleKeys.map(moduleKey => {
                    const moduleFeatures = features[moduleKey];
                    const isOpen = openModules[moduleKey] !== false; // ouvert par défaut
                    const hasFlag = revisionFlags.includes(moduleKey);

                    return (
                        <div key={moduleKey} className="card">
                            {/* En-tête module (cliquable pour plier) */}
                            <button
                                onClick={() => toggleModule(moduleKey)}
                                className="card-header flex items-center justify-between w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-t-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-orange-500 font-mono uppercase text-sm tracking-wide">
                                        {moduleKey}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {moduleFeatures.length} feature{moduleFeatures.length > 1 ? 's' : ''}
                                    </span>
                                    {hasFlag && (
                                        <Badge variant="warning">Guide à réviser</Badge>
                                    )}
                                </div>
                                <span className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                            </button>

                            {isOpen && (
                                <div className="card-body p-0 overflow-x-auto">
                                    <table className="table-construiro w-full">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs">Clé feature</th>
                                                <th className="px-3 py-2 text-left text-xs">Label FR</th>
                                                <th className="px-3 py-2 text-left text-xs">Plans d'accès</th>
                                                <th className="px-3 py-2 text-left text-xs">Statut</th>
                                                <th className="px-3 py-2 text-left text-xs">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {moduleFeatures.map(feature => (
                                                <FeatureRow
                                                    key={feature.id}
                                                    feature={feature}
                                                    plans={plans}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Légende plans */}
                <div className="card">
                    <div className="card-body py-3">
                        <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">Légende des plans</p>
                        <div className="flex flex-wrap gap-3">
                            {plans.map(plan => (
                                <div key={plan} className="flex items-center gap-1.5">
                                    <PlanBadge plan={plan} />
                                    <span className="text-xs text-slate-500 capitalize">{plan}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
