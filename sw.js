// Service worker – gör appen installerbar och användbar offline.
// Samma origin: nät först (färska filer), cache som reserv (offline).
// Externa CDN (Tailwind, Google Fonts): visa cache direkt, uppdatera i bakgrunden.
const CACHE = 'matteaventyr-v54';
const SHELL = [
    './',
    './index.html',
    './css/style.css',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png',
    './js/main.js',
    './js/core.js',
    './js/utils.js',
    './js/hints.js',
    './js/visuals.js',
    './js/sheets.js',
    './js/navigation.js',
    './js/scratchpad.js',
    './js/mult-table.js',
    './js/levels.js',
    './js/demo.js',
    './js/quiz.js',
    './js/modules/addsub.js',
    './js/modules/mult.js',
    './js/modules/div.js',
    './js/modules/seq.js',
    './js/modules/algo.js',
    './js/modules/scale.js',
    './js/modules/frac.js',
    './js/modules/combo.js',
    './js/modules/decimal.js',
    './js/modules/length.js',
    './js/modules/volweight.js',
    './js/modules/clock.js',
    './js/modules/conn.js',
    './js/modules/shop.js',
    './js/modules/geo.js',
    './js/modules/chart.js',
    './js/modules/avg.js',
    './js/modules/word.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);

    if (url.origin === location.origin) {
        e.respondWith(
            fetch(e.request)
                .then((res) => {
                    if (res && res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(e.request, copy));
                    }
                    return res;
                })
                .catch(() =>
                    caches.match(e.request).then(
                        (hit) => hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : Promise.reject(e))
                    )
                )
        );
    } else {
        e.respondWith(
            caches.match(e.request).then((hit) => {
                const fetched = fetch(e.request)
                    .then((res) => {
                        if (res && (res.ok || res.type === 'opaque')) {
                            const copy = res.clone();
                            caches.open(CACHE).then((c) => c.put(e.request, copy));
                        }
                        return res;
                    })
                    .catch(() => hit);
                return hit || fetched;
            })
        );
    }
});
