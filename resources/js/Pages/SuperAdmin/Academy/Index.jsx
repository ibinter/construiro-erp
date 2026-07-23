import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

// ─── Constantes ──────────────────────────────────────────────────────────────

const TYPE_OPTIONS    = ['video', 'document', 'quiz'];
const LEVEL_OPTIONS   = ['beginner', 'intermediate', 'advanced'];
const TYPE_LABELS     = { video: 'Vidéo', document: 'Document', quiz: 'Quiz' };
const LEVEL_LABELS    = { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' };

const EMPTY_FORM = {
    category_id:      '',
    type:             'video',
    title_fr:         '',
    title_en:         '',
    description_fr:   '',
    description_en:   '',
    url:              '',
    thumbnail:        '',
    duration_minutes: '',
    level:            'beginner',
    role_restriction: '',
    is_published:     false,
    sort_order:       0,
};

// ─── Composants utilitaires ───────────────────────────────────────────────────

function StatusBadge({ published }) {
    return published
        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Publié</span>
        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Brouillon</span>;
}

function TypeBadge({ type }) {
    const colors = { video: 'bg-blue-100 text-blue-700', document: 'bg-purple-100 text-purple-700', quiz: 'bg-amber-100 text-amber-700' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[type] ?? 'bg-slate-100 text-slate-600'}`}>
            {TYPE_LABELS[type] ?? type}
        </span>
    );
}

// ─── Formulaire inline ────────────────────────────────────────────────────────

function ResourceForm({ categories, initial, onClose }) {
    const isEdit = !!initial?.id;
    const [form, setForm]     = useState(initial ?? EMPTY_FORM);
    const [errors, setErrors] = useState({});

    function set(key, val) {
        setForm(f => ({ ...f, [key]: val }));
    }

    function submit(e) {
        e.preventDefault();
        const method = isEdit ? 'put' : 'post';
        const url    = isEdit
            ? route('superadmin.academy.update', initial.id)
            : route('superadmin.academy.store');

        router[method](url, form, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: setErrors,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        {isEdit ? 'Modifier la ressource' : 'Ajouter une ressource'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Catégorie + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-construiro">Catégorie *</label>
                            <select
                                value={form.category_id}
                                onChange={e => set('category_id', e.target.value)}
                                className="input-construiro w-full"
                                required
                            >
                                <option value="">— Choisir —</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.name_fr}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                        </div>
                        <div>
                            <label className="label-construiro">Type *</label>
                            <select
                                value={form.type}
                                onChange={e => set('type', e.target.value)}
                                className="input-construiro w-full"
                            >
                                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Titres */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-construiro">Titre FR *</label>
                            <input
                                type="text"
                                value={form.title_fr}
                                onChange={e => set('title_fr', e.target.value)}
                                className="input-construiro w-full"
                                required
                            />
                            {errors.title_fr && <p className="text-red-500 text-xs mt-1">{errors.title_fr}</p>}
                        </div>
                        <div>
                            <label className="label-construiro">Titre EN</label>
                            <input
                                type="text"
                                value={form.title_en}
                                onChange={e => set('title_en', e.target.value)}
                                className="input-construiro w-full"
                            />
                        </div>
                    </div>

                    {/* Description FR */}
                    <div>
                        <label className="label-construiro">Description FR</label>
                        <textarea
                            value={form.description_fr}
                            onChange={e => set('description_fr', e.target.value)}
                            className="input-construiro w-full"
                            rows={2}
                        />
                    </div>

                    {/* URL + Thumbnail */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-construiro">URL vidéo / fichier</label>
                            <input
                                type="text"
                                value={form.url}
                                onChange={e => set('url', e.target.value)}
                                className="input-construiro w-full"
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>
                        <div>
                            <label className="label-construiro">Miniature (URL)</label>
                            <input
                                type="text"
                                value={form.thumbnail}
                                onChange={e => set('thumbnail', e.target.value)}
                                className="input-construiro w-full"
                            />
                        </div>
                    </div>

                    {/* Durée + Niveau + Ordre */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="label-construiro">Durée (min)</label>
                            <input
                                type="number"
                                min="1"
                                value={form.duration_minutes}
                                onChange={e => set('duration_minutes', e.target.value)}
                                className="input-construiro w-full"
                            />
                        </div>
                        <div>
                            <label className="label-construiro">Niveau *</label>
                            <select
                                value={form.level}
                                onChange={e => set('level', e.target.value)}
                                className="input-construiro w-full"
                            >
                                {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-construiro">Ordre</label>
                            <input
                                type="number"
                                min="0"
                                value={form.sort_order}
                                onChange={e => set('sort_order', parseInt(e.target.value) || 0)}
                                className="input-construiro w-full"
                            />
                        </div>
                    </div>

                    {/* Restriction de rôle + Publié */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-construiro">Restriction de rôle (optionnel)</label>
                            <input
                                type="text"
                                value={form.role_restriction}
                                onChange={e => set('role_restriction', e.target.value)}
                                className="input-construiro w-full"
                                placeholder="ex: comptabilite"
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_published}
                                    onChange={e => set('is_published', e.target.checked)}
                                    className="w-4 h-4 accent-orange-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Publier immédiatement</span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEdit ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function SuperAdminAcademyIndex({ categories }) {
    const [activeTab,  setActiveTab]  = useState(categories[0]?.id ?? null);
    const [showForm,   setShowForm]   = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    function openCreate() {
        setEditTarget(null);
        setShowForm(true);
    }

    function openEdit(resource, category) {
        setEditTarget({
            id:               resource.id,
            category_id:      category.id,
            type:             resource.type,
            title_fr:         resource.title_fr        ?? '',
            title_en:         resource.title_en        ?? '',
            description_fr:   resource.description_fr  ?? '',
            description_en:   resource.description_en  ?? '',
            url:              resource.url             ?? '',
            thumbnail:        resource.thumbnail       ?? '',
            duration_minutes: resource.duration_minutes ?? '',
            level:            resource.level,
            role_restriction: resource.role_restriction ?? '',
            is_published:     resource.is_published,
            sort_order:       resource.sort_order,
        });
        setShowForm(true);
    }

    function handleDelete(resource) {
        if (!confirm(`Supprimer « ${resource.title_fr} » ?`)) return;
        router.delete(route('superadmin.academy.destroy', resource.id), { preserveScroll: true });
    }

    function handlePublishToggle(resource) {
        router.post(route('superadmin.academy.publish', resource.id), {}, { preserveScroll: true });
    }

    const activeCategory = categories.find(c => c.id === activeTab);

    return (
        <AppLayout title="SuperAdmin — Académie">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeader
                        title="Académie / Formation"
                        subtitle="Gérez les ressources pédagogiques publiées dans l'espace Académie"
                    />
                    <button onClick={openCreate} className="btn btn-primary shrink-0">
                        + Ajouter une ressource
                    </button>
                </div>

                {/* Onglets catégories */}
                <div className="flex gap-2 flex-wrap border-b border-slate-200 dark:border-slate-700 pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                                activeTab === cat.id
                                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <span className="mr-1">{cat.icon}</span>
                            {cat.name_fr}
                            <span className="ml-2 text-xs opacity-60">({cat.resources?.length ?? 0})</span>
                        </button>
                    ))}
                </div>

                {/* Contenu de l'onglet actif */}
                {activeCategory && (
                    <div className="card">
                        <div className="card-body overflow-x-auto">
                            <table className="table-construiro w-full">
                                <thead>
                                    <tr>
                                        <th>Titre</th>
                                        <th>Type</th>
                                        <th>Niveau</th>
                                        <th>Durée</th>
                                        <th>Statut</th>
                                        <th>Vues</th>
                                        <th>Ordre</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeCategory.resources.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center text-slate-400 py-8">
                                                Aucune ressource dans cette catégorie.
                                            </td>
                                        </tr>
                                    )}
                                    {activeCategory.resources.map(r => (
                                        <tr key={r.id}>
                                            <td>
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-slate-100 max-w-xs truncate">{r.title_fr}</p>
                                                    {r.title_en && <p className="text-xs text-slate-400 truncate max-w-xs">{r.title_en}</p>}
                                                </div>
                                            </td>
                                            <td><TypeBadge type={r.type} /></td>
                                            <td className="text-sm text-slate-600 dark:text-slate-400">{LEVEL_LABELS[r.level] ?? r.level}</td>
                                            <td className="text-sm text-slate-500">{r.duration_minutes ? `${r.duration_minutes} min` : '—'}</td>
                                            <td><StatusBadge published={r.is_published} /></td>
                                            <td className="text-sm text-slate-500">{r.view_count}</td>
                                            <td className="text-sm text-slate-500">{r.sort_order}</td>
                                            <td>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => openEdit(r, activeCategory)}
                                                        className="text-sm text-orange-500 hover:text-orange-600"
                                                    >
                                                        Éditer
                                                    </button>
                                                    <button
                                                        onClick={() => handlePublishToggle(r)}
                                                        className={`text-sm ${r.is_published ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                                                    >
                                                        {r.is_published ? 'Dépublier' : 'Publier'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(r)}
                                                        className="text-sm text-red-500 hover:text-red-600"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Formulaire modal */}
            {showForm && (
                <ResourceForm
                    categories={categories}
                    initial={editTarget}
                    onClose={() => { setShowForm(false); setEditTarget(null); }}
                />
            )}
        </AppLayout>
    );
}
