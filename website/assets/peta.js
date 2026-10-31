/* Peta Desa Pandanwangi: batas RT (6 warna dusun), jalan & sungai, fasilitas.
   Data peta: GeoJSON yang diunggah admin lewat aplikasi Pemdes (menu Website Desa), cadangan: data/*.geojson.
   Angka per RT diambil langsung dari aplikasi (RPC web_peta: hanya jumlah, tanpa data pribadi). */
(function(){
'use strict';
var P=window.PW,box=document.getElementById('petaDesa');if(!box||!P)return;
var V='?v=223';
var SB='https://niaqgsqfsztcsgdyzavt.supabase.co',KEY='sb_publishable_FrjuzHg6pJFQhJRIqBoXIw_5sL7E5sH';
var WARNA={'krajan 1':'#e8b84a','krajan 2':'#ee7340','krajan 3':'#5b8a4c','timur sawah':'#3b6fc4','tunjungan':'#9b5fb5','pemukiman':'#2aa198'};
var URUT=['krajan 1','krajan 2','krajan 3','timur sawah','tunjungan','pemukiman'];
var esc=P.esc,nf=function(n){return (+n||0).toLocaleString('id-ID')};
var css=document.createElement('style');
css.textContent=
'#petaDesa{position:relative;background:#f3ead4}#petaDesa .leaflet-container{background:transparent;font:inherit}'+
'#petaDesa.polos .leaflet-container{background:radial-gradient(circle at 30% 20%,#fbf4e2,#efe3c8 70%)}'+
'.pt-rt{transition:fill-opacity .25s,stroke-width .25s}'+
'.pt-draw{stroke-dasharray:var(--L);stroke-dashoffset:var(--L);animation:ptDraw 1.4s var(--d) cubic-bezier(.5,0,.2,1) forwards,ptFill .8s calc(var(--d) + .7s) ease forwards;fill-opacity:0}'+
'@keyframes ptDraw{to{stroke-dashoffset:0}}@keyframes ptFill{to{fill-opacity:var(--fo)}}'+
'.pt-ln{animation:ptLn 1.6s 1.2s ease both}@keyframes ptLn{from{opacity:0}}'+
'.leaflet-tooltip.pt-lab{background:linear-gradient(135deg,#e8b84a,#ee7340);border:1.5px solid #0f241a;border-radius:999px;box-shadow:1.5px 1.5px 0 #0f241a;font:800 9.5px/1 var(--f-b);color:#0f241a;padding:3px 7px;white-space:nowrap}.leaflet-tooltip.pt-lab:before{display:none}'+
'.leaflet-tooltip.pt-cx{background:none;border:0;box-shadow:none;padding:0;font:700 11px/1.1 var(--f-b);color:#5d4a2e;text-shadow:0 0 3px #fffaf0,0 0 3px #fffaf0;white-space:nowrap;text-align:center}.leaflet-tooltip.pt-cx:before{display:none}'+
'.leaflet-tooltip.pt-cx.kab{font:800 15px var(--f-d);letter-spacing:.06em;text-transform:uppercase;color:#0f241a}.leaflet-tooltip.pt-cx.kec{font:800 12.5px var(--f-d);color:#3d3326}.leaflet-tooltip.pt-cx.laut{font:italic 700 14px var(--f-b);color:#2b6cb0;letter-spacing:.2em;text-shadow:none}.leaflet-tooltip.pt-cx.luar{color:#8a7d66;font-size:12px}'+
'.pt-ic{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#fffaf0;border:2px solid #0f241a;font-size:13px;box-shadow:2px 2px 0 #0f241a;animation:ptPop .5s var(--d) cubic-bezier(.3,1.6,.5,1) both}'+
'.pt-ic.kecil{width:10px;height:10px;border-width:1.5px;box-shadow:none;background:#7a6a55}'+
'@keyframes ptPop{from{transform:scale(0)}}'+
'.pt-ui{position:absolute;z-index:500;display:flex;gap:6px;flex-wrap:wrap}'+
'.pt-ui.tr{top:10px;right:10px;justify-content:flex-end}.pt-ui.bl{left:10px;bottom:10px;right:60px}'+
'.pt-ui button{font:700 12px/1 var(--f-b);padding:7px 10px;border-radius:999px;border:2px solid #0f241a;background:#fffaf0;color:#0f241a;cursor:pointer;box-shadow:2px 2px 0 #0f241a}'+
'.pt-ui button.on{background:#0f241a;color:#e8b84a}'+
'.pt-ui .dz{display:inline-flex;align-items:center;gap:5px}.pt-ui .dz i{width:10px;height:10px;border-radius:3px;border:1.5px solid #0f241a}'+
'.pt-ui .dz.off{opacity:.45}'+
'.pt-pop .leaflet-popup-content-wrapper{border-radius:18px;border:2px solid #0f241a;box-shadow:5px 5px 0 #0f241a;padding:0;background:#fffaf0;overflow:hidden}'+
'.pt-pop .leaflet-popup-content{margin:0;width:262px!important;font:inherit}.pt-pop .leaflet-popup-tip{border:2px solid #0f241a;background:#fffaf0}'+
'.pt-h{padding:12px 14px 10px;color:#0f241a}.pt-h b{font:800 17px/1.1 var(--f-d);display:block}.pt-h small{font-weight:700;font-size:12px;opacity:.8}'+
'.pt-g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px 12px;border-top:2px solid #0f241a}'+
'.pt-g div{background:#f3ead4;border-radius:10px;padding:7px 6px;text-align:center}.pt-g b{display:block;font:800 16px/1 var(--f-d);color:#0f241a}.pt-g small{font-size:10.5px;color:#5d6b62;font-weight:700}'+
'.pt-o{padding:4px 12px 12px;display:flex;flex-direction:column;gap:7px}'+
'.pt-o div{display:flex;gap:9px;align-items:center}.pt-o .av{width:38px;height:38px;border-radius:50%;overflow:hidden;flex:none;border:2px solid #0f241a;background:#efe3c8;display:grid;place-items:center;font:800 12px var(--f-d)}'+
'.pt-o .av img{width:100%;height:100%;object-fit:cover;object-position:50% 20%}.pt-o b{display:block;font-size:13px;line-height:1.2}.pt-o small{font-size:11px;color:#5d6b62}'+
'.pt-o .ks{opacity:.6;font-style:italic}'+
'.pt-ld{position:absolute;inset:0;display:grid;place-items:center;z-index:600;font:700 14px var(--f-b);color:#0f241a;background:#f3ead4;transition:opacity .5s}'+
'@media(max-width:640px){#petaDesa{height:500px!important}.pt-ui button{font-size:10.5px;padding:5px 8px;box-shadow:1px 1px 0 #0f241a}.pt-ui.bl{gap:4px;right:10px}.pt-ui .dz i{width:8px;height:8px}.pt-ic{width:20px;height:20px;font-size:11px}.pt-pop .leaflet-popup-content{width:236px!important}.pt-g b{font-size:14px}}'+
'#petaDesa.pop .pt-ui{opacity:0;pointer-events:none}.pt-ui{transition:opacity .2s}'+
'.pt-ft{position:absolute;right:10px;bottom:10px;z-index:500;font-size:11px;background:#fffaf0cc;border-radius:8px;padding:3px 7px;color:#5d6b62}';
document.head.appendChild(css);

/* fetch dengan batas waktu: peta tetap tampil walau satu lapisan lambat */
function ambil(u,ms){var c=window.AbortController?new AbortController():null;var t=setTimeout(function(){c&&c.abort()},ms||10000);return fetch(u,c?{signal:c.signal}:{}).then(function(r){clearTimeout(t);if(!r.ok)throw 0;return r.json()})}
function muat(src,tag){return new Promise(function(ok,no){var e=document.createElement(tag);if(tag==='link'){e.rel='stylesheet';e.href=src;e.onload=ok;e.onerror=ok}else{e.src=src;e.onload=ok;e.onerror=no}document.head.appendChild(e)})}
function ambilGeo(k,cad){var u=P.wk&&P.wk('peta_'+k);if(!(u&&/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/web\/peta\//.test(u)))u='data/'+cad+'.geojson'+V;return ambil(u).catch(function(){return ambil('data/'+cad+'.geojson',10000)})}
function ambilData(){return fetch(SB+'/rest/v1/rpc/web_peta',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:'{}'}).then(function(r){return r.ok?r.json():{}}).catch(function(){return {}})}
function p3(x){x=String(x==null?'':x).replace(/\D/g,'');return x?('00'+(+x)).slice(-3):''}
function sifat(p){ /* properti RT: bentuk aplikasi (rt,rw,dusun,luas) atau bentuk BPS (nmsls) */
  var rt=p.rt,rw=p.rw,ds=p.dusun,m=/RT\s*(\d+)\s*RW\s*(\d+)\s*(?:DUSUN\s*)?(.*)/i.exec(p.nmsls||'');
  if(m){rt=rt||m[1];rw=rw||m[2];ds=ds||m[3]}
  return {rt:p3(rt),rw:p3(rw),dusun:String(ds||'').replace(/^dusun\s*/i,'').trim(),luas:p.luas}}
function luasHa(g){ /* luas kira-kira (ha) dari koordinat derajat */
  var t=0,R=6378137,poly=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
  poly.forEach(function(pg){pg.forEach(function(ring,ri){var s=0;for(var i=0;i<ring.length-1;i++){var a=ring[i],b=ring[i+1];s+=(b[0]-a[0])*Math.PI/180*(2+Math.sin(a[1]*Math.PI/180)+Math.sin(b[1]*Math.PI/180))}t+=(ri?-1:1)*Math.abs(s*R*R/2)})});
  return t/1e4}
function ini(n){return String(n||'?').replace(/,.*$/,'').split(/\s+/).slice(0,2).map(function(w){return w[0]||''}).join('').toUpperCase()}
function orang(o,peran){
  if(!o||!o.nama)return '<div class="ks"><span class="av">–</span><span><b>Belum ada data</b><small>'+esc(peran)+'</small></span></div>';
  var f=o.foto&&P.fotoUrl(o.foto);
  return '<div><span class="av">'+(f?'<img src="'+f+'" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode(\''+ini(o.nama)+'\'))">':esc(ini(o.nama)))+'</span><span><b>'+esc(P.title?P.title(o.nama):o.nama)+'</b><small>'+esc(peran)+'</small></span></div>'}

function mulai(){
  box.classList.add('polos');box.innerHTML='<div class="pt-ld">Memuat peta desa…</div>';
  Promise.all([muat('assets/leaflet/leaflet.css'+V,'link'),muat('assets/leaflet/leaflet.js'+V,'script')]).then(function(){
    return Promise.all([ambilGeo('rt','rt'),ambilGeo('jalan','jalan'),ambilGeo('fasilitas','fasilitas'),ambilData(),ambil('data/konteks.geojson'+V,8000).catch(function(){return null})]);
  }).then(function(r){bangun(r[0],r[1],r[2],r[3]||{},r[4])}).catch(function(e){console.warn(e);box.innerHTML='<div class="pt-ld">Peta belum bisa dimuat. Coba muat ulang halaman.</div>'});
}
function bangun(gRT,gJL,gFS,D,gKX){
  var L=window.L;box.innerHTML='';
  var map=L.map(box,{zoomControl:true,attributionControl:false,scrollWheelZoom:false,zoomSnap:.25,preferCanvas:false});
  map.on('focus click',function(){map.scrollWheelZoom.enable()});map.on('blur',function(){map.scrollWheelZoom.disable()});
  var DASAR={polos:null,
    jalan:L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}),
    satelit:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19})};
  var KET={polos:'',jalan:'© OpenStreetMap',satelit:'Citra © Esri'};
  var ft=document.createElement('div');ft.className='pt-ft';
  var curD='polos';
  function dasar(k){if(DASAR[curD])map.removeLayer(DASAR[curD]);curD=k;if(DASAR[k])DASAR[k].addTo(map).bringToBack();box.classList.toggle('polos',k==='polos');ft.textContent=KET[k];ft.style.display=KET[k]?'':'none';ui1.querySelectorAll('[data-d]').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-d')===k)});RTL.setStyle(gaya);if(KX)KX.setStyle(cxGaya)}
  /* wilayah sekitar: laut, kabupaten tetangga, Kab. Lumajang, Kec. Kunir & Pasirian, desa tetangga, desa se-Kec. Tempeh (dari SLS: batasnya sama persis dengan RT) */
  var PAS=['#f3e3b8','#e9dcc0','#f0d9c4','#dfe5c8','#e6dccf','#f1e4cc','#e3d7bd','#ece0c2','#e8dcc8','#f2dcc0','#e0dfc6','#eadfc9'];
  var pi=0,KX=null,labs=[];
  function cxGaya(f){var l=f.properties.lvl,pol=curD==='polos';
    var st={laut:{color:'#9cc7e2',weight:0,fillColor:'#cfe6f3',fillOpacity:pol?1:0},luar:{color:'#cbbf9f',weight:1,fillColor:'#ebe5d5',fillOpacity:pol?1:0},kab:{color:'#0f241a',weight:2.2,fillColor:'#f8f1df',fillOpacity:pol?1:0,dashArray:'8 5'},
      kec:{color:'#9a8a6a',weight:1.6,fillColor:f.properties.nama.indexOf('Kunir')>-1?'#ead9b8':'#e2d6b3',fillOpacity:pol?1:.08},desa_luar:{color:'#a8977a',weight:1,fillColor:'#efe1c0',fillOpacity:pol?1:.08},
      desa:{color:'#8b7a5c',weight:1.1,fillColor:f._c,fillOpacity:pol?1:.08},kec_tempeh:{color:'#0f241a',weight:2.4,fill:false,dashArray:'2 6',lineCap:'round'}}[l]||{};
    if(l==='desa'&&/pandanwangi/i.test(f.properties.nama))st={color:'#0f241a',weight:3.2,fill:false};
    st.interactive=false;return st}
  if(gKX&&gKX.features){
    var B=null;gKX.features.forEach(function(f){if(f.properties.lvl==='kab'){B=L.geoJSON(f).getBounds()}});
    if(B){var S=B.getSouth(),W_=B.getWest()-.6,E_=B.getEast()+.6;gKX.features.unshift({type:'Feature',properties:{lvl:'laut',nama:'Samudra Indonesia'},geometry:{type:'Polygon',coordinates:[[[W_,S+.35],[E_,S+.35],[E_,S-.9],[W_,S-.9],[W_,S+.35]]]}})}
    var URL_=['laut','luar','kab','kec','desa_luar','desa','kec_tempeh'];
    gKX.features.sort(function(a,b){return URL_.indexOf(a.properties.lvl)-URL_.indexOf(b.properties.lvl)});
    gKX.features.forEach(function(f){if(f.properties.lvl==='desa')f._c=PAS[pi++%PAS.length]});
    KX=L.geoJSON(gKX,{style:cxGaya,onEachFeature:function(f,ly){var l=f.properties.lvl,nm=f.properties.nama;
      if(l==='kec_tempeh'||(l==='desa'&&/pandanwangi/i.test(nm)))return;
      var pos=l==='laut'?[S-.12,(W_+E_)/2+.35]:null;
      var t=L.tooltip({permanent:true,direction:'center',className:'pt-cx '+l,interactive:false}).setContent(esc(l==='desa'||l==='desa_luar'?'Desa '+nm:nm));
      if(pos){t.setLatLng(pos)}else{t.setLatLng(ly.getBounds().getCenter())}
      labs.push({t:t,l:l});
    }}).addTo(map);
  }
  function cxLab(){var z=map.getZoom();labs.forEach(function(o){var show={laut:z<14,luar:z<12.5,kab:z<12,kec:z>=10.5&&z<14,desa_luar:z>=12.5,desa:z>=12.5}[o.l];if(show&&!map.hasLayer(o.t))o.t.addTo(map);else if(!show&&map.hasLayer(o.t))map.removeLayer(o.t)})}
  /* jalan & sungai */
  var JL=L.geoJSON(gJL,{interactive:false,style:function(f){var j=String((f.properties||{}).jenis||(f.properties||{}).REMARK||'').toLowerCase();
    if(/sungai|saluran|irigasi/.test(j))return {color:'#3a8fd0',weight:2.4,opacity:.9,className:'pt-ln'};
    if(/pantai/.test(j))return {color:'#2b6cb0',weight:2,dashArray:'6 5',opacity:.8,className:'pt-ln'};
    if(/utama|aspal/.test(j))return {color:'#6b5640',weight:3,opacity:.85,className:'pt-ln'};
    if(/setapak/.test(j))return {color:'#8f7d64',weight:1.2,dashArray:'3 3',opacity:.8,className:'pt-ln'};
    return {color:'#8f7d64',weight:1.8,opacity:.85,className:'pt-ln'}}});
  /* RT */
  var n=0,dusunLay={},hidden={};
  function warna(f){return WARNA[f._s.dusun.toLowerCase()]||'#999'}
  function gaya(f){return {color:curD==='satelit'?'#fffaf0':'#0f241a',weight:1.3,fillColor:warna(f),fillOpacity:curD==='polos'?.55:.38,className:'pt-rt'}}
  gRT.features.forEach(function(f){f._s=sifat(f.properties||{})});
  var RTL=L.geoJSON(gRT,{style:gaya,onEachFeature:function(f,ly){
    var s=f._s,k=s.rw+'/'+s.rt,d=(D.rt||{})[k]||{},kk=(D.kk||{})[k],lu=s.luas!=null?+s.luas:luasHa(f.geometry);
    (dusunLay[s.dusun.toLowerCase()]=dusunLay[s.dusun.toLowerCase()]||[]).push(ly);
    ly.bindTooltip('RT '+s.rt.slice(1)+' · RW '+s.rw.slice(1),{className:'pt-lab',direction:'center',permanent:true,opacity:1});
    var w=warna(f),kas=(D.kasun||{})[s.dusun.toLowerCase()];
    ly.bindPopup('<div class="pt-h" style="background:'+w+'"><b>RT '+s.rt+' / RW '+s.rw+'</b><small>Dusun '+esc(s.dusun)+'</small></div>'+
      '<div class="pt-g"><div><b>'+nf(d.n)+'</b><small>Penduduk</small></div><div><b>'+nf(d.l)+'</b><small>Laki-laki</small></div><div><b>'+nf(d.p)+'</b><small>Perempuan</small></div>'+
      '<div><b>'+nf(kk)+'</b><small>KK</small></div><div style="grid-column:span 2"><b>'+(lu?lu.toLocaleString('id-ID',{maximumFractionDigits:1}):'–')+' ha</b><small>Luas wilayah</small></div></div>'+
      '<div class="pt-o">'+orang((D.ketua_rt||{})[k],'Ketua RT '+s.rt)+orang((D.ketua_rw||{})[s.rw],'Ketua RW '+s.rw)+orang(kas,'Kepala Dusun '+s.dusun)+'</div>',{className:'pt-pop',maxWidth:270,autoPanPaddingTopLeft:[12,56],autoPanPaddingBottomRight:[12,96]});
    ly.on('mouseover',function(){ly.setStyle({fillOpacity:.85,weight:2.6});ly.bringToFront()});
    ly.on('mouseout',function(){RTL.resetStyle(ly)});
    ly._urut=n++;
  }});
  JL.addTo(map);RTL.addTo(map);JL.bringToFront();
  /* fasilitas */
  var IK={'kantor desa':'🏛️','masjid':'🕌','musholla':'🕌','gereja':'⛪','pondok pesantren':'📖','paud':'🧸','tk':'🧸','sd/mi':'🏫','smp/mts':'🏫','sma/smk/ma':'🏫','sekolah':'🏫','puskesmas':'🏥','posyandu':'🩺'};
  var fi=0,FS=L.geoJSON(gFS,{pointToLayer:function(f,ll){var p=f.properties||{},j=String(p.jenis||p.REMARK||'').toLowerCase(),kec=/jembatan/.test(j);
      var m=L.marker(ll,{icon:L.divIcon({className:'',html:'<span class="pt-ic'+(kec?' kecil':'')+'" style="--d:'+(1.6+(fi++)*.04).toFixed(2)+'s">'+(kec?'':(IK[j]||'📍'))+'</span>',iconSize:kec?[10,10]:[24,24],iconAnchor:kec?[5,5]:[12,12]}),zIndexOffset:kec?0:500});
      m.bindTooltip(esc(p.nama||p.NAMOBJ||p.jenis||'Fasilitas')+(p.jenis&&p.nama&&p.nama!==p.jenis?' · '+esc(p.jenis):''),{direction:'top',offset:[0,-10]});return m}});
  FS.addTo(map);
  /* tampilan awal + animasi garis */
  map.fitBounds(RTL.getBounds(),{padding:[16,16]});var KB=null;if(KX)KX.eachLayer(function(l){if(l.feature.properties.lvl==='kab')KB=l.getBounds()});
  if(KB){map.setMaxBounds(KB.pad(.35));map.setMinZoom(Math.max(8,map.getBoundsZoom(KB)-.5))}else{map.setMaxBounds(RTL.getBounds().pad(1.2));map.setMinZoom(map.getZoom()-1)}
  map.on('zoomend',cxLab);cxLab();
  RTL.eachLayer(function(ly){var pth=ly._path;if(!pth||P.RM)return;var Ln=Math.ceil(pth.getTotalLength?pth.getTotalLength():800);
    pth.style.setProperty('--L',Ln);pth.style.setProperty('--d',(ly._urut*.025).toFixed(3)+'s');pth.style.setProperty('--fo',gaya(ly.feature).fillOpacity);pth.classList.add('pt-draw');
    setTimeout(function(){pth.classList.remove('pt-draw');pth.style.removeProperty('--L')},2600+ly._urut*25)});
  /* label RT hanya saat diperbesar */
  function lab(){var z=map.getZoom(),show=z>=15.2;RTL.eachLayer(function(ly){var t=ly.getTooltip();if(t){var el=t.getElement();if(el)el.style.display=show&&labOn?'':'none'}})}
  var labOn=true;map.on('zoomend',lab);setTimeout(lab,50);
  /* kontrol */
  var ui1=document.createElement('div');ui1.className='pt-ui tr';
  ui1.innerHTML='<button data-d="polos" class="on">Polos</button><button data-d="jalan">Peta jalan</button><button data-d="satelit">Satelit</button>';
  var ui2=document.createElement('div');ui2.className='pt-ui bl';
  ui2.innerHTML=URUT.map(function(d){return '<button class="dz" data-z="'+d+'"><i style="background:'+WARNA[d]+'"></i>'+d.replace(/\b\w/g,function(c){return c.toUpperCase()})+'</button>'}).join('')+'<button data-l="jl" class="on">Jalan & sungai</button><button data-l="fs" class="on">Fasilitas</button>';
  box.appendChild(ui1);box.appendChild(ui2);box.appendChild(ft);ft.style.display='none';
  L.DomEvent.disableClickPropagation(ui1);L.DomEvent.disableClickPropagation(ui2);L.DomEvent.disableScrollPropagation(ui2);
  ui1.querySelectorAll('[data-d]').forEach(function(b){b.onclick=function(){dasar(b.getAttribute('data-d'))}});
  ui2.querySelectorAll('[data-z]').forEach(function(b){b.onclick=function(){var L_=dusunLay[b.getAttribute('data-z')]||[];if(!L_.length)return;map.flyToBounds(window.L.featureGroup(L_).getBounds(),{padding:[30,30],duration:.8});L_.forEach(function(ly,i){setTimeout(function(){ly.setStyle({fillOpacity:.9,weight:2.6});setTimeout(function(){RTL.resetStyle(ly)},900)},500+i*60)})}});
  ui2.querySelector('[data-l=jl]').onclick=function(){var on=this.classList.toggle('on');on?JL.addTo(map):map.removeLayer(JL)};
  ui2.querySelector('[data-l=fs]').onclick=function(){var on=this.classList.toggle('on');on?FS.addTo(map):map.removeLayer(FS)};
  map.on('popupopen',function(){box.classList.add('pop')});map.on('popupclose',function(){box.classList.remove('pop')});
  setTimeout(function(){map.invalidateSize()},200);
}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();mulai()}},{rootMargin:'300px'});io.observe(box)}else mulai();
})();
