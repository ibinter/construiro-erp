import { usePage } from '@inertiajs/react';

/**
 * Hook de traduction. La clé est le texte source français ; en français le
 * dictionnaire est vide (identité), sinon on renvoie la traduction partagée
 * par le serveur (props.translations), avec repli sur la clé.
 *
 * Usage : const { t, locale } = useTrans();  puis  t('Modifier')
 */
export function useTrans() {
    const { translations = {}, locale = 'fr' } = usePage().props;
    const t = (key) => (translations && translations[key]) || key;
    return { t, locale };
}
