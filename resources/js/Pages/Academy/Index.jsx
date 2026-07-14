import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function AcademyIndex({ categories }) {
    return (
        <AppLayout title="Academy" breadcrumbs={[{ label: 'Academy' }]}>
            <Head title="Academy CONSTRUIRO" />

            {/* Hero */}
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-2">🎓 CONSTRUIRO Academy</p>
                <h1 className="text-2xl font-black mb-2">Maîtrisez CONSTRUIRO en quelques heures</h1>
                <p className="text-sm opacity-90">Des vidéos courtes et pratiques pour exploiter tout le potentiel de votre ERP BTP.</p>
            </div>

            {/* Grille des catégories */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map(cat => (
                    <CategoryCard key={cat.slug} cat={cat} />
                ))}
            </div>

            {/* Bannière aide */}
            <div className="mt-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                <p className="text-sm text-slate-500 mb-3">Vous ne trouvez pas ce que vous cherchez ?</p>
                <a href={route('support.index')} className="btn-secondary text-sm">
                    Ouvrir un ticket support
                </a>
            </div>
        </AppLayout>
    );
}

function CategoryCard({ cat }) {
    const total   = cat.lessons.length;
    const minutes = cat.lessons.reduce((s, l) => s + parseInt(l.duration), 0);

    return (
        <div className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all">
            {/* En-tête */}
            <div className="bg-slate-50 dark:bg-slate-800 p-5 flex items-start gap-4">
                <span className="text-4xl">{cat.icon}</span>
                <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">{cat.title_fr}</h2>
                    <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                </div>
            </div>

            {/* Leçons */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cat.lessons.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{l.title}</span>
                        <span className="text-xs text-slate-400">{l.duration}</span>
                    </div>
                ))}
            </div>

            {/* Pied */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">{total} leçons · {minutes} min</span>
                <span className="text-xs font-semibold text-orange-500 group-hover:underline">Commencer →</span>
            </div>
        </div>
    );
}
