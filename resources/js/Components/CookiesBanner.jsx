import { useState, useEffect } from 'react';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';
const STORAGE_KEY = 'construiro-cookies-consent';

const CATEGORIES = [
    {
        id: 'necessary',
        label: 'Nécessaires',
        description: 'Indispensables au fonctionnement du site (session, CSRF, sécurité). Ne peuvent pas être désactivés.',
        required: true,
        examples: 'session, XSRF-TOKEN',
    },
    {
        id: 'preferences',
        label: 'Préférences',
        description: 'Mémorisent vos choix d\'interface : langue, thème, paramètres d\'affichage.',
        required: false,
        examples: 'locale, theme',
    },
    {
        id: 'statistics',
        label: 'Statistiques',
        description: 'Nous aident à comprendre comment les visiteurs interagissent avec le site (pages vues, temps de visite).',
        required: false,
        examples: 'analytics, _ga',
    },
    {
        id: 'marketing',
        label: 'Marketing',
        description: 'Utilisés pour personnaliser les annonces et mesurer l\'efficacité des campagnes publicitaires.',
        required: false,
        examples: 'fbp, _gcl_au',
    },
    {
        id: 'ai',
        label: 'IA & Personnalisation',
        description: 'Permettent à SARA (notre IA) de mémoriser le contexte de vos conversations et d\'améliorer ses réponses.',
        required: false,
        examples: 'sara_session, ai_prefs',
    },
    {
        id: 'external',
        label: 'Contenus externes',
        description: 'Nécessaires pour afficher des contenus intégrés (vidéos, cartes, widgets tiers).',
        required: false,
        examples: 'YouTube, Google Maps',
    },
];

const defaultConsent = () => {
    const c = {};
    CATEGORIES.forEach(cat => { c[cat.id] = cat.required; });
    return c;
};

export default function CookiesBanner() {
    const [visible, setVisible]       = useState(false);
    const [modal, setModal]           = useState(false);
    const [consent, setConsent]       = useState(defaultConsent());
    const [saved, setSaved]           = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            setTimeout(() => setVisible(true), 1200);
        } else {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.consent) setConsent(parsed.consent);
            } catch {}
        }
    }, []);

    const save = (chosenConsent) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            consent: chosenConsent,
            savedAt: new Date().toISOString(),
            version: '1.0',
        }));
        window.dispatchEvent(new CustomEvent('cookies-consent-updated', { detail: chosenConsent }));
        setConsent(chosenConsent);
        setSaved(true);
        setModal(false);
        setTimeout(() => setVisible(false), 800);
    };

    const acceptAll = () => {
        const all = {};
        CATEGORIES.forEach(cat => { all[cat.id] = true; });
        save(all);
    };

    const rejectOptional = () => {
        save(defaultConsent());
    };

    const saveCustom = () => {
        save({ ...consent });
    };

    const toggle = (id) => {
        setConsent(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!visible) return null;

    return (
        <>
            {/* Bannière principale */}
            {!modal && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-[9999]"
                    style={{ background: 'rgba(10,10,10,0.97)', borderTop: `3px solid ${BRAND}` }}
                >
                    <div className="max-w-6xl mx-auto px-4 py-5 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Texte */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">🍪</span>
                                    <p className="text-white font-bold text-sm">Nous respectons votre vie privée</p>
                                </div>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    CONSTRUIRO utilise des cookies pour assurer le bon fonctionnement du site et, avec votre accord, pour analyser notre trafic et personnaliser votre expérience.{' '}
                                    <a href="/legal/cookies" className="underline hover:text-orange-400 transition" style={{ color: BRAND }}>
                                        Politique cookies
                                    </a>
                                </p>
                            </div>
                            {/* Boutons */}
                            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => setModal(true)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition border border-gray-700 hover:border-gray-500"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    Personnaliser
                                </button>
                                <button
                                    onClick={rejectOptional}
                                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition border border-gray-700 hover:border-gray-500"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    Refuser optionnels
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                                    style={{ background: BRAND }}
                                >
                                    Tout accepter
                                </button>
                            </div>
                        </div>
                        {saved && (
                            <p className="text-xs mt-2 text-green-400">✓ Vos préférences ont été enregistrées.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Modal personnalisation */}
            {modal && (
                <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.75)' }}
                        onClick={() => setModal(false)}
                    />
                    {/* Panneau */}
                    <div
                        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
                        style={{ background: '#111', border: `1px solid rgba(245,130,32,0.25)`, maxHeight: '90vh' }}
                    >
                        {/* En-tête */}
                        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-white font-bold text-base">Paramètres des cookies</h2>
                                    <p className="text-gray-500 text-xs mt-0.5">Gérez vos préférences de confidentialité</p>
                                </div>
                                <button
                                    onClick={() => setModal(false)}
                                    className="text-gray-600 hover:text-white p-1.5 rounded-lg transition"
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Liste catégories */}
                        <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: '50vh' }}>
                            {CATEGORIES.map(cat => (
                                <div
                                    key={cat.id}
                                    className="rounded-xl p-4 flex items-start gap-4"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white text-sm font-semibold">{cat.label}</span>
                                            {cat.required && (
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                    style={{ background: 'rgba(245,130,32,0.15)', color: BRAND }}>
                                                    Requis
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-xs leading-relaxed">{cat.description}</p>
                                        <p className="text-gray-600 text-xs mt-1">Ex : {cat.examples}</p>
                                    </div>
                                    {/* Toggle */}
                                    <button
                                        onClick={() => !cat.required && toggle(cat.id)}
                                        disabled={cat.required}
                                        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200 focus:outline-none ${cat.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        style={{ background: consent[cat.id] ? BRAND : 'rgba(255,255,255,0.15)' }}
                                        aria-checked={consent[cat.id]}
                                        role="switch"
                                    >
                                        <span
                                            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                                            style={{ transform: consent[cat.id] ? 'translateX(20px)' : 'translateX(0)' }}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer modal */}
                        <div className="px-6 pb-6 pt-4 border-t space-y-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <button
                                onClick={saveCustom}
                                className="w-full py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90"
                                style={{ background: BRAND }}
                            >
                                Enregistrer mes préférences
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={rejectOptional}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition border border-gray-700"
                                    style={{ background: 'rgba(255,255,255,0.04)' }}
                                >
                                    Refuser optionnels
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white transition"
                                    style={{ background: 'rgba(245,130,32,0.2)', border: `1px solid rgba(245,130,32,0.4)` }}
                                >
                                    Tout accepter
                                </button>
                            </div>
                            <p className="text-gray-600 text-xs text-center">
                                <a href="/legal/cookies" className="hover:text-gray-400 transition">Politique de cookies</a>
                                {' · '}
                                <a href="/legal/privacy" className="hover:text-gray-400 transition">Confidentialité</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
