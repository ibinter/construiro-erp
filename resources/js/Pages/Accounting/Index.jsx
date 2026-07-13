import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

const today = () => new Date().toISOString().slice(0, 10);

const emptyLine = () => ({ account_id: '', label: '', debit: 0, credit: 0 });

export default function Index({ entries, accounts, can }) {
    const { t } = useTrans();
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        date: today(),
        piece_number: '',
        label: '',
        lines: [emptyLine(), emptyLine()],
    });

    const { data, setData } = form;

    // Contrôle d'équilibre côté client (le serveur reste la source de vérité).
    const totalDebit = (data.lines ?? []).reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = (data.lines ?? []).reduce((s, l) => s + (Number(l.credit) || 0), 0);
    const balanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.005;

    const setLine = (index, key, value) => {
        const lines = [...data.lines];
        lines[index] = { ...lines[index], [key]: value };
        setData('lines', lines);
    };

    const addLine = () => setData('lines', [...data.lines, emptyLine()]);

    const removeLine = (index) => {
        const lines = data.lines.filter((_, i) => i !== index);
        setData('lines', lines.length >= 2 ? lines : [emptyLine(), emptyLine()]);
    };

    const submit = (e) => {
        e.preventDefault();
        form.post('/accounting', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('date', today());
                form.setData('lines', [emptyLine(), emptyLine()]);
                setShowModal(false);
            },
        });
    };

    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

    return (
        <AppLayout header="Comptabilité générale">
            <Head title={t('Comptabilité générale — Journal')} />

            {/* Barre d'actions */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href="/accounting/accounts"
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                    <Icon name="book" className="h-4 w-4" />
                    {t('Plan comptable')}
                </Link>

                {can.create && (
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={accounts.length < 2}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-40"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Nouvelle écriture')}
                    </button>
                )}
            </div>

            {/* Journal : liste des écritures */}
            <div className="space-y-4">
                {entries.data.map((entry) => {
                    const debit = (entry.lines ?? []).reduce((s, l) => s + Number(l.debit || 0), 0);
                    return (
                        <div key={entry.id} className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
                                <div>
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">{entry.label}</span>
                                    <span className="ml-2 text-xs text-slate-400">
                                        {fmtDate(entry.date)}{entry.piece_number ? ` · ${t('Pièce')} ${entry.piece_number}` : ''}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{formatMoney(debit)}</span>
                            </div>
                            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-2">{t('Compte')}</th>
                                        <th className="px-5 py-2">{t('Libellé')}</th>
                                        <th className="px-5 py-2 text-right">{t('Débit')}</th>
                                        <th className="px-5 py-2 text-right">{t('Crédit')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {(entry.lines ?? []).map((line) => (
                                        <tr key={line.id} className="text-sm">
                                            <td className="px-5 py-2 text-slate-700 dark:text-slate-200">
                                                <span className="font-mono">{line.account?.code}</span>
                                                <span className="ml-2 text-slate-400">{line.account?.label}</span>
                                            </td>
                                            <td className="px-5 py-2 text-slate-500">{line.label ?? '—'}</td>
                                            <td className="px-5 py-2 text-right text-slate-700 dark:text-slate-200">
                                                {Number(line.debit) > 0 ? formatMoney(line.debit) : ''}
                                            </td>
                                            <td className="px-5 py-2 text-right text-slate-700 dark:text-slate-200">
                                                {Number(line.credit) > 0 ? formatMoney(line.credit) : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}

                {entries.data.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 dark:border-slate-700">
                        <Icon name="book" className="mx-auto mb-2 h-8 w-8" />
                        {t('Aucune écriture au journal.')}
                    </div>
                )}
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

            {/* Modal nouvelle écriture (lignes débit / crédit + vérif équilibre) */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="2xl">
                <form onSubmit={submit} className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Nouvelle écriture')}</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="je_label" value={t('Libellé *')} />
                            <TextInput id="je_label" className="mt-1 block w-full" placeholder={t('Achat de matériaux')}
                                value={data.label} onChange={(e) => setData('label', e.target.value)} />
                            <InputError message={form.errors.label} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="je_date" value={t('Date *')} />
                            <TextInput id="je_date" type="date" className="mt-1 block w-full"
                                value={data.date} onChange={(e) => setData('date', e.target.value)} />
                            <InputError message={form.errors.date} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="je_piece" value={t('N° de pièce')} />
                            <TextInput id="je_piece" className="mt-1 block w-full" placeholder="PC-2026-001"
                                value={data.piece_number} onChange={(e) => setData('piece_number', e.target.value)} />
                            <InputError message={form.errors.piece_number} className="mt-1" />
                        </div>
                    </div>

                    {/* Lignes de l'écriture */}
                    <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                            <InputLabel value={t('Lignes (débit / crédit)')} />
                            <button
                                type="button"
                                onClick={addLine}
                                className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-orange-600"
                            >
                                <Icon name="plus" className="h-3.5 w-3.5" /> {t('Ligne')}
                            </button>
                        </div>
                        <InputError message={form.errors.lines} className="mb-2" />

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        <th className="pb-2 pr-2">{t('Compte')}</th>
                                        <th className="pb-2 px-2">{t('Libellé')}</th>
                                        <th className="pb-2 px-2 w-32">{t('Débit')}</th>
                                        <th className="pb-2 px-2 w-32">{t('Crédit')}</th>
                                        <th className="pb-2 pl-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.lines.map((line, i) => (
                                        <tr key={i} className="align-top">
                                            <td className="py-1 pr-2">
                                                <select
                                                    className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                    value={line.account_id}
                                                    onChange={(e) => setLine(i, 'account_id', e.target.value)}
                                                >
                                                    <option value="">{t('— Compte —')}</option>
                                                    {accounts.map((a) => (
                                                        <option key={a.id} value={a.id}>{a.code} · {a.label}</option>
                                                    ))}
                                                </select>
                                                <InputError message={form.errors[`lines.${i}.account_id`]} className="mt-1" />
                                            </td>
                                            <td className="py-1 px-2">
                                                <TextInput className="block w-full"
                                                    value={line.label ?? ''}
                                                    onChange={(e) => setLine(i, 'label', e.target.value)} />
                                            </td>
                                            <td className="py-1 px-2">
                                                <TextInput type="number" min={0} step="0.01" className="block w-full"
                                                    value={line.debit}
                                                    onChange={(e) => setLine(i, 'debit', e.target.value)} />
                                            </td>
                                            <td className="py-1 px-2">
                                                <TextInput type="number" min={0} step="0.01" className="block w-full"
                                                    value={line.credit}
                                                    onChange={(e) => setLine(i, 'credit', e.target.value)} />
                                            </td>
                                            <td className="py-1 pl-2 text-center">
                                                <button type="button" onClick={() => removeLine(i)} className="text-slate-300 hover:text-red-600">
                                                    <Icon name="trash-2" className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <td className="pt-2 pr-2 text-right" colSpan={2}>{t('Totaux')}</td>
                                        <td className="pt-2 px-2 text-right">{formatMoney(totalDebit)}</td>
                                        <td className="pt-2 px-2 text-right">{formatMoney(totalCredit)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Indicateur d'équilibre */}
                        <div className={`mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                            balanced
                                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                        }`}>
                            <Icon name={balanced ? 'check-circle' : 'alert-circle'} className="h-4 w-4" />
                            {balanced
                                ? t('Écriture équilibrée.')
                                : `${t('Écriture déséquilibrée : débit')} ${formatMoney(totalDebit)} ≠ ${t('crédit')} ${formatMoney(totalCredit)}.`}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>{t('Annuler')}</SecondaryButton>
                        <PrimaryButton disabled={form.processing || !balanced} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                            {t("Enregistrer l'écriture")}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
