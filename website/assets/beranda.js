/* Beranda: statistik penduduk & ringkasan APBDes dari aplikasi */
(function(){
var P=window.PW,$=P.$,esc=P.esc,nf=P.nf;
function setCount(id,v){P.setCount($('#'+id),v)}
function grow(box){P.observe(box.parentNode);if(box.classList.contains('in'))setTimeout(function(){P.$$('[data-w]',box).forEach(function(x){x.style.width=x.getAttribute('data-w')})},60)}
function hbar(id,list,color){
  var box=$('#'+id);if(!box)return;
  var max=Math.max.apply(null,list.map(function(x){return x.n}))||1;
  box.innerHTML=list.map(function(x){return '<div class="hbar-r"><span title="'+esc(x.k)+'">'+esc(x.k)+'</span><div class="t"><i data-w="'+(x.n/max*100).toFixed(1)+'%"'+(color?' style="background:'+color+'"':'')+'></i></div><b>'+nf.format(x.n)+'</b></div>'}).join('');
  grow(box);
}
document.addEventListener('pw:profil',function(ev){
  var d=ev.detail;if(!d||!d.statistik)return;var s=d.statistik;
  setCount('stTot',s.total);setCount('stL',s.L);setCount('stP',s.P);setCount('stKK',s.kk);setCount('hcPend',s.total);setCount('hcKK',s.kk);
  if(d.diperbarui)$('#dmUpd').textContent='Diperbarui '+d.diperbarui.slice(0,10).split('-').reverse().join('/')+'.';
  if(s.dusun){
    $('#dusunChips').innerHTML=s.dusun.map(function(x){return '<span>'+esc(P.title(x.k.replace(/^DUSUN\s+/i,'')))+' <em>'+nf.format(x.total)+' jiwa</em></span>'}).join('');
    hbar('hbDusun',s.dusun.map(function(x){return{k:P.title(x.k.replace(/^DUSUN\s+/i,'')),n:x.total}}),'linear-gradient(90deg,var(--senja),var(--padi))');
  }
  if(s.usia){
    var pyr=$('#pyr'),max=1;s.usia.forEach(function(u){max=Math.max(max,u.L,u.P)});
    pyr.innerHTML=s.usia.slice().reverse().map(function(u){return '<div class="pyr-r" title="'+u.k+' th: L '+u.L+', P '+u.P+'"><div class="l" data-w="'+(u.L/max*100).toFixed(1)+'%"></div><span>'+u.k+'</span><div class="p" data-w="'+(u.P/max*100).toFixed(1)+'%"></div></div>'}).join('');
    grow(pyr);
  }
  var ds=s.dist||{};
  if(ds.pekerjaan)hbar('hbKerja',ds.pekerjaan.slice(0,8).map(function(x){return{k:P.title(x.k),n:x.n}}));
  if(ds.pendidikan)hbar('hbDidik',ds.pendidikan.map(function(x){return{k:P.title(x.k),n:x.n}}),'linear-gradient(90deg,var(--padi),var(--senja-2))');
  var br=(d.berita||[]);
  if(br.length){$('#berita').hidden=false;$('#beritaList').innerHTML=br.slice(0,6).map(function(b,i){return '<article class="card reveal d'+(i%3+1)+'"><span class="eyebrow">'+esc(b.kategori||'Berita')+' · '+esc((b.tanggal||'').split('-').reverse().join('/'))+'</span><h3 style="margin-top:10px">'+esc(b.judul)+'</h3><p>'+esc((b.isi||'').slice(0,180))+'…</p></article>'}).join('');P.observe($('#berita'))}
  var th=(d.apbdes_tahun||[])[0];
  if(th)P.api({aksi:'apbdes',tahun:th}).then(function(a){
    var ang=0,rea=0;(a.rows||[]).forEach(function(r){if(/^5/.test(r.kode)){ang+=+r.anggaran||0;rea+=+r.realisasi||0}});
    var pc=ang?Math.round(rea/ang*100):0;$('#hcTh').textContent=th;setCount('hcReal',pc);var b=$('#hcBar');b.setAttribute('data-w',Math.min(100,pc)+'%');if(b.classList.contains('in'))b.style.width=Math.min(100,pc)+'%';
  }).catch(function(){});
});
})();
