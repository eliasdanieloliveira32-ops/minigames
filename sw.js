// sw.js — service worker simples com cache básico
const CACHE_NAME = 'minigames-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/utils.js',
  '/manifest.json',
  '/memory.js',
  '/mole.js',
  '/reaction.js',
  '/maze.js',
  '/collect.js',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('SW install cache error', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => (key !== CACHE_NAME) ? caches.delete(key) : null)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          try { cache.put(req, copy); } catch(e){ /* ignore CORS etc */ }
        });
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
  );
});    ))
  );
  self.clients.claim();
});

// fetch -> tentativa pela rede; se falhar, resposta do cache; fallback para index.html
self.addEventListener('fetch', event => {
  const req = event.request;
  // só tratar GET para evitar problemas com POST/PUT
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then(res => {
        // atualiza cache com a resposta (clone)
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          // opcional: ignore requests de terceiros (CORS) se desejar
          try { cache.put(req, copy); } catch(e){ /* ignore */ }
        });
        return res;
      })
      .catch(() => {
        // fallback para cache
        return caches.match(req).then(cached => cached || caches.match('/index.html'));
      })
  );
});
