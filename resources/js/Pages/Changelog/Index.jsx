import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

const TYPE_STYLE = {
    feat:     { label: 'Nouveau',     cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    fix:      { label: 'Correction',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    security: { label: 'Sécurité',   cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    perf:     { label: 'Performance', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    breaking: { label: 'Rupture',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

export default function ChangelogIndex({ entries }) {
    return (
        <AppLayout title="Changelog" breadcrumbs={[{ label: 'Changelog' }]}>
            <Head title="Changelog CONSTRUIRO" />

            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Historique des versions</h1>
                <p className="text-sm text-slate-500 mt-1">Toutes les nouveautés et corrections de CONSTRUIRO ERP.</p>
            </div>

            <div className="relative">
                {/* Ligne verticale */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                <div className="space-y-8">
                    {entries.map(entry => (
                        <VersionBlock key={entry.version} entry={entry} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

function VersionBlock({ entry }) {
    const date = new Date(entry.released_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="sm:pl-12 relative">
            {/* Dot */}
            <div className={`hidden sm:flex absolute left-0 top-3 w-8 h-8 rounded-full items-center justify-center text-xs font-bold
                ${entry.is_major ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 text-slate-500'}`}>
                {entry.is_major ? '★' : '·'}
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                {/* En-tête */}
                <div className={`px-6 py-4 flex flex-wrap items-center gap-3 ${entry.is_major ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                    <span className={`text-lg font-black ${entry.is_major ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
                        v{entry.version}
                    </span>
                    {entry.is_major && (
                        <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">Majeure</span>
                    )}
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1">{entry.title}</span>
                    <span className="text-xs text-slate-400">{date}</span>
                </div>

                {/* Changements */}
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                    {entry.changes.map((c, i) => {
                        const style = TYPE_STYLE[c.type] ?? TYPE_STYLE.feat;
                        return (
                            <li key={i} className="px-6 py-3 flex items-start gap-3">
                                <span className={`mt-0.5 shrink-0 text-xs font-semibold px-2 py-0.5 rounded ${style.cls}`}>
                                    {style.label}
                                </span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{c.text}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
