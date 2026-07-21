import { Head, Link } from '@inertiajs/react';
import ConstruiroLogo from '@/Components/ConstruiroLogo';
import { useTrans } from '@/i18n';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

export default function Aide() {
    const { t } = useTrans();

    const FAQS = [
        { q: t('Comment démarrer mon essai gratuit ?'), r: t('Cliquez sur "Essai gratuit" depuis la page d\'accueil. Votre espace est créé instantanément, sans carte bancaire requise. Vous disposez de 14 jours pour tester toutes les fonctionnalités.') },
        { q: t('Quels modules sont inclus dans l\'essai ?'), r: t('Tous les modules sont inclus dans l\'essai : Projets, RH, Finance, Stocks, Équipements, Devis, HSE, Bureau d\'études, BI et SARA l\'assistante IA.') },
        { q: t('Comment importer mes données existantes ?'), r: t('CONSTRUIRO propose des imports CSV/Excel pour les projets, clients, fournisseurs, employés et matériaux. Notre équipe vous accompagne lors de l\'onboarding.') },
        { q: t('CONSTRUIRO fonctionne-t-il hors connexion ?'), r: t('CONSTRUIRO est une PWA installable sur mobile et tablette. Certaines fonctions de consultation sont accessibles hors ligne, la synchronisation se fait automatiquement à la reconnexion.') },
        { q: t('Puis-je utiliser CONSTRUIRO depuis mon smartphone ?'), r: t('Oui, CONSTRUIRO est 100% responsive et installable comme application native (PWA) sur Android et iOS depuis votre navigateur.') },
        { q: t('Quelles devises sont supportées ?'), r: t('CONSTRUIRO supporte le FCFA (XOF), USD, EUR et d\'autres devises africaines. La configuration se fait par entreprise.') },
        { q: t('Comment contacter le support ?'), r: t('Via WhatsApp au +225 27 22 27 60 14, par email à contact@ibigsoft.com, ou en ouvrant un ticket depuis votre espace client.') },
        { q: t('Mes données sont-elles sécurisées ?'), r: t('Oui. Toutes les communications sont chiffrées HTTPS, les données sont sauvegardées quotidiennement, et l\'accès est protégé par un système de rôles et permissions granulaires.') },
    ];

    const GUIDES = [
        { titre: t('Démarrage rapide'), desc: t('Créez votre organisation, invitez vos équipes et lancez votre premier projet en 15 minutes.'), emoji: '🚀', href: '/guide/fr' },
        { titre: t('Gestion de projets'), desc: t('Planning Gantt, jalons, pointage d\'équipes et journal de chantier.'), emoji: '🏗️', href: '/guide/fr' },
        { titre: t('Finance & Facturation'), desc: t('Devis, factures, encaissements, décaissements et comptabilité analytique.'), emoji: '💰', href: '/guide/fr' },
        { titre: t('Ressources humaines'), desc: t('Employés, présences, congés, contrats et fiches de paie FCFA.'), emoji: '👥', href: '/guide/fr' },
        { titre: t('Stocks & Matériaux'), desc: t('Entrepôts, bons de commande, livraisons et inventaires en temps réel.'), emoji: '📦', href: '/guide/fr' },
        { titre: t('Assistant IA SARA'), desc: t('Comment utiliser SARA pour piloter votre ERP grâce à l\'intelligence artificielle.'), emoji: '🤖', href: '/guide/fr' },
    ];

    return (
        <>
            <Head title={t("Centre d'aide — CONSTRUIRO ERP")} />
            <div className="min-h-screen" style={{ background: '#f8f9fb', color: NAVY }}>

                {/* Header */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <Link href="/"><ConstruiroLogo size="sm" /></Link>
                        <div className="flex items-center gap-4">
                            <a href="tel:+2252722276014" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition">
                                📞 +225 27 22 27 60 14
                            </a>
                            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">{t('← Accueil')}</Link>
                            <Link href={route('login')}
                                className="text-sm font-bold px-4 py-2 rounded-xl text-white transition hover:opacity-90"
                                style={{ background: BRAND }}>
                                {t('Mon espace')}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="py-16 text-center" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #2d2d2d 100%)` }}>
                    <div className="max-w-3xl mx-auto px-4">
                        <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>{t("Centre d'aide")}</p>
                        <h1 className="text-4xl font-black text-white mb-4">{t('Comment pouvons-nous vous aider ?')}</h1>
                        <p className="text-gray-400 mb-8">{t("Guides, FAQ, tutoriels et support — tout ce dont vous avez besoin pour maîtriser CONSTRUIRO ERP.")}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a href="https://wa.me/2252722276014?text=Bonjour%20IBIG%20Soft%2C%20j%27ai%20besoin%20d%27aide%20avec%20CONSTRUIRO%20ERP."
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition hover:opacity-90"
                                style={{ background: '#25D366' }}>
                                {t('💬 WhatsApp support')}
                            </a>
                            <a href="mailto:contact@ibigsoft.com"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition hover:opacity-90"
                                style={{ background: BRAND, color: '#fff' }}>
                                {t('📧 Envoyer un email')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Guides */}
                <section className="py-16">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-black mb-8 text-center" style={{ color: NAVY }}>{t('Guides & Tutoriels')}</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {GUIDES.map((g) => (
                                <a key={g.titre} href={g.href}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all group">
                                    <div className="text-3xl mb-3">{g.emoji}</div>
                                    <h3 className="font-bold text-base mb-2 group-hover:text-orange-500 transition" style={{ color: NAVY }}>{g.titre}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{g.desc}</p>
                                    <span className="inline-block mt-3 text-xs font-bold" style={{ color: BRAND }}>{t('Lire le guide →')}</span>
                                </a>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <a href="/guide/fr"
                                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition hover:opacity-90"
                                style={{ background: BRAND }}>
                                {t('📥 Télécharger le guide complet PDF')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 bg-white">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-black mb-8 text-center" style={{ color: NAVY }}>{t('Questions fréquentes')}</h2>
                        <div className="space-y-3">
                            {FAQS.map((faq, i) => (
                                <details key={i} className="group border border-gray-100 rounded-2xl overflow-hidden bg-white">
                                    <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold list-none hover:bg-orange-50/50 transition" style={{ color: NAVY }}>
                                        {faq.q}
                                        <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0">▾</span>
                                    </summary>
                                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">{faq.r}</div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="py-16" style={{ background: '#f8f9fb' }}>
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-2xl font-black mb-3" style={{ color: NAVY }}>{t("Vous n'avez pas trouvé votre réponse ?")}</h2>
                        <p className="text-gray-500 mb-8">{t('Notre équipe est disponible du lundi au vendredi de 8h à 18h (GMT).')}</p>
                        <div className="grid sm:grid-cols-3 gap-5">
                            {[
                                { emoji: '💬', titre: 'WhatsApp', desc: '+225 27 22 27 60 14', href: 'https://wa.me/2252722276014', ext: true },
                                { emoji: '📧', titre: t('Email'), desc: 'contact@ibigsoft.com', href: 'mailto:contact@ibigsoft.com', ext: false },
                                { emoji: '📞', titre: t('Téléphone'), desc: '+225 27 22 27 60 14', href: 'tel:+2252722276014', ext: false },
                            ].map((c) => (
                                <a key={c.titre} href={c.href} target={c.ext ? '_blank' : undefined} rel={c.ext ? 'noopener noreferrer' : undefined}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all text-center group">
                                    <div className="text-3xl mb-3">{c.emoji}</div>
                                    <div className="font-bold mb-1 group-hover:text-orange-500 transition" style={{ color: NAVY }}>{c.titre}</div>
                                    <div className="text-sm text-gray-500">{c.desc}</div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer minimal */}
                <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} IBIG Soft — <a href="/" className="hover:underline">construiro.com</a>
                    {' · '}<a href="/legal/cgu" className="hover:underline">{t('CGU')}</a>
                    {' · '}<a href="/legal/confidentialite" className="hover:underline">{t('Confidentialité')}</a>
                </footer>
            </div>
        </>
    );
}
