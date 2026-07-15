import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        // Avertissement au-delà de 1 Mo par chunk (informatif)
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                // Sépare les vendor lourds en chunks mis en cache navigateur indépendamment du code app
                manualChunks(id) {
                    // react + react-dom + scheduler DOIVENT être dans le même chunk
                    // pour éviter "Cannot set properties of undefined (setting 'unstable_now')"
                    if (id.includes('node_modules/react') ||
                        id.includes('node_modules/react-dom') ||
                        id.includes('node_modules/scheduler')) return 'react-vendor';
                    if (id.includes('node_modules/@inertiajs')) return 'inertia';
                    if (id.includes('node_modules/axios')) return 'axios';
                    if (id.includes('node_modules')) return 'vendor';
                },
            },
        },
    },
});
