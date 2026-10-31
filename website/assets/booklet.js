/* Booklet profil desa: PDF diunggah admin lewat aplikasi Pemdes (menu Website Desa).
   Halaman PDF digambar dengan PDF.js lalu dibalik seperti buku (tanpa AnyFlip).
   Bila belum ada PDF, tetap memakai tautan AnyFlip lama. */
(function(){
var PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
var OK=/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/booklet\/booklet-[a-z0-9]+\.pdf$/;
var css=document.createElement('style');
css.textContent=
'.bk{position:relative;width:100%;height:100%;display:flex;flex-direction:column;background:var(--ink);color:#fff;user-select:none;-webkit-user-select:none}'+
'.bk-st{flex:1;position:relative;display:flex;align-items:center;justify-content:center;perspective:2200px;padding:14px 14px 0;min-height:0;overflow:hidden}'+
'.bk-bk{position:relative;display:flex;box-shadow:0 18px 40px rgba(0,0,0,.45)}'+
'.bk-p{position:relative;background:#fff center/contain no-repeat;overflow:hidden}'+
'.bk-p img{width:100%;height:100%;object-fit:contain;display:block}'+
'.bk-p.kosong{background:transparent}'+
'.bk-p.l::after{content:"";position:absolute;inset:0 0 0 auto;width:28px;background:linear-gradient(90deg,transparent,rgba(0,0,0,.16))}'+
'.bk-p.r::after{content:"";position:absolute;inset:0 auto 0 0;width:28px;background:linear-gradient(270deg,transparent,rgba(0,0,0,.16))}'+
'.bk-p.kosong::after{display:none}'+
'.bk-lf{position:absolute;top:0;height:100%;transform-style:preserve-3d;z-index:3;transition:transform .7s cubic-bezier(.45,.05,.3,1)}'+
'.bk-lf .f,.bk-lf .b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fff;overflow:hidden}'+
'.bk-lf .b{transform:rotateY(180deg)}'+
'.bk-lf img{width:100%;height:100%;object-fit:contain;display:block}'+
'.bk-lf .sh{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.0),rgba(0,0,0,.18));opacity:0;transition:opacity .7s}'+
'.bk-lf.go .sh{opacity:1}'+
'.bk-nv{display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 12px 12px}'+
'.bk-nv button{width:40px;height:40px;border-radius:50%;border:2px solid #fff;background:transparent;color:#fff;font:800 18px/1 var(--f-b,system-ui);cursor:pointer;display:grid;place-items:center;transition:.2s}'+
'.bk-nv button:hover:not(:disabled){background:var(--padi,#e9ff70);color:var(--ink);border-color:var(--padi,#e9ff70)}'+
'.bk-nv button:disabled{opacity:.35;cursor:default}'+
'.bk-nv .pg{min-width:86px;text-align:center;font:700 13px var(--f-b,system-ui);opacity:.9}'+
'.bk-ld{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font:700 14px var(--f-b,system-ui);opacity:.85}'+
'.bk-ld i{display:block;width:34px;height:34px;margin:0 auto 10px;border-radius:50%;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;animation:bkspin 1s linear infinite}'+
'@keyframes bkspin{to{transform:rotate(1turn)}}'+
'.bk-hit{position:absolute;top:0;bottom:0;width:28%;z-index:4;cursor:pointer}.bk-hit.a{left:0}.bk-hit.b{right:0}'+
'.flip:fullscreen{aspect-ratio:auto;border-radius:0;border:0}.flip:-webkit-full-screen{aspect-ratio:auto}';
document.head.appendChild(css);

function muatPdfjs(){
  if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
  return new Promise(function(ok,no){var s=document.createElement('script');s.src=PDFJS+'pdf.min.js';s.onload=function(){window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js';ok(window.pdfjsLib)};s.onerror=function(){no(new Error('pdfjs'))};document.head.appendChild(s)});
}

var aktif=null;
function pasang(url){
  var box=document.querySelector('#booklet .flip');if(!box||aktif===url)return;aktif=url;
  var full=document.querySelector('#booklet .hero-cta a');
  box.innerHTML='<div class="bk"><div class="bk-st"><div class="bk-ld"><div><i></i>Memuat booklet…</div></div></div><div class="bk-nv"><button type="button" data-b="p" aria-label="Halaman sebelumnya" disabled>‹</button><span class="pg">…</span><button type="button" data-b="n" aria-label="Halaman berikutnya" disabled>›</button><button type="button" data-b="f" aria-label="Layar penuh" title="Layar penuh">⛶</button></div></div>';
  if(full){full.removeAttribute('target');full.href='#booklet';full.onclick=function(e){e.preventDefault();layarPenuh(box)}}
  var st=box.querySelector('.bk-st'),pgEl=box.querySelector('.pg'),bP=box.querySelector('[data-b=p]'),bN=box.querySelector('[data-b=n]');
  box.querySelector('[data-b=f]').onclick=function(){layarPenuh(box)};
  var doc,n=0,ratio=1.414,img={},janji={},cur=1,sibuk=false,dua=true,W=0,H=0;
  function mulai(){
    muatPdfjs().then(function(lib){return lib.getDocument({url:url}).promise}).then(function(d){
      doc=d;n=d.numPages;return d.getPage(1)}).then(function(p){
      var v=p.getViewport({scale:1});ratio=v.height/v.width;ukur();gambar();siapkan(cur);
    }).catch(function(){st.innerHTML='<div class="bk-ld"><div>Booklet belum bisa dimuat.<br><a href="'+url+'" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline">Buka PDF</a></div></div>'});
  }
  function render(i){
    if(img[i])return Promise.resolve(img[i]);if(janji[i])return janji[i];
    janji[i]=doc.getPage(i).then(function(p){
      var tw=Math.min(1400,Math.max(500,W*(window.devicePixelRatio||1)*1.2)),v0=p.getViewport({scale:1}),v=p.getViewport({scale:tw/v0.width});
      var c=document.createElement('canvas');c.width=Math.round(v.width);c.height=Math.round(v.height);
      return p.render({canvasContext:c.getContext('2d'),viewport:v}).promise.then(function(){
        return new Promise(function(ok){c.toBlob(function(b){img[i]=URL.createObjectURL(b);ok(img[i])},'image/jpeg',.86)})});
    });return janji[i];
  }
  function siapkan(c){for(var i=Math.max(1,c-2);i<=Math.min(n,c+4);i++)render(i).then(function(){gambarUlang()})}
  function ukur(){
    var r=st.getBoundingClientRect(),aw=r.width-28,ah=r.height-14;dua=aw>560&&aw/ah>0.95;
    var cols=dua?2:1;W=Math.floor(Math.min(aw/cols,ah/ratio));H=Math.floor(W*ratio);
  }
  function spread(c){ // halaman yang tampil: [kiri,kanan]
    if(!dua)return [c];
    if(c<=1)return [0,1];var l=c%2===0?c:c-1;return [l,l+1<=n?l+1:0];
  }
  function pgHtml(i,cls){return '<div class="bk-p '+cls+(i?'':' kosong')+'" style="width:'+W+'px;height:'+H+'px">'+(i&&img[i]?'<img src="'+img[i]+'" alt="Halaman '+i+'">':'')+'</div>'}
  function gambar(){
    var s=spread(cur);
    st.innerHTML='<div class="bk-bk">'+(dua?pgHtml(s[0],'l')+pgHtml(s[1],'r'):pgHtml(s[0],''))+'</div><span class="bk-hit a"></span><span class="bk-hit b"></span>';
    st.querySelector('.bk-hit.a').onclick=function(){balik(-1)};st.querySelector('.bk-hit.b').onclick=function(){balik(1)};
    info();
  }
  function gambarUlang(){if(sibuk)return;var ps=st.querySelectorAll('.bk-p'),s=spread(cur);ps.forEach(function(el,k){var i=s[k];if(i&&img[i]&&!el.querySelector('img'))el.innerHTML='<img src="'+img[i]+'" alt="Halaman '+i+'">'})}
  function info(){var s=spread(cur).filter(Boolean);pgEl.textContent=(s.length>1?s[0]+'–'+s[1]:s[0])+' / '+n;bP.disabled=cur<=1;bN.disabled=dua?spread(cur)[1]>=n||!spread(cur)[1]:cur>=n}
  function langkah(d){if(!dua)return cur+d;if(d>0)return cur<=1?2:spread(cur)[0]+2;return cur<=3?1:spread(cur)[0]-2}
  function balik(d){
    if(sibuk||!doc)return;var nx=langkah(d);if(nx<1||nx>n)return;
    var a=spread(cur),b=spread(nx),bk=st.querySelector('.bk-bk');sibuk=true;
    Promise.all(b.filter(Boolean).map(render)).then(function(){
      var lf=document.createElement('div');lf.className='bk-lf';
      var im=function(i){return i&&img[i]?'<img src="'+img[i]+'" alt="">':''};
      if(dua){
        var ps=bk.querySelectorAll('.bk-p');
        if(d>0){lf.style.cssText='left:'+W+'px;width:'+W+'px;transform-origin:left center';lf.innerHTML='<div class="f">'+im(a[1])+'<i class="sh"></i></div><div class="b">'+im(b[0])+'</div>';ps[1].outerHTML=pgHtml(b[1],'r')}
        else{lf.style.cssText='left:0;width:'+W+'px;transform-origin:right center';lf.innerHTML='<div class="f">'+im(a[0])+'<i class="sh"></i></div><div class="b">'+im(b[1])+'</div>';ps[0].outerHTML=pgHtml(b[0],'l')}
      }else{
        lf.style.cssText='left:0;width:'+W+'px;transform-origin:'+(d>0?'left':'right')+' center';lf.innerHTML='<div class="f">'+im(a[0])+'<i class="sh"></i></div><div class="b"></div>';
        bk.querySelector('.bk-p').outerHTML=pgHtml(b[0],'');
      }
      bk.appendChild(lf);lf.getBoundingClientRect();lf.classList.add('go');lf.style.transform='rotateY('+(d>0?-180:180)+'deg)';
      var selesai=function(){if(!sibuk)return;cur=nx;sibuk=false;gambar();siapkan(cur)};
      lf.addEventListener('transitionend',selesai,{once:true});setTimeout(selesai,900);
    });
  }
  bP.onclick=function(){balik(-1)};bN.onclick=function(){balik(1)};
  box.tabIndex=0;box.onkeydown=function(e){if(e.key==='ArrowRight'){balik(1);e.preventDefault()}else if(e.key==='ArrowLeft'){balik(-1);e.preventDefault()}};
  var x0=null;st.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  st.addEventListener('touchend',function(e){if(x0==null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)balik(dx<0?1:-1)},{passive:true});
  var tm;window.addEventListener('resize',function(){clearTimeout(tm);tm=setTimeout(function(){if(!doc||sibuk)return;ukur();if(dua&&cur>1&&cur%2)cur--;gambar()},200)});
  document.addEventListener('fullscreenchange',function(){setTimeout(function(){if(doc){ukur();gambar()}},120)});
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();mulai()}},{rootMargin:'600px'});io.observe(box)}else mulai();
}
function layarPenuh(el){var f=el.requestFullscreen||el.webkitRequestFullscreen;if(document.fullscreenElement){document.exitFullscreen();return}if(f)f.call(el)}
function cek(){var u=window.PW&&PW.wk('booklet_pdf');if(u&&OK.test(u))pasang(u)}
document.addEventListener('pw:wk',cek);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cek);else cek();
})();
