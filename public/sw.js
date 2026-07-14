/* CONSTRUIRO ERP — Service Worker v2.0 */

const CACHE_NAME    = 'construiro-v2';
const OFFLINE_URL   = '/offline.html';

// Assets à mettre en cache immédiatement
const PRECACHE = [
    '/',
    OFFLINE_URL,
];

/* ── Installation ────────────────────────────────────────────── */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
    );
    self.skipWaiting();
});

/* ── Activation ─────────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

/* ── Fetch — stratégie hybride ──────────────────────────────── */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ne pas intercepter les requêtes non-GET
    if (request.method !== 'GET') return;

    // Ne pas intercepter les requêtes API / SARA / Inertia XHR
    if (url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/sanctum/') ||
        request.headers.get('X-Inertia')) return;

    // Assets statiques (build Vite) → Cache First
    if (url.pathname.startsWith('/build/')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Pages HTML → Network First avec fallback offline
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() =>
                    caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
                )
        );
        return;
    }

    // Tout le reste → Network First
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});

/* ── Message — mise à jour depuis le client ─────────────────── */
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ── Push notifications ─────────────────────────────────────── */
self.addEventListener('push', (event) => {
    if (!event.data) return;
    let payload;
    try { payload = event.data.json(); } catch { payload = { title: 'CONSTRUIRO', body: event.data.text() }; }

    event.waitUntil(
        self.registration.showNotification(payload.title ?? 'CONSTRUIRO', {
            body:  payload.body ?? '',
            icon:  '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            data:  { url: payload.url ?? '/' },
            tag:   payload.tag ?? 'construiro-notif',
            renotify: true,
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
            const existing = wins.find((w) => w.url === url);
            if (existing) return existing.focus();
            return clients.openWindow(url);
        })
    );
});
