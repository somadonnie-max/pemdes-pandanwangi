/* Aplikasi desktop Pemdes Pandanwangi (Electron).
   Membuka aplikasi web resmi (selalu versi terbaru). Saat tanpa internet, halaman aplikasi diambil dari salinan
   service worker dan data bacaan terakhir dari penyimpanan terenkripsi (Windows DPAPI via safeStorage).
   Tidak ada kunci rahasia di sini. Data hanya disimpan di laptop ini, dihapus saat keluar (logout). */
const { app, BrowserWindow, ipcMain, safeStorage, shell, session, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const URL_APP = 'https://pemdespandanwangi.pages.dev/';
const ORIGIN = new URL(URL_APP).origin;
const UMUR_MAKS = 60 * 24 * 3600 * 1000;      /* salinan offline kedaluwarsa setelah 60 hari */
let jendela = null;

const dirCache = () => path.join(app.getPath('userData'), 'cache-offline');
const berkas = kunci => path.join(dirCache(), crypto.createHash('sha1').update(kunci).digest('hex') + '.bin');
const dariAplikasi = e => { try { return new URL(e.senderFrame.url).origin === ORIGIN; } catch (x) { return false; } };

ipcMain.handle('cache:simpan', async (e, kunci, nilai) => {
  if (!dariAplikasi(e) || !safeStorage.isEncryptionAvailable()) return false;
  try {
    fs.mkdirSync(dirCache(), { recursive: true });
    fs.writeFileSync(berkas(kunci), safeStorage.encryptString(JSON.stringify({ t: Date.now(), v: nilai })));
    return true;
  } catch (x) { return false; }
});
ipcMain.handle('cache:baca', async (e, kunci) => {
  if (!dariAplikasi(e) || !safeStorage.isEncryptionAvailable()) return null;
  try {
    const o = JSON.parse(safeStorage.decryptString(fs.readFileSync(berkas(kunci))));
    return o && Date.now() - o.t < UMUR_MAKS ? o.v : null;
  } catch (x) { return null; }
});
ipcMain.handle('cache:hapus', async e => {
  if (!dariAplikasi(e)) return false;
  try { fs.rmSync(dirCache(), { recursive: true, force: true }); return true; } catch (x) { return false; }
});

function buatJendela() {
  jendela = new BrowserWindow({
    width: 1366, height: 820, minWidth: 380, minHeight: 560, show: false, autoHideMenuBar: true,
    title: 'Pemdes Pandanwangi', icon: path.join(__dirname, 'icon.png'), backgroundColor: '#17120e',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  jendela.once('ready-to-show', () => jendela.show());
  jendela.loadURL(URL_APP);
  /* tautan ke luar aplikasi dibuka di browser biasa; jendela cetak/blob tetap di dalam */
  jendela.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(ORIGIN) || url === 'about:blank' || url.startsWith('blob:')) return { action: 'allow' };
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  jendela.webContents.on('will-navigate', (ev, url) => {
    if (url.startsWith(ORIGIN) || url.startsWith('file:')) return;
    ev.preventDefault();
    if (/^https?:/i.test(url)) shell.openExternal(url);
  });
  /* gagal memuat (belum pernah dibuka online / tanpa internet): halaman petunjuk */
  jendela.webContents.on('did-fail-load', (ev, kode, ket, url, utama) => {
    if (utama && kode !== -3) jendela.loadFile(path.join(__dirname, 'offline.html'));
  });
}

app.whenReady().then(() => {
  if (!app.requestSingleInstanceLock()) return app.quit();
  app.on('second-instance', () => { if (jendela) { if (jendela.isMinimized()) jendela.restore(); jendela.focus(); } });
  const izin = new Set(['media', 'geolocation', 'notifications', 'clipboard-sanitized-write', 'fullscreen']);
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(izin.has(perm) && new URL(wc.getURL() || 'about:blank').origin === ORIGIN));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Aplikasi', submenu: [{ role: 'reload', label: 'Muat ulang' }, { role: 'forceReload', label: 'Muat ulang total' }, { type: 'separator' }, { role: 'togglefullscreen', label: 'Layar penuh' }, { role: 'quit', label: 'Keluar' }] },
    { label: 'Ubah', submenu: [{ role: 'undo', label: 'Urungkan' }, { role: 'redo', label: 'Ulangi' }, { type: 'separator' }, { role: 'cut', label: 'Potong' }, { role: 'copy', label: 'Salin' }, { role: 'paste', label: 'Tempel' }, { role: 'selectAll', label: 'Pilih semua' }] },
    { label: 'Tampilan', submenu: [{ role: 'zoomIn', label: 'Perbesar' }, { role: 'zoomOut', label: 'Perkecil' }, { role: 'resetZoom', label: 'Ukuran normal' }] }
  ]));
  buatJendela();
});
app.on('window-all-closed', () => app.quit());
