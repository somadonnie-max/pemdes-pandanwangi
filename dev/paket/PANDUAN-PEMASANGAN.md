# Panduan Pemasangan Aplikasi Pemdes untuk Desa Baru

Aplikasi ini dibuat oleh Pemerintah Desa Pandanwangi (Kec. Tempeh, Kab. Lumajang) dan boleh dipakai desa lain. Setiap desa memasang aplikasinya di **akun milik desa itu sendiri**, jadi datanya terpisah sepenuhnya. Desa lain tidak bisa melihat data Pandanwangi, dan sebaliknya.

Waktu yang dibutuhkan kira-kira **1–2 jam**. Semua layanan memakai paket gratis.

| Bagian | Layanan | Gunanya |
|---|---|---|
| Database | Supabase (supabase.com) | Menyimpan semua data aplikasi |
| Tampilan aplikasi | GitHub Pages (github.com) | Alamat web aplikasi, bisa dibuka di HP/laptop |
| Penyimpanan berkas | Google Drive + Apps Script | Menyimpan unggahan PDF/foto |

## Isi paket
- Folder **`aplikasi/`**: `index.html`, `config.js`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `privasi.html`, `verifikasi/index.html`.
- **`Code.gs`**: kode Apps Script untuk penyimpanan berkas.
- Berkas ini.
- **Berkas database** `database-kosong-desa-<nama>.sql` dibuat terpisah oleh admin Pandanwangi lewat menu **Admin → Paket desa baru**. Isinya struktur database, kode rekening APBDes, bidang/kegiatan, 4.096 kode barang SIPADES, SDGs Desa, dasar hukum, AHSP, template berita acara aset, dan satu akun admin. **Tidak ada** data penduduk, surat, keuangan, aset, aparat, atau foto Pandanwangi di dalamnya. Ukurannya sekitar 1 MB.

## Langkah 0 — Siapkan bahan
1. **Akun Gmail khusus desa**, misalnya `pemdes.sumberejo@gmail.com`. Pakai akun desa, bukan akun pribadi.
2. Laptop dengan Google Chrome.
3. Isi paket di atas dan berkas database desa Anda.

## Langkah 1 — Buat database di Supabase
1. Buka **supabase.com** → **Start your project** → daftar dengan Gmail desa.
2. **New project**: Project name `pemdes-<desa>`, buat **Database password** lalu simpan di tempat aman, Region **Southeast Asia (Singapore)**, Plan **Free**.
3. Tunggu ±2 menit sampai proyek siap.

## Langkah 2 — Isi database
1. Menu kiri **SQL Editor** → **New query**.
2. Buka berkas `database-kosong-desa-<nama>.sql` dengan Notepad, tekan **Ctrl+A**, lalu **Ctrl+C**. Tempel ke editor Supabase dengan **Ctrl+V**.
3. Klik **Run**. Bila muncul peringatan *destructive operations*, pilih **Run this query**.
4. Tunggu sampai muncul **"SELESAI — database siap…"**.

Berkas ini **aman dijalankan ulang**: data yang sudah ada tidak terhapus dan pengaturan desa tidak tertimpa. Berkas versi terbaru juga dipakai untuk **memperbarui** database (lihat bagian Pembaruan).

## Langkah 3 — Catat alamat dan kunci Supabase
- **Project Settings → Data API**: salin **Project URL** (`https://xxxx.supabase.co`).
- **Project Settings → API Keys**: salin **Publishable key** (`sb_publishable_…`).
- **Jangan** memakai kunci *secret*. Kunci itu tidak boleh ditaruh di aplikasi.

## Langkah 4 — Pasang tampilan aplikasi (GitHub Pages)
1. Daftar di **github.com** dengan Gmail desa.
2. **New repository**, misalnya `pemdes`, pilih **Public**. Data tetap aman karena tersimpan di Supabase, bukan di repositori ini.
3. **Add file → Upload files**: seret **semua isi folder `aplikasi`**, termasuk folder `verifikasi`, lalu **Commit changes**.
4. **Settings → Pages**: Source **Deploy from a branch**, Branch **main**, folder **/(root)**, lalu **Save**.
5. Setelah 1–2 menit, aplikasi bisa dibuka di `https://<akun>.github.io/<repositori>/`. Halaman pertama menampilkan **"Aplikasi belum diatur"**. Itu memang benar.

## Langkah 5 — Isi `config.js`
Di GitHub buka **`config.js`**, klik pensil **Edit**, lalu ganti semua isian bertanda `ISI:`:
```js
window.PEMDES_CFG = {
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseKey: 'sb_publishable_xxxx',
  appsScriptUrl: '',            // diisi di langkah 6
  namaDesa: 'Sumberejo', kecamatan: 'Pasirian', kabupaten: 'Lumajang'
};
```
Klik **Commit changes**, tunggu ±1 menit, lalu muat ulang aplikasi. Sekarang muncul halaman **Masuk**.

> Pengaman: selama `config.js` belum diisi, aplikasi **tidak tersambung ke database mana pun**, termasuk database Pandanwangi.

## Langkah 6 — Penyimpanan berkas (Google Drive + Apps Script)
Langkah ini diperlukan agar unggah PDF/foto berfungsi.
1. Di Google Drive (Gmail desa), buat folder **`Arsip Pemdes`**. Salin **ID folder**, yaitu bagian alamat setelah `/folders/`.
2. Buka **script.google.com** → **Proyek baru**, beri nama `Pemdes Berkas`. Ganti seluruh isi `Code.gs` dengan isi berkas **`Code.gs`** dari paket.
3. Isi 3 baris `ISI:` di bagian atas: `APP_URL`, `SUPABASE_URL`, dan `SUPABASE_KEY`.
4. **Setelan Proyek → Properti skrip → Tambahkan**: `ROOT_ID` = ID folder `Arsip Pemdes`.
   Template RKP dan draf KK bersifat opsional: `RKP_TEMPLATE_FOLDER`, `RKP_OUTPUT_FOLDER`, `KK_TEMPLATE`.
5. Pilih fungsi **`ujiSupabase`** → **Jalankan** → izinkan akses. Log harus menampilkan `pong`.
6. **Terapkan → Deployment baru → Aplikasi web**: Jalankan sebagai **Saya**, Akses **Siapa saja**. Salin URL yang diakhiri `/exec`.
7. Tempel URL itu ke `appsScriptUrl` di `config.js`, lalu **Commit**.

## Langkah 7 — Masuk pertama dan pengaturan desa
1. Masuk dengan **email admin** dari berkas database dan kata sandi awal **`123456`**. Aplikasi akan meminta kata sandi baru.
2. Buka **Admin → Pengaturan**, lalu isi:
   - profil desa, Kepala Desa, kode surat;
   - logo;
   - daftar dusun;
   - jam kerja dan lokasi kantor;
   - data aset/SIPADES.

   Lalu tekan **Simpan**.
3. Isi **Aparat Pemerintah Desa** lengkap dengan email masing-masing perangkat. Mereka bisa langsung masuk dengan kata sandi awal `123456`.
4. Atur hak akses di **Admin → Pengguna & Hak Akses**.
5. Pasang **template surat sendiri** di **Admin → Template Dokumen**, karena template Pandanwangi tidak ikut dalam paket.

## Langkah 8 — Isi data awal
- **Penduduk & Keluarga**: impor dari Excel di menu Data Penduduk / Data Keluarga.
- **Keuangan**: **Keuangan → Impor PDF Siskeudes**. Cetak laporan Siskeudes ke PDF (Microsoft Print to PDF):
  - Rekening APB Desa;
  - RAB pendapatan, belanja, dan pembiayaan;
  - Buku Kas Umum;
  - Register SPP;
  - Buku Kas Pembantu Kegiatan.

  Pilih semua PDF sekaligus. Impor boleh diulang; data tahun yang sama diperbarui, tidak digandakan.
- **Aset**: **Aset Desa → Inventaris (KIB)**, atau impor dari SIPADES.

## Fitur lanjutan (opsional, tanya admin Pandanwangi)
Fitur berikut memerlukan pemasangan tambahan di Supabase (Edge Function) dan/atau Cloudflare:
- verifikasi QR surat;
- penyimpanan khusus foto KTP/KK;
- penyimpanan Cloudflare R2;
- notifikasi HP;
- masuk dengan sidik jari;
- website desa dan portal warga.

Tanpa pemasangan tambahan itu, fitur inti tetap berjalan dan unggahan memakai Google Drive.

## Pembaruan aplikasi
- **Tampilan**: unggah `index.html` baru ke repositori, timpa yang lama. **Jangan menimpa `config.js`.**
- **Database**: minta berkas database versi terbaru dari admin Pandanwangi, lalu jalankan di SQL Editor seperti langkah 2. Data dan pengaturan desa tetap aman.

## Hal yang perlu diketahui
- Proyek Supabase gratis **dijeda** bila tidak dipakai 7 hari. Buka dashboard lalu klik **Restore project**.
- Kapasitas gratis 500 MB data. Foto dan PDF disimpan di Google Drive, bukan di Supabase.
- Simpan dengan aman: password database Supabase, akun Gmail desa, dan akun GitHub.
