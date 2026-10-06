"use strict";
/* Tenants on the map. Each tenant of your apartment buildings (up to WALKER_MAX across the city) is a walker who leaves the front door by day,
   wanders to places in the district and goes home at night. Walkers are rebuilt from the tenant lists, so they are never saved. Tap one to talk. */
const WALKER_MAX=10,WALKER_COLS=['#c46b5a','#5a8fc4','#7aa65a','#b08ad0','#d0a84a','#4aa8a0'];
let WALKERS=[];
const walkerDoor=w=>{const b=blockByKey(w.key);return b?[b.x+1,b.y+4]:null};
function syncWalkers(){
  if(!G){WALKERS=[];return}
  const old=new Map(WALKERS.map(w=>[w.tid,w])),next=[];
  G.biz.forEach(b=>{
    if(b.type!=='rental'||!b.tenants)return;
    b.tenants.forEach(t=>{
      if(next.length>=WALKER_MAX)return;
      const w=old.get(t.id)||{tid:t.id,key:b.key,x:0,y:0,path:[],indoors:true,goHome:false,face:1,rt:0,col:WALKER_COLS[t.id%WALKER_COLS.length],name:t.name};
      w.key=b.key;w.d=b.d;
      if(!old.has(t.id)){const dr=walkerDoor(w);if(dr){w.x=dr[0];w.y=dr[1]}}
      next.push(w);
    });
  });
  WALKERS=next;
}
function walkerPlan(w,instant){
  const dr=walkerDoor(w);if(!dr)return;
  const h=hourOf(),night=h>=22||h<7;
  if(night){
    if(instant){w.indoors=true;w.path=[];w.x=dr[0];w.y=dr[1]}
    else if(!w.indoors){w.path=bfs(Math.round(w.x),Math.round(w.y),dr[0],dr[1])||[];w.goHome=true}
    return;
  }
  const pois=Object.values(POIS).filter(p=>p.d===w.d&&p.ex!=null);
  const spot=()=>{const p=pois.length&&Math.random()<.85?pick(pois):null;return p?[p.ex,p.ey]:[dr[0]+ri(-3,3),dr[1]+ri(0,2)]};
  if(instant){
    if(Math.random()<.5){w.indoors=true;w.x=dr[0];w.y=dr[1];w.path=[]}
    else{const s=spot();w.indoors=false;w.x=s[0];w.y=s[1];w.path=[]}
    return;
  }
  if(w.indoors){
    if(Math.random()<.35){const s=spot();w.indoors=false;w.x=dr[0];w.y=dr[1];w.path=bfs(dr[0],dr[1],s[0],s[1])||[];w.goHome=false}
  }else if(!w.path.length&&Math.random()<.5){
    if(Math.random()<.4){w.path=bfs(Math.round(w.x),Math.round(w.y),dr[0],dr[1])||[];w.goHome=true}
    else{const s=spot();w.path=bfs(Math.round(w.x),Math.round(w.y),s[0],s[1])||[]}
  }
}
function walkersHourly(instant){syncWalkers();WALKERS.forEach(w=>walkerPlan(w,instant))}
function tickWalkers(dt){
  WALKERS.forEach(w=>{
    if(w.indoors)return;
    moveEnt(w,dt,2.1);
    if(!w.path.length&&w.goHome){w.indoors=true;w.goHome=false}
  });
}
function walkerAt(fx,fy){
  let best=null,bd=1.3;
  WALKERS.forEach(w=>{if(w.indoors)return;const d=Math.hypot(w.x+.5-fx,w.y+.5-fy);if(d<bd){bd=d;best=w}});
  return best;
}
function walkerTalk(w){
  const b=G.biz.find(x=>x.key===w.key&&x.type==='rental'),t=b&&b.tenants&&tenantOf(b,w.tid);
  if(!t)return notify('They hurry past.');
  tenantMenu(b,t,`${t.name.split(' ')[0]} stops to talk.`);
}
function goTalkWalker(w){
  const p=G.p;
  if(Math.hypot(w.x-p.x,w.y-p.y)<=1.6){p.path=[];return walkerTalk(w)}
  walkTo(Math.round(w.x),Math.round(w.y),()=>walkerTalk(w));
}
