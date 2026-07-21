import { Head } from '@inertiajs/react';

const TYPE_STYLE = {
    feature:     { label: 'Fonctionnalité', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    fix:         { label: 'Correction',     cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'   },
    improvement: { label: 'Amélioration',   cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    security:    { label: 'Sécurité',       cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'       },
};

/**
 * Rendu Markdown simplifié (sans bibliothèque externe)
 * Supporte : ## titres, **gras**, *italique*, - listes, lignes vides = paragraphes
 */
function SimpleMarkdown({ body }) {
    if (!body) return null;

    const lines = body.split('\n');
    const elements = [];
    let listItems = [];

    function flushList() {
        if (listItems.length) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 my-2">
                    {listItems.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
                    ))}
                </ul>
            );
            listItems = [];
        }
    }

    function inlineFormat(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g,     '<em>$1</em>')
            .replace(/`(.+?)`/g,       '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs font-mono">$1</code>');
    }

    lines.forEach((line, i) => {
        if (line.startsWith('### ')) {
            flushList();
            elements.push(
                <h4 key={i} className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-4 mb-1">
                    {line.slice(4)}
                </h4>
            );
        } else if (line.startsWith('## ')) {
            flushList();
            elements.push(
                <h3 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2">
                    {line.slice(3)}
                </h3>
            );
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            listItems.push(line.slice(2));
        } else if (line.trim() === '') {
            flushList();
        } else {
            flushList();
            elements.push(
                <p key={i} className="text-sm text-slate-700 dark:text-slate-300 mb-2"
                   dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />
            );
        }
    });

    flushList();

    return <div className="mt-2">{elements}</div>;
}

export default function ChangelogPublic({ entries }) {
    return (
        <>
            <Head>
                <title>Changelog — CONSTRUIRO ERP</title>
                <meta name="description" content="Historique des versions et nouveautés de CONSTRUIRO ERP." />
            </Head>

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="mx-auto max-w-3xl px-4 py-5 flex items-center justify-between">
                        <a href="/" className="flex items-center gap-2">
                            <span className="text-xl font-black text-orange-500">CONSTRUIRO</span>
                            <span className="text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full">ERP</span>
                        </a>
                        <a href="/login" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">
                            Se connecter →
                        </a>
                    </div>
                </header>

                {/* Contenu */}
                <main className="mx-auto max-w-3xl px-4 py-12">
                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                            Notes de version
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Toutes les nouveautés, corrections et améliorations de CONSTRUIRO ERP.
                        </p>
                    </div>

                    {entries.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <p className="text-5xl mb-4">📋</p>
                            <p className="text-lg font-semibold">Aucune version publiée pour le moment.</p>
                            <p className="text-sm mt-1">Revenez prochainement.</p>
                        </div>
                    )}

                    <div className="relative">
                        {/* Ligne verticale timeline */}
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                        <div className="space-y-8">
                            {entries.map((entry, idx) => {
                                const style = TYPE_STYLE[entry.type] ?? TYPE_STYLE.feature;
                                const date  = entry.published_at
                                    ? new Date(entry.published_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                      })
                                    : null;

                                return (
                                    <div key={entry.id} className="sm:pl-12 relative">
                                        {/* Dot timeline */}
                                        <div className={`hidden sm:flex absolute left-0 top-3 w-8 h-8 rounded-full items-center justify-center text-xs font-bold border-2
                                            ${idx === 0
                                                ? 'bg-orange-500 border-orange-500 text-white'
                                                : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-400'
                                            }`}>
                                            {idx === 0 ? '★' : '·'}
                                        </div>

                                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                            {/* En-tête version */}
                                            <div className={`px-6 py-4 flex flex-wrap items-center gap-3 ${idx === 0 ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                                                <span className={`text-lg font-black font-mono ${idx === 0 ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
                                                    {entry.version}
                                                </span>
                                                {idx === 0 && (
                                                    <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                                        Dernière version
                                                    </span>
                                                )}
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${style.cls}`}>
                                                    {style.label}
                                                </span>
                                                <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {entry.title}
                                                </span>
                                                {date && (
                                                    <span className="text-xs text-slate-400 shrink-0">
                                                        {date}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Corps Markdown */}
                                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                                                <SimpleMarkdown body={entry.body} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 py-8">
                    <p className="text-center text-xs text-slate-400">
                        © {new Date().getFullYear()} IBIG Soft — CONSTRUIRO ERP
                    </p>
                </footer>
            </div>
        </>
    );
}
