import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Icon from '@/Components/Icon';
import { Link } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];
const UNITS = ['u', 'm2', 'm3', 'ml', 'kg', 'forfait'];

const BOQ_STATUS = {
    draft:     'Brouillon',
    validated: 'Validé',
};

const emptyLine = () => ({ designation: '', unit: 'u', quantity: 1, unit_price: 0 });

/**
 * Formulaire partagé création / édition d'un DQE.
 * Gère les lignes dynamiques, le pré-remplissage depuis la bibliothèque de prix
 * (BPU) et recalcule le total côté client pour l'affichage.
 * `form` est l'objet retourné par useForm() d'Inertia (avec data.lines : array).
 */
export default function BoqForm({ form, clients = [], projects = [], statuses = [], unitPrices = [], onSubmit, submitLabel }) {
    const { t } = useTrans();
    const { data, setData, errors, processing } = form;

    // Recalcul temps réel (affichage uniquement — le serveur reste la source de vérité).
    const total = (data.lines ?? []).reduce(
        (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
        0
    );

    const setLine = (index, key, value) => {
        const lines = [...data.lines];
        lines[index] = { ...lines[index], [key]: value };
        setData('lines', lines);
    };

    // Pré-remplit une ligne à partir d'un prix unitaire de la bibliothèque (BPU).
    const applyUnitPrice = (index, unitPriceId) => {
        if (! unitPriceId) return;
        const up = unitPrices.find((u) => String(u.id) === String(unitPriceId));
        if (! up) return;
        const lines = [...data.lines];
        lines[index] = {
            ...lines[index],
            designation: up.designation,
            unit: up.unit,
            unit_price: up.unit_price,
        };
        setData('lines', lines);
    };

    const addLine = () => setData('lines', [...data.lines, emptyLine()]);

    const removeLine = (index) => {
        const lines = data.lines.filter((_, i) => i !== index);
        setData('lines', lines.length ? lines : [emptyLine()]);
    };

    const field = (name, label, props = {}) => (
        <div>
            <InputLabel htmlFor={name} value={label} />
            <TextInput
                id={name}
                className="mt-1 block w-full"
                value={data[name] ?? ''}
                onChange={(e) => setData(name, e.target.value)}
                {...props}
            />
            <InputError message={errors[name]} className="mt-1" />
        </div>
    );

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* En-tête */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Informations générales')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', t('Code DQE *'), { placeholder: 'DQE-2026-001' })}
                    {field('title', t('Intitulé *'), { placeholder: t('Devis quantitatif — Villa R+1') })}

                    <div>
                        <InputLabel htmlFor="client_id" value={t('Client')} />
                        <select
                            id="client_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.client_id ?? ''}
                            onChange={(e) => setData('client_id', e.target.value || null)}
                        >
                            <option value="">{t('— Aucun —')}</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.client_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="project_id" value={t('Projet rattaché')} />
                        <select
                            id="project_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.project_id ?? ''}
                            onChange={(e) => setData('project_id', e.target.value || null)}
                        >
                            <option value="">{t('— Aucun —')}</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.project_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value={t('Statut *')} />
                        <select
                            id="status"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {(statuses.length ? statuses : Object.keys(BOQ_STATUS)).map((s) => (
                                <option key={s} value={s}>{t(BOQ_STATUS[s] ?? s)}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="currency" value={t('Devise *')} />
                        <select
                            id="currency"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.currency}
                            onChange={(e) => setData('currency', e.target.value)}
                        >
                            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <InputError message={errors.currency} className="mt-1" />
                    </div>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="notes" value={t('Notes')} />
                    <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        value={data.notes ?? ''}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                    <InputError message={errors.notes} className="mt-1" />
                </div>
            </div>

            {/* Lignes du DQE */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('Lignes du DQE')}</h3>
                    <button
                        type="button"
                        onClick={addLine}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" /> {t('Ajouter une ligne')}
                    </button>
                </div>

                <InputError message={errors.lines} className="mb-2" />

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="pb-2 pr-2">{t('Désignation')}</th>
                                {unitPrices.length > 0 && <th className="pb-2 px-2 w-44">{t('BPU')}</th>}
                                <th className="pb-2 px-2 w-24">{t('Unité')}</th>
                                <th className="pb-2 px-2 w-28">{t('Quantité')}</th>
                                <th className="pb-2 px-2 w-36">{t('P.U.')}</th>
                                <th className="pb-2 px-2 w-36 text-right">{t('Total')}</th>
                                <th className="pb-2 pl-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.lines ?? []).map((line, i) => {
                                const lineTotal = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0);
                                return (
                                    <tr key={i} className="align-top">
                                        <td className="py-1 pr-2">
                                            <TextInput
                                                className="block w-full"
                                                value={line.designation}
                                                onChange={(e) => setLine(i, 'designation', e.target.value)}
                                                placeholder={t('Béton dosé 350 kg/m3')}
                                            />
                                            <InputError message={errors[`lines.${i}.designation`]} className="mt-1" />
                                        </td>
                                        {unitPrices.length > 0 && (
                                            <td className="py-1 px-2">
                                                <select
                                                    className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                    value=""
                                                    onChange={(e) => applyUnitPrice(i, e.target.value)}
                                                >
                                                    <option value="">{t('— Depuis BPU —')}</option>
                                                    {unitPrices.map((up) => (
                                                        <option key={up.id} value={up.id}>{up.code} · {up.designation}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}
                                        <td className="py-1 px-2">
                                            <select
                                                className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                value={line.unit ?? ''}
                                                onChange={(e) => setLine(i, 'unit', e.target.value)}
                                            >
                                                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-1 px-2">
                                            <TextInput
                                                type="number" min={0} step="0.001"
                                                className="block w-full"
                                                value={line.quantity}
                                                onChange={(e) => setLine(i, 'quantity', e.target.value)}
                                            />
                                            <InputError message={errors[`lines.${i}.quantity`]} className="mt-1" />
                                        </td>
                                        <td className="py-1 px-2">
                                            <TextInput
                                                type="number" min={0} step="0.01"
                                                className="block w-full"
                                                value={line.unit_price}
                                                onChange={(e) => setLine(i, 'unit_price', e.target.value)}
                                            />
                                            <InputError message={errors[`lines.${i}.unit_price`]} className="mt-1" />
                                        </td>
                                        <td className="py-1 px-2 text-right font-medium text-slate-700 dark:text-slate-200">
                                            {formatMoney(lineTotal, data.currency)}
                                        </td>
                                        <td className="py-1 pl-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeLine(i)}
                                                className="text-slate-300 hover:text-red-600"
                                            >
                                                <Icon name="trash-2" className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Total */}
                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
                            <span>{t('Total')}</span>
                            <span>{formatMoney(total, data.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/boq"
                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {t('Annuler')}
                </Link>
                <PrimaryButton disabled={processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                    {submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}
