#!/bin/bash
# Cek sintaks JavaScript aplikasi (index.html) sebelum terbit. Pakai: bash dev/cek.sh
set -e
cd "$(dirname "$0")/.."
python3 - <<'P'
import re,sys
s=open('index.html',encoding='utf-8').read()
js=re.findall(r'<script(?![^>]*src)[^>]*>(.*?)</script>',s,re.S)
open('/tmp/_cek_app.js','w',encoding='utf-8').write('\n;\n'.join(js))
m=re.search(r"APP_INFO = \{ ver: '(\d+)'",s); print('versi aplikasi:', m.group(1) if m else '?')
# pengaman: kunci rahasia tidak boleh masuk repo publik
for pola in [r'sb_secret_', r'service_role', r'eyJhbGciOi', r'-----BEGIN']:
    if re.search(pola,s): sys.exit('BERHENTI: ditemukan pola kunci rahasia: '+pola)
P
node --check /tmp/_cek_app.js && echo "sintaks OK"
