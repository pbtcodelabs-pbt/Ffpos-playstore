// FF POS — Service Worker (بنیادی آف لائن سپورٹ)
const CACHE_NAME = 'ffpos-cache-FF118TU0800AM';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-256.png',
  './icon-384.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Network-first — تازہ ترین ورژن ملے تو وہی دکھائیں (auto-update کے لیے ضروری)،
// آف لائن ہونے پر cache سے دکھائیں
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // ---- صفحہ کھلنے کی درخواست (navigation) — آف لائن ہونے پر ہمیشہ index.html دکھائیں ----
  // (exact-URL cache match کبھی ناکام ہو سکتا ہے، اس لیے واضح طور پر index.html کی طرف موڑا جا رہا ہے)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
