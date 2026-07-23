import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Icon from '@/Components/Icon';

// ─── Données de la checklist §38 ─────────────────────────────────────────────

const SECTIONS = [
    {
        key: 'infra',
        title: 'Infrastructure & Déploiement',
        icon: 'server',
        items: [
            { key: 'infra-1', label: 'VPS accessible sur construiro.com' },
            { key: 'infra-2', label: 'HTTPS/SSL valide et renouvelé automatiquement' },
            { key: 'infra-3', label: 'GitHub Actions déploie sans erreur' },
            { key: 'infra-4', label: 'Migrations exécutées sans erreur' },
            { key: 'infra-5', label: 'OPcache activé et opérationnel' },
            { key: 'infra-6', label: 'Worker queue fonctionnel (PID actif)' },
        ],
    },
    {
        key: 'auth',
        title: 'Authentification & Sécurité',
        icon: 'shield',
        items: [
            { key: 'auth-1', label: 'Inscription/connexion fonctionnelle' },
            { key: 'auth-2', label: 'Déconnexion fonctionne' },
            { key: 'auth-3', label: '2FA TOTP activable et vérifiable' },
            { key: 'auth-4', label: 'Headers de sécurité présents (CSP, HSTS, X-Frame-Options)' },
            { key: 'auth-5', label: 'Isolation company_id vérifiée (un utilisateur ne voit pas les données d\'une autre société)' },
            { key: 'auth-6', label: 'Journal d\'audit enregistre les actions' },
        ],
    },
    {
        key: 'licences',
        title: 'Licences & Paiements',
        icon: 'credit-card',
        items: [
            { key: 'lic-1', label: 'Essai gratuit 14 jours se crée à l\'inscription' },
            { key: 'lic-2', label: 'Email de bienvenue reçu' },
            { key: 'lic-3', label: 'Page facturation affiche le statut' },
            { key: 'lic-4', label: 'Mobile Money activé dans le SuperAdmin' },
            { key: 'lic-5', label: 'Paiement manuel : proof upload fonctionne' },
            { key: 'lic-6', label: 'Confirmation manuelle active l\'abonnement' },
        ],
    },
    {
        key: 'modules',
        title: 'Modules Métier',
        icon: 'layout-grid',
        items: [
            { key: 'mod-1', label: 'Projets : CRUD complet' },
            { key: 'mod-2', label: 'Devis/BOQ : création et édition' },
            { key: 'mod-3', label: 'Factures : création et téléchargement PDF' },
            { key: 'mod-4', label: 'Matériaux/Stock : entrée/sortie' },
            { key: 'mod-5', label: 'RH : pointage présences' },
            { key: 'mod-6', label: 'Équipements : liste et maintenance' },
        ],
    },
    {
        key: 'ia',
        title: 'IA & SARA',
        icon: 'cpu',
        items: [
            { key: 'ia-1', label: 'SARA répond sur la landing page' },
            { key: 'ia-2', label: 'Clé Groq active (pas d\'erreur 401)' },
            { key: 'ia-3', label: 'Journal IA enregistre les appels' },
            { key: 'ia-4', label: 'Académie : catégories et ressources visibles' },
        ],
    },
    {
        key: 'export',
        title: 'Import & Export',
        icon: 'file-down',
        items: [
            { key: 'exp-1', label: 'Import CSV clients fonctionne' },
            { key: 'exp-2', label: 'Import CSV projets fonctionne' },
            { key: 'exp-3', label: 'Export données fonctionne' },
            { key: 'exp-4', label: 'Modèles CSV téléchargeables' },
        ],
    },
    {
        key: 'backups',
        title: 'Sauvegardes',
        icon: 'database',
        items: [
            { key: 'bak-1', label: 'Sauvegarde BDD manuelle fonctionne' },
            { key: 'bak-2', label: 'Fichier sauvegarde téléchargeable depuis SuperAdmin' },
            { key: 'bak-3', label: 'Scheduler CRON configuré sur le VPS' },
        ],
    },
    {
        key: 'ux',
        title: 'Expérience Utilisateur',
        icon: 'monitor',
        items: [
            { key: 'ux-1', label: 'Responsive mobile 375px' },
            { key: 'ux-2', label: 'Pages d\'erreur personnalisées (tester /test-404)' },
            { key: 'ux-3', label: 'Recherche globale Ctrl+K fonctionne' },
            { key: 'ux-4', label: 'Pages légales accessibles depuis le footer' },
            { key: 'ux-5', label: 'Landing page : SARA, FAQ, tarifs visibles' },
        ],
    },
];

const STATUSES = {
    pending:  { label: 'À vérifier', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
    ok:       { label: 'OK',         color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', dot: 'bg-green-500' },
    blocking: { label: 'Bloquant',   color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', dot: 'bg-red-500' },
};

const STORAGE_KEY = 'construiro_recette_v38';

// ─── Helpers ────────────────────────────────────────────────────────────────

function initStatuses() {
    const initial = {};
    SECTIONS.forEach(s => s.items.forEach(item => { initial[item.key] = 'pending'; }));
    return initial;
}

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : initStatuses();
    } catch {
        return initStatuses();
    }
}

function exportCsv(statuses) {
    const rows = [['Section', 'Item', 'Statut']];
    SECTIONS.forEach(section => {
        section.items.forEach(item => {
            const s = statuses[item.key] ?? 'pending';
            rows.push([section.title, item.label, STATUSES[s]?.label ?? s]);
        });
    });
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recette-v38-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Composant StatusBadge ───────────────────────────────────────────────────

function StatusBadge({ status }) {
    const s = STATUSES[status] ?? STATUSES.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

// ─── Composant Section ───────────────────────────────────────────────────────

function Section({ section, statuses, onChange }) {
    const [open, setOpen] = useState(true);

    const total = section.items.length;
    const okCount = section.items.filter(i => statuses[i.key] === 'ok').length;
    const blockCount = section.items.filter(i => statuses[i.key] === 'blocking').length;

    const cycleStatus = useCallback((key) => {
        const order = ['pending', 'ok', 'blocking'];
        const current = statuses[key] ?? 'pending';
        const next = order[(order.indexOf(current) + 1) % order.length];
        onChange(key, next);
    }, [statuses, onChange]);

    return (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
            {/* En-tête section */}
            <button
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <Icon name={section.icon} className="h-5 w-5 shrink-0 text-orange-500" />
                <span className="flex-1 font-semibold text-slate-800 dark:text-slate-100">{section.title}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                    {okCount}/{total}
                    {blockCount > 0 && (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                            {blockCount} bloquant{blockCount > 1 ? 's' : ''}
                        </span>
                    )}
                </span>
                <Icon
                    name={open ? 'chevron-up' : 'chevron-down'}
                    className="h-4 w-4 text-slate-400 shrink-0"
                />
            </button>

            {/* Corps section */}
            {open && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700">
                    {section.items.map(item => {
                        const status = statuses[item.key] ?? 'pending';
                        return (
                            <div
                                key={item.key}
                                className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                                {/* Checkbox visuelle */}
                                <button
                                    onClick={() => cycleStatus(item.key)}
                                    title="Cliquer pour changer le statut"
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                        status === 'ok'
                                            ? 'border-green-500 bg-green-500 text-white'
                                            : status === 'blocking'
                                            ? 'border-red-500 bg-red-500 text-white'
                                            : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                                    }`}
                                >
                                    {status === 'ok' && <Icon name="check" className="h-3 w-3" />}
                                    {status === 'blocking' && <Icon name="x" className="h-3 w-3" />}
                                </button>

                                {/* Libellé */}
                                <span className={`flex-1 text-sm ${
                                    status === 'ok'
                                        ? 'text-slate-400 line-through dark:text-slate-500'
                                        : 'text-slate-700 dark:text-slate-200'
                                }`}>
                                    {item.label}
                                </span>

                                {/* Badge cliquable */}
                                <button
                                    onClick={() => cycleStatus(item.key)}
                                    title="Changer le statut"
                                    className="shrink-0"
                                >
                                    <StatusBadge status={status} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function RecetteIndex() {
    const [statuses, setStatuses] = useState(loadFromStorage);
    const [saved, setSaved] = useState(false);

    // Persistance auto
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
        } catch {}
    }, [statuses]);

    const handleChange = useCallback((key, value) => {
        setStatuses(prev => ({ ...prev, [key]: value }));
    }, []);

    // Score global
    const allItems = SECTIONS.flatMap(s => s.items);
    const totalItems = allItems.length;
    const okItems = allItems.filter(i => statuses[i.key] === 'ok').length;
    const blockingItems = allItems.filter(i => statuses[i.key] === 'blocking').length;
    const score = Math.round((okItems / totalItems) * 100);
    const isValidated = okItems === totalItems;

    const resetAll = () => {
        if (window.confirm('Réinitialiser toute la checklist ?')) {
            setStatuses(initStatuses());
        }
    };

    const markAllOk = () => {
        const all = {};
        allItems.forEach(i => { all[i.key] = 'ok'; });
        setStatuses(all);
    };

    return (
        <AppLayout title="Checklist Recette §38">
            <Head title="Checklist Recette §38 — CONSTRUIRO" />

            <div className="mx-auto max-w-4xl px-4 py-8">

                {/* ── En-tête ──────────────────────────────────────────────── */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <Icon name="clipboard-check" className="h-7 w-7 text-orange-500" />
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Checklist Recette §38
                            </h1>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Validation formelle avant mise en production · {totalItems} points de contrôle
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => exportCsv(statuses)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <Icon name="download" className="h-4 w-4" />
                            Exporter CSV
                        </button>
                        <button
                            onClick={resetAll}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        >
                            <Icon name="refresh-ccw" className="h-4 w-4" />
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* ── Carte score ──────────────────────────────────────────── */}
                <div className={`mb-8 rounded-2xl p-6 ${
                    isValidated
                        ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : blockingItems > 0
                        ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        : 'bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                }`}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                                    {okItems}
                                    <span className="text-2xl text-slate-400">/{totalItems}</span>
                                </span>
                                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                    isValidated
                                        ? 'bg-green-500 text-white'
                                        : blockingItems > 0
                                        ? 'bg-red-500 text-white'
                                        : 'bg-orange-500 text-white'
                                }`}>
                                    {isValidated ? 'Validé' : blockingItems > 0 ? `${blockingItems} bloquant(s)` : 'Recette en cours'}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                {score}% des points validés
                                {blockingItems > 0 && ` · ${blockingItems} point(s) bloquant(s) à résoudre`}
                            </p>
                        </div>

                        {/* Barre de progression */}
                        <div className="w-full sm:w-64">
                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        isValidated ? 'bg-green-500' : blockingItems > 0 ? 'bg-red-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>{okItems} OK</span>
                                {blockingItems > 0 && <span className="text-red-500">{blockingItems} bloquant(s)</span>}
                                <span>{totalItems - okItems - blockingItems} en attente</span>
                            </div>
                        </div>
                    </div>

                    {!isValidated && (
                        <button
                            onClick={markAllOk}
                            className="mt-4 text-xs text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            Tout marquer comme OK (simulation)
                        </button>
                    )}
                </div>

                {/* ── Légende ──────────────────────────────────────────────── */}
                <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Cliquer sur un item ou son badge pour changer le statut :</span>
                    {Object.entries(STATUSES).map(([k, v]) => (
                        <span key={k} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium ${v.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
                            {v.label}
                        </span>
                    ))}
                </div>

                {/* ── Sections accordéon ───────────────────────────────────── */}
                <div className="space-y-4">
                    {SECTIONS.map(section => (
                        <Section
                            key={section.key}
                            section={section}
                            statuses={statuses}
                            onChange={handleChange}
                        />
                    ))}
                </div>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
                    §38 Phase Recette — CONSTRUIRO ERP · Les états sont sauvegardés localement dans votre navigateur.
                </div>
            </div>
        </AppLayout>
    );
}
