import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import ConstruiroLogo from '@/Components/ConstruiroLogo';
import SaraFloating from '@/Components/SaraFloating';
import PwaBanner from '@/Components/PwaBanner';
import CookiesBanner from '@/Components/CookiesBanner';

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
    { nom: 'Flutterwave', desc: 'Paiements multicanaux', statut: 'integration', emoji: '💳' },
    { nom: 'Paystack', desc: 'Paiements e-commerce', statut: 'bientot', emoji: '🏦' },
    { nom: 'Stripe', desc: 'Paiements internationaux', statut: 'bientot', emoji: '💰' },
];

const statutLabel = { disponible: 'Disponible', integration: 'En intégration', bientot: 'Bientôt' };
const statutColor = { disponible: '#22c55e', integration: BRAND, bientot: '#94a3b8' };

/* ── Autres logiciels IBIG Soft ─────────────────────────────── */
const AUTRES_LOGICIELS = [
    { nom: 'Anouanze ERP', secteur: 'Associations & ONG', desc: 'Solution de gestion complète pour associations, ONG, coopératives et organisations africaines.', emoji: '🤝', couleur: '#3b82f6' },
    { nom: 'MediCare+', secteur: 'Santé & Cliniques', desc: 'ERP médical pour cliniques, cabinets et hôpitaux — dossiers patients, facturation, pharmacie.', emoji: '🏥', couleur: '#10b981', bientot: true },
    { nom: 'EduAdmin', secteur: 'Éducation & Écoles', desc: 'Gestion scolaire et universitaire — inscriptions, notes, emplois du temps, facturation.', emoji: '📚', couleur: '#8b5cf6', bientot: true },
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
                    <div className="text-white font-bold text-sm">{item.titre}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{item.sub}</div>
                </div>
            ))}
        </div>
    );
}

/* ── Visuel slide devices ─────────────────────────────────────── */
function SlideVisualDevices() {
    return (
        <div className="flex items-end justify-center gap-6 w-full max-w-md mx-auto py-4">
            {/* Desktop */}
            <div className="flex-1 rounded-lg overflow-hidden" style={{ border: '2px solid rgba(255,255,255,0.2)', maxWidth: 200 }}>
                <div className="bg-gray-800 py-1.5 px-3 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"/>
                    <span className="w-2 h-2 rounded-full bg-yellow-400"/>
                    <span className="w-2 h-2 rounded-full bg-green-400"/>
                </div>
                <div className="bg-gray-900 p-2 space-y-1">
                    <div className="h-2 rounded-full bg-gray-700 w-3/4"/>
                    <div className="h-8 rounded bg-gray-800 flex items-center justify-center">
                        <span className="text-xs" style={{ color: BRAND }}>CONSTRUIRO</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        <div className="h-5 rounded bg-gray-700"/>
                        <div className="h-5 rounded bg-gray-700"/>
                    </div>
                </div>
                <div className="h-2 bg-gray-800"/>
                <div className="h-1 mx-auto w-8 bg-gray-600 rounded-full mt-1"/>
            </div>
            {/* Tablet */}
            <div className="rounded-xl overflow-hidden" style={{ border: '2px solid rgba(245,130,32,0.4)', width: 100 }}>
                <div className="bg-gray-900 p-2 space-y-1">
                    <div className="h-4 rounded bg-gray-800 flex items-center justify-center">
                        <span className="text-xs" style={{ color: BRAND, fontSize: 7 }}>CONSTRUIRO</span>
                    </div>
                    <div className="h-12 rounded bg-gray-800"/>
                    <div className="h-3 rounded bg-gray-700"/>
                </div>
                <div className="h-2 bg-gray-800 flex justify-center items-center">
                    <div className="w-4 h-1 rounded-full bg-gray-600"/>
                </div>
            </div>
            {/* Phone */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '2px solid rgba(255,255,255,0.15)', width: 70 }}>
                <div className="bg-gray-900 p-1.5 space-y-1">
                    <div className="h-3 rounded bg-gray-800 flex items-center justify-center">
                        <span style={{ color: BRAND, fontSize: 5 }} className="font-bold">CONSTRUIRO</span>
                    </div>
                    <div className="h-10 rounded bg-gray-800"/>
                    <div className="grid grid-cols-2 gap-0.5">
                        <div className="h-2 rounded bg-gray-700"/>
                        <div className="h-2 rounded bg-gray-700"/>
                    </div>
                </div>
                <div className="h-3 bg-gray-800 flex justify-center items-center">
                    <div className="w-5 h-1 rounded-full bg-gray-600"/>
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
                        <div className="text-white text-sm font-semibold">{item.titre}</div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                        {item.val}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ── Hero Slider ─────────────────────────────────────────────── */
function HeroSlider({ canRegister }) {
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
            style={{ background: NAVY, minHeight: 520 }}
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
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Texte */}
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
                            style={{ background: 'rgba(245,130,32,0.15)', color: BRAND, border: `1px solid rgba(245,130,32,0.3)` }}>
                            {slide.badge}
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] text-white mb-4">
                            {slide.h1a}<br/>
                            <span style={{ color: BRAND }}>{slide.h1b}</span><br/>
                            {slide.h1c}
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">{slide.sub}</p>
                        <div className="flex flex-wrap gap-4 mb-10">
                            <a href={slide.cta1Href}
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 shadow-lg"
                                style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.35)` }}>
                                {slide.cta1Label}
                            </a>
                            {slide.cta2IsRegister && canRegister ? (
                                <Link href={route('register')}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all hover:bg-white/10"
                                    style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                                    {slide.cta2Label}
                                </Link>
                            ) : slide.cta2Href ? (
                                <a href={slide.cta2Href}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all hover:bg-white/10"
                                    style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                                    {slide.cta2Label}
                                </a>
                            ) : null}
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> 15+ modules intégrés</span>
                            <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> Essai 14 jours gratuit</span>
                            <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> Déployé en 48h</span>
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
    const { data, setData, post, processing, wasSuccessful, errors } = useForm({
        name: '', email: '', phone: '', company: '', sector: '', message: '',
    });

    if (wasSuccessful) {
        return (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="text-5xl mb-4">✅</div>
                <p className="text-xl font-bold text-white mb-2">Demande envoyée !</p>
                <p className="text-orange-100 text-sm">Notre équipe vous contactera dans les 24h ouvrées.</p>
            </div>
        );
    }

    const inputCls = "w-full rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white";

    return (
        <form onSubmit={(e) => { e.preventDefault(); post('/demo-request'); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">Nom complet *</label>
                    <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)}
                        placeholder="Jean Dupont" className={inputCls}/>
                    {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">Email professionnel *</label>
                    <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)}
                        placeholder="jean@entreprise.com" className={inputCls}/>
                    {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">Téléphone</label>
                    <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)}
                        placeholder="+225 07 00 00 00 00" className={inputCls}/>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">Entreprise *</label>
                    <input type="text" required value={data.company} onChange={e => setData('company', e.target.value)}
                        placeholder="BTP Côte d'Ivoire SA" className={inputCls}/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Secteur d'activité</label>
                <select value={data.sector} onChange={e => setData('sector', e.target.value)} className={inputCls}>
                    <option value="">— Sélectionnez —</option>
                    <option>BTP / Construction</option>
                    <option>Promotion Immobilière</option>
                    <option>Travaux Publics</option>
                    <option>Sous-traitance BTP</option>
                    <option>Autre</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-white mb-1.5">Message (optionnel)</label>
                <textarea rows={3} value={data.message} onChange={e => setData('message', e.target.value)}
                    placeholder="Décrivez votre besoin ou posez vos questions…"
                    className={`${inputCls} resize-none`}/>
            </div>
            <button type="submit" disabled={processing}
                className="w-full py-4 rounded-xl font-bold text-white text-base transition-all disabled:opacity-60"
                style={{ background: processing ? '#666' : NAVY, boxShadow: `0 4px 20px rgba(0,0,0,0.4)` }}>
                {processing ? 'Envoi en cours…' : 'Demander une démo gratuite →'}
            </button>
        </form>
    );
}

/* ── Barre supérieure ────────────────────────────────────────── */
function TopBar() {
    return (
        <div style={{ background: '#0a1628' }} className="text-xs py-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <span style={{ color: BRAND }}>✓</span> Essai gratuit 14 jours
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
                <div className="flex items-center gap-3 text-gray-400">
                    <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">IBIG Soft</a>
                    <span className="opacity-30">|</span>
                    <a href="/aide" className="hover:text-white transition">Support</a>
                    <span className="opacity-30">|</span>
                    <button className="hover:text-white transition font-semibold" style={{ color: BRAND }}>FR</button>
                    <span className="opacity-30">/</span>
                    <button className="hover:text-white transition">EN</button>
                </div>
            </div>
        </div>
    );
}

/* ── Page principale ─────────────────────────────────────────── */
export default function Welcome({ auth, canLogin, canRegister, plans = [], faqs = [] }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "CONSTRUIRO ERP",
                    "description": "ERP BTP conçu pour les entreprises de construction africaines",
                    "applicationCategory": "BusinessApplication",
                    "operatingSystem": "Web",
                    "offers": { "@type": "Offer", "priceCurrency": "XOF", "availability": "https://schema.org/InStock" },
                    "publisher": { "@type": "Organization", "name": "IBIG Soft", "url": "https://ibigsoft.com" }
                })}</script>
            </Head>
            <div className="min-h-screen bg-white font-sans" style={{ color: NAVY }}>

                {/* ── BARRE SUPÉRIEURE ─────────────────────────────── */}
                <TopBar />

                {/* ── NAV ─────────────────────────────────────────── */}
                <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        <ConstruiroLogo size="sm" />

                        {/* Menu desktop */}
                        <div className="hidden lg:flex items-center gap-7">
                            {[
                                ['Fonctionnalités', '#modules'],
                                ['Publics', '#publics'],
                                ['Modules', '#modules'],
                                ['Tarifs', '#tarifs'],
                                ['Démo', '#demo'],
                                ['Assistance', '/aide'],
                            ].map(([label, href]) => (
                                <a key={label} href={href}
                                    className="text-sm font-medium text-gray-500 hover:text-[#F58220] transition">
                                    {label}
                                </a>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link href={route('dashboard')}
                                    className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition hover:opacity-90"
                                    style={{ background: BRAND }}>
                                    Mon tableau de bord →
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link href={route('login')} className="text-sm font-medium text-gray-600 hover:text-[#F58220] transition hidden sm:block">
                                            Se connecter
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link href={route('register')}
                                            className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition hover:opacity-90"
                                            style={{ background: BRAND }}>
                                            Essai gratuit
                                        </Link>
                                    )}
                                </>
                            )}
                            {/* Burger mobile */}
                            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                                onClick={() => setMobileMenuOpen(o => !o)}
                                aria-label="Menu">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    {mobileMenuOpen
                                        ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                                        : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                                    }
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Menu mobile */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-3 space-y-1">
                            {[['Fonctionnalités', '#modules'],['Publics', '#publics'],['Tarifs', '#tarifs'],['Démo', '#demo'],['Assistance', '/aide']].map(([label, href]) => (
                                <a key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 text-sm font-medium text-gray-700 hover:text-[#F58220]">{label}</a>
                            ))}
                            {canLogin && <Link href={route('login')} className="block py-2 text-sm font-medium text-gray-700 hover:text-[#F58220]">Se connecter</Link>}
                            {canRegister && (
                                <Link href={route('register')}
                                    className="block mt-2 text-center py-3 rounded-xl font-bold text-white text-sm"
                                    style={{ background: BRAND }}>
                                    Essai gratuit 14 jours
                                </Link>
                            )}
                        </div>
                    )}
                </nav>

                {/* ── HERO SLIDER ─────────────────────────────────── */}
                <HeroSlider canRegister={canRegister} />

                {/* ── ZONE DE RÉASSURANCE ─────────────────────────── */}
                <section style={{ background: BRAND }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                            {[
                                { val: '15+',  label: 'Modules métier BTP' },
                                { val: '48h',  label: 'Déploiement garanti' },
                                { val: '14j',  label: 'Essai 100% gratuit' },
                                { val: '24/7', label: 'Accès en ligne' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <div className="text-4xl font-black text-white">{s.val}</div>
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
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Avant / Après CONSTRUIRO</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>Des problèmes concrets,<br />des solutions réelles</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">Voici ce que vivent vos homologues BTP avant d'adopter CONSTRUIRO — et ce qu'ils disent après.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {PROBLEMES.map((p, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                                    <div className="p-5" style={{ background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Avant</span>
                                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{p.avant}</p>
                                    </div>
                                    <div className="p-5" style={{ background: 'rgba(245,130,32,0.04)' }}>
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND }}>Avec CONSTRUIRO</span>
                                        <p className="text-sm text-gray-700 mt-2 leading-relaxed font-medium">{p.apres}</p>
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
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Bénéfices</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>Ce que vous gagnez<br />concrètement</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {BENEFICES.map((b) => (
                                <div key={b.titre}
                                    className="group p-6 rounded-2xl border border-gray-100 hover:border-[#F58220] hover:shadow-xl transition-all duration-200">
                                    <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center"
                                        style={{ background: 'rgba(245,130,32,0.1)', color: BRAND }}>
                                        <span className="w-5 h-5">{icons[b.icon]}</span>
                                    </div>
                                    <h3 className="font-bold text-base mb-2" style={{ color: NAVY }}>{b.titre}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── MODULES ─────────────────────────────────────── */}
                <section id="modules" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Plateforme complète</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>Tout ce dont votre entreprise BTP a besoin</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">Une plateforme unique qui couvre l'ensemble de votre activité, du devis à la facturation.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.map((m) => (
                                <div key={m.key}
                                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#F58220] hover:shadow-xl transition-all duration-200">
                                    <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center"
                                        style={{ background: 'rgba(245,130,32,0.1)', color: BRAND }}>
                                        <span className="w-5 h-5">{icons[m.key]}</span>
                                    </div>
                                    <h3 className="font-bold text-base mb-2" style={{ color: NAVY }}>{m.titre}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── COMMENT ÇA MARCHE ───────────────────────────── */}
                <section className="py-20 bg-white">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Démarrage rapide</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>Opérationnel en 4 étapes</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                            {ETAPES.map((e, i) => (
                                <div key={e.num} className="text-center">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 font-black text-2xl text-white"
                                        style={{ background: BRAND, boxShadow: `0 8px 24px rgba(245,130,32,0.35)` }}>
                                        {e.num}
                                    </div>
                                    <h3 className="font-black text-lg mb-3" style={{ color: NAVY }}>{e.titre}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{e.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            {canRegister && (
                                <Link href={route('register')}
                                    className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90"
                                    style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.3)` }}>
                                    Commencer gratuitement — 14 jours offerts
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── PUBLICS CONCERNÉS ───────────────────────────── */}
                <section id="publics" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Solutions sectorielles</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>CONSTRUIRO s'adapte<br />à votre type d'activité</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
                            {PUBLICS.map((p) => (
                                <div key={p.titre}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#F58220] hover:shadow-lg transition-all text-center">
                                    <div className="text-4xl mb-4">{p.emoji}</div>
                                    <h3 className="font-black text-base mb-2" style={{ color: NAVY }}>{p.titre}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
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
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Pourquoi CONSTRUIRO ?</p>
                                <h2 className="text-4xl font-black mb-6" style={{ color: NAVY }}>L'ERP pensé pour<br />la réalité africaine</h2>
                                <p className="text-gray-500 mb-10">Nous ne sommes pas un ERP occidental adapté à l'Afrique. Nous avons été conçus dès le départ pour les PME et groupes BTP africains.</p>
                                <div className="space-y-6">
                                    {[
                                        { titre: 'Adapté au contexte local', desc: 'Multi-devises (FCFA, USD, EUR…), sous-traitants locaux, conformité fiscale africaine.' },
                                        { titre: 'Zéro infrastructure requise', desc: 'Accédez depuis n\'importe quel navigateur. Pas de serveur à installer.' },
                                        { titre: 'Prise en main en quelques heures', desc: 'Interface en français. Vos équipes sont opérationnelles dès le premier jour.' },
                                        { titre: 'Support basé en Afrique', desc: 'Une équipe disponible dans votre fuseau horaire, qui comprend vos contraintes.' },
                                    ].map((r) => (
                                        <div key={r.titre} className="flex gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{ background: BRAND }}>
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm mb-0.5" style={{ color: NAVY }}>{r.titre}</p>
                                                <p className="text-sm text-gray-500">{r.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-3xl p-8" style={{ background: NAVY }}>
                                <p className="text-sm font-bold tracking-widest uppercase mb-6" style={{ color: BRAND }}>Inclus dans votre abonnement</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Suivi temps réel des chantiers','Tableau de bord dirigeant','Alertes et notifications','Exports PDF et Excel','Signature électronique','Assistant IA intégré','Application mobile','Sauvegarde automatique','Multi-utilisateurs','Audit trail complet'].map((f) => (
                                        <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                                            <span style={{ color: BRAND }}>⚡</span> {f}
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
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Intégrations</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>Connecté à votre écosystème</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">CONSTRUIRO s'intègre aux outils de paiement, communication et données que vous utilisez déjà.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {INTEGRATIONS.map((integ) => (
                                <div key={integ.nom}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl">{integ.emoji}</span>
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{ background: `${statutColor[integ.statut]}15`, color: statutColor[integ.statut] }}>
                                            {statutLabel[integ.statut]}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: NAVY }}>{integ.nom}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{integ.desc}</p>
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
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Intelligence artificielle</p>
                                <h2 className="text-4xl font-black text-white mb-6">Rencontrez <span style={{ color: BRAND }}>SARA</span>,<br />votre assistante IA</h2>
                                <p className="text-gray-400 mb-8 leading-relaxed">
                                    SARA est l'assistante intelligente intégrée à CONSTRUIRO. Elle aide les visiteurs, prospects et utilisateurs à comprendre le logiciel et à trouver rapidement les réponses dont ils ont besoin.
                                </p>
                                <div className="space-y-4 mb-8">
                                    {[
                                        'Présente et explique toutes les fonctionnalités de CONSTRUIRO',
                                        'Guide vos équipes pas à pas dans le logiciel',
                                        'Compare les offres et vous oriente vers la bonne formule',
                                        'Propose une démonstration dès qu\'elle détecte un intérêt',
                                        'Disponible 24h/24, 7j/7, en français et en anglais',
                                    ].map((f) => (
                                        <div key={f} className="flex gap-3 items-start">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                                                style={{ background: BRAND }}>
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                            <p className="text-sm text-gray-300">{f}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                                    style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.35)` }}
                                    onClick={() => document.getElementById('sara-chat')?.click()}>
                                    Parler à SARA →
                                </button>
                            </div>
                            <div>
                                <SlideVisualAI />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SÉCURITÉ ────────────────────────────────────── */}
                <section id="securite" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Sécurité & Conformité</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>Vos données en sécurité</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">La protection de vos informations est au cœur de CONSTRUIRO. Voici nos engagements concrets.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { emoji: '🔒', titre: 'Connexions HTTPS', desc: 'Toutes les communications sont chiffrées. Vos données transitent de manière 100% sécurisée.' },
                                { emoji: '👥', titre: 'Gestion des rôles', desc: 'Définissez précisément qui voit quoi. 8 niveaux d\'accès configurables selon vos besoins.' },
                                { emoji: '💾', titre: 'Sauvegardes automatiques', desc: 'Vos données sont sauvegardées automatiquement chaque jour. Restauration disponible à tout moment.' },
                                { emoji: '📋', titre: 'Journal d\'audit complet', desc: 'Chaque action dans le logiciel est tracée. Retrouvez qui a fait quoi, quand et depuis où.' },
                                { emoji: '🔐', titre: 'Mots de passe sécurisés', desc: 'Hachage bcrypt, authentification à deux facteurs disponible, politique de mot de passe forte.' },
                                { emoji: '🏢', titre: 'Isolation des données', desc: 'Les données de chaque entreprise sont strictement isolées. Aucun croisement entre clients.' },
                            ].map((s) => (
                                <div key={s.titre} className="p-6 rounded-2xl border border-gray-100 hover:border-[#F58220] hover:shadow-lg transition-all">
                                    <div className="text-3xl mb-4">{s.emoji}</div>
                                    <h3 className="font-bold text-base mb-2" style={{ color: NAVY }}>{s.titre}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PWA ─────────────────────────────────────────── */}
                <section id="pwa" className="py-20 bg-gray-50">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl overflow-hidden" style={{ background: NAVY }}>
                            <div className="grid lg:grid-cols-2 gap-0">
                                <div className="p-10 lg:p-14">
                                    <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Application Web Progressive</p>
                                    <h2 className="text-3xl font-black text-white mb-5">Installez CONSTRUIRO<br />sur votre appareil</h2>
                                    <p className="text-gray-400 mb-8 leading-relaxed">
                                        Accédez plus rapidement à votre espace depuis votre ordinateur, tablette ou smartphone, sans passer par une boutique d'applications.
                                    </p>
                                    <div className="space-y-3 mb-8">
                                        {['Icône sur votre écran d\'accueil','Ouverture en plein écran','Mises à jour automatiques','Installation légère, aucun fichier lourd','Compatible Android, Windows, Chrome, Edge'].map(f => (
                                            <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                                <span style={{ color: BRAND }}>✓</span> {f}
                                            </div>
                                        ))}
                                    </div>
                                    <button id="pwa-install-btn"
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                                        style={{ background: BRAND }}>
                                        📲 Installer l'application
                                    </button>
                                    <p className="text-xs text-gray-600 mt-4">
                                        Sur iPhone : appuyez sur Partager puis "Ajouter à l'écran d'accueil"
                                    </p>
                                </div>
                                <div className="p-10 lg:p-14 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <SlideVisualDevices />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TARIFS ──────────────────────────────────────── */}
                <section id="tarifs" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Tarification</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>Tarifs transparents</h2>
                            <p className="text-gray-500 max-w-md mx-auto">Payez en FCFA. Pas de frais cachés. Annulez à tout moment.</p>
                        </div>
                        {plans.length > 0 ? (
                            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                {plans.map((plan, i) => (
                                    <div key={plan.id}
                                        className={`rounded-2xl p-8 flex flex-col relative ${i === 1 ? 'text-white' : 'bg-white border border-gray-100'}`}
                                        style={i === 1 ? { background: NAVY, boxShadow: `0 24px 60px rgba(0,0,0,0.2)` } : {}}>
                                        {i === 1 && (
                                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                                                style={{ background: BRAND }}>
                                                RECOMMANDÉ
                                            </div>
                                        )}
                                        <h3 className={`text-xl font-black mb-1 ${i === 1 ? 'text-white' : ''}`} style={i !== 1 ? { color: NAVY } : {}}>{plan.name}</h3>
                                        {plan.description && <p className={`text-sm mb-5 ${i === 1 ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>}
                                        <div className="mb-6">
                                            <span className="text-3xl font-black" style={{ color: BRAND }}>{formatXOF(plan.price_monthly)}</span>
                                            <span className={`text-sm ml-1 ${i === 1 ? 'text-gray-500' : 'text-gray-400'}`}>/mois</span>
                                        </div>
                                        <ul className="space-y-3 text-sm flex-1 mb-8">
                                            {[
                                                plan.max_users >= 9999 ? 'Utilisateurs illimités' : `${plan.max_users} utilisateurs`,
                                                plan.max_projects >= 9999 ? 'Projets illimités' : `${plan.max_projects} projets`,
                                                '15+ modules BTP inclus',
                                                ...(plan.trial_days > 0 ? [`${plan.trial_days} jours d'essai gratuit`] : []),
                                            ].map((item) => (
                                                <li key={item} className={`flex items-center gap-2 ${i === 1 ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <span style={{ color: BRAND }}>✓</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <a href="#demo"
                                            className="block text-center py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                                            style={i === 1
                                                ? { background: BRAND, color: '#fff' }
                                                : { border: `2px solid ${BRAND}`, color: BRAND }}>
                                            Commencer l'essai gratuit
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">Contactez-nous pour un devis personnalisé adapté à votre entreprise.</p>
                                <a href="#demo"
                                    className="inline-block px-8 py-3.5 rounded-xl font-bold text-white transition hover:opacity-90"
                                    style={{ background: BRAND }}>
                                    Demander un devis →
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── IBIG PARTNERS ───────────────────────────────── */}
                <section className="py-20" style={{ background: NAVY }}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl p-10 lg:p-14 text-center"
                            style={{ background: 'rgba(245,130,32,0.1)', border: '1px solid rgba(245,130,32,0.25)' }}>
                            <div className="text-5xl mb-5">🤝</div>
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Programme partenaire</p>
                            <h2 className="text-4xl font-black text-white mb-5">Développez vos revenus<br />avec IBIG PARTNERS</h2>
                            <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
                                Rejoignez gratuitement le programme de partenariat IBIG et recommandez les solutions du groupe à votre réseau. Accédez aux outils, suivez vos recommandations et percevez vos commissions.
                            </p>
                            <div className="grid sm:grid-cols-3 gap-6 mb-10 text-left max-w-2xl mx-auto">
                                {[
                                    { emoji: '📋', titre: 'Inscription gratuite', desc: 'Rejoignez le programme sans frais d\'entrée.' },
                                    { emoji: '📊', titre: 'Espace partenaire', desc: 'Accédez à votre tableau de bord dédié.' },
                                    { emoji: '💰', titre: 'Commissions', desc: 'Percevez vos commissions pour chaque client référé.' },
                                ].map(item => (
                                    <div key={item.titre} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <div className="text-2xl mb-2">{item.emoji}</div>
                                        <div className="text-white font-bold text-sm mb-1">{item.titre}</div>
                                        <div className="text-gray-500 text-xs">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90"
                                    style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.35)` }}>
                                    Devenir partenaire →
                                </a>
                                <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:bg-white/10"
                                    style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                                    Découvrir le programme
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TÉMOIGNAGES ─────────────────────────────────── */}
                <section id="temoignages" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Témoignages</p>
                            <h2 className="text-4xl font-black" style={{ color: NAVY }}>Ils font confiance à CONSTRUIRO</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {temoignages.map((t) => (
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
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Écosystème IBIG Soft</p>
                            <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>Découvrez également<br />les autres solutions IBIG Soft</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">IBIG Soft édite plusieurs logiciels de gestion pour différents secteurs en Afrique.</p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {AUTRES_LOGICIELS.map((l) => (
                                <div key={l.nom}
                                    className="rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden">
                                    {l.bientot && (
                                        <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(245,130,32,0.1)', color: BRAND }}>
                                            Bientôt
                                        </div>
                                    )}
                                    <div className="text-4xl mb-4">{l.emoji}</div>
                                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: l.couleur }}>{l.secteur}</div>
                                    <h3 className="font-black text-lg mb-2" style={{ color: NAVY }}>{l.nom}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{l.desc}</p>
                                    <a href={l.bientot ? 'https://ibigsoft.com' : '#'} target="_blank" rel="noopener noreferrer"
                                        className="text-sm font-bold transition hover:opacity-75" style={{ color: l.couleur }}>
                                        {l.bientot ? 'En savoir plus →' : 'Découvrir →'}
                                    </a>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-bold transition hover:opacity-75"
                                style={{ color: BRAND }}>
                                Voir toutes les solutions IBIG Soft →
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ─────────────────────────────────────────── */}
                {faqs.length > 0 && (
                    <section className="py-20 bg-gray-50">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>FAQ</p>
                                <h2 className="text-4xl font-black" style={{ color: NAVY }}>Questions fréquentes</h2>
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

                {/* ── DEMO FORM ────────────────────────────────────── */}
                <section id="demo" className="py-20" style={{ background: BRAND }}>
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-black text-white mb-3">Demandez une démo gratuite</h2>
                            <p className="text-orange-100">Notre équipe vous répond sous 24h ouvrées pour organiser une démonstration personnalisée.</p>
                        </div>
                        <DemoForm />
                    </div>
                </section>

                {/* ── CTA FINAL ────────────────────────────────────── */}
                <section className="py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>
                            Prêt à moderniser la gestion<br />de vos chantiers ?
                        </h2>
                        <p className="text-gray-500 mb-10 text-lg">
                            Essayez CONSTRUIRO gratuitement, demandez une démonstration,<br className="hidden sm:block"/> ou échangez avec notre assistante IA SARA.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {canRegister && (
                                <Link href={route('register')}
                                    className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90"
                                    style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.3)` }}>
                                    Commencer gratuitement
                                </Link>
                            )}
                            <a href="#demo"
                                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base border-2 transition-all hover:bg-gray-50"
                                style={{ borderColor: NAVY, color: NAVY }}>
                                Demander une démo →
                            </a>
                            <button
                                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base border-2 transition-all hover:bg-orange-50"
                                style={{ borderColor: BRAND, color: BRAND }}
                                onClick={() => document.getElementById('sara-chat')?.click()}>
                                Parler à SARA 🤖
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER 6 COLONNES ────────────────────────────── */}
                <footer style={{ background: NAVY }} className="text-slate-400">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

                            {/* Col 1 — Identité (span 2 sur lg) */}
                            <div className="col-span-2 md:col-span-3 lg:col-span-2">
                                <ConstruiroLogo size="sm" dark />
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed max-w-xs">
                                    L'ERP BTP conçu pour les entreprises de construction et de travaux publics en Afrique.
                                </p>
                                <p className="text-xs mt-4 italic" style={{ color: BRAND }}>CONSTRUIRE. PILOTER. MAÎTRISER.</p>
                                <p className="text-xs mt-2 text-slate-600">Un produit de <strong className="text-slate-500">IBIG Soft</strong></p>
                                <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                                    className="text-xs mt-1 inline-block transition hover:text-[#F58220]" style={{ color: BRAND }}>
                                    ibigsoft.com →
                                </a>
                                <div className="flex gap-3 mt-5">
                                    <a href="tel:+2252722276014" className="text-xs text-slate-500 hover:text-white transition flex items-center gap-1">
                                        📞 +225 27 22 27 60 14
                                    </a>
                                </div>
                                <div className="mt-1">
                                    <a href="mailto:contact@ibigsoft.com" className="text-xs text-slate-500 hover:text-white transition">
                                        📧 contact@ibigsoft.com
                                    </a>
                                </div>
                            </div>

                            {/* Col 2 — Navigation */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Navigation</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: 'Accueil', href: '/', anchor: false },
                                        { label: 'Fonctionnalités', href: '#modules', anchor: true },
                                        { label: 'Modules', href: '#modules', anchor: true },
                                        { label: 'Tarifs', href: '#tarifs', anchor: true },
                                        { label: 'Démonstration', href: '#demo', anchor: true },
                                        { label: 'Assistance', href: '/aide', anchor: false },
                                        { label: 'Connexion', href: route('login'), anchor: false },
                                    ].map(l => (
                                        <li key={l.label}>
                                            {l.anchor
                                                ? <a href={l.href} className="hover:text-[#F58220] transition text-sm">{l.label}</a>
                                                : <Link href={l.href} className="hover:text-[#F58220] transition text-sm">{l.label}</Link>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 3 — Ressources */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Ressources</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: 'Guide utilisateur', href: '/aide/guide' },
                                        { label: 'Centre d\'aide', href: '/aide' },
                                        { label: 'FAQ', href: '#faq' },
                                        { label: 'Documentation', href: '/aide/docs' },
                                        { label: 'Nouveautés', href: '/aide/nouveautes' },
                                        { label: 'Blog', href: '/blog' },
                                        { label: 'Statut des services', href: '/statut' },
                                    ].map(l => (
                                        <li key={l.label}>
                                            <Link href={l.href} className="hover:text-[#F58220] transition text-sm">{l.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 4 — IBIG Soft */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">IBIG Soft</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: 'À propos d\'IBIG Soft', href: 'https://ibigsoft.com', ext: true },
                                        { label: 'Autres logiciels', href: 'https://ibigsoft.com', ext: true },
                                        { label: 'Devenir partenaire', href: 'https://ibigpartners.com/', ext: true },
                                        { label: 'IBIG PARTNERS', href: 'https://ibigpartners.com/', ext: true },
                                        { label: 'Contact', href: '#demo', anchor: true },
                                        { label: 'Support', href: '/aide' },
                                    ].map(l => (
                                        <li key={l.label}>
                                            {l.ext
                                                ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#F58220] transition text-sm">{l.label}</a>
                                                : l.anchor
                                                    ? <a href={l.href} className="hover:text-[#F58220] transition text-sm">{l.label}</a>
                                                    : <Link href={l.href} className="hover:text-[#F58220] transition text-sm">{l.label}</Link>
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Col 5 — Légal */}
                            <div>
                                <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Légal</h4>
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
                                            <Link href={l.href} className="hover:text-[#F58220] transition text-sm">{l.label}</Link>
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
                                <p>© {new Date().getFullYear()} CONSTRUIRO ERP — Tous droits réservés.</p>
                                <p className="text-center">
                                    Logiciel conçu, édité et exploité par <strong className="text-slate-500">IBIG Soft</strong>, une marque de IBIG SARL – Intermark Business International Group.
                                </p>
                                <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                                    className="hover:text-[#F58220] transition whitespace-nowrap" style={{ color: BRAND }}>
                                    Découvrir l'éditeur →
                                </a>
                            </div>
                            <p className="text-xs text-slate-700 text-center mt-3 max-w-3xl mx-auto">
                                Toute reproduction, imitation, copie ou utilisation non autorisée du logiciel, de son interface, de son logo, de ses textes ou de sa documentation est interdite.
                            </p>
                        </div>
                    </div>
                </footer>

            </div>

            {/* ── FLOTTANTS ────────────────────────────────────── */}
            <SaraFloating />
            <PwaBanner />
            <CookiesBanner />
        </>
    );
}
