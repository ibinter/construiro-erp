import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés FR — locaux à ce module.
export const SAMPLE_TYPE = {
    beton:    'Béton',
    sol:      'Sol',
    granulat: 'Granulat',
    acier:    'Acier',
    bitume:   'Bitume',
    autre:    'Autre',
};

export const RESULT = {
    conforme:     'Conforme',
    non_conforme: 'Non conforme',
    en_attente:   'En attente',
};

/**
 * Formulaire partagé création / édition d'un essai de laboratoire.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function LabTestForm({
    form,
    projects = [],
    sites = [],
    sampleTypes = [],
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Essai')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', 'Code essai *', { placeholder: 'LAB-2026-001' })}
                    {field('test_name', 'Intitulé de l\'essai *', { placeholder: t('Écrasement éprouvette 28 j') })}

                    <div>
                        <InputLabel htmlFor="sample_type" value={t("Type d'échantillon *")} />
                        <select
                            id="sample_type"
                            className={selectClass}
                            value={data.sample_type}
                            onChange={(e) => setData('sample_type', e.target.value)}
                        >
                            {(sampleTypes.length ? sampleTypes : Object.keys(SAMPLE_TYPE)).map((ty) => (
                                <option key={ty} value={ty}>{t(SAMPLE_TYPE[ty] ?? ty)}</option>
                            ))}
                        </select>
                        <InputError message={errors.sample_type} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="result" value={t('Résultat *')} />
                        <select
                            id="result"
                            className={selectClass}
                            value={data.result}
                            onChange={(e) => setData('result', e.target.value)}
                        >
                            {(results.length ? results : Object.keys(RESULT)).map((r) => (
                                <option key={r} value={r}>{t(RESULT[r] ?? r)}</option>
                            ))}
                        </select>
                        <InputError message={errors.result} className="mt-1" />
                    </div>

                    {field('technician', 'Technicien / Laboratoire', { placeholder: t('Laboratoire GéoBTP') })}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Mesures')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {field('sample_date', 'Date de prélèvement', { type: 'date' })}
                    {field('test_date', 'Date de l\'essai', { type: 'date' })}
                    {field('unit', 'Unité', { placeholder: 'MPa, %, kg/m3...' })}
                    {field('result_value', 'Valeur mesurée', { type: 'number', step: '0.001', placeholder: '32.500' })}
                    {field('threshold', 'Seuil requis', { type: 'number', step: '0.001', placeholder: '25.000' })}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Rattachement')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="project_id" value={t('Projet')} />
                        <select
                            id="project_id"
                            className={selectClass}
                            value={data.project_id ?? ''}
                            onChange={(e) => setData('project_id', e.target.value)}
                        >
                            <option value="">{t('— Aucun —')}</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
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
                            onChange={(e) => setData('site_id', e.target.value)}
                        >
                            <option value="">{t('— Aucun —')}</option>
                            {sites.map((s) => (
                                <option key={s.id} value={s.id}>{s.code} · {s.name}</option>
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
                    href="/laboratory"
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
