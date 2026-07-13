import { Link, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import ConstruiroLogo from '@/Components/ConstruiroLogo';
import { useTrans } from '@/i18n';

/**
 * Sidebar responsive :
 * - Mobile (<lg) : fixed overlay (z-50), translate-x pour ouvrir/fermer
 * - Desktop (≥lg) : sticky dans le flux, largeur w-64 ou w-0
 */
export default function Sidebar({ open = false, onClose }) {
    const { auth } = usePage().props;
    const currentPath = usePage().url;
    const { t } = useTrans();
    const portal = auth?.portal;
    const navigation = auth?.navigation ?? [];

    return (
        <aside
            className={[
                // Base
                'flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 overflow-hidden transition-all duration-200',
                // Mobile : fixed overlay
                'fixed inset-y-0 left-0 z-50 h-full w-64',
                open ? 'translate-x-0' : '-translate-x-full',
                // Desktop : sticky dans le flux, pas de translate
                'lg:relative lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shrink-0',
                open ? 'lg:w-64' : 'lg:w-0',
            ].join(' ')}
        >
            {/* Bouton fermer (mobile uniquement) */}
            <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                aria-label="Fermer le menu"
            >
                <Icon name="x" className="h-4 w-4" />
            </button>

            {/* Marque */}
            <div className="flex items-center px-5 py-4">
                <ConstruiroLogo size="sm" dark />
            </div>

            {/* En-tête du portail actif */}
            {portal && (
                <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-slate-800/70 px-3 py-2">
                    <Icon name={portal.icon} className="h-4 w-4 shrink-0 text-orange-400" />
                    <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                            {t('Portail')}
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
                                            onClick={onClose}
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
                        {t('Aucun module accessible.')}
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
