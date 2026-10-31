/**
 * SKJAL - High-Performance Service Worker & Offline Cache Controller
 * Precaches core critical assets for offline resiliency.
 * Employs strictly Network-First for HTML, CSS, and JS to prevent stale state or cache mismatches.
 */

const CACHE_NAME = 'skjal-cache-v41-live';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/water-monitoring.html',
  '/shield.html',
  '/energy-monitoring.html',
  '/custom-engineering.html',
  '/404.html',
  '/favicon.ico',
  '/assets/fonts/pixelify-sans.woff2',
  '/assets/img/brand/logo.png',
  '/assets/img/brand/logo.webp',
  '/assets/img/brand/favicon-48x48.png',
  '/assets/img/brand/favicon-192x192.png',
  '/assets/img/brand/apple-touch-icon.png',
  '/assets/img/brand/og-logo.png',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/js/page-transition.js',
  '/assets/js/vendor/gsap.min.js',
  '/assets/js/vendor/ScrollTrigger.min.js',
  '/assets/js/vendor/lenis.min.js',
  '/assets/img/heroes/skjal-iot-hero.webp',
  '/assets/img/gallery/electronics-bench.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Some precache assets failed to fetch:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache store:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data && event.data.action === 'clearCache') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Immediately bypass service worker for localhost or 127.0.0.1 development
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]') {
    return;
  }

  // 2. Only handle GET requests for same origin or Google Fonts
  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.g')) return;

  // 3. HTML Navigation Pages: Strictly Network-First (always fresh live updates; fallback to cache only if offline)
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const respToCache = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, respToCache));
          }
          return networkResp;
        })
        .catch(async () => {
          const cachedHtml = await caches.match(req);
          if (cachedHtml) return cachedHtml;
          const offline = await caches.match('/404.html');
          return offline || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // 4. CSS and JS: Network-First strategy (always fresh live updates)
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(req)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const respToCache = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, respToCache));
          }
          return networkResp;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 5. Static Assets (Images, Fonts): Cache-First strategy with background revalidation
  if (
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  ) {
    event.respondWith(
      caches.match(req).then((cachedResp) => {
        if (cachedResp) {
          // Revalidate in background
          fetch(req).then((networkResp) => {
            if (networkResp && networkResp.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResp));
            }
          }).catch(() => {});
          return cachedResp;
        }

        return fetch(req).then((networkResp) => {
          if (!networkResp || networkResp.status !== 200) return networkResp;
          const respToCache = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, respToCache));
          return networkResp;
        });
      })
    );
    return;
  }
});
