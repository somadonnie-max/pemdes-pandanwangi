/* Ajukan surat online: warga desa (NIK + tgl lahir) & penduduk luar desa (biodata + foto KTP/KK) */
(function(){
var $=PT.$,$$=PT.$$,esc=PT.esc;
/* layanan bawaan aplikasi (Pelayanan → Surat Keterangan / Buku NTCR / Formulir Adminduk) */
var BAWAAN=[
 ['Surat Keterangan','Surat Keterangan Domisili','🏠',[['alamat_domisili','Alamat domisili (kosongkan bila sama dengan KTP)'],['lama_tinggal','Tinggal sejak (tahun)']],'Fotokopi KTP & KK'],
 ['Surat Keterangan','Surat Keterangan Tidak Mampu','🤝',[],'Fotokopi KTP & KK\nSurat pengantar RT/RW'],
 ['Surat Keterangan','Surat Keterangan Usaha','🏪',[['usaha_nama','Nama usaha'],['usaha_jenis','Jenis usaha','mis. warung sembako, bengkel'],['usaha_alamat','Alamat usaha'],['usaha_mulai','Mulai usaha (tahun)']],'Fotokopi KTP & KK\nFoto tempat usaha'],
 ['Surat Keterangan','Surat Pengantar SKCK','🛡️',[],'Fotokopi e-KTP & KK\nFotokopi akta kelahiran\nFotokopi BPJS/JKN\nPas foto 4x6 latar merah 4 lembar'],
 ['Surat Keterangan','Surat Keterangan Belum Menikah','💍',[],'Fotokopi KTP & KK'],
 ['Surat Keterangan','Surat Keterangan Penghasilan','💰',[['penghasilan','Penghasilan rata-rata per bulan (Rp)']],'Fotokopi KTP & KK'],
 ['Surat Keterangan','Surat Keterangan Masih Hidup','❤️',[],'KTP & KK asli'],
 ['Surat Keterangan','Surat Keterangan Perbedaan Data Pupuk Bersubsidi','🌾',[],'Fotokopi KTP & KK\nData e-RDKK yang berbeda'],
 ['Surat Keterangan','Surat Keterangan Pindah','🚚',[['pindah_tujuan','Alamat tujuan pindah (lengkap)'],['pindah_alasan','Alasan pindah'],['pengikut','Jumlah anggota keluarga yang ikut pindah']],'KTP & KK asli\nFotokopi buku nikah'],
 ['Peristiwa','Surat Keterangan Kelahiran','👶',[['bayi_nama','Nama bayi'],['bayi_jk','Jenis kelamin bayi','',['Laki-laki','Perempuan']],['bayi_tgl','Tanggal lahir bayi','','date'],['bayi_jam','Jam lahir','','time'],['bayi_tempat','Tempat lahir (bidan/RS/rumah)'],['anak_ke','Anak ke-'],['ayah_nama','Nama ayah'],['ibu_nama','Nama ibu']],'Surat keterangan lahir dari bidan/dokter\nFotokopi KTP & KK orang tua\nFotokopi buku nikah'],
 ['Peristiwa','Surat Keterangan Kematian','🕊️',[['mati_nama','Nama yang meninggal'],['mati_tgl','Tanggal meninggal','','date'],['mati_tempat','Tempat meninggal'],['mati_sebab','Sebab meninggal']],'KTP & KK asli yang meninggal\nFotokopi KTP pelapor'],
 ['Peristiwa','Pengantar Nikah (NTCR / N1–N4)','💒',[['catatan','Nama calon pasangan & rencana tanggal akad']],'Fotokopi KTP & KK calon pengantin\nFotokopi akta kelahiran\nPas foto 2x3 & 4x6\nAkta cerai/kematian pasangan bila janda/duda'],
 ['Pernyataan','Surat Pernyataan Kehilangan','🔍',[['hilang_barang','Dokumen/barang yang hilang','mis. KTP-el, BPKB, ijazah'],['hilang_no','Nomor dokumen (bila ada)'],['hilang_tgl','Tanggal hilang','','date'],['hilang_tempat','Perkiraan tempat hilang'],['hilang_kronologi','Kronologi singkat']],'Fotokopi KTP & KK'],
 ['Pernyataan','Surat Pernyataan Penghasilan','🧾',[['penghasilan','Penghasilan rata-rata per bulan (Rp)'],['tanggungan','Jumlah tanggungan keluarga']],'Fotokopi KTP & KK'],
 ['Pernyataan','Surat Kuasa','✍️',[['catatan','Nama penerima kuasa & untuk keperluan apa']],'KTP pemberi & penerima kuasa'],
 ['Adminduk','Formulir KK / KTP-el / KIA (F-1.02)','🪪',[['catatan','Yang diurus (mis. KK baru, KTP hilang, KIA anak)']],'Lihat persyaratan di halaman Layanan'],
 ['Adminduk','Formulir Perpindahan Penduduk (F-1.03)','📦',[['pindah_tujuan','Alamat tujuan pindah'],['pindah_alasan','Alasan pindah']],'KTP & KK asli'],
 ['Adminduk','Formulir Akta Kelahiran/Kematian (F-2.01)','📑',[['catatan','Akta yang diurus & nama yang bersangkutan']],'Surat keterangan lahir/kematian\nKTP & KK'],
 ['Lainnya','Surat keterangan lainnya','📝',[['catatan','Sebutkan nama surat yang dibutuhkan']],'Fotokopi KTP & KK']];
var mode='warga',L=[],pilih=null,S=null,steps=$('#steps'),dusun=[];
function ke(n){$$('#p1,#p2,#p3').forEach(function(p,i){p.classList.toggle('on',i===n)});PT.langkah(steps,n);var top=steps.getBoundingClientRect().top+scrollY-100;if(scrollY>top)scrollTo({top:top,behavior:'smooth'})}
function bangun(jsLain){
  var lain=(jsLain||[]).filter(function(j){return j.portal==='Semua'||(mode==='luar'?j.portal==='Luar desa':j.portal==='Warga desa')}).map(function(j){return{grup:j.grup||'Lainnya',nama:j.nama,ikon:j.ikon,f:(j.isian||[]).slice(0,8).map(function(l,i){return['isian'+(i+1),l]}),syarat:j.syarat||''}});
  var baw=mode==='warga'?BAWAAN.map(function(b){return{grup:b[0],nama:b[1],ikon:b[2],f:b[3],syarat:b[4]}}):[];
  L=baw.concat(lain);
  if(mode==='luar')L.push({grup:'Lainnya',nama:'Surat keterangan lainnya',ikon:'📝',f:[['catatan','Sebutkan nama surat yang dibutuhkan']],syarat:'Fotokopi KTP & KK'});
  var G={},ord=[];L.forEach(function(x,i){x.i=i;if(!G[x.grup]){G[x.grup]=[];ord.push(x.grup)}G[x.grup].push(x)});
  $('#jenis').innerHTML=ord.map(function(g){return '<h4 class="grp">'+esc(g)+'</h4><div class="opts">'+G[g].map(function(x){return '<button type="button" class="opt" data-i="'+x.i+'"><span class="e">'+esc(x.ikon||'📄')+'</span>'+esc(x.nama)+'</button>'}).join('')+'</div>'}).join('');
  $('#dyn').innerHTML=L.map(function(x){if(!x.f.length)return '';return '<div class="dyn" data-d="'+x.i+'"><h4>Data untuk '+esc(x.nama)+'</h4><div class="row2f">'+x.f.map(function(f){var t=Array.isArray(f[3])?'<select data-k="'+f[0]+'"><option value="">—</option>'+f[3].map(function(o){return '<option>'+o+'</option>'}).join('')+'</select>':'<input data-k="'+f[0]+'" type="'+(f[3]||'text')+'" maxlength="300"'+(f[2]?' placeholder="'+esc(f[2])+'"':'')+'>';return '<div class="fld"><label>'+esc(f[1])+'</label>'+t+'</div>'}).join('')+'</div></div>'}).join('');
  pilih=null;$('#syaratBox').hidden=true;
  $$('#jenis .opt').forEach(function(b){b.onclick=function(){pilih=+b.getAttribute('data-i');$$('#jenis .opt').forEach(function(x){x.classList.toggle('on',x===b)});$$('.dyn').forEach(function(d){d.classList.toggle('on',+d.getAttribute('data-d')===pilih)});var sy=String(L[pilih].syarat||'').split('\n').filter(Boolean);$('#syaratBox').hidden=!sy.length;$('#syarat').innerHTML=sy.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'<li>Nomor tiket permohonan</li>'}});
  $('#dusF').hidden=mode!=='luar';
}
var dataLain=null;
PW.api({},'web_layanan').then(function(d){dataLain=d.jenis||[];dusun=d.dusun||[];$('#dus').innerHTML='<option value="">— pilih dusun —</option>'+dusun.map(function(x){return '<option value="'+esc(x)+'">'+esc(PW.title(x))+'</option>'}).join('');bangun(dataLain)}).catch(function(){dataLain=[];bangun([])});
var kep=$('#kep');kep.oninput=function(){$('#kepN').textContent=kep.value.length};
function siap(s){S=s;mode=s.samar&&s.samar.luar?'luar':'warga';bangun(dataLain);$('#who2').innerHTML=$('#vbox').innerHTML||'';
  if(mode==='luar'){var w=s.samar||{};$('#who2').innerHTML='<div class="who"><span class="av">'+esc((w.nama||'?').slice(0,1))+'</span><div><b>'+esc(w.nama||'')+'</b><small>Penduduk luar desa · NIK ••••'+esc(w.nik4||'')+'</small></div><button type="button" data-ganti>Ganti</button></div>'}
  var g=$('#who2 [data-ganti]');if(g)g.onclick=function(){PT.ss('pt:sesi',null);ke(0);mulai()};setTimeout(function(){ke(1)},350)}
/* pilih mode */
function setMode(m){mode=m;$$('#mode .opt').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-m')===m)});$('#vbox').hidden=m!=='warga';$('#lbox').hidden=m!=='luar';if(m==='luar'&&!lcap)lcap=PT.captcha($('#lTs'))}
$$('#mode .opt').forEach(function(b){b.onclick=function(){setMode(b.getAttribute('data-m'))}});
var lcap=null;
function mulai(){
  var cur=PT.sesi();
  if(cur&&cur.samar&&cur.samar.luar){siap(cur);return}
  setMode('warga');
  PT.verifikasi($('#vbox'),siap,function(m,nik,tgl){
    if($('#vbox .luarAjak'))return;
    var a=document.createElement('div');a.className='luarAjak note-p';a.style.margin='0 0 14px';
    a.innerHTML='NIK Anda tidak terdaftar sebagai warga tetap Desa Pandanwangi? Bila Anda penduduk luar desa yang memiliki tanah, usaha, kegiatan, atau peristiwa di wilayah Pandanwangi, ajukan lewat jalur khusus. <button type="button" class="chip" style="margin-top:8px">Ya, saya penduduk luar desa →</button>';
    m.after(a);a.querySelector('button').onclick=function(){$('#lNik').value=nik||'';$('#lTgl').value=tgl||'';setMode('luar')};
  });
}
mulai();
/* foto KTP/KK: diperkecil di peramban (tetap terbaca) */
var FOTO={ktp:null,kk:null};
function kecil(file){return new Promise(function(ok,no){var img=new Image(),u=URL.createObjectURL(file);img.onload=function(){var k=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement('canvas'),q=.8,d;for(var i=0;i<6;i++){c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);d=c.toDataURL('image/jpeg',q);if(d.length<=700000)break;if(q>.55)q-=.1;else k*=.85}URL.revokeObjectURL(u);ok(d)};img.onerror=function(){no(new Error('Berkas bukan gambar.'))};img.src=u})}
[['upKtp','ktp'],['upKk','kk']].forEach(function(x){var lb=$('#'+x[0]),inp=lb.querySelector('input');inp.onchange=function(){var f=inp.files[0];inp.value='';if(!f)return;lb.querySelector('span').textContent='Memproses…';kecil(f).then(function(d){FOTO[x[1]]=d;lb.classList.add('ada');lb.style.backgroundImage='url('+d+')';lb.querySelector('span').textContent='✓ '+x[1].toUpperCase()+' siap (ketuk untuk ganti)'}).catch(function(e){lb.querySelector('span').textContent=e.message})}});
$('#lNik').oninput=function(){this.value=this.value.replace(/\D/g,'').slice(0,16)};
$('#lGo').onclick=function(){
  var m=$('#mL'),bt=this,v=function(id){return ($('#'+id).value||'').trim()};
  if(!/^\d{16}$/.test(v('lNik')))return PT.pesan(m,'NIK harus 16 angka.');
  if(!v('lNama')||!v('lTgl')||!v('lJk'))return PT.pesan(m,'Lengkapi nama, tanggal lahir, dan jenis kelamin.');
  if(!v('lAlamat')||!v('lKab'))return PT.pesan(m,'Lengkapi alamat sesuai KTP sampai kabupaten/kota.');
  if(v('lHp').replace(/\D/g,'').length<9)return PT.pesan(m,'Isi nomor HP/WA yang aktif.');
  if(!FOTO.ktp||!FOTO.kk)return PT.pesan(m,'Foto KTP dan KK wajib diunggah.');
  if(!$('#lSetuju').checked)return PT.pesan(m,'Centang pernyataan dan persetujuan penggunaan data.');
  if(!lcap||!lcap.get())return PT.pesan(m,'Tunggu atau selesaikan pemeriksaan keamanan (captcha).');
  PT.sibuk(bt,true,'Mengunggah & memeriksa…');
  PT.kirim({aksi:'luar',cf:lcap.get(),nik:v('lNik'),nama:v('lNama').toUpperCase(),tempat_lahir:v('lTmp'),tgl:v('lTgl'),jk:v('lJk'),agama:v('lAg'),pekerjaan:v('lKerja'),status_kawin:v('lKawin'),alamat:v('lAlamat'),rt:v('lRt'),rw:v('lRw'),desa:v('lDesa'),kec:v('lKec'),kab:v('lKab'),hp:v('lHp'),ktp:FOTO.ktp,kk:FOTO.kk}).then(function(r){
    PT.sibuk(bt,false);lcap.reset();
    if(!r.ok){if(r.warga){setMode('warga');PT.verifikasi($('#vbox'),siap)}return PT.pesan(m,r.pesan||'Gagal memproses data.')}
    var s={sesi:r.sesi,samar:r.samar,exp:Date.now()+28*60000};PT.ss('pt:sesi',s);siap(s);
  });
};
$('#kirim').onclick=function(){
  var m=$('#m2'),bt=this;
  if(pilih==null)return PT.pesan(m,'Pilih jenis surat terlebih dahulu.');
  if(kep.value.trim().length<5)return PT.pesan(m,'Tuliskan keperluan surat (minimal 5 huruf).');
  if(mode==='luar'&&!$('#dus').value)return PT.pesan(m,'Pilih lokasi (dusun) di Desa Pandanwangi yang berkaitan dengan permohonan Anda.');
  var isian={};$$('.dyn[data-d="'+pilih+'"] [data-k]').forEach(function(x){if(x.value.trim())isian[x.getAttribute('data-k')]=x.value.trim()});
  if(/lainnya$/.test(L[pilih].nama)&&!isian.catatan)return PT.pesan(m,'Sebutkan nama surat yang Anda butuhkan.');
  var s=PT.sesi();if(!s){PT.pesan(m,'Sesi verifikasi berakhir. Silakan verifikasi ulang.');ke(0);mulai();return}
  PT.sibuk(bt,true,'Mengirim…');
  PT.kirim({aksi:'surat',sesi:s.sesi,jenis:L[pilih].nama,keperluan:kep.value.trim(),hp:$('#hp').value.trim(),ambil:$('#ambil').value,dusun_tujuan:$('#dus').value,isian:isian}).then(function(r){
    PT.sibuk(bt,false);
    if(!r.ok){if(r.sesiHabis){PT.ss('pt:sesi',null);ke(0);mulai()}return PT.pesan(m,r.pesan||'Gagal mengirim.')}
    var p3=$('#p3');p3.innerHTML=PT.tiketHtml(r.tiket,r.nik4,'Permohonan terkirim!','Petugas akan memproses permohonan <b>'+esc(L[pilih].nama)+'</b> pada jam kerja. Pantau statusnya di halaman Lacak Tiket. Bila status sudah <b>Siap diambil</b>, datanglah ke kantor desa membawa persyaratan'+(mode==='luar'?' serta KTP dan KK asli':' serta e-KTP dan KK asli')+'.');
    PT.pasangSalin(p3);ke(2);PT.konfeti($('.panel-f'));
  });
};
})();
