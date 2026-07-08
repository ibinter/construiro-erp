import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Dropdown from '@/Components/Dropdown';
import Icon from '@/Components/Icon';
import Toast from '@/Components/Toast';

/**
 * Layout principal de l'application ERP : sidebar adaptative + barre supérieure
 * + zone de contenu. Utilisé par tous les écrans internes.
 */
export default function AppLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar open={sidebarOpen} />

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Barre supérieure */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen((v) => !v)}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Basculer le menu"
                        >
                            <Icon name="menu" className="h-5 w-5" />
                        </button>
                        {header && (
                            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                {header}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {user?.company && (
                            <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:flex">
                                <Icon name="building-2" className="h-3.5 w-3.5" />
                                {user.company.name}
                            </span>
                        )}

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                        {user?.name?.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="hidden text-left leading-tight sm:block">
                                        <span className="block font-medium">{user?.name}</span>
                                        <span className="block text-[11px] text-slate-400">
                                            {user?.job_title}
                                        </span>
                                    </span>
                                    <Icon name="chevron-down" className="h-4 w-4" />
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Mon profil
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Déconnexion
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>

            <Toast />
        </div>
    );
}
