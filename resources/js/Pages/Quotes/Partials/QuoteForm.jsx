import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Icon from '@/Components/Icon';
import { Link } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

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
 *
 * Props :
 *   form          — objet useForm() d'Inertia
 *   clients       — liste des clients { id, name }
 *   projects      — liste des projets { id, name }
 *   statuses      — tableau des clés de statut
 *   onSubmit      — callback (e) => void  [Enregistrer brouillon]
 *   onSubmitSend  — callback (e) => void  [Enregistrer & Envoyer] (optionnel)
 *   submitLabel   — libellé du bouton principal
 */
export default function QuoteForm({
    form,
    clients = [],
    projects = [],
    statuses = [],
    onSubmit,
    onSubmitSend,
    submitLabel,
}) {
    const { t } = useTrans();
    const { data, setData, errors, processing } = form;

    // Remise locale : affichage uniquement, non persistée (le serveur recalcule depuis les lignes).
    const [discount, setDiscount] = useState(0);

    // ── Calculs temps réel ────────────────────────────────────────────────────
    const grossSubtotal = (data.lines ?? []).reduce(
        (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
        0
    );
    const discountAmount = grossSubtotal * ((Number(discount) || 0) / 100);
    const subtotalAfterDiscount = grossSubtotal - discountAmount;
    const taxAmount = subtotalAfterDiscount * ((Number(data.tax_rate) || 0) / 100);
    const total = subtotalAfterDiscount + taxAmount;

    // ── Manipulation des lignes ───────────────────────────────────────────────
    const setLine = (index, key, value) => {
        const lines = [...data.lines];
        lines[index] = { ...lines[index], [key]: value };
        setData('lines', lines);
    };

    const addLine = () => setData('lines', [...(data.lines ?? []), emptyLine()]);

    const removeLine = (index) => {
        const lines = (data.lines ?? []).filter((_, i) => i !== index);
        setData('lines', lines.length ? lines : [emptyLine()]);
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
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

    const selectClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';

    return (
        <form onSubmit={onSubmit} className="space-y-6">

            {/* ─── Informations générales ────────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
                    {t('Informations générales')}
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Code devis */}
                    {field('code', t('Code devis *'), { placeholder: 'DEV-2026-001' })}

                    {/* Intitulé / Objet */}
                    {field('title', t('Objet du devis *'), { placeholder: 'Construction villa R+1' })}

                    {/* Client — select si liste dispo, sinon saisie libre */}
                    {clients.length > 0 ? (
                        <div>
                            <InputLabel htmlFor="client_id" value={t('Client')} />
                            <select
                                id="client_id"
                                className={selectClass}
                                value={data.client_id ?? ''}
                                onChange={(e) => {
                                    setData('client_id', e.target.value || null);
                                    setData('client_name', '');
                                }}
                            >
                                <option value="">{t('— Aucun —')}</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.client_id} className="mt-1" />
                        </div>
                    ) : (
                        field('client_name', t('Client (saisie libre)'), { placeholder: t('Nom du client') })
                    )}

                    {/* Projet */}
                    <div>
                        <InputLabel htmlFor="project_id" value={t('Projet rattaché')} />
                        <select
                            id="project_id"
                            className={selectClass}
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

                    {/* Date du devis */}
                    {field('date', t('Date du devis'), { type: 'date' })}

                    {/* Valable jusqu'au */}
                    {field('valid_until', t('Valable jusqu\'au'), { type: 'date' })}

                    {/* Statut */}
                    <div>
                        <InputLabel htmlFor="status" value={t('Statut *')} />
                        <select
                            id="status"
                            className={selectClass}
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {(statuses.length ? statuses : Object.keys(QUOTE_STATUS)).map((s) => (
                                <option key={s} value={s}>{t(QUOTE_STATUS[s] ?? s)}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>

                    {/* Devise */}
                    <div>
                        <InputLabel htmlFor="currency" value={t('Devise *')} />
                        <select
                            id="currency"
                            className={selectClass}
                            value={data.currency}
                            onChange={(e) => setData('currency', e.target.value)}
                        >
                            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <InputError message={errors.currency} className="mt-1" />
                    </div>

                    {/* TVA */}
                    {field('tax_rate', t('TVA (%) *'), { type: 'number', min: 0, max: 100, step: '0.01' })}
                </div>

                {/* Notes / Conditions de paiement */}
                <div className="mt-4">
                    <InputLabel htmlFor="notes" value={t('Conditions de paiement / Notes')} />
                    <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        value={data.notes ?? ''}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder={t('Ex : Paiement à 30 jours, acompte de 30 % à la commande…')}
                    />
                    <InputError message={errors.notes} className="mt-1" />
                </div>
            </div>

            {/* ─── Lignes du devis ───────────────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                        {t('Lignes du devis')}
                    </h3>
                    <button
                        type="button"
                        onClick={addLine}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Ajouter une ligne')}
                    </button>
                </div>

                <InputError message={errors.lines} className="mb-2" />

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="pb-2 pr-2">{t('Désignation')}</th>
                                <th className="pb-2 px-2 w-24">{t('Unité')}</th>
                                <th className="pb-2 px-2 w-28">{t('Quantité')}</th>
                                <th className="pb-2 px-2 w-36">{t('P.U. HT')}</th>
                                <th className="pb-2 px-2 w-36 text-right">{t('Sous-total')}</th>
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
                                        <td className="py-1 px-2">
                                            <select
                                                className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                value={line.unit ?? 'u'}
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
                                                title={t('Supprimer la ligne')}
                                            >
                                                <Icon name="trash-2" className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {(data.lines ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                                        {t('Aucune ligne. Cliquez sur « Ajouter une ligne ».')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Totaux ─────────────────────────────────────────────────── */}
                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        {/* Sous-total brut */}
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>{t('Sous-total HT')}</span>
                            <span>{formatMoney(grossSubtotal, data.currency)}</span>
                        </div>

                        {/* Remise (display-only, non soumise au serveur) */}
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1">
                                {t('Remise')}
                                <span className="inline-flex items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={discount}
                                        onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                        className="mx-1 w-14 rounded border border-slate-300 px-1 py-0.5 text-right text-xs focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                                    />
                                    %
                                </span>
                            </span>
                            <span className="text-red-500">
                                {discount > 0 ? `- ${formatMoney(discountAmount, data.currency)}` : '—'}
                            </span>
                        </div>

                        {/* Sous-total après remise */}
                        {discount > 0 && (
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>{t('Sous-total après remise')}</span>
                                <span>{formatMoney(subtotalAfterDiscount, data.currency)}</span>
                            </div>
                        )}

                        {/* TVA */}
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>{t('TVA')} ({Number(data.tax_rate) || 0} %)</span>
                            <span>{formatMoney(taxAmount, data.currency)}</span>
                        </div>

                        {/* Total TTC */}
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
                            <span>{t('Total TTC')}</span>
                            <span className="text-orange-600">{formatMoney(total, data.currency)}</span>
                        </div>

                        {discount > 0 && (
                            <p className="text-right text-xs text-slate-400 italic">
                                {t('La remise est indicative et non enregistrée.')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Boutons d'action ──────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-end gap-3">
                <Link
                    href="/quotes"
                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {t('Annuler')}
                </Link>

                {/* Bouton principal : enregistrer brouillon */}
                <PrimaryButton
                    type="submit"
                    disabled={processing}
                    className="bg-slate-600 hover:bg-slate-700 focus:bg-slate-700"
                >
                    <Icon name="save" className="mr-1.5 h-4 w-4" />
                    {submitLabel ?? t('Enregistrer brouillon')}
                </PrimaryButton>

                {/* Bouton secondaire : enregistrer & envoyer (si callback fourni) */}
                {onSubmitSend && (
                    <PrimaryButton
                        type="button"
                        disabled={processing}
                        onClick={onSubmitSend}
                        className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600"
                    >
                        <Icon name="send" className="mr-1.5 h-4 w-4" />
                        {t('Enregistrer & Envoyer')}
                    </PrimaryButton>
                )}
            </div>
        </form>
    );
}
