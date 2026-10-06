"use strict";
/* Player businesses: staff pool, daily run, payouts. */
/* ================= BUSINESS ================= */
function makePool(){G.pool=Array.from({length:4},()=>{const skill=ri(1,3);return{id:Math.random().toString(36).slice(2,8),name:pick(WN)+' '+pick(LN),skill,wage:[0,16,24,34][skill]+ri(-2,3),trait:pick(TRAITS)}})}
function payOut(b,amt){
  const fromTill=Math.min(b.till,amt);b.till-=fromTill;let rest=amt-fromTill;
  const fromCash=Math.min(G.cash,rest);G.cash-=fromCash;rest-=fromCash;
  return rest<=0;
}
function bizAppeal(b){
  const dist=b.d,rep=G.rep[dist];
  let appeal=clamp(1+rep/100,.4,1.5)*(1+.25*(b.level-1));
  if(known('thief')>=3)appeal*=.8;
  if(known('successful'))appeal*=1.08;
  b.workers.forEach(w=>{if(w.trait==='charming')appeal*=1.1});
  if(G.ev&&G.ev.id==='gala'&&dist==='Highline')appeal*=1.3;
  if(G.ev&&G.ev.id==='strike'&&dist==='Dockside')appeal*=.75;
  appeal*=(G.mod.traffic[dist]||1);
  return appeal;
}
/* Typical customers per day (demand) and how many the staff can serve (capacity). */
function bizTraffic(b){
  const t=BT[b.type];
  if(!t||b.type==='home'||b.type==='rental'||b.type==='farm')return null;
  const wcap=b.workers.reduce((s,w)=>s+(4+w.skill*3)*(w.trait==='quick'?1.3:1),0);
  return{dem:Math.round(TR[b.d]*t.per*bizAppeal(b)*[1.3,1,.65][b.mk]*addMod(b,'dem')),cap:Math.round((3+wcap)*(t.cap/7)*addMod(b,'cap'))};
}
function runBiz(b){
  const t=BT[b.type];if(!t)return;
  if(b.type!=='rental'&&b.tenants){delete b.tenants;delete b.applicants;delete b.issues;delete b.manager}
  const dist=b.d,rep=G.rep[dist];
  const appeal=bizAppeal(b);
  const r={units:0,rev:0,cost:0,wages:0,theft:0,note:''};
  const wcap=b.workers.reduce((s,w)=>s+(4+w.skill*3)*(w.trait==='quick'?1.3:1),0);
  if(b.type==='rental'){
    rentalDay(b,r);
  }else if(b.type==='farm'){
    const f=dist==='Greenbelt'?1:.5,crops=Math.round((3+wcap)*f*rnd(.8,1.1)*G.mod.yield*addMod(b,'yield'));
    r.units=crops;r.cost=Math.round(crops*1.5*addMod(b,'cost'));payOut(b,r.cost);
    if(b.auto){r.rev=crops*4;b.till+=r.rev}else b.store+=crops;
  }else if(b.type!=='home'){
    const cap=Math.round((3+wcap)*(t.cap/7)*addMod(b,'cap')),dem=TR[dist]*t.per*appeal*[1.3,1,.65][b.mk]*addMod(b,'dem')*rnd(.85,1.15);
    const units=Math.floor(Math.min(dem,cap)),used=Math.min(b.supplies,units),buy=units-used;
    b.supplies-=used;r.units=units;r.rev=Math.round(units*t.price*MK[b.mk]);b.till+=r.rev;
    r.cost=Math.round(buy*t.cost*addMod(b,'cost'));if(r.cost)payOut(b,r.cost);
    const sticky=b.workers.filter(w=>w.trait==='sticky').length,guard=b.workers.some(w=>w.trait==='guard');
    if(sticky&&!guard){r.theft=Math.min(b.till,Math.round(r.rev*.08*sticky));b.till-=r.theft}
  }
  b.workers=b.workers.filter(w=>{
    const ok=payOut(b,w.wage);
    if(ok){r.wages+=w.wage;return true}
    notify(`${w.name} quit. Wages went unpaid.`);return false;
  });
  if(b.till>150&&Math.random()<.07*(b.workers.some(w=>w.trait==='guard')?.3:1)){const loss=Math.round(b.till*.5);b.till-=loss;r.note=`Robbed. ${money(loss)} taken.`;{notify(`Break-in at your ${t.n.toLowerCase()}. ${money(loss)} gone.`);news(`A ${t.n.toLowerCase()} in the ${dist} was broken into.`,2)}}
  r.profit=r.rev-r.cost-r.wages-r.theft;b.last=r;
}
