/* Website Desa Pandanwangi — skrip bersama */
(function(){
'use strict';
var API='https://niaqgsqfsztcsgdyzavt.supabase.co/rest/v1/rpc/web_publik';
var KEY='sb_publishable_FrjuzHg6pJFQhJRIqBoXIw_5sL7E5sH';
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var nf=new Intl.NumberFormat('id-ID');
function store(k,v){try{if(v===undefined)return JSON.parse(sessionStorage.getItem(k)||'null');sessionStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
function lstore(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

/* ---------- data publik dari aplikasi ---------- */
var cacheP={};
function api(req,fn){
  var k='wp:'+(fn||'')+JSON.stringify(req),c=store(k);
  if(c&&Date.now()-c.t<90*1000)return Promise.resolve(c.d);
  if(cacheP[k])return cacheP[k];
  cacheP[k]=fetch(fn?API.replace('web_publik',fn):API,{method:'POST',headers:{'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify({req:req})})
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
    .then(function(d){store(k,{t:Date.now(),d:d});return d});
  return cacheP[k];
}

/* ---------- konten yang diubah admin lewat aplikasi Pemdes (menu Website Desa) ---------- */
var WK=null;try{WK=JSON.parse(lstore('pw:wk')||'null')}catch(e){}
function G(k){return WK&&WK.g&&WK.g[k]||''}
function urlOk(u,img){u=String(u||'');return /^https:\/\//.test(u)||(img&&/^img\/[\w.-]+$/.test(u))}
function wkApply(){
  if(!WK)return;setTimeout(function(){document.dispatchEvent(new CustomEvent('pw:wk'))});var pg=WK.p&&WK.p[page]||{};
  $$('[data-ed]').forEach(function(el){
    var k=el.getAttribute('data-ed'),v=pg[k];if(v==null||v===''||el._wk===v){return}
    var t=k.charAt(0);
    if(t==='t'){var h=esc(v).replace(/\n/g,'<br>');
      if(el._s)h=h.split('<br>').map(function(l){return '<span class="line in"><span>'+l+'</span></span>'}).join('');
      el.innerHTML=h}
    else if(t==='i'){if(!urlOk(v,1))return;el.removeAttribute('srcset');el.src=v}
    else if(t==='b'){if(!urlOk(v,1))return;el.style.backgroundImage='url("'+v.replace(/"/g,'')+'")'}
    else if(t==='l'){if(!urlOk(v))return;el.setAttribute(el.tagName==='IFRAME'?'src':'href',v)}
    el._wk=v;
  });
  var an=document.getElementById('wkAnn'),pt=G('pengumuman');
  if(pt&&!an&&!store('wp:ann:'+pt)){an=document.createElement('div');an.id='wkAnn';an.className='wk-ann';var m=document.querySelector('main');m&&m.parentNode.insertBefore(an,m)}
  if(an){if(!pt)an.remove();else{var lk=G('pengumuman_link');an.innerHTML='<div class="wrap"><span>📢</span><p>'+esc(pt).replace(/\n/g,'<br>')+(urlOk(lk)?' <a href="'+esc(lk)+'" target="_blank" rel="noopener">Selengkapnya →</a>':'')+'</p><button type="button" aria-label="Tutup pengumuman">×</button></div>';an.querySelector('button').onclick=function(){store('wp:ann:'+pt,1);an.remove()}}}
  $$('[data-g]').forEach(function(el){var k=el.getAttribute('data-g'),v=G(k);if(!v||el._wk===v)return;
    if(el.tagName==='A'){if(urlOk(v))el.href=v}else el.textContent=v;el._wk=v});
}
function wkMuat(){
  fetch(API.replace('web_publik','web_konten'),{method:'POST',headers:{'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:'{}'})
    .then(function(r){return r.ok?r.json():null}).then(function(w){if(!w||typeof w!=='object')return;var j=JSON.stringify(w);if(j===lstore('pw:wk'))return;lstore('pw:wk',j);WK=w;wkApply()}).catch(function(){});
}

/* ---------- kerangka: header, menu, footer ---------- */
var NAV=[['index.html','Beranda'],['pemerintahan.html','Pemerintahan'],['sarana.html','Sarana'],['lembaga.html','Lembaga'],['layanan.html','Layanan'],['apbdes.html','APBDes'],['kontak.html','Kontak']];
var page=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,'')||'index';
var LOGO_SVG='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="30" r="16" fill="#e8b84a"/><path d="M4 46c10-6 18-6 28 0s18 6 28 0v14H4z" fill="#2f5d3f"/><path d="M4 52c10-5 18-5 28 0s18 5 28 0" stroke="#ee7340" stroke-width="3" fill="none"/></svg>');
function setLogo(src){$$('img[data-logo]').forEach(function(i){i.src=src})}
var ICON={
  wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  tt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z"/></svg>'
};
function shell(){
  var b=document.body; b.classList.add('grain');
  var logo='img/logo-pemdes.webp';
  var nav=NAV.map(function(n){var on=n[0].replace('.html','')===page;return '<a href="'+n[0]+'"'+(on?' class="on" aria-current="page"':'')+'>'+n[1]+'</a>'}).join('');
  var hd=document.createElement('header');hd.className='hd';
  hd.innerHTML='<a class="hd-logo" href="index.html"><img data-logo src="'+logo+'" alt="Logo Desa Pandanwangi"><span><b>Pandanwangi</b><small>Kec. Tempeh · Lumajang</small></span></a><nav aria-label="Menu utama">'+nav+'</nav><a class="btn" href="lapor.html">Lapor Desa</a><button class="hd-burger" aria-label="Buka menu" aria-expanded="false"><i></i><i></i><i></i></button>';
  b.prepend(hd);
  var mn=document.createElement('div');mn.className='mnav';mn.innerHTML=nav+'<a href="surat.html" style="color:var(--padi)">Ajukan Surat →</a><a href="lapor.html" style="color:var(--senja)">Lapor Desa →</a><a href="lacak.html" style="font-size:24px">Lacak Tiket</a><a href="survei.html" style="font-size:24px">Survei Kepuasan</a><p class="hand">Aman · Rukun · Damai · Sejahtera</p>';
  $$('a',mn).forEach(function(a,i){a.style.transitionDelay=(.08+i*.05)+'s'});
  b.prepend(mn);
  var bt=$('.hd-burger',hd);
  var sc=document.createElement('div');sc.className='mnav-scrim';b.appendChild(sc);
  var tutup=function(){b.classList.remove('menu-open');bt.setAttribute('aria-expanded',false)};
  bt.onclick=function(){var o=b.classList.toggle('menu-open');bt.setAttribute('aria-expanded',o)};
  sc.onclick=tutup;addEventListener('keydown',function(e){if(e.key==='Escape')tutup()});
  var pt=document.createElement('div');pt.className='prog-top';b.prepend(pt);
  var tt=document.createElement('button');tt.className='toTop';tt.setAttribute('aria-label','Kembali ke atas');tt.innerHTML=ICON.up;tt.onclick=function(){scrollTo({top:0,behavior:'smooth'})};b.appendChild(tt);
  var gl=document.createElement('div');gl.className='glow';b.appendChild(gl);
  addEventListener('pointermove',function(e){gl.style.left=e.clientX+'px';gl.style.top=e.clientY+'px'},{passive:true});
  var ft=document.createElement('footer');ft.className='ft';
  ft.innerHTML='<div class="wrap"><div class="ft-g"><div><a class="hd-logo" href="index.html"><img data-logo src="'+logo+'" alt=""><span><b>Pemerintah Desa Pandanwangi</b><small>Kecamatan Tempeh · Kabupaten Lumajang · Jawa Timur</small></span></a><p style="margin-top:18px" data-desa="alamat">Jl. K.H. Wahid Hasyim No. 84, Pandanwangi, Tempeh, Lumajang 67371</p><p class="hand" data-g="motto" style="color:var(--padi);margin-top:14px">Aman, rukun, damai, sejahtera.</p></div>'+
   '<div><h4>Jelajah</h4>'+NAV.map(function(n){return '<a href="'+n[0]+'">'+n[1]+'</a>'}).join('')+'</div>'+
   '<div><h4>Layanan Warga</h4><a href="surat.html">Ajukan Surat Online</a><a href="lapor.html">Lapor Desa</a><a href="lacak.html">Lacak Tiket</a><a href="survei.html">Survei Kepuasan</a><a href="index.html#booklet">Booklet Profil Desa</a></div><div><h4>Terhubung</h4><a data-g="wa_saluran" href="https://whatsapp.com/channel/0029Vb6I135A2pLHQCFx5I1l" target="_blank" rel="noopener">Saluran WhatsApp</a><a data-g="ig" href="https://www.instagram.com/kim_pandanwangi/" target="_blank" rel="noopener">Instagram KIM</a><a data-g="tiktok" href="https://www.tiktok.com/@kim_pandanwangi" target="_blank" rel="noopener">TikTok KIM</a><a href="mailto:pandanwangipemdes@gmail.com">pandanwangipemdes@gmail.com</a></div></div>'+
   '<div class="ft-big reveal-big">PANDANWANGI</div>'+
   '<div class="ft-bot"><span>© <span data-year></span> Pemerintah Desa Pandanwangi × MMD UB 2025 Kelompok 63</span><span>Data publik diambil langsung dari aplikasi Pemdes Pandanwangi</span></div></div>';
  b.appendChild(ft);
  $$('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});
  var last=0;
  addEventListener('scroll',function(){
    var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    pt.style.width=(h>0?y/h*100:0)+'%';
    hd.classList.toggle('solid',y>40);tt.classList.toggle('on',y>innerHeight);
    last=y;
  },{passive:true});
}

/* ---------- preloader ---------- */
function preloader(){
  if(store('wp:seen')||RM)return;
  store('wp:seen',1);
  var p=document.createElement('div');p.className='pre';
  var w='Pandanwangi'.split('').map(function(c,i){return '<span style="animation-delay:'+(.05*i)+'s">'+c+'</span>'}).join('');
  p.innerHTML='<div class="pre-in"><div class="pre-sun"></div><div class="pre-w">'+w+'</div><small data-g="salam">'+esc(G('salam')||'selamat datang sedulur, setretanan!')+'</small></div>';
  document.body.appendChild(p);
  setTimeout(function(){p.classList.add('out');setTimeout(function(){p.remove()},1100)},1500);
}

/* ---------- animasi ---------- */
var io;
function observe(root){
  if(!('IntersectionObserver' in window)){$$('.reveal,.line,.mark,[data-count],[data-w],.ft-big',root).forEach(function(e){e.classList.add('in');fire(e)});return}
  if(!io)io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');fire(e.target);io.unobserve(e.target)}})},{threshold:.18,rootMargin:'0px 0px -6% 0px'});
  $$('.reveal,.line,.mark,[data-count],[data-w],.ft-big,[data-draw],.splitbar,.inview',root).forEach(function(e){if(!e._o){e._o=1;io.observe(e)}});
}
function fire(el){
  if(el.hasAttribute('data-count'))countUp(el);
  if(el.hasAttribute('data-w'))el.style.width=el.getAttribute('data-w');
  $$('[data-w]',el).forEach(function(x){x.style.width=x.getAttribute('data-w')});
  if(el.hasAttribute('data-draw'))drawPaths(el);
  if(el._fire)el._fire();
}
function cfmt(el,v){var dec=+(el.getAttribute('data-dec')||0),suf=el.getAttribute('data-suf')||'',pre=el.getAttribute('data-pre')||'',fmt=el.getAttribute('data-fmt');return pre+(fmt==='rp'?rpShort(v):v.toLocaleString('id-ID',{minimumFractionDigits:dec,maximumFractionDigits:dec}))+suf}
function countUp(el){
  var tg=function(){return parseFloat(el.getAttribute('data-count'))||0};
  if(RM){el.textContent=cfmt(el,tg());return}
  var t0=performance.now(),d=1600;el._run=1;
  (function st(t){var k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,4);el.textContent=cfmt(el,tg()*e);if(k<1)requestAnimationFrame(st);else el._run=0})(t0);
}
function setCount(el,v){if(!el||v==null)return;el.setAttribute('data-count',v);if(el.classList.contains('in')&&!el._run)el.textContent=cfmt(el,+v)}
function rpShort(v){var a=Math.abs(v);if(a>=1e9)return (v/1e9).toLocaleString('id-ID',{maximumFractionDigits:2})+' M';if(a>=1e6)return (v/1e6).toLocaleString('id-ID',{maximumFractionDigits:1})+' jt';return Math.round(v).toLocaleString('id-ID')}
function drawPaths(el){$$('path[data-len],circle[data-len]',el).forEach(function(p,i){var L=p.getTotalLength?p.getTotalLength():400;p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.getBoundingClientRect();p.style.transition='stroke-dashoffset 1.8s cubic-bezier(.2,.8,.2,1) '+(i*.12)+'s';p.style.strokeDashoffset=p.getAttribute('data-off')||0})}
function splitLines(){$$('[data-lines]').forEach(function(h){if(h._s)return;h._s=1;h.innerHTML=h.innerHTML.split(/<br\s*\/?>/i).map(function(l,i){return '<span class="line"><span style="transition-delay:'+(i*.12)+'s">'+l+'</span></span>'}).join('')})}
function typer(el){
  var words=(el.getAttribute('data-type')||'').split('|'),i=0,j=0,del=false;
  if(RM){el.textContent=words[0];return}
  (function tick(){var w=words[i];el.textContent=w.slice(0,j);
    if(!del&&j<w.length){j++;setTimeout(tick,95)}else if(!del){del=true;setTimeout(tick,1500)}else if(j>0){j--;setTimeout(tick,45)}else{del=false;i=(i+1)%words.length;setTimeout(tick,250)}})();
}
function tilt(){
  if(RM||!matchMedia('(hover:hover)').matches)return;
  $$('.tilt').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(800px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg) translate(-3px,-3px)'});
    c.addEventListener('pointerleave',function(){c.style.transform=''});
  });
}
function parallax(){
  var els=$$('[data-par]');if(!els.length||RM)return;
  var t=false;function up(){els.forEach(function(e){var r=e.getBoundingClientRect(),k=parseFloat(e.getAttribute('data-par'));if(r.bottom>-200&&r.top<innerHeight+200)e.style.transform='translate3d(0,'+(r.top*k).toFixed(1)+'px,0)'+(e.classList.contains('hero-bg')?' scale(1.08)':'')});t=false}
  addEventListener('scroll',function(){if(!t){t=true;requestAnimationFrame(up)}},{passive:true});up();
}
function dragScroll(){
  $$('.gal').forEach(function(g){var d=false,sx,sl,mv;
    g.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;d=true;mv=0;sx=e.pageX;sl=g.scrollLeft;g.classList.add('drag')});
    addEventListener('pointerup',function(){d=false;g.classList.remove('drag')});
    g.addEventListener('pointermove',function(e){if(!d)return;mv=Math.abs(e.pageX-sx);g.scrollLeft=sl-(e.pageX-sx)});
  });
}
/* scrollytelling: langkah yang terlihat mengaktifkan panel sticky */
function story(root){
  $$('[data-story]',root).forEach(function(s){
    var steps=$$('.st',s),scenes=$$('.scene',s),dots=$$('.prog b',s),bars=$$('.prog i',s);
    var set=function(k){steps.forEach(function(x,i){x.classList.toggle('act',i===k)});scenes.forEach(function(x,i){x.classList.toggle('act',i===k)});dots.forEach(function(x,i){x.classList.toggle('done',i<=k);x.classList.toggle('act',i===k)});bars.forEach(function(x,i){x.classList.toggle('done',i<k)})};
    set(0);
    if(!('IntersectionObserver' in window))return;
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)set(steps.indexOf(e.target))})},{rootMargin:'-45% 0px -45% 0px'});
    steps.forEach(function(x){o.observe(x)});
  });
}
function tabs(){
  $$('[data-tabs]').forEach(function(t){
    var bs=$$('[data-tab]',t),ps=$$('.tab-p',t.parentNode);
    bs.forEach(function(b){b.onclick=function(){bs.forEach(function(x){x.classList.toggle('on',x===b)});ps.forEach(function(p){p.classList.toggle('on',p.id===b.getAttribute('data-tab'))});observe(document);var top=t.getBoundingClientRect().top+scrollY-90;if(scrollY>top)scrollTo({top:top,behavior:'smooth'})}});
  });
}
function initAll(root){splitLines();observe(root||document);tilt()}

/* ---------- bantuan untuk halaman ---------- */
function slug(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function title(s){return String(s||'').toLowerCase().replace(/(^|[\s/(-])([a-z])/g,function(m,a,b){return a+b.toUpperCase()}).replace(/\bSd\b/g,'SD').replace(/\bSltp\b/g,'SLTP').replace(/\bSlta\b/g,'SLTA').replace(/\bPns\b/g,'PNS').replace(/\bTni\b/g,'TNI').replace(/\bPolri\b/g,'POLRI').replace(/\bIi\b/g,'II').replace(/\bIii\b/g,'III').replace(/\bIv\b/g,'IV')}

/* foto perangkat/petugas dari data aplikasi (salinan publik dibuat server sekali per foto) */
function fotoUrl(id){id=String(id||'');return /^r2:dokumen\//.test(id)?API.replace('/rest/v1/rpc/web_publik','/functions/v1/webkonten')+'?foto='+encodeURIComponent(id):''}
window.PW={wk:function(k){return G(k)},fotoUrl:fotoUrl,setCount:setCount,api:api,$:$,$$:$$,esc:esc,nf:nf,observe:observe,initAll:initAll,story:story,rpShort:rpShort,ICON:ICON,slug:slug,title:title,RM:RM,typer:typer};

document.addEventListener('DOMContentLoaded',function(){
  shell();wkApply();preloader();initAll();wkMuat();parallax();dragScroll();story();tabs();
  $$('[data-type]').forEach(typer);
  api({aksi:'profil'}).then(function(d){
    var ds=d.desa||{};
    $$('[data-desa]').forEach(function(e){var k=e.getAttribute('data-desa');if(k==='alamat'&&ds.alamat)e.textContent=ds.alamat+', Desa Pandanwangi, Kec. Tempeh, Kab. Lumajang '+(ds.kode_pos||'');else if(ds[k])e.textContent=ds[k]});
    document.dispatchEvent(new CustomEvent('pw:profil',{detail:d}));
  }).catch(function(e){console.warn('data publik belum tersedia',e);document.dispatchEvent(new CustomEvent('pw:profil',{detail:null}))});
});
})();
