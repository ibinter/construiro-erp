import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

const TYPE_OPTIONS = [
    { value: 'feature',     label: 'Fonctionnalité' },
    { value: 'fix',         label: 'Correction'     },
    { value: 'improvement', label: 'Amélioration'   },
    { value: 'security',    label: 'Sécurité'       },
];

export default function ChangelogForm({ changelog, types }) {
    const isEdit = !!changelog;

    const { data, setData, post, put, processing, errors } = useForm({
        version:     changelog?.version ?? '',
        title:       changelog?.title   ?? '',
        body:        changelog?.body    ?? '',
        type:        changelog?.type    ?? 'feature',
        publish_now: changelog?.is_published ?? false,
    });

    function handleSubmit(e) {
        e.preventDefault();
        if (isEdit) {
            put(route('superadmin.changelogs.update', changelog.id));
        } else {
            post(route('superadmin.changelogs.store'));
        }
    }

    return (
        <AppLayout title={isEdit ? `Éditer ${changelog.version}` : 'Nouvelle version changelog'}>
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('superadmin.changelogs.index')}
                        className="text-slate-400 hover:text-orange-500 text-sm"
                    >
                        ← Retour
                    </Link>
                </div>

                <PageHeader
                    title={isEdit ? `Éditer — ${changelog.version}` : 'Nouvelle entrée de changelog'}
                    subtitle={isEdit ? 'Modifiez les détails de cette version' : 'Décrivez les changements de cette version'}
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Informations</h3>
                        </div>
                        <div className="card-body space-y-5">

                            {/* Version + Type */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="form-label">
                                        Version <span className="text-red-500">*</span>
                                        <span className="ml-1 text-xs font-normal text-slate-400">ex: v2.4.1</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-input w-full font-mono ${errors.version ? 'border-red-400' : ''}`}
                                        value={data.version}
                                        onChange={e => setData('version', e.target.value)}
                                        placeholder="v2.4.1"
                                    />
                                    {errors.version && <p className="mt-1 text-xs text-red-500">{errors.version}</p>}
                                </div>
                                <div>
                                    <label className="form-label">Type <span className="text-red-500">*</span></label>
                                    <select
                                        className={`form-input w-full ${errors.type ? 'border-red-400' : ''}`}
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                    >
                                        {TYPE_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
                                </div>
                            </div>

                            {/* Titre */}
                            <div>
                                <label className="form-label">Titre <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className={`form-input w-full ${errors.title ? 'border-red-400' : ''}`}
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="ex: Nouvelles fonctionnalités Module HSE"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>

                            {/* Corps (Markdown) */}
                            <div>
                                <label className="form-label">
                                    Corps (Markdown) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={12}
                                    className={`form-input w-full font-mono text-sm resize-y ${errors.body ? 'border-red-400' : ''}`}
                                    value={data.body}
                                    onChange={e => setData('body', e.target.value)}
                                    placeholder={`## Nouveautés\n\n- Fonctionnalité A ajoutée\n- Fonctionnalité B améliorée\n\n## Corrections\n\n- Bug X corrigé`}
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                    Supporte la syntaxe Markdown : **gras**, *italique*, listes, titres ##.
                                </p>
                                {errors.body && <p className="mt-1 text-xs text-red-500">{errors.body}</p>}
                            </div>

                            {/* Publier immédiatement */}
                            <div className="flex items-center gap-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 px-4 py-3">
                                <input
                                    type="checkbox"
                                    id="publish_now"
                                    className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                    checked={data.publish_now}
                                    onChange={e => setData('publish_now', e.target.checked)}
                                    disabled={isEdit && changelog?.is_published}
                                />
                                <label htmlFor="publish_now" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    {isEdit && changelog?.is_published
                                        ? 'Déjà publié'
                                        : 'Publier immédiatement (visible par les utilisateurs)'
                                    }
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('superadmin.changelogs.index')}
                            className="btn btn-secondary"
                        >
                            Annuler
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={processing}>
                            {processing ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer la version'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
