const variantMap = {
    success: 'alert-success',
    warning: 'alert-warning',
    danger:  'alert-danger',
    info:    'alert-info',
};

export default function Alert({ variant = 'info', children, className = '' }) {
    return (
        <div className={`${variantMap[variant] ?? 'alert-info'} ${className}`}>
            {children}
        </div>
    );
}
