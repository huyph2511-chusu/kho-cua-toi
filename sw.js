/* Kho Của Tôi — service worker: lưu sẵn giao diện để mở được khi không có mạng.
 * Dữ liệu người dùng nằm trong IndexedDB, không nằm trong bộ đệm này. */
const CACHE = 'kho-cua-toi-v1.0.1';
const FILES = ['./', 'index.html', 'core.js', 'db.js', 'xlsx.js', 'app.js', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit || caches.match('index.html'));
      return hit || net;
    })
  );
});
