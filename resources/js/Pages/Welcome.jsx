import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import ConstruiroLogo from '@/Components/ConstruiroLogo';
import SaraFloating from '@/Components/SaraFloating';
import WhatsAppFloating from '@/Components/WhatsAppFloating';
import PwaBanner from '@/Components/PwaBanner';
import CookiesBanner from '@/Components/CookiesBanner';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useTrans } from '@/i18n';
import SectionAide from '@/Components/Landing/SectionAide';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

/* ── Icônes SVG ─────────────────────────────────────────────── */
const icons = {
    projects:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M3 17l2 2 4-4"/></svg>,
    hr:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.85"/></svg>,
    finance:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>,
    materials:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    equipment:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>,
    quotes:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    hse:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    studies:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    reporting:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></svg>,
    check:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    shield:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    globe:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    bolt:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    chart:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    users:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    clock:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    lock:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    phone:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.36a16 16 0 006.72 6.72l1.72-1.71a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    ai:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2z"/></svg>,
    star:       <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    hand:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
};

/* ── Données modules ─────────────────────────────────────────── */
const modules = [
    { key: 'projects',  titre: 'Gestion de Projets',      desc: 'Planification, jalons, tâches et budget par chantier en temps réel.' },
    { key: 'hr',        titre: 'RH & Paie',               desc: 'Personnel, présences, congés et fiches de paie localisées.' },
    { key: 'finance',   titre: 'Finance & Comptabilité',   desc: 'Facturation, trésorerie, budget analytique et comptabilité générale.' },
    { key: 'materials', titre: 'Matériaux & Stock',        desc: 'Entrepôts, commandes fournisseurs, livraisons et inventaires.' },
    { key: 'equipment', titre: 'Équipements & Engins',     desc: 'Parc roulant, maintenance préventive et affectation chantiers.' },
    { key: 'quotes',    titre: 'Devis & Contrats',         desc: 'Métré, DQE, devis clients, contrats signés et avenants.' },
    { key: 'hse',       titre: 'HSE & Qualité',            desc: 'Incidents, contrôles qualité, non-conformités et audits chantier.' },
    { key: 'studies',   titre: 'Bureau d\'Études',         desc: 'Plans, métrés détaillés et bibliothèque de prix unitaires.' },
    { key: 'reporting', titre: 'BI & Reporting',           desc: 'Tableaux de bord, KPIs et rapports automatiques avec assistant IA.' },
];

/* ── Témoignages ─────────────────────────────────────────────── */
const temoignages = [
    { initiales: 'KA', nom: 'Koffi A.', poste: 'Directeur BTP', ville: 'Abidjan', texte: 'CONSTRUIRO a centralisé tout notre suivi de chantier. Fini les fichiers Excel perdus — on pilote tout depuis un seul écran.' },
    { initiales: 'MD', nom: 'Mamadou D.', poste: 'Chef de Projet', ville: 'Dakar', texte: 'La gestion des équipements et du carburant seule nous a économisé plus de 20% de coûts en moins d\'un trimestre.' },
    { initiales: 'AB', nom: 'Aminata B.', poste: 'Directrice Administrative', ville: 'Douala', texte: 'La comptabilité et la facturation intégrées nous font gagner 2 jours de travail manuel chaque mois.' },
];

/* ── Slides hero ─────────────────────────────────────────────── */
const SLIDES = [
    {
        badge: '🌍 Conçu pour les entreprises BTP africaines',
        h1a: 'Pilotez toute votre', h1b: 'activité BTP', h1c: 'depuis un seul endroit',
        sub: 'Une solution complète, moderne et adaptée aux réalités africaines. Projets, RH, finances, équipements — tout centralisé.',
        cta1Label: 'Demander une démo gratuite', cta1Href: '#demo', cta2Label: 'Essai 14 jours gratuit →', cta2IsRegister: true,
        visual: 'dashboard',
    },
    {
        badge: '⚡ Automatisation avancée',
        h1a: 'Automatisez vos', h1b: 'opérations BTP', h1c: 'et réduisez les erreurs',
        sub: 'Rapports automatiques, alertes intelligentes, suivi temps réel des chantiers — fini la saisie manuelle et les fichiers Excel dispersés.',
        cta1Label: 'Voir les modules', cta1Href: '#modules', cta2Label: 'Essai gratuit →', cta2IsRegister: true,
        visual: 'automation',
    },
    {
        badge: '📱 Multi-appareils & PWA',
        h1a: 'Travaillez partout,', h1b: 'depuis tous vos', h1c: 'appareils',
        sub: 'Ordinateur, tablette, smartphone — accédez à CONSTRUIRO depuis n\'importe où. Installez-le comme une application sur votre écran d\'accueil.',
        cta1Label: 'Installer l\'application', cta1Href: '#pwa', cta2Label: 'Essai gratuit →', cta2IsRegister: true,
        visual: 'devices',
    },
    {
        badge: '🤖 Intelligence artificielle SARA',
        h1a: 'Votre assistante IA', h1b: 'SARA vous accompagne', h1c: 'à chaque étape',
        sub: 'SARA répond à vos questions, guide vos équipes, et vous aide à tirer le meilleur de CONSTRUIRO — disponible 24h/24.',
        cta1Label: 'Parler à SARA', cta1Href: '#sara', cta2Label: 'Essai gratuit →', cta2IsRegister: true,
        visual: 'ai',
    },
    {
        badge: '🔒 Sécurité & Conformité',
        h1a: 'Vos données sont', h1b: 'protégées.', h1c: 'Votre équipe accompagnée.',
        sub: 'Connexions HTTPS, gestion des rôles, sauvegardes automatiques, journal d\'audit complet — votre activité est entre de bonnes mains.',
        cta1Label: 'Demander une démo', cta1Href: '#demo', cta2Label: 'En savoir plus', cta2Href: '#securite',
        visual: 'security',
    },
];

/* ── Problèmes résolus ───────────────────────────────────────── */
const PROBLEMES = [
    { avant: 'Fichiers Excel dispersés entre plusieurs équipes', apres: 'Toutes les informations centralisées et accessibles en temps réel' },
    { avant: 'Suivi de chantier manuel, risques d\'erreurs et de retards', apres: 'Tableau de bord temps réel avec alertes automatiques' },
    { avant: 'Gestion RH et paie sur papier ou tableurs', apres: 'Module RH intégré, fiches de paie en quelques clics' },
    { avant: 'Pertes de documents, contrats et devis introuvables', apres: 'Archivage numérique centralisé et sécurisé' },
    { avant: 'Coordination difficile entre chefs de chantier et direction', apres: 'Collaboration intégrée et reporting instantané' },
    { avant: 'Aucune visibilité sur les stocks et équipements', apres: 'Suivi en temps réel des matériaux, engins et consommations' },
];

/* ── Bénéfices ──────────────────────────────────────────────── */
const BENEFICES = [
    { icon: 'clock',  titre: 'Gagnez du temps', desc: 'Automatisez les tâches répétitives. Vos équipes se concentrent sur l\'essentiel.' },
    { icon: 'shield', titre: 'Réduisez les erreurs', desc: 'Données centralisées, calculs automatiques, zéro ressaisie manuelle.' },
    { icon: 'chart',  titre: 'Meilleures décisions', desc: 'Tableaux de bord et KPIs en temps réel pour piloter avec précision.' },
    { icon: 'lock',   titre: 'Données sécurisées', desc: 'Accès chiffré, gestion des rôles, sauvegardes automatiques quotidiennes.' },
    { icon: 'users',  titre: 'Équipes connectées', desc: 'Direction, chefs de chantier et RH collaborent sur une seule plateforme.' },
    { icon: 'globe',  titre: 'Adapté à l\'Afrique', desc: 'Multi-devises FCFA/USD/EUR, conformité fiscale locale, support basé en Afrique.' },
    { icon: 'bolt',   titre: 'Déployé en 48h', desc: 'Aucune installation complexe. Accès depuis votre navigateur dès le premier jour.' },
    { icon: 'ai',     titre: 'IA intégrée (SARA)', desc: 'Un assistant intelligent qui guide vos utilisateurs et répond à leurs questions.' },
];

/* ── Comment ça marche ──────────────────────────────────────── */
const ETAPES = [
    { num: '01', titre: 'Créez votre compte', desc: 'Inscription en 2 minutes. Votre espace CONSTRUIRO est prêt immédiatement. 14 jours d\'essai gratuit, sans carte bancaire.' },
    { num: '02', titre: 'Configurez votre organisation', desc: 'Renseignez vos informations, importez vos projets, configurez vos modules selon vos besoins métier.' },
    { num: '03', titre: 'Invitez vos collaborateurs', desc: 'Ajoutez vos chefs de chantier, RH, comptables et directeurs. Attribuez les rôles et droits d\'accès.' },
    { num: '04', titre: 'Pilotez depuis le tableau de bord', desc: 'Suivez vos chantiers, vos finances et vos équipes en temps réel. Exportez vos rapports en PDF et Excel.' },
];

/* ── Publics concernés ──────────────────────────────────────── */
const PUBLICS = [
    { emoji: '🏗️', titre: 'PME BTP', desc: 'Entreprises de construction de 5 à 200 employés cherchant à se structurer et digitaliser leur gestion.' },
    { emoji: '🏢', titre: 'Groupes BTP', desc: 'Grandes entreprises multi-sites qui ont besoin d\'une vision consolidée de leur activité.' },
    { emoji: '🏘️', titre: 'Promoteurs immobiliers', desc: 'Gestion de projets immobiliers, suivi des lots, devis clients et facturation avancée.' },
    { emoji: '🛣️', titre: 'Travaux publics', desc: 'Entreprises de voirie, réseaux, ouvrages d\'art avec contraintes spécifiques HSE et reporting.' },
    { emoji: '🔧', titre: 'Sous-traitants BTP', desc: 'Artisans et sous-traitants qui veulent professionnaliser leur gestion et leurs documents.' },
];

/* ── Intégrations ────────────────────────────────────────────── */
const INTEGRATIONS = [
    { nom: 'Mobile Money', desc: 'Orange Money, MTN MoMo, Wave', statut: 'disponible', emoji: '📱' },
    { nom: 'CinetPay', desc: 'Paiements en ligne Afrique', statut: 'disponible', emoji: '💳' },
    { nom: 'WhatsApp Business', desc: 'Notifications et alertes', statut: 'disponible', emoji: '💬' },
    { nom: 'Email & SMS', desc: 'Notifications automatiques', statut: 'disponible', emoji: '📧' },
    { nom: 'API REST', desc: 'Connexion à vos systèmes', statut: 'disponible', emoji: '🔌' },
    { nom: 'Moneroo', desc: 'Paiements mobile Afrique', statut: 'disponible', emoji: '💳' },
    { nom: 'Flutterwave', desc: 'Paiements multicanaux', statut: 'integration', emoji: '🔗' },
    { nom: 'Paystack', desc: 'Paiements e-commerce', statut: 'bientot', emoji: '🏦' },
    { nom: 'Stripe', desc: 'Paiements internationaux', statut: 'bientot', emoji: '💰' },
];

const STATUT_LABEL_FR = { disponible: 'Disponible', integration: 'En intégration', bientot: 'Bientôt' };
const statutColor = { disponible: '#22c55e', integration: BRAND, bientot: '#94a3b8' };

/* ── Autres logiciels IBIG Soft ─────────────────────────────── */
const AUTRES_LOGICIELS = [
    { nom: 'SCOLABY ERP',    secteur: 'Éducation',       emoji: '🎓', couleur: '#6366f1' },
    { nom: 'ANOUANZE ERP',   secteur: 'Associations',    emoji: '🤝', couleur: '#3b82f6' },
    { nom: 'SANTAREX ERP',   secteur: 'Santé',           emoji: '🏥', couleur: '#10b981' },
    { nom: 'GESTMONEY',      secteur: 'Finance',         emoji: '💰', couleur: '#f59e0b' },
    { nom: 'AGRIFRIK',       secteur: 'Agriculture',     emoji: '🌾', couleur: '#84cc16' },
    { nom: 'LOKATIVO',       secteur: 'Immobilier',      emoji: '🏘️',  couleur: '#ec4899' },
    { nom: 'STOCKFLOW',      secteur: 'Logistique',      emoji: '📦', couleur: '#8b5cf6' },
    { nom: 'IBIG FLEET 360', secteur: 'Transport',       emoji: '🚚', couleur: '#0ea5e9' },
    { nom: 'ZELIVRY',        secteur: 'Livraison',       emoji: '⚡', couleur: BRAND },
];

/* ── Format XOF ─────────────────────────────────────────────── */
function formatXOF(amount) {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';
}

/* ── Maquette dashboard SVG ─────────────────────────────────── */
function DashboardMockup() {
    return (
        <svg viewBox="0 0 560 360" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-2xl">
            <rect width="560" height="360" rx="12" fill="#0f172a"/>
            <rect width="560" height="36" rx="12" fill="#1e293b"/>
            <rect y="24" width="560" height="12" fill="#1e293b"/>
            <circle cx="20" cy="18" r="5" fill="#ef4444" opacity=".8"/>
            <circle cx="36" cy="18" r="5" fill="#f59e0b" opacity=".8"/>
            <circle cx="52" cy="18" r="5" fill="#22c55e" opacity=".8"/>
            <text x="280" y="22" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">CONSTRUIRO ERP — Tableau de bord</text>
            <rect x="0" y="36" width="120" height="324" fill="#1e293b"/>
            <rect x="12" y="48" width="96" height="28" rx="6" fill={BRAND} opacity=".15"/>
            <text x="60" y="66" textAnchor="middle" fill={BRAND} fontSize="9" fontWeight="bold" fontFamily="sans-serif">CONSTRUIRO</text>
            {[['Tableau de bord', true],['Projets', false],['RH & Paie', false],['Stock', false],['Finance', false],['Équipements', false],['Rapports', false]].map(([label, active], i) => (
                <g key={label}>
                    <rect x="8" y={90 + i * 30} width="104" height="24" rx="5" fill={active ? BRAND : 'transparent'} opacity={active ? 1 : 0}/>
                    <text x="20" y={106 + i * 30} fill={active ? '#fff' : '#64748b'} fontSize="8" fontFamily="sans-serif">{label}</text>
                </g>
            ))}
            <rect x="128" y="44" width="424" height="28" rx="4" fill="#1e293b"/>
            <text x="140" y="62" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Tableau de bord</text>
            <rect x="448" y="50" width="88" height="16" rx="4" fill={BRAND}/>
            <text x="492" y="61" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="sans-serif">+ Nouveau projet</text>
            {[{ label: 'Projets actifs', val: '24', col: '#3b82f6' },{ label: 'CA ce mois', val: '142M FCFA', col: '#22c55e' },{ label: 'Chantiers en cours', val: '18', col: BRAND },{ label: 'Alertes stock', val: '3', col: '#ef4444' }].map((k, i) => (
                <g key={k.label}>
                    <rect x={128 + i * 106} y="80" width="100" height="60" rx="6" fill="#1e293b"/>
                    <rect x={128 + i * 106} y="80" width="4" height="60" rx="2" fill={k.col}/>
                    <text x={142 + i * 106} y="104" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">{k.label}</text>
                    <text x={142 + i * 106} y="124" fill="#f1f5f9" fontSize="13" fontWeight="bold" fontFamily="sans-serif">{k.val}</text>
                </g>
            ))}
            <rect x="128" y="150" width="260" height="140" rx="6" fill="#1e293b"/>
            <text x="142" y="168" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Avancement chantiers — Juillet 2026</text>
            {[{ h: 60, col: BRAND },{ h: 90, col: '#3b82f6' },{ h: 40, col: '#22c55e' },{ h: 75, col: BRAND },{ h: 55, col: '#8b5cf6' },{ h: 85, col: '#3b82f6' }].map((b, i) => (
                <g key={i}>
                    <rect x={148 + i * 36} y={270 - b.h} width="22" height={b.h} rx="3" fill={b.col} opacity=".85"/>
                    <text x={159 + i * 36} y="282" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="sans-serif">{`P${i+1}`}</text>
                </g>
            ))}
            <rect x="396" y="150" width="156" height="140" rx="6" fill="#1e293b"/>
            <text x="410" y="168" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Projets récents</text>
            {[{ name: 'Résidence Cocody', col: BRAND },{ name: 'Route N\'Djamena', col: '#3b82f6' },{ name: 'Pont de Kayes', col: '#22c55e' },{ name: 'Imm. Plateau', col: BRAND }].map((p, i) => (
                <g key={p.name}>
                    <text x="410" y={184 + i * 24} fill="#e2e8f0" fontSize="7" fontFamily="sans-serif">{p.name}</text>
                    <rect x="480" y={174 + i * 24} width="52" height="12" rx="3" fill={p.col} opacity=".2"/>
                    <text x="506" y={183 + i * 24} textAnchor="middle" fill={p.col} fontSize="6" fontFamily="sans-serif">En cours</text>
                </g>
            ))}
            <rect x="128" y="298" width="424" height="2" fill="#334155"/>
            <text x="140" y="322" fill="#475569" fontSize="7" fontFamily="sans-serif">© 2026 IBIG Soft — CONSTRUIRO ERP v1.0 · Données sécurisées · Accès 24/7</text>
        </svg>
    );
}

/* ── Visuel slide automation ──────────────────────────────────── */
function SlideVisualAutomation() {
    const { t } = useTrans();
    return (
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto">
            {[
                { icon: '📊', titre: 'Rapports auto', sub: 'Générés chaque nuit' },
                { icon: '🔔', titre: 'Alertes stock', sub: '3 alertes aujourd\'hui' },
                { icon: '📅', titre: 'Planning sync', sub: '18 chantiers actifs' },
                { icon: '✅', titre: 'Tâches auto', sub: '94% complétées' },
            ].map((item) => (
                <div key={item.titre} className="rounded-xl p-4 text-left"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-white font-bold text-sm">{t(item.titre)}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{t(item.sub)}</div>
                </div>
            ))}
        </div>
    );
}

/* ── Visuel slide devices — responsive ────────────────────────── */
function SlideVisualDevices() {
    return (
        <div className="flex items-end justify-center gap-3 w-full py-4" style={{ maxWidth: '100%' }}>
            {/* Desktop — largeur adaptative 52% max 200px */}
            <div className="rounded-lg overflow-hidden flex-none"
                style={{ width: 'min(52%, 200px)', border: '2px solid rgba(255,255,255,0.2)' }}>
                <div className="bg-gray-800 py-1 px-2 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"/>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"/>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"/>
                </div>
                <div className="bg-gray-900 p-1.5 space-y-1">
                    <div className="h-1.5 rounded-full bg-gray-700 w-3/4"/>
                    <div className="h-6 rounded bg-gray-800 flex items-center justify-center">
                        <span className="text-xs" style={{ color: BRAND, fontSize: 9 }}>CONSTRUIRO</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        <div className="h-4 rounded bg-gray-700"/>
                        <div className="h-4 rounded bg-gray-700"/>
                    </div>
                </div>
                <div className="h-1.5 bg-gray-800"/>
                <div className="h-1 mx-auto w-6 bg-gray-600 rounded-full mt-0.5"/>
            </div>
            {/* Tablet — 26% max 100px */}
            <div className="rounded-xl overflow-hidden flex-none"
                style={{ width: 'min(26%, 100px)', border: '2px solid rgba(245,130,32,0.4)' }}>
                <div className="bg-gray-900 p-1.5 space-y-1">
                    <div className="h-3 rounded bg-gray-800 flex items-center justify-center">
                        <span style={{ color: BRAND, fontSize: 6 }}>CONSTRUIRO</span>
                    </div>
                    <div className="h-10 rounded bg-gray-800"/>
                    <div className="h-2 rounded bg-gray-700"/>
                </div>
                <div className="h-2 bg-gray-800 flex justify-center items-center">
                    <div className="w-3 h-1 rounded-full bg-gray-600"/>
                </div>
            </div>
            {/* Phone — 18% max 70px */}
            <div className="rounded-2xl overflow-hidden flex-none"
                style={{ width: 'min(18%, 70px)', border: '2px solid rgba(255,255,255,0.15)' }}>
                <div className="bg-gray-900 p-1 space-y-1">
                    <div className="h-2.5 rounded bg-gray-800 flex items-center justify-center">
                        <span style={{ color: BRAND, fontSize: 4 }} className="font-bold">C</span>
                    </div>
                    <div className="h-8 rounded bg-gray-800"/>
                    <div className="grid grid-cols-2 gap-0.5">
                        <div className="h-1.5 rounded bg-gray-700"/>
                        <div className="h-1.5 rounded bg-gray-700"/>
                    </div>
                </div>
                <div className="h-2 bg-gray-800 flex justify-center items-center">
                    <div className="w-4 h-0.5 rounded-full bg-gray-600"/>
                </div>
            </div>
        </div>
    );
}

/* ── Visuel slide AI ──────────────────────────────────────────── */
function SlideVisualAI() {
    return (
        <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(245,130,32,0.15)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm"
                    style={{ background: BRAND }}>S</div>
                <div>
                    <div className="text-white text-sm font-bold">SARA</div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>En ligne
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-3">
                <div className="rounded-xl p-3 text-sm text-gray-200 max-w-xs"
                    style={{ background: 'rgba(245,130,32,0.2)' }}>
                    Bonjour ! Je suis SARA. Comment puis-je vous aider avec CONSTRUIRO ?
                </div>
                <div className="ml-auto rounded-xl p-3 text-sm text-white max-w-xs text-right"
                    style={{ background: 'rgba(255,255,255,0.12)' }}>
                    Comment gérer mes stocks de matériaux ?
                </div>
                <div className="rounded-xl p-3 text-sm text-gray-200 max-w-xs"
                    style={{ background: 'rgba(245,130,32,0.2)' }}>
                    Dans le module Stock, allez dans Inventaire → Entrées / Sorties pour suivre vos matériaux en temps réel.
                </div>
                <div className="flex gap-2 flex-wrap pt-1">
                    {['Tarifs', 'Modules', 'Démo'].map(q => (
                        <span key={q} className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition"
                            style={{ background: 'rgba(245,130,32,0.15)', color: BRAND, border: `1px solid rgba(245,130,32,0.3)` }}>
                            {q}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Visuel slide sécurité ────────────────────────────────────── */
function SlideVisualSecurity() {
    const { t } = useTrans();
    return (
        <div className="w-full max-w-sm mx-auto space-y-3">
            {[
                { icon: '🔒', titre: 'Connexions HTTPS', val: 'SSL/TLS actif' },
                { icon: '👥', titre: 'Gestion des rôles', val: '8 niveaux d\'accès' },
                { icon: '💾', titre: 'Sauvegardes auto', val: 'Toutes les 24h' },
                { icon: '📋', titre: 'Journal d\'audit', val: '100% des actions tracées' },
            ].map(item => (
                <div key={item.titre} className="flex items-center gap-4 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                        <div className="text-white text-sm font-semibold">{t(item.titre)}</div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                        {t(item.val)}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ── Hero Slider ─────────────────────────────────────────────── */
function HeroSlider({ canRegister }) {
    const { t } = useTrans();
    const [current, setCurrent] = useState(0);
    const [paused, setPaused]   = useState(false);
    const touchX = useRef(null);

    const go = useCallback((idx) => {
        setCurrent(((idx % SLIDES.length) + SLIDES.length) % SLIDES.length);
    }, []);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 5500);
        return () => clearInterval(id);
    }, [paused]);

    const slide = SLIDES[current];

    const handleTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
    const handleTouchEnd   = (e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
        touchX.current = null;
    };

    return (
        <section
            className="relative overflow-hidden"
            style={{ background: NAVY, minHeight: 'clamp(400px, 60vh, 520px)' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pattern de fond */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #F58220 1px, transparent 0)`, backgroundSize: '40px 40px' }}/>
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${BRAND}, transparent 70%)` }}/>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${BRAND}, transparent 70%)` }}/>

            {/* Slide content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6"
                key={current}
                style={{ animation: 'construiroFadeUp 0.45s ease both' }}>
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Texte */}
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
                            style={{ background: 'rgba(245,130,32,0.15)', color: BRAND, border: `1px solid rgba(245,130,32,0.3)` }}>
                            {t(slide.badge)}
                        </div>
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-white mb-4">
                            {t(slide.h1a)}<br/>
                            <span style={{ color: BRAND }}>{t(slide.h1b)}</span><br/>
                            {t(slide.h1c)}
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">{t(slide.sub)}</p>
                        <div className="flex flex-wrap gap-3 mb-10">
                            <a href={slide.cta1Href}
                                className="inline-flex items-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-white text-sm sm:text-base transition-all hover:opacity-90 shadow-lg"
                                style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.35)` }}>
                                {t(slide.cta1Label)}
                            </a>
                            {slide.cta2IsRegister && canRegister ? (
                                <Link href={route('register')}
                                    className="inline-flex items-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-white text-sm sm:text-base transition-all hover:bg-white/10"
                                    style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                                    {t(slide.cta2Label)}
                                </Link>
                            ) : slide.cta2Href ? (
                                <a href={slide.cta2Href}
                                    className="inline-flex items-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-white text-sm sm:text-base transition-all hover:bg-white/10"
                                    style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                                    {t(slide.cta2Label)}
                                </a>
                            ) : null}
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> {t('15+ modules intégrés')}</span>
                            <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> {t('Essai 14 jours gratuit')}</span>
                            <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> {t('Déployé en 48h')}</span>
                        </div>
                    </div>
                    {/* Visuel */}
                    <div className="relative">
                        <div className="absolute -inset-4 rounded-3xl opacity-30 blur-xl pointer-events-none"
                            style={{ background: `linear-gradient(135deg, ${BRAND}40, transparent)` }}/>
                        <div className="relative rounded-2xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
                            {slide.visual === 'dashboard'  && <DashboardMockup />}
                            {slide.visual === 'automation' && <div className="p-6"><SlideVisualAutomation /></div>}
                            {slide.visual === 'devices'    && <div className="p-6"><SlideVisualDevices /></div>}
                            {slide.visual === 'ai'         && <div className="p-4"><SlideVisualAI /></div>}
                            {slide.visual === 'security'   && <div className="p-6"><SlideVisualSecurity /></div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Points de navigation */}
            <div className="relative flex justify-center items-center gap-2 pb-8 pt-2">
                {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => go(i)} aria-label={`Slide ${i+1}`}
                        className="rounded-full transition-all duration-300"
                        style={{
                            width: i === current ? 24 : 8,
                            height: 8,
                            background: i === current ? BRAND : 'rgba(255,255,255,0.25)',
                        }}/>
                ))}
            </div>

            {/* Flèches navigation */}
            <button onClick={() => go(current - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hidden md:flex transition hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                aria-label="Slide précédent">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => go(current + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center hidden md:flex transition hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                aria-label="Slide suivant">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <style>{`
                @keyframes construiroFadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}

/* ── Formulaire démo ─────────────────────────────────────────── */
function DemoForm() {
    const { t } = useTrans();
    const { data, setData, post, processing, wasSuccessful, errors } = useForm({
        name: '', email: '', phone: '', company: '', sector: '', message: '',
    });

    if (wasSuccessful) {
        return (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="text-5xl mb-4">✅</div>
                <p className="text-xl font-bold text-white mb-2">{t('Demande envoyée !')}</p>
                <p className="text-orange-100 text-sm">{t('Notre équipe vous contactera dans les 24h ouvrées.')}</p>
            </div>
        );
    }

    const inputCls = "w-full rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white";

    return (
        <form onSubmit={(e) => { e.preventDefault(); post('/demo-request'); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">{t('Nom complet *')}</label>
                    <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)}
                        placeholder="Jean Dupont" className={inputCls}/>
                    {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">{t('Email professionnel *')}</label>
                    <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)}
                        placeholder="jean@entreprise.com" className={inputCls}/>
                    {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">{t('Téléphone')}</label>
                    <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)}
                        placeholder="+225 07 00 00 00 00" className={inputCls}/>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">{t('Entreprise *')}</label>
                    <input type="text" required value={data.company} onChange={e => setData('company', e.target.value)}
                        placeholder="BTP Côte d'Ivoire SA" className={inputCls}/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-white mb-1.5">{t("Secteur d'activité")}</label>
                <select value={data.sector} onChange={e => setData('sector', e.target.value)} className={inputCls}>
                    <option value="">{t('— Sélectionnez —')}</option>
                    <option>{t('BTP / Construction')}</option>
                    <option>{t('Promotion Immobilière')}</option>
                    <option>{t('Travaux Publics')}</option>
                    <option>{t('Sous-traitance BTP')}</option>
                    <option>{t('Autre')}</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-white mb-1.5">{t('Message (optionnel)')}</label>
                <textarea rows={3} value={data.message} onChange={e => setData('message', e.target.value)}
                    placeholder={t('Décrivez votre besoin ou posez vos questions…')}
                    className={`${inputCls} resize-none`}/>
            </div>
            <button type="submit" disabled={processing}
                className="w-full py-4 rounded-xl font-bold text-white text-base transition-all disabled:opacity-60"
                style={{ background: processing ? '#666' : NAVY, boxShadow: `0 4px 20px rgba(0,0,0,0.4)` }}>
                {processing ? t('Envoi en cours…') : t('Demander une démo gratuite →')}
            </button>
        </form>
    );
}

/* ── Galerie captures (mockups illustrés) ────────────────────── */
const GALERIE_TABS = [
    {
        key: 'dashboard', label: '📊 Tableau de bord', color: '#1E1E1E',
        modules: ['KPIs temps réel', 'Budget chantier', 'Avancement %', 'Alertes actives'],
        desc: 'Vue directeur — tous vos indicateurs BTP en un coup d\'œil.',
    },
    {
        key: 'chantier', label: '🏗️ Chantiers', color: '#0f3460',
        modules: ['Planning Gantt', 'Pointage équipes', 'Journal de chantier', 'Photos terrain'],
        desc: 'Suivez chaque chantier de la pose de la première pierre à la réception.',
    },
    {
        key: 'finance', label: '💰 Finance', color: '#1a472a',
        modules: ['Facturation client', 'Décaissements', 'Budget analytique', 'Trésorerie'],
        desc: 'Comptabilité, facturation et trésorerie intégrées nativement.',
    },
    {
        key: 'stock', label: '📦 Matériaux', color: '#7b2d00',
        modules: ['Bons de commande', 'Entrées/Sorties', 'Inventaire', 'Alertes seuil'],
        desc: 'Gérez vos stocks, commandes et livraisons depuis un seul écran.',
    },
];

function MockScreen({ tab }) {
    return (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ background: '#0d0d1a' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#1a1a2e' }}>
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="ml-3 flex-1 rounded-full px-3 py-0.5 text-xs text-gray-500" style={{ background: '#111' }}>
                    app.construiro.com
                </div>
            </div>
            {/* App UI mock */}
            <div className="p-4" style={{ minHeight: 260 }}>
                <div className="flex gap-3 mb-4">
                    {/* Sidebar */}
                    <div className="w-10 flex flex-col gap-2 pt-1">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-lg opacity-30" style={{ background: i === 0 ? BRAND : '#333' }} />
                        ))}
                    </div>
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                        {/* Header bar */}
                        <div className="flex items-center justify-between">
                            <div className="h-5 w-32 rounded" style={{ background: tab.color }} />
                            <div className="h-7 w-24 rounded-lg" style={{ background: BRAND, opacity: 0.8 }} />
                        </div>
                        {/* KPI cards */}
                        <div className="grid grid-cols-2 gap-2">
                            {tab.modules.map((m, i) => (
                                <div key={m} className="rounded-xl p-3 flex flex-col gap-1.5" style={{ background: '#1a1a2e' }}>
                                    <div className="h-2 w-16 rounded" style={{ background: i % 2 === 0 ? BRAND : '#3a3a5c', opacity: 0.7 }} />
                                    <div className="text-xs text-gray-400 font-medium truncate">{m}</div>
                                    <div className="h-6 w-20 rounded" style={{ background: tab.color, opacity: 0.5 }} />
                                </div>
                            ))}
                        </div>
                        {/* Chart mockup */}
                        <div className="rounded-xl p-3 flex items-end gap-1" style={{ background: '#1a1a2e', height: 60 }}>
                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50].map((h, i) => (
                                <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 6 ? BRAND : '#3a3a5c', opacity: i === 6 ? 1 : 0.5 }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GalerieCaptures() {
    const { t } = useTrans();
    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Interface')}</p>
                    <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t("Découvrez l'interface CONSTRUIRO")}</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">{t('Une interface claire, pensée pour les équipes terrain comme pour la direction générale.')}</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                        <DashboardMockup />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black mb-4" style={{ color: NAVY }}>{t('Tableau de bord tout-en-un')}</h3>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            {t("Pilotez vos projets, vos équipes et vos finances depuis un seul écran. Les données s'actualisent en temps réel, depuis le bureau ou le chantier.")}
                        </p>
                        <ul className="space-y-3">
                            {['KPIs en temps réel', 'Avancement chantiers', 'Budget analytique', 'Alertes automatiques', 'Tableaux de bord personnalisables', 'Export PDF & Excel'].map(m => (
                                <li key={m} className="flex items-center gap-3 text-sm">
                                    <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: BRAND }}>
                                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                    </span>
                                    <span className="font-medium" style={{ color: NAVY }}>{t(m)}</span>
                                </li>
                            ))}
                        </ul>
                        <a href="#demo" className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-xl font-bold text-white transition hover:opacity-90"
                            style={{ background: BRAND }}>
                            {t('Demander une démo →')}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Vidéo de présentation ───────────────────────────────────── */
function VideoPresentation() {
    const { t } = useTrans();
    const [playing, setPlaying] = useState(false);
    return (
        <section className="py-20" style={{ background: NAVY }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Présentation')}</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{t('CONSTRUIRO en 3 minutes')}</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">{t('Découvrez comment les entreprises BTP africaines pilotent leurs chantiers avec CONSTRUIRO ERP.')}</p>
                </div>
                <div className="relative rounded-3xl overflow-hidden cursor-pointer group"
                    style={{ background: '#111', aspectRatio: '16/9', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
                    onClick={() => setPlaying(true)}>
                    {/* Placeholder thumbnail */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ background: `linear-gradient(135deg, #0a1628 0%, #1E1E1E 100%)` }}>
                        {/* Mock screenshot lines */}
                        <div className="absolute inset-0 opacity-10">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="absolute h-px w-full" style={{ top: `${12.5 * (i + 0.5)}%`, background: 'white' }} />
                            ))}
                        </div>
                        {/* Overlay brand */}
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                                style={{ background: BRAND, boxShadow: `0 0 60px rgba(245,130,32,0.5)` }}>
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                            <p className="text-white font-bold text-lg mb-1">{t('CONSTRUIRO ERP — Présentation officielle')}</p>
                            <p className="text-gray-500 text-sm">{t('Durée estimée : 3 minutes · Disponible prochainement')}</p>
                        </div>
                    </div>
                    {playing && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#000' }}>
                            <p className="text-white text-sm">{t('Vidéo disponible prochainement sur YouTube')}</p>
                        </div>
                    )}
                    {/* Bottom bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(to right, ${BRAND}, transparent)` }} />
                </div>
                <p className="text-center text-gray-600 text-sm mt-6">
                    {t('Préférez une démo en live ?')}{' '}
                    <a href="#demo" className="font-semibold transition hover:opacity-75" style={{ color: BRAND }}>
                        {t('Demandez une démonstration personnalisée →')}
                    </a>
                </p>
            </div>
        </section>
    );
}

/* ── Comparateur des offres ──────────────────────────────────── */
const FEATURES_COMPARE = [
    { label: 'Modules BTP', values: ['15+ modules', '15+ modules', '15+ modules', '15+ modules'] },
    { label: 'Utilisateurs', key: 'max_users' },
    { label: 'Projets simultanés', key: 'max_projects' },
    { label: 'Essai gratuit', key: 'trial_days', format: v => v > 0 ? `${v} jours` : '—' },
    { label: 'Tableaux de bord', values: ['Basique', 'Basique', 'Avancé', 'Illimité'] },
    { label: 'Rapports & exports', values: ['PDF', 'PDF + Excel', 'PDF + Excel', 'PDF + Excel + BI'] },
    { label: 'Support', values: ['Email', 'Email', 'Email + Chat', 'Prioritaire dédié'] },
    { label: 'API REST', values: ['—', '—', '✓', '✓'] },
    { label: 'Multi-agences', values: ['—', '—', '—', '✓'] },
    { label: 'Formation incluse', values: ['—', '—', '1 session', '3 sessions'] },
    { label: 'SLA garanti', values: ['—', '—', '99%', '99.9%'] },
];

function ComparateurOffres({ plans, billingCycle }) {
    const { t } = useTrans();
    const getValue = (feat, i) => {
        if (feat.values) return feat.values[i] || '—';
        const val = plans[i]?.[feat.key];
        if (feat.format) return feat.format(val);
        if (val >= 9999) return '∞';
        return val ?? '—';
    };
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Comparateur')}</p>
                    <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Ce qui est inclus dans chaque offre')}</h2>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-2xl" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm" style={{ minWidth: 680 }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: NAVY }}>
                                <th className="text-left px-5 py-4 text-gray-400 font-medium" style={{ width: '28%' }}>Fonctionnalité</th>
                                {plans.map((plan, i) => (
                                    <th key={plan.id} className="px-3 py-4 text-center relative" style={{ minWidth: 110 }}>
                                        {i === 2 && (
                                            <span className="absolute -top-0 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-0.5 rounded-b-lg"
                                                style={{ background: BRAND, color: '#fff' }}>★</span>
                                        )}
                                        <div className="text-white font-bold mt-1 text-xs sm:text-sm">{plan.name}</div>
                                        <div className="text-xs font-normal mt-0.5" style={{ color: BRAND }}>
                                            {formatXOF(billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly)}
                                            {billingCycle === 'yearly' ? t('/an') : t('/mois')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURES_COMPARE.map((feat, ri) => (
                                <tr key={feat.label} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-5 py-3.5 font-medium" style={{ color: NAVY }}>{t(feat.label)}</td>
                                    {plans.map((_, ci) => {
                                        const val = getValue(feat, ci);
                                        return (
                                            <td key={ci} className="px-3 py-3.5 text-center text-gray-600">
                                                {val === '✓'
                                                    ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs" style={{ background: BRAND }}>✓</span>
                                                    : val === '—'
                                                    ? <span className="text-gray-300">—</span>
                                                    : val}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="border-t border-gray-200">
                                <td className="px-5 py-4" />
                                {plans.map((plan, i) => (
                                    <td key={plan.id} className="px-3 py-4 text-center">
                                        <a href="#demo"
                                            className="inline-block px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition hover:opacity-90"
                                            style={i === 2
                                                ? { background: BRAND, color: '#fff' }
                                                : { border: `2px solid ${BRAND}`, color: BRAND }}>
                                            {t('Choisir')} →
                                        </a>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
        </section>
    );
}

/* ── Barre supérieure ────────────────────────────────────────── */
function TopBar() {
    const { t } = useTrans();
    return (
        <div style={{ background: '#0a1628' }} className="text-xs py-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <span style={{ color: BRAND }}>✓</span> {t('Essai gratuit 14 jours')}
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5">
                        <span style={{ color: BRAND }}>📞</span>
                        <a href="tel:+2252722276014" className="hover:text-white transition">+225 27 22 27 60 14</a>
                    </span>
                    <span className="hidden md:flex items-center gap-1.5">
                        <span style={{ color: BRAND }}>📧</span>
                        <a href="mailto:contact@ibigsoft.com" className="hover:text-white transition">contact@ibigsoft.com</a>
                    </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-gray-400">
                    <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">IBIG Soft</a>
                    <span className="opacity-30">|</span>
                    <a href="/aide" className="hover:text-white transition">{t('Support')}</a>
                    <span className="opacity-30">|</span>
                    <LanguageSwitcher />
                </div>
            </div>
        </div>
    );
}

/* ── Page principale ─────────────────────────────────────────── */
export default function Welcome({ auth, canLogin, canRegister, plans = [], faqs = [], temoignages: temoignagesProp = null }) {
    const { t } = useTrans();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const temoignagesList = temoignagesProp ?? temoignages;
    const hamburgerRef  = useRef(null);
    const closeButtonRef = useRef(null);

    // PWA install prompt
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handlePwaInstall = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
        }
    };

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.classList.add('mobile-menu-open');
            document.body.style.overflow = 'hidden';
            setTimeout(() => closeButtonRef.current?.focus(), 50);
            const onKey = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
            window.addEventListener('keydown', onKey);
            return () => window.removeEventListener('keydown', onKey);
        } else {
            document.body.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
            hamburgerRef.current?.focus();
        }
    }, [mobileMenuOpen]);

    return (
        <>
            <Head>
                <title>CONSTRUIRO — ERP BTP pour l'Afrique | Gérez vos chantiers</title>
                <meta name="description" content="CONSTRUIRO est l'ERP BTP conçu pour les entreprises africaines. Gérez projets, RH, stocks, équipements et finance depuis une seule plateforme. Essai gratuit 14 jours." />
                <meta name="keywords" content="ERP BTP Afrique, logiciel chantier, gestion construction, ERP Côte d'Ivoire, CONSTRUIRO, IBIG Soft" />
                <meta property="og:title" content="CONSTRUIRO — ERP BTP pour l'Afrique" />
                <meta property="og:description" content="15+ modules intégrés pour les entreprises BTP africaines. Projets, RH, finances, matériaux, équipements. Essai gratuit 14 jours." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://construiro.com" />
                <meta property="og:image" content="https://construiro.com/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="CONSTRUIRO — ERP BTP pour l'Afrique" />
                <meta name="twitter:description" content="L'ERP BTP pensé pour les réalités africaines. Essai gratuit 14 jours." />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://construiro.com" />
                <script type="application/ld+json">{JSON.stringify([
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "CONSTRUIRO ERP",
                        "description": "ERP BTP conçu pour les entreprises de construction et de travaux publics africaines. Gestion de projets, RH, stocks, équipements, finance, comptabilité.",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web, Android, iOS",
                        "url": "https://construiro.com",
                        "screenshot": "https://construiro.com/og-image.png",
                        "offers": { "@type": "Offer", "priceCurrency": "XOF", "price": "0", "description": "Essai gratuit 14 jours sans carte bancaire", "availability": "https://schema.org/InStock" },
                        "publisher": { "@type": "Organization", "name": "IBIG Soft", "url": "https://ibigsoft.com" },
                        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5", "reviewCount": "3" }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "IBIG Soft",
                        "url": "https://ibigsoft.com",
                        "logo": "https://ibigsoft.com/logo.png",
                        "contactPoint": { "@type": "ContactPoint", "telephone": "+225-27-22-27-60-14", "contactType": "customer service", "areaServed": "AF", "availableLanguage": ["French", "English"] },
                        "address": { "@type": "PostalAddress", "addressLocality": "Abidjan", "addressCountry": "CI" }
                    }
                ])}</script>
            </Head>
            <div className="min-h-screen bg-white font-sans" style={{ color: NAVY, overflowX: 'clip' }}>

                {/* ── BARRE SUPÉRIEURE ─────────────────────────────── */}
                <TopBar />

                {/* ── NAV ─────────────────────────────────────────── */}
                <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        <ConstruiroLogo size="sm" variant="icon" className="sm:hidden flex-shrink-0" />
                        <ConstruiroLogo size="sm" className="hidden sm:inline-flex flex-shrink-0" />

                        {/* Menu desktop */}
                        <div className="hidden lg:flex items-center gap-7">
                            {[
                                [t('Fonctionnalités'), '#modules'],
                                [t('Publics'), '#publics'],
                                [t('Modules'), '#modules'],
                                [t('Tarifs'), '#tarifs'],
                                [t('Démo'), '#demo'],
                                [t('Assistance'), '/aide'],
                            ].map(([label, href]) => (
                                <a key={label} href={href}
                                    className="text-sm font-medium text-gray-500 hover:text-[#F58220] transition">
                                    {label}
                                </a>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="flex items-center gap-3">
                            <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
                                className="hidden lg:inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition hover:opacity-90"
                                style={{ background: 'rgba(245,130,32,0.1)', color: BRAND, border: `1.5px solid ${BRAND}` }}>
                                🤝 {t('Devenir partenaire')}
                            </a>
                            <div className="hidden lg:block"><LanguageSwitcher /></div>
                            {auth?.user ? (
                                <Link href={route('dashboard')}
                                    className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition hover:opacity-90"
                                    style={{ background: BRAND }}>
                                    {t('Mon tableau de bord')} →
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link href={route('login')} className="text-sm font-medium text-gray-600 hover:text-[#F58220] transition hidden sm:block">
                                            {t('Se connecter')}
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link href={route('register')}
                                            className="hidden sm:inline-flex text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition hover:opacity-90"
                                            style={{ background: BRAND }}>
                                            {t('Essai gratuit')}
                                        </Link>
                                    )}
                                </>
                            )}
                            {/* Burger mobile — ref pour restaurer le focus à la fermeture */}
                            <button
                                ref={hamburgerRef}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                                onClick={() => setMobileMenuOpen(o => !o)}
                                aria-label={t('Ouvrir le menu')}
                                aria-expanded={mobileMenuOpen}
                                aria-controls="mobile-navigation"
                                type="button">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                    <line x1="3" y1="12" x2="21" y2="12"/>
                                    <line x1="3" y1="18" x2="21" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* ══════════════════════════════════════════════════════
                    DRAWER MOBILE — EN DEHORS DE <nav> POUR Z-INDEX CORRECT
                    La <nav> a z-50 qui crée un stacking context : tout
                    enfant fixe reste captif de ce contexte.
                    En plaçant le drawer ici (frère de <nav>, enfant direct
                    du wrapper root), z-index: 9001 est global.
                    ══════════════════════════════════════════════════════ */}
                {mobileMenuOpen && (
                    <>
                        {/* Overlay sombre — clique pour fermer */}
                        <div
                            className="lg:hidden fixed inset-0"
                            style={{ background: 'rgba(0,0,0,0.55)', zIndex: 9000 }}
                            onClick={() => setMobileMenuOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Panneau blanc totalement opaque — glisse depuis la droite */}
                        <aside
                            id="mobile-navigation"
                            role="dialog"
                            aria-modal="true"
                            aria-label={t('Navigation principale')}
                            className="lg:hidden fixed inset-y-0 right-0 flex flex-col bg-white overflow-y-auto"
                            style={{
                                width: 'min(100%, 420px)',
                                zIndex: 9001,
                                paddingTop:    'calc(20px + env(safe-area-inset-top, 0px))',
                                paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
                                paddingLeft:  24,
                                paddingRight: 24,
                                boxShadow: '-12px 0 40px rgba(0,0,0,0.25)',
                                overscrollBehavior: 'contain',
                            }}
                        >
                            {/* En-tête du panneau */}
                            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                                <ConstruiroLogo size="sm" />
                                <button
                                    ref={closeButtonRef}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                                    aria-label={t('Fermer le menu')}
                                    type="button">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Navigation principale */}
                            <nav className="flex-1" aria-label={t('Navigation principale')}>
                                <div style={{ display: 'grid', gap: 4 }}>
                                    {[
                                        [t('Fonctionnalités'), '#modules'],
                                        [t('Solutions'),       '#publics'],
                                        [t('Modules'),         '#modules'],
                                        [t('Tarifs'),          '#tarifs'],
                                        [t('Démonstration'),   '#demo'],
                                        [t('FAQ'),             '#faq'],
                                        [t('Support'),         '/aide'],
                                        [t('Contact'),         '#demo'],
                                    ].map(([label, href]) => (
                                        <a
                                            key={label}
                                            href={href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center font-medium text-gray-700 hover:text-[#F58220] rounded-xl hover:bg-orange-50 transition"
                                            style={{ minHeight: 52, padding: '0 16px' }}
                                        >
                                            {label}
                                        </a>
                                    ))}
                                </div>
                            </nav>

                            {/* Actions — séparateur + CTA + langue */}
                            <div className="flex-shrink-0 border-t border-gray-100 pt-6 mt-6"
                                style={{ display: 'grid', gap: 12 }}>
                                {auth?.user ? (
                                    <Link href={route('dashboard')} onClick={() => setMobileMenuOpen(false)}
                                        className="block text-center py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition"
                                        style={{ background: BRAND }}>
                                        {t('Mon tableau de bord')} →
                                    </Link>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link href={route('login')} onClick={() => setMobileMenuOpen(false)}
                                                className="block text-center py-3.5 rounded-xl font-bold text-sm border-2 transition hover:bg-orange-50"
                                                style={{ borderColor: BRAND, color: BRAND }}>
                                                {t('Se connecter')}
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link href={route('register')} onClick={() => setMobileMenuOpen(false)}
                                                className="block text-center py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition"
                                                style={{ background: BRAND }}>
                                                {t('Essai gratuit 14 jours')}
                                            </Link>
                                        )}
                                    </>
                                )}
                                {/* Sélecteur de langue — unique sur mobile (topbar masqué) */}
                                <div className="pt-2">
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        </aside>
                    </>
                )}

                {/* ── HERO SLIDER ─────────────────────────────────── */}
                <HeroSlider canRegister={canRegister} />

                {/* ── ZONE DE RÉASSURANCE ─────────────────────────── */}
                <section style={{ background: BRAND }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                            {[
                                { val: '15+',  label: t('Modules métier BTP') },
                                { val: '48h',  label: t('Déploiement garanti') },
                                { val: '14j',  label: t('Essai 100% gratuit') },
                                { val: '24/7', label: t('Accès en ligne') },
                            ].map((s) => (
                                <div key={s.label}>
                                    <div className="text-3xl sm:text-4xl font-black text-white">{s.val}</div>
                                    <div className="text-orange-100 text-sm mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PROBLÈMES RÉSOLUS ───────────────────────────── */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Avant / Après CONSTRUIRO')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Des problèmes concrets, des solutions réelles')}</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">{t("Voici ce que vivent vos homologues BTP avant d'adopter CONSTRUIRO — et ce qu'ils disent après.")}</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {PROBLEMES.map((p, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                                    <div className="p-5" style={{ background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">{t('Avant')}</span>
                                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t(p.avant)}</p>
                                    </div>
                                    <div className="p-5" style={{ background: 'rgba(245,130,32,0.04)' }}>
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND }}>{t('Avec CONSTRUIRO')}</span>
                                        <p className="text-sm text-gray-700 mt-2 leading-relaxed font-medium">{t(p.apres)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── BÉNÉFICES MAJEURS ───────────────────────────── */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Bénéfices')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Ce que vous gagnez concrètement')}</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {BENEFICES.map((b) => (
                                <div key={b.titre}
                                    className="group p-6 rounded-2xl border border-gray-100 hover:border-[#F58220] hover:shadow-xl transition-all duration-200">
                                    <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center"
                                        style={{ background: 'rgba(245,130,32,0.1)', color: BRAND }}>
                                        <span className="w-5 h-5">{icons[b.icon]}</span>
                                    </div>
                                    <h3 className="font-bold text-base mb-2" style={{ color: NAVY }}>{t(b.titre)}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{t(b.desc)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── MODULES ─────────────────────────────────────── */}
                <section id="modules" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Plateforme complète')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Tout ce dont votre entreprise BTP a besoin')}</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">{t("Une plateforme unique qui couvre l'ensemble de votre activité, du devis à la facturation.")}</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.map((m) => (
                                <div key={m.key}
                                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#F58220] hover:shadow-xl transition-all duration-200">
                                    <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center"
                                        style={{ background: 'rgba(245,130,32,0.1)', color: BRAND }}>
                                        <span className="w-5 h-5">{icons[m.key]}</span>
                                    </div>
                                    <h3 className="font-bold text-base mb-2" style={{ color: NAVY }}>{t(m.titre)}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{t(m.desc)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── GALERIE CAPTURES ────────────────────────────── */}
                <GalerieCaptures />

                {/* ── VIDÉO DE PRÉSENTATION ───────────────────────── */}
                <VideoPresentation />

                {/* ── COMMENT ÇA MARCHE ───────────────────────────── */}
                <section className="py-20 bg-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Démarrage rapide')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Opérationnel en 4 étapes')}</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                            {ETAPES.map((e, i) => (
                                <div key={e.num} className="text-center">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 font-black text-2xl text-white"
                                        style={{ background: BRAND, boxShadow: `0 8px 24px rgba(245,130,32,0.35)` }}>
                                        {e.num}
                                    </div>
                                    <h3 className="font-black text-lg mb-3" style={{ color: NAVY }}>{t(e.titre)}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{t(e.desc)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            {canRegister && (
                                <Link href={route('register')}
                                    className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90"
                                    style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.3)` }}>
                                    {t('Commencer gratuitement — 14 jours offerts')}
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── PUBLICS CONCERNÉS ───────────────────────────── */}
                <section id="publics" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Solutions sectorielles')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t("CONSTRUIRO s'adapte à votre type d'activité")}</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
                            {PUBLICS.map((p) => (
                                <div key={p.titre}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#F58220] hover:shadow-lg transition-all text-center">
                                    <div className="text-4xl mb-4">{p.emoji}</div>
                                    <h3 className="font-black text-base mb-2" style={{ color: NAVY }}>{t(p.titre)}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{t(p.desc)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── POURQUOI CONSTRUIRO ─────────────────────────── */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Pourquoi CONSTRUIRO ?')}</p>
                                <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ color: NAVY }}>{t("L'ERP pensé pour la réalité africaine")}</h2>
                                <p className="text-gray-500 mb-10">{t("Nous ne sommes pas un ERP occidental adapté à l'Afrique. Nous avons été conçus dès le départ pour les PME et groupes BTP africains.")}</p>
                                <div className="space-y-6">
                                    {[
                                        { titre: 'Adapté au contexte local', desc: 'Multi-devises (FCFA, USD, EUR…), sous-traitants locaux, conformité fiscale africaine.' },
                                        { titre: 'Zéro infrastructure requise', desc: "Accédez depuis n'importe quel navigateur. Pas de serveur à installer." },
                                        { titre: 'Prise en main en quelques heures', desc: 'Interface en français. Vos équipes sont opérationnelles dès le premier jour.' },
                                        { titre: 'Support basé en Afrique', desc: 'Une équipe disponible dans votre fuseau horaire, qui comprend vos contraintes.' },
                                    ].map((r) => (
                                        <div key={r.titre} className="flex gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ background: BRAND }}>
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm mb-0.5" style={{ color: NAVY }}>{t(r.titre)}</p>
                                                <p className="text-sm text-gray-500">{t(r.desc)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-3xl p-8" style={{ background: NAVY }}>
                                <p className="text-sm font-bold tracking-widest uppercase mb-6" style={{ color: BRAND }}>{t('Inclus dans votre abonnement')}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Suivi temps réel des chantiers','Tableau de bord dirigeant','Alertes et notifications','Exports PDF et Excel','Signature électronique','Assistant IA intégré','Application mobile','Sauvegarde automatique','Multi-utilisateurs','Audit trail complet'].map((f) => (
                                        <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                                            <span style={{ color: BRAND }}>⚡</span> {t(f)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── INTÉGRATIONS ────────────────────────────────── */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Intégrations')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Connecté à votre écosystème')}</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">{t("CONSTRUIRO s'intègre aux outils de paiement, communication et données que vous utilisez déjà.")}</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {INTEGRATIONS.map((integ) => (
                                <div key={integ.nom}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl">{integ.emoji}</span>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{ background: `${statutColor[integ.statut]}15`, color: statutColor[integ.statut] }}>
                                            {t(STATUT_LABEL_FR[integ.statut])}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: NAVY }}>{integ.nom}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{t(integ.desc)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SECTION IA SARA ─────────────────────────────── */}
                <section id="sara" className="py-20" style={{ background: NAVY }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Intelligence artificielle')}</p>
                                <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
                                    {t('Rencontrez')} <span style={{ color: BRAND }}>SARA</span>,<br />{t('votre assistante IA')}
                                </h2>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    {t("SARA est l'assistante intelligente intégrée à CONSTRUIRO. Elle aide les visiteurs, prospects et utilisateurs à comprendre le logiciel et à trouver rapidement les réponses dont ils ont besoin.")}
                                </p>
                                <div className="space-y-4 mb-8">
                                    {[
                                        'Présente et explique toutes les fonctionnalités de CONSTRUIRO',
                                        'Guide vos équipes pas à pas dans le logiciel',
                                        'Compare les offres et vous oriente vers la bonne formule',
                                        "Propose une démonstration dès qu'elle détecte un intérêt",
                                        'Disponible 24h/24, 7j/7, en français et en anglais',
                                    ].map((f) => (
                                        <div key={f} className="flex gap-3 items-start">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                                                style={{ background: BRAND }}>
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <p className="text-sm text-gray-300">{t(f)}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                                    style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.35)` }}
                                    onClick={() => document.getElementById('sara-chat')?.click()}>
                                    {t('Parler à SARA →')}
                                </button>
                            </div>
                            <div>
                                <SlideVisualAI />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── EXPORTS VITRINE ─────────────────────────────── */}
                <section id="exports" className="py-20 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Exports professionnels')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Documents prêts à l\'envoi en un clic')}</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">
                                {t('CONSTRUIRO génère automatiquement des documents professionnels conformes, signés et vérifiables.')}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Carte 1 — Facture PDF */}
                            <div className="rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-xl transition-all duration-200">
                                <div className="px-6 pt-6 pb-4" style={{ background: 'rgba(245,130,32,0.05)' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,130,32,0.15)', color: BRAND }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                                            {t('Signé & vérifiable')}
                                        </span>
                                    </div>
                                    {/* Mockup facture */}
                                    <div className="rounded-xl overflow-hidden shadow-md" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <div className="px-4 pt-3 pb-2 flex justify-between items-start" style={{ borderBottom: '2px solid rgba(245,130,32,0.2)' }}>
                                            <div>
                                                <div className="w-16 h-2.5 rounded" style={{ background: BRAND, opacity: 0.7 }} />
                                                <div className="w-10 h-1.5 rounded mt-1.5 bg-gray-200" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black" style={{ color: NAVY }}>FACTURE</div>
                                                <div className="text-xs text-gray-400">#2026-0041</div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2.5 space-y-1.5">
                                            {[['Béton B25 — 50 m³', '1 250 000'], ['Main-d\'œuvre chantier', '480 000'], ['Transport matériaux', '120 000']].map(([label, amt]) => (
                                                <div key={label} className="flex justify-between text-xs">
                                                    <span className="text-gray-500">{label}</span>
                                                    <span className="font-semibold" style={{ color: NAVY }}>{amt} F</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-xs font-black pt-1.5" style={{ borderTop: '1px solid #f1f5f9', color: BRAND }}>
                                                <span>TOTAL TTC</span>
                                                <span>1 850 000 FCFA</span>
                                            </div>
                                        </div>
                                        <div className="px-4 pb-2 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-gray-400"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM7 8h6M7 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                            </div>
                                            <span className="text-xs text-gray-400">{t('QR de vérification intégré')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <h3 className="font-black text-sm mb-1" style={{ color: NAVY }}>{t('Facture PDF avec QR code')}</h3>
                                    <p className="text-xs text-gray-500">{t('Générez des factures professionnelles avec QR de vérification, conformes aux normes fiscales africaines.')}</p>
                                </div>
                            </div>

                            {/* Carte 2 — Export Excel */}
                            <div className="rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-xl transition-all duration-200">
                                <div className="px-6 pt-6 pb-4" style={{ background: 'rgba(34,197,94,0.03)' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                                                <path d="M6 13l2 2 4-4"/>
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                                            {t('Tous modules')}
                                        </span>
                                    </div>
                                    {/* Mockup tableau Excel */}
                                    <div className="rounded-xl overflow-hidden shadow-md" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-white" style={{ background: '#16a34a' }}>
                                            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M14 0H2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2zm-1 13H3V3h10v10zM5 5h2v2H5zm0 3h2v2H5zm3-3h2v2H8zm0 3h2v2H8zm3-3h1v2h-1zm0 3h1v2h-1z"/></svg>
                                            {t('Rapport_Chantiers_Juillet_2026.xlsx')}
                                        </div>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr style={{ background: '#f0fdf4' }}>
                                                    {['Chantier', 'Budget', 'Réel', '%'].map(h => (
                                                        <th key={h} className="px-2 py-1.5 text-left font-bold text-gray-600">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[['Résidence Cocody', '85M', '82M', '96%'], ['Route TP-N5', '120M', '108M', '90%'], ['Pont de Kayes', '200M', '95M', '47%']].map(([n, b, r, p]) => (
                                                    <tr key={n} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                        <td className="px-2 py-1 text-gray-700 font-medium">{n}</td>
                                                        <td className="px-2 py-1 text-gray-500">{b}</td>
                                                        <td className="px-2 py-1 text-gray-500">{r}</td>
                                                        <td className="px-2 py-1 font-bold" style={{ color: '#16a34a' }}>{p}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <h3 className="font-black text-sm mb-1" style={{ color: NAVY }}>{t('Export Excel complet')}</h3>
                                    <p className="text-xs text-gray-500">{t('Exportez toutes vos données en Excel : projets, finances, RH, stock, équipements — pour analyse et reporting.')}</p>
                                </div>
                            </div>

                            {/* Carte 3 — Rapport BI PDF */}
                            <div className="rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-xl transition-all duration-200">
                                <div className="px-6 pt-6 pb-4" style={{ background: 'rgba(99,102,241,0.03)' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                <line x1="18" y1="20" x2="18" y2="10"/>
                                                <line x1="12" y1="20" x2="12" y2="4"/>
                                                <line x1="6"  y1="20" x2="6"  y2="14"/>
                                                <line x1="2" y1="20" x2="22" y2="20"/>
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                                            {t('Personnalisable')}
                                        </span>
                                    </div>
                                    {/* Mockup rapport BI */}
                                    <div className="rounded-xl overflow-hidden shadow-md p-3 space-y-2" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black" style={{ color: NAVY }}>{t('Rapport BI — Juillet 2026')}</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(245,130,32,0.1)', color: BRAND }}>PDF</span>
                                        </div>
                                        {/* Mini graphique barres */}
                                        <div className="flex items-end gap-1 h-12 pt-2">
                                            {[55, 72, 48, 90, 63, 85, 70].map((h, i) => (
                                                <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 3 ? BRAND : (i === 5 ? '#6366f1' : '#e2e8f0') }} />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                                            {[['CA Total', '412M FCFA', BRAND], ['Projets', '24 actifs', '#6366f1'], ['Marge', '+18.4%', '#16a34a']].map(([label, val, color]) => (
                                                <div key={label} className="text-center p-1 rounded-lg" style={{ background: '#f8fafc' }}>
                                                    <div className="text-xs font-black" style={{ color }}>{val}</div>
                                                    <div className="text-xs text-gray-400" style={{ fontSize: 9 }}>{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <h3 className="font-black text-sm mb-1" style={{ color: NAVY }}>{t('Rapport BI PDF')}</h3>
                                    <p className="text-xs text-gray-500">{t('Générez des rapports de gestion personnalisés avec KPIs, graphiques et analyses — en PDF haute qualité.')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-10">
                            <a href="#demo"
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition hover:opacity-90"
                                style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.3)` }}>
                                {t('Voir une démo des exports →')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── SÉCURITÉ ────────────────────────────────────── */}
                <section id="securite" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Sécurité & Conformité')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Vos données en sécurité')}</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">{t('La protection de vos informations est au cœur de CONSTRUIRO. Voici nos engagements concrets.')}</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { emoji: '🔒', titre: 'Connexions HTTPS', desc: 'Toutes les communications sont chiffrées. Vos données transitent de manière 100% sécurisée.' },
                                { emoji: '👥', titre: 'Gestion des rôles', desc: "Définissez précisément qui voit quoi. 8 niveaux d'accès configurables selon vos besoins." },
                                { emoji: '💾', titre: 'Sauvegardes automatiques', desc: 'Vos données sont sauvegardées automatiquement chaque jour. Restauration disponible à tout moment.' },
                                { emoji: '📋', titre: "Journal d'audit complet", desc: 'Chaque action dans le logiciel est tracée. Retrouvez qui a fait quoi, quand et depuis où.' },
                                { emoji: '🔐', titre: 'Mots de passe sécurisés', desc: 'Hachage bcrypt, authentification à deux facteurs disponible, politique de mot de passe forte.' },
                                { emoji: '🏢', titre: 'Isolation des données', desc: 'Les données de chaque entreprise sont strictement isolées. Aucun croisement entre clients.' },
                            ].map((s) => (
                                <div key={s.titre} className="p-6 rounded-2xl border border-gray-100 hover:border-[#F58220] hover:shadow-lg transition-all">
                                    <div className="text-3xl mb-4">{s.emoji}</div>
                                    <h3 className="font-bold text-base mb-2" style={{ color: NAVY }}>{t(s.titre)}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{t(s.desc)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PWA ─────────────────────────────────────────── */}
                <section id="pwa" className="py-20 bg-gray-50">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl" style={{ background: NAVY, overflow: 'clip' }}>
                            <div className="grid lg:grid-cols-2 gap-0">
                                <div className="p-6 sm:p-10 lg:p-14">
                                    <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Application Web Progressive')}</p>
                                    <h2 className="font-black text-white mb-5" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.25rem)', lineHeight: 1.1, overflowWrap: 'break-word' }}>
                                        {t('Installez CONSTRUIRO sur votre appareil')}
                                    </h2>
                                    <p className="text-gray-400 mb-6 leading-relaxed text-sm sm:text-base">
                                        {t("Accédez plus rapidement à votre espace depuis votre ordinateur, tablette ou smartphone, sans passer par une boutique d'applications.")}
                                    </p>
                                    <div className="space-y-3 mb-6">
                                        {["Icône sur votre écran d'accueil",'Ouverture en plein écran','Mises à jour automatiques','Installation légère, aucun fichier lourd','Compatible Android, Windows, Chrome, Edge'].map(f => (
                                            <div key={f} className="text-sm text-gray-300" style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 10, alignItems: 'start' }}>
                                                <span style={{ color: BRAND, marginTop: 1 }}>✓</span>
                                                <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{t(f)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button id="pwa-install-btn"
                                        onClick={handlePwaInstall}
                                        disabled={!deferredPrompt}
                                        className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: BRAND }}>
                                        {t("📲 Installer l'application")}
                                    </button>
                                    <p className="text-xs text-gray-400 mt-4" style={{ overflowWrap: 'break-word' }}>
                                        {t('Sur iPhone : appuyez sur Partager puis "Ajouter à l\'écran d\'accueil"')}
                                    </p>
                                </div>
                                <div className="px-6 pb-6 sm:p-10 lg:p-14 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <SlideVisualDevices />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TARIFS ──────────────────────────────────────── */}
                <section id="tarifs" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Tarification')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Tarifs transparents')}</h2>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">{t('Payez en FCFA. Pas de frais cachés. Annulez à tout moment.')}</p>
                            {/* Toggle Mensuel / Annuel */}
                            <div className="inline-flex items-center gap-1 rounded-2xl p-1" style={{ background: '#f1f5f9' }}>
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
                                    style={billingCycle === 'monthly'
                                        ? { background: '#fff', color: NAVY, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                                        : { color: '#64748b' }}>
                                    {t('Mensuel')}
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className="px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                    style={billingCycle === 'yearly'
                                        ? { background: '#fff', color: NAVY, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                                        : { color: '#64748b' }}>
                                    {t('Annuel')}
                                    <span className="text-xs font-black px-2 py-0.5 rounded-full text-white" style={{ background: BRAND }}>-17%</span>
                                </button>
                            </div>
                            {billingCycle === 'yearly' && (
                                <p className="text-sm mt-3" style={{ color: BRAND }}>
                                    🎁 {t('2 mois offerts avec le forfait annuel')}
                                </p>
                            )}
                        </div>
                        {plans.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                                {plans.map((plan, i) => {
                                    const isRecommended = i === 2;
                                    const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
                                    const suffix = billingCycle === 'yearly' ? t('/an') : t('/mois');
                                    return (
                                        <div key={plan.id}
                                            className={`rounded-2xl p-6 flex flex-col relative ${isRecommended ? 'text-white' : 'bg-white border border-gray-100'}`}
                                            style={isRecommended ? { background: NAVY, boxShadow: `0 24px 60px rgba(0,0,0,0.2)` } : {}}>
                                            {isRecommended && (
                                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                                                    style={{ background: BRAND }}>
                                                    {t('RECOMMANDÉ')}
                                                </div>
                                            )}
                                            <h3 className={`text-lg font-black mb-1 ${isRecommended ? 'text-white' : ''}`} style={!isRecommended ? { color: NAVY } : {}}>{plan.name}</h3>
                                            {plan.description && <p className={`text-xs mb-4 ${isRecommended ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>}
                                            <div className="mb-5">
                                                <span className="text-2xl font-black" style={{ color: BRAND }}>{formatXOF(price)}</span>
                                                <span className={`text-xs ml-1 ${isRecommended ? 'text-gray-500' : 'text-gray-400'}`}>{suffix}</span>
                                                {billingCycle === 'yearly' && (
                                                    <div className="text-xs mt-1" style={{ color: isRecommended ? '#9ca3af' : '#94a3b8' }}>
                                                        ({formatXOF(Math.round(plan.price_yearly / 12))}{t('/mois')})
                                                    </div>
                                                )}
                                            </div>
                                            <ul className="space-y-2 text-xs flex-1 mb-6">
                                                {[
                                                    plan.max_users >= 9999 ? t('Utilisateurs illimités') : `${plan.max_users} ${t('utilisateurs')}`,
                                                    plan.max_projects >= 9999 ? t('Projets illimités') : `${plan.max_projects} ${t('projets')}`,
                                                    t('15+ modules BTP inclus'),
                                                    ...(plan.trial_days > 0 ? [`${plan.trial_days} ${t('jours d\'essai gratuit')}`] : []),
                                                ].map((item) => (
                                                    <li key={item} className={`flex items-center gap-2 ${isRecommended ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        <span style={{ color: BRAND }}>✓</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                            <a href="#demo"
                                                className="block text-center py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                                                style={isRecommended
                                                    ? { background: BRAND, color: '#fff' }
                                                    : { border: `2px solid ${BRAND}`, color: BRAND }}>
                                                {t('Commencer l\'essai gratuit')}
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">{t('Contactez-nous pour un devis personnalisé adapté à votre entreprise.')}</p>
                                <a href="#demo"
                                    className="inline-block px-8 py-3.5 rounded-xl font-bold text-white transition hover:opacity-90"
                                    style={{ background: BRAND }}>
                                    {t('Demander un devis →')}
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── COMPARATEUR OFFRES ──────────────────────────── */}
                {plans.length > 0 && <ComparateurOffres plans={plans} billingCycle={billingCycle} />}

                {/* ── IBIG PARTNERS ───────────────────────────────── */}
                <section className="py-20" style={{ background: NAVY }}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl p-10 lg:p-14 text-center"
                            style={{ background: 'rgba(245,130,32,0.1)', border: '1px solid rgba(245,130,32,0.25)' }}>
                            <div className="text-5xl mb-5">🤝</div>
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Programme partenaire')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">{t('Développez vos revenus avec IBIG PARTNERS')}</h2>
                            <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
                                {t("Rejoignez gratuitement le programme de partenariat IBIG et recommandez les solutions du groupe à votre réseau. Accédez aux outils, suivez vos recommandations et percevez vos commissions.")}
                            </p>
                            <div className="grid sm:grid-cols-3 gap-6 mb-10 text-left max-w-2xl mx-auto">
                                {[
                                    { emoji: '📋', titre: 'Inscription gratuite', desc: "Rejoignez le programme sans frais d'entrée." },
                                    { emoji: '📊', titre: 'Espace partenaire', desc: 'Accédez à votre tableau de bord dédié.' },
                                    { emoji: '💰', titre: 'Commissions', desc: 'Percevez vos commissions pour chaque client référé.' },
                                ].map(item => (
                                    <div key={item.titre} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <div className="text-2xl mb-2">{item.emoji}</div>
                                        <div className="text-white font-bold text-sm mb-1">{t(item.titre)}</div>
                                        <div className="text-gray-500 text-xs">{t(item.desc)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                                    style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.35)` }}>
                                    {t('Devenir partenaire →')}
                                </a>
                                <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:bg-white/10"
                                    style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                                    {t('Découvrir le programme')}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TÉMOIGNAGES ─────────────────────────────────── */}
                <section id="temoignages" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Témoignages')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black" style={{ color: NAVY }}>{t('Ils font confiance à CONSTRUIRO')}</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {temoignagesList.map((t) => (
                                <div key={t.nom}
                                    className="bg-white rounded-2xl p-7 flex flex-col border border-gray-100 hover:shadow-lg transition-all">
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} style={{ color: BRAND }}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">"{t.texte}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                            style={{ background: BRAND }}>
                                            {t.initiales}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm" style={{ color: NAVY }}>{t.nom}</p>
                                            <p className="text-xs text-gray-400">{t.poste} · {t.ville}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── AUTRES LOGICIELS IBIG SOFT ──────────────────── */}
                <section className="py-20 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t('Écosystème IBIG Soft')}</p>
                            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>{t('Découvrez les autres solutions IBIG Soft')}</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">{t('IBIG Soft édite plusieurs logiciels de gestion pour différents secteurs en Afrique.')}</p>
                        </div>
                    </div>
                    {/* Marquee défilant */}
                    <div className="relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                        <style>{`
                            @keyframes marquee-ibig { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                            .marquee-ibig { display: flex; animation: marquee-ibig 30s linear infinite; width: max-content; }
                            .marquee-ibig:hover { animation-play-state: paused; }
                        `}</style>
                        <div className="marquee-ibig gap-5 py-2">
                            {[...AUTRES_LOGICIELS, ...AUTRES_LOGICIELS].map((l, i) => (
                                <div key={i}
                                    className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all flex-shrink-0"
                                    style={{ minWidth: 220, borderLeft: `4px solid ${l.couleur}` }}>
                                    <span className="text-3xl">{l.emoji}</span>
                                    <div>
                                        <div className="font-black text-sm" style={{ color: NAVY }}>{l.nom}</div>
                                        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: l.couleur }}>{t(l.secteur)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center mt-10">
                        <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold transition hover:opacity-75"
                            style={{ color: BRAND }}>
                            {t('Voir toutes les solutions IBIG Soft →')}
                        </a>
                    </div>
                </section>

                {/* ── FAQ ─────────────────────────────────────────── */}
                {faqs.length > 0 && (
                    <section className="py-20 bg-gray-50">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>FAQ</p>
                                <h2 className="text-3xl sm:text-4xl font-black" style={{ color: NAVY }}>{t('Questions fréquentes')}</h2>
                            </div>
                            <div className="space-y-3">
                                {faqs.map((faq, i) => (
                                    <details key={i} className="group border border-gray-100 rounded-2xl overflow-hidden bg-white">
                                        <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold hover:bg-orange-50/50 transition list-none"
                                            style={{ color: NAVY }}>
                                            {faq.question}
                                            <span className="ml-4 text-xl transition-transform group-open:rotate-45" style={{ color: BRAND }}>+</span>
                                        </summary>
                                        <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">{faq.answer}</div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── CENTRE D'AIDE VITRINE ───────────────────────── */}
                <SectionAide onOpenSara={() => document.getElementById('sara-chat')?.click()} />

                {/* ── DEMO FORM ────────────────────────────────────── */}
                <section id="demo" className="py-20" style={{ background: BRAND }}>
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{t('Demandez une démo gratuite')}</h2>
                            <p className="text-orange-100">{t('Notre équipe vous répond sous 24h ouvrées pour organiser une démonstration personnalisée.')}</p>
                        </div>
                        <DemoForm />
                    </div>
                </section>

                {/* ── CTA FINAL ────────────────────────────────────── */}
                <section className="py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>
                            {t('Prêt à moderniser la gestion de vos chantiers ?')}
                        </h2>
                        <p className="text-gray-500 mb-10 text-lg">
                            {t('Essayez CONSTRUIRO gratuitement, demandez une démonstration, ou échangez avec notre assistante IA SARA.')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {canRegister && (
                                <Link href={route('register')}
                                    className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90"
                                    style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.3)` }}>
                                    {t('Commencer gratuitement')}
                                </Link>
                            )}
                            <a href="#demo"
                                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base border-2 transition-all hover:bg-gray-50"
                                style={{ borderColor: NAVY, color: NAVY }}>
                                {t('Demander une démo')} →
                            </a>
                            <button
                                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base border-2 transition-all hover:bg-orange-50"
                                style={{ borderColor: BRAND, color: BRAND }}
                                onClick={() => document.getElementById('sara-chat')?.click()}>
                                {t('Parler à SARA')} 🤖
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER 6 COLONNES ────────────────────────────── */}
                <footer style={{ background: NAVY }} className="text-slate-400">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

                            {/* Col 1 — CONSTRUIRO (identité) */}
                            <div>
                                <ConstruiroLogo size="sm" dark />
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                                    {t("L'ERP BTP conçu pour les entreprises de construction et de travaux publics en Afrique.")}
                                </p>
                                <p className="text-xs mt-4 italic" style={{ color: BRAND }}>{t('CONSTRUIRE. PILOTER. MAÎTRISER.')}</p>
                                <p className="text-xs mt-2 text-slate-600">{t('Un produit de')} <strong className="text-slate-500">IBIG Soft</strong></p>
                                <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                                    className="text-xs mt-1 inline-block transition hover:text-[#F58220]" style={{ color: BRAND }}>
                                    ibigsoft.com →
                                </a>
                            </div>

                            {/* Col 2 — Contact */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">{t('Contact')}</h4>
                                <ul className="space-y-3 text-xs">
                                    <li>
                                        <a href="tel:+2252722276014" className="text-slate-400 hover:text-white transition flex items-start gap-2">
                                            <span className="mt-0.5">📞</span>
                                            <span>+225 27 22 27 60 14</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:contact@ibigsoft.com" className="text-slate-400 hover:text-white transition flex items-start gap-2">
                                            <span className="mt-0.5">📧</span>
                                            <span>contact@ibigsoft.com</span>
                                        </a>
                                    </li>
                                    <li className="flex items-start gap-2 text-slate-500">
                                        <span className="mt-0.5">📍</span>
                                        <span>Abidjan, Côte d'Ivoire<br />Afrique de l'Ouest</span>
                                    </li>
                                    <li>
                                        <a href="#demo" className="text-slate-400 hover:text-white transition flex items-start gap-2">
                                            <span className="mt-0.5">💬</span>
                                            <span>{t('Formulaire de contact')}</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Col 3 — Navigation */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">{t('Navigation')}</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: 'Accueil', href: '/', anchor: false },
                                        { label: 'Fonctionnalités', href: '#modules', anchor: true },
                                        { label: 'Modules', href: '#modules', anchor: true },
                                        { label: 'Tarifs', href: '#tarifs', anchor: true },
                                        { label: 'Démonstration', href: '#demo', anchor: true },
                                        { label: 'Assistance', href: '/aide', anchor: false },
                                        { label: 'Se connecter', href: route('login'), anchor: false },
                                    ].map(l => (
                                        <li key={l.label}>
                                            {l.anchor
                                                ? <a href={l.href} className="hover:text-[#F58220] transition text-sm">{t(l.label)}</a>
                                                : <Link href={l.href} className="hover:text-[#F58220] transition text-sm">{t(l.label)}</Link>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 4 — Ressources */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">{t('Ressources')}</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: 'Guide utilisateur', href: '/guide/fr', ext: false },
                                        { label: "Centre d'aide", href: '/aide', ext: false },
                                        { label: 'FAQ', href: '#faq', anchor: true },
                                        { label: 'Blog', href: 'https://ibigsoft.com', ext: true },
                                        { label: 'Statut des services', href: 'https://ibigsoft.com', ext: true },
                                    ].map(l => (
                                        <li key={l.label}>
                                            {l.ext
                                                ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#F58220] transition text-sm">{t(l.label)}</a>
                                                : l.anchor
                                                ? <a href={l.href} className="hover:text-[#F58220] transition text-sm">{t(l.label)}</a>
                                                : <Link href={l.href} className="hover:text-[#F58220] transition text-sm">{t(l.label)}</Link>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 5 — IBIG Soft */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">IBIG Soft</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: "À propos d'IBIG Soft", href: 'https://ibigsoft.com', ext: true },
                                        { label: 'Autres logiciels', href: 'https://ibigsoft.com', ext: true },
                                        { label: 'Devenir partenaire', href: 'https://ibigpartners.com/', ext: true },
                                        { label: 'IBIG PARTNERS', href: 'https://ibigpartners.com/', ext: true },
                                        { label: 'Contact', href: '#demo', anchor: true },
                                        { label: 'Support', href: '/aide' },
                                    ].map(l => (
                                        <li key={l.label}>
                                            {l.ext
                                                ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#F58220] transition text-sm">{t(l.label)}</a>
                                                : l.anchor
                                                    ? <a href={l.href} className="hover:text-[#F58220] transition text-sm">{t(l.label)}</a>
                                                    : <Link href={l.href} className="hover:text-[#F58220] transition text-sm">{t(l.label)}</Link>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 6 — Légal */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">{t('Légal')}</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: 'Mentions légales', href: '/legal/legal' },
                                        { label: 'CGU', href: '/legal/cgu' },
                                        { label: 'Cond. commerciales', href: '/legal/conditions-commerciales' },
                                        { label: 'Contrat de licence', href: '/legal/contrat-licence' },
                                        { label: 'Confidentialité', href: '/legal/privacy' },
                                        { label: 'Politique cookies', href: '/legal/cookies' },
                                        { label: 'Résiliation', href: '/legal/resiliation' },
                                        { label: 'Gestion des données', href: '/legal/traitement-donnees' },
                                    ].map(l => (
                                        <li key={l.label}>
                                            <Link href={l.href} className="hover:text-[#F58220] transition text-sm">{t(l.label)}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>

                    {/* Barre de bas de page */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                                <p>© {new Date().getFullYear()} CONSTRUIRO ERP — {t('Tous droits réservés.')}</p>
                                <p className="text-center">
                                    {t('Logiciel conçu, édité et exploité par')} <strong className="text-slate-500">IBIG Soft</strong>, une marque de IBIG SARL – Intermark Business International Group.
                                </p>
                                <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                                    className="hover:text-[#F58220] transition whitespace-nowrap" style={{ color: BRAND }}>
                                    {t("Découvrir l'éditeur →")}
                                </a>
                            </div>
                            <p className="text-xs text-slate-700 text-center mt-3 max-w-3xl mx-auto">
                                {t('Toute reproduction, imitation, copie ou utilisation non autorisée du logiciel, de son interface, de son logo, de ses textes ou de sa documentation est interdite.')}
                            </p>
                        </div>
                    </div>
                </footer>

            </div>

            {/* ── FLOTTANTS ────────────────────────────────────── */}
            <SaraFloating />
            <WhatsAppFloating />
            <PwaBanner />
            <CookiesBanner />
        </>
    );
}
