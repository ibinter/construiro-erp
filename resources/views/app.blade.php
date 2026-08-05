<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'CONSTRUIRO ERP') }}</title>

        <!-- CSRF -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- PWA -->
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#F58220">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="CONSTRUIRO">
        <link rel="apple-touch-icon" href="/icons/icon-192.png">

        <!-- Favicon -->
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon.ico" sizes="any">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        {{-- Open Graph / Twitter — rendus CÔTÉ SERVEUR pour les crawlers sociaux
             (WhatsApp, Facebook, LinkedIn n'exécutent pas JS ; les balises
             client Inertia ne leur seraient pas visibles). --}}
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="CONSTRUIRO ERP">
        <meta property="og:title" content="CONSTRUIRO — ERP BTP pour l'Afrique">
        <meta property="og:description" content="L'ERP BTP conçu pour les entreprises africaines. Projets, RH, stocks, équipements, finance. Essai gratuit 14 jours.">
        <meta property="og:url" content="https://construiro.com">
        <meta property="og:image" content="https://construiro.com/og-image.png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="CONSTRUIRO — ERP BTP pour l'Afrique">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="CONSTRUIRO — ERP BTP pour l'Afrique">
        <meta name="twitter:description" content="L'ERP BTP pensé pour les réalités africaines. Essai gratuit 14 jours.">
        <meta name="twitter:image" content="https://construiro.com/og-image.png">

        <!-- Scripts -->
        @routes(nonce: app()->bound('csp-nonce') ? app('csp-nonce') : null)
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <!-- Analytics Plausible — léger, sans cookies, conforme RGPD -->
        @production
        <script defer data-domain="construiro.com" src="https://plausible.io/js/script.js"></script>
        @endproduction
    </head>
    <body class="font-sans antialiased">
        @inertia
        <script nonce="{{ app()->bound('csp-nonce') ? app('csp-nonce') : '' }}">
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then(reg => {
                            reg.addEventListener('updatefound', () => {
                                const newWorker = reg.installing;
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        window.dispatchEvent(new CustomEvent('sw-update-available'));
                                    }
                                });
                            });
                        })
                        .catch(() => {});
                });
            }
        </script>
    </body>
</html>
