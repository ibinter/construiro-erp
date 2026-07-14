import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

const TOUR_KEY = 'construiro_tour_done_v1';

const STEPS = [
    {
        target: '[data-tour="sidebar"]',
        title: 'Navigation principale',
        body: 'Le menu latéral vous donne accès à tous les modules : Projets, Facturation, RH, Trésorerie, BI… Cliquez sur le logo pour le réduire.',
        position: 'right',
    },
    {
        target: '[data-tour="dashboard-stats"]',
        title: 'Tableau de bord',
        body: 'Cette section affiche vos indicateurs clés en temps réel : projets actifs, chiffre d\'affaires, employés, alertes stock.',
        position: 'bottom',
    },
    {
        target: '[data-tour="notifications"]',
        title: 'Notifications',
        body: 'La cloche vous informe des événements importants : paiements reçus, tâches en retard, tickets support.',
        position: 'bottom',
    },
    {
        target: '[data-tour="user-menu"]',
        title: 'Mon profil & abonnement',
        body: 'Accédez à votre profil, gérez votre abonnement ou contactez le support depuis ce menu.',
        position: 'bottom-left',
    },
    {
        target: '[data-tour="bottom-nav"]',
        title: 'Navigation mobile',
        body: 'Sur mobile, cette barre fixe vous donne accès en un tap aux 4 sections les plus utilisées.',
        position: 'top',
    },
    {
        target: null, // étape finale sans cible
        title: 'Vous êtes prêt !',
        body: 'Commencez par créer votre premier projet ou importer vos données existantes. Notre guide complet est disponible dans Aide → Télécharger le guide.',
        position: 'center',
        actions: [
            { label: 'Créer un projet', href: '/projects/create', variant: 'primary' },
            { label: 'Importer des données', href: '/import', variant: 'secondary' },
        ],
    },
];

export default function GuidedTour({ autoStart = false }) {
    const { t } = useTrans();
    const [active, setActive]     = useState(false);
    const [stepIdx, setStepIdx]   = useState(0);
    const [coords, setCoords]     = useState(null);
    const overlayRef = useRef();

    useEffect(() => {
        if (autoStart && !localStorage.getItem(TOUR_KEY)) {
            // Léger délai pour que le DOM soit chargé
            const id = setTimeout(() => setActive(true), 1200);
            return () => clearTimeout(id);
        }
    }, [autoStart]);

    useEffect(() => {
        if (!active) return;
        positionStep();
    }, [active, stepIdx]);

    const positionStep = () => {
        const step = STEPS[stepIdx];
        if (!step.target) {
            setCoords({ center: true });
            return;
        }
        const el = document.querySelector(step.target);
        if (!el) {
            setCoords({ center: true });
            return;
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = el.getBoundingClientRect();
        setCoords({ rect, position: step.position });
    };

    const finish = () => {
        localStorage.setItem(TOUR_KEY, '1');
        setActive(false);
    };

    const next = () => {
        if (stepIdx < STEPS.length - 1) {
            setStepIdx(s => s + 1);
        } else {
            finish();
        }
    };

    const prev = () => stepIdx > 0 && setStepIdx(s => s - 1);

    if (!active) {
        return (
            <button
                onClick={() => { setStepIdx(0); setActive(true); }}
                className="fixed bottom-20 right-4 z-40 flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-orange-600 lg:bottom-6"
                title={t('Visite guidée')}
            >
                <Icon name="compass" className="h-3.5 w-3.5" />
                {t('Visite guidée')}
            </button>
        );
    }

    const step = STEPS[stepIdx];

    // Calcul de la position du tooltip
    const tooltipStyle = {};
    if (coords?.center) {
        tooltipStyle.top = '50%';
        tooltipStyle.left = '50%';
        tooltipStyle.transform = 'translate(-50%, -50%)';
    } else if (coords?.rect) {
        const r = coords.rect;
        const pos = coords.position ?? 'bottom';
        const gap = 12;
        if (pos === 'bottom') {
            tooltipStyle.top  = r.bottom + gap + window.scrollY;
            tooltipStyle.left = r.left + r.width / 2;
            tooltipStyle.transform = 'translateX(-50%)';
        } else if (pos === 'top') {
            tooltipStyle.bottom = window.innerHeight - r.top + gap;
            tooltipStyle.left   = r.left + r.width / 2;
            tooltipStyle.transform = 'translateX(-50%)';
            tooltipStyle.top    = 'auto';
        } else if (pos === 'right') {
            tooltipStyle.top  = r.top + r.height / 2 + window.scrollY;
            tooltipStyle.left = r.right + gap;
            tooltipStyle.transform = 'translateY(-50%)';
        } else if (pos === 'bottom-left') {
            tooltipStyle.top  = r.bottom + gap + window.scrollY;
            tooltipStyle.left = r.right;
            tooltipStyle.transform = 'translateX(-80%)';
        }
    }

    // Highlight de l'élément cible
    const highlightStyle = {};
    if (coords?.rect && !coords.center) {
        const r  = coords.rect;
        const pad = 6;
        highlightStyle.position = 'fixed';
        highlightStyle.top    = r.top - pad;
        highlightStyle.left   = r.left - pad;
        highlightStyle.width  = r.width + pad * 2;
        highlightStyle.height = r.height + pad * 2;
        highlightStyle.borderRadius = '8px';
        highlightStyle.boxShadow = '0 0 0 9999px rgba(0,0,0,0.55)';
        highlightStyle.zIndex = 9998;
        highlightStyle.pointerEvents = 'none';
    }

    return (
        <>
            {/* Overlay sombre quand pas d'élément cible */}
            {coords?.center && (
                <div className="fixed inset-0 z-[9997] bg-black/60" onClick={finish} />
            )}

            {/* Highlight de l'élément */}
            {!coords?.center && <div style={highlightStyle} />}

            {/* Tooltip */}
            <div
                className="fixed z-[9999] w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                style={tooltipStyle}
            >
                {/* En-tête */}
                <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-orange-500">
                            {t('Étape')} {stepIdx + 1}/{STEPS.length}
                        </span>
                        <h3 className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                            {t(step.title)}
                        </h3>
                    </div>
                    <button onClick={finish} className="shrink-0 text-slate-400 hover:text-slate-600">
                        <Icon name="x" className="h-4 w-4" />
                    </button>
                </div>

                {/* Corps */}
                <p className="mb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {t(step.body)}
                </p>

                {/* Actions personnalisées (dernière étape) */}
                {step.actions && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {step.actions.map((a, i) => (
                            <a
                                key={i}
                                href={a.href}
                                onClick={finish}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                    a.variant === 'primary'
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200'
                                }`}
                            >
                                {t(a.label)}
                            </a>
                        ))}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                        {STEPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStepIdx(i)}
                                className={`h-1.5 rounded-full transition-all ${
                                    i === stepIdx
                                        ? 'w-5 bg-orange-500'
                                        : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {stepIdx > 0 && (
                            <button
                                onClick={prev}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                            >
                                {t('Précédent')}
                            </button>
                        )}
                        <button
                            onClick={stepIdx === STEPS.length - 1 ? finish : next}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                        >
                            {stepIdx === STEPS.length - 1 ? t('Terminer') : t('Suivant')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
