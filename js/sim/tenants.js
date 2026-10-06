"use strict";
/* Landlord simulation: tenants, applicants, rent, problems. Data lives on each rental building (b.tenants, b.applicants, b.issues, b.manager). */
const rentalUnits=b=>4+2*(b.level-1);
function genTenant(){
  G.tenantSeq=(G.tenantSeq||0)+1;
  const job=pick(T_JOBS),trait=pick(T_TRAIT_IDS);
  return{id:G.tenantSeq,name:pick(T_FIRST)+' '+pick(T_LAST),job:job.j,inc:job.inc,bio:pick(T_BACK),trait,mood:60,owed:0,since:day(),chat:-1};
}
/* look is derived from the tenant id and name, so it is stable and never needs saving */
function tenantLook(t){
  const h=hash(t.id,7),first=t.name.split(' ')[0],fem=T_FEM.includes(first)||(T_NEUTRAL.includes(first)&&(h>>3)%2===0);
  const style=fem?[1,4,5,6,0,1][(h>>5)%6]:[0,2,3,0,2,6][(h>>5)%6];
  return{skin:h%5,hair:(h>>8)%7,style,fem,beard:!fem&&style!==3&&(h>>11)%4===0,hat:(h>>13)%7===0?'beanie':undefined};
}
function ensureRental(b){
  const units=rentalUnits(b);
  if(!Array.isArray(b.tenants)){
    b.tenants=[];const n=Math.round(units*clamp(.5+G.rep[b.d]/200+.06*b.level,.35,1));
    for(let i=0;i<n;i++)b.tenants.push(genTenant());
  }
  b.applicants=b.applicants||[];b.issues=b.issues||[];b.manager=!!b.manager;
  while(b.tenants.length>units){const t=b.tenants.pop();b.issues=b.issues.filter(i=>i.t!==t.id)}
}
const tenantRent=(b,t)=>Math.round(8*t.inc*MK[b.mk]*(1+.06*(b.level-1))*addMod(b,'rent'));
const moodWord=m=>m>=65?'Happy':m>=45?'Fine':m>=25?'Unhappy':'About to leave';
const tenantOf=(b,id)=>b.tenants.find(t=>t.id===id);
function addIssue(b,t,k){b.issues.push({k,t:t.id,d:day()});notify(`${t.name} in your ${b.d} flats: ${T_ISSUES[k].n.toLowerCase()}.`)}
function moveIn(b,a){b.tenants.push(a);b.applicants=b.applicants.filter(x=>x!==a);a.since=day();a.mood=60}
function evictTenant(b,t,why){
  b.tenants=b.tenants.filter(x=>x!==t);b.issues=b.issues.filter(i=>i.t!==t.id);
  if(why==='evict'){G.rep[b.d]=clamp(G.rep[b.d]-2,-100,100);if(Math.random()<.4)news(`An eviction notice goes up on a flat in ${b.d}.`,1)}
  else G.rep[b.d]=clamp(G.rep[b.d]-.5,-100,100);
}
/* one day of landlord life for a rental building; fills r (rev, units, cost, wages) */
function rentalDay(b,r){
  ensureRental(b);
  const D=b.d,d=day(),units=rentalUnits(b);
  b.applicants=b.applicants.filter(a=>d-a.since<=5);
  const vac=units-b.tenants.length;
  if(vac>0&&b.applicants.length<Math.min(3,vac+1)&&Math.random()<clamp((.28+G.rep[D]/300)*[1.3,1,.65][b.mk],.05,.6)){
    b.applicants.push(genTenant());b.applicants[b.applicants.length-1].since=d;
    if(!b.manager)notify(`Someone is asking about a flat in your ${D} building.`);
  }
  while(b.manager&&b.applicants.length&&b.tenants.length<units)moveIn(b,b.applicants[0]);
  let rev=0,cost=0;
  const noisy=b.issues.some(i=>i.k==='noise');
  b.tenants.slice().forEach(t=>{
    const rent=tenantRent(b,t),mine=b.issues.filter(i=>i.t===t.id);
    mine.forEach(i=>{if(i.k!=='late'&&i.k!=='secret')t.mood-=3});
    if(!mine.length)t.mood=Math.min(70,t.mood+1);
    if(noisy&&!mine.some(i=>i.k==='noise'))t.mood-=1;
    t.mood+=(MK[b.mk]>1?-.5:MK[b.mk]<1?.5:0)+addSum(b,'mood');
    if(t.trait==='behind'&&Math.random()<.22)t.owed+=rent;
    else if(t.mood<30&&Math.random()<.5){/* withholds rent today */}
    else rev+=rent;
    if(b.issues.length<units){
      if(Math.random()<.025*(t.trait==='tidy'?.4:1)*addMod(b,'issue'))addIssue(b,t,pick(['leak','heat','pests']));
      else if(t.trait==='noisy'&&Math.random()<.06)addIssue(b,t,'noise');
      else if(t.trait==='secretive'&&Math.random()<.025)addIssue(b,t,'secret');
    }
    if(t.owed>=rent*3&&!b.issues.some(i=>i.t===t.id&&i.k==='late'))addIssue(b,t,'late');
    if(t.trait==='handy')b.issues=b.issues.filter(i=>!(i.t===t.id&&i.k!=='late'&&i.k!=='noise'&&i.k!=='secret'&&Math.random()<.6));
    if(b.manager)b.issues=b.issues.filter(i=>{
      if(i.t!==t.id||!(i.k==='leak'||i.k==='heat'||i.k==='pests'))return true;
      cost+=T_ISSUES[i.k].cost;t.mood+=4;return false;
    });
    if(t.mood<=15){notify(`${t.name} moved out of your ${D} flats.`);evictTenant(b,t,'left')}
  });
  if(b.tenants.length){
    const avg=b.tenants.reduce((s,t)=>s+t.mood,0)/b.tenants.length;
    G.rep[D]=clamp(G.rep[D]+(avg>=65?.12:avg<35?-.2:0),-100,100);
  }
  const fee=b.manager?Math.round(rev*.1):0;
  b.till+=rev;if(cost)payOut(b,cost);if(fee)payOut(b,fee);
  r.rev=rev;r.units=b.tenants.length;r.cost=cost;r.wages=fee;
}
