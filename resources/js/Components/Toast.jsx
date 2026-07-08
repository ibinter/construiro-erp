import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Icon from '@/Components/Icon';

/**
 * Notifications toast alimentées par les messages flash partagés via Inertia
 * (props.flash.success / props.flash.error). Apparaît en bas à droite et
 * disparaît automatiquement après quelques secondes.
 */
export default function Toast() {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const items = [];
        if (flash?.success) items.push({ id: Date.now() + '-s', type: 'success', message: flash.success });
        if (flash?.error) items.push({ id: Date.now() + '-e', type: 'error', message: flash.error });

        if (items.length === 0) return;

        setToasts((current) => [...current, ...items]);
        const timer = setTimeout(() => {
            setToasts((current) => current.filter((t) => !items.some((i) => i.id === t.id)));
        }, 4000);

        return () => clearTimeout(timer);
    }, [flash?.success, flash?.error]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
            {toasts.map((toast) => {
                const success = toast.type === 'success';
                return (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
                            success ? 'bg-green-600' : 'bg-red-600'
                        }`}
                        role="status"
                    >
                        <Icon name={success ? 'check-circle-2' : 'alert-circle'} className="h-5 w-5 shrink-0" />
                        <span>{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
}
