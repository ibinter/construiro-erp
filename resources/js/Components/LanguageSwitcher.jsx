import { router, usePage } from '@inertiajs/react';

/**
 * Sélecteur de langue FR / EN. Poste vers /locale/{code} puis Inertia recharge
 * la page avec les nouvelles traductions partagées par le serveur.
 */
const LOCALES = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher() {
    const { locale = 'fr' } = usePage().props;

    const switchTo = (code) => {
        if (code === locale) return;
        router.post(`/locale/${code}`, {}, { preserveScroll: true });
    };

    return (
        <div className="flex items-center overflow-hidden rounded-md border border-slate-200 text-xs font-medium dark:border-slate-700">
            {LOCALES.map((l) => (
                <button
                    key={l.code}
                    onClick={() => switchTo(l.code)}
                    className={`px-2 py-1 transition-colors ${
                        l.code === locale
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    aria-label={`Passer en ${l.label}`}
                >
                    {l.label}
                </button>
            ))}
        </div>
    );
}
