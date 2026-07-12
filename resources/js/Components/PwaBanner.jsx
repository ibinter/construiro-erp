import { useState, useEffect } from 'react';

const BRAND = '#F58220';
const NAVY  = '#1E1E1E';
const STORAGE_KEY = 'construiro-pwa-banner';

export default function PwaBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [show, setShow]                     = useState(false);
    const [isIos, setIsIos]                   = useState(false);
    const [isInstalled, setIsInstalled]       = useState(false);
    const [updateAvail, setUpdateAvail]       = useState(false);

    useEffect(() => {
        // Déjà installée ?
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Préférence mémorisée
        const pref = localStorage.getItem(STORAGE_KEY);
        if (pref === 'dismissed') return;

        // iOS
        const ua = navigator.userAgent;
        const ios = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
        setIsIos(ios);

        // Android / Desktop : écouter l'événement beforeinstallprompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setTimeout(() => setShow(true), 3000);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // iOS : afficher quand même (instructions manuelles)
        if (ios) setTimeout(() => setShow(true), 4000);

        // Notification de mise à jour SW
        const swUpdate = () => setUpdateAvail(true);
        window.addEventListener('sw-update-available', swUpdate);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('sw-update-available', swUpdate);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setIsInstalled(true);
        setDeferredPrompt(null);
        dismiss();
    };

    const dismiss = (permanent = false) => {
        setShow(false);
        if (permanent) localStorage.setItem(STORAGE_KEY, 'dismissed');
    };

    const handleUpdate = () => {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
    };

    // Mise à jour disponible — prioritaire
    if (updateAvail) {
        return (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-md px-4">
                <div className="rounded-2xl p-4 flex items-center gap-4 shadow-2xl"
                    style={{ background: NAVY, border: `1px solid rgba(245,130,32,0.3)` }}>
                    <span className="text-2xl flex-shrink-0">🔄</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold">Mise à jour disponible</p>
                        <p className="text-gray-400 text-xs mt-0.5">Une nouvelle version de CONSTRUIRO est prête.</p>
                    </div>
                    <button onClick={handleUpdate}
                        className="flex-shrink-0 px-4 py-2 rounded-xl font-bold text-white text-sm"
                        style={{ background: BRAND }}>
                        Mettre à jour
                    </button>
                </div>
            </div>
        );
    }

    if (!show || isInstalled) return null;

    // Instructions iOS
    if (isIos) {
        return (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-md px-4">
                <div className="rounded-2xl p-5 shadow-2xl relative"
                    style={{ background: NAVY, border: `1px solid rgba(245,130,32,0.3)` }}>
                    <button onClick={() => dismiss(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">📲</span>
                        <div>
                            <p className="text-white font-bold text-sm">Installer CONSTRUIRO</p>
                            <p className="text-gray-400 text-xs">Accès rapide depuis votre écran d'accueil</p>
                        </div>
                    </div>
                    <div className="rounded-xl p-3 text-sm text-gray-300 space-y-2"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <p>1. Appuyez sur <strong className="text-white">Partager</strong> <span>⎙</span> en bas de Safari</p>
                        <p>2. Faites défiler et appuyez sur <strong className="text-white">"Sur l'écran d'accueil"</strong></p>
                        <p>3. Appuyez sur <strong className="text-white">Ajouter</strong></p>
                    </div>
                    <button onClick={() => dismiss(true)} className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition">
                        Ne plus afficher
                    </button>
                </div>
            </div>
        );
    }

    // Android / Desktop
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-full max-w-md px-4">
            <div className="rounded-2xl p-4 shadow-2xl"
                style={{ background: NAVY, border: `1px solid rgba(245,130,32,0.3)` }}>
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl flex-shrink-0">📱</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">Installer CONSTRUIRO</p>
                        <p className="text-gray-400 text-xs mt-0.5">Accès plus rapide depuis votre écran d'accueil</p>
                    </div>
                    <button onClick={() => dismiss(false)} className="flex-shrink-0 text-gray-500 hover:text-white p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleInstall}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm transition hover:opacity-90"
                        style={{ background: BRAND }}>
                        Installer maintenant
                    </button>
                    <button onClick={() => dismiss(false)}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition"
                        style={{ background: 'rgba(255,255,255,0.07)' }}>
                        Plus tard
                    </button>
                    <button onClick={() => dismiss(true)}
                        className="px-3 py-2.5 rounded-xl text-xs text-gray-600 hover:text-gray-400 transition"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                        title="Ne plus afficher">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
