import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Icon from '@/Components/Icon';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

const UNITS = ['u', 'm2', 'm3', 'ml', 'kg', 'forfait'];

const TAKEOFF_STATUS = {
    draft:     'Brouillon',
    validated: 'Validé',
};

const emptyLine = () => ({
    designation: '', unit: 'u', length: '', width: '', height: '', count: 1, quantity: 0, notes: '',
});

/**
 * Calcule la quantité d'une ligne pour l'affichage : si au moins une dimension
 * est renseignée, quantité = nombre × dimensions renseignées ; sinon on garde
 * la quantité saisie directement. (Le serveur reste la source de vérité.)
 */
const computeQuantity = (line) => {
    const dims = ['length', 'width', 'height']
        .map((k) => line[k])
        .filter((v) => v !== '' && v !== null && v !== undefined);

    if (dims.length === 0) {
        return Number(line.quantity) || 0;
    }
    return dims.reduce((acc, v) => acc * (Number(v) || 0), Number(line.count) || 1);
};

/**
 * Formulaire partagé création / édition d'un métré.
 * Gère les lignes dynamiques avec dimensions. `form` provient de useForm().
 */
export default function TakeoffForm({ form, projects = [], statuses = [], onSubmit, submitLabel }) {
    const { t } = useTrans();
    const { data, setData, errors, processing } = form;

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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Informations générales')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', t('Code métré *'), { placeholder: 'MET-2026-001' })}
                    {field('title', t('Intitulé *'), { placeholder: t('Métré gros œuvre R+1') })}

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
                            {(statuses.length ? statuses : Object.keys(TAKEOFF_STATUS)).map((s) => (
                                <option key={s} value={s}>{t(TAKEOFF_STATUS[s] ?? s)}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
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

            {/* Lignes du métré */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{t('Lignes de métré')}</h3>
                    <button
                        type="button"
                        onClick={addLine}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <Icon name="plus" className="h-4 w-4" /> {t('Ajouter une ligne')}
                    </button>
                </div>

                <p className="mb-4 text-xs text-slate-400">
                    {t('Renseignez les dimensions (L × l × h) pour un calcul automatique, sinon saisissez directement la quantité.')}
                </p>

                <InputError message={errors.lines} className="mb-2" />

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="pb-2 pr-2">{t('Désignation')}</th>
                                <th className="pb-2 px-2 w-20">{t('Unité')}</th>
                                <th className="pb-2 px-2 w-20">{t('Nb')}</th>
                                <th className="pb-2 px-2 w-24">{t('Long.')}</th>
                                <th className="pb-2 px-2 w-24">{t('Larg.')}</th>
                                <th className="pb-2 px-2 w-24">{t('Haut.')}</th>
                                <th className="pb-2 px-2 w-28 text-right">{t('Quantité')}</th>
                                <th className="pb-2 pl-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.lines ?? []).map((line, i) => {
                                const hasDims = ['length', 'width', 'height'].some(
                                    (k) => line[k] !== '' && line[k] !== null && line[k] !== undefined
                                );
                                const quantity = computeQuantity(line);
                                return (
                                    <tr key={i} className="align-top">
                                        <td className="py-1 pr-2">
                                            <TextInput
                                                className="block w-full"
                                                value={line.designation}
                                                onChange={(e) => setLine(i, 'designation', e.target.value)}
                                                placeholder={t('Voile béton')}
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
                                                value={line.count}
                                                onChange={(e) => setLine(i, 'count', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-1 px-2">
                                            <TextInput
                                                type="number" min={0} step="0.001"
                                                className="block w-full"
                                                value={line.length}
                                                onChange={(e) => setLine(i, 'length', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-1 px-2">
                                            <TextInput
                                                type="number" min={0} step="0.001"
                                                className="block w-full"
                                                value={line.width}
                                                onChange={(e) => setLine(i, 'width', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-1 px-2">
                                            <TextInput
                                                type="number" min={0} step="0.001"
                                                className="block w-full"
                                                value={line.height}
                                                onChange={(e) => setLine(i, 'height', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-1 px-2 text-right">
                                            {hasDims ? (
                                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                                    {quantity.toLocaleString('fr-FR', { maximumFractionDigits: 3 })}
                                                </span>
                                            ) : (
                                                <TextInput
                                                    type="number" min={0} step="0.001"
                                                    className="block w-full text-right"
                                                    value={line.quantity}
                                                    onChange={(e) => setLine(i, 'quantity', e.target.value)}
                                                />
                                            )}
                                            <InputError message={errors[`lines.${i}.quantity`]} className="mt-1" />
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
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/takeoff"
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
