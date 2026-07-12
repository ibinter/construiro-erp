import { Head, Link } from '@inertiajs/react';

const modules = [
    { icon: '🏗️', titre: 'Gestion de Projets', desc: 'Planification, suivi d\'avancement, jalons, tâches et budget par projet BTP.' },
    { icon: '👷', titre: 'RH & Paie', desc: 'Personnel de chantier, présences, congés, paie localisée et fiches de paie.' },
    { icon: '💰', titre: 'Finance & Comptabilité', desc: 'Facturation, trésorerie, comptabilité générale, budget et coûts analytiques.' },
    { icon: '🧱', titre: 'Matériaux & Stock', desc: 'Gestion des entrepôts, commandes fournisseurs, bons de livraison et inventaires.' },
    { icon: '🚜', titre: 'Équipements & Engins', desc: 'Parc roulant, maintenance préventive, carburant et affectation aux chantiers.' },
    { icon: '📋', titre: 'Devis & Contrats', desc: 'Métré, DQE, devis clients, contrats signés et suivi des avenants.' },
    { icon: '🦺', titre: 'HSE & Qualité', desc: 'Incidents de sécurité, contrôles qualité, non-conformités et audits chantier.' },
    { icon: '📐', titre: 'Bureau d\'Études', desc: 'Études, plans, métrés détaillés et bibliothèque de prix unitaires.' },
    { icon: '📊', titre: 'BI & Reporting', desc: 'Tableaux de bord, indicateurs clés, rapports automatiques et assistant IA.' },
];

const temoignages = [
    { nom: 'Koffi A.', poste: 'Directeur BTP, Abidjan', texte: 'CONSTRUIRO nous a permis de centraliser tout notre suivi de chantier. Fini les fichiers Excel perdus !' },
    { nom: 'Mamadou D.', poste: 'Chef de Projet, Dakar', texte: 'La gestion des équipements et du carburant seule nous a économisé 20% de coûts.' },
    { nom: 'Aminata B.', poste: 'DAF, Douala', texte: 'La comptabilité et la facturation intégrées nous font gagner 2 jours par mois de travail manuel.' },
];

export default function Welcome({ auth, canLogin, canRegister }) {
    return (
        <>
            <Head title="CONSTRUIRO — ERP BTP pour l'Afrique" />
            <div className="min-h-screen bg-white font-sans text-gray-800">

                {/* NAV */}
                <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-orange-600 tracking-tight">CONSTRUIRO</span>
                            <span className="hidden sm:inline text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">ERP BTP</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link href={route('dashboard')} className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                                    Mon tableau de bord →
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link href={route('login')} className="text-gray-600 hover:text-orange-600 text-sm font-medium transition">
                                            Se connecter
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link href={route('register')} className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                                            Essai gratuit
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO */}
                <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 text-white">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                    </div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
                        <span className="inline-block bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                            🌍 Conçu pour les entreprises BTP africaines
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                            Gérez tous vos chantiers<br />
                            <span className="text-yellow-200">en un seul endroit</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                            CONSTRUIRO est l'ERP complet pour les entreprises de BTP et de construction en Afrique.
                            Projets, RH, finances, matériaux, équipements — tout est connecté.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {canRegister ? (
                                <Link href={route('register')} className="bg-white text-orange-600 hover:bg-yellow-50 text-base font-bold px-8 py-4 rounded-xl shadow-lg transition transform hover:scale-105">
                                    Démarrer gratuitement →
                                </Link>
                            ) : canLogin ? (
                                <Link href={route('login')} className="bg-white text-orange-600 hover:bg-yellow-50 text-base font-bold px-8 py-4 rounded-xl shadow-lg transition transform hover:scale-105">
                                    Accéder à l'application →
                                </Link>
                            ) : null}
                            <a href="#modules" className="text-white/90 hover:text-white text-base font-medium underline underline-offset-4 transition">
                                Voir les fonctionnalités
                            </a>
                        </div>
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
                            <span>✅ 15+ modules intégrés</span>
                            <span>✅ Multidevises & multilingue</span>
                            <span>✅ Mobile & tablette</span>
                            <span>✅ Données hébergées en Afrique</span>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <section className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { val: '15+', label: 'Modules métier' },
                            { val: '100%', label: 'Web & Mobile' },
                            { val: '∞', label: 'Projets simultanés' },
                            { val: '24/7', label: 'Accès en ligne' },
                        ].map(s => (
                            <div key={s.label}>
                                <div className="text-3xl font-black text-orange-400">{s.val}</div>
                                <div className="text-gray-400 text-sm mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* MODULES */}
                <section id="modules" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                                Tout ce dont votre entreprise BTP a besoin
                            </h2>
                            <p className="text-gray-500 text-lg max-w-xl mx-auto">
                                Une plateforme unique qui couvre l'ensemble de votre activité, du devis à la facturation.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.map(m => (
                                <div key={m.titre} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition group">
                                    <div className="text-4xl mb-4">{m.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition">{m.titre}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* POURQUOI CONSTRUIRO */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="text-orange-600 font-semibold text-sm uppercase tracking-wide">Pourquoi CONSTRUIRO ?</span>
                                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 mb-6 leading-tight">
                                    L'ERP pensé<br /> pour la réalité africaine
                                </h2>
                                <div className="space-y-5">
                                    {[
                                        { t: 'Adapté au contexte local', d: 'Multi-devises (FCFA, USD, EUR…), gestion des sous-traitants locaux, conformité aux normes fiscales africaines.' },
                                        { t: 'Zéro infrastructure requise', d: 'Accédez depuis n\'importe quel navigateur. Pas de serveur à installer, pas de licence matérielle.' },
                                        { t: 'Prise en main rapide', d: 'Interface intuitive en français. Vos équipes sont opérationnelles en quelques heures, pas en semaines.' },
                                        { t: 'Support dédié Afrique', d: 'Une équipe basée en Afrique, disponible dans votre fuseau horaire.' },
                                    ].map(item => (
                                        <div key={item.t} className="flex gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs mt-0.5">✓</div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{item.t}</div>
                                                <div className="text-gray-500 text-sm mt-0.5">{item.d}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 border border-orange-100">
                                <div className="text-center mb-6">
                                    <div className="text-5xl font-black text-orange-600">🏆</div>
                                    <h3 className="text-xl font-bold text-gray-900 mt-3">Votre ERP tout-en-un</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        'Suivi en temps réel des chantiers',
                                        'Tableau de bord dirigeant',
                                        'Alertes et notifications automatiques',
                                        'Exports PDF et Excel intégrés',
                                        'Signature électronique des documents',
                                        'Assistant IA pour l\'analyse des données',
                                    ].map(f => (
                                        <div key={f} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                                            <span className="text-orange-500">⚡</span>
                                            <span className="text-gray-700 text-sm font-medium">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TEMOIGNAGES */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl font-black text-gray-900 mb-4">Ils font confiance à CONSTRUIRO</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {temoignages.map(t => (
                                <div key={t.nom} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                    <div className="text-orange-400 text-2xl mb-4">★★★★★</div>
                                    <p className="text-gray-600 italic mb-6 leading-relaxed">"{t.texte}"</p>
                                    <div>
                                        <div className="font-bold text-gray-900">{t.nom}</div>
                                        <div className="text-gray-400 text-sm">{t.poste}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA FINAL */}
                <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl sm:text-4xl font-black mb-6">
                            Prêt à transformer la gestion de vos chantiers ?
                        </h2>
                        <p className="text-gray-300 text-lg mb-10">
                            Rejoignez les entreprises BTP africaines qui pilotent leur activité avec CONSTRUIRO.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {canRegister ? (
                                <Link href={route('register')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-lg transition transform hover:scale-105">
                                    Commencer maintenant — Gratuit
                                </Link>
                            ) : canLogin ? (
                                <Link href={route('login')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-lg transition transform hover:scale-105">
                                    Accéder à CONSTRUIRO
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-gray-900 border-t border-gray-800 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
                        <span className="font-bold text-orange-500 text-base">CONSTRUIRO</span>
                        <span>© {new Date().getFullYear()} IBIG Soft — Tous droits réservés</span>
                        <div className="flex gap-4">
                            {canLogin && <Link href={route('login')} className="hover:text-orange-400 transition">Connexion</Link>}
                            {canRegister && <Link href={route('register')} className="hover:text-orange-400 transition">Inscription</Link>}
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
