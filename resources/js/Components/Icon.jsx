import { icons } from 'lucide-react';

/**
 * Icône dynamique : rend l'icône Lucide dont le nom (kebab-case, comme dans
 * config/construiro.php) est passé en prop. Repli sur « Circle » si inconnu.
 */
const toPascalCase = (name) =>
    (name || '')
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

export default function Icon({ name, className = 'h-5 w-5', ...props }) {
    const LucideIcon = icons[toPascalCase(name)] ?? icons.Circle;
    return <LucideIcon className={className} {...props} />;
}
