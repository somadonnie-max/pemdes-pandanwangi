#!/bin/bash
# Membuat paket aplikasi untuk desa lain (tanpa data Pandanwangi). Pakai: bash dev/buat-paket.sh
# Hasil: dev/_hasil/paket-aplikasi-pemdes-vNNN.zip (folder _hasil tidak di-commit)
set -e
cd "$(dirname "$0")/.."
bash dev/cek.sh >/dev/null
V=$(grep -o "APP_INFO = { ver: '[0-9]*'" index.html | grep -o "[0-9]\+")
T=dev/_hasil/paket; rm -rf dev/_hasil; mkdir -p $T/aplikasi/verifikasi
cp index.html icon-192.png icon-512.png $T/aplikasi/
cp dev/paket/config.contoh.js $T/aplikasi/config.js
cp dev/paket/Code.gs dev/paket/PANDUAN-PEMASANGAN.md $T/
python3 - "$T" <<'P'
import sys,re
T=sys.argv[1]
def umum(src,dst):
    s=open(src,encoding='utf-8').read()
    s=s.replace('Pemerintah Desa Pandanwangi, Kecamatan Tempeh, Kabupaten Lumajang','Pemerintah Desa')
    s=s.replace('Kec. Tempeh, Kab. Lumajang','').replace('Desa Pandanwangi','Desa').replace('Pemdes Pandanwangi','Pemdes').replace('Pandanwangi','Desa')
    s=re.sub(r'[A-Za-z0-9._%+-]+@gmail\.com','admin aplikasi desa',s)
    s=s.replace("'https://niaqgsqfsztcsgdyzavt.supabase.co'","''")
    open(dst,'w',encoding='utf-8').write(s)
umum('manifest.webmanifest',T+'/aplikasi/manifest.webmanifest')
umum('sw.js',T+'/aplikasi/sw.js')
umum('privasi.html',T+'/aplikasi/privasi.html')
umum('verifikasi/index.html',T+'/aplikasi/verifikasi/index.html')
# pengaman: tidak boleh ada alamat/kunci Pandanwangi selain di index.html (yang hanya aktif di alamat Pandanwangi)
import glob
for f in glob.glob(T+'/**/*',recursive=True):
    if f.endswith('index.html') and '/verifikasi/' not in f: continue
    if f.endswith(('.png',)) or not __import__('os').path.isfile(f): continue
    t=open(f,encoding='utf-8',errors='ignore').read()
    for pola in ['niaqgsqfsztcsgdyzavt','sb_publishable_Fr','AKfycbx','sb_secret','service_role']:
        if pola in t: sys.exit('BERHENTI: '+pola+' ada di '+f)
P
(cd dev/_hasil && zip -qr paket-aplikasi-pemdes-v$V.zip paket && rm -rf paket)
echo "Paket: dev/_hasil/paket-aplikasi-pemdes-v$V.zip"
