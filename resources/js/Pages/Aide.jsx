import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ConstruiroLogo from '@/Components/ConstruiroLogo';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

// Icônes par catégorie
const CAT_ICONS = {
    demarrage:      '🚀',
    projets:        '🏗️',
    facturation:    '💰',
    stocks:         '📦',
    rh:             '👥',
    securite:       '🔒',
    rapports:       '📊',
    administration: '⚙️',
    modules:        '🧩',
    sara_ia:        '🤖',
    support:        '🎧',
};

// Fallback FAQ statiques si la table n'est pas encore seedée
const FALLBACK_FAQS = {
    demarrage: [
        { question: 'Comment démarrer mon essai gratuit ?', answer: "Cliquez sur « Essai gratuit » depuis la page d'accueil. Votre espace est créé instantanément, sans carte bancaire requise. Vous disposez de 30 jours pour tester toutes les fonctionnalités." },
        { question: "Quels modules sont inclus dans l'essai ?", answer: "Tous les modules sont inclus dans l'essai : Projets, RH, Finance, Stocks, Équipements, Devis, HSE, Bureau d'études, BI et SARA l'assistante IA." },
        { question: 'Comment importer mes données existantes ?', answer: "CONSTRUIRO propose des imports CSV/Excel pour les projets, clients, fournisseurs, employés et matériaux. Notre équipe vous accompagne lors de l'onboarding." },
    ],
    support: [
        { question: 'Comment contacter le support ?', answer: 'Via WhatsApp au +225 27 22 27 60 14, par email à contact@ibigsoft.com, ou en ouvrant un ticket depuis votre espace client.' },
        { question: 'Mes données sont-elles sécurisées ?', answer: 'Oui. Toutes les communications sont chiffrées HTTPS, les données sont sauvegardées quotidiennement, et l\'accès est protégé par un système de rôles et permissions granulaires.' },
    ],
};

const FALLBACK_CATEGORIES = {
    demarrage: 'Démarrage rapide',
    projets: 'Gestion des projets',
    facturation: 'Devis & Facturation',
    stocks: 'Stocks & Matériaux',
    rh: 'RH & Paie',
    securite: 'Sécurité & Accès',
    rapports: 'Rapports & Analytics',
    administration: 'Administration',
    modules: 'Modules métier',
    sara_ia: 'Assistant IA SARA',
    support: 'Support & Contact',
};

export default function Aide({ faqs = null, categories = null, totalFaqs = 0 }) {
    const { t } = useTrans();

    const resolvedCategories = categories ?? FALLBACK_CATEGORIES;
    const resolvedFaqs       = faqs ?? FALLBACK_FAQS;

    // État local : recherche + filtre catégorie (côté client)
    const [search,      setSearch]      = useState('');
    const [activecat,   setActivecat]   = useState('all');
    const [openItems,   setOpenItems]   = useState({});

    // Aplatir les FAQ pour la recherche côté client
    const allFaqs = useMemo(() => {
        const result = [];
        Object.entries(resolvedFaqs).forEach(([cat, items]) => {
            const list = Array.isArray(items) ? items : Object.values(items);
            list.forEach((item) => {
                result.push({ category: cat, ...item });
            });
        });
        return result;
    }, [resolvedFaqs]);

    // Filtrage côté client (instantané sans rechargement)
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return allFaqs.filter((item) => {
            const matchCat    = activecat === 'all' || item.category === activecat;
            const matchSearch = !q
                || item.question.toLowerCase().includes(q)
                || (item.answer  && item.answer.toLowerCase().includes(q))
                || (item.keywords && item.keywords.toLowerCase().includes(q));
            return matchCat && matchSearch;
        });
    }, [allFaqs, search, activecat]);

    // Regrouper les résultats filtrés par catégorie
    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach((item) => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [filtered]);

    const toggleItem = (key) => {
        setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const expandAll = () => {
        const next = {};
        filtered.forEach((item, i) => { next[`${item.category}-${i}`] = true; });
        setOpenItems(next);
    };

    const collapseAll = () => setOpenItems({});

    const catCount = Object.keys(grouped).length;
    const faqCount = filtered.length;

    return (
        <>
            <Head title={t("Centre d'aide — CONSTRUIRO ERP")} />
            <div className="min-h-screen" style={{ background: '#f8f9fb', color: NAVY }}>

                {/* ── Header ───────────────────────────────────────────────── */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <Link href="/"><ConstruiroLogo size="sm" /></Link>
                        <div className="flex items-center gap-4">
                            <a href="tel:+2252722276014"
                                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition">
                                📞 +225 27 22 27 60 14
                            </a>
                            <Link href="/"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                                {t('← Accueil')}
                            </Link>
                            <Link href={route('login')}
                                className="text-sm font-bold px-4 py-2 rounded-xl text-white transition hover:opacity-90"
                                style={{ background: BRAND }}>
                                {t('Mon espace')}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ── Hero + Barre de recherche ─────────────────────────── */}
                <section className="py-14 text-center" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #2d2d2d 100%)` }}>
                    <div className="max-w-3xl mx-auto px-4">
                        <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>
                            {t("Centre d'aide")}
                        </p>
                        <h1 className="text-4xl font-black text-white mb-3">
                            {t('Comment pouvons-nous vous aider ?')}
                        </h1>
                        <p className="text-gray-400 mb-7 text-sm">
                            {totalFaqs > 0
                                ? t(`${totalFaqs} réponses dans ${Object.keys(resolvedCategories).length} catégories`)
                                : t('Guides, FAQ et support — tout pour maîtriser CONSTRUIRO ERP.')}
                        </p>

                        {/* Barre de recherche */}
                        <div className="relative max-w-xl mx-auto">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setActivecat('all'); }}
                                placeholder={t('Rechercher une question, un module...')}
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium border-0 shadow-xl focus:outline-none focus:ring-2 text-gray-800"
                                style={{ '--tw-ring-color': BRAND }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg"
                                    aria-label="Effacer"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Corps principal ───────────────────────────────────── */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    {/* Pills de catégories */}
                    <div className="flex flex-wrap gap-2 mb-8 justify-center">
                        <button
                            onClick={() => setActivecat('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                activecat === 'all'
                                    ? 'text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
                            }`}
                            style={activecat === 'all' ? { background: BRAND } : {}}
                        >
                            {t('Toutes les catégories')}
                        </button>
                        {Object.entries(resolvedCategories).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => { setActivecat(activecat === key ? 'all' : key); setSearch(''); }}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                    activecat === key
                                        ? 'text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                }`}
                                style={activecat === key ? { background: BRAND } : {}}
                            >
                                <span className="text-base">{CAT_ICONS[key] ?? '📋'}</span>
                                {t(label)}
                            </button>
                        ))}
                    </div>

                    {/* Barre de statut + actions */}
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                        <p className="text-sm text-gray-500">
                            {faqCount > 0
                                ? <>
                                    <span className="font-bold" style={{ color: BRAND }}>{faqCount}</span>
                                    {' '}{t('question(s) dans')}{' '}
                                    <span className="font-bold" style={{ color: BRAND }}>{catCount}</span>
                                    {' '}{t('catégorie(s)')}
                                  </>
                                : t('Aucun résultat pour cette recherche.')}
                        </p>
                        {faqCount > 0 && (
                            <div className="flex gap-2 text-xs font-medium">
                                <button onClick={expandAll}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 transition">
                                    {t('Tout ouvrir')}
                                </button>
                                <button onClick={collapseAll}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 transition">
                                    {t('Tout fermer')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Aucun résultat */}
                    {faqCount === 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <div className="text-5xl mb-4">🔎</div>
                            <p className="text-lg font-bold text-gray-700 mb-2">
                                {t('Aucune réponse trouvée')}
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                {t('Essayez un autre mot-clé ou consultez toutes les catégories.')}
                            </p>
                            <button
                                onClick={() => { setSearch(''); setActivecat('all'); }}
                                className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
                                style={{ background: BRAND }}>
                                {t('Voir toutes les FAQ')}
                            </button>
                        </div>
                    )}

                    {/* Accordéons par catégorie */}
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([catKey, items]) => {
                            const catLabel = resolvedCategories[catKey] ?? catKey;
                            return (
                                <div key={catKey}>
                                    {/* En-tête de catégorie */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl">{CAT_ICONS[catKey] ?? '📋'}</span>
                                        <h2 className="text-lg font-black" style={{ color: NAVY }}>
                                            {t(catLabel)}
                                        </h2>
                                        <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                            style={{ background: BRAND }}>
                                            {items.length}
                                        </span>
                                    </div>

                                    {/* FAQ de la catégorie */}
                                    <div className="space-y-2">
                                        {items.map((faq, idx) => {
                                            const itemKey = `${catKey}-${idx}`;
                                            const isOpen  = !!openItems[itemKey];
                                            return (
                                                <div
                                                    key={itemKey}
                                                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                                                        isOpen ? 'border-orange-200 shadow-sm' : 'border-gray-100'
                                                    }`}
                                                >
                                                    <button
                                                        onClick={() => toggleItem(itemKey)}
                                                        className="w-full flex items-start justify-between px-6 py-4 text-left cursor-pointer hover:bg-orange-50/50 transition"
                                                    >
                                                        <span className="font-semibold text-sm leading-snug pr-4" style={{ color: NAVY }}>
                                                            {faq.question}
                                                        </span>
                                                        <span className={`flex-shrink-0 text-gray-400 text-base transition-transform mt-0.5 ${isOpen ? 'rotate-180' : ''}`}>
                                                            ▾
                                                        </span>
                                                    </button>
                                                    {isOpen && (
                                                        <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                                                            <div className="pt-3 whitespace-pre-line">{faq.answer}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── CTA : Vous n'avez pas trouvé ? ───────────────────── */}
                <section className="py-14" style={{ background: '#f0f2f5' }}>
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-2xl font-black mb-2" style={{ color: NAVY }}>
                            {t("Vous n'avez pas trouvé votre réponse ?")}
                        </h2>
                        <p className="text-gray-500 mb-8 text-sm">
                            {t('Notre équipe est disponible du lundi au vendredi de 8h à 18h (GMT).')}
                        </p>
                        <div className="grid sm:grid-cols-3 gap-5 mb-8">
                            {[
                                { emoji: '💬', titre: 'WhatsApp',    desc: '+225 27 22 27 60 14', href: 'https://wa.me/2252722276014', ext: true },
                                { emoji: '📧', titre: t('Email'),    desc: 'contact@ibigsoft.com', href: 'mailto:contact@ibigsoft.com', ext: false },
                                { emoji: '📞', titre: t('Téléphone'), desc: '+225 27 22 27 60 14', href: 'tel:+2252722276014',           ext: false },
                            ].map((c) => (
                                <a key={c.titre} href={c.href}
                                    target={c.ext ? '_blank' : undefined}
                                    rel={c.ext ? 'noopener noreferrer' : undefined}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all text-center group">
                                    <div className="text-3xl mb-3">{c.emoji}</div>
                                    <div className="font-bold mb-1 group-hover:text-orange-500 transition" style={{ color: NAVY }}>{c.titre}</div>
                                    <div className="text-sm text-gray-500">{c.desc}</div>
                                </a>
                            ))}
                        </div>
                        {/* Lien ticket */}
                        <Link href={route('login')}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90"
                            style={{ background: BRAND }}>
                            🎧 {t('Ouvrir un ticket de support')}
                        </Link>
                    </div>
                </section>

                {/* ── Footer minimal ────────────────────────────────────── */}
                <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-400 bg-white">
                    © {new Date().getFullYear()} IBIG Soft —{' '}
                    <a href="/" className="hover:underline">construiro.com</a>
                    {' · '}
                    <a href="/legal/cgu" className="hover:underline">{t('CGU')}</a>
                    {' · '}
                    <a href="/legal/confidentialite" className="hover:underline">{t('Confidentialité')}</a>
                </footer>
            </div>
        </>
    );
}
