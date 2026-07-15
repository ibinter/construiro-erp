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
                    if (id.includes('node_modules/react-dom')) return 'react-dom';
                    if (id.includes('node_modules/react/')) return 'react';
                    if (id.includes('node_modules/@inertiajs')) return 'inertia';
                    if (id.includes('node_modules/axios')) return 'axios';
                    if (id.includes('node_modules')) return 'vendor';
                },
            },
        },
    },
});
