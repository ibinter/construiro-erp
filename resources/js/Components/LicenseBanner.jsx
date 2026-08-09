import { Link, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';
import { useTrans } from '@/i18n';

/**
 * Bannière d'état de licence in-app (cahier §8.4).
 * Lit l'état partagé par le serveur (props.subscription) — le client n'a
 * jamais autorité, il se contente d'informer selon l'état calculé serveur.
 */
const TONES = {
    info:    { bar: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',       icon: 'info' },
    warning: { bar: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200', icon: 'clock' },
    danger:  { bar: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',            icon: 'alert-triangle' },
};

export default function LicenseBanner() {
    const { subscription: s } = usePage().props;
    const { t } = useTrans();

    if (!s || !s.status) return null;

    let tone = 'info';
    let message = null;
    let cta = null; // { href, label }

    const jours = s.days_remaining ?? 0;
    const cap = s.chantier_cap;

    switch (s.status) {
        case 'demo':
            tone = 'info';
            message = t('Démonstration publique. Les données sont fictives et effacées chaque nuit.');
            break;

        case 'trial':
            if (jours <= 1) {
                tone = 'danger';
                message = t('Dernier jour d\'essai. Activez une formule pour conserver l\'export et le multi-utilisateur.');
            } else {
                tone = 'warning';
                message = `${t('Essai en cours —')} ${jours} ${t('jour(s) restant(s)')}${s.plan ? ` ${t('sur la formule')} ${s.plan}` : ''}.`;
            }
            cta = { href: '/billing', label: t('Voir les formules') };
            break;

        case 'free':
            tone = 'info';
            message = cap
                ? `${t('Palier Découverte —')} ${cap} ${t('chantier(s)')}. ${t('Passez à une formule payante pour lever la limite.')}`
                : t('Palier Découverte. Passez à une formule payante pour débloquer toutes les fonctions.');
            cta = { href: '/billing', label: t('Voir les formules') };
            break;

        case 'grace':
            tone = 'warning';
            message = `${t('Abonnement échu. Accès maintenu')} ${s.grace_days ?? jours} ${t('jour(s), puis passage en lecture seule.')}`;
            cta = { href: '/billing', label: t('Renouveler') };
            break;

        case 'expired':
            tone = 'danger';
            message = s.until
                ? `${t('Abonnement expiré — lecture seule. Données conservées jusqu\'au')} ${s.until}.`
                : t('Abonnement expiré — lecture seule.');
            cta = { href: '/billing', label: t('Réactiver') };
            break;

        default:
            return null; // ACTIVE : aucun bandeau
    }

    if (!message) return null;

    const tc = TONES[tone];

    return (
        <div className={`flex items-center gap-2 border-b px-4 py-2 text-sm ${tc.bar}`} role="status">
            <Icon name={tc.icon} className="h-4 w-4 shrink-0" />
            <span className="flex-1">{message}</span>
            {cta && (
                <Link href={cta.href} className="shrink-0 font-semibold underline underline-offset-2 hover:opacity-80">
                    {cta.label}
                </Link>
            )}
        </div>
    );
}
