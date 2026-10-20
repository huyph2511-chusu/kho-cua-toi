/* Kho Của Tôi — service worker: lưu sẵn giao diện để mở được khi không có mạng.
 * Dữ liệu người dùng nằm trong IndexedDB, không nằm trong bộ đệm này, nên cập nhật giao diện không đụng tới dữ liệu.
 * Chiến lược: có mạng thì lấy bản mới nhất (bỏ qua bộ đệm HTTP), mất mạng hoặc mạng quá chậm thì dùng bản đã lưu. */
const CACHE = 'kho-cua-toi-v1.1.0';
const FILES = ['./', 'index.html', 'core.js', 'db.js', 'xlsx.js', 'app.js', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => fetch(new Request(f, { cache: 'reload' })).then(r => { if (!r.ok) throw new Error(f); return c.put(f, r); }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = () => cache.match(req, { ignoreSearch: true }).then(h => h || (req.mode === 'navigate' ? cache.match('index.html') : undefined));
    const net = fetch(req, { cache: 'no-cache' }).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; });
    // Mạng chậm quá 3 giây thì mở bằng bản đã lưu; bản mới vẫn được lưu ngầm cho lần sau
    net.catch(() => { });
    const slow = new Promise(r => setTimeout(r, 3000)).then(cached);
    try {
      const res = await Promise.race([net, slow]);
      if (res) return res;
      return await net;
    } catch (err) {
      const h = await cached();
      if (h) return h;
      throw err;
    }
  })());
});
