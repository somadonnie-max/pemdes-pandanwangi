#!/bin/bash
# Cek lalu terbitkan aplikasi + website. Pakai: bash dev/terbit.sh "v233: pesan singkat"
# GitHub Actions otomatis mengirim aplikasi (pemdespandanwangi) & website/ (desapandanwangi) ke Cloudflare.
set -e
[ -z "$1" ] && { echo 'Isi pesan commit, mis: bash dev/terbit.sh "v233: ..."'; exit 1; }
cd "$(dirname "$0")/.."
git pull -q --no-rebase
bash dev/cek.sh
git add -A index.html config.js website sw.js manifest.webmanifest privasi.html verifikasi wil icon-192.png icon-512.png README.md .gitignore .github dev
git commit -qm "$1" -m "${2:-}" && git push -q && echo TERBIT
