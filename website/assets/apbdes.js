/* Dasbor APBDes & realisasi — data langsung dari aplikasi desa */
(function(){
var P=PW,$=P.$,$$=P.$$,esc=P.esc;
var CAT=['#1d7a4b','#e08a1e','#3b6fc4','#b8475e','#7d9b28','#8a5cc7'],OTHER='#9aa39d';
var BIDANG={'1':'Penyelenggaraan Pemerintahan Desa','2':'Pelaksanaan Pembangunan Desa','3':'Pembinaan Kemasyarakatan','4':'Pemberdayaan Masyarakat','5':'Penanggulangan Bencana, Darurat & Mendesak'};
var SUMBER={DDS:'Dana Desa',ADD:'Alokasi Dana Desa',PBH:'Bagi Hasil Pajak & Retribusi',PAD:'Pendapatan Asli Desa',BKK:'Bantuan Keuangan Kabupaten',BKP:'Bantuan Keuangan Provinsi',SWD:'Swadaya Masyarakat',DLL:'Lain-lain',SILPA:'SiLPA'};
var BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
var BLNP=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
var rp=function(v){return 'Rp '+Math.round(v||0).toLocaleString('id-ID')};
var rs=function(v){return 'Rp '+P.rpShort(v||0)};
var pc=function(a,b){return b?a/b*100:0};
var fp=function(v){return (Math.round(v*10)/10).toLocaleString('id-ID')+'%'};
var tip=$('#tip');
function tipOn(e,h){tip.innerHTML=h;tip.classList.add('on');var x=e.clientX+16,y=e.clientY+16,w=tip.offsetWidth,hh=tip.offsetHeight;if(x+w>innerWidth-8)x=e.clientX-w-16;if(y+hh>innerHeight-8)y=e.clientY-hh-16;tip.style.left=x+'px';tip.style.top=y+'px'}
function tipOff(){tip.classList.remove('on')}
document.addEventListener('pointermove',function(e){var t=e.target.closest&&e.target.closest('[data-tip]');if(t)tipOn(e,t.getAttribute('data-tip'));else if(!e.target.closest('.line'))tipOff()},{passive:true});
function sum(a,f){return a.reduce(function(s,x){return s+(+f(x)||0)},0)}
function group(a,key){var m={},o=[];a.forEach(function(r){var k=key(r);if(!m[k]){m[k]={k:k,ang:0,rea:0,rows:[]};o.push(m[k])}m[k].ang+=+r.anggaran||0;m[k].rea+=+r.realisasi||0;m[k].rows.push(r)});return o}
function whenSeen(el,fn){if(!('IntersectionObserver' in window)||P.RM){fn();return}var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();fn()}},{threshold:.2});o.observe(el)}

var D,years=[];
function load(th){
  $('#upd span').textContent='Memuat APBDes '+th+'…';
  $$('#years .chip').forEach(function(c){c.classList.toggle('on',c.textContent===th)});
  P.api({aksi:'apbdes',tahun:th}).then(function(a){D=a;render(a)}).catch(function(){$('#upd span').textContent='Data belum dapat dimuat. Coba muat ulang halaman.'});
}
document.addEventListener('pw:profil',function(ev){
  var d=ev.detail;years=(d&&d.apbdes_tahun)||[];
  if(!years.length)years=[String(new Date().getFullYear())];
  var want=(location.hash.match(/\d{4}/)||[])[0];
  $('#years').innerHTML=years.map(function(y){return '<button class="chip">'+y+'</button>'}).join('');
  $$('#years .chip').forEach(function(c){c.onclick=function(){history.replaceState(null,'','#'+c.textContent);load(c.textContent)}});
  load(years.indexOf(want)>-1?want:years[0]);
});

function render(a){
  var rows=a.rows||[],rek=a.rek||{};
  var pend=rows.filter(function(r){return /^4/.test(r.kode)}),bel=rows.filter(function(r){return /^5/.test(r.kode)}),
      pm=rows.filter(function(r){return /^6\.1/.test(r.kode)}),pk=rows.filter(function(r){return /^6\.2/.test(r.kode)});
  var T={pa:sum(pend,function(r){return r.anggaran}),pr:sum(pend,function(r){return r.realisasi}),ba:sum(bel,function(r){return r.anggaran}),br:sum(bel,function(r){return r.realisasi}),
         ma:sum(pm,function(r){return r.anggaran}),mr:sum(pm,function(r){return r.realisasi}),ka:sum(pk,function(r){return r.anggaran}),kr:sum(pk,function(r){return r.realisasi})};
  var tt=a.transaksi_terakhir;
  $('#upd span').textContent=tt?'Realisasi sampai transaksi '+(+tt.slice(8,10))+' '+BLNP[+tt.slice(5,7)-1]+' '+tt.slice(0,4):'Belum ada transaksi yang dibukukan untuk tahun '+a.tahun;
  if(!rows.length){$('#kpis').innerHTML='<div class="kpi" style="grid-column:1/-1"><p class="empty">APBDes tahun '+esc(a.tahun)+' belum tersedia.</p></div>';['gauge','donut','line','bidang','jenis','sumber','pemb','kgList'].forEach(function(id){$('#'+id).innerHTML=''});return}

  /* KPI */
  var sur=T.pr-T.br+T.mr-T.kr;
  $('#kpis').innerHTML=[
    ['','Pendapatan',T.pr,'dari anggaran '+rs(T.pa),pc(T.pr,T.pa)],
    ['y','Belanja',T.br,'dari anggaran '+rs(T.ba),pc(T.br,T.ba)],
    ['','Pembiayaan netto',T.ma-T.ka,'penerimaan '+rs(T.ma)+' · pengeluaran '+rs(T.ka),null],
    ['g','Kas berjalan',sur,'pendapatan + pembiayaan − belanja (realisasi)',null]
  ].map(function(k){return '<div class="kpi '+k[0]+'"><small>'+k[1]+'</small>'+(k[4]!=null?'<span class="pct">'+fp(k[4])+'</span>':'')+'<b data-count="'+Math.round(k[2])+'" data-fmt="rp" data-pre="Rp ">Rp 0</b><div class="sub">'+k[3]+'</div>'+(k[4]!=null?'<div class="meter"><i data-w="'+Math.min(100,k[4]).toFixed(1)+'%"></i></div>':'')+'</div>'}).join('');
  P.observe($('#kpis'));

  /* gauge */
  var g=Math.min(100,pc(T.br,T.ba)),R=150,C=Math.PI*R;
  $('#gauge').innerHTML='<svg viewBox="0 0 360 200" role="img" aria-label="Serapan belanja '+fp(g)+'"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#ee7340"/><stop offset=".5" stop-color="#e8b84a"/><stop offset="1" stop-color="#1d7a4b"/></linearGradient></defs>'+
    '<path d="M30 180 A150 150 0 0 1 330 180" fill="none" stroke="#efe3c8" stroke-width="26" stroke-linecap="round"/>'+
    '<path id="garc" d="M30 180 A150 150 0 0 1 330 180" fill="none" stroke="url(#gg)" stroke-width="26" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'" style="transition:stroke-dashoffset 2s cubic-bezier(.2,.8,.2,1)"/>'+
    [0,25,50,75,100].map(function(t){var an=Math.PI*(1-t/100),x=180+118*Math.cos(an),y=180-118*Math.sin(an);return '<text x="'+x.toFixed(1)+'" y="'+(y+4).toFixed(1)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#5d6b62">'+t+'</text>'}).join('')+
    '<g class="needle" id="gnd" style="transform:rotate(-90deg)"><path d="M180 180 L176 100 L180 88 L184 100 Z" fill="#0f241a"/><circle cx="180" cy="180" r="12" fill="#0f241a"/><circle cx="180" cy="180" r="5" fill="#e8b84a"/></g></svg>'+
    '<div class="val"><b data-count="'+g.toFixed(1)+'" data-dec="1" data-suf="%">0%</b><span>'+rs(T.br)+' dari '+rs(T.ba)+'</span></div>';
  whenSeen($('#gauge'),function(){$('#garc').style.strokeDashoffset=C*(1-g/100);$('#gnd').style.transform='rotate('+(-90+g*1.8)+'deg)'});
  P.observe($('#gauge'));

  /* donut sumber pendapatan (level 3 rekening) */
  var ps=group(pend,function(r){var k=r.kode.split('.').slice(0,3).join('.');return rek[k]||r.uraian||k}).filter(function(x){return x.ang>0}).sort(function(a,b){return b.ang-a.ang});
  if(ps.length>6){var rest=ps.slice(5);ps=ps.slice(0,5);ps.push({k:'Lainnya',ang:sum(rest,function(x){return x.ang}),rea:sum(rest,function(x){return x.rea}),other:1})}
  var tot=sum(ps,function(x){return x.ang})||1,r0=70,cir=2*Math.PI*r0,off=0;
  var segs=ps.map(function(x,i){var f=x.ang/tot,len=Math.max(0,f*cir-3),col=x.other?OTHER:CAT[i];var s='<circle class="seg" cx="100" cy="100" r="'+r0+'" fill="none" stroke="'+col+'" stroke-width="26" stroke-dasharray="0 '+cir+'" data-d="'+len.toFixed(2)+' '+(cir-len).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 100 100)" data-tip="<b>'+esc(x.k)+'</b>Anggaran '+rp(x.ang)+'<br>Realisasi '+rp(x.rea)+' ('+fp(pc(x.rea,x.ang))+')" style="transition:stroke-dasharray 1.2s cubic-bezier(.2,.8,.2,1) '+(i*.12)+'s"/>';off+=f*cir;return s}).join('');
  $('#donut').innerHTML='<svg viewBox="0 0 200 200" role="img" aria-label="Komposisi sumber pendapatan">'+segs+'<text x="100" y="94" text-anchor="middle" font-size="11" font-weight="700" fill="#5d6b62">TOTAL</text><text x="100" y="116" text-anchor="middle" font-size="19" font-weight="800" font-family="Bricolage Grotesque" fill="#0f241a">'+P.rpShort(T.pa)+'</text></svg>'+
    '<div class="lg-list">'+ps.map(function(x,i){return '<div data-tip="<b>'+esc(x.k)+'</b>Realisasi '+rp(x.rea)+'"><i style="background:'+(x.other?OTHER:CAT[i])+'"></i><span>'+esc(x.k)+'<em>realisasi '+fp(pc(x.rea,x.ang))+'</em></span><b>'+fp(x.ang/tot*100)+'</b></div>'}).join('')+'</div>';
  whenSeen($('#donut'),function(){$$('#donut .seg').forEach(function(c){c.setAttribute('stroke-dasharray',c.getAttribute('data-d'))})});

  /* garis kumulatif */
  lineChart(a.bulanan||[],tt);

  /* bidang */
  var bd=group(bel,function(r){return String(r.kode_kegiatan||'').split('.')[0]||'?'}).sort(function(a,b){return a.k.localeCompare(b.k)});
  var mx=Math.max.apply(null,bd.map(function(x){return Math.max(x.ang,x.rea)}))||1;
  $('#bidang').innerHTML=bd.map(function(x,i){var p=pc(x.rea,x.ang);return '<div class="br" data-tip="<b>Bidang '+esc(x.k)+'</b>Anggaran '+rp(x.ang)+'<br>Realisasi '+rp(x.rea)+'"><div class="hd2"><span>'+esc(x.k)+'. '+esc(BIDANG[x.k]||'Lainnya')+'</span><span>'+fp(p)+'</span></div><div class="tr"><div class="a" data-w="'+(x.ang/mx*100).toFixed(1)+'%"></div><div class="r" style="--c:'+CAT[i%6]+'" data-w="'+(x.rea/mx*100).toFixed(1)+'%"></div></div><div class="ft2"><span>Realisasi '+rs(x.rea)+'</span><span>Anggaran '+rs(x.ang)+'</span></div></div>'}).join('');
  regrow($('#bidang'));

  /* jenis belanja */
  var jn=group(bel,function(r){return r.kode.split('.').slice(0,2).join('.')}).filter(function(x){return x.ang>0}).sort(function(a,b){return a.k.localeCompare(b.k)});
  var jt=sum(jn,function(x){return x.ang})||1;
  $('#jenis').innerHTML='<div class="stack inview">'+jn.map(function(x,i){return '<div style="background:'+CAT[i]+'" data-w="'+(x.ang/jt*100).toFixed(2)+'%" data-tip="<b>'+esc(rek[x.k]||x.k)+'</b>'+rp(x.ang)+'"></div>'}).join('')+'</div><div class="lg-list" style="margin-top:16px">'+jn.map(function(x,i){return '<div><i style="background:'+CAT[i]+'"></i><span>'+esc(rek[x.k]||x.k)+'<em>'+rs(x.ang)+' · realisasi '+fp(pc(x.rea,x.ang))+'</em></span><b>'+fp(x.ang/jt*100)+'</b></div>'}).join('')+'</div>';
  regrow($('#jenis'));

  /* sumber dana belanja */
  var sd=group(bel,function(r){return r.sumber||'DLL'}).filter(function(x){return x.ang>0}).sort(function(a,b){return b.ang-a.ang});
  $('#sumber').innerHTML=sd.map(function(x,i){return '<div class="inview" style="--c:'+(CAT[i]||OTHER)+'" data-tip="<b>'+esc(SUMBER[x.k]||x.k)+'</b>Anggaran '+rp(x.ang)+'<br>Realisasi '+rp(x.rea)+'"><small>'+esc(x.k)+' · '+esc(SUMBER[x.k]||'')+'</small><b>'+rs(x.ang)+'</b><small>realisasi '+fp(pc(x.rea,x.ang))+'</small></div>'}).join('');
  $$('#sumber>div').forEach(function(el,i){var x=sd[i];el._fire=function(){el.style.setProperty('--w',Math.min(100,pc(x.rea,x.ang)).toFixed(1)+'%')}});
  P.observe($('#sumber'));$$('#sumber>div.in').forEach(function(el){el._fire()});

  /* pembiayaan */
  $('#pemb').innerHTML='<div style="background:var(--sage)"><small>Penerimaan pembiayaan</small><b>'+rp(T.mr)+'</b><span class="note">anggaran '+rp(T.ma)+'</span></div><div style="background:var(--senja-2)"><small>Pengeluaran pembiayaan</small><b>'+rp(T.kr)+'</b><span class="note" style="color:var(--ink)">anggaran '+rp(T.ka)+'</span></div><div style="background:var(--padi)"><small>Pembiayaan netto</small><b>'+rp(T.mr-T.kr)+'</b><span class="note" style="color:var(--ink)">anggaran '+rp(T.ma-T.ka)+'</span></div>';

  /* kegiatan */
  KG=group(bel,function(r){return (r.kode_kegiatan||'')+'|'+(r.kegiatan||'Tanpa kegiatan')}).map(function(x){var p=x.k.split('|');x.kode=p[0];x.nama=p[1];x.bid=p[0].split('.')[0];return x}).filter(function(x){return x.ang>0||x.rea>0});
  $('#kb').innerHTML='<option value="">Semua bidang</option>'+bd.map(function(x){return '<option value="'+esc(x.k)+'">Bidang '+esc(x.k)+' · '+esc(BIDANG[x.k]||'')+'</option>'}).join('');
  showAll=false;listKg();
}
function regrow(box){P.observe(box);var go=function(){$$('[data-w]',box).forEach(function(x){x.style.width=x.getAttribute('data-w')})};if(box.classList.contains('in')||$$('.in',box).length)setTimeout(go,60);else whenSeen(box,go)}

var KG=[],showAll=false;
function listKg(){
  var q=$('#kq').value.toLowerCase().trim(),b=$('#kb').value,s=$('#ks').value;
  var l=KG.filter(function(x){return (!b||x.bid===b)&&(!q||(x.nama+' '+x.kode).toLowerCase().indexOf(q)>-1)});
  l.sort(s==='ang'?function(a,b){return b.ang-a.ang}:s==='kode'?function(a,b){return a.kode.localeCompare(b.kode,undefined,{numeric:true})}:s==='pct'?function(a,b){return pc(b.rea,b.ang)-pc(a.rea,a.ang)}:function(a,b){return pc(a.rea,a.ang)-pc(b.rea,b.ang)});
  var lim=showAll||q||b?l.length:10;
  $('#kgList').innerHTML=l.length?l.slice(0,lim).map(function(x){var p=pc(x.rea,x.ang),col=p>=100?'#1d7a4b':p>=50?'#7d9b28':p>0?'#e08a1e':'#b8475e';
    return '<details><summary><div><em>'+esc(x.kode)+' · Bidang '+esc(x.bid)+'</em><b>'+esc(x.nama)+'</b></div><div class="num"><small>Anggaran</small>'+rp(x.ang)+'</div><div class="num"><small>Realisasi</small>'+rp(x.rea)+'</div><div><div class="pg" style="--c:'+col+'"><i style="width:'+Math.min(100,p).toFixed(1)+'%"></i></div><div class="pgt">'+fp(p)+'</div></div></summary>'+
      '<div class="tw"><table><thead><tr><th>Rekening</th><th>Sumber</th><th class="n">Anggaran</th><th class="n">Realisasi</th></tr></thead><tbody>'+x.rows.filter(function(r){return r.anggaran||r.realisasi}).map(function(r){return '<tr><td>'+esc(r.kode)+' '+esc(r.uraian||(D.rek||{})[r.kode]||'')+'</td><td>'+esc(r.sumber||'')+'</td><td class="n">'+rp(r.anggaran)+'</td><td class="n">'+rp(r.realisasi)+'</td></tr>'}).join('')+'</tbody></table></div></details>'}).join(''):'<p class="empty">Tidak ada kegiatan yang cocok.</p>';
  var m=$('#kgMore');m.hidden=lim>=l.length;m.textContent='Tampilkan semua '+l.length+' kegiatan';
}
$('#kq').addEventListener('input',listKg);$('#kb').addEventListener('change',listKg);$('#ks').addEventListener('change',listKg);
$('#kgMore').onclick=function(){showAll=true;listKg()};

function lineChart(bul,tt){
  var box=$('#line');
  var last=tt?+tt.slice(5,7):0;bul.forEach(function(b){last=Math.max(last,+b.bln)});
  if(!last){box.innerHTML='<p class="empty">Belum ada transaksi.</p>';return}
  var m={};bul.forEach(function(b){m[+b.bln]=b});
  var cp=0,cb=0,pts=[];for(var i=1;i<=last;i++){var b=m[i]||{};cp+=+b.pendapatan||0;cb+=+b.belanja||0;pts.push({m:i,p:cp,b:cb,mp:+b.pendapatan||0,mb:+b.belanja||0})}
  var W=Math.max(340,Math.min(900,box.clientWidth||800)),H=W<600?260:300,L=58,Rr=16,T=14,B=34,mx=Math.max(cp,cb)||1,step=Math.pow(10,Math.floor(Math.log10(mx)))/2,nice=Math.ceil(mx/step)*step;
  var x=function(mn){return L+(mn-1)/11*(W-L-Rr)},y=function(v){return T+(1-v/nice)*(H-T-B)};
  var path=function(k){return pts.map(function(p,i){return (i?'L':'M')+x(p.m).toFixed(1)+' '+y(p[k]).toFixed(1)}).join(' ')};
  var area=function(k){return path(k)+' L'+x(last).toFixed(1)+' '+y(0)+' L'+x(1)+' '+y(0)+' Z'};
  var grid='';for(var g=0;g<=4;g++){var v=nice*g/4;grid+='<line class="gl" x1="'+L+'" x2="'+(W-Rr)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text class="ax" x="'+(L-8)+'" y="'+(y(v)+4)+'" text-anchor="end">'+P.rpShort(v)+'</text>'}
  var xl=BLN.map(function(n,i){if(W<600&&i%2)return '';return '<text class="ax" x="'+x(i+1)+'" y="'+(H-10)+'" text-anchor="middle"'+(i+1>last?' opacity=".4"':'')+'>'+n+'</text>'}).join('');
  var lp=pts[pts.length-1];
  var lab=function(k,c,dy){return '<text x="'+(x(lp.m)+(lp.m>6?-8:8))+'" y="'+(y(lp[k])+dy)+'" text-anchor="'+(lp.m>6?'end':'start')+'" font-size="12.5" font-weight="800" fill="#0f241a">'+(k==='p'?'Pendapatan ':'Belanja ')+P.rpShort(lp[k])+'</text>'};
  var dp=y(lp.p)<y(lp.b)?[-10,18]:[18,-10];
  box.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Grafik kumulatif pendapatan dan belanja">'+grid+xl+
    '<path class="ar" d="'+area('p')+'" fill="#1d7a4b"/><path class="ar" d="'+area('b')+'" fill="#e08a1e"/>'+
    '<g data-lc><path class="ln" d="'+path('p')+'" stroke="#1d7a4b"/><path class="ln" d="'+path('b')+'" stroke="#e08a1e"/></g>'+
    pts.map(function(p){return '<circle cx="'+x(p.m)+'" cy="'+y(p.p)+'" r="4" fill="#1d7a4b" stroke="#fffaf0" stroke-width="2"/><circle cx="'+x(p.m)+'" cy="'+y(p.b)+'" r="4" fill="#e08a1e" stroke="#fffaf0" stroke-width="2"/>'}).join('')+
    lab('p','#1d7a4b',dp[0])+lab('b','#e08a1e',dp[1])+
    '<line class="xh" id="xh" y1="'+T+'" y2="'+y(0)+'"/>'+
    pts.map(function(p){var w=(W-L-Rr)/11;return '<rect class="hit" data-m="'+p.m+'" x="'+(x(p.m)-w/2)+'" y="'+T+'" width="'+w+'" height="'+(H-T-B)+'"/>'}).join('')+'</svg>';
  $$('.hit',box).forEach(function(r){var p=pts[+r.getAttribute('data-m')-1];
    var h='<b>'+BLNP[p.m-1]+'</b>Pendapatan s.d. bulan ini: '+rp(p.p)+'<br>Belanja s.d. bulan ini: '+rp(p.b)+'<br><span style="opacity:.75">Bulan ini: +'+rs(p.mp)+' / −'+rs(p.mb)+'</span>';
    r.addEventListener('pointermove',function(e){tipOn(e,h);var xh=$('#xh');xh.setAttribute('x1',x(p.m));xh.setAttribute('x2',x(p.m));xh.style.opacity=.6});
    r.addEventListener('pointerleave',function(){tipOff();$('#xh').style.opacity=0});
  });
  whenSeen(box,function(){$$('.ar',box).forEach(function(a){a.classList.add('on')});var g=$('[data-lc]',box);var pp=$$('path.ln',g);pp.forEach(function(p,i){var L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.getBoundingClientRect();p.style.transition='stroke-dashoffset 2s cubic-bezier(.2,.8,.2,1) '+(i*.2)+'s';p.style.strokeDashoffset=0})});
}
})();
