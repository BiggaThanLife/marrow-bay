"use strict";
/* Game tick, frame loop and startup. */
let hudT=0,missT=0;
function tick(dt){
  if(popOpen)return;
  if(alertQ.length){showAlert();return}
  const p=G.p;
  advance(dt*6,false,true);
  const R=NPC.reyes;
  if(G.veh.active!=='none'&&G.veh.stolen[G.veh.active]){G.heat=Math.max(G.heat,1.2);if(!R.indoors&&Math.hypot(R.x-p.x,R.y-p.y)<7)G.heat=Math.max(G.heat,3)}
  if(G.heat>=2){
    if(!R.chasing){R.chasing=true;if(R.indoors){R.indoors=false;R.x=POIS[R.home].ex;R.y=POIS[R.home].ey}notify('Wanted! Constable Reyes is after you. Outrun her and lay low.');quip('wanted')}
    R.rt-=dt;if(R.rt<=0){R.rt=.6;goto(R,[Math.round(p.x),Math.round(p.y)])}
    moveEnt(R,dt,(G.heat>=4?4.6:3.6)+(G.mod.cops?.5:0));
    if(Math.hypot(R.x-p.x,R.y-p.y)<1.2)return bust();
  }else if(R.chasing){R.chasing=false;assign(R,true);notify('You lost them. Lay low.')}
  NPCS.forEach(n=>{
    if(n.indoors||(n===R&&R.chasing))return;
    moveEnt(n,dt,2.6);
    if(!n.path.length&&n.goHome&&n.act==='home')n.indoors=true;
  });
  tickWalkers(dt);
  const v=VEH[G.veh.active];
  let sp=vehSpeed(G.veh.active)*G.mod.vspeed;
  if(v.fuel&&(G.veh.fuel[G.veh.active]||0)<=0)sp=3;
  if(G.energy<15||G.hunger<10)sp=Math.min(sp,2.6);
  if(G.mod.flood.includes(district(Math.round(p.x),Math.round(p.y))))sp*=.55;
  const bx=p.x,by=p.y,was=p.path.length>0;
  moveEnt(p,dt,sp);
  if(G.companion&&(p.x!==bx||p.y!==by)){compTrail.push([p.x,p.y]);if(compTrail.length>22)compTrail.shift()}
  if(v.fuel&&was){const dd=Math.hypot(p.x-bx,p.y-by);G.veh.fuel[G.veh.active]=Math.max(0,(G.veh.fuel[G.veh.active]||0)-dd*.12*vehFuelUse(G.veh.active));if(G.veh.fuel[G.veh.active]<=0&&!G.flags.fuelNote){G.flags.fuelNote=1;notify('Out of fuel. Refuel at Mack\'s Garage.')}if(G.veh.fuel[G.veh.active]>15)G.flags.fuelNote=0}
  if(was&&!p.path.length&&p.onArrive){const f=p.onArrive;p.onArrive=null;f()}
  missT+=dt;if(missT>.25){missT=0;missionTick();gpsTick();if(G.cash>=1000)quip('rich');else if(G.cash<5)quip('broke')}
  hudT+=dt;if(hudT>.3){hudT=0;hud()}
  if(!modal&&(G.energy<=0||G.hunger<=0))collapse();
}
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  requestAnimationFrame(frame);
  try{if(G&&!modal)tick(dt)}catch(e){console.error(e)}
  if(G){
    camX=Math.round(clamp(G.p.x*TS+8-VW/2,0,W*TS-VW));camY=Math.round(clamp(G.p.y*TS+8-VH/2,0,Math.max(0,H*TS-VH)));
  }else{
    camX=Math.round((Math.sin(now*.00008)*.5+.5)*(W*TS-VW));camY=Math.round((Math.sin(now*.00006+1)*.5+.5)*Math.max(0,H*TS-VH));
  }
  try{drawWorld(now)}catch(e){console.error(e)}
}
title();
requestAnimationFrame(frame);
