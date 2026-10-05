"use strict";
/* NPC schedules, movement and pathing. */
/* ================= NPC MOVEMENT ================= */
function actFor(n){
  const h=hourOf();
  let a=(h>=22||h<7)?'home':h<17?'work':'hang';
  if(a==='work'&&G.ev&&G.ev.id==='strike'&&n.d==='Dockside'&&n.id!=='duarte')a='hang';
  return a;
}
function goto(n,s){n.path=bfs(Math.round(n.x),Math.round(n.y),s[0],s[1])||[]}
function assign(n,instant){
  const a=actFor(n);n.act=a;
  const homeP=POIS[n.home];
  if(a==='home'){
    if(instant){n.indoors=true;n.path=[];n.x=homeP.ex;n.y=homeP.ey}
    else if(!n.indoors){goto(n,[homeP.ex,homeP.ey]);n.goHome=true}
  }else{
    const s=spotNear(POIS[a==='work'?n.work:n.hang],n.id);
    if(instant){n.indoors=false;n.x=s[0];n.y=s[1];n.path=[]}
    else{
      if(n.indoors){n.indoors=false;n.x=homeP.ex;n.y=homeP.ey}
      goto(n,s);n.goHome=false;
    }
  }
}
function syncNPCs(){NPCS.forEach(n=>{if(n.id==='reyes'&&n.chasing)return;assign(n,true)})}
function initNPCs(){NPCS.forEach(n=>{n.x=0;n.y=0;n.path=[];n.indoors=true;n.goHome=false;n.act='home';n.chasing=false;n.rt=0});syncNPCs()}
function moveEnt(e,dt,sp){
  if(!e.path||!e.path.length)return false;
  const [nx,ny]=e.path[0],dx=nx-e.x,dy=ny-e.y,d=Math.hypot(dx,dy),st=sp*dt;
  if(d<=st){e.x=nx;e.y=ny;e.path.shift()}
  else{e.x+=dx/d*st;e.y+=dy/d*st}
  if(Math.abs(dx)>.01)e.face=dx>0?1:-1;
  return true;
}
