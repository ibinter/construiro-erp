import { useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

const emptyLine = () => ({ account_id: '', label: '', debit: 0, credit: 0 });

export default function Edit({ entry, accounts }) {
    const { t } = useTrans();

    const form = useForm({
        date:         entry.date?.slice(0, 10) ?? '',
        piece_number: entry.piece_number ?? '',
        label:        entry.label ?? '',
        lines: (entry.lines ?? []).length >= 2
            ? entry.lines.map((l) => ({
                account_id: String(l.account_id ?? ''),
                label:      l.label ?? '',
                debit:      Number(l.debit ?? 0),
                credit:     Number(l.credit ?? 0),
            }))
            : [emptyLine(), emptyLine()],
    });

    const { data, setData, errors } = form;

    const totalDebit  = data.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = data.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    const balanced    = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.005;

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
        form.put(route('accounting.update', entry.id));
    };

    const fmt = (n) =>
        new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

    return (
        <AppLayout header={t('Modifier l\'écriture comptable')}>
            <Head title={t('Modifier l\'écriture')} />

            <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-center gap-2">
                    <Link
                        href={route('accounting.index')}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-orange-600"
                    >
                        <Icon name="arrow-left" className="h-4 w-4" />
                        {t('Retour au journal')}
                    </Link>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-6 text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Écriture')} — {entry.piece_number || `#${entry.id}`}
                    </h2>

                    <form onSubmit={submit} className="space-y-5">
                        {/* En-tête de l'écriture */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                                <InputLabel htmlFor="date" value={t('Date')} required />
                                <TextInput
                                    id="date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                                <InputError message={errors.date} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="piece_number" value={t('Référence / N° pièce')} />
                                <TextInput
                                    id="piece_number"
                                    className="mt-1 block w-full"
                                    value={data.piece_number}
                                    onChange={(e) => setData('piece_number', e.target.value)}
                                    placeholder="FAC-001, OD-023…"
                                />
                                <InputError message={errors.piece_number} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="label" value={t('Description')} required />
                                <TextInput
                                    id="label"
                                    className="mt-1 block w-full"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    placeholder={t('Libellé de l\'écriture')}
                                />
                                <InputError message={errors.label} className="mt-1" />
                            </div>
                        </div>

                        {/* Lignes débit / crédit */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('Lignes comptables')}
                                </h3>
                                <button
                                    type="button"
                                    onClick={addLine}
                                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                                >
                                    <Icon name="plus" className="h-3.5 w-3.5" />
                                    {t('Ajouter une ligne')}
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium text-slate-500">{t('Compte')}</th>
                                            <th className="px-3 py-2 text-left font-medium text-slate-500">{t('Libellé ligne')}</th>
                                            <th className="px-3 py-2 text-right font-medium text-slate-500">{t('Débit')}</th>
                                            <th className="px-3 py-2 text-right font-medium text-slate-500">{t('Crédit')}</th>
                                            <th className="w-8" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {data.lines.map((line, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2">
                                                    <select
                                                        className="block w-full rounded-md border-slate-300 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                                        value={line.account_id}
                                                        onChange={(e) => setLine(i, 'account_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">{t('-- Choisir --')}</option>
                                                        {accounts.map((a) => (
                                                            <option key={a.id} value={a.id}>
                                                                {a.code} — {a.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        className="block w-full rounded-md border-slate-300 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                                        value={line.label}
                                                        onChange={(e) => setLine(i, 'label', e.target.value)}
                                                        placeholder={t('Libellé')}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="block w-28 rounded-md border-slate-300 text-right text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                                        value={line.debit}
                                                        onChange={(e) => setLine(i, 'debit', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        className="block w-28 rounded-md border-slate-300 text-right text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                                        value={line.credit}
                                                        onChange={(e) => setLine(i, 'credit', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    {data.lines.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLine(i)}
                                                            className="text-red-400 hover:text-red-600"
                                                        >
                                                            <Icon name="trash-2" className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            <td colSpan={2} className="px-3 py-2 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                                                {t('Totaux')}
                                            </td>
                                            <td className={`px-3 py-2 text-right text-sm font-semibold ${balanced ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {fmt(totalDebit)}
                                            </td>
                                            <td className={`px-3 py-2 text-right text-sm font-semibold ${balanced ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {fmt(totalCredit)}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {!balanced && (totalDebit > 0 || totalCredit > 0) && (
                                <p className="mt-2 text-xs text-red-500">
                                    {t('L\'écriture n\'est pas équilibrée.')} ({t('écart')} : {fmt(Math.abs(totalDebit - totalCredit))})
                                </p>
                            )}

                            <InputError message={errors.lines} className="mt-1" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <SecondaryButton as={Link} href={route('accounting.index')}>
                                {t('Annuler')}
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={form.processing || !balanced}>
                                <Icon name="save" className="mr-1.5 h-4 w-4" />
                                {t('Enregistrer')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
