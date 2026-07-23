import { Link, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import ConstruiroLogo from '@/Components/ConstruiroLogo';
import { useTrans } from '@/i18n';

const SUPERADMIN_NAV = [
    { key: 'sa-dashboard',        label: 'Tableau de bord',       icon: 'layout-dashboard', route: '/superadmin' },
    { key: 'sa-companies',        label: 'Entreprises',           icon: 'building-2',       route: '/superadmin/clients' },
    { key: 'sa-subscriptions',    label: 'Abonnements',           icon: 'credit-card',      route: '/superadmin/subscriptions' },
    { key: 'sa-plans',            label: 'Plans tarifaires',      icon: 'tag',              route: '/superadmin/plans' },
    { key: 'sa-offers',           label: 'Offres personnalisées', icon: 'gift',             route: '/superadmin/offers' },
    { key: 'sa-support',          label: 'Tickets support',       icon: 'life-buoy',        route: '/superadmin/support' },
    { key: 'sa-users',            label: 'Utilisateurs globaux',  icon: 'users',            route: '/superadmin/users' },
    { key: 'sa-email-templates',  label: 'Templates emails',      icon: 'mail',             route: '/superadmin/email-templates' },
    { key: 'sa-smtp',             label: 'Configuration SMTP',    icon: 'settings',         route: '/superadmin/smtp' },
    { key: 'sa-changelogs',       label: 'Changelog',             icon: 'git-branch',       route: '/superadmin/changelogs' },
    { key: 'sa-landing',          label: 'Landing page admin',    icon: 'globe',            route: '/superadmin/landing' },
    { key: 'sa-reports',          label: 'Rapports / Stats',      icon: 'bar-chart-2',      route: '/superadmin/reports' },
    { key: 'sa-prospects',        label: 'Prospects / Démos',     icon: 'user-plus',        route: '/superadmin/prospects' },
    { key: 'sa-payment-config',   label: 'Méthodes de paiement',  icon: 'credit-card',      route: '/superadmin/payment-config' },
    { key: 'sa-payment-orders',   label: 'Ordres de paiement',    icon: 'file-text',        route: '/superadmin/payment-orders' },
    { key: 'sa-vouchers',         label: 'Vouchers prépayés',     icon: 'ticket',           route: '/superadmin/vouchers' },
    { key: 'sa-academy',          label: 'Académie — Contenu',    icon: 'book-open',        route: '/superadmin/academy' },
    { key: 'sa-ai-setting',       label: 'Configuration IA',      icon: 'cpu',              route: '/superadmin/ai-setting' },
    { key: 'sa-ai-usage',         label: 'Journal IA',            icon: 'activity',         route: '/superadmin/ai-usage' },
    { key: 'sa-backups',          label: 'Sauvegardes',           icon: 'database',         route: '/superadmin/backups' },
];

/**
 * Sidebar responsive :
 * - Mobile (<lg) : fixed overlay (z-50), translate-x pour ouvrir/fermer
 * - Desktop (≥lg) : sticky dans le flux, largeur w-64 ou w-0
 */
export default function Sidebar({ open = false, onClose }) {
    const { auth, subscription, pendingPaymentOrders } = usePage().props;
    const currentPath = usePage().url;
    const { t } = useTrans();
    const portal = auth?.portal;
    const navigation = auth?.navigation ?? [];
    const isSuperAdmin = auth?.user?.roles?.includes('ibig_superadmin');
    const showPaymentLink = subscription && ['trial', 'grace', 'expired'].includes(subscription.status);

    return (
        <aside
            className={[
                'flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 overflow-hidden transition-all duration-200',
                'fixed inset-y-0 left-0 z-50 h-full w-64',
                open ? 'translate-x-0' : '-translate-x-full',
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

            {/* Badge SuperAdmin */}
            {isSuperAdmin && (
                <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ background: 'rgba(245,130,32,0.12)', border: '1px solid rgba(245,130,32,0.25)' }}>
                    <Icon name="shield" className="h-4 w-4 shrink-0 text-orange-400" />
                    <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-orange-400/70">IBIG Soft</div>
                        <div className="truncate text-xs font-semibold text-orange-300">Super Admin</div>
                    </div>
                </div>
            )}

            {/* En-tête du portail actif (utilisateurs normaux) */}
            {portal && !isSuperAdmin && (
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

            {/* Navigation SuperAdmin */}
            {isSuperAdmin ? (
                <nav className="flex-1 overflow-y-auto px-3 py-2">
                    <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Console Admin
                    </div>
                    <ul className="space-y-0.5">
                        {SUPERADMIN_NAV.map(item => {
                            const active = currentPath === item.route || currentPath.startsWith(item.route + '/');
                            const badge = item.key === 'sa-payment-orders' && pendingPaymentOrders > 0
                                ? pendingPaymentOrders
                                : null;
                            return (
                                <li key={item.key}>
                                    {item.key === 'sa-backups' && (
                                        <div className="mt-3 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Infrastructure</div>
                                    )}
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
                                        <span className="flex-1 truncate">{t(item.label)}</span>
                                        {badge && (
                                            <span className="ml-auto shrink-0 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                                                {badge}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-4 px-2 pt-3 border-t border-slate-800">
                        <Link href="/"
                            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition">
                            <Icon name="external-link" className="h-3.5 w-3.5" />
                            {t('Voir la landing page')}
                        </Link>
                    </div>
                </nav>
            ) : (
                /* Navigation normale par groupes */
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

                    {/* Lien paiement abonnement — affiché si trial / grace / expired */}
                    {showPaymentLink && (
                        <div>
                            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                {t('Facturation')}
                            </div>
                            <ul className="space-y-0.5">
                                <li>
                                    <Link
                                        href={route('billing.payment.index')}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ${
                                            currentPath.startsWith('/billing/payment')
                                                ? 'bg-orange-500 font-medium text-white'
                                                : 'text-orange-400 hover:bg-slate-800 hover:text-orange-300'
                                        }`}
                                    >
                                        <Icon name="credit-card" className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{t('Payer mon abonnement')}</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    )}
                </nav>
            )}

            {/* Pied */}
            <div className="border-t border-slate-800 px-4 py-3 text-[10px] text-slate-500">
                © {new Date().getFullYear()} IBIG Soft
            </div>
        </aside>
    );
}
