import { Head, Link, useForm } from '@inertiajs/react';
import ConstruiroLogo from '@/Components/ConstruiroLogo';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

/* ── Icônes SVG modules ─────────────────────────────────────── */
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
};

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

const temoignages = [
    { initiales: 'KA', nom: 'Koffi A.', poste: 'Directeur BTP', ville: 'Abidjan', texte: 'CONSTRUIRO a centralisé tout notre suivi de chantier. Fini les fichiers Excel perdus — on pilote tout depuis un seul écran.' },
    { initiales: 'MD', nom: 'Mamadou D.', poste: 'Chef de Projet', ville: 'Dakar', texte: 'La gestion des équipements et du carburant seule nous a économisé plus de 20% de coûts en moins d\'un trimestre.' },
    { initiales: 'AB', nom: 'Aminata B.', poste: 'Directrice Administrative', ville: 'Douala', texte: 'La comptabilité et la facturation intégrées nous font gagner 2 jours de travail manuel chaque mois.' },
];

function formatXOF(amount) {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';
}

/* ── Maquette dashboard SVG ─────────────────────────────────── */
function DashboardMockup() {
    return (
        <svg viewBox="0 0 560 360" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-2xl">
            {/* Fond fenêtre */}
            <rect width="560" height="360" rx="12" fill="#0f172a"/>
            {/* Barre titre */}
            <rect width="560" height="36" rx="12" fill="#1e293b"/>
            <rect y="24" width="560" height="12" fill="#1e293b"/>
            <circle cx="20" cy="18" r="5" fill="#ef4444" opacity=".8"/>
            <circle cx="36" cy="18" r="5" fill="#f59e0b" opacity=".8"/>
            <circle cx="52" cy="18" r="5" fill="#22c55e" opacity=".8"/>
            <text x="280" y="22" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">CONSTRUIRO ERP — Tableau de bord</text>

            {/* Sidebar */}
            <rect x="0" y="36" width="120" height="324" fill="#1e293b"/>
            {/* Logo sidebar */}
            <rect x="12" y="48" width="96" height="28" rx="6" fill={BRAND} opacity=".15"/>
            <text x="60" y="66" textAnchor="middle" fill={BRAND} fontSize="9" fontWeight="bold" fontFamily="sans-serif">CONSTRUIRO</text>
            {/* Nav items */}
            {[
                ['Tableau de bord', true],
                ['Projets', false],
                ['RH & Paie', false],
                ['Stock', false],
                ['Finance', false],
                ['Équipements', false],
                ['Rapports', false],
            ].map(([label, active], i) => (
                <g key={label}>
                    <rect x="8" y={90 + i * 30} width="104" height="24" rx="5"
                          fill={active ? BRAND : 'transparent'} opacity={active ? 1 : 0}/>
                    <text x="20" y={106 + i * 30} fill={active ? '#fff' : '#64748b'}
                          fontSize="8" fontFamily="sans-serif">{label}</text>
                </g>
            ))}

            {/* Main content */}
            {/* Header bar */}
            <rect x="128" y="44" width="424" height="28" rx="4" fill="#1e293b"/>
            <text x="140" y="62" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Tableau de bord</text>
            <rect x="448" y="50" width="88" height="16" rx="4" fill={BRAND}/>
            <text x="492" y="61" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="sans-serif">+ Nouveau projet</text>

            {/* KPI Cards */}
            {[
                { label: 'Projets actifs', val: '24', icon: '▦', col: '#3b82f6' },
                { label: 'CA ce mois', val: '142M FCFA', icon: '₣', col: '#22c55e' },
                { label: 'Chantiers en cours', val: '18', icon: '⬡', col: BRAND },
                { label: 'Alertes stock', val: '3', icon: '⚠', col: '#ef4444' },
            ].map((k, i) => (
                <g key={k.label}>
                    <rect x={128 + i * 106} y="80" width="100" height="60" rx="6" fill="#1e293b"/>
                    <rect x={128 + i * 106} y="80" width="4" height="60" rx="2" fill={k.col}/>
                    <text x={142 + i * 106} y="104" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">{k.label}</text>
                    <text x={142 + i * 106} y="124" fill="#f1f5f9" fontSize="13" fontWeight="bold" fontFamily="sans-serif">{k.val}</text>
                </g>
            ))}

            {/* Chart area */}
            <rect x="128" y="150" width="260" height="140" rx="6" fill="#1e293b"/>
            <text x="142" y="168" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Avancement chantiers — Juillet 2026</text>
            {/* Bars */}
            {[
                { h: 60, col: BRAND, label: 'Proj A' },
                { h: 90, col: '#3b82f6', label: 'Proj B' },
                { h: 40, col: '#22c55e', label: 'Proj C' },
                { h: 75, col: BRAND, label: 'Proj D' },
                { h: 55, col: '#8b5cf6', label: 'Proj E' },
                { h: 85, col: '#3b82f6', label: 'Proj F' },
            ].map((b, i) => (
                <g key={i}>
                    <rect x={148 + i * 36} y={270 - b.h} width="22" height={b.h} rx="3" fill={b.col} opacity=".85"/>
                    <text x={159 + i * 36} y="282" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="sans-serif">{b.label}</text>
                </g>
            ))}

            {/* Recent projects table */}
            <rect x="396" y="150" width="156" height="140" rx="6" fill="#1e293b"/>
            <text x="410" y="168" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">Projets récents</text>
            {[
                { name: 'Résidence Cocody', status: 'En cours', col: BRAND },
                { name: 'Route N\'Djamena', status: 'Planifié', col: '#3b82f6' },
                { name: 'Pont de Kayes', status: 'Clôturé', col: '#22c55e' },
                { name: 'Imm. Plateau', status: 'En cours', col: BRAND },
            ].map((p, i) => (
                <g key={p.name}>
                    <text x="410" y={184 + i * 24} fill="#e2e8f0" fontSize="7" fontFamily="sans-serif">{p.name}</text>
                    <rect x="480" y={174 + i * 24} width="52" height="12" rx="3" fill={p.col} opacity=".2"/>
                    <text x="506" y={183 + i * 24} textAnchor="middle" fill={p.col} fontSize="6" fontFamily="sans-serif">{p.status}</text>
                </g>
            ))}

            {/* Bottom bar */}
            <rect x="128" y="298" width="424" height="2" fill="#334155"/>
            <text x="140" y="322" fill="#475569" fontSize="7" fontFamily="sans-serif">© 2026 IBIG Soft — CONSTRUIRO ERP v1.0 · Données sécurisées · Accès 24/7</text>
        </svg>
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
                        placeholder="Jean Dupont" className={inputCls} style={{ '--tw-ring-color': BRAND }} />
                    {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">Email professionnel *</label>
                    <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)}
                        placeholder="jean@entreprise.com" className={inputCls} />
                    {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">Téléphone</label>
                    <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)}
                        placeholder="+225 07 00 00 00 00" className={inputCls} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-white mb-1.5">Entreprise *</label>
                    <input type="text" required value={data.company} onChange={e => setData('company', e.target.value)}
                        placeholder="BTP Côte d'Ivoire SA" className={inputCls} />
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
                    className={`${inputCls} resize-none`} />
            </div>
            <button type="submit" disabled={processing}
                className="w-full py-4 rounded-xl font-bold text-white text-base transition-all disabled:opacity-60"
                style={{ background: processing ? '#666' : NAVY, boxShadow: `0 4px 20px rgba(0,0,0,0.4)` }}>
                {processing ? 'Envoi en cours…' : 'Demander une démo gratuite →'}
            </button>
        </form>
    );
}

/* ── Page principale ─────────────────────────────────────────── */
export default function Welcome({ auth, canLogin, canRegister, plans = [], faqs = [] }) {
    return (
        <>
            <Head>
                <title>CONSTRUIRO — ERP BTP pour l'Afrique | Gérez vos chantiers</title>
                <meta name="description" content="CONSTRUIRO est l'ERP BTP conçu pour les entreprises africaines. Gérez projets, RH, stocks, équipements et finance depuis une seule plateforme. Essai gratuit 14 jours." />
                <meta property="og:title" content="CONSTRUIRO — ERP BTP pour l'Afrique" />
                <meta property="og:description" content="15+ modules intégrés. Déployé en 48h. Essai gratuit 14 jours." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://construiro.com" />
            </Head>
            <div className="min-h-screen bg-white font-sans" style={{ color: NAVY }}>

                {/* ── NAV ─────────────────────────────────────────────── */}
                <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        <ConstruiroLogo size="sm" />
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#modules" className="text-sm font-medium text-gray-500 hover:text-[#F58220] transition">Modules</a>
                            <a href="#tarifs" className="text-sm font-medium text-gray-500 hover:text-[#F58220] transition">Tarifs</a>
                            <a href="#temoignages" className="text-sm font-medium text-gray-500 hover:text-[#F58220] transition">Témoignages</a>
                            <a href="#demo" className="text-sm font-medium text-gray-500 hover:text-[#F58220] transition">Démo</a>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link href={route('dashboard')}
                                    className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition"
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
                        </div>
                    </div>
                </nav>

                {/* ── HERO ─────────────────────────────────────────────── */}
                <section className="relative overflow-hidden" style={{ background: NAVY }}>
                    {/* Pattern de fond */}
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #F58220 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
                    {/* Lueur orange en haut à gauche */}
                    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
                        style={{ background: `radial-gradient(circle, ${BRAND}, transparent 70%)` }} />
                    {/* Lueur orange en bas à droite */}
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15"
                        style={{ background: `radial-gradient(circle, ${BRAND}, transparent 70%)` }} />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Texte */}
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
                                    style={{ background: 'rgba(245,130,32,0.15)', color: BRAND, border: `1px solid rgba(245,130,32,0.3)` }}>
                                    🌍 Conçu pour les entreprises BTP africaines
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] text-white mb-4">
                                    Gérez tous vos<br />
                                    <span style={{ color: BRAND }}>chantiers</span><br />
                                    en un seul endroit
                                </h1>
                                <p className="text-base font-bold tracking-widest mb-6" style={{ color: BRAND }}>
                                    CONSTRUIRE. PILOTER. MAÎTRISER.
                                </p>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                    15+ modules intégrés pour les entreprises de BTP et de construction en Afrique.
                                    Projets, RH, finances, matériaux, équipements — tout est connecté.
                                </p>
                                <div className="flex flex-wrap gap-4 mb-10">
                                    <a href="#demo"
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 shadow-lg"
                                        style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.35)` }}>
                                        Demander une démo gratuite
                                    </a>
                                    {canRegister && (
                                        <Link href={route('register')}
                                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-base transition-all hover:bg-white/10"
                                            style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                                            Essai 14 jours gratuit →
                                        </Link>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> 15+ modules intégrés</span>
                                    <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> Multidevises FCFA / USD / EUR</span>
                                    <span className="flex items-center gap-1.5"><span style={{ color: BRAND }}>✓</span> Déployé en 48h</span>
                                </div>
                            </div>

                            {/* Maquette dashboard */}
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-3xl opacity-30 blur-xl"
                                    style={{ background: `linear-gradient(135deg, ${BRAND}40, transparent)` }} />
                                <div className="relative rounded-2xl overflow-hidden"
                                    style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
                                    <DashboardMockup />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── STATS ───────────────────────────────────────────── */}
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

                {/* ── MODULES ─────────────────────────────────────────── */}
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
                                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#F58220] hover:shadow-xl transition-all duration-200 cursor-default">
                                    <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center transition-colors"
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

                {/* ── POURQUOI ─────────────────────────────────────────── */}
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
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                                                style={{ background: BRAND }}>
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm mb-0.5" style={{ color: NAVY }}>{r.titre}</p>
                                                <p className="text-sm text-gray-500">{r.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Features box */}
                            <div className="rounded-3xl p-8" style={{ background: NAVY }}>
                                <p className="text-sm font-bold tracking-widest uppercase mb-6" style={{ color: BRAND }}>Inclus dans votre abonnement</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        'Suivi temps réel des chantiers',
                                        'Tableau de bord dirigeant',
                                        'Alertes et notifications',
                                        'Exports PDF et Excel',
                                        'Signature électronique',
                                        'Assistant IA intégré',
                                        'Application mobile',
                                        'Sauvegarde automatique',
                                        'Multi-utilisateurs',
                                        'Audit trail complet',
                                    ].map((f) => (
                                        <div key={f} className="flex items-center gap-2 text-sm text-gray-400">
                                            <span style={{ color: BRAND }}>⚡</span> {f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TARIFS ──────────────────────────────────────────── */}
                <section id="tarifs" className="py-20 bg-gray-50">
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
                                        <h3 className={`text-xl font-black mb-1 ${i === 1 ? 'text-white' : ''}`} style={i !== 1 ? { color: NAVY } : {}}>
                                            {plan.name}
                                        </h3>
                                        {plan.description && (
                                            <p className={`text-sm mb-5 ${i === 1 ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                                        )}
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

                {/* ── TÉMOIGNAGES ─────────────────────────────────────── */}
                <section id="temoignages" className="py-20" style={{ background: NAVY }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>Témoignages</p>
                            <h2 className="text-4xl font-black text-white">Ils font confiance à CONSTRUIRO</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {temoignages.map((t) => (
                                <div key={t.nom}
                                    className="rounded-2xl p-7 flex flex-col"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="flex mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} style={{ color: BRAND }}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-6">"{t.texte}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                            style={{ background: BRAND }}>
                                            {t.initiales}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{t.nom}</p>
                                            <p className="text-xs text-gray-500">{t.poste} · {t.ville}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ─────────────────────────────────────────────── */}
                {faqs.length > 0 && (
                    <section className="py-20 bg-white">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>FAQ</p>
                                <h2 className="text-4xl font-black" style={{ color: NAVY }}>Questions fréquentes</h2>
                            </div>
                            <div className="space-y-3">
                                {faqs.map((faq, i) => (
                                    <details key={i} className="group border border-gray-100 rounded-2xl overflow-hidden">
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

                {/* ── DEMO FORM ────────────────────────────────────────── */}
                <section id="demo" className="py-20" style={{ background: BRAND }}>
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-black text-white mb-3">Demandez une démo gratuite</h2>
                            <p className="text-orange-100">Notre équipe vous répond sous 24h ouvrées pour organiser une démonstration personnalisée.</p>
                        </div>
                        <DemoForm />
                    </div>
                </section>

                {/* ── CTA FINAL ────────────────────────────────────────── */}
                <section className="py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl font-black mb-4" style={{ color: NAVY }}>
                            Prêt à transformer la gestion<br />de vos chantiers ?
                        </h2>
                        <p className="text-gray-500 mb-10 text-lg">
                            Rejoignez les entreprises BTP africaines qui pilotent leur activité avec CONSTRUIRO.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="#demo"
                                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-base transition-all hover:opacity-90"
                                style={{ background: BRAND, boxShadow: `0 8px 32px rgba(245,130,32,0.3)` }}>
                                Demander une démo →
                            </a>
                            {canRegister && (
                                <Link href={route('register')}
                                    className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-base border-2 transition-all hover:bg-gray-50"
                                    style={{ borderColor: NAVY, color: NAVY }}>
                                    Commencer gratuitement
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ───────────────────────────────────────────── */}
                <footer style={{ background: NAVY }} className="text-slate-400">
                    {/* Grille principale */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                            {/* Colonne 1 — Marque */}
                            <div className="lg:col-span-1">
                                <ConstruiroLogo size="sm" dark />
                                <p className="text-sm text-slate-400 mt-4 leading-relaxed">
                                    L'ERP BTP conçu pour les entreprises de construction et de travaux publics en Afrique.
                                </p>
                                <p className="text-xs mt-4 italic" style={{ color: BRAND }}>
                                    CONSTRUIRE. PILOTER. MAÎTRISER.
                                </p>
                                <p className="text-xs mt-2 text-slate-600">Un produit de <strong className="text-slate-500">IBIG Soft</strong></p>
                                <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer"
                                    className="text-xs mt-1 inline-block hover:text-[#F58220] transition"
                                    style={{ color: BRAND }}>
                                    ibigsoft.com →
                                </a>
                            </div>

                            {/* Colonne 2 — Liens rapides */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Liens rapides</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: 'Modules',       href: '#modules' },
                                        { label: 'Tarifs',        href: '#tarifs' },
                                        { label: 'Témoignages',   href: '#temoignages' },
                                        { label: 'Démonstration', href: '#demo' },
                                        { label: 'Connexion',     href: '/login' },
                                        { label: 'Inscription',   href: '/register' },
                                    ].map((l) => (
                                        <li key={l.label}>
                                            <a href={l.href} className="hover:text-[#F58220] transition">{l.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Colonne 3 — Légal */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Légal</h4>
                                <ul className="space-y-2.5 text-sm">
                                    {[
                                        { label: 'Mentions légales',   href: '/legal/legal' },
                                        { label: 'Confidentialité',    href: '/legal/privacy' },
                                        { label: 'CGU',                href: '/legal/cgu' },
                                        { label: 'Politique cookies',  href: '/legal/cookies' },
                                    ].map((l) => (
                                        <li key={l.label}>
                                            <Link href={l.href} className="hover:text-[#F58220] transition">{l.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Colonne 4 — Contact */}
                            <div>
                                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Adresse</h4>
                                <div className="space-y-3 text-sm">
                                    <p className="font-semibold text-slate-300">IBIG Soft<br />
                                        <span className="font-normal text-slate-500">Intermark Business International Group</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span>📍</span>
                                        <span>Abidjan, Côte d'Ivoire</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span>📧</span>
                                        <a href="mailto:contact@ibigsoft.com" className="hover:text-[#F58220] transition">
                                            contact@ibigsoft.com
                                        </a>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span>📞</span>
                                        <span>+225 27 22 27 60 14</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span>📞</span>
                                        <span>+225 05 55 05 99 01</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barre de bas de page */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                            <p>© {new Date().getFullYear()} IBIG Soft — Tous droits réservés.</p>
                            <p>CONSTRUIRO ERP est un produit de <strong className="text-slate-500">IBIG Soft</strong> · Abidjan, Côte d'Ivoire.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
