import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    darkMode: 'class',

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // ── CONSTRUIRO Brand Palette ──────────────────────────────
                primary: {
                    50:  '#fff8f0',
                    100: '#ffedd5',
                    200: '#fdd5a0',
                    300: '#fbb868',
                    400: '#f99a38',
                    500: '#F58220', // PRIMARY — Orange exact logo CONSTRUIRO
                    600: '#e06b10',
                    700: '#c2540c',
                    800: '#9a3d0a',
                    900: '#7c2d08',
                    950: '#3f1504',
                },
                brand: {
                    DEFAULT: '#F58220', // Orange exact logo #F58220
                    light:   '#f99a38',
                    dark:    '#e06b10',
                    subtle:  '#fff8f0',
                    navy:    '#1E1E1E', // Navy sombre du logo
                    gray:    '#5F6368', // Gris moyen
                },
                // ── Neutral (slate — professionnel BTP) ───────────────────
                surface: {
                    DEFAULT: '#f8fafc',
                    card:    '#ffffff',
                    border:  '#e2e8f0',
                    muted:   '#f1f5f9',
                },
                text: {
                    primary:   '#0f172a',
                    secondary: '#475569',
                    muted:     '#94a3b8',
                    inverse:   '#ffffff',
                },
                // ── Sémantique ─────────────────────────────────────────────
                success: {
                    DEFAULT: '#16a34a',
                    light:   '#dcfce7',
                    text:    '#15803d',
                },
                warning: {
                    DEFAULT: '#d97706',
                    light:   '#fef3c7',
                    text:    '#b45309',
                },
                danger: {
                    DEFAULT: '#dc2626',
                    light:   '#fee2e2',
                    text:    '#b91c1c',
                },
                info: {
                    DEFAULT: '#2563eb',
                    light:   '#dbeafe',
                    text:    '#1d4ed8',
                },
            },
            spacing: {
                sidebar: '260px',
            },
            borderRadius: {
                card: '12px',
            },
            boxShadow: {
                card:    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
                'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
                modal:   '0 20px 60px -10px rgb(0 0 0 / 0.25)',
            },
            animation: {
                'fade-in':   'fadeIn 0.2s ease-out',
                'slide-in':  'slideIn 0.25s ease-out',
                'spin-slow': 'spin 2s linear infinite',
            },
            keyframes: {
                fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
                slideIn: { '0%': { opacity: 0, transform: 'translateY(-8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
            },
        },
    },

    plugins: [forms],
};
