import { useState, useRef, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';

/**
 * Barre de recherche globale inter-modules.
 * - Ctrl+K (ou Cmd+K) pour ouvrir/focaliser
 * - Échap pour fermer
 * - Debounce 300 ms, minimum 2 caractères
 * - Résultats filtrés par company_id et permissions (côté serveur)
 */
export default function GlobalSearch() {
    const { t } = useTrans();
    const [query, setQuery]     = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen]       = useState(false);

    const inputRef  = useRef(null);
    const wrapRef   = useRef(null);
    const timerRef  = useRef(null);

    // Fermer le dropdown si clic en dehors
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Raccourcis clavier globaux : Ctrl+K / Cmd+K et Échap
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
            if (e.key === 'Escape') {
                setOpen(false);
                setQuery('');
                setResults([]);
                inputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const search = useCallback((q) => {
        clearTimeout(timerRef.current);

        if (q.length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }

        setLoading(true);
        timerRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    route('search.index') + '?q=' + encodeURIComponent(q),
                    { headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' } }
                );
                const data = await res.json();
                setResults(data.results ?? []);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        search(val);
    };

    const navigate = (result) => {
        setOpen(false);
        setQuery('');
        setResults([]);
        if (result.route) {
            router.visit(route(result.route, result.id));
        }
    };

    return (
        <div ref={wrapRef} className="relative hidden md:block">
            {/* Champ de recherche */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 px-3 py-1.5 w-56 lg:w-72">
                <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder={t('Rechercher…') + ' (Ctrl+K)'}
                    className="flex-1 bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
                {loading && (
                    <div
                        className="h-3 w-3 shrink-0 animate-spin rounded-full border-2"
                        style={{ borderColor: BRAND, borderTopColor: 'transparent' }}
                    />
                )}
            </div>

            {/* Dropdown résultats */}
            {open && results.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 max-h-80 overflow-y-auto">
                    {results.map((r, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(r)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
                        >
                            <span className="text-xl shrink-0">{r.icon}</span>
                            <span className="flex-1 min-w-0">
                                <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {r.title}
                                </span>
                                {r.sub && (
                                    <span className="block text-xs text-slate-400 truncate">
                                        {r.label} · {r.sub}
                                    </span>
                                )}
                            </span>
                            {!r.route && (
                                <span className="ml-auto text-xs text-slate-300 shrink-0">{t('Aide')}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Aucun résultat */}
            {open && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute left-0 top-full mt-1 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 px-4 py-6 text-center text-sm text-slate-400">
                    {t('Aucun résultat pour')} « {query} »
                </div>
            )}
        </div>
    );
}
