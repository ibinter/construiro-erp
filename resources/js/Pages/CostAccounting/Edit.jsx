import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTrans } from '@/i18n';

const AXIS_LABELS = {
    chantier:        'Chantier',
    materiel:        'Matériel',
    main_oeuvre:     'Main d\'œuvre',
    sous_traitance:  'Sous-traitance',
    frais_generaux:  'Frais généraux',
};

const TYPE_LABELS = {
    charge:  'Charge',
    produit: 'Produit',
};

export default function Edit({ entry, projects, axes, types }) {
    const { t } = useTrans();

    const form = useForm({
        project_id: String(entry.project_id ?? ''),
        date:       entry.date?.slice(0, 10) ?? '',
        axis:       entry.axis ?? axes[0] ?? '',
        label:      entry.label ?? '',
        type:       entry.type ?? types[0] ?? '',
        amount:     Number(entry.amount ?? 0),
        reference:  entry.reference ?? '',
    });

    const { data, setData, errors } = form;

    const submit = (e) => {
        e.preventDefault();
        form.put(route('cost_accounting.update', entry.id));
    };

    return (
        <AppLayout header={t('Modifier l\'imputation analytique')}>
            <Head title={t('Modifier l\'imputation')} />

            <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center gap-2">
                    <Link
                        href={route('cost_accounting.index')}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-orange-600"
                    >
                        <Icon name="arrow-left" className="h-4 w-4" />
                        {t('Retour à la comptabilité analytique')}
                    </Link>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-6 text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t('Imputation analytique')} #{entry.id}
                    </h2>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Projet */}
                        <div>
                            <InputLabel htmlFor="project_id" value={t('Projet (optionnel)')} />
                            <select
                                id="project_id"
                                className="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                            >
                                <option value="">{t('-- Aucun projet --')}</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.project_id} className="mt-1" />
                        </div>

                        {/* Axe analytique */}
                        <div>
                            <InputLabel htmlFor="axis" value={t('Compte analytique (axe)')} required />
                            <select
                                id="axis"
                                className="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                value={data.axis}
                                onChange={(e) => setData('axis', e.target.value)}
                                required
                            >
                                {axes.map((a) => (
                                    <option key={a} value={a}>
                                        {t(AXIS_LABELS[a] ?? a)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.axis} className="mt-1" />
                        </div>

                        {/* Type */}
                        <div>
                            <InputLabel value={t('Type')} required />
                            <div className="mt-1 flex gap-4">
                                {types.map((tp) => (
                                    <label key={tp} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={tp}
                                            checked={data.type === tp}
                                            onChange={() => setData('type', tp)}
                                            className="text-orange-500"
                                        />
                                        {t(TYPE_LABELS[tp] ?? tp)}
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.type} className="mt-1" />
                        </div>

                        {/* Date */}
                        <div>
                            <InputLabel htmlFor="date" value={t('Date')} required />
                            <TextInput
                                id="date"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                required
                            />
                            <InputError message={errors.date} className="mt-1" />
                        </div>

                        {/* Montant */}
                        <div>
                            <InputLabel htmlFor="amount" value={t('Montant')} required />
                            <TextInput
                                id="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                required
                            />
                            <InputError message={errors.amount} className="mt-1" />
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="label" value={t('Description')} required />
                            <TextInput
                                id="label"
                                className="mt-1 block w-full"
                                value={data.label}
                                onChange={(e) => setData('label', e.target.value)}
                                placeholder={t('Libellé de l\'imputation')}
                                required
                            />
                            <InputError message={errors.label} className="mt-1" />
                        </div>

                        {/* Référence */}
                        <div>
                            <InputLabel htmlFor="reference" value={t('Référence (optionnel)')} />
                            <TextInput
                                id="reference"
                                className="mt-1 block w-full"
                                value={data.reference}
                                onChange={(e) => setData('reference', e.target.value)}
                                placeholder="FAC-001, BC-042…"
                            />
                            <InputError message={errors.reference} className="mt-1" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <SecondaryButton as={Link} href={route('cost_accounting.index')}>
                                {t('Annuler')}
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={form.processing}>
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
