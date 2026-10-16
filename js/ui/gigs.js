"use strict";
/* Hands-on gig shifts: a ~20-30 s tap game per job (dock crates, diner tickets, estate hedges, workshop riveting) in a compact overlay.
   Payment, time, energy and rank all still go through gig() (js/menus/core.js); the game only produces a performance {mul,bump} that gig() applies.
   "Skip" runs the old instant shift at 1.0x. Transient state only (MG), nothing is saved. Setting: SET.minigames===false skips the game.
   Tests drive it with MG_MANUAL=true and mgStep(now)/mgTap(x,y,now); inside an iframe it is skipped unless MG_FORCE. */
const MG_TIERS=[{n:'Poor',min:0,mul:.8},{n:'Okay',min:.4,mul:1},{n:'Good',min:.65,mul:1.15},{n:'Great',min:.85,mul:1.3,bump:1}];
const MG_TITLE={dock:'Stack the crates',diner:'Fill the tickets',estate:'Prune the hedge',workshop:'Rivet the plate'};
const MG_HELP={dock:'Tap to drop the crate. Line it up on the stack.',diner:'Tap the dishes in the order on the ticket.',estate:'Tap overgrown tufts before they spread.',workshop:'Tap when the marker is in the bright zone.'};
const MG_W=160,MG_H=100;
let MG=null,MG_MANUAL=false,MG_FORCE=false,MG_DONE=()=>{};
Object.assign(SFX,{
 mgok:[[660,.07,'square',.05],[880,.08,'square',.05,.07]],
 mgbad:[[200,.14,'sawtooth',.05,0,110]],
 mgdrop:[[300,.1,'triangle',.05,0,120]]
});
function mgTier(score){let t=MG_TIERS[0];MG_TIERS.forEach(x=>{if(score>=x.min)t=x});return t}
function mgEnabled(){return SET.minigames!==false&&(MG_FORCE||window.top===window)}
/* entry point: kind is the job id; cfg is the gig() config; done(msg) gets gig()'s result string; long = rank-2 shift */
function gigPlay(kind,n,cfg,done,long){
  const instant=()=>done(gig(n,cfg));
  if(MG||!mgEnabled()||G.energy<cfg.hrs*7*((cfg.job&&jobRank(cfg.job)>=4)?.75:1))return instant();
  MG_DONE=done;
  mgOpen(kind,!!long,perf=>gig(n,Object.assign({},cfg,{perf})),instant);
}
function mgOpen(kind,long,pay,skip){
  mgClose();
  const el=document.createElement('div');el.id='mg';
  el.innerHTML=`<div class="mgp"><h3>${esc(MG_TITLE[kind])}${long?' (long shift)':''}</h3><p class="muted small" id="mg-help">${esc(MG_HELP[kind])}</p><canvas id="mg-cv" width="${MG_W}" height="${MG_H}"></canvas><div id="mg-res" hidden></div><div class="mgb"><button type="button" class="btn quiet" id="mg-skip"><span>Skip (work it normally)</span></button></div></div>`;
  document.body.appendChild(el);
  MG={kind,long,pay,skip,el,cv:el.querySelector('#mg-cv'),st:'play',t0:null,now:0};
  MG.cv.addEventListener('pointerdown',e=>{e.preventDefault();const r=MG.cv.getBoundingClientRect();mgTap((e.clientX-r.left)*MG_W/r.width,(e.clientY-r.top)*MG_H/r.height,performance.now())});
  el.querySelector('#mg-skip').addEventListener('click',()=>{const s=MG.skip;mgClose();s()});
  MG.g=MGAMES[kind].init(long);
  ui('',[],false);
  mgDraw(0);
  if(!MG_MANUAL){const loop=t=>{if(!MG||MG.el!==el)return;mgStep(t);requestAnimationFrame(loop)};requestAnimationFrame(loop)}
}
function mgClose(){if(MG){MG.el.remove();MG=null}}
function mgStep(now){
  if(!MG||MG.st!=='play')return;
  if(MG.t0==null)MG.t0=now;
  MG.now=now;const t=now-MG.t0;
  const r=MGAMES[MG.kind].step(MG.g,t,MG.long);
  if(r!=null)return mgFinish(r);
  mgDraw(t);
}
function mgTap(x,y,now){
  if(!MG||MG.st!=='play')return;
  if(MG.t0==null)MG.t0=now;
  MG.now=now;
  const r=MGAMES[MG.kind].tap(MG.g,now-MG.t0,x,y,MG.long);
  if(r!=null)mgFinish(r);
}
function mgFinish(score){
  if(!MG||MG.st!=='play')return;
  score=clamp(score,0,1);MG.st='result';
  const tier=mgTier(score),perf={mul:tier.mul,bump:tier.bump||0,tier:tier.n,score};
  const msg=MG.pay(perf);MG.perf=perf;MG.msg=msg;
  if(tier.bump)vib([30,40,60]);sfx(tier.bump?'good':tier.mul>=1?'mgok':'mgbad');
  const box=MG.el.querySelector('#mg-res');
  box.hidden=false;
  box.innerHTML=`<div class="mgt">${tier.n}</div><p class="small">Pay x${tier.mul.toFixed(2)}${tier.bump?'. The boss noticed: extra rank progress':''}</p><p class="amber small">${esc(msg)}</p>`;
  const b=document.createElement('button');b.type='button';b.className='btn primary';b.id='mg-go';b.innerHTML='<span>Continue</span>';
  b.addEventListener('click',()=>{mgClose();MG_DONE(msg)});box.appendChild(b);
  MG.el.querySelector('.mgb').hidden=true;MG.el.querySelector('#mg-help').hidden=true;
  mgDraw(MG.now-(MG.t0||0));
}
const mgR=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
const mgT=(g,s,x,y,c,sz,al)=>{g.fillStyle=c||'#e8e2d0';g.font=`bold ${sz||8}px "Silkscreen","Courier New",monospace`;g.textAlign=al||'left';g.textBaseline='top';g.fillText(s,Math.round(x),Math.round(y))};
function mgDraw(t){
  const g=MG.cv.getContext('2d');
  mgR(g,'#1c2128',0,0,MG_W,MG_H);
  MGAMES[MG.kind].draw(g,MG.g,t,MG.long);
}
/* ---- the four games. Each: init(long) -> state; step(s,t,long) -> score|null; tap(s,t,x,y,long) -> score|null; draw(g,s,t,long) ---- */
const MGAMES={
dock:{
  init(long){return{n:long?8:6,i:0,sc:[],st:'swing',ft:0,drop:80,stack:[80],msg:'',t:0}},
  hx(s,t){return 80+58*Math.sin(t*(.0028+s.i*.00028))},
  avg(s){while(s.sc.length<s.n)s.sc.push(0);return s.sc.reduce((a,b)=>a+b,0)/s.n},
  step(s,t,long){
    s.t=t;
    if(s.st==='fall'&&t-s.ft>260){
      const top=s.stack[s.stack.length-1],q=clamp(1-Math.abs(s.drop-top)/20,0,1);
      s.sc.push(q);s.stack.push(clamp(s.drop,top-18,top+18));s.msg=q>.85?'Perfect':q>.5?'Close':'Sloppy';s.i++;s.st='swing';
      sfx(q>.5?'mgok':'mgbad');
      if(s.i>=s.n)return this.avg(s);
    }
    if(t>(long?42000:34000))return this.avg(s);
    return null},
  tap(s,t){if(s.st!=='swing')return null;s.drop=this.hx(s,t);s.st='fall';s.ft=t;sfx('mgdrop');return null},
  draw(g,s,t){
    mgR(g,'#2c5b78',0,0,MG_W,70);mgR(g,'#3b3f47',0,88,MG_W,12);mgR(g,'#555',0,10,MG_W,2);
    s.stack.forEach((x,k)=>{if(k){mgR(g,k%2?'#b8782f':'#9a6424',x-9,88-k*9,18,9);mgR(g,'#5b3a12',x-9,88-k*9,18,1)}});
    const top=s.stack.length-1,ty=88-(top+1)*9;
    if(s.i<s.n){
      if(s.st==='swing'){const x=this.hx(s,t);mgR(g,'#999',x,12,1,10);mgR(g,'#d1a04a',x-9,22,18,9);mgR(g,'#5b3a12',x-9,22,18,1)}
      else{const p=clamp((t-s.ft)/260,0,1);mgR(g,'#d1a04a',s.drop-9,22+(ty-22)*p,18,9)}
    }
    mgR(g,'#7fd6a0',s.stack[top]-1,ty+10,2,2);
    mgT(g,`${s.i}/${s.n}  ${s.msg}`,4,2,'#e8e2d0',8);
  }},
diner:{
  init(long){const s={n:long?7:5,i:0,lim:long?5200:6200,sc:[],tk:null,t0:0,msg:'',t:0};this.next(s,0);return s},
  next(s,t){const L=3+(s.i>=3?1:0);s.tk={seq:Array.from({length:L},()=>Math.floor(Math.random()*5)),p:0,wrong:0};s.t0=t},
  fin(s,t){const k=s.tk,sp=clamp(1-(t-s.t0)/s.lim,0,1),q=clamp(k.p/k.seq.length-k.wrong*.12,0,1)*(.55+.45*sp);
    s.sc.push(q);s.i++;s.msg=q>.8?'Fast':q>.4?'Served':'Late';
    if(s.i>=s.n)return s.sc.reduce((a,b)=>a+b,0)/s.n;
    this.next(s,t);return null},
  step(s,t){s.t=t;return t-s.t0>s.lim?this.fin(s,t):null},
  tap(s,t,x,y){
    if(y<50)return null;
    const d=Math.floor(x/(MG_W/5));if(d<0||d>4)return null;
    const k=s.tk;
    if(k.seq[k.p]===d){k.p++;sfx('mgok');if(k.p>=k.seq.length)return this.fin(s,t)}else{k.wrong++;sfx('mgbad')}
    return null},
  draw(g,s,t){
    const cols=['#c0392b','#e0b040','#3d7cc9','#d9772b','#4aa56a'],ch=['B','F','S','P','D'];
    mgR(g,'#e8e2d0',8,6,144,34);const k=s.tk;
    if(s.i<s.n)k.seq.forEach((d,j)=>{const x=14+j*34;mgR(g,cols[d],x,12,26,22);mgT(g,ch[d],x+13,17,'#fff',12,'center');if(j<k.p)mgR(g,'rgba(0,0,0,.6)',x,12,26,22)});
    const sp=s.i<s.n?clamp(1-(t-s.t0)/s.lim,0,1):0;
    mgR(g,'#444',8,43,144,3);mgR(g,sp>.3?'#7fd6a0':'#e0705f',8,43,144*sp,3);
    for(let d=0;d<5;d++){const x=d*32+3;mgR(g,cols[d],x,56,26,30);mgR(g,'rgba(255,255,255,.25)',x,56,26,3);mgT(g,ch[d],x+13,64,'#fff',14,'center')}
    mgT(g,`${s.i}/${s.n}  ${s.msg}`,4,90,'#e8e2d0',8);
  }},
estate:{
  init(long){return{dur:long?28000:21000,cells:Array.from({length:16},()=>({st:0,at:0})),nx:900,spawned:0,cut:0,bad:0,t:0}},
  step(s,t,long){
    s.t=t;
    s.cells.forEach(c=>{if(c.st===1&&t-c.at>2300){c.st=2;s.bad++;sfx('mgbad')}});
    if(t<s.dur-2300&&t>=s.nx){
      const free=s.cells.filter(c=>c.st!==1);
      if(free.length){const c=free[Math.floor(Math.random()*free.length)];c.st=1;c.at=t;s.spawned++}
      s.nx=t+Math.max(380,800-t/s.dur*350)*(long?.8:1);
    }
    if(t>=s.dur)return s.spawned?clamp(s.cut/s.spawned,0,1):0;
    return null},
  tap(s,t,x,y){
    const cx=Math.floor((x-20)/30),cy=Math.floor((y-10)/20);
    if(cx<0||cx>3||cy<0||cy>3)return null;
    const c=s.cells[cy*4+cx];
    if(c.st===1){c.st=0;s.cut++;sfx('mgok')}else if(c.st===2)c.st=0;else sfx('mgbad');
    return null},
  draw(g,s,t){
    s.cells.forEach((c,i)=>{const x=20+(i%4)*30,y=10+Math.floor(i/4)*20;
      mgR(g,'#2f6a3b',x+1,y+1,28,18);mgR(g,'#3a7d47',x+1,y+1,28,3);
      if(c.st===1){const a=clamp((t-c.at)/2300,0,1);mgR(g,'#7cc84a',x+6,y+3,16,13);mgR(g,'#a8e060',x+9,y+1,3,5);mgR(g,'#a8e060',x+15,y+1,3,5);mgR(g,a>.65?'#e0705f':'#222',x+2,y+17,26*(1-a),2)}
      if(c.st===2){mgR(g,'#6a4a2a',x+4,y+3,20,13);mgR(g,'#8a6a3a',x+8,y+1,4,5)}
    });
    mgT(g,`Trimmed ${s.cut}`,4,0,'#e8e2d0',8);mgT(g,`Missed ${s.bad}`,156,0,'#e0705f',8,'right');
    mgR(g,'#444',20,94,120,3);mgR(g,'#6bbf8a',20,94,120*clamp(t/s.dur,0,1),3);
  }},
workshop:{
  init(long){return{n:long?7:5,i:0,sc:[],msg:'',flash:0,t:0}},
  zone(s){return Math.max(.08,.2-s.i*.02)},
  posAt(s,t){const ph=(t*(.0011+s.i*.00018))%2;return ph<1?ph:2-ph},
  step(s,t){s.t=t;if(t>38000){while(s.sc.length<s.n)s.sc.push(0);return s.sc.reduce((a,b)=>a+b,0)/s.n}return null},
  tap(s,t){
    const z=this.zone(s),q=clamp(1-Math.max(0,Math.abs(this.posAt(s,t)-.5)-z*.2)/(z*1.6),0,1);
    s.sc.push(q);s.i++;s.msg=q>.85?'Clean':q>.5?'Decent':'Crooked';s.flash=t;sfx(q>.5?'mgok':'mgbad');
    return s.i>=s.n?s.sc.reduce((a,b)=>a+b,0)/s.n:null},
  draw(g,s,t){
    const z=this.zone(s),x0=10,w=140,pos=this.posAt(s,t);
    mgR(g,'#3b3f47',0,60,MG_W,40);mgR(g,'#8a8f98',20,50,120,10);
    for(let k=0;k<s.n;k++)mgR(g,k<s.i?(s.sc[k]>.5?'#d9d9d9':'#a04a3a'):'#555',24+k*Math.floor(110/s.n),52,6,6);
    mgR(g,'#2a2f38',x0,26,w,14);mgR(g,'#7fd6a0',x0+w*(.5-z/2),26,w*z,14);mgR(g,'#e8e2d0',x0+w*(.5-z*.1),26,w*z*.2,14);
    mgR(g,'#e0705f',x0+w*pos-1,22,3,22);
    if(s.flash&&t-s.flash<150)mgR(g,'#fff',60,70,40,3);
    mgT(g,`${s.i}/${s.n}  ${s.msg}`,4,2,'#e8e2d0',8);
  }}
};
