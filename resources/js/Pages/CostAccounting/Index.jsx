import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, router, useForm } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

// Libellés et icônes des axes analytiques (FR).
const AXIS = {
    chantier:       { label: 'Chantier',        icon: 'construction' },
    materiel:       { label: 'Matériel',        icon: 'forklift' },
    main_oeuvre:    { label: "Main d'œuvre",     icon: 'users' },
    sous_traitance: { label: 'Sous-traitance',  icon: 'users-round' },
    frais_generaux: { label: 'Frais généraux',  icon: 'briefcase' },
};

// Libellés des types d'écriture.
const ENTRY_TYPE = {
    charge:  { label: 'Charge',  color: 'bg-red-100 text-red-700' },
    produit: { label: 'Produit', color: 'bg-green-100 text-green-700' },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function Index({ breakdown, totals, entries, projects, axes, types, filters, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        project_id: filters.project_id ?? '',
        date: today(),
        axis: 'chantier',
        label: '',
        type: 'charge',
        amount: 0,
        reference: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/cost-accounting', {
            preserveScroll: true,
            onSuccess: () => { form.reset(); form.setData('date', today()); setShowModal(false); },
        });
    };

    const applyProject = (project_id) => {
        router.get('/cost-accounting', { project_id: project_id || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Comptabilité analytique">
            <Head title={t('Comptabilité analytique')} />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <select
                    value={filters.project_id ?? ''}
                    onChange={(e) => applyProject(e.target.value)}
                    className="rounded-md border-slate-300 text-sm focus:border-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900"
                >
                    <option value="">{t('Tous les projets')}</option>
                    {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>

                {can.create && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouvelle écriture')}
                    </button>
                )}
            </div>

            {/* Cartes de synthèse par axe analytique */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Synthèse consolidée */}
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/50 dark:bg-orange-950/30">
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                        <Icon name="pie-chart" className="h-5 w-5" />
                        {t('Marge globale')}
                    </div>
                    <div className="mt-3 text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {formatMoney(totals.marge)}
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-orange-600/70 dark:text-orange-400/70">
                        <span>{t('Produits')} : {formatMoney(totals.produits)}</span>
                        <span>{t('Charges')} : {formatMoney(totals.charges)}</span>
                    </div>
                </div>

                {axes.map((axisKey) => {
                    const a = AXIS[axisKey] ?? { label: axisKey, icon: 'circle' };
                    const row = breakdown.find((b) => b.axis === axisKey) ?? { charges: 0, produits: 0, marge: 0 };
                    return (
                        <div key={axisKey} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2">
                                <Icon name={a.icon} className="h-5 w-5 text-slate-400" />
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{t(a.label)}</span>
                            </div>
                            <div className={`mt-3 text-xl font-bold ${row.marge < 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>
                                {formatMoney(row.marge)}
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-slate-400">
                                <span>{t('Prod.')} {formatMoney(row.produits)}</span>
                                <span>{t('Chg.')} {formatMoney(row.charges)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tableau des écritures */}
            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <Icon name="list" className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('Écritures analytiques')}</h3>
                </div>
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-3">{t('Date')}</th>
                            <th className="px-4 py-3">{t('Libellé')}</th>
                            <th className="px-4 py-3">{t('Axe')}</th>
                            <th className="px-4 py-3">{t('Projet')}</th>
                            <th className="px-4 py-3">{t('Type')}</th>
                            <th className="px-4 py-3 text-right">{t('Montant')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {entries.data.map((entry) => {
                            const ty = ENTRY_TYPE[entry.type] ?? { label: entry.type, color: 'bg-slate-100 text-slate-600' };
                            const a = AXIS[entry.axis] ?? { label: entry.axis };
                            return (
                                <tr key={entry.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 text-slate-500">{fmtDate(entry.date)}</td>
                                    <td className="px-4 py-3 text-slate-800 dark:text-slate-100">
                                        {entry.label}
                                        {entry.reference && <span className="ml-2 text-xs text-slate-400">{entry.reference}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t(a.label)}</td>
                                    <td className="px-4 py-3 text-slate-500">{entry.project?.name ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ty.color}`}>{t(ty.label)}</span>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-medium ${entry.type === 'produit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.type === 'produit' ? '+' : '−'} {formatMoney(entry.amount)}
                                    </td>
                                </tr>
                            );
                        })}

                        {entries.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    <Icon name="pie-chart" className="mx-auto mb-2 h-8 w-8" />
                                    {t('Aucune écriture analytique.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {entries.last_page > 1 && (
                <div className="mt-4 flex flex-wrap gap-1">
                    {entries.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Modal saisie d'écriture */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouvelle écriture analytique')}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="ca_label" value={t('Libellé *')} />
                            <TextInput id="ca_label" className="mt-1 block w-full" placeholder={t('Achat ciment CPA 45')}
                                value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} />
                            <InputError message={form.errors.label} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="ca_axis" value={t('Axe analytique *')} />
                            <select
                                id="ca_axis"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.axis}
                                onChange={(e) => form.setData('axis', e.target.value)}
                            >
                                {axes.map((a) => (
                                    <option key={a} value={a}>{t(AXIS[a]?.label ?? a)}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.axis} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="ca_type" value={t('Type *')} />
                            <select
                                id="ca_type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                            >
                                {types.map((k) => (
                                    <option key={k} value={k}>{t(ENTRY_TYPE[k]?.label ?? k)}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.type} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="ca_amount" value={t('Montant *')} />
                            <TextInput id="ca_amount" type="number" min={0} step="0.01" className="mt-1 block w-full"
                                value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} />
                            <InputError message={form.errors.amount} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="ca_date" value={t('Date *')} />
                            <TextInput id="ca_date" type="date" className="mt-1 block w-full"
                                value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />
                            <InputError message={form.errors.date} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="ca_project" value={t('Projet')} />
                            <select
                                id="ca_project"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                value={form.data.project_id ?? ''}
                                onChange={(e) => form.setData('project_id', e.target.value || null)}
                            >
                                <option value="">{t('— Aucun —')}</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <InputError message={form.errors.project_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="ca_reference" value={t('Référence')} />
                            <TextInput id="ca_reference" className="mt-1 block w-full"
                                value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} />
                            <InputError message={form.errors.reference} className="mt-1" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t("Enregistrer l'écriture")}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
