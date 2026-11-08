# Catatan pengembang — Aplikasi & Website Pemdes Pandanwangi

Folder ini **tidak ikut terbit** ke Cloudflare (dikecualikan di workflow). Isinya hanya alat & petunjuk kerja; tidak ada data warga, kata sandi, atau kunci rahasia.

## Struktur repo
| Path | Isi | Terbit ke |
|---|---|---|
| `index.html` | Seluruh aplikasi (SPA satu berkas, ±2,6 MB, HTML+CSS+JS) | pemdespandanwangi.pages.dev |
| `sw.js`, `manifest.webmanifest`, `icon-*.png`, `privasi.html`, `verifikasi/`, `wil/` | PWA, kebijakan privasi, halaman verifikasi QR surat, data wilayah | idem |
| `website/` | Website desa (HTML statis + `assets/site.js`, `site.css`, `slot.json`) | desapandanwangi.pages.dev |
| `.github/workflows/cloudflare-pages.yml` | Setiap push ke `main` mengirim aplikasi & website | — |
| `dev/` | Alat ini | tidak terbit |

## Cara kerja (sesi baru)
1. Clone repo, ubah `index.html` (aplikasi) atau `website/` langsung.
2. Naikkan versi di `const APP_INFO = { ver: 'NNN', tgl: 'YYYY-MM-DD' }` bila mengubah aplikasi.
3. `bash dev/cek.sh` → cek sintaks JS + pengaman kunci rahasia.
4. `bash dev/terbit.sh "vNNN: pesan"` → pull, cek, commit, push ke `main` (Actions mengirim ke Cloudflare ±1 menit).
5. Untuk perubahan besar: tulis potongan kode di berkas terpisah lalu sisipkan dengan skrip Python (`str.replace` dengan jangkar unik, hentikan bila jumlah cocok ≠ 1). Jangan menulis ulang seluruh berkas.
6. Uji tampilan dengan Playwright (Chromium sudah ada) memakai mock respons Supabase bila perlu.

Hindari dua sesi menerbitkan bersamaan (aplikasi & website satu repo). `terbit.sh` selalu `git pull` dulu.

## Backend
- Supabase proyek `niaqgsqfsztcsgdyzavt`. Kunci di `index.html` adalah **publishable key** (memang publik). Kunci service/secret **tidak pernah** masuk repo — diisi pengguna sendiri di Supabase/Cloudflare Secrets.
- Data umum di `private.record` (`entity`, `data jsonb`), aturan per entitas di `private.entity` (rd/wr = hak akses). Simpan lewat RPC `call('save', {entity, record})` → `private.a_save` (merge `data || baru`).
- RPC publik untuk website: `web_publik`, `web_konten`, `web_peta`, `web_transparansi`, `portal` (via Edge Function `portal`, Turnstile + rate limit). Hanya agregat / data publik; **tanpa NIK, alamat, KK, nama warga**.
- File: Cloudflare R2 lewat Edge Function; foto publik website di bucket `web/`.

## Konvensi di index.html (cari dengan grep)
- `VIEWS.<nama> = async (p, main, alive) => {...}` — halaman; `UI.<entitas>` — form/daftar entitas; `S.vh.<aksi>` — handler `data-act`.
- `ASET_GRP` — susunan menu bergrup (item `[label, go, entity, perm]`), `MENU_KET` keterangan menu.
- `KF` + `kfCek`/`kfCekLain` — indikator FRC Inspektorat; `DOKKEU` + `VIEWS.keudok` — generator SK/BA/laporan (grup `keu`, `lain`, `add`).
- `a78SkHtml`, `a78Judul` (Garuda hitam untuk SK/Perkades; Garuda emas untuk Perdes), `kfSk`.
- Peta aset: `apBaca`, `apUkur`, `apKartuHtml`, `VIEWS.asetpeta` (satu GeoJSON untuk semua KIB A & D, cocok lewat kolom `id`).

## Aturan yang ditetapkan pemilik
- Bahasa Indonesia; data saling berelasi agar tidak mengetik ulang.
- Tidak menyentuh server SQL Siskeudes kabupaten; tidak membuka `Config.ini`/berkas setting kunci.
- Hindari `DROP`; perubahan data merusak perlu konfirmasi + cadangan.
- Website: data publik hanya bila ditandai; patuhi UU 27/2022 (PDP).
- Gaya bahasa website: skill "gaya-bahasa-website-desa".
