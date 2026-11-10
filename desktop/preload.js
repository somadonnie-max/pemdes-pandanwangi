/* Jembatan aman antara halaman aplikasi dan penyimpanan offline terenkripsi. */
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('pemdesDesktop', {
  versi: '1.0.0',
  simpan: (kunci, nilai) => ipcRenderer.invoke('cache:simpan', String(kunci), nilai),
  baca: kunci => ipcRenderer.invoke('cache:baca', String(kunci)),
  hapus: () => ipcRenderer.invoke('cache:hapus')
});
