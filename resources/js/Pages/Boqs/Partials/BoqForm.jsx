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
const UNITS      = ['u', 'm', 'm2', 'm3', 'ml', 'kg', 't', 'forfait', 'j', 'h'];

const BOQ_STATUS = {
    draft:     'Brouillon',
    validated: 'Validé',
};

const emptyLine = () => ({ designation: '', unit: 'u', quantity: 1, unit_price: 0 });

const SELECT_CLS =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm';

/**
 * Formulaire partagé création / édition d'un DPGF.
 *
 * Props :
 *   form              — objet useForm() d'Inertia
 *   clients           — liste { id, name }
 *   projects          — liste { id, name }
 *   statuses          — tableau de clés de statut
 *   unitPrices        — bibliothèque BPU { id, code, designation, unit, unit_price }
 *   onSubmit          — callback (e) => void  [Enregistrer brouillon]
 *   onSubmitValidate  — callback () => void   [Valider le DPGF] (optionnel)
 *   submitLabel       — libellé bouton principal
 */
export default function BoqForm({
    form,
    clients      = [],
    projects     = [],
    statuses     = [],
    unitPrices   = [],
    onSubmit,
    onSubmitValidate,
    submitLabel,
}) {
    const { t } = useTrans();
    const { data, setData, errors, processing } = form;

    // TVA locale — uniquement pour l'affichage (non persistée ; le serveur stocke le HT).
    const [tvaTaux, setTvaTaux] = useState(18);

    // ── Calculs temps réel ──────────────────────────────────────────────────
    const totalHT  = (data.lines ?? []).reduce(
        (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
        0,
    );
    const montantTVA = totalHT * (Number(tvaTaux) || 0) / 100;
    const totalTTC   = totalHT + montantTVA;

    // ── Lignes ──────────────────────────────────────────────────────────────
    const setLine = (index, key, value) => {
        const lines = [...data.lines];
        lines[index] = { ...lines[index], [key]: value };
        setData('lines', lines);
    };

    // Pré-remplit une ligne depuis la bibliothèque de prix BPU.
    const applyUnitPrice = (index, upId) => {
        if (!upId) return;
        const up = unitPrices.find((u) => String(u.id) === String(upId));
        if (!up) return;
        const lines = [...data.lines];
        lines[index] = {
            ...lines[index],
            designation: up.designation,
            unit:        up.unit,
            unit_price:  up.unit_price,
        };
        setData('lines', lines);
    };

    const addLine    = () => setData('lines', [...(data.lines ?? []), emptyLine()]);
    const removeLine = (i) => {
        const next = (data.lines ?? []).filter((_, idx) => idx !== i);
        setData('lines', next.length ? next : [emptyLine()]);
    };

    // ── Helper champ texte ───────────────────────────────────────────────────
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

            {/* ── Informations générales ────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">
                    {t('Informations générales')}
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code',  t('Code DPGF *'), { placeholder: 'DPGF-2026-001' })}
                    {field('title', t('Intitulé / Objet *'), { placeholder: t('Décomposition du prix — Lot Gros Œuvre') })}

                    {/* Lot (texte libre) */}
                    {field('lot', t('Lot'), { placeholder: t('Ex : Lot 01 — Gros Œuvre') })}

                    {/* Projet rattaché */}
                    <div>
                        <InputLabel htmlFor="project_id" value={t('Projet rattaché')} />
                        <select
                            id="project_id"
                            className={SELECT_CLS}
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

                    {/* Client */}
                    <div>
                        <InputLabel htmlFor="client_id" value={t('Client / Maître d\'ouvrage')} />
                        <select
                            id="client_id"
                            className={SELECT_CLS}
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

                    {/* Statut */}
                    <div>
                        <InputLabel htmlFor="status" value={t('Statut *')} />
                        <select
                            id="status"
                            className={SELECT_CLS}
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {(statuses.length ? statuses : Object.keys(BOQ_STATUS)).map((s) => (
                                <option key={s} value={s}>{t(BOQ_STATUS[s] ?? s)}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>

                    {/* Devise */}
                    <div>
                        <InputLabel htmlFor="currency" value={t('Devise *')} />
                        <select
                            id="currency"
                            className={SELECT_CLS}
                            value={data.currency}
                            onChange={(e) => setData('currency', e.target.value)}
                        >
                            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <InputError message={errors.currency} className="mt-1" />
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                    <InputLabel htmlFor="notes" value={t('Notes / Conditions particulières')} />
                    <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                        value={data.notes ?? ''}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder={t('Précisions techniques, conditions d\'exécution…')}
                    />
                    <InputError message={errors.notes} className="mt-1" />
                </div>
            </div>

            {/* ── Tableau des lignes ────────────────────────────────────── */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                        {t('Détail des postes')}
                    </h3>
                    <button
                        type="button"
                        onClick={addLine}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        {t('Ajouter un poste')}
                    </button>
                </div>

                <InputError message={errors.lines} className="mb-3" />

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                <th className="pb-2 pr-2 w-10 text-center">{t('N°')}</th>
                                <th className="pb-2 pr-2">{t('Désignation')}</th>
                                {unitPrices.length > 0 && (
                                    <th className="pb-2 px-2 w-44">{t('BPU')}</th>
                                )}
                                <th className="pb-2 px-2 w-24">{t('Unité')}</th>
                                <th className="pb-2 px-2 w-28">{t('Quantité')}</th>
                                <th className="pb-2 px-2 w-36">{t('P.U. HT')}</th>
                                <th className="pb-2 px-2 w-36 text-right">{t('Montant HT')}</th>
                                <th className="pb-2 pl-2 w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(data.lines ?? []).map((line, i) => {
                                const lineTotal = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0);
                                return (
                                    <tr key={i} className="align-middle">
                                        {/* Numéro article */}
                                        <td className="py-1.5 pr-2 text-center text-slate-400 font-mono text-xs">
                                            {String(i + 1).padStart(2, '0')}
                                        </td>

                                        {/* Désignation */}
                                        <td className="py-1.5 pr-2">
                                            <TextInput
                                                className="block w-full"
                                                value={line.designation}
                                                onChange={(e) => setLine(i, 'designation', e.target.value)}
                                                placeholder={t('Ex : Béton dosé 350 kg/m3')}
                                            />
                                            <InputError message={errors[`lines.${i}.designation`]} className="mt-1" />
                                        </td>

                                        {/* BPU import */}
                                        {unitPrices.length > 0 && (
                                            <td className="py-1.5 px-2">
                                                <select
                                                    className="block w-full rounded-md border-gray-300 text-xs shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                    value=""
                                                    onChange={(e) => applyUnitPrice(i, e.target.value)}
                                                >
                                                    <option value="">{t('— BPU —')}</option>
                                                    {unitPrices.map((up) => (
                                                        <option key={up.id} value={up.id}>
                                                            {up.code} · {up.designation}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}

                                        {/* Unité */}
                                        <td className="py-1.5 px-2">
                                            <select
                                                className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                                value={line.unit ?? 'u'}
                                                onChange={(e) => setLine(i, 'unit', e.target.value)}
                                            >
                                                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </td>

                                        {/* Quantité */}
                                        <td className="py-1.5 px-2">
                                            <TextInput
                                                type="number" min={0} step="0.001"
                                                className="block w-full"
                                                value={line.quantity}
                                                onChange={(e) => setLine(i, 'quantity', e.target.value)}
                                            />
                                            <InputError message={errors[`lines.${i}.quantity`]} className="mt-1" />
                                        </td>

                                        {/* Prix unitaire */}
                                        <td className="py-1.5 px-2">
                                            <TextInput
                                                type="number" min={0} step="0.01"
                                                className="block w-full"
                                                value={line.unit_price}
                                                onChange={(e) => setLine(i, 'unit_price', e.target.value)}
                                            />
                                            <InputError message={errors[`lines.${i}.unit_price`]} className="mt-1" />
                                        </td>

                                        {/* Montant HT */}
                                        <td className="py-1.5 px-2 text-right font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                                            {formatMoney(lineTotal, data.currency)}
                                        </td>

                                        {/* Supprimer */}
                                        <td className="py-1.5 pl-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeLine(i)}
                                                title={t('Supprimer ce poste')}
                                                className="text-slate-300 hover:text-red-600 transition-colors"
                                            >
                                                <Icon name="trash-2" className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {(data.lines ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={unitPrices.length > 0 ? 8 : 7} className="py-10 text-center text-sm text-slate-400">
                                        {t('Aucun poste. Cliquez sur « Ajouter un poste ».')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Totaux ─────────────────────────────────────────────── */}
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        {/* Total HT */}
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>{t('Total HT')}</span>
                            <span className="tabular-nums">{formatMoney(totalHT, data.currency)}</span>
                        </div>

                        {/* TVA — taux local, affichage uniquement */}
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1">
                                {t('TVA')}
                                <span className="inline-flex items-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={tvaTaux}
                                        onChange={(e) => setTvaTaux(Math.min(100, Math.max(0, Number(e.target.value))))}
                                        className="mx-1 w-14 rounded border border-slate-300 px-1 py-0.5 text-right text-xs focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                                        title={t('Taux TVA (affichage uniquement)')}
                                    />
                                    %
                                </span>
                            </span>
                            <span className="tabular-nums">{formatMoney(montantTVA, data.currency)}</span>
                        </div>

                        {/* Total TTC */}
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
                            <span>{t('Total TTC')}</span>
                            <span className="text-orange-600 tabular-nums">{formatMoney(totalTTC, data.currency)}</span>
                        </div>

                        <p className="text-right text-xs text-slate-400 italic">
                            {t('TVA indicative — le serveur enregistre le montant HT.')}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Boutons d'action ──────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-end gap-3">
                <Link
                    href="/boq"
                    className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {t('Annuler')}
                </Link>

                {/* Enregistrer brouillon */}
                <PrimaryButton
                    type="submit"
                    disabled={processing}
                    className="bg-slate-600 hover:bg-slate-700 focus:bg-slate-700"
                >
                    <Icon name="save" className="mr-1.5 h-4 w-4" />
                    {submitLabel ?? t('Enregistrer brouillon')}
                </PrimaryButton>

                {/* Valider le DPGF */}
                {onSubmitValidate && (
                    <PrimaryButton
                        type="button"
                        disabled={processing}
                        onClick={onSubmitValidate}
                        className="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600"
                    >
                        <Icon name="check-circle" className="mr-1.5 h-4 w-4" />
                        {t('Valider le DPGF')}
                    </PrimaryButton>
                )}
            </div>
        </form>
    );
}
