import { Link, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';

/**
 * Sidebar du portail unique. Affiche l'en-tête du portail de l'utilisateur
 * puis les groupes de modules autorisés (calculés côté serveur par
 * App\Support\Navigation). Le contenu s'adapte donc automatiquement au rôle.
 */
export default function Sidebar({ open = true }) {
    const { auth, url } = usePage().props;
    const currentPath = usePage().url;
    const portal = auth?.portal;
    const navigation = auth?.navigation ?? [];

    return (
        <aside
            className={`${open ? 'w-64' : 'w-0'} sticky top-0 z-30 flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-900 text-slate-200 transition-all duration-200 dark:border-slate-800`}
        >
            {/* Marque */}
            <div className="flex items-center gap-2 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 font-bold text-white">
                    C
                </div>
                <div className="leading-tight">
                    <div className="text-sm font-bold tracking-wide text-white">
                        CONSTRUIRO
                    </div>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-orange-400">
                        ERP
                    </div>
                </div>
            </div>

            {/* En-tête du portail actif */}
            {portal && (
                <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-slate-800/70 px-3 py-2">
                    <Icon name={portal.icon} className="h-4 w-4 text-orange-400" />
                    <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                            Portail
                        </div>
                        <div className="truncate text-xs font-semibold text-white">
                            {portal.label}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation par groupes */}
            <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-2">
                {navigation.map((section) => (
                    <div key={section.key}>
                        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {section.label}
                        </div>
                        <ul className="space-y-0.5">
                            {section.items.map((item) => {
                                const active = currentPath.startsWith(item.route);
                                return (
                                    <li key={item.key}>
                                        <Link
                                            href={item.route}
                                            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                                                active
                                                    ? 'bg-orange-500 font-medium text-white'
                                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {navigation.length === 0 && (
                    <p className="px-2 text-xs text-slate-500">
                        Aucun module accessible.
                    </p>
                )}
            </nav>

            {/* Pied */}
            <div className="border-t border-slate-800 px-4 py-3 text-[10px] text-slate-500">
                © {new Date().getFullYear()} IBIG Soft
            </div>
        </aside>
    );
}
