import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

/**
 * Cloche de notifications ERP.
 * - Polling toutes les 30 s sur GET /notifications (JSON)
 * - Badge rouge avec le nombre de notifications non lues
 * - Dropdown avec les 10 dernières + bouton "Tout marquer comme lu"
 * - Compatible dark mode (orange-500 / slate-800)
 */
export default function NotificationBell() {
    const { t } = useTrans();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // -------------------------------------------------------------------
    // Fetch
    // -------------------------------------------------------------------
    const fetchNotifications = () => {
        fetch(route('notifications.index'), {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => setNotifications(Array.isArray(data) ? data : []))
            .catch(() => {});
    };

    useEffect(() => {
        fetchNotifications();
        const timer = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(timer);
    }, []);

    // Fermer en cliquant en dehors
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // -------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------
    const markRead = (id) => {
        fetch(route('notifications.read', id), {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                Accept: 'application/json',
            },
            credentials: 'same-origin',
        }).then(() => setNotifications((prev) => prev.filter((n) => n.id !== id)));
    };

    const markAllRead = () => {
        fetch(route('notifications.readAll'), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                Accept: 'application/json',
            },
            credentials: 'same-origin',
        }).then(() => setNotifications([]));
    };

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------
    const timeAgo = (iso) => {
        const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
        if (diff < 60)  return t('À l\'instant');
        if (diff < 3600) return `${Math.floor(diff / 60)} ${t('min')}`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        return `${Math.floor(diff / 86400)} j`;
    };

    const typeIcon = (type) => {
        const map = {
            invoice_due:    'file-text',
            quote_accepted: 'check-circle',
            qhse_incident:  'alert-triangle',
            budget_alert:   'trending-down',
            info:           'info',
        };
        return map[type] ?? 'bell';
    };

    const typeColor = (type) => {
        const map = {
            invoice_due:    'text-blue-500',
            quote_accepted: 'text-green-500',
            qhse_incident:  'text-red-500',
            budget_alert:   'text-yellow-500',
            info:           'text-slate-400',
        };
        return map[type] ?? 'text-slate-400';
    };

    const unreadCount = notifications.length;
    const visible = notifications.slice(0, 10);

    // -------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------
    return (
        <div ref={dropdownRef} className="relative">
            {/* Bouton cloche */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={t('Notifications')}
            >
                <Icon name="bell" className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    {/* En-tête */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {t('Notifications')}
                            {unreadCount > 0 && (
                                <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                    {unreadCount}
                                </span>
                            )}
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                            >
                                {t('Tout marquer comme lu')}
                            </button>
                        )}
                    </div>

                    {/* Liste */}
                    <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                        {visible.length === 0 ? (
                            <li className="px-4 py-6 text-center text-sm text-slate-400">
                                {t('Aucune notification')}
                            </li>
                        ) : (
                            visible.map((n) => (
                                <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    {/* Icône type */}
                                    <span className={`mt-0.5 shrink-0 ${typeColor(n.type)}`}>
                                        <Icon name={typeIcon(n.type)} className="h-4 w-4" />
                                    </span>

                                    {/* Contenu */}
                                    <div className="min-w-0 flex-1">
                                        {n.link ? (
                                            <a
                                                href={n.link}
                                                onClick={() => { markRead(n.id); setOpen(false); }}
                                                className="block text-sm font-medium text-slate-800 hover:text-orange-500 dark:text-slate-100 dark:hover:text-orange-400 truncate"
                                            >
                                                {n.title}
                                            </a>
                                        ) : (
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                                {n.title}
                                            </p>
                                        )}
                                        {n.body && (
                                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {n.body}
                                            </p>
                                        )}
                                        <p className="mt-1 text-[10px] text-slate-400">
                                            {timeAgo(n.created_at)}
                                        </p>
                                    </div>

                                    {/* Bouton marquer lu */}
                                    <button
                                        onClick={() => markRead(n.id)}
                                        className="shrink-0 rounded p-1 text-slate-300 hover:text-orange-500 dark:text-slate-600 dark:hover:text-orange-400"
                                        aria-label={t('Marquer comme lu')}
                                        title={t('Marquer comme lu')}
                                    >
                                        <Icon name="x" className="h-3 w-3" />
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
