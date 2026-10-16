"use strict";
/* Ambient street traffic (purely cosmetic, never saved, never touches game state or the game's random numbers: it has its own small generator).
   A fixed pool of TR_MAX vehicles plus one tram, drawn from the side-view sheets in sprites-veh.js. Traffic runs on the HORIZONTAL roads only (the sheets are side views and
   there is no top view, so vertical streets stay empty); it goes straight across junctions and turns around at the end of a road. Right-hand traffic: east on the lower lane, west on the upper.
   Vehicles spawn just off screen on a visible road, scale with district and time of day, and are freed once they are far from the view. They slow and stop for the player
   or a vehicle ahead; after waiting a few seconds they creep past the player so nothing ever blocks the way. The tram shuttles along the y=17 line and waits at the stops on it. */
const TR_MAX=12,TR_LANE_E=13,TR_LANE_W=7;
let trSeed=0x51ed270b,trLast=0,trSpawnT=0,trCount=0,trNow=0;
function trRand(){trSeed=(trSeed+0x6D2B79F5)|0;let t=trSeed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
const TR_KINDS={sedan:{sheet:'sedan_by_paint',half:12,v:[20,28]},coupe:{sheet:'coupe_by_paint',half:12,v:[22,30]},taxi:{sheet:'taxi',half:12,v:[20,26]},police:{sheet:'police',half:12,v:[24,32]},van:{sheet:'van',half:12,v:[16,22]},tram:{sheet:'tram',half:30,v:[17,17]}};
const trMake=()=>{const v={on:false,kind:'sedan',row:0,x:0,ty:0,tx:-1,dir:1,lane:TR_LANE_E,v:0,maxv:24,wait:0,ghost:false,sx0:0,sx1:0,half:12,dwell:0,stop:-1,ent:null};v.ent={y:0,f:()=>trDraw(v)};return v};
const TR_POOL=Array.from({length:TR_MAX},trMake),TR_TRAM=trMake();
TR_TRAM.kind='tram';TR_TRAM.half=30;TR_TRAM.maxv=17;TR_TRAM.ty=17;TR_TRAM.x=20*TS+8;TR_TRAM.on=true;TR_TRAM.dwell=1;
/* the road run (px limits for the vehicle centre) under a vehicle: recomputed only when it crosses into a new tile */
function trSeg(v){
  const tx=Math.floor(v.x/TS);if(tx===v.tx)return true;v.tx=tx;
  const row=map[v.ty];if(!row||row[tx]!==T.ROAD)return false;
  let a=tx,b=tx;while(a>0&&row[a-1]===T.ROAD)a--;while(b<W-1&&row[b+1]===T.ROAD)b++;
  v.sx0=a*TS+v.half+2;v.sx1=b*TS+TS-v.half-2;return true;
}
function trTarget(){
  const d=district(clamp((camX+VW/2)/TS|0,0,W-1),clamp((camY+VH/2)/TS|0,0,H-1)),h=(clockNow()/60)%24;
  let n={Highline:5,Grid:6,Dockside:3,Greenbelt:2,'Neon Mile':3,'Foundry Row':4}[d]||3;
  if(h>=21||h<5)n=d==='Neon Mile'?4:Math.max(1,Math.round(n*.35));else if(h>=17&&h<20)n++;
  return Math.min(TR_MAX-1,n);
}
function trSpawn(){
  const rows=[];for(let i=0;i<HY.length;i++){const y=HY[i]*TS;if(y+TS>camY-8&&y<camY+VH+8)rows.push(HY[i])}
  if(!rows.length)return;
  const ty=rows[trRand()*rows.length|0],row=map[ty];
  for(let k=0;k<6;k++){
    const x=Math.floor(trRand()*(W*TS)),tx=x/TS|0;
    if(row[tx]!==T.ROAD||(x>camX-30&&x<camX+VW+30))continue; /* only off screen, and only on road */
    if(TR_TRAM.ty===ty&&Math.abs(TR_TRAM.x-x)<110||TR_POOL.some(o=>o.on&&o.ty===ty&&Math.abs(o.x-x)<70))continue; /* never spawn on top of another vehicle */
    const h=(clockNow()/60)%24,night=h>=21||h<5,d=district(tx,ty),heat=G&&G.heat||0;let pol=0;TR_POOL.forEach(o=>{if(o.on&&o.kind==='police')pol++});
    let kind='sedan';
    if(pol<(heat>=2?2:1)&&trRand()<.04+.1*Math.min(3,heat))kind='police';
    else if(d==='Neon Mile'&&night&&trRand()<.55)kind='taxi';
    else if((d==='Foundry Row'||d==='Dockside')&&trRand()<.38)kind='van';
    else if(trRand()<.1)kind='taxi';
    else kind=trRand()<.5?'sedan':'coupe';
    const o=TR_POOL.find(q=>!q.on);if(!o)return;
    const K=TR_KINDS[kind];o.on=true;o.kind=kind;o.row=trRand()*8|0;o.half=K.half;o.maxv=K.v[0]+trRand()*(K.v[1]-K.v[0]);
    o.ty=ty;o.x=x;o.dir=trRand()<.5?1:-1;o.lane=o.dir>0?TR_LANE_E:TR_LANE_W;o.v=o.maxv*.6;o.tx=-1;o.wait=0;o.ghost=false;o.dwell=0;trCount++;
    if(!trSeg(o)){o.on=false;trCount--;continue}
    o.x=clamp(o.x,o.sx0,o.sx1);return;
  }
}
function trStep(v,dt,all){
  if(!trSeg(v)){v.on=false;if(v.kind!=='tram')trCount--;return}
  const ly=v.ty*TS+(v.dir>0?TR_LANE_E:TR_LANE_W);
  if(v.dwell>0){v.dwell-=dt;v.v=0;return}
  let block=0,byPlayer=false;
  if(G&&!v.ghost){
    const ahead=(G.p.x*TS+8-v.x)*v.dir;
    if(ahead>-4&&ahead<v.half+30&&Math.abs(G.p.y*TS+14-ly)<9){block=1;byPlayer=true}
  }
  if(G&&v.ghost&&(G.p.x*TS+8-v.x)*v.dir<-v.half-6)v.ghost=false;
  if(!block)for(let i=0;i<all.length;i++){const o=all[i];if(o===v||!o.on||o.ty!==v.ty||o.dir!==v.dir)continue;const a=(o.x-v.x)*v.dir;if(a>0&&a-o.half-v.half<9){block=1;break}}
  if(block){v.wait+=dt;if(byPlayer&&v.wait>3.2)v.ghost=true}else v.wait=0;
  const want=block?0:v.ghost?v.maxv*.35:v.maxv,dv=want-v.v;
  v.v+=dv>0?Math.min(dv,38*dt):Math.max(dv,-90*dt);
  const ox=v.x;v.x+=v.dir*v.v*dt;
  if(v.x<v.sx0||v.x>v.sx1){ /* end of the road: turn round into the other lane */
    v.x=clamp(v.x,v.sx0,v.sx1);v.dir=-v.dir;v.v*=.4;v.ghost=false;if(v.kind==='tram'){v.dwell=2;v.stop=-1}
  }
  v.lane+=((v.dir>0?TR_LANE_E:TR_LANE_W)-v.lane)*Math.min(1,dt*5);
  if(v.kind==='tram'){ /* wait a moment at each stop on this line */
    for(let i=0;i<STOPS.length;i++){const s=STOPS[i];if(s.y!==v.ty)continue;const sx=s.x*TS+8;
      if(v.stop!==s.id&&(ox-sx)*(v.x-sx)<=0&&ox!==v.x){v.stop=s.id;v.dwell=3;v.v=0;v.x=sx}
      else if(v.stop===s.id&&Math.abs(v.x-sx)>24)v.stop=-1}
  }
}
/* advance everything, then queue the visible vehicles for depth sorting */
function trafficEnts(now,ents){
  const dt=(now-trLast)/1000;trLast=now;
  if(dt>0&&dt<=.25){
    const d=Math.min(dt,.05);
    trSpawnT+=d;if(trSpawnT>.6){trSpawnT=0;if(trCount<trTarget())trSpawn()}
    for(let i=0;i<TR_MAX;i++){
      const v=TR_POOL[i];if(!v.on)continue;trStep(v,d,TR_POOL);if(!v.on)continue;
      if(v.x<camX-340||v.x>camX+VW+340||v.ty*TS<camY-220||v.ty*TS>camY+VH+220||(trCount>trTarget()+2&&(v.x<camX-40||v.x>camX+VW+40))){v.on=false;trCount--}
    }
    if(!(G&&G.mod&&G.mod.tram))trStep(TR_TRAM,d,TR_POOL);
  }
  trNow=now;
  const add=v=>{if(!v.on||RS<2||!vehImgOk(TR_KINDS[v.kind].sheet))return;const sx=v.x-camX;if(sx<-70||sx>VW+70)return;const sy=v.ty*TS+v.lane-camY;if(sy<-30||sy>VH+30)return;v.ent.y=(v.ty*TS+v.lane)/TS-.875;ents.push(v.ent)};
  for(let i=0;i<TR_MAX;i++)add(TR_POOL[i]);
  if(!(G&&G.mod&&G.mod.tram))add(TR_TRAM);
}
function trDraw(v){
  const K=TR_KINDS[v.kind],px=Math.round(v.x-camX),py=Math.round(v.ty*TS+v.lane-camY),sp=v.v>1?Math.floor(trNow/110)%2:0,n=night();
  if(n>.2&&v.kind!=='tram'){ /* headlights and tail light */
    const f=px+v.dir*(v.half-1),b=px-v.dir*(v.half-1);
    cx.fillStyle='rgba(255,236,160,.16)';cx.fillRect(v.dir>0?f:f-16,py-5,16,3);cx.fillStyle='rgba(255,236,160,.09)';cx.fillRect(v.dir>0?f:f-24,py-6,24,5);
    cx.fillStyle='#ffe9a8';cx.fillRect(f-(v.dir>0?1:0),py-5,1,2);cx.fillStyle='#e0382c';cx.fillRect(b-(v.dir>0?0:1),py-5,1,2);
  }
  if(v.kind==='tram')drawVehSprite(K.sheet,px,py,1,sp,0,128,48,64,45);
  else drawVehSprite(K.sheet,px,py,v.dir,sp,v.kind==='sedan'||v.kind==='coupe'?v.row:0,48,32,24,29);
}
