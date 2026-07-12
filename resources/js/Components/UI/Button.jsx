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
    return (
        <button
            className={`${variantMap[variant] ?? 'btn-primary'} ${sizeMap[size] ?? ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className="spinner" />}
            {children}
        </button>
    );
}
