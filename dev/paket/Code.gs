/**
 * ============================================================
 *  APLIKASI PEMDES — Layanan Berkas (Google Apps Script) — versi paket desa baru
 *  Data aplikasi ada di Supabase. Skrip ini hanya:
 *   1. menyimpan unggahan PDF/foto ke Google Drive (folder Arsip);
 *   2. membuka dokumen kependudukan privat (KTP/KK) untuk yang berhak;
 *   3. membuat dokumen RKP Desa dari template Google Docs;
 *   4. membuat draf formulir KK (PDF) dari template DRAFT-KK;
 *   5. mengubah dokumen Word buatan aplikasi menjadi PDF (diunduh; simpan=false tidak menyimpan di Drive);
 *   6. mengambil template Google Docs lama sebagai Word (untuk dipindah).
 *  Setiap permintaan diperiksa ke Supabase (token masuk & hak akses).
 * ============================================================
 */

const APP_URL = 'ISI: alamat aplikasi, mis. https://pemdes-sumberejo.github.io/pemdes/';
const SUPABASE_URL = 'ISI: Project URL Supabase desa, mis. https://abcdxyz.supabase.co';
const SUPABASE_KEY = 'ISI: Publishable key Supabase desa (sb_publishable_...)';   // kunci publik (publishable/anon), aman berada di sini

const TZ = 'Asia/Jakarta';
const FOLDER_PRIVAT = ['Penduduk'];   // isinya TIDAK dibagikan lewat tautan

// Template dokumen (opsional). Isi lewat Setelan Proyek -> Properti skrip bila dipakai:
//   RKP_TEMPLATE_FOLDER = ID folder template Google Docs RKP; RKP_OUTPUT_FOLDER = ID folder hasil;
//   KK_TEMPLATE = ID Google Docs template draf KK.
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
const RKP_TEMPLATE_FOLDER = prop_('RKP_TEMPLATE_FOLDER');
const RKP_OUTPUT_FOLDER = prop_('RKP_OUTPUT_FOLDER');
const KK_TEMPLATE = prop_('KK_TEMPLATE');
const FOLDER_LAMA = [];

// ==================================================================
//  PINTU MASUK WEB
// ==================================================================
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'ping') return json_({ ok: true, data: { pong: true } });
  return HtmlService.createHtmlOutput(
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<p style="font:16px sans-serif;padding:24px">Aplikasi Pemdes ada di ' +
    '<a href="' + APP_URL + '" target="_top">' + APP_URL + '</a></p>'
  ).setTitle('Layanan Berkas Pemdes');
}

function doPost(e) {
  let req = {};
  try { req = JSON.parse(e.postData.contents); } catch (x) { }
  try {
    const fn = ACTIONS[req.action];
    if (!fn) throw new Error('Aksi tidak dikenal: ' + req.action);
    return json_({ ok: true, data: fn(req) });
  } catch (x) {
    return json_({ ok: false, error: (x && x.message) || String(x), code: (x && x.code) || '' });
  }
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

const ACTIONS = { upload: upload_, fileData: fileData_, tplList: tplList_, makeDoc: makeDoc_, makeKK: makeKK_, tplSources: tplSources_, tplExport: tplExport_, toPdf: toPdf_ };

// ==================================================================
//  SUPABASE
// ==================================================================
function sb_(req) {
  const res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/rpc/api', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: SUPABASE_KEY },
    payload: JSON.stringify({ req: req })
  });
  let r;
  try { r = JSON.parse(res.getContentText()); } catch (x) { throw new Error('Server data tidak menjawab (' + res.getResponseCode() + ').'); }
  if (!r || !r.ok) {
    const err = new Error((r && (r.error || r.message)) || 'Gagal menghubungi server data.');
    err.code = (r && r.code) || '';
    throw err;
  }
  return r.data;
}

// ==================================================================
//  BERKAS (Drive)
// ==================================================================
function root_() { return DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('ROOT_ID')); }

function folder_(path) {
  let f = root_();
  String(path || 'Lainnya').split('/').filter(String).forEach(function (name) {
    const it = f.getFoldersByName(name);
    f = it.hasNext() ? it.next() : f.createFolder(name);
  });
  return f;
}

function upload_(r) {
  const folder = String(r.folder || 'Lainnya').replace(/\.\./g, '');
  const who = sb_({ action: 'uploadCheck', token: r.token, folder: folder });
  if (!r.data) throw new Error('Berkas kosong.');
  const safe = String(r.name || 'berkas').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120);
  const blob = Utilities.newBlob(Utilities.base64Decode(r.data), r.mime || 'application/octet-stream', safe);
  const file = folder_(folder).createFile(blob);
  file.setDescription('Diunggah oleh ' + who.nama + ' lewat aplikasi Pemdes');
  if (FOLDER_PRIVAT.indexOf(folder.split('/')[0]) < 0) {
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (x) { }
  }
  return { id: file.getId(), name: file.getName(), mime: file.getMimeType() };
}

/** Isi berkas privat (KTP/KK) — hanya untuk yang punya izin "Lihat NIK/KK". */
function fileData_(r) {
  sb_({ action: 'uploadCheck', token: r.token, folder: 'Penduduk' });
  const file = DriveApp.getFileById(String(r.id || ''));
  if (!inRoot_(file)) throw new Error('Berkas bukan bagian arsip aplikasi.');
  const blob = file.getBlob();
  if (blob.getBytes().length > 15 * 1024 * 1024) throw new Error('Berkas terlalu besar untuk dipratinjau.');
  return { mime: blob.getContentType(), data: Utilities.base64Encode(blob.getBytes()) };
}

function inRoot_(file) {
  const roots = [PropertiesService.getScriptProperties().getProperty('ROOT_ID')].concat(FOLDER_LAMA);
  let level = [file.getParents()];
  for (let depth = 0; depth < 6 && level.length; depth++) {
    const next = [];
    for (let i = 0; i < level.length; i++) {
      const it = level[i];
      while (it.hasNext()) {
        const f = it.next();
        if (roots.indexOf(f.getId()) >= 0) return true;
        next.push(f.getParents());
      }
    }
    level = next;
  }
  return false;
}

// ==================================================================
//  BANTU TANGGAL & TEKS
// ==================================================================
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const TITIK = '..........................';
function tgl_(v) { const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
function p2_(n) { return ('0' + n).slice(-2); }
function panjang_(v) { const d = tgl_(v); return d ? p2_(d.getDate()) + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear() : String(v || ''); }
function dmy_(v, sep) { const d = tgl_(v); sep = sep || '/'; return d ? p2_(d.getDate()) + sep + p2_(d.getMonth() + 1) + sep + d.getFullYear() : String(v || ''); }
function hari_(v) { const d = tgl_(v); return d ? HARI[d.getDay()] : ''; }
function jam_(v) { const p = String(v || '').split(/[.:]/); return p.length >= 2 ? p2_(p[0]) + ':' + p2_(p[1]) : String(v || ''); }
function rupiah_(v) { const n = Number(String(v == null ? '' : v).replace(/[^\d-]/g, '')); return !n ? '-' : n.toLocaleString('id-ID') + ',-'; }
function reEsc_(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function ph_(key) { return '\\{\\{\\s*' + reEsc_(key) + '\\s*\\}\\}'; }
function val_(v) { return String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/\$/g, '\\$'); }

/** Ganti {{kunci}} di badan, kepala & kaki dokumen. */
function isi_(doc, map) {
  const parts = [doc.getBody(), doc.getHeader(), doc.getFooter()].filter(Boolean);
  Object.keys(map).sort(function (a, b) { return b.length - a.length; }).forEach(function (k) {
    parts.forEach(function (p) { p.replaceText(ph_(k), val_(map[k])); });
  });
}
/** Placeholder yang belum terisi: dilaporkan, lalu dikosongkan. */
function sisa_(doc) {
  const out = [];
  [doc.getBody(), doc.getHeader(), doc.getFooter()].filter(Boolean).forEach(function (p) {
    const t = p.getText(), re = /\{\{\s*([^{}]+?)\s*\}\}/g; let m;
    while ((m = re.exec(t))) if (out.indexOf(m[1]) < 0) out.push(m[1]);
    p.replaceText('\\{\\{[^{}]*\\}\\}', '');
  });
  return out;
}
/** Cari baris tabel yang memuat {{kunci}}. */
function barisDengan_(body, key) {
  const re = new RegExp(ph_(key)), tables = body.getTables();
  for (let t = 0; t < tables.length; t++) {
    const tb = tables[t];
    for (let r = 0; r < tb.getNumRows(); r++) {
      const row = tb.getRow(r);
      for (let c = 0; c < row.getNumCells(); c++) if (re.test(row.getCell(c).getText())) return { table: tb, index: r, cell: c };
    }
  }
  return null;
}
/** Gandakan satu baris tabel untuk setiap item; fillFn(baris, item, urutan, pertama) mengisi placeholder. */
function ulangBaris_(found, items, fillFn, clearFn) {
  const tb = found.table, tplRow = tb.getRow(found.index).copy();
  if (!items.length) { clearFn(tb.getRow(found.index)); return; }
  for (let i = 0; i < items.length; i++) {
    const row = i === 0 ? tb.getRow(found.index) : tb.insertTableRow(found.index + i, tplRow.copy());
    fillFn(row, items[i], i + 1, i === 0);
  }
}

// ==================================================================
//  DOKUMEN RKP DESA DARI TEMPLATE
// ==================================================================
function tplList_(r) {
  if (!RKP_TEMPLATE_FOLDER) return [];
  sb_({ action: 'me', token: r.token });
  const out = [], it = DriveApp.getFolderById(RKP_TEMPLATE_FOLDER).getFilesByType(MimeType.GOOGLE_DOCS);
  while (it.hasNext()) { const f = it.next(); out.push({ id: f.getId(), name: f.getName() }); }
  out.sort(function (a, b) { return a.name.localeCompare(b.name, 'id', { numeric: true }); });
  return out;
}

function petaRkp_(d) {
  const s = d.setting || {}, mu = d.musyawarah || {}, y = Number(d.tahun_rkp) || '';
  const M = {};
  const put = function (k, v) { M[k] = v == null ? '' : String(v); };
  // Data desa
  put('Desa', s.nama_desa); put('Kecamatan', s.kecamatan); put('Kabupaten', s.kabupaten); put('Provinsi', s.provinsi);
  put('Alamat', s.alamat); put('Kodepos', s.kode_pos); put('Kode Pos', s.kode_pos); put('email', s.email_desa);
  put('Tahun RKP', y); put('Tahun DU-RKP', y ? y + 1 : ''); put('Tahun ini', y ? y - 1 : '');
  // Musyawarah pembentukan tim (form 01-02)
  put('Musyawarah', mu.musyawarah); put('Nomor Undangan', mu.no_undangan);
  put('Tgl Undangan', dmy_(mu.tgl_undangan)); put('Tgu', panjang_(mu.tgl_undangan));
  put('Tanggal', dmy_(mu.tanggal)); put('Hari', hari_(mu.tanggal)); put('Tgl', panjang_(mu.tanggal));
  put('Jam', jam_(mu.jam)); put('Tempat', mu.tempat);
  put('Pimpinan', mu.pimpinan); put('Unsur Pimpinan', mu.unsur_pimpinan);
  put('Notulen/Sekretaris', mu.notulen); put('Notulen', mu.notulen); put('Sekretaris', mu.notulen); put('Unsur Notulen', mu.unsur_notulen);
  put('Wakil Masyarakat', mu.wakil_masyarakat);
  put('Tgl SK', panjang_(mu.tgl_sk)); put('Nomor SK Tim Penyusun', mu.no_sk_penyusun); put('Nomor SK Tim Verifikasi', mu.no_sk_verifikasi);
  put('Kepala Desa', (d.kades && d.kades.nama) || s.nama_kades || TITIK);
  put('Ketua BPD', (d.ketua_bpd && d.ketua_bpd.nama) || TITIK);
  // Narasumber (3)
  const ns = d.narasumber || [];
  for (let i = 0; i < 3; i++) { put('Narasumber' + (i + 1), ns[i] ? ns[i].nama : TITIK); put('UnsurN' + (i + 1), ns[i] ? ns[i].unsur : TITIK); }
  // Tim penyusun (11) & verifikasi (5)
  const ttl = function (x) { return x ? [x.tempat_lahir, panjang_(x.tgl_lahir)].filter(String).join(', ') : TITIK; };
  const tp = (d.tim || []).filter(function (x) { return x.jenis_tim === 'Tim Penyusun'; });
  const tv = (d.tim || []).filter(function (x) { return x.jenis_tim === 'Tim Verifikasi'; });
  for (let i = 0; i < 11; i++) {
    const x = tp[i];
    put('TP' + (i + 1), x ? x.nama : TITIK); put('JabatanTP' + (i + 1), x ? x.jabatan_tim : TITIK);
    put('TLTP' + (i + 1), ttl(x)); put('UNTP' + (i + 1), x ? x.unsur : TITIK);
  }
  for (let i = 0; i < 5; i++) {
    const x = tv[i];
    put('TV' + (i + 1), x ? x.nama : TITIK); put('JabatanTV' + (i + 1), x ? x.jabatan_tim : TITIK);
    put('TLTV' + (i + 1), ttl(x)); put('UNTV' + (i + 1), x ? x.unsur : TITIK); put('UnsurTV' + (i + 1), x ? x.unsur : TITIK);
  }
  // Rencana kerja & tindak lanjut (form 03, 8 baris)
  const jd = d.jadwal || [];
  for (let i = 0; i < 8; i++) {
    const x = jd[i];
    put('Hrk' + (i + 1), x ? [hari_(x.tanggal), panjang_(x.tanggal)].filter(String).join(', ') : '-');
    put('Prk' + (i + 1), x && x.jam ? jam_(x.jam) + ' WIB' + (x.sampai ? ' s/d ' + x.sampai : '') : '-');
    put('Trk' + (i + 1), x ? x.tempat : '-');
    put('Tgrk' + (i + 1), x ? panjang_(x.tanggal) : '-');
  }
  // versi HURUF BESAR: {{kunci_U}}
  Object.keys(M).forEach(function (k) { M[k + '_U'] = M[k].toUpperCase(); });
  return M;
}

function makeDoc_(r) {
  if (!RKP_TEMPLATE_FOLDER || !RKP_OUTPUT_FOLDER) throw new Error('Template RKP belum diatur di Apps Script (Properti skrip RKP_TEMPLATE_FOLDER & RKP_OUTPUT_FOLDER).');
  const tpl = DriveApp.getFileById(String(r.tpl || ''));
  let okFolder = false; const ps = tpl.getParents();
  while (ps.hasNext()) if (ps.next().getId() === RKP_TEMPLATE_FOLDER) okFolder = true;
  if (!okFolder) throw new Error('Template tidak dikenal.');
  const d = sb_({ action: 'docData', token: r.token, tahun_rkp: r.tahun_rkp || '', musyawarah_id: r.musyawarah_id || '' });

  const nama = tpl.getName().replace(/_/g, ' ').replace(/\s+/g, ' ').trim() + ' - RKP ' + d.tahun_rkp;
  const out = DriveApp.getFolderById(RKP_OUTPUT_FOLDER);
  const copy = tpl.makeCopy(nama, out);
  const doc = DocumentApp.openById(copy.getId());
  const body = doc.getBody();

  // Dasar hukum aktif: baris {{RDH_Aktif}} diulang untuk tiap peraturan
  let f;
  while ((f = barisDengan_(body, 'RDH_Aktif'))) {
    const col = f.cell;
    ulangBaris_(f, d.hukum || [], function (row, x, n, first) {
      for (let c = 0; c < row.getNumCells(); c++) {
        const cell = row.getCell(c);
        if (c === col) cell.replaceText(ph_('RDH_Aktif'), val_(x.rincian || ''));
        else if (c === col - 1) cell.setText(n + '.');
        else if (!first && c < col - 1) cell.setText('');
      }
    }, function (row) { row.replaceText(ph_('RDH_Aktif'), TITIK); });
  }
  // Form 04: baris {{c1}}..{{c5}} per kode bidang 01..05
  const kolom = ['c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  for (let b = 1; b <= 5; b++) {
    const fb = barisDengan_(body, 'c' + b);
    if (!fb) continue;
    const items = (d.usulan || []).filter(function (x) { return ('0' + String(x.kode_bidang || '').replace(/\D/g, '')).slice(-2) === p2_(b); });
    ulangBaris_(fb, items, function (row, x, n) {
      const v = {
        c: n + '.', d: x.kegiatan, e: [x.sumber_dana, x.kementerian].filter(Boolean).join(' / '), f: x.sdgs, g: x.tahun_pelaksanaan,
        h: [x.lokasi, x.dusun, x.rt && 'RT ' + x.rt, x.rw && 'RW ' + x.rw].filter(Boolean).join(', '), i: x.volume, j: x.satuan, k: rupiah_(x.total)
      };
      kolom.forEach(function (p) { row.replaceText(ph_(p + b), val_(v[p] || '')); });
    }, function (row) { kolom.forEach(function (p) { row.replaceText(ph_(p + b), ''); }); });
  }
  isi_(doc, petaRkp_(d));
  const kosong = sisa_(doc);
  doc.saveAndClose();

  const pdf = out.createFile(copy.getAs(MimeType.PDF).setName(nama + '.pdf'));
  [copy, pdf].forEach(function (x) { try { x.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { } });
  return { name: nama, docUrl: 'https://docs.google.com/document/d/' + copy.getId() + '/edit', pdfUrl: 'https://drive.google.com/file/d/' + pdf.getId() + '/view', missing: kosong };
}

// ==================================================================
//  DRAF FORMULIR KK (PDF langsung diunduh, tidak disimpan di Drive)
// ==================================================================
const URUT_HUB = ['KEPALA KELUARGA', 'SUAMI', 'ISTRI', 'ANAK', 'MENANTU', 'CUCU', 'ORANG TUA', 'MERTUA', 'FAMILI LAIN', 'PEMBANTU', 'LAINNYA'];
function makeKK_(r) {
  if (!KK_TEMPLATE) throw new Error('Template draf KK belum diatur di Apps Script (Properti skrip KK_TEMPLATE).');
  const d = sb_({ action: 'docKK', token: r.token, keluarga_id: r.keluarga_id });
  const k = d.keluarga || {}, s = d.setting || {};
  const pr = function (x) { const i = URUT_HUB.indexOf(String(x.hubungan || '').toUpperCase()); return i < 0 ? 99 : i; };
  const ag = (d.anggota || []).slice().sort(function (a, b) {
    if (pr(a) !== pr(b)) return pr(a) - pr(b);
    return String(a.tgl_lahir || '9').localeCompare(String(b.tgl_lahir || '9'));
  });
  const M = {};
  const put = function (key, v) { M[key] = (v == null || v === '') ? '-' : String(v); };
  put('NoKK', k.kk); put('NamaKK', k.kepala); put('Dusun', k.alamat || k.dusun); put('RT', k.rt); put('RW', k.rw);
  put('Desa', String(s.nama_desa || '').toUpperCase()); put('Kecamatan', String(s.kecamatan || '').toUpperCase());
  put('Kabupaten', String(s.kabupaten || '').toUpperCase()); put('Provinsi', String(s.provinsi || '').toUpperCase());
  put('KodePos', s.kode_pos); put('TanggalKK', k.tgl_kk ? dmy_(k.tgl_kk, '-') : '');
  for (let i = 1; i <= 10; i++) {
    const x = ag[i - 1] || {};
    put('Nama' + i, x.nama); put('NIK' + i, x.nik); put('JK' + i, x.jk); put('TML' + i, x.tempat_lahir); put('TL' + i, x.tgl_lahir ? dmy_(x.tgl_lahir, '-') : '');
    put('AG' + i, x.agama); put('PENDIDIKAN' + i, x.pendidikan); put('PEKERJAAN' + i, x.pekerjaan); put('GD' + i, x.gol_darah);
    put('STKW' + i, x.status_kawin); put('TGKW' + i, ''); put('SHDK' + i, x.hubungan); put('KWRG' + i, x.warga_negara);
    put('NOPS' + i, x.no_paspor); put('NOKT' + i, x.no_kitap); put('AYAH' + i, x.ayah); put('IBU' + i, x.ibu);
  }
  const copy = DriveApp.getFileById(KK_TEMPLATE).makeCopy('KK_' + k.kk + '_sementara', folder_('Penduduk/Sementara'));
  try {
    const doc = DocumentApp.openById(copy.getId());
    isi_(doc, M);
    doc.saveAndClose();
    const pdf = copy.getAs(MimeType.PDF);
    return { name: 'Draf_KK_' + k.kk + '.pdf', data: Utilities.base64Encode(pdf.getBytes()) };
  } finally { copy.setTrashed(true); }
}

// ==================================================================
//  TEMPLATE WORD (template kini disimpan di Supabase; Drive hanya PDF)
// ==================================================================
function admin_(token) {
  const me = sb_({ action: 'me', token: token });
  if (!me.user || !me.user.admin) throw new Error('Hanya admin.');
  return me.user;
}
/** Daftar template Google Docs lama yang bisa dipindah ke penyimpanan template. */
function tplSources_(r) {
  if (!RKP_TEMPLATE_FOLDER && !KK_TEMPLATE) return [];
  admin_(r.token);
  const out = [];
  if (RKP_TEMPLATE_FOLDER) { const it = DriveApp.getFolderById(RKP_TEMPLATE_FOLDER).getFilesByType(MimeType.GOOGLE_DOCS);
  while (it.hasNext()) { const f = it.next(); out.push({ id: f.getId(), name: f.getName(), jenis: 'rkp' }); } }
  out.sort(function (a, b) { return a.name.localeCompare(b.name, 'id', { numeric: true }); });
  if (KK_TEMPLATE) out.push({ id: KK_TEMPLATE, name: DriveApp.getFileById(KK_TEMPLATE).getName(), jenis: 'kk' });
  return out;
}
/** Satu template Google Docs lama -> Word (.docx, base64). */
function tplExport_(r) {
  admin_(r.token);
  const id = String(r.id || '');
  let ok = id === KK_TEMPLATE;
  if (!ok) { const ps = DriveApp.getFileById(id).getParents(); while (ps.hasNext()) if (ps.next().getId() === RKP_TEMPLATE_FOLDER) ok = true; }
  if (!ok) throw new Error('Template tidak dikenal.');
  const res = UrlFetchApp.fetch('https://docs.google.com/document/d/' + id + '/export?format=docx',
    { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Gagal mengambil template (' + res.getResponseCode() + ').');
  return { name: DriveApp.getFileById(id).getName(), data: Utilities.base64Encode(res.getContent()) };
}
/**
 * Word buatan aplikasi -> PDF di Drive.
 * jenis: rkp (folder Output RKP, bisa dibuka lewat tautan), surat (Pelayanan/Surat Keterangan/tahun, privat),
 *        kk (Penduduk/Draf KK, privat).
 */
function toPdf_(r) {
  const me = sb_({ action: 'me', token: r.token }).user || {};
  const punya = function (p) { return me.admin || (me.akses || []).indexOf(p) >= 0; };
  const jenis = String(r.jenis || '');
  let folder, publik = false;
  if (jenis === 'rkp') { if (!punya('perencanaan')) throw new Error('Butuh hak Perencanaan.'); folder = DriveApp.getFolderById(RKP_OUTPUT_FOLDER); publik = true; }
  else if (jenis === 'surat') { if (!punya('pelayanan')) throw new Error('Butuh hak Pelayanan Surat.'); folder = folder_('Pelayanan/Surat Keterangan/' + Utilities.formatDate(new Date(), TZ, 'yyyy')); }
  else if (jenis === 'kk') { if (!punya('lihat_nik')) throw new Error('Butuh hak Lihat NIK/KK.'); folder = folder_('Penduduk/Draf KK'); }
  else throw new Error('Jenis dokumen tidak dikenal.');
  if (!r.data) throw new Error('Dokumen kosong.');
  const nama = String(r.name || 'Dokumen').replace(/[\\/:*?"<>|]+/g, '_').replace(/\.docx$/i, '').slice(0, 150);
  const b = 'pemdes' + Date.now();
  const meta = JSON.stringify({ name: nama, mimeType: 'application/vnd.google-apps.document', parents: [folder_('Sementara').getId()] });
  const head = Utilities.newBlob('--' + b + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta + '\r\n--' + b +
    '\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n').getBytes();
  const tail = Utilities.newBlob('\r\n--' + b + '--').getBytes();
  const res = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'post', contentType: 'multipart/related; boundary=' + b, muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: head.concat(Utilities.base64Decode(r.data)).concat(tail)
  });
  if (res.getResponseCode() !== 200) throw new Error('Gagal mengubah ke PDF (' + res.getResponseCode() + ').');
  const gdoc = DriveApp.getFileById(JSON.parse(res.getContentText()).id);
  try {
    if (r.simpan === false) {   // hanya diunduh, tidak disimpan di Drive
      return { name: nama + '.pdf', data: Utilities.base64Encode(gdoc.getAs(MimeType.PDF).getBytes()) };
    }
    const pdf = folder.createFile(gdoc.getAs(MimeType.PDF).setName(nama + '.pdf'));
    pdf.setDescription('Dibuat oleh ' + (me.nama || '') + ' lewat aplikasi Pemdes');
    if (publik) { try { pdf.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (x) { } }
    return { id: pdf.getId(), name: pdf.getName(), url: 'https://drive.google.com/file/d/' + pdf.getId() + '/view' };
  } finally { gdoc.setTrashed(true); }
}

const BULAN_ID = { januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agu: 8, agt: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12 };
/** "16 Januari 2025", "16/01/2025", "2025-01-16" -> "2025-01-16"; selain itu dikembalikan apa adanya. */
function iso_(v) {
  v = String(v == null ? '' : v).trim();
  if (!v) return '';
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  m = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  m = v.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (m && BULAN_ID[m[2].toLowerCase()]) return m[3] + '-' + ('0' + BULAN_ID[m[2].toLowerCase()]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return v;
}

/** Uji sambungan ke Supabase dari editor. */
function ujiSupabase() { Logger.log(JSON.stringify(sb_({ action: 'ping' }))); }
