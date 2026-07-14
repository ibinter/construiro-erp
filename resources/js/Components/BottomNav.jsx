import { Link, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

/**
 * Navigation inférieure fixe — mobile uniquement (lg:hidden).
 * Affiche 4 accès prioritaires + « Menu » qui ouvre la sidebar.
 */
export default function BottomNav({ onOpenMenu }) {
    const { url, props } = usePage();
    const { auth } = props;
    const { t } = useTrans();

    // Accès prioritaires selon les permissions disponibles
    const allItems = [
        { key: 'dashboard',  href: '/dashboard',          icon: 'layout-dashboard', label: 'Accueil',   perm: null },
        { key: 'projects',   href: '/projects',           icon: 'hard-hat',         label: 'Projets',   perm: 'projects.view' },
        { key: 'invoices',   href: '/invoices',           icon: 'file-text',        label: 'Factures',  perm: 'invoicing.view' },
        { key: 'hr',         href: '/hr',                 icon: 'users',            label: 'RH',        perm: 'hr.view' },
        { key: 'treasury',   href: '/treasury',           icon: 'wallet',           label: 'Trésorerie',perm: 'treasury.view' },
        { key: 'bi',         href: '/bi',                 icon: 'bar-chart-2',      label: 'BI',        perm: 'bi.view' },
        { key: 'clients',    href: '/clients',            icon: 'building-2',       label: 'Clients',   perm: 'clients.view' },
        { key: 'stocks',     href: '/stocks',             icon: 'package',          label: 'Stock',     perm: 'stocks.view' },
        { key: 'qhse',       href: '/hse',                icon: 'shield-check',     label: 'QHSE',      perm: 'qhse.view' },
        { key: 'support',    href: '/support',            icon: 'life-buoy',        label: 'Support',   perm: null },
    ];

    const userPerms = auth?.user?.permissions ?? [];

    const canAccess = (perm) => {
        if (!perm) return true;
        if (auth?.user?.roles?.includes('super_admin')) return true;
        return userPerms.includes(perm);
    };

    // Garder les 4 premiers accessibles
    const items = allItems.filter(i => canAccess(i.perm)).slice(0, 4);

    const isActive = (href) => {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-30 flex lg:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            aria-label="Navigation principale mobile"
        >
            {items.map((item) => {
                const active = isActive(item.href);
                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                            active
                                ? 'text-orange-500'
                                : 'text-slate-500 dark:text-slate-400'
                        }`}
                        aria-current={active ? 'page' : undefined}
                    >
                        <Icon
                            name={item.icon}
                            className={`h-5 w-5 ${active ? 'text-orange-500' : ''}`}
                        />
                        <span>{t(item.label)}</span>
                    </Link>
                );
            })}

            {/* Bouton « Menu » pour ouvrir la sidebar */}
            <button
                onClick={onOpenMenu}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-slate-500 transition-colors hover:text-orange-500 dark:text-slate-400"
                aria-label={t('Menu')}
            >
                <Icon name="grid-3x3" className="h-5 w-5" />
                <span>{t('Menu')}</span>
            </button>
        </nav>
    );
}
