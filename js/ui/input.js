"use strict";
/* Canvas, camera, tap-to-walk. */
/* ================= INPUT ================= */
const cv=$('#scene'),cx=cv.getContext('2d'),stage=$('#stage');
let camX=0,camY=0,dest=null,last=performance.now();
function fitCanvas(){
  const r=stage.getBoundingClientRect();if(!r.width)return;
  if(r.width>r.height*1.25){const s=r.height/128;VH=128;VW=Math.min(W*TS,Math.round(r.width/s))}
  else{VW=176;const s=r.width/VW;VH=Math.max(96,Math.round(r.height/s))}
  if(cv.width!==VW)cv.width=VW;if(cv.height!==VH)cv.height=VH;
}
new ResizeObserver(fitCanvas).observe(stage);window.addEventListener('resize',fitCanvas);fitCanvas();

function walkTo(tx,ty,then){
  const p=G.p;
  const sx=p.path.length?p.path[0][0]:Math.round(p.x),sy=p.path.length?p.path[0][1]:Math.round(p.y);
  const path=bfs(sx,sy,tx,ty);
  if(!path)return notify('You cannot get there.');
  p.path=p.path.length?[p.path[0],...path]:path;
  p.onArrive=then||null;dest=[tx,ty];
  if(!p.path.length&&then){p.onArrive=null;then()}
}
function goPOI(poi){worldPanel();walkTo(poi.ex,poi.ey,()=>openPOI(poi))}
function goTalk(n){
  const p=G.p;
  if(Math.hypot(n.x-p.x,n.y-p.y)<=1.6){p.path=[];return talk(n)}
  walkTo(Math.round(n.x),Math.round(n.y),()=>talk(n));
}
cv.addEventListener('pointerdown',e=>{
  if(!G||G.jail)return;
  e.preventDefault();
  if(modal){if(!dismissable)return;worldPanel()}
  const r=cv.getBoundingClientRect();
  const fx=((e.clientX-r.left)/r.width*VW+camX)/TS,fy=((e.clientY-r.top)/r.height*VH+camY)/TS;
  const tx=Math.floor(fx),ty=Math.floor(fy);
  if(tx<0||ty<0||tx>=W||ty>=H)return;
  if(placing)return tryPlace(tx,ty);
  /* Streets are one tile wide, so someone is nearly always standing next to whatever you tap. A tap that lands on a stop or a structure only goes to a person who is almost on that exact spot. */
  const onThing=STOPS.some(s=>s.x===tx&&s.y===ty)||!!structAt(tx,ty),reach=onThing?.5:1.1;
  let best=null,bd=reach;
  NPCS.forEach(n=>{if(n.indoors)return;const d=Math.hypot(n.x+.5-fx,n.y+.5-fy);if(d<bd){bd=d;best=n}});
  if(best)return goTalk(best);
  const wk=walkerAt(fx,fy,reach);if(wk)return goTalkWalker(wk);
  const stop=STOPS.find(s=>Math.abs(s.x-tx)<=0&&Math.abs(s.y-ty)<=0);
  if(stop)return walkTo(tx,ty,()=>stopMenu(stop));
  const st=structAt(tx,ty);
  if(st)return walkTo(tx,ty,()=>structMenu(st));
  const t=map[ty][tx];
  if(t===T.BLD){
    const b=blocks.find(b=>tx>=b.x&&tx<b.x+4&&ty>=b.y&&ty<b.y+4);
    if(b&&b.poi)return goPOI(POIS[b.poi]);
    if(b)return walkTo(b.x+1,b.y+4,()=>propertyMenu(b));
    return;
  }
  if(t===T.FARM){const pl=G.plots.find(q=>q.x===tx&&q.y===ty);return walkTo(tx,ty,()=>plotMenu(pl))}
  if(t===T.PLAZA)return walkTo(tx,ty,()=>plazaMenu());
  if(t===T.DOCK)return walkTo(tx,ty,()=>waterfront());
  if(t===T.WATER)return notify('Deep water.');
  walkTo(tx,ty);
});
