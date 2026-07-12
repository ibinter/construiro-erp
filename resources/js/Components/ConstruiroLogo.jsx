/**
 * Logo officiel CONSTRUIRO ERP
 * Icône hexagonale avec barres de construction (orange #F58220 + navy #1E1E1E)
 * + logotype "CONSTRUIRO" / "ERP"
 *
 * Props:
 *   variant: 'full' (icône + texte) | 'icon' (icône seule) | 'text' (texte seul)
 *   size: 'sm' | 'md' | 'lg' | 'xl'
 *   dark: bool — version fond sombre (texte blanc)
 *   className: string
 */
export default function ConstruiroLogo({
    variant = 'full',
    size = 'md',
    dark = false,
    className = '',
}) {
    const heights = { sm: 28, md: 36, lg: 48, xl: 64 };
    const h = heights[size] ?? 36;

    const navy  = dark ? '#ffffff' : '#1E1E1E';
    const gray  = dark ? '#9ca3af' : '#5F6368';
    const orange = '#F58220';

    const Icon = () => (
        <svg
            width={h}
            height={h}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            {/* Hexagone fond navy */}
            <polygon
                points="50,4 93,27.5 93,72.5 50,96 7,72.5 7,27.5"
                fill={navy}
            />
            {/* Barre courte gauche — gris */}
            <rect x="22" y="52" width="12" height="28" rx="2" fill={gray} />
            {/* Barre moyenne centre — gris clair */}
            <rect x="38" y="42" width="12" height="38" rx="2" fill="#8a8f94" />
            {/* Barre haute droite — orange */}
            <rect x="54" y="28" width="12" height="52" rx="2" fill={orange} />
            {/* Triangle accent orange bas-droite */}
            <polygon points="66,80 80,80 80,64" fill={orange} opacity="0.85" />
            {/* Arc ouvert gauche (lettre C stylisée) */}
            <path
                d="M30 30 L18 30 L8 50 L18 70 L30 70"
                stroke={orange}
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );

    const Wordmark = () => (
        <div className="flex flex-col leading-none select-none">
            <span
                style={{
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    fontSize: h * 0.55 + 'px',
                    color: navy,
                    fontFamily: 'Montserrat, Figtree, sans-serif',
                }}
            >
                CONSTRUIR<span style={{ color: orange }}>O</span>
            </span>
            <span
                style={{
                    fontSize: h * 0.25 + 'px',
                    color: orange,
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    marginTop: '1px',
                    fontFamily: 'Montserrat, Figtree, sans-serif',
                }}
            >
                — ERP —
            </span>
        </div>
    );

    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            {variant !== 'text' && <Icon />}
            {variant !== 'icon' && <Wordmark />}
        </div>
    );
}
