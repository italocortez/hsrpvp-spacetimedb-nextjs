// public/sw.js — Phase 16 Plan 04 (FOUND-07)
// Asset-CDN cache-first Service Worker. ONLY intercepts the hostnames in ALLOWED_HOSTS.
// NEVER intercepts app-origin requests — that would break RSC streams, API routes, and WS upgrades.
// See 16-RESEARCH.md §Pattern 5 for full rationale; D-17, D-18, D-19 for policy.

const VERSION = 1; // bump to invalidate all caches
const ASSET_CACHE = `hsrpvp-assets-v${VERSION}`;
const ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com']; // D-17: UploadThing + Imgur only; Discord explicitly excluded

self.addEventListener('install', (event) => {
  console.log('[SW] install v' + VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate v' + VERSION);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== ASSET_CACHE).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // D-18: Never intercept app origin — ORDER MATTERS, this is the FIRST check.
  if (url.origin === self.location.origin) return;

  // D-17: Only intercept allowlisted asset CDNs.
  const hostAllowed = ALLOWED_HOSTS.some(
    (h) => url.hostname === h || url.hostname.endsWith('.' + h)
  );
  if (!hostAllowed) return;

  console.log('[SW] intercept', url.hostname, url.pathname);
  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok && event.request.method === 'GET') {
        // WR-03: extend SW lifetime for the cache write WITHOUT delaying the response.
        // A rejected cache.put (quota exceeded, Safari private mode) is swallowed with a
        // warning rather than escaping as an unhandled promise rejection.
        event.waitUntil(
          cache.put(event.request, response.clone())
            .catch((err) => console.warn('[SW] cache.put failed', err))
        );
      }
      return response;
    })
  );
});
