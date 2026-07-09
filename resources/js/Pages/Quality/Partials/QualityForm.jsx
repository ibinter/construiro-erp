import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés locaux (FR) du module Qualité.
export const CONTROL_TYPE = {
    reception: 'Réception',
    en_cours:  'En cours',
    essai:     'Essai',
    final:     'Final',
};

export const CONTROL_RESULT = {
    conforme:     { label: 'Conforme',     color: 'bg-green-100 text-green-700' },
    non_conforme: { label: 'Non conforme', color: 'bg-red-100 text-red-700' },
    en_attente:   { label: 'En attente',   color: 'bg-amber-100 text-amber-700' },
};

/**
 * Formulaire partagé création / édition d'un contrôle qualité.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function QualityForm({
    form,
    projects = [],
    sites = [],
    controlTypes = [],
    results = [],
    onSubmit,
    submitLabel,
}) {
    const { t } = useTrans();
    const { data, setData, errors, processing } = form;

    const field = (name, label, props = {}) => (
        <div>
            <InputLabel htmlFor={name} value={t(label)} />
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

    const selectClass =
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Informations générales')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', 'Code contrôle *', { placeholder: 'QC-2026-001' })}
                    {field('title', 'Intitulé *', { placeholder: t('Réception béton fondations') })}

                    <div>
                        <InputLabel htmlFor="control_type" value={t('Type de contrôle *')} />
                        <select id="control_type" className={selectClass} value={data.control_type} onChange={(e) => setData('control_type', e.target.value)}>
                            {(controlTypes.length ? controlTypes : Object.keys(CONTROL_TYPE)).map((ty) => (
                                <option key={ty} value={ty}>{t(CONTROL_TYPE[ty] ?? ty)}</option>
                            ))}
                        </select>
                        <InputError message={errors.control_type} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="result" value={t('Résultat *')} />
                        <select id="result" className={selectClass} value={data.result} onChange={(e) => setData('result', e.target.value)}>
                            {(results.length ? results : Object.keys(CONTROL_RESULT)).map((r) => (
                                <option key={r} value={r}>{t(CONTROL_RESULT[r]?.label ?? r)}</option>
                            ))}
                        </select>
                        <InputError message={errors.result} className="mt-1" />
                    </div>

                    {field('control_date', 'Date du contrôle *', { type: 'date' })}
                    {field('inspector', 'Inspecteur', { placeholder: t('Nom du contrôleur') })}
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="description" value={t('Description')} />
                    <textarea
                        id="description"
                        rows={3}
                        className={selectClass}
                        value={data.description ?? ''}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} className="mt-1" />
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Rattachement & observations')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="project_id" value={t('Projet')} />
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

                    <div>
                        <InputLabel htmlFor="site_id" value={t('Chantier')} />
                        <select
                            id="site_id"
                            className={selectClass}
                            value={data.site_id ?? ''}
                            onChange={(e) => setData('site_id', e.target.value || null)}
                        >
                            <option value="">{t('— Aucun —')}</option>
                            {sites.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.site_id} className="mt-1" />
                    </div>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="observations" value={t('Observations')} />
                    <textarea
                        id="observations"
                        rows={3}
                        className={selectClass}
                        value={data.observations ?? ''}
                        onChange={(e) => setData('observations', e.target.value)}
                    />
                    <InputError message={errors.observations} className="mt-1" />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/quality"
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
