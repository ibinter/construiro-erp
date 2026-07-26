const variantMap = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
};
const sizeMap = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    className = '',
    ...props
}) {
    const isDisabled = disabled || loading;
    return (
        <button
            className={`${variantMap[variant] ?? 'btn-primary'} ${sizeMap[size] ?? ''} ${className}`}
            disabled={isDisabled}
            aria-disabled={isDisabled || undefined}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner" aria-hidden="true" />
                    <span className="sr-only">Chargement...</span>
                </>
            ) : children}
        </button>
    );
}
