/* Service worker Pemdes Pandanwangi: halaman selalu diambil dari internet (versi terbaru);
   salinan terakhir hanya dipakai bila sedang tidak ada sinyal. Data tidak disimpan di sini. */
const CACHE = 'pemdes-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './icon-192.png'])).catch(() => { }));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./', cp)); }
    return res;
  }).catch(() => caches.match('./')));
});
