import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Icon from '@/Components/Icon';
import { Link } from '@inertiajs/react';
import { formatMoney } from '@/constants';

const CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GHS', 'NGN'];
const UNITS = ['u', 'm2', 'm3', 'ml', 'kg', 't', 'forfait', 'j', 'h'];

const QUOTE_STATUS = {
    draft:    'Brouillon',
    sent:     'Envoyé',
    accepted: 'Accepté',
    rejected: 'Rejeté',
    expired:  'Expiré',
};

const emptyLine = () => ({ designation: '', unit: 'u', quantity: 1, unit_price: 0 });

/**
 * Formulaire partagé création / édition d'un devis.
 * Gère les lignes dynamiques et recalcule les totaux côté client pour l'affichage.
 * `form` est l'objet retourné par useForm() d'Inertia (avec data.lines : array).
 */
export default function QuoteForm({ form, projects = [], statuses = [], onSubmit, submitLabel }) {
    const { data, setData, errors, processing } = form;

    // Recalcul temps réel (affichage uniquement — le serveur reste la source de vérité).
    const subtotal = (data.lines ?? []).reduce(
        (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
        0
    );
    const taxAmount = subtotal * ((Number(data.tax_rate) || 0) / 100);
    const total = subtotal + taxAmount;

    const setLine = (index, key, value) => {
        const lines = [...data.lines];
        lines[index] = { ...lines[index], [key]: value };
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Informations générales</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', 'Code devis *', { placeholder: 'DEV-2026-001' })}
                    {field('title', 'Intitulé *', { placeholder: 'Construction villa R+1' })}
                    {field('client_name', 'Client', { placeholder: 'Nom du client' })}

                    <div>
                        <InputLabel htmlFor="project_id" value="Projet rattaché" />
                        <select
                            id="project_id"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.project_id ?? ''}
                            onChange={(e) => setData('project_id', e.target.value || null)}
                        >
                            <option value="">— Aucun —</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.project_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value="Statut *" />
                        <select
                            id="status"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {(statuses.length ? statuses : Object.keys(QUOTE_STATUS)).map((s) => (
                                <option key={s} value={s}>{QUOTE_STATUS[s] ?? s}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="currency" value="Devise *" />
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

                    {field('tax_rate', 'TVA (%) *', { type: 'number', min: 0, max: 100, step: '0.01' })}
                    {field('date', 'Date du devis', { type: 'date' })}
                    {field('valid_until', 'Valable jusqu\'au', { type: 'date' })}
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="notes" value="Notes" />
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

            {/* Lignes du devis */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Lignes du devis</h3>
                    <button
                        type="button"
                        onClick={addLine}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" /> Ajouter une ligne
                    </button>
                </div>

                <InputError message={errors.lines} className="mb-2" />

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="pb-2 pr-2">Désignation</th>
                                <th className="pb-2 px-2 w-24">Unité</th>
                                <th className="pb-2 px-2 w-28">Quantité</th>
                                <th className="pb-2 px-2 w-36">P.U.</th>
                                <th className="pb-2 px-2 w-36 text-right">Total</th>
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
                                                placeholder="Béton dosé 350 kg/m3"
                                            />
                                            <InputError message={errors[`lines.${i}.designation`]} className="mt-1" />
                                        </td>
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

                {/* Totaux */}
                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Sous-total HT</span>
                            <span>{formatMoney(subtotal, data.currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>TVA ({Number(data.tax_rate) || 0} %)</span>
                            <span>{formatMoney(taxAmount, data.currency)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
                            <span>Total TTC</span>
                            <span>{formatMoney(total, data.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/quotes"
                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Annuler
                </Link>
                <PrimaryButton disabled={processing} className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600">
                    {submitLabel}
                </PrimaryButton>
            </div>
        </form>
    );
}
