import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import BottomNav from '@/Components/BottomNav';
import Dropdown from '@/Components/Dropdown';
import Icon from '@/Components/Icon';
import Toast from '@/Components/Toast';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import NotificationBell from '@/Components/NotificationBell';
import { useTrans } from '@/i18n';

export default function AppLayout({ header, title, breadcrumbs = [], children }) {
    const { auth, subscription } = usePage().props;
    const user = auth?.user;
    const { t } = useTrans();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const pageTitle = title || header;

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
            {/* Backdrop mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Barre supérieure */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen((v) => !v)}
                            className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label={t('Ouvrir le menu')}
                        >
                            <Icon name="menu" className="h-5 w-5" />
                        </button>
                        {pageTitle && (
                            <h1 className="truncate text-base font-semibold text-slate-800 sm:text-lg dark:text-slate-100">
                                {t(pageTitle)}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <NotificationBell />
                        <LanguageSwitcher />
                        {user?.company && (
                            <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:flex">
                                <Icon name="building-2" className="h-3.5 w-3.5" />
                                <span className="max-w-[120px] truncate">{user.company.name}</span>
                            </span>
                        )}

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm text-slate-700 hover:bg-slate-100 sm:pr-3 dark:text-slate-200 dark:hover:bg-slate-800">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                        {user?.name?.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="hidden text-left leading-tight sm:block">
                                        <span className="block max-w-[100px] truncate font-medium">{user?.name}</span>
                                        <span className="block text-[11px] text-slate-400">{user?.job_title}</span>
                                    </span>
                                    <Icon name="chevron-down" className="h-4 w-4 shrink-0" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    {t('Mon profil')}
                                </Dropdown.Link>
                                <Dropdown.Link href={route('billing.index')}>
                                    {t('Abonnement')}
                                </Dropdown.Link>
                                <Dropdown.Link href={route('support.index')}>
                                    {t('Support')}
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    {t('Déconnexion')}
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Bandeau abonnement grâce / expiration imminente */}
                {subscription && (subscription.is_grace || (subscription.days_remaining <= 7 && subscription.status !== 'expired')) && (
                    <div className={`flex items-center justify-between gap-3 px-4 py-2 text-sm ${
                        subscription.is_grace
                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                    }`}>
                        <span>
                            <Icon name={subscription.is_grace ? 'alert-triangle' : 'clock'} className="mr-1.5 inline h-4 w-4" />
                            {subscription.is_grace
                                ? t('Période de grâce — renouvelez votre abonnement pour conserver l\'accès.')
                                : `${t('Votre abonnement expire dans')} ${subscription.days_remaining} ${t('jour(s)')}.`
                            }
                        </span>
                        <Link href={route('billing.index')} className="shrink-0 font-medium underline underline-offset-2">
                            {t('Renouveler')}
                        </Link>
                    </div>
                )}

                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                        <Link href="/dashboard" className="hover:text-orange-500">
                            <Icon name="home" className="h-3.5 w-3.5" />
                        </Link>
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1.5">
                                <Icon name="chevron-right" className="h-3 w-3 shrink-0" />
                                {crumb.href && i < breadcrumbs.length - 1 ? (
                                    <Link href={crumb.href} className="hover:text-orange-500">
                                        {t(crumb.label)}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-slate-700 dark:text-slate-200">
                                        {t(crumb.label)}
                                    </span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}

                {/* Contenu principal — pb-20 sur mobile pour la bottom nav */}
                <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>
            </div>

            {/* Bottom navigation mobile */}
            <BottomNav onOpenMenu={() => setSidebarOpen(true)} />

            <Toast />
        </div>
    );
}
