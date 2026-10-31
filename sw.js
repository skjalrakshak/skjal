/**
 * SKJAL - High-Performance Service Worker & Offline Cache Controller
 * Precaches core critical assets for instantaneous reload and offline resiliency.
 */

const CACHE_NAME = 'skjal-cache-v35';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/jal-rakshak.html',
  '/shield.html',
  '/energy-monitoring.html',
  '/custom-engineering.html',
  '/404.html',
  '/favicon.ico',
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
  '/assets/img/gallery/electronics-bench.webp',
  '/sitemap.xml'
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
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests for same origin or fonts
  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.g')) return;

  // CSS and JS: Network-First strategy (always fresh live updates)
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(req).then((networkResp) => {
        if (networkResp && networkResp.status === 200) {
          const respToCache = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, respToCache));
        }
        return networkResp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Static Assets (Images, Fonts): Cache-First strategy with background update
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

  // HTML Navigation Pages: Stale-While-Revalidate strategy for instantaneous rendering
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(req).then((cachedHtml) => {
        const fetchPromise = fetch(req).then((networkHtml) => {
          if (networkHtml && networkHtml.status === 200) {
            const respToCache = networkHtml.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, respToCache));
          }
          return networkHtml;
        }).catch(() => {
          return cachedHtml || caches.match('/404.html');
        });

        return cachedHtml || fetchPromise;
      })
    );
  }
});

