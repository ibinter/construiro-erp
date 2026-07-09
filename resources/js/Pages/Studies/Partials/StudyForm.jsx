import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés des types et statuts (FR) — local à ce module.
const STUDY_TYPE = {
    plan:        'Plan',
    note_calcul: 'Note de calcul',
    etude_sol:   'Étude de sol',
    autre:       'Autre',
};

const STUDY_STATUS = {
    en_cours: 'En cours',
    valide:   'Validée',
    rejete:   'Rejetée',
};

/**
 * Formulaire partagé création / édition d'une étude (Bureau d'études).
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function StudyForm({ form, projects = [], types = [], statuses = [], onSubmit, submitLabel }) {
    const { t } = useTrans();
    const { data, setData, errors, processing } = form;

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
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Informations générales')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', t('Code étude *'), { placeholder: 'ETU-2026-001' })}
                    {field('title', t('Intitulé *'), { placeholder: t('Plan de coffrage niveau R+1') })}

                    <div>
                        <InputLabel htmlFor="type" value={t('Type *')} />
                        <select
                            id="type"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                        >
                            {(types.length ? types : Object.keys(STUDY_TYPE)).map((tp) => (
                                <option key={tp} value={tp}>{t(STUDY_TYPE[tp] ?? tp)}</option>
                            ))}
                        </select>
                        <InputError message={errors.type} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value={t('Statut *')} />
                        <select
                            id="status"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {(statuses.length ? statuses : Object.keys(STUDY_STATUS)).map((s) => (
                                <option key={s} value={s}>{t(STUDY_STATUS[s] ?? s)}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
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

                    {field('author', t('Auteur / Responsable'), { placeholder: 'Ing. Diarra' })}
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

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/design-office"
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
