/* Halaman Transparansi — informasi publik desa (FRC Desa Antikorupsi) dari aplikasi desa */
(function(){
var P=PW,$=P.$,esc=P.esc;
var rp=function(v){return 'Rp '+Math.round(+v||0).toLocaleString('id-ID')};
var rs=function(v){return 'Rp '+P.rpShort(+v||0)};
var pct=function(a,b){return b?Math.round(a/b*1000)/10:0};
var fd=function(s){if(!/^\d{4}-\d{2}-\d{2}/.test(s||''))return s||'';var d=new Date(s.slice(0,10)+'T00:00:00');return d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})};
var SUMBER={DDS:'Dana Desa',ADD:'Alokasi Dana Desa',PBH:'Bagi Hasil Pajak',PAD:'PAD',BKK:'Bantuan Kab.',BKP:'Bantuan Prov.',SWD:'Swadaya',DLL:'Lain-lain'};
var SKM=['Persyaratan','Prosedur','Waktu','Biaya/tarif','Produk layanan','Kompetensi petugas','Perilaku petugas','Penanganan pengaduan','Sarana prasarana'];
var empty=function(t){return '<div class="empty">'+esc(t)+'</div>'};
var tbl=function(h,rows){return '<div class="tw"><table class="tt"><thead><tr>'+h.map(function(x){return '<th'+(x.r?' class="r"':'')+'>'+esc(x.t||x)+'</th>'}).join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>'};
function tabs(el,list,cur,fn){el.innerHTML=list.map(function(x){return '<button class="chip'+(x[0]===cur?' on':'')+'" data-v="'+esc(x[0])+'">'+esc(x[1])+'</button>'}).join('');el.onclick=function(e){var b=e.target.closest('button');if(b)fn(b.getAttribute('data-v'))}}
var D,TH=String(new Date().getFullYear());

function load(th){
  TH=th;$('#upd').textContent='Memuat data '+th+'…';
  P.api({tahun:th},'web_transparansi').then(function(d){D=d;render()}).catch(function(){$('#upd').textContent='Data belum dapat dimuat. Coba muat ulang halaman.'});
}
function render(){
  var d=D,th=d.tahun;
  var Y=(d.tahun_list||[]).slice(0,6);if(Y.indexOf(th)<0)Y.unshift(th);
  $('#years').innerHTML=Y.map(function(y){return '<button class="chip'+(y===th?' on':'')+'" data-y="'+esc(y)+'">'+esc(y)+'</button>'}).join('');
  $('#years').onclick=function(e){var b=e.target.closest('button');if(b){history.replaceState(null,'','#'+b.getAttribute('data-y'));load(b.getAttribute('data-y'))}};
  var pk=d.paket||[],nil=pk.reduce(function(s,x){return s+(+x.nilai||0)},0),rea=pk.reduce(function(s,x){return s+(+x.realisasi||0)},0),nh=(d.perdes||[]).length+(d.perkades||[]).length+(d.sk||[]).length;
  $('#ring').innerHTML=[['Paket kegiatan '+th,pk.length,'swakelola '+pk.filter(function(x){return /swakelola/i.test(x.cara||'')}).length+' · penyedia '+pk.filter(function(x){return !/swakelola/i.test(x.cara||'')}).length],['Nilai paket',rs(nil),'pagu paket kegiatan'],['Realisasi paket',pct(rea,nil).toLocaleString('id-ID')+'%',rs(rea)+' terserap'],['Produk hukum',nh,'Perdes, Perkades & Keputusan']].map(function(k){return '<div class="tk"><small>'+esc(k[0])+'</small><b>'+esc(k[1])+'</b><span>'+esc(k[2])+'</span></div>'}).join('');
  rencana('rkp');paket();hukum('perdes');skm();adu();sg();pbb();harga();
  $('#upd').innerHTML='<b>Catatan:</b> data diperbarui otomatis dari aplikasi Pemerintah Desa Pandanwangi ('+esc(fd((d.diperbarui||'').slice(0,10)))+' '+esc((d.diperbarui||'').slice(11))+' WIB). Data pribadi warga tidak ditampilkan sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.';
}
function rencana(cur){
  var d=D,th=+d.tahun;
  tabs($('#rTab'),[['rkp','RKP Desa '+th+' & '+(th+1)],['rpjm','RPJM Desa'],['mus','Musyawarah desa'],['dok','Dokumen perencanaan']],cur,rencana);
  var el=$('#rIsi');
  if(cur==='rkp'){var R=d.rkp||[];el.innerHTML=R.length?tbl(['Tahun','Bidang','Kegiatan','Volume',{t:'Biaya',r:1},'Sumber'],R.map(function(x){return '<tr><td>'+esc(x.tahun_rkp)+'</td><td>'+esc(x.bidang||'')+'</td><td>'+esc(x.kegiatan||'')+(x.terlaksana==='Ya'?' <span class="pill ok">terlaksana</span>':'')+'</td><td>'+esc([x.volume,x.satuan].filter(Boolean).join(' '))+'</td><td class="r">'+(x.total?rp(x.total):'-')+'</td><td>'+esc(SUMBER[x.sumber]||x.sumber||'')+'</td></tr>'})):empty('Daftar kegiatan RKP Desa '+th+'/'+(th+1)+' belum diterbitkan.')}
  else if(cur==='rpjm'){var M=d.rpjm||[];el.innerHTML=M.length?tbl(['Bidang','Kegiatan','Lokasi','Volume','Sasaran','Tahun',{t:'Perkiraan biaya',r:1}],M.map(function(x){return '<tr><td>'+esc(x.bidang||'')+'</td><td>'+esc(x.kegiatan||'')+'</td><td>'+esc(x.lokasi||'')+'</td><td>'+esc(x.volume||'')+'</td><td>'+esc(x.sasaran||'')+'</td><td>'+esc(x.tahun||'')+'</td><td class="r">'+(x.jumlah?rp(x.jumlah):'-')+'</td></tr>'})):empty('Daftar kegiatan RPJM Desa belum diterbitkan.')}
  else if(cur==='mus'){var U=d.musyawarah||[];el.innerHTML=U.length?tbl(['Tanggal','Musyawarah','Tempat','Untuk RKP'],U.map(function(x){return '<tr><td>'+esc(fd(x.tanggal))+'</td><td>'+esc(x.jenis||'')+'</td><td>'+esc(x.tempat||'')+'</td><td>'+esc(x.tahun_rkp||'')+'</td></tr>'}))+'<p class="note" style="margin-top:8px">Musyawarah dihadiri BPD, lembaga desa, tokoh masyarakat, perempuan, dan perwakilan warga miskin.</p>':empty('Belum ada catatan musyawarah.')}
  else{var K=(d.perdes||[]).filter(function(x){return /rpjm|rkp|anggaran pendapatan|apb|lpj|pertanggungjawaban/i.test(x.tentang||'')});el.innerHTML=K.length?tbl(['Peraturan Desa','Tentang','Ditetapkan'],K.map(function(x){return '<tr><td>Nomor '+esc(x.nomor)+' Tahun '+esc(x.tahun)+'</td><td>'+esc(x.tentang)+'</td><td>'+esc(fd(x.tgl))+'</td></tr>'})):empty('Belum ada dokumen perencanaan yang tercatat.')}
}
function paket(){
  var pk=D.paket||[];
  if(!pk.length){$('#pIsi').innerHTML=empty('Daftar paket kegiatan '+D.tahun+' belum diterbitkan.');return}
  var sisa=pk.reduce(function(s,x){return s+Math.max(0,(+x.nilai||0)-(+x.realisasi||0))},0),blm=pk.filter(function(x){return (+x.realisasi||0)<(+x.nilai||0)-1});
  $('#pIsi').innerHTML='<p class="note" style="margin:0 0 8px">'+blm.length+' dari '+pk.length+' kegiatan belum terealisasi penuh · sisa anggaran paket '+esc(rp(sisa))+'.</p>'+tbl(['No','Kegiatan','Cara pengadaan','Keluaran',{t:'Nilai',r:1},{t:'Realisasi',r:1},'Progres','Sumber'],pk.map(function(x){var p=pct(+x.realisasi||0,+x.nilai||0),pn=/swakelola/i.test(x.cara||'');return '<tr><td>'+esc(x.no||'')+'</td><td><b>'+esc(x.nama||'')+'</b>'+(x.lokasi?'<br><small>'+esc(x.lokasi)+'</small>':'')+'</td><td><span class="pill">'+(pn?'Swakelola':'Penyedia')+'</span></td><td>'+esc([x.volume,x.satuan].filter(Boolean).join(' '))+'</td><td class="r">'+esc(rp(x.nilai))+'</td><td class="r">'+esc(rp(x.realisasi))+'</td><td><div class="tbar"><i style="width:'+Math.min(100,p)+'%"></i></div><small>'+(!(+x.nilai)?'belum dianggarkan':p.toLocaleString('id-ID')+'%'+(p<100?' · belum selesai':''))+'</small></td><td>'+esc(SUMBER[x.sumber]||x.sumber||'')+'</td></tr>'}));
}
function hukum(cur){
  var d=D;tabs($('#hTab'),[['perdes','Peraturan Desa ('+(d.perdes||[]).length+')'],['perkades','Peraturan Kepala Desa ('+(d.perkades||[]).length+')'],['sk','Keputusan Kepala Desa ('+(d.sk||[]).length+')']],cur,hukum);
  var R=d[cur]||[];
  $('#hIsi').innerHTML=R.length?tbl([cur==='sk'?'Nomor':'Nomor & tahun','Tentang','Tanggal'].concat(cur==='perdes'?['Lembaran Desa']:cur==='perkades'?['Berita Desa']:[]),R.map(function(x){return '<tr><td style="white-space:nowrap">'+(cur==='sk'?esc(x.nomor):'Nomor '+esc(x.nomor)+' Tahun '+esc(x.tahun))+'</td><td>'+esc(x.tentang||'')+'</td><td style="white-space:nowrap">'+esc(fd(x.tgl))+'</td>'+(cur==='perdes'?'<td>'+esc(x.lembaran||'-')+'</td>':cur==='perkades'?'<td>'+esc(x.berita||'-')+'</td>':'')+'</tr>'})):empty('Belum ada data.');
}
function skm(){
  var s=D.skm||{},n=+s.n||0;
  if(!n){$('#skm').innerHTML=empty('Belum ada responden survei tahun '+D.tahun+'. Jadilah yang pertama menilai layanan desa.');return}
  var nrr=(s.nrr||[]).map(function(v){return v==null?null:+v}),ok=nrr.filter(function(v){return v!=null}),ikm=ok.length?ok.reduce(function(a,b){return a+b},0)/ok.length*25:0;
  var mutu=ikm>=88.31?'A (Sangat Baik)':ikm>=76.61?'B (Baik)':ikm>=65?'C (Kurang Baik)':'D (Tidak Baik)';
  $('#skm').innerHTML='<div class="tp-grid" style="grid-template-columns:1fr 1fr;margin-bottom:12px"><div class="tk"><small>Indeks Kepuasan</small><b>'+ikm.toFixed(2).replace('.',',')+'</b><span>mutu '+esc(mutu)+'</span></div><div class="tk"><small>Responden</small><b>'+n+'</b><span>tahun '+esc(D.tahun)+'</span></div></div><div class="bars">'+SKM.map(function(u,i){var v=nrr[i];return '<div class="br"><span>'+esc(u)+'</span><div class="tbar"><i style="width:'+(v?v/4*100:0)+'%"></i></div><b>'+(v?v.toFixed(2).replace('.',','):'-')+'</b></div>'}).join('')+'</div><p class="note">Skala 1–4 per unsur (PermenPANRB 14/2017).</p>';
}
function adu(){
  var a=D.pengaduan||{},n=+a.total||0;
  if(!n){$('#adu').innerHTML=empty('Belum ada laporan warga tercatat tahun '+D.tahun+'.');return}
  var K=a.kategori||{};
  $('#adu').innerHTML='<div class="tp-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px"><div class="tk"><small>Masuk</small><b>'+n+'</b></div><div class="tk"><small>Selesai</small><b>'+(+a.selesai||0)+'</b><span>'+pct(+a.selesai||0,n)+'%</span></div><div class="tk"><small>Rata-rata selesai</small><b>'+(a.rata_hari!=null?String(a.rata_hari).replace('.',','):'-')+'</b><span>hari</span></div></div><div class="bars">'+Object.keys(K).map(function(k){return '<div class="br"><span>'+esc(k)+'</span><div class="tbar"><i style="width:'+pct(K[k],n)+'%"></i></div><b>'+K[k]+'</b></div>'}).join('')+'</div>';
}
function sg(){
  var s=D.satgas;$('#sg').innerHTML=s?'<p style="margin:0;color:rgba(248,242,228,.85)">Satuan Tugas Sapu Bersih Pungutan Liar Desa ditetapkan dengan Keputusan Kepala Desa Nomor '+esc(s.nomor)+(s.tgl?' tanggal '+esc(fd(s.tgl)):'')+', bersama Babinsa dan Bhabinkamtibmas.</p>':'';
}
function pbb(){
  var R=(D.pbb||[]).filter(function(x){return +x.ketetapan>0});
  if(!R.length){$('#pbbIsi').innerHTML=empty('Data SPPT PBB '+D.tahun+' belum tersedia.');return}
  var T=R.reduce(function(s,x){return [s[0]+(+x.ketetapan||0),s[1]+(+x.lunas||0)]},[0,0]);
  var nm=function(d){return /^lainnya$/i.test(d)?'Wajib pajak luar desa / dusun belum diisi':d.replace(/^DUSUN /i,'Dusun ').replace(/\b(\w)(\w*)/g,function(m,a,b){return a+b.toLowerCase()}).replace(/^Dusun/,'Dusun')};
  $('#pbbIsi').innerHTML='<p style="margin:0 0 10px"><b style="font:800 28px var(--f-d)">'+pct(T[1],T[0]).toLocaleString('id-ID')+'%</b> <span class="note">'+esc(rs(T[1]))+' dari '+esc(rs(T[0]))+'</span></p><div class="bars">'+R.map(function(x){var p=pct(+x.lunas||0,+x.ketetapan||0);return '<div class="br"><span>'+esc(nm(x.dusun))+'</span><div class="tbar"><i style="width:'+Math.min(100,p)+'%"></i></div><b>'+p.toLocaleString('id-ID')+'%</b></div>'}).join('')+'</div>';
}
function harga(){
  var H=D.harga||[];$('#hrg').innerHTML=H.length?'<p class="note" style="margin:0 0 8px">Pantauan '+esc(fd(H[0].tanggal))+'</p>'+tbl(['Komoditas',{t:'Harga',r:1},'Satuan'],H.map(function(x){return '<tr><td>'+esc(x.komoditas||'')+'</td><td class="r">'+esc(rp(x.harga))+'</td><td>'+esc(x.satuan||'')+'</td></tr>'})):empty('Pantauan harga belum diterbitkan.');
  var b=D.bumdes;$('#bum').innerHTML=b&&b.nama?'<h3 style="font:800 18px var(--f-d);margin:0 0 4px">BUM Desa '+esc(b.nama)+'</h3><p class="note" style="margin:0">'+esc([b.unit,b.tahun&&'laporan '+b.tahun,b.pades&&'kontribusi PADes '+rp(b.pades)].filter(Boolean).join(' · '))+'</p>':'';
}
var want=(location.hash.match(/\d{4}/)||[])[0];
load(want||TH);
})();
