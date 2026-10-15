"use strict";
/* Dig the flats by hand: at low tide a few glints show on the exposed mud (FLAT tiles, the river-mouth walkway). Stand next to one and the
   context button says Dig. Spots are a pure function of the tide cycle (hash of the tide index and slot), so nothing is saved; dug spots are
   remembered in DG.dug for the rest of that tide. Rewards reuse the old scavenge numbers (scrap scaled by G.flats, strongbox), plus pack-icon
   flavour finds that go in the Bay Log (L.finds) for a few coins. Drawing is in js/render/flats.js. The old menu action stays under More... */
const FLAT_FINDS=[
 {n:'Weed-line shell',pk:13,w:4,f:'Spiral, and no use for anything but holding up to your ear.'},
 {n:'Sand dollar',pk:14,w:3,f:'Worth exactly nothing, which is still something.'},
 {n:'Snail',pk:7,w:3,f:'Slow, damp and unbothered. You set it down gently.'},
 {n:'Moss ball',pk:11,w:3,f:'Soft, round, and smells of the harbour floor.'},
 {n:'Starfish',pk:15,w:2,f:'Left behind by the tide. You nudge it toward the water.'},
 {n:'Sea spider',pk:4,w:1,f:'You put it back. Quickly.'},
 {n:'Plastic bag',pk:12,w:2,f:'Marrow Bay sends its regards. It counts as scrap.',scrap:1}
];
const FLAT_SLOTS=8,FLAT_NEAR=1.3,FLAT_DIG_MS=750,FLAT_POP_MS=1500;
const DG={st:'idle',t0:0,now:0,slot:-1,sx:0,sy:0,res:null,fx:[],dug:{},idx:-1};
Object.assign(SFX,{
 dig:[[150,.1,'sawtooth',.05,0,90],[120,.12,'triangle',.05,.13,80]],
 digpop:[[620,.07,'triangle',.06],[930,.1,'triangle',.06,.07]]
});
const flatHash=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
const flatTideIdx=()=>Math.floor((G.t+190)/(12.4*60));
function flatsLow(){return !!G&&typeof flatsOpen!=='undefined'&&flatsOpen&&tideV()<-.4}
/* the glints on show right now: [{slot,x,y (tile units, tile centre = integer),ph}] */
function flatSpots(){
  if(!flatsLow())return[];
  const idx=flatTideIdx();if(DG.idx!==idx){DG.idx=idx;DG.dug={}}
  const cyc=tideCycle(),p=cyc==='spring'?.9:cyc==='neap'?.4:.55,out=[];
  for(let s=0;s<FLAT_SLOTS;s++){
    if(DG.dug[s]||flatHash(idx,s)>=p)continue;
    out.push({slot:s,x:FLAT_X[s>>1]+(flatHash(idx,s+40)-.5)*.7,y:FLAT_Y+(flatHash(idx,s+80)-.5)*.5,ph:flatHash(idx,s+120)*6.28,two:flatHash(idx,s+160)<.45});
  }
  return out;
}
function flatNear(){
  if(!G)return null;let best=null,bd=FLAT_NEAR;
  flatSpots().forEach(q=>{const d=Math.hypot(G.p.x-q.x,G.p.y-q.y);if(d<bd){bd=d;best=q}});
  return best;
}
const digBusy=()=>DG.st!=='idle';
function digCanAct(){return !!G&&!modal&&!popOpen&&!G.jail&&!placing&&!(G.veh&&G.veh.active!=='none')&&!G.p.path.length}
function digFloat(s,col){DG.fx.push({k:'text',s,col,t:DG.now,life:1400})}
function digPuff(x,y,n){for(let i=0;i<n;i++)DG.fx.push({k:'mud',x,y,vx:rnd(-1,1)*.8,vy:-rnd(.6,1.9),t:DG.now,life:rnd(380,650),c:Math.random()<.5?'#4a3a28':'#6b5638'})}
function digReset(){DG.st='idle';DG.res=null;DG.fx.length=0;DG.slot=-1}
function digAct(now){
  now=now==null?performance.now():now;DG.now=now;
  if(DG.st!=='idle')return;
  const q=flatNear();if(!q||!digCanAct())return;
  if(G.energy<3){notify('Too tired to dig. Eat or rest first.');return}
  DG.st='digging';DG.t0=now;DG.slot=q.slot;DG.sx=q.x*TS+8;DG.sy=q.y*TS+8;DG.res=null;
  digPuff(DG.sx,DG.sy,8);sfx('dig');
}
/* what the mud gives up: scrap (old scavenge maths for one dig), a strongbox now and then, or a flavour find */
function digRoll(){
  const spring=tideCycle()==='spring',r=Math.random();
  if(r<.5){
    let n=1+(has('strong')?1:0)+(G.companion==='pip'?1:0)+(spring&&Math.random()<.5?1:0);
    n=Math.round(n*clamp(G.flats/60,.3,1.2));if(G.flats>15)n=Math.max(1,n);
    if(!n)return{kind:'silt',name:'Nothing but silt'};
    return{kind:'scrap',name:n+' scrap',n};
  }
  if(r<.5+(spring?.06:.04))return{kind:'box',name:'A strongbox',cash:ri(25,60)};
  const ws=FLAT_FINDS.map(f=>f.w*(spring&&f.w<=2?1.5:1));let t=Math.random()*ws.reduce((a,b)=>a+b,0),f=FLAT_FINDS[0];
  for(let i=0;i<ws.length;i++){t-=ws[i];if(t<=0){f=FLAT_FINDS[i];break}}
  return{kind:'find',name:f.n,find:f};
}
function digApply(res){
  let col='#fff2c4';
  if(res.kind==='scrap'){G.inv.scrap+=res.n;G.flats=clamp(G.flats-res.n*5,0,100);col='#d6dbe0'}
  else if(res.kind==='box'){G.cash+=res.cash;col='#ffd88a';res.name='Strongbox: '+money(res.cash)}
  else if(res.kind==='find'){
    const f=res.find;if(f.scrap)G.inv.scrap+=f.scrap;
    const first=logFindOne(f.n);if(!f.scrap)G.cash+=ri(2,5);
    res.first=first;col=first?'#7ff0d6':'#fff2c4';
  }else col='#b9a58a';
  digFloat(res.kind==='find'&&res.first?'New! '+res.name:res.name,col);
  sfx(res.kind==='silt'?'splash':'digpop');if(res.kind!=='silt')vib(20);
  if(res.kind==='find')notify(res.find.f);
}
function digUpdate(now){
  now=now==null?performance.now():now;DG.now=now;
  if(DG.st==='idle')return;
  if(DG.st==='digging'){
    if(!G||!digCanAct())return digReset();
    if(now-DG.t0>=FLAT_DIG_MS){
      DG.dug[DG.slot]=1;
      const res=digRoll();DG.res=res;DG.st='pop';DG.t0=now;digPuff(DG.sx,DG.sy,14);
      advance(ri(10,15));G.energy=clamp(G.energy-3,0,100);
      digApply(res);if(Math.random()<.5)foundFlats();
    }
  }else if(DG.st==='pop'&&now-DG.t0>=FLAT_POP_MS)digReset();
}
const digLabel=()=>DG.st==='digging'?'Digging…':DG.st==='pop'?'…':'Dig';
ctxRegister({id:'dig',when:()=>digBusy()||(digCanAct()&&!!flatNear()),label:digLabel,mode:()=>digBusy()?'wait':'go',run:()=>digAct(),more:()=>{digReset();waterfront()}});
