import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageHeader } from '@/Components/UI';

// ---------- Config par statut -----------------------------------------------
const STATUS_CONFIG = {
    ok: {
        badge:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        dot:     'bg-emerald-500',
        border:  'border-emerald-200 dark:border-emerald-800',
        label:   'Opérationnel',
    },
    warning: {
        badge:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        dot:     'bg-yellow-400',
        border:  'border-yellow-200 dark:border-yellow-700',
        label:   'Attention',
    },
    error: {
        badge:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        dot:     'bg-red-500',
        border:  'border-red-300 dark:border-red-700',
        label:   'Critique',
    },
};

// ---------- Icônes SVG inline par service -----------------------------------
const SERVICE_ICONS = {
    database: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 7c0-1.657 3.582-3 8-3s8 1.343 8 3v2c0 1.657-3.582 3-8 3S4 10.657 4 9V7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 9v5c0 1.657 3.582 3 8 3s8-1.343 8-3V9" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 14v5c0 1.657 3.582 3 8 3s8-1.343 8-3v-5" />
        </svg>
    ),
    smtp: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    disk: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17h6M9 13h6M9 9h2" />
        </svg>
    ),
    queue: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 6h16M4 10h16M4 14h10M4 18h6" />
        </svg>
    ),
    cache: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    storage: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10 12h4" />
        </svg>
    ),
};

// ---------- Carte d'un service ----------------------------------------------
function CheckCard({ serviceKey, check }) {
    const cfg   = STATUS_CONFIG[check.status] ?? STATUS_CONFIG.warning;
    const icon  = SERVICE_ICONS[serviceKey];

    return (
        <div className={`card border ${cfg.border} transition-all`}>
            <div className="card-body flex items-start gap-4">
                {/* Icône */}
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800
                    flex items-center justify-center text-[#F58220]">
                    {icon}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {check.label}
                        </span>
                        {/* Badge statut */}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5
                            text-xs font-semibold ${cfg.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate" title={check.detail}>
                        {check.detail}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ---------- Calcul du statut global ----------------------------------------
function globalStatus(checks) {
    const values = Object.values(checks);
    if (values.some(c => c.status === 'error'))   return 'error';
    if (values.some(c => c.status === 'warning')) return 'warning';
    return 'ok';
}

// ---------- Page principale -------------------------------------------------
export default function HealthIndex({ checks, phpVersion, laravelVersion, appVersion }) {
    const overall = globalStatus(checks);
    const cfg     = STATUS_CONFIG[overall];

    function handleRefresh() {
        router.reload({ only: ['checks', 'phpVersion', 'laravelVersion', 'appVersion'] });
    }

    return (
        <AppLayout title="SuperAdmin — Santé système">
            <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">

                {/* En-tête */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <PageHeader
                        title="Santé système"
                        subtitle="État en temps réel des services critiques de la plateforme CONSTRUIRO."
                    />
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="btn btn-secondary flex items-center gap-2 shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualiser
                    </button>
                </div>

                {/* Bandeau statut global */}
                <div className={`rounded-xl border ${cfg.border} px-5 py-4 flex items-center gap-3`}>
                    <span className={`w-3 h-3 rounded-full ${cfg.dot} shrink-0`} />
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                        Statut global&nbsp;:&nbsp;
                        <span className={`${
                            overall === 'ok'      ? 'text-emerald-600 dark:text-emerald-400' :
                            overall === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-red-600 dark:text-red-400'
                        }`}>{cfg.label}</span>
                    </span>
                </div>

                {/* Grille des 6 checks */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(checks).map(([key, check]) => (
                        <CheckCard key={key} serviceKey={key} check={check} />
                    ))}
                </div>

                {/* Versions */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            Informations de version
                        </h3>
                    </div>
                    <div className="card-body">
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <dt className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                                    PHP
                                </dt>
                                <dd className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {phpVersion}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                                    Laravel
                                </dt>
                                <dd className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {laravelVersion}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                                    CONSTRUIRO ERP
                                </dt>
                                <dd className="font-mono text-sm font-semibold text-[#F58220]">
                                    v{appVersion}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                    Les vérifications sont effectuées à la demande (pas de polling automatique).
                    Cliquez sur <strong>Actualiser</strong> pour relancer tous les checks.
                </p>
            </div>
        </AppLayout>
    );
}
