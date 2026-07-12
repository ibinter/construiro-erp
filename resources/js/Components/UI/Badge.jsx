const variantMap = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger:  'badge-danger',
    info:    'badge-info',
    neutral: 'badge-neutral',
    brand:   'badge-brand',
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
    return (
        <span className={`${variantMap[variant] ?? 'badge-neutral'} ${className}`}>
            {children}
        </span>
    );
}
