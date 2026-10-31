/* Petugas & lembaga desa (BPD, RT, RW, LPMD, PKK, Karang Taruna, BUM Desa, KDMP) dari aplikasi */
(function(){
var P=window.PW,$=P.$,$$=P.$$,esc=P.esc;
var NAMA={'BPD':'BPD','RW':'Ketua RW','RT':'Ketua RT','LPMD':'LPMD','PKK':'TP PKK','Karang Taruna':'Karang Taruna','BUM Desa':'BUM Desa','KDMP':'Koperasi Desa Merah Putih'};
var IKON={'BPD':'🏛️','RW':'🏘️','RT':'🏠','LPMD':'🛠️','PKK':'🌸','Karang Taruna':'⚡','BUM Desa':'🏪','KDMP':'🤝'};
var css=document.createElement('style');
css.textContent='.pg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}.pg{display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:18px;border:2px solid var(--line);background:var(--paper);transition:.25s}.pg:hover{border-color:var(--ink);transform:translateY(-3px);box-shadow:var(--hard)}.pg .av{width:54px;height:54px;flex:none;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:var(--sand);font:800 18px var(--f-d);border:2px solid var(--ink)}.pg .av img{width:100%;height:100%;object-fit:cover}.pg b{display:block;font-family:var(--f-d);font-size:16px;line-height:1.2}.pg small{display:block;color:var(--muted);font-weight:600;font-size:12.5px;line-height:1.3}.pg.top{background:var(--padi);border-color:var(--ink)}.pg-rw{margin-bottom:22px}.pg-rw h4{font-size:17px;margin:0 0 10px;display:flex;align-items:center;gap:8px}.pg-rw h4 span{font:700 12px var(--f-b);background:var(--ink);color:var(--padi);padding:3px 9px;border-radius:999px}.pg-cnt{font-size:12px;opacity:.7;margin-left:4px}.pg.ft{padding:0 0 0 14px;align-items:stretch;overflow:hidden;min-height:96px}.pg.ft .tx{flex:1;min-width:0;align-self:center;padding:12px 0}.pg.ft .pf{width:40%;max-width:120px;flex:none;border-left:2px solid var(--ink);background:var(--sand)}.pg.ft .pf img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}@media(max-width:640px){.pg-grid{grid-template-columns:1fr 1fr;gap:8px}.pg{padding:9px;gap:8px;flex-direction:column;text-align:center}.pg .av{width:46px;height:46px}.pg b{font-size:14px}.pg small{font-size:11.5px}.pg.ft{flex-direction:row;text-align:left;padding:0 0 0 10px;min-height:84px}.pg.ft .pf{width:42%}}';
document.head.appendChild(css);
function ini(n){return String(n||'?').replace(/,.*$/,'').split(/\s+/).slice(0,2).map(function(w){return w[0]||''}).join('').toUpperCase()}
function judul(n){return String(n||'').toLowerCase().replace(/(^|[\s.'-])([a-z])/g,function(m,a,b){return a+b.toUpperCase()})}
function rwDari(j){var m=String(j).match(/RW\s*0*(\d+)/i);return m?+m[1]:99}
function rtDari(j){var m=String(j).match(/RT\s*0*(\d+)/i);return m?+m[1]:99}
var FT={};
function kartu(x,top){var f=x.foto&&(P.fotoUrl(x.foto)||FT[x.foto]),tx='<div class="tx"><b>'+esc(judul(x.nama))+'</b><small>'+esc(x.jabatan)+'</small></div>';
  if(f)return '<div class="pg ft reveal'+(top?' top':'')+'">'+tx+'<span class="pf"><img src="'+f+'" alt="Foto '+esc(judul(x.nama))+'" loading="lazy"'+(FT[x.foto]&&f!==FT[x.foto]?' data-alt="'+FT[x.foto]+'"':'')+' onerror="if(this.dataset.alt){this.src=this.dataset.alt;this.removeAttribute(\'data-alt\')}else{this.closest(\'.pg\').classList.remove(\'ft\');this.parentNode.remove()}"></span></div>';
  return '<div class="pg reveal'+(top?' top':'')+'"><span class="av">'+esc(ini(x.nama))+'</span>'+tx+'</div>'}
function isi(box,kel,L){
  var A=L.filter(function(x){return x.kelompok===kel});
  if(!A.length)return '<p class="muted">Belum ada data pengurus.</p>';
  if(kel==='RT'){
    var g={};A.forEach(function(x){var r=rwDari(x.jabatan);(g[r]=g[r]||[]).push(x)});
    return Object.keys(g).sort(function(a,b){return a-b}).map(function(r){return '<div class="pg-rw"><h4><span>RW '+String(r).padStart(2,'0')+'</span>'+g[r].length+' RT</h4><div class="pg-grid">'+g[r].sort(function(a,b){return rtDari(a.jabatan)-rtDari(b.jabatan)}).map(function(x){return kartu(x)}).join('')+'</div></div>'}).join('');
  }
  if(kel==='RW')A.sort(function(a,b){return rwDari(a.jabatan)-rwDari(b.jabatan)});
  return '<div class="pg-grid">'+A.map(function(x){return kartu(x,/^(ketua|direktur|ketua pengurus)\b/i.test(x.jabatan)&&!/wakil/i.test(x.jabatan))}).join('')+'</div>';
}
document.addEventListener('pw:profil',function(ev){
  var box=$('#pgBox');if(!box)return;
  var d=ev.detail,L=(d&&d.petugas)||[],kels=box.getAttribute('data-kel').split(',').filter(function(k){return L.some(function(x){return x.kelompok===k})});
  if(!kels.length){box.innerHTML='<p class="muted">Data pengurus belum tersedia.</p>';return}
  function tampil(){
    box.innerHTML='<div class="tabs" data-tabs>'+kels.map(function(k,i){var n=L.filter(function(x){return x.kelompok===k}).length;return '<button class="chip'+(i?'':' on')+'" data-tab="pg-'+i+'">'+(IKON[k]||'')+' '+esc(NAMA[k]||k)+'<span class="pg-cnt">'+n+'</span></button>'}).join('')+'</div>'+
      kels.map(function(k,i){return '<div class="tab-p'+(i?'':' on')+'" id="pg-'+i+'">'+isi(box,k,L)+'</div>'}).join('');
    var bs=$$('[data-tab]',box),ps=$$('.tab-p',box);
    bs.forEach(function(b){b.onclick=function(){bs.forEach(function(x){x.classList.toggle('on',x===b)});ps.forEach(function(p){p.classList.toggle('on',p.id===b.getAttribute('data-tab'))});P.observe(box)}});
    P.observe(box);
  }
  var ids=L.filter(function(x){return x.foto&&kels.indexOf(x.kelompok)>-1}).map(function(x){return x.foto});
  if(ids.length)P.api({aksi:'foto',ids:ids.slice(0,200)}).then(function(m){FT=m||{};tampil()}).catch(tampil);else tampil();
});
})();
