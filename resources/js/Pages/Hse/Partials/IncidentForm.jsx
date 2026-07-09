import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';
import { useTrans } from '@/i18n';

// Libellés locaux (FR) du module QHSE.
export const INCIDENT_TYPE = {
    accident:         'Accident',
    presque_accident: 'Presque-accident',
    environnement:    'Environnement',
    incendie:         'Incendie',
    autre:            'Autre',
};

export const INCIDENT_SEVERITY = {
    mineur:   { label: 'Mineur',   color: 'bg-slate-100 text-slate-600' },
    modere:   { label: 'Modéré',   color: 'bg-amber-100 text-amber-700' },
    majeur:   { label: 'Majeur',   color: 'bg-orange-100 text-orange-700' },
    critique: { label: 'Critique', color: 'bg-red-100 text-red-700' },
};

export const INCIDENT_STATUS = {
    ouvert:   { label: 'Ouvert',   color: 'bg-blue-100 text-blue-700' },
    en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
    cloture:  { label: 'Clôturé',  color: 'bg-green-100 text-green-700' },
};

/**
 * Formulaire partagé création / édition d'un incident QHSE.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function IncidentForm({
    form,
    projects = [],
    sites = [],
    types = [],
    severities = [],
    statuses = [],
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
                    {field('code', 'Code incident *', { placeholder: 'HSE-2026-001' })}
                    {field('title', 'Intitulé *', { placeholder: t('Chute de plain-pied') })}

                    <div>
                        <InputLabel htmlFor="type" value={t('Type *')} />
                        <select id="type" className={selectClass} value={data.type} onChange={(e) => setData('type', e.target.value)}>
                            {(types.length ? types : Object.keys(INCIDENT_TYPE)).map((ty) => (
                                <option key={ty} value={ty}>{t(INCIDENT_TYPE[ty] ?? ty)}</option>
                            ))}
                        </select>
                        <InputError message={errors.type} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="severity" value={t('Gravité *')} />
                        <select id="severity" className={selectClass} value={data.severity} onChange={(e) => setData('severity', e.target.value)}>
                            {(severities.length ? severities : Object.keys(INCIDENT_SEVERITY)).map((s) => (
                                <option key={s} value={s}>{t(INCIDENT_SEVERITY[s]?.label ?? s)}</option>
                            ))}
                        </select>
                        <InputError message={errors.severity} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value={t('Statut *')} />
                        <select id="status" className={selectClass} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                            {(statuses.length ? statuses : Object.keys(INCIDENT_STATUS)).map((s) => (
                                <option key={s} value={s}>{t(INCIDENT_STATUS[s]?.label ?? s)}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>

                    {field('incident_date', 'Date de l\'incident *', { type: 'date' })}
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
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">{t('Localisation & rattachement')}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('location', 'Lieu', { placeholder: t('Zone de travaux, étage…') })}
                    {field('reported_by', 'Déclaré par', { placeholder: t('Nom du déclarant') })}

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
                    <InputLabel htmlFor="corrective_action" value={t('Action corrective')} />
                    <textarea
                        id="corrective_action"
                        rows={3}
                        className={selectClass}
                        value={data.corrective_action ?? ''}
                        onChange={(e) => setData('corrective_action', e.target.value)}
                    />
                    <InputError message={errors.corrective_action} className="mt-1" />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/hse"
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
