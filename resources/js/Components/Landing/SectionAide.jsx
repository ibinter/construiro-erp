import { useTrans } from '@/i18n';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';

const IconBook = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
);

const IconTicket = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z"/>
        <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2"/>
    </svg>
);

const IconBot = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2z"/>
        <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/>
        <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/>
    </svg>
);

export default function SectionAide({ onOpenSara }) {
    const { t } = useTrans();

    const cartes = [
        {
            icon: <IconBook />,
            titre: 'Documentation',
            desc: "Guide complet et tutoriels pas à pas pour maîtriser chaque module.",
            badge: 'Accès gratuit',
            badgeColor: '#22c55e',
            action: { label: 'Consulter le guide →', href: '/aide', onClick: null },
        },
        {
            icon: <IconTicket />,
            titre: 'Support ticket',
            desc: "Notre équipe vous répond en moins de 4h en semaine. Décrivez votre besoin.",
            badge: '< 4h en semaine',
            badgeColor: BRAND,
            action: { label: 'Ouvrir un ticket →', href: '/aide#contact', onClick: null },
        },
        {
            icon: <IconBot />,
            titre: 'Chat SARA',
            desc: "Notre assistante IA répond à vos questions 24h/24, 7j/7, en français et en anglais.",
            badge: '24h/24 · 7j/7',
            badgeColor: '#6366f1',
            action: { label: 'Parler à SARA →', href: null, onClick: onOpenSara },
        },
    ];

    return (
        <section id="aide-vitrine" className="py-20 bg-orange-50/30 dark:bg-white/5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: BRAND }}>
                        {t('Assistance')}
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: NAVY }}>
                        {t('Besoin d\'aide ? Nous sommes là.')}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        {t('Documentation complète, support humain ou IA — choisissez la façon dont vous souhaitez être aidé.')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {cartes.map((carte) => (
                        <div
                            key={carte.titre}
                            className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-200 flex flex-col gap-5"
                        >
                            {/* Icône */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(245,130,32,0.1)', color: BRAND }}
                            >
                                {carte.icon}
                            </div>

                            {/* Contenu */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-black text-base" style={{ color: NAVY }}>
                                        {t(carte.titre)}
                                    </h3>
                                    <span
                                        className="text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                                        style={{
                                            background: `${carte.badgeColor}18`,
                                            color: carte.badgeColor,
                                        }}
                                    >
                                        {t(carte.badge)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{t(carte.desc)}</p>
                            </div>

                            {/* CTA */}
                            {carte.action.onClick ? (
                                <button
                                    onClick={carte.action.onClick}
                                    className="inline-flex items-center gap-1.5 text-sm font-bold transition hover:opacity-75"
                                    style={{ color: BRAND }}
                                >
                                    {t(carte.action.label)}
                                </button>
                            ) : (
                                <a
                                    href={carte.action.href}
                                    className="inline-flex items-center gap-1.5 text-sm font-bold transition hover:opacity-75"
                                    style={{ color: BRAND }}
                                >
                                    {t(carte.action.label)}
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
