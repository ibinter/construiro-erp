import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

// Libellés FR des catégories — locaux à ce module.
export const CATEGORY = {
    plan:          'Plan',
    contrat:       'Contrat',
    rapport:       'Rapport',
    facture:       'Facture',
    photo:         'Photo',
    administratif: 'Administratif',
    autre:         'Autre',
};

// Icône Lucide (kebab-case) selon la catégorie.
export const CATEGORY_ICON = {
    plan:          'ruler',
    contrat:       'file-signature',
    rapport:       'file-text',
    facture:       'receipt',
    photo:         'image',
    administratif: 'stamp',
    autre:         'file',
};

/**
 * Formulaire partagé création / édition d'un document (métadonnées).
 * Pas d'upload réel : le chemin ou l'URL est saisi manuellement.
 * `form` est l'objet retourné par useForm() d'Inertia.
 */
export default function DocumentForm({ form, projects = [], categories = [], onSubmit, submitLabel }) {
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

    const selectClass =
        'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300';

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Document</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('code', 'Référence *', { placeholder: 'DOC-2026-001' })}
                    {field('title', 'Titre *', { placeholder: 'Plan de coffrage R+2' })}

                    <div>
                        <InputLabel htmlFor="category" value="Catégorie *" />
                        <select
                            id="category"
                            className={selectClass}
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                        >
                            {(categories.length ? categories : Object.keys(CATEGORY)).map((c) => (
                                <option key={c} value={c}>{CATEGORY[c] ?? c}</option>
                            ))}
                        </select>
                        <InputError message={errors.category} className="mt-1" />
                    </div>

                    {field('version', 'Version *', { placeholder: '1.0' })}

                    <div>
                        <InputLabel htmlFor="project_id" value="Projet" />
                        <select
                            id="project_id"
                            className={selectClass}
                            value={data.project_id ?? ''}
                            onChange={(e) => setData('project_id', e.target.value)}
                        >
                            <option value="">— Aucun —</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.project_id} className="mt-1" />
                    </div>

                    {field('uploaded_by', 'Déposé par', { placeholder: 'Bureau d\'études' })}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-1 font-semibold text-slate-800 dark:text-slate-100">Fichier (métadonnées)</h3>
                <p className="mb-4 text-xs text-slate-400">
                    Pas d'upload : renseignez manuellement le chemin ou l'URL du fichier ainsi que ses caractéristiques.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {field('file_name', 'Nom du fichier', { placeholder: 'plan-coffrage-r2.pdf' })}
                    {field('file_path', 'Chemin / URL', { placeholder: 'https://… ou /docs/…' })}
                    {field('mime_type', 'Type MIME', { placeholder: 'application/pdf' })}
                    {field('size_kb', 'Taille (Ko)', { type: 'number', min: 0, placeholder: '1024' })}
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="description" value="Description" />
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

            <div className="flex items-center justify-end gap-3">
                <Link
                    href="/documents"
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
