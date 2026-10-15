"use strict";
/* Player businesses: staff pool, daily run, payouts. */
/* ================= BUSINESS ================= */
function makePool(){G.pool=Array.from({length:4},()=>{const skill=ri(1,3);return{id:Math.random().toString(36).slice(2,8),name:pick(WN)+' '+pick(LN),skill,wage:[0,16,24,34][skill]+ri(-2,3),trait:pick(TRAITS)}})}
/* a name for each building you own, picked once and kept until the business type changes */
function bizName(b){
  const k=b.type||'empty';
  if(b.name&&b.nameFor===k)return b.name;
  const pool=BIZ_NAMES[k]||BIZ_NAMES.empty,used=G.biz.filter(x=>x!==b&&x.name).map(x=>x.name);
  const free=pool.filter(n=>!used.includes(n));
  let n=free.length?pick(free):pick(pool)+' II';
  b.name=n;b.nameFor=k;return n;
}
const stallName=s=>STALL_NAMES[hash(s.x,s.y)%STALL_NAMES.length];
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
  appeal*=tideTrade(dist).mul;
  if(dist==='Highline'&&G.fx.gilded)appeal*=1.08;
  return appeal;
}
/* the tide and trade: Dockside is on the quay, so high water keeps people off it and low water brings scrap hunters; Foundry Row sits low by the river mouth and does better when the flats are open. Averaged over trading hours (8 to 20) of today, kept within 15%. */
function tideTrade(dist,t=clockNow()){
  const prof=dist==='Dockside'?{hi:-.55,lo:.3}:dist==='Foundry Row'?{hi:-.2,lo:.4}:null;
  if(!prof)return{mul:1,txt:''};
  const base=Math.floor(t/1440)*1440;let hi=0,lo=0;
  for(let h=8;h<=20;h++){const v=tideV(base+h*60);if(v>.45)hi++;else if(v<-.45)lo++}
  hi/=13;lo/=13;
  const mul=clamp(1+prof.hi*hi+prof.lo*lo,.85,1.15),pc=Math.round((mul-1)*100);
  if(Math.abs(pc)<2)return{mul:1,txt:`Tide today: ${tideCycle(t)?tideCycle(t)+' tides, but ':''}no real effect on trade here.`};
  const why=pc<0?(dist==='Dockside'?'High water keeps people off the quay':'High water cuts the trade down by the river'):(dist==='Dockside'?'Low water brings scrap hunters to the quay':'Low water opens the flats and brings people through');
  return{mul,txt:`Tide today: ${why} (${pc>0?'+':''}${pc}% customers${tideCycle(t)?', '+tideCycle(t)+' tides':''}).`};
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
  if(b.shut>day()){b.last={units:0,rev:0,cost:0,wages:0,theft:0,profit:0,note:'Closed by police'};pushHist(b.hist=b.hist||[],0);return}
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
    if(b.auto||b.mgr){r.rev=crops*4;b.till+=r.rev}else b.store+=crops;
  }else if(b.type!=='home'){
    const cap=Math.round((3+wcap)*(t.cap/7)*addMod(b,'cap')),dem=TR[dist]*t.per*appeal*[1.3,1,.65][b.mk]*addMod(b,'dem')*rnd(.85,1.15);
    const units=Math.floor(Math.min(dem,cap)),used=Math.min(b.supplies,units),buy=units-used;
    b.supplies-=used;r.units=units;r.rev=Math.round(units*t.price*MK[b.mk]);b.till+=r.rev;
    r.cost=Math.round(buy*t.cost*addMod(b,'cost'));if(r.cost)payOut(b,r.cost);
    const sticky=b.workers.filter(w=>w.trait==='sticky').length,guard=b.workers.some(w=>w.trait==='guard');
    if(sticky&&!guard){r.theft=Math.min(b.till,Math.round(r.rev*.08*sticky*(b.mgr?.5:1)));b.till-=r.theft}
    if(t.shady){
      /* the longer a shady place runs the more the district minds (up to 2x), and the more it minds the more often inspectors come (up to 2x) */
      b.shadyDays=(b.shadyDays||0)+1;
      const grow=1+Math.min(1,b.shadyDays/45),suspicion=1+clamp(-G.rep[dist],0,50)/50;
      G.rep[dist]=clamp(G.rep[dist]-t.shady.rep*grow,-100,100);
      if(Math.random()<t.shady.inspect*suspicion){const fine=Math.min(Math.round(t.shady.fine*(b.mgr?.5:1)),Math.max(0,G.cash+b.till));payOut(b,fine);r.cost+=fine;addRumor('shady',['reyes',...knowersNear(dist,1)],{dist});r.note=`Fined ${money(fine)}.`;news(t.shady.news.replace('{d}',dist),2);notify(`Inspectors at ${bizName(b)} in ${dist}. Fined ${money(fine)}.`);startScandal(b)}
    }
    if(!t.shady)b.shadyDays=0;
    if(t.calm&&G.heat>0)G.heat=Math.max(0,G.heat-t.calm.heat);
  }
  b.workers=b.workers.filter(w=>{
    const ok=payOut(b,w.wage);
    if(ok){r.wages+=w.wage;return true}
    notify(`${w.name} quit. Wages went unpaid.`);return false;
  });
  if(b.till>150&&Math.random()<.07*(b.workers.some(w=>w.trait==='guard')?.3:1)){const loss=Math.round(b.till*.5);b.till-=loss;r.note=`Robbed. ${money(loss)} taken.`;{notify(`Break-in at your ${t.n.toLowerCase()}. ${money(loss)} gone.`);news(`A ${t.n.toLowerCase()} in the ${dist} was broken into.`,2)}}
  if(b.mgr&&b.type!=='rental'&&b.type!=='home'){
    /* the manager takes a tenth of takings, hires someone if the place is empty, and banks the till every night */
    const fee=Math.round(r.rev*.1);r.wages+=fee;payOut(b,fee);
    if(!b.workers.length&&G.pool.length){const w=G.pool.slice().sort((x,y)=>(y.skill/y.wage)-(x.skill/x.wage))[0];b.workers.push(w);G.pool=G.pool.filter(x=>x!==w);notify(`${bizName(b)}'s manager hires ${w.name}.`)}
    const take=Math.max(0,b.till);if(take){G.cash+=take;b.till=0;r.banked=take}
    if(G.dirty>0&&canLaunder(b)){const got=launder(b,G.dirty);if(got)r.washed=got}
  }
  r.profit=r.rev-r.cost-r.wages-r.theft;b.last=r;pushHist(b.hist=b.hist||[],r.profit);
}
