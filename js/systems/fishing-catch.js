"use strict";
/* Hands-on fishing, part 2: what a landed catch does, the art, the catch card and the context button. State machine is in fishing.js. */
/* the catch is applied the moment it lands */
function fishLand(){
  const f=FS.fish;let first=false,size=0,extra=0;
  if(f.junk){
    if(f.junk.scrap)G.inv.scrap+=f.junk.scrap;
    fishFloat('Not a fish','#ffd9a0');
  }else{
    size=Math.round(rnd(f.art.cm[0],f.art.cm[1])*(FS.perfect?1.12:1));
    extra=FS.perfect&&Math.random()<.25?1:0;
    G.inv.fish+=1+extra;G.fishStock=clamp(G.fishStock-3*(1+extra),0,100);
    first=logFishOne(f.pk);logSync();
    if(first)fishFloat('New!','#7ff0d6');else if(FS.perfect)fishFloat('Perfect catch','#7ff0d6');
    quip('fish');
  }
  FS.card={junk:!!f.junk,first,size,extra,perfect:FS.perfect,sp:f.junk?f.junk:f.art,name:f.junk?f.junk.n:f.pk.n,rare:!f.junk&&!!f.pk.rare,count:f.junk?0:G.log.fish[f.pk.n],flav:f.junk?f.junk.f:f.art.f};
  sfx('good');fishCard(FS.card);fishSpend(ri(15,25),2);
}
/* ---- art: pack icons with canvas colour filters, a drawn fallback for the eel and while the pack loads ---- */
const FISH_PACK=new Image();FISH_PACK.src=FISH_PACK_URI;
let FISH_BOB=null;
function fishPackIcon(i,fl){
  const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');
  if(fl&&'filter' in g)g.filter=fl;
  g.drawImage(FISH_PACK,((i-1)%4)*16,((i-1)/4|0)*16,16,16,0,0,16,16);return c;
}
function fishArt(sp){
  if(sp.pk&&FISH_PACK.complete&&FISH_PACK.naturalWidth)return sp.pcv||(sp.pcv=fishPackIcon(sp.pk,sp.fl));
  return fishDrawn(sp);
}
function fishDrawn(sp){
  if(sp.cv)return sp.cv;
  const s=sp.s||'slim',c0=sp.c||['#4a6378','#a9bccb','#e8eef2'];
  const [Wd,Ht]={deep:[22,14],slim:[24,9],eel:[36,7],flat:[22,15],big:[30,15]}[s];
  const c=document.createElement('canvas');c.width=Wd;c.height=Ht;const g=c.getContext('2d');
  const tw=s==='eel'?3:s==='flat'?4:Math.round(Wd*.22),bx=tw+(Wd-tw)/2,by=Ht/2,rx=(Wd-tw)/2-.5,ry=s==='eel'?Ht/2-1.5:Ht/2-1;
  const body=(x,y)=>{const dx=(x+.5-bx)/rx,dy=(y+.5-by)/ry;
    if(s==='eel'){if(x<tw)return Math.abs(y+.5-by)<1.2;return Math.abs(dy)<=1&&dx<1.02&&!(dx>.86&&Math.abs(dy)>.55)}
    return dx*dx+dy*dy<=1};
  const tail=(x,y)=>x<tw+1&&s!=='eel'&&Math.abs(y+.5-by)<=Ht*.46*(1-x/(tw+1))+1;
  const inside=(x,y)=>x>=0&&y>=0&&x<Wd&&y<Ht&&(body(x,y)||tail(x,y));
  for(let y=0;y<Ht;y++)for(let x=0;x<Wd;x++){
    if(!inside(x,y))continue;
    const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
    let col=y<by-ry*.25?c0[0]:y>by+ry*.35?c0[2]:c0[1];
    if(tail(x,y)&&!body(x,y))col=tone(c0[0],.85);
    g.fillStyle=edge?'#151720':col;g.fillRect(x,y,1,1);
  }
  const ex=Math.round(bx+rx*.62),ey=Math.round(by-ry*.3);
  g.fillStyle='#f4f2ea';g.fillRect(ex,ey,2,2);g.fillStyle='#151720';g.fillRect(ex+1,ey,1,1);
  /* pack species fall back to this drawing only until the sheet loads, so do not cache that */
  if(!sp.pk)sp.cv=c;
  return c;
}
/* ---- the catch card (DOM, game style) ---- */
function fishCard(c){
  const el=$('#fcard');if(!el)return;
  if(!c){el.hidden=true;return}
  const cv2=$('#fcard-cv'),a=fishArt(c.sp);cv2.width=a.width;cv2.height=a.height;
  const g=cv2.getContext('2d');g.clearRect(0,0,cv2.width,cv2.height);g.drawImage(a,0,0);
  $('#fcard-name').innerHTML=esc(c.name)+(c.first?'<span class="fbadge">New in your Bay Log</span>':'');
  $('#fcard-meta').textContent=c.junk?'Not a fish. Back it goes.':`${c.size} cm${c.rare?' · rare':''}${c.perfect?' · perfect catch':''}${c.extra?' · plus one more':''} · caught ${c.count}×`;
  $('#fcard-flav').textContent=c.flav;
  el.hidden=false;
}
/* ---- the context button ---- */
function fishLabel(){
  return {idle:'Fish',casting:'Casting…',waiting:'Waiting…',bite:'Reel in!',reeling:'Reeling…',missed:'…',landed:FS.card&&FS.card.junk?'Toss it back':'Keep it'}[FS.st]||'Fish';
}
const fishMode=()=>FS.st==='bite'?'urgent':FS.st==='idle'||FS.st==='landed'?'go':'wait';
ctxRegister({id:'fish',when:()=>fishBusy()||fishAtSpot(),label:fishLabel,mode:fishMode,run:()=>fishAct(),more:()=>{fishCancel();waterfront()}});
