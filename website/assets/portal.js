/* Portal warga: bagian bersama (server, captcha, verifikasi NIK, tiket) */
(function(){
'use strict';
var URL_FN='https://niaqgsqfsztcsgdyzavt.supabase.co/functions/v1/portal';
var LOKAL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
var SITEKEY=LOKAL?'1x00000000000000000000AA':'0x4AAAAAAFrTRXmiY9dwVzcc';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
function ss(k,v){try{if(v===undefined)return JSON.parse(sessionStorage.getItem(k)||'null');if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}

function kirim(body){
  return fetch(URL_FN,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(function(r){return r.json().catch(function(){return{ok:false,pesan:'Server desa tidak merespons dengan benar.'}})})
    .catch(function(){return{ok:false,pesan:'Tidak dapat terhubung ke server desa. Periksa koneksi internet Anda.'}});
}

/* ---- captcha (Cloudflare Turnstile) ---- */
var tsSiap=null;
function muatTs(){
  if(tsSiap)return tsSiap;
  tsSiap=new Promise(function(ok,no){
    if(window.turnstile)return ok(window.turnstile);
    window.__tsOk=function(){ok(window.turnstile)};
    var s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__tsOk';s.async=true;s.onerror=function(){no(new Error('captcha'))};
    document.head.appendChild(s);
  });
  return tsSiap;
}
function captcha(el){
  var o={token:'',id:null,get:function(){return o.token},reset:function(){o.token='';if(o.id!=null&&window.turnstile)try{turnstile.reset(o.id)}catch(e){}}};
  muatTs().then(function(ts){o.id=ts.render(el,{sitekey:SITEKEY,language:'id',theme:'light',callback:function(t){o.token=t},'expired-callback':function(){o.token=''},'error-callback':function(){o.token=''}})})
    .catch(function(){el.innerHTML='<p class="note">Captcha gagal dimuat. Periksa koneksi lalu muat ulang halaman.</p>'});
  return o;
}

function pesan(el,t,jenis){el.className='msg '+(jenis||'err')+' on';el.textContent=t;void el.offsetWidth}
function sibuk(btn,on,label){if(on){btn._t=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span class="spin"></span> '+(label||'Memproses…')}else{btn.disabled=false;if(btn._t)btn.innerHTML=btn._t}}

/* ---- verifikasi NIK + tanggal lahir ---- */
function sesi(){var s=ss('pt:sesi');if(s&&s.exp>Date.now())return s;ss('pt:sesi',null);return null}
function verifikasi(box,onOk){
  var cur=sesi();
  if(cur){tampilWho(box,cur,onOk);return}
  box.innerHTML='<div class="msg" data-m></div>'+
   '<div class="fld"><label for="vNik">NIK (16 angka, sesuai KTP/KK)</label><input id="vNik" class="nik" inputmode="numeric" autocomplete="off" maxlength="16" placeholder="3508xxxxxxxxxxxx"></div>'+
   '<div class="fld"><label for="vTgl">Tanggal lahir</label><input id="vTgl" type="date" max="'+new Date().toISOString().slice(0,10)+'"><small>Dicocokkan dengan data kependudukan Desa Pandanwangi.</small></div>'+
   '<label class="cek"><input type="checkbox" id="vSetuju"><span>Saya menyetujui data kependudukan saya diperiksa dan dipakai oleh Pemerintah Desa Pandanwangi hanya untuk keperluan layanan ini, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.</span></label>'+
   '<div class="ts" data-ts></div>'+
   '<div class="btnrow"><button class="btn dark" data-go>Verifikasi data saya</button></div>';
  var nik=$('#vNik',box),m=$('[data-m]',box),cap=captcha($('[data-ts]',box)),bt=$('[data-go]',box);
  nik.addEventListener('input',function(){nik.value=nik.value.replace(/\D/g,'').slice(0,16)});
  bt.onclick=function(){
    var n=nik.value,t=$('#vTgl',box).value;
    if(n.length!==16)return pesan(m,'NIK harus 16 angka.');
    if(!t)return pesan(m,'Isi tanggal lahir Anda.');
    if(!$('#vSetuju',box).checked)return pesan(m,'Centang persetujuan penggunaan data terlebih dahulu.');
    if(!cap.get())return pesan(m,'Tunggu atau selesaikan pemeriksaan keamanan (captcha) di atas tombol.');
    sibuk(bt,true,'Memeriksa data…');
    kirim({aksi:'cek',nik:n,tgl:t,cf:cap.get()}).then(function(r){
      sibuk(bt,false);cap.reset();
      if(!r.ok)return pesan(m,r.pesan||'Verifikasi gagal.');
      var s={sesi:r.sesi,samar:r.samar,exp:Date.now()+28*60000};ss('pt:sesi',s);tampilWho(box,s,onOk);
    });
  };
}
function tampilWho(box,s,onOk){
  var w=s.samar||{};
  box.innerHTML='<div class="who"><span class="av">'+esc((w.nama||'?').slice(0,1))+'</span><div><b>'+esc(w.nama||'')+'</b><small>'+esc([w.dusun?'Dusun '+w.dusun:'',w.rt?'RT '+w.rt:'',w.rw?'RW '+w.rw:''].filter(Boolean).join(' · '))+' · NIK ••••'+esc(w.nik4||'')+'</small></div><button type="button" data-ganti>Bukan saya</button></div>';
  $('[data-ganti]',box).onclick=function(){ss('pt:sesi',null);verifikasi(box,onOk)};
  onOk&&onOk(s);
}

/* ---- tampilan langkah & tiket ---- */
function langkah(el,i){
  var ss_=$$('.s',el),ii=$$('i',el);
  ss_.forEach(function(s,k){s.classList.toggle('on',k===i);s.classList.toggle('done',k<i)});
  ii.forEach(function(x,k){x.classList.toggle('done',k<i)});
}
function konfeti(el){
  var c=document.createElement('div');c.className='confetti';var col=['#e8b84a','#ee7340','#5b8a4c','#fffaf0','#3b6fc4'];
  for(var i=0;i<46;i++){var x=document.createElement('i');x.style.left=Math.random()*100+'%';x.style.background=col[i%col.length];x.style.animationDelay=(Math.random()*.6)+'s';x.style.transform='rotate('+Math.random()*180+'deg)';c.appendChild(x)}
  el.appendChild(c);setTimeout(function(){c.remove()},3200);
}
function tiketHtml(t,nik4,judul,catatan){
  return '<div class="ok-ic"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2 style="text-align:center">'+esc(judul)+'</h2>'+
   '<div class="tiket"><small>Nomor tiket Anda</small><b data-tk>'+esc(t)+'</b><button class="cp" type="button" data-cp>Salin nomor tiket</button></div>'+
   '<p style="text-align:center;color:var(--muted)">Simpan nomor tiket ini (tangkap layar juga boleh). Untuk melacak, gunakan nomor tiket dan 4 angka terakhir NIK Anda: <b>'+esc(nik4||'')+'</b>.</p>'+
   (catatan?'<p class="note-p">'+catatan+'</p>':'')+
   '<div class="btnrow" style="justify-content:center"><a class="btn" href="lacak.html?t='+encodeURIComponent(t)+'">Lacak tiket ini</a><a class="btn ghost" href="index.html">Kembali ke beranda</a></div>';
}
function pasangSalin(root){var b=$('[data-cp]',root);if(!b)return;b.onclick=function(){var t=$('[data-tk]',root).textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='Tersalin ✓'}).catch(function(){b.textContent=t})}}

/* ---- foto: kecilkan di peramban sebelum dikirim ---- */
function kecilkan(file){
  return new Promise(function(ok,no){
    var img=new Image(),u=URL.createObjectURL(file);
    img.onload=function(){
      var mx=1000,w=img.width,h=img.height,k=Math.min(1,mx/Math.max(w,h)),c=document.createElement('canvas');
      var q=.72,d;
      for(var i=0;i<6;i++){c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);d=c.toDataURL('image/jpeg',q);if(d.length<=130000)break;if(q>.45)q-=.1;else k*=.8}
      URL.revokeObjectURL(u);ok(d);
    };
    img.onerror=function(){no(new Error('Berkas bukan gambar.'))};img.src=u;
  });
}

window.PT={kirim:kirim,captcha:captcha,verifikasi:verifikasi,sesi:sesi,langkah:langkah,konfeti:konfeti,tiketHtml:tiketHtml,pasangSalin:pasangSalin,pesan:pesan,sibuk:sibuk,kecilkan:kecilkan,ss:ss,esc:esc,$:$,$$:$$};
})();
