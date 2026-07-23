import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORIES = ['general', 'pricing', 'modules', 'support', 'faq'];

const CATEGORY_LABELS = {
    general:  'Général',
    pricing:  'Tarifs',
    modules:  'Modules',
    support:  'Support',
    faq:      'FAQ',
};

const CATEGORY_COLORS = {
    general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    pricing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    modules: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    support: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    faq:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const PRIORITY_OPTIONS = [
    { value: 0,  label: 'Normal',    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    { value: 10, label: 'Important', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 20, label: 'Critique',  badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

const EMPTY_FORM = {
    category:   'general',
    title_fr:   '',
    title_en:   '',
    content_fr: '',
    content_en: '',
    priority:   0,
    is_active:  true,
};

// ─── Composants utilitaires ───────────────────────────────────────────────────

function CategoryBadge({ category }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general}`}>
            {CATEGORY_LABELS[category] ?? category}
        </span>
    );
}

function PriorityBadge({ priority }) {
    const opt = PRIORITY_OPTIONS.find(p => p.value === priority) ?? PRIORITY_OPTIONS[0];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${opt.badge}`}>
            {opt.label}
        </span>
    );
}

function ActiveBadge({ active }) {
    return active
        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Actif</span>
        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Inactif</span>;
}

// ─── Formulaire modal ────────────────────────────────────────────────────────

function EntryForm({ initial, onClose }) {
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
            ? route('superadmin.knowledge-base.update', initial.id)
            : route('superadmin.knowledge-base.store');

        router[method](url, form, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: setErrors,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                {/* En-tête */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        {isEdit ? 'Modifier l\'entrée' : 'Ajouter une entrée'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Catégorie + Priorité */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-construiro">Catégorie *</label>
                            <select
                                value={form.category}
                                onChange={e => set('category', e.target.value)}
                                className="input-construiro w-full"
                                required
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                        </div>
                        <div>
                            <label className="label-construiro">Priorité</label>
                            <select
                                value={form.priority}
                                onChange={e => set('priority', Number(e.target.value))}
                                className="input-construiro w-full"
                            >
                                {PRIORITY_OPTIONS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label} ({p.value})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Titre FR */}
                    <div>
                        <label className="label-construiro">Titre FR *</label>
                        <input
                            type="text"
                            value={form.title_fr}
                            onChange={e => set('title_fr', e.target.value)}
                            className="input-construiro w-full"
                            placeholder="Ex : Tarifs et plans d'abonnement CONSTRUIRO"
                            required
                        />
                        {errors.title_fr && <p className="text-red-500 text-xs mt-1">{errors.title_fr}</p>}
                    </div>

                    {/* Titre EN */}
                    <div>
                        <label className="label-construiro">Titre EN <span className="text-slate-400">(optionnel)</span></label>
                        <input
                            type="text"
                            value={form.title_en ?? ''}
                            onChange={e => set('title_en', e.target.value)}
                            className="input-construiro w-full"
                            placeholder="Ex: CONSTRUIRO pricing and subscription plans"
                        />
                    </div>

                    {/* Contenu FR */}
                    <div>
                        <label className="label-construiro">Contenu FR * <span className="text-slate-400 font-normal text-xs">(texte que SARA utilisera pour répondre)</span></label>
                        <textarea
                            rows={6}
                            value={form.content_fr}
                            onChange={e => set('content_fr', e.target.value)}
                            className="input-construiro w-full resize-y"
                            placeholder="Rédigez le contenu qui enrichira les réponses de SARA..."
                            required
                        />
                        {errors.content_fr && <p className="text-red-500 text-xs mt-1">{errors.content_fr}</p>}
                    </div>

                    {/* Contenu EN */}
                    <div>
                        <label className="label-construiro">Contenu EN <span className="text-slate-400">(optionnel)</span></label>
                        <textarea
                            rows={4}
                            value={form.content_en ?? ''}
                            onChange={e => set('content_en', e.target.value)}
                            className="input-construiro w-full resize-y"
                            placeholder="English content (optional)..."
                        />
                    </div>

                    {/* Actif */}
                    <div className="flex items-center gap-3">
                        <input
                            id="is_active"
                            type="checkbox"
                            checked={!!form.is_active}
                            onChange={e => set('is_active', e.target.checked)}
                            className="rounded border-slate-300 dark:border-slate-600"
                        />
                        <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                            Entrée active (visible par SARA)
                        </label>
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                        <button type="submit" className="btn-primary">
                            {isEdit ? 'Enregistrer' : 'Créer l\'entrée'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function KnowledgeBaseIndex({ entries, totalActive, totalInactive, filters }) {
    const [showForm, setShowForm]   = useState(false);
    const [editEntry, setEditEntry] = useState(null);

    function filterByCategory(cat) {
        router.get(route('superadmin.knowledge-base.index'), { category: cat || undefined }, { preserveState: true, replace: true });
    }

    function handleEdit(entry) {
        setEditEntry(entry);
        setShowForm(true);
    }

    function handleAdd() {
        setEditEntry(null);
        setShowForm(true);
    }

    function handleClose() {
        setShowForm(false);
        setEditEntry(null);
    }

    function handleDelete(entry) {
        if (!confirm(`Supprimer l'entrée « ${entry.title_fr} » ?`)) return;
        router.delete(route('superadmin.knowledge-base.destroy', entry.id), { preserveScroll: true });
    }

    return (
        <AppLayout title="Base de connaissances SARA">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* En-tête */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <PageHeader
                            title="Base de connaissances SARA"
                            subtitle="Entrées RAG enrichissant les réponses de l'assistant IA"
                        />
                        {/* Compteurs */}
                        <div className="flex gap-4 mt-2">
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                {totalActive} active{totalActive !== 1 ? 's' : ''}
                            </span>
                            <span className="text-sm text-slate-400">
                                {totalInactive} inactive{totalInactive !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleAdd} className="btn-primary self-start sm:self-auto whitespace-nowrap">
                        + Ajouter une entree
                    </button>
                </div>

                {/* Filtres par catégorie */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => filterByCategory('')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                            !filters.category
                                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                        }`}
                    >
                        Toutes
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => filterByCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                filters.category === cat
                                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>

                {/* Tableau */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-64">Titre</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Apercu contenu</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-28">Categorie</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-28">Priorite</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-20">Statut</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {entries.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-slate-400">
                                            Aucune entree. Cliquez sur "+ Ajouter une entree" pour commencer.
                                        </td>
                                    </tr>
                                ) : entries.data.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-slate-900 dark:text-white line-clamp-2 text-sm">
                                                {entry.title_fr}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-xs">
                                            <span className="line-clamp-2">
                                                {entry.content_fr?.substring(0, 120)}...
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <CategoryBadge category={entry.category} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <PriorityBadge priority={entry.priority} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <ActiveBadge active={entry.is_active} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(entry)}
                                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition"
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry)}
                                                    className="px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition"
                                                >
                                                    Suppr.
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {entries.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-500">
                                Page {entries.current_page} / {entries.last_page} — {entries.total} entrees
                            </span>
                            <div className="flex gap-1">
                                {entries.links?.filter(l => l.url).map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}
                                        className={`px-3 py-1 rounded text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal formulaire */}
            {showForm && (
                <EntryForm
                    initial={editEntry}
                    onClose={handleClose}
                />
            )}
        </AppLayout>
    );
}
