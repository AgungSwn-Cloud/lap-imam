// Service worker sederhana: menyimpan "bingkai" aplikasi agar cepat terbuka & bisa dipasang di HP.
// Data aplikasi tetap diambil langsung dari Google Apps Script (tidak di-cache).
const CACHE = 'imam-desa-v1';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Apps Script tidak disentuh
  // Network-first: selalu coba versi terbaru, pakai cache jika offline
  e.respondWith(
    fetch(e.request)
      .then(res => { const salin = res.clone(); caches.open(CACHE).then(c => c.put(e.request, salin)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
