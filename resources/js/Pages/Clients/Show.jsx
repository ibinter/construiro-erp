import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router } from '@inertiajs/react';
import { formatMoney } from '@/constants';
import { useTrans } from '@/i18n';

/* ---------- Libellés locaux ------------------------------------------------ */

const CLIENT_TYPE = {
    particulier: 'Particulier',
    entreprise:  'Entreprise',
    public:      'Secteur public',
    promoteur:   'Promoteur immobilier',
};

const TYPE_COLOR = {
    particulier: 'bg-slate-100 text-slate-600',
    entreprise:  'bg-blue-100 text-blue-700',
    public:      'bg-purple-100 text-purple-700',
    promoteur:   'bg-orange-100 text-orange-700',
};

const INVOICE_STATUS = {
    draft:     { label: 'Brouillon',  color: 'bg-slate-100 text-slate-600' },
    sent:      { label: 'Envoyée',    color: 'bg-blue-100 text-blue-700' },
    partial:   { label: 'Partielle',  color: 'bg-amber-100 text-amber-700' },
    paid:      { label: 'Payée',      color: 'bg-green-100 text-green-700' },
    overdue:   { label: 'En retard',  color: 'bg-red-100 text-red-700' },
    cancelled: { label: 'Annulée',    color: 'bg-slate-100 text-slate-500' },
};

const QUOTE_STATUS = {
    draft:    { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
    sent:     { label: 'Envoyé',    color: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'Accepté',   color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Refusé',    color: 'bg-red-100 text-red-700' },
    expired:  { label: 'Expiré',    color: 'bg-amber-100 text-amber-700' },
};

/* ---------- Composants utilitaires ---------------------------------------- */

function KpiCard({ icon, label, value, sub, accent }) {
    const accentCls = accent === 'green'
        ? 'bg-green-50 text-green-600 dark:bg-green-900/20'
        : accent === 'red'
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
            : accent === 'blue'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20';

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${accentCls}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    {icon}
                </svg>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
            <div className="text-sm font-medium text-slate-500">{label}</div>
            {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
        </div>
    );
}

function StatusBadge({ map, status }) {
    const { t } = useTrans();
    const s = map[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            {t(s.label)}
        </span>
    );
}

function SectionCard({ icon, title, children }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    {icon}
                </svg>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function EmptyRow({ message }) {
    return (
        <tr>
            <td colSpan={10} className="px-5 py-8 text-center text-sm text-slate-400">{message}</td>
        </tr>
    );
}

/* ---------- Page principale ----------------------------------------------- */

export default function Show({ client, invoices = [], quotes = [], stats = {}, can }) {
    const { t } = useTrans();
    const [confirmDelete, setConfirmDelete] = useState(false);

    const deleteClient = () => {
        router.delete(`/clients/${client.id}`);
    };

    const typeColor = TYPE_COLOR[client.type] ?? 'bg-slate-100 text-slate-600';
    const currency  = invoices[0]?.currency ?? 'XOF';

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

    return (
        <AppLayout header="Fiche client">
            <Head title={client.name} />

            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1 text-sm text-slate-400">
                <Link href="/clients" className="hover:text-orange-600">{t('Clients')}</Link>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-slate-600 dark:text-slate-300">{client.name}</span>
            </nav>

            {/* En-tête */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/clients" className="text-slate-400 hover:text-orange-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{client.name}</h2>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor}`}>
                                {t(CLIENT_TYPE[client.type] ?? client.type)}
                            </span>
                            {!client.is_active && (
                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800">
                                    {t('Inactif')}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400">{client.code}{client.city ? ` · ${client.city}` : ''}</p>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={`/quotes/create?client_id=${client.id}`}
                        className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('Nouveau devis')}
                    </Link>
                    <Link
                        href={`/invoices/create?client_id=${client.id}`}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        {t('Nouvelle facture')}
                    </Link>
                    <a
                        href={`/clients/${client.id}/pdf`}
                        target="_blank" rel="noopener"
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        PDF
                    </a>
                    {can.update && (
                        <Link
                            href={`/clients/${client.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                            {t('Modifier')}
                        </Link>
                    )}
                    {can.delete && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            {t('Supprimer')}
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard
                    accent="orange"
                    label={t('CA total')}
                    value={formatMoney(stats.ca_total ?? 0, currency)}
                    sub={t('toutes factures')}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />}
                />
                <KpiCard
                    accent="green"
                    label={t('Factures payées')}
                    value={formatMoney(stats.invoices_paid ?? 0, currency)}
                    sub={t('montant encaissé')}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
                <KpiCard
                    accent="red"
                    label={t('En attente')}
                    value={formatMoney(stats.invoices_pending ?? 0, currency)}
                    sub={t('reste à encaisser')}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
                <KpiCard
                    accent="blue"
                    label={t('Devis en cours')}
                    value={stats.quotes_count ?? 0}
                    sub={t('devis émis')}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />}
                />
            </div>

            {/* Informations client */}
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {t('Coordonnées')}
                    </h3>
                    <dl className="space-y-2 text-sm">
                        {[
                            [t('Contact'), client.contact_name],
                            [t('Téléphone'), client.phone],
                            [t('E-mail'), client.email],
                            [t('Adresse'), client.address],
                            [t('Ville'), client.city],
                            [t('Pays'), client.country],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between gap-2">
                                <dt className="text-slate-400 shrink-0">{label}</dt>
                                <dd className="text-right text-slate-700 dark:text-slate-200">{val || '—'}</dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        {t('Informations')}
                    </h3>
                    <dl className="space-y-2 text-sm">
                        {[
                            [t('Code'), client.code],
                            [t('Type'), CLIENT_TYPE[client.type] ?? client.type],
                            [t('NIF / IFU'), client.tax_id],
                            [t('Statut'), client.is_active ? t('Actif') : t('Inactif')],
                        ].map(([label, val]) => (
                            <div key={label} className="flex justify-between gap-2">
                                <dt className="text-slate-400 shrink-0">{label}</dt>
                                <dd className="text-right text-slate-700 dark:text-slate-200">{val || '—'}</dd>
                            </div>
                        ))}
                    </dl>
                    {client.notes && (
                        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {client.notes}
                        </div>
                    )}
                </div>
            </div>

            {/* Factures récentes */}
            <div className="mb-6">
                <SectionCard
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />}
                    title={t('Factures récentes')}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    {[t('Référence'), t('Date'), t('Échéance'), t('Total TTC'), t('Statut')].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {invoices.length === 0
                                    ? <EmptyRow message={t('Aucune facture pour ce client.')} />
                                    : invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                                                <Link href={`/invoices/${inv.id}`} className="hover:text-orange-600">
                                                    {inv.code}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3 text-slate-500">{fmtDate(inv.issue_date)}</td>
                                            <td className="px-5 py-3 text-slate-500">{fmtDate(inv.due_date)}</td>
                                            <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                                                {formatMoney(inv.total, inv.currency)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge map={INVOICE_STATUS} status={inv.status} />
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                        <Link href={`/invoices?client_id=${client.id}`} className="text-sm text-orange-600 hover:underline">
                            {t('Voir toutes les factures')} →
                        </Link>
                    </div>
                </SectionCard>
            </div>

            {/* Devis récents */}
            <div className="mb-6">
                <SectionCard
                    icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />}
                    title={t('Devis récents')}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    {[t('Référence'), t('Titre'), t('Date'), t('Total TTC'), t('Statut')].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {quotes.length === 0
                                    ? <EmptyRow message={t('Aucun devis pour ce client.')} />
                                    : quotes.map((q) => (
                                        <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                                                <Link href={`/quotes/${q.id}`} className="hover:text-orange-600">
                                                    {q.code}
                                                </Link>
                                            </td>
                                            <td className="max-w-[200px] truncate px-5 py-3 text-slate-500">{q.title || '—'}</td>
                                            <td className="px-5 py-3 text-slate-500">{fmtDate(q.date)}</td>
                                            <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                                                {formatMoney(q.total, q.currency)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge map={QUOTE_STATUS} status={q.status} />
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                        <Link href={`/quotes?client_id=${client.id}`} className="text-sm text-orange-600 hover:underline">
                            {t('Voir tous les devis')} →
                        </Link>
                    </div>
                </SectionCard>
            </div>

            {/* Modal suppression */}
            <Modal show={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Supprimer ce client ?')}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        {t('Le client')} « {client.name} » {t('sera supprimé. Cette action est réversible (corbeille).')}
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setConfirmDelete(false)}>{t('Annuler')}</SecondaryButton>
                        <DangerButton onClick={deleteClient}>{t('Supprimer définitivement')}</DangerButton>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
