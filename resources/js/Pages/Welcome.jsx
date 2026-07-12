import { Head, Link, useForm } from '@inertiajs/react';

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

const audiences = [
    { icon: '🏢', titre: 'PME BTP', desc: 'Digitalisez votre gestion de chantiers sans équipe IT. Déployé en 48h.' },
    { icon: '🏭', titre: 'Groupes Construction', desc: 'Multi-entités, multi-devises, consolidation en temps réel.' },
    { icon: '🔧', titre: 'Sous-traitants', desc: 'Gérez vos équipes, votre facturation et vos contrats depuis un seul outil.' },
    { icon: '🏛️', titre: 'Promoteurs Immobiliers', desc: 'Du foncier à la livraison : budget, planning, qualité et ventes intégrés.' },
];

function formatXOF(amount) {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA';
}

function DemoForm() {
    const { data, setData, post, processing, wasSuccessful, errors } = useForm({
        name: '', email: '', phone: '', company: '', sector: '', message: '',
    });

    if (wasSuccessful) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-semibold text-green-800">Demande envoyée !</p>
                <p className="text-sm text-green-600 mt-1">Notre équipe vous contactera dans les 24h ouvrées.</p>
            </div>
        );
    }

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); post('/demo-request'); }}
            className="space-y-4"
        >
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input type="text" required value={data.name} onChange={e => setData('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel *</label>
                    <input type="email" required value={data.email} onChange={e => setData('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label>
                    <input type="text" required value={data.company} onChange={e => setData('company', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité</label>
                <select value={data.sector} onChange={e => setData('sector', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">— Sélectionnez —</option>
                    <option>BTP / Construction</option>
                    <option>Promotion Immobilière</option>
                    <option>Travaux Publics</option>
                    <option>Sous-traitance BTP</option>
                    <option>Autre</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
                <textarea rows={3} value={data.message} onChange={e => setData('message', e.target.value)}
                    placeholder="Décrivez votre besoin ou posez vos questions…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>
            <button type="submit" disabled={processing}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition">
                {processing ? 'Envoi en cours…' : 'Demander une démo gratuite →'}
            </button>
        </form>
    );
}

export default function Welcome({ auth, canLogin, canRegister, plans = [], faqs = [] }) {
    return (
        <>
            <Head>
                <title>CONSTRUIRO — ERP BTP pour l'Afrique | Gestion de chantiers digitalisée</title>
                <meta name="description" content="CONSTRUIRO est l'ERP BTP conçu pour les entreprises africaines. Gérez vos projets, chantiers, RH, stock, équipements, finance et comptabilité depuis une seule plateforme." />
                <meta property="og:title" content="CONSTRUIRO — ERP BTP pour l'Afrique" />
                <meta property="og:description" content="15+ modules intégrés pour digitaliser votre entreprise de construction. Essai gratuit 14 jours." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://construiro.com" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="CONSTRUIRO — ERP BTP pour l'Afrique" />
                <meta name="twitter:description" content="15+ modules intégrés pour digitaliser votre entreprise de construction." />
            </Head>
            <div className="min-h-screen bg-white font-sans text-gray-800">

                {/* NAV */}
                <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-orange-600 tracking-tight">CONSTRUIRO</span>
                            <span className="hidden sm:inline text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">ERP BTP</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="#modules" className="hidden md:block text-sm text-gray-600 hover:text-orange-600">Modules</a>
                            <a href="#tarifs" className="hidden md:block text-sm text-gray-600 hover:text-orange-600">Tarifs</a>
                            <a href="#demo" className="hidden md:block text-sm text-gray-600 hover:text-orange-600">Démo</a>
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
                <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                                🌍 Conçu pour l'Afrique — Disponible en français et anglais
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                                L'ERP BTP pensé<br />
                                <span className="text-amber-200">pour l'Afrique</span>
                            </h1>
                            <p className="text-xl text-orange-100 mb-8 max-w-2xl">
                                Gérez vos chantiers, vos équipes, vos stocks et votre finance depuis une seule plateforme.
                                15+ modules intégrés, déployés en 48h, sans équipe informatique.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a href="#demo" className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg">
                                    Demander une démo gratuite
                                </a>
                                {canRegister && (
                                    <Link href={route('register')} className="border-2 border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl text-lg transition">
                                        Essai 14 jours gratuit →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <section className="bg-slate-900 text-white py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                            {[
                                { val: '15+', label: 'Modules métier BTP' },
                                { val: '100%', label: 'Données sécurisées' },
                                { val: '14j', label: 'Essai gratuit' },
                                { val: '48h', label: 'Déploiement garanti' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <div className="text-3xl font-black text-orange-400">{s.val}</div>
                                    <div className="text-slate-300 text-sm mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* AUDIENCES */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-black text-center text-gray-900 mb-3">Pour qui est CONSTRUIRO ?</h2>
                        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Une solution adaptée à tous les acteurs de la construction africaine.</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {audiences.map((a) => (
                                <div key={a.titre} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition">
                                    <div className="text-3xl mb-3">{a.icon}</div>
                                    <h3 className="font-bold text-gray-900 mb-2">{a.titre}</h3>
                                    <p className="text-sm text-gray-500">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* MODULES */}
                <section id="modules" className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-black text-center text-gray-900 mb-3">15+ Modules intégrés</h2>
                        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">De la planification à la comptabilité, tout est connecté en temps réel.</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.map((m) => (
                                <div key={m.titre} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-orange-50/30 p-6 hover:border-orange-200 hover:shadow-md transition">
                                    <div className="text-3xl mb-3">{m.icon}</div>
                                    <h3 className="font-bold text-gray-900 mb-2">{m.titre}</h3>
                                    <p className="text-sm text-gray-500">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* WHY */}
                <section className="py-16 bg-orange-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Pourquoi CONSTRUIRO ?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: '🌍', titre: 'Fait pour l\'Afrique', desc: 'Devises locales (XOF, XAF, GNF, USD…), multi-pays, fuseau horaire par agence, fiscal adapté.' },
                                { icon: '🔒', titre: 'Données sécurisées', desc: 'Isolation stricte par entreprise. Chaque client voit uniquement ses données. Sauvegarde automatique.' },
                                { icon: '⚡', titre: 'Déployé en 48h', desc: 'Pas d\'équipe informatique requise. Configuration guidée, support dédié à l\'onboarding.' },
                            ].map((r) => (
                                <div key={r.titre} className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl">{r.icon}</div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">{r.titre}</h3>
                                    <p className="text-gray-500 text-sm">{r.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TARIFS */}
                <section id="tarifs" className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-black text-center text-gray-900 mb-3">Tarifs transparents</h2>
                        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Payez en FCFA. Pas de frais cachés. Annulez à tout moment.</p>
                        {plans.length > 0 ? (
                            <div className="grid md:grid-cols-3 gap-6">
                                {plans.map((plan, i) => (
                                    <div key={plan.id} className={`rounded-2xl border-2 p-8 flex flex-col ${i === 1 ? 'border-orange-500 shadow-xl relative' : 'border-gray-100'}`}>
                                        {i === 1 && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                                                RECOMMANDÉ
                                            </div>
                                        )}
                                        <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                                        {plan.description && <p className="text-sm text-gray-500 mb-4">{plan.description}</p>}
                                        <div className="mb-6">
                                            <span className="text-3xl font-black text-orange-600">{formatXOF(plan.price_monthly)}</span>
                                            <span className="text-gray-400 text-sm">/mois</span>
                                        </div>
                                        <ul className="space-y-2 text-sm text-gray-600 flex-1 mb-6">
                                            <li>✅ {plan.max_users >= 9999 ? 'Utilisateurs illimités' : `${plan.max_users} utilisateurs`}</li>
                                            <li>✅ {plan.max_projects >= 9999 ? 'Projets illimités' : `${plan.max_projects} projets`}</li>
                                            <li>✅ 15+ modules BTP inclus</li>
                                            {plan.trial_days > 0 && <li>🎁 {plan.trial_days} jours d'essai gratuit</li>}
                                        </ul>
                                        <a href="#demo" className={`block text-center py-3 rounded-xl font-semibold transition ${i === 1 ? 'bg-orange-600 text-white hover:bg-orange-700' : 'border-2 border-orange-600 text-orange-600 hover:bg-orange-50'}`}>
                                            Commencer l'essai gratuit
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">Contactez-nous pour un devis personnalisé.</p>
                                <a href="#demo" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition">
                                    Demander un devis
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                {/* TEMOIGNAGES */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Ce que disent nos clients</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {temoignages.map((t) => (
                                <div key={t.nom} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => <span key={i} className="text-orange-400">★</span>)}
                                    </div>
                                    <p className="text-gray-600 italic mb-4">"{t.texte}"</p>
                                    <div>
                                        <p className="font-bold text-gray-900">{t.nom}</p>
                                        <p className="text-sm text-gray-400">{t.poste}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                {faqs.length > 0 && (
                    <section className="py-16 bg-white">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Questions fréquentes</h2>
                            <div className="space-y-4">
                                {faqs.map((faq, i) => (
                                    <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                                        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-orange-50 transition list-none">
                                            {faq.question}
                                            <span className="ml-4 text-orange-500 group-open:rotate-45 transition-transform text-xl">+</span>
                                        </summary>
                                        <div className="px-5 pb-4 text-gray-500 text-sm">{faq.answer}</div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* DEMO FORM */}
                <section id="demo" className="py-16 bg-gradient-to-br from-orange-600 to-amber-500">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-black text-white text-center mb-3">Demandez une démo gratuite</h2>
                        <p className="text-orange-100 text-center mb-10">Notre équipe vous répond sous 24h ouvrées pour organiser une démonstration personnalisée.</p>
                        <div className="bg-white rounded-2xl p-8 shadow-xl">
                            <DemoForm />
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-slate-900 text-slate-400 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="text-white font-black text-xl">CONSTRUIRO</span>
                                <p className="text-xs mt-1">© {new Date().getFullYear()} IBIG Soft — IBIG SARL · Tous droits réservés</p>
                            </div>
                            <div className="flex gap-6 text-sm">
                                <Link href="/legal/cgu" className="hover:text-orange-400 transition">CGU</Link>
                                <Link href="/legal/privacy" className="hover:text-orange-400 transition">Confidentialité</Link>
                                <Link href="/legal/legal" className="hover:text-orange-400 transition">Mentions légales</Link>
                                <Link href="/legal/cookies" className="hover:text-orange-400 transition">Cookies</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
