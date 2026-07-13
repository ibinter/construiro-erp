import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

const BRAND = '#F58220';
const STORAGE_KEY = 'construiro-cookies-consent';

const CATEGORIES_FR = [
    {
        id: 'necessary',
        label: 'Nécessaires',
        description: 'Indispensables au fonctionnement du site (session, CSRF, sécurité).',
        required: true,
        examples: 'session, XSRF-TOKEN',
    },
    {
        id: 'preferences',
        label: 'Préférences',
        description: "Mémorisent vos choix d'interface : langue, thème, affichage.",
        required: false,
        examples: 'locale, theme',
    },
    {
        id: 'statistics',
        label: 'Statistiques',
        description: "Nous aident à comprendre comment les visiteurs utilisent le site.",
        required: false,
        examples: 'analytics, _ga',
    },
    {
        id: 'marketing',
        label: 'Marketing',
        description: "Personnalisent les annonces et mesurent l'efficacité des campagnes.",
        required: false,
        examples: 'fbp, _gcl_au',
    },
    {
        id: 'ai',
        label: 'IA & Personnalisation',
        description: "Permettent à SARA de mémoriser le contexte de vos conversations.",
        required: false,
        examples: 'sara_session, ai_prefs',
    },
    {
        id: 'external',
        label: 'Contenus externes',
        description: "Nécessaires pour les contenus intégrés (vidéos, cartes, widgets).",
        required: false,
        examples: 'YouTube, Google Maps',
    },
];

const CATEGORIES_EN = [
    { id: 'necessary',   label: 'Necessary',          description: 'Essential for site operation (session, CSRF, security).',      required: true,  examples: 'session, XSRF-TOKEN' },
    { id: 'preferences', label: 'Preferences',         description: 'Remember your interface choices: language, theme, display.',    required: false, examples: 'locale, theme' },
    { id: 'statistics',  label: 'Statistics',          description: 'Help us understand how visitors use the site.',                required: false, examples: 'analytics, _ga' },
    { id: 'marketing',   label: 'Marketing',           description: 'Personalize ads and measure campaign effectiveness.',          required: false, examples: 'fbp, _gcl_au' },
    { id: 'ai',          label: 'AI & Personalization', description: 'Allow SARA to remember your conversation context.',           required: false, examples: 'sara_session, ai_prefs' },
    { id: 'external',    label: 'External Content',    description: 'Required for embedded content (videos, maps, widgets).',       required: false, examples: 'YouTube, Google Maps' },
];

const defaultConsent = (categories) => {
    const c = {};
    categories.forEach(cat => { c[cat.id] = cat.required; });
    return c;
};

export default function CookiesBanner() {
    const locale = usePage().props?.locale ?? 'fr';
    const isEn = locale === 'en';
    const CATEGORIES = isEn ? CATEGORIES_EN : CATEGORIES_FR;

    const [visible,  setVisible]  = useState(false);
    const [mounted,  setMounted]  = useState(false);
    const [modal,    setModal]    = useState(false);
    const [consent,  setConsent]  = useState(() => defaultConsent(CATEGORIES));
    const [saved,    setSaved]    = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            const t = setTimeout(() => { setVisible(true); setTimeout(() => setMounted(true), 30); }, 1500);
            return () => clearTimeout(t);
        }
        try {
            const parsed = JSON.parse(stored);
            if (parsed.consent) setConsent(parsed.consent);
        } catch {}
    }, []);

    const save = (chosen) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            consent: chosen,
            savedAt: new Date().toISOString(),
            version: '1.1',
        }));
        window.dispatchEvent(new CustomEvent('cookies-consent-updated', { detail: chosen }));
        setConsent(chosen);
        setSaved(true);
        setModal(false);
        setTimeout(() => { setMounted(false); setTimeout(() => setVisible(false), 400); }, 600);
    };

    const acceptAll    = () => { const a = {}; CATEGORIES.forEach(c => { a[c.id] = true; }); save(a); };
    const rejectOpt    = () => save(defaultConsent(CATEGORIES));
    const saveCustom   = () => save({ ...consent });
    const toggle       = (id) => setConsent(prev => ({ ...prev, [id]: !prev[id] }));

    if (!visible) return null;

    const T = {
        title:        isEn ? 'We respect your privacy' : 'Nous respectons votre vie privée',
        body:         isEn
            ? 'CONSTRUIRO uses cookies to ensure the site works properly and, with your consent, to analyze traffic and personalize your experience.'
            : "CONSTRUIRO utilise des cookies pour assurer le bon fonctionnement du site et, avec votre accord, pour analyser notre trafic et personnaliser votre expérience.",
        policyLink:   isEn ? 'Cookie policy' : 'Politique cookies',
        customize:    isEn ? 'Customize' : 'Personnaliser',
        rejectOpt:    isEn ? 'Reject optional' : 'Refuser optionnels',
        acceptAll:    isEn ? 'Accept all' : 'Tout accepter',
        saved:        isEn ? '✓ Preferences saved.' : '✓ Préférences enregistrées.',
        modalTitle:   isEn ? 'Cookie settings' : 'Paramètres des cookies',
        modalSub:     isEn ? 'Manage your privacy preferences' : 'Gérez vos préférences de confidentialité',
        required:     isEn ? 'Required' : 'Requis',
        saveBtn:      isEn ? 'Save my preferences' : 'Enregistrer mes préférences',
        privacyLink:  isEn ? 'Privacy policy' : 'Confidentialité',
    };

    return (
        <>
            <style>{`
                @keyframes cookieSlideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @keyframes cookieSlideDown {
                    from { transform: translateY(0);    opacity: 1; }
                    to   { transform: translateY(100%); opacity: 0; }
                }
                @keyframes cookieFadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* ── Bannière principale ──────────────────────────────── */}
            {!modal && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-[9995]"
                    style={{
                        animation: mounted ? 'cookieSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both' : 'cookieSlideDown 0.35s ease both',
                        background: 'rgba(10,10,14,0.96)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderTop: `3px solid ${BRAND}`,
                        boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
                    }}
                >
                    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                            {/* Icône + texte */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: 'rgba(245,130,32,0.15)', border: '1px solid rgba(245,130,32,0.25)' }}>
                                    <span className="text-lg">🍪</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white font-bold text-sm mb-0.5">{T.title}</p>
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                        {T.body}{' '}
                                        <a href="/legal/cookies"
                                            className="underline transition"
                                            style={{ color: BRAND }}
                                            target="_blank" rel="noopener noreferrer">
                                            {T.policyLink}
                                        </a>
                                    </p>
                                    {saved && (
                                        <p className="text-green-400 text-xs mt-1 font-medium">{T.saved}</p>
                                    )}
                                </div>
                            </div>

                            {/* Boutons */}
                            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => setModal(true)}
                                    className="px-4 py-2 rounded-xl text-xs font-medium transition"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        color: '#cbd5e1',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                >
                                    {T.customize}
                                </button>
                                <button
                                    onClick={rejectOpt}
                                    className="px-4 py-2 rounded-xl text-xs font-medium transition"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        color: '#cbd5e1',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                >
                                    {T.rejectOpt}
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90 active:scale-95"
                                    style={{ background: BRAND, boxShadow: `0 4px 16px rgba(245,130,32,0.35)` }}
                                >
                                    {T.acceptAll}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal personnalisation ──────────────────────────── */}
            {modal && (
                <div className="fixed inset-0 z-[9996] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
                        onClick={() => setModal(false)}
                    />
                    {/* Panneau */}
                    <div
                        className="relative w-full sm:max-w-lg flex flex-col"
                        style={{
                            background: '#0f1117',
                            border: '1px solid rgba(245,130,32,0.2)',
                            borderRadius: '24px 24px 0 0',
                            maxHeight: '92dvh',
                            boxShadow: '0 -24px 80px rgba(0,0,0,0.6)',
                            animation: 'cookieFadeIn 0.3s ease both',
                        }}
                    >
                        {/* Poignée mobile */}
                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}/>
                        </div>

                        {/* En-tête */}
                        <div className="px-6 pt-4 pb-4 flex items-center justify-between flex-shrink-0"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(245,130,32,0.12)', border: '1px solid rgba(245,130,32,0.2)' }}>
                                    <span className="text-base">🍪</span>
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-sm leading-none">{T.modalTitle}</h2>
                                    <p className="text-gray-500 text-xs mt-0.5">{T.modalSub}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModal(false)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                                style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        {/* Liste catégories */}
                        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2.5" style={{ overscrollBehavior: 'contain' }}>
                            {CATEGORIES.map(cat => (
                                <div
                                    key={cat.id}
                                    className="rounded-2xl p-4 flex items-start gap-4"
                                    style={{
                                        background: consent[cat.id] && !cat.required
                                            ? 'rgba(245,130,32,0.06)'
                                            : 'rgba(255,255,255,0.03)',
                                        border: consent[cat.id] && !cat.required
                                            ? '1px solid rgba(245,130,32,0.2)'
                                            : '1px solid rgba(255,255,255,0.06)',
                                        transition: 'background 0.2s, border-color 0.2s',
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white text-xs font-semibold">{cat.label}</span>
                                            {cat.required && (
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                    style={{ background: 'rgba(245,130,32,0.12)', color: BRAND }}>
                                                    {T.required}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-xs leading-relaxed">{cat.description}</p>
                                        <p className="text-gray-700 text-xs mt-1 font-mono">{cat.examples}</p>
                                    </div>
                                    {/* Toggle switch */}
                                    <button
                                        onClick={() => !cat.required && toggle(cat.id)}
                                        disabled={cat.required}
                                        role="switch"
                                        aria-checked={consent[cat.id]}
                                        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2"
                                        style={{
                                            background: consent[cat.id] ? BRAND : 'rgba(255,255,255,0.12)',
                                            opacity: cat.required ? 0.5 : 1,
                                            cursor: cat.required ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <span
                                            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                                            style={{ transform: consent[cat.id] ? 'translateX(20px)' : 'translateX(0)' }}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer modal */}
                        <div className="px-6 py-4 flex-shrink-0 space-y-2.5"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                            <button
                                onClick={saveCustom}
                                className="w-full py-3 rounded-2xl font-bold text-white text-sm transition hover:opacity-90 active:scale-[0.98]"
                                style={{ background: BRAND, boxShadow: `0 4px 20px rgba(245,130,32,0.3)` }}
                            >
                                {T.saveBtn}
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={rejectOpt}
                                    className="flex-1 py-2.5 rounded-2xl text-xs font-medium transition"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#94a3b8',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                >
                                    {T.rejectOpt}
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="flex-1 py-2.5 rounded-2xl text-xs font-medium text-white transition"
                                    style={{
                                        background: 'rgba(245,130,32,0.15)',
                                        border: '1px solid rgba(245,130,32,0.3)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,130,32,0.25)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,130,32,0.15)'}
                                >
                                    {T.acceptAll}
                                </button>
                            </div>
                            <p className="text-gray-700 text-xs text-center">
                                <a href="/legal/cookies" className="hover:text-gray-400 transition">{T.policyLink}</a>
                                {' · '}
                                <a href="/legal/privacy" className="hover:text-gray-400 transition">{T.privacyLink}</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
