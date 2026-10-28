/* Service worker Pemdes Pandanwangi.
   Halaman diambil dari internet (versi terbaru). Bila internet lambat (> 2,5 detik) dan ada
   salinan terakhir di perangkat, salinan itu langsung ditampilkan supaya beranda cepat muncul;
   unduhan versi terbaru tetap berjalan di belakang layar lalu aplikasi diberi tahu
   ("versi baru siap — muat ulang"). Tanpa sinyal: salinan terakhir. Data tidak disimpan di sini. */
const CACHE = 'pemdes-v2';
const TUNGGU = 2500;
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './icon-192.png'])).catch(() => { }));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const kabari = async (id) => {
  try { const c = id ? await self.clients.get(id) : null; const cs = c ? [c] : await self.clients.matchAll({ type: 'window' }); cs.forEach(x => x.postMessage({ t: 'versi-baru' })); } catch (e) { }
};
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate') return;
  if (new URL(r.url).pathname.indexOf('/verifikasi') >= 0) return;   /* halaman verifikasi publik: tidak disimpan sebagai halaman aplikasi */
  e.respondWith((async () => {
    const cache = await caches.open(CACHE), lama = await cache.match('./');
    const jaringan = fetch(r).then(async res => {
      if (res.ok) await cache.put('./', res.clone());
      return res;
    });
    if (!lama) return jaringan.catch(() => Response.error());
    let pakaiLama = false;
    const hasil = await Promise.race([
      jaringan.catch(() => null),
      new Promise(ok => setTimeout(() => ok('lambat'), TUNGGU))
    ]);
    if (hasil && hasil !== 'lambat') return hasil;
    pakaiLama = true;
    /* tampilkan salinan terakhir; begitu unduhan selesai, beri tahu halaman */
    e.waitUntil(jaringan.then(res => { if (pakaiLama && res && res.ok) return new Promise(ok => setTimeout(ok, 1500)).then(() => kabari(e.resultingClientId)); }).catch(() => { }));
    return lama;
  })());
});
