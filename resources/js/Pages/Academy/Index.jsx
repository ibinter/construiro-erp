import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Constantes ──────────────────────────────────────────────────────────────

const LEVEL_LABELS = {
    beginner:     { fr: 'Débutant',      color: 'text-green-600  bg-green-50  dark:bg-green-900/20  dark:text-green-400' },
    intermediate: { fr: 'Intermédiaire', color: 'text-blue-600   bg-blue-50   dark:bg-blue-900/20   dark:text-blue-400'  },
    advanced:     { fr: 'Avancé',        color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
};

const TYPE_LABELS = {
    video:    { fr: 'Vidéo',    icon: '▶' },
    document: { fr: 'Document', icon: '📄' },
    quiz:     { fr: 'Quiz',     icon: '📝' },
};

// ─── Composants ──────────────────────────────────────────────────────────────

function Badge({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
            {children}
        </span>
    );
}

function ResourceRow({ resource, isCompleted, onMarkViewed }) {
    const typeInfo  = TYPE_LABELS[resource.type]  ?? { fr: resource.type,  icon: '•' };
    const levelInfo = LEVEL_LABELS[resource.level] ?? { fr: resource.level, color: 'text-slate-500 bg-slate-100' };

    if (!resource.is_published) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 opacity-60">
                <span className="text-slate-400 text-xs w-5 text-center">{typeInfo.icon}</span>
                <span className="flex-1 text-sm text-slate-500 dark:text-slate-400 line-through">
                    {resource.title_fr}
                </span>
                <Badge className="text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                    Bientôt disponible
                </Badge>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 px-4 py-3 ${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
            <span className="text-slate-400 dark:text-slate-500 text-sm w-5 text-center">{typeInfo.icon}</span>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {resource.title_fr}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={levelInfo.color}>{levelInfo.fr}</Badge>
                    {resource.duration_minutes && (
                        <span className="text-xs text-slate-400">{resource.duration_minutes} min</span>
                    )}
                </div>
            </div>
            <button
                onClick={() => onMarkViewed(resource.id, !isCompleted)}
                className={`shrink-0 text-xs px-3 py-1 rounded-lg border transition-colors ${
                    isCompleted
                        ? 'border-green-300 text-green-600 dark:border-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400 hover:border-orange-300 hover:text-orange-600'
                }`}
                title={isCompleted ? 'Marquer comme non vu' : 'Marquer comme vu'}
            >
                {isCompleted ? '✓ Vu' : 'Marquer vu'}
            </button>
        </div>
    );
}

function CategoryCard({ category, completedIds, onMarkViewed }) {
    const [expanded, setExpanded] = useState(false);

    const published   = category.resources.filter(r => r.is_published);
    const coming      = category.resources.filter(r => !r.is_published);
    const completedHere = published.filter(r => completedIds.includes(r.id)).length;
    const progressPct = published.length > 0 ? Math.round((completedHere / published.length) * 100) : 0;

    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* En-tête catégorie */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-start gap-4 p-5 text-left bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
            >
                <span className="text-3xl leading-none">{category.icon}</span>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-slate-900 dark:text-white text-base">{category.name_fr}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {published.length} ressource{published.length !== 1 ? 's' : ''} disponible{published.length !== 1 ? 's' : ''}
                        {coming.length > 0 && ` · ${coming.length} à venir`}
                    </p>
                </div>
                <div className="shrink-0 text-right">
                    {published.length > 0 && (
                        <span className="text-xs font-semibold text-orange-500">{progressPct}%</span>
                    )}
                    <span className="ml-2 text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
                </div>
            </button>

            {/* Barre de progression */}
            {published.length > 0 && (
                <div className="h-1 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${progressPct}%`, backgroundColor: category.color ?? '#F58220' }}
                    />
                </div>
            )}

            {/* Liste des ressources */}
            {expanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {category.resources.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-400 text-center">
                            Aucune ressource pour cette catégorie.
                        </p>
                    ) : (
                        category.resources.map(r => (
                            <ResourceRow
                                key={r.id}
                                resource={r}
                                isCompleted={completedIds.includes(r.id)}
                                onMarkViewed={onMarkViewed}
                            />
                        ))
                    )}
                    {coming.length > 0 && (
                        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                            <span>🎬</span>
                            <span>Des vidéos de formation arrivent bientôt pour cette catégorie.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function AcademyIndex({ categories, completed_ids }) {
    const [completedIds, setCompletedIds] = useState(completed_ids ?? []);

    // Total de ressources publiées et complétées
    const allPublished = categories.flatMap(c => c.resources.filter(r => r.is_published));
    const totalPublished = allPublished.length;
    const totalCompleted = completedIds.filter(id => allPublished.some(r => r.id === id)).length;
    const globalPct = totalPublished > 0 ? Math.round((totalCompleted / totalPublished) * 100) : 0;
    const hasComing  = categories.some(c => c.resources.some(r => !r.is_published));

    function handleMarkViewed(resourceId, completed) {
        router.post(
            route('academy.progress', resourceId),
            { completed },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCompletedIds(prev =>
                        completed
                            ? [...prev.filter(id => id !== resourceId), resourceId]
                            : prev.filter(id => id !== resourceId)
                    );
                },
            }
        );
    }

    return (
        <AppLayout title="Académie CONSTRUIRO" breadcrumbs={[{ label: 'Académie' }]}>
            <Head title="Académie CONSTRUIRO" />

            {/* Hero */}
            <div className="mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-2">
                    🎓 CONSTRUIRO Académie
                </p>
                <h1 className="text-2xl font-black mb-1">Maîtrisez CONSTRUIRO ERP</h1>
                <p className="text-sm opacity-90">
                    Formations vidéo et guides pratiques pour exploiter tout le potentiel de votre ERP BTP.
                </p>

                {/* Progression globale */}
                {totalPublished > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1 opacity-90">
                            <span>Progression globale</span>
                            <span>{totalCompleted} / {totalPublished} ressources · {globalPct}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${globalPct}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Bannière "bientôt disponible" globale */}
            {hasComing && (
                <div className="mb-5 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 p-4 flex items-start gap-3">
                    <span className="text-2xl">🎬</span>
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                            Des vidéos de formation arrivent bientôt !
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">
                            Les ressources marquées « Bientôt disponible » seront publiées prochainement.
                            Les catégories restent accessibles et cliquables dès qu'elles contiennent du contenu.
                        </p>
                    </div>
                </div>
            )}

            {/* Grille des catégories */}
            <div className="grid sm:grid-cols-2 gap-4">
                {categories.map(cat => (
                    <CategoryCard
                        key={cat.id}
                        category={cat}
                        completedIds={completedIds}
                        onMarkViewed={handleMarkViewed}
                    />
                ))}
            </div>

            {/* Aide */}
            <div className="mt-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                <p className="text-sm text-slate-500 mb-3">Vous ne trouvez pas ce que vous cherchez ?</p>
                <a href={route('support.index')} className="btn-secondary text-sm">
                    Ouvrir un ticket support
                </a>
            </div>
        </AppLayout>
    );
}
