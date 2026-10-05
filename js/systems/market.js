"use strict";
/* Share market, investment loan, FLACK contract. Prices follow the district meters, drift on their own, and swing hard during the bubble arc. */
function marketInit(){
  G.mkt={p:{},hold:{},cost:{},noCreditUntil:0};
  SHARES.forEach(s=>{G.mkt.p[s.id]=s.base});
}
const sharePrice=id=>G.mkt.p[id];
const portfolio=()=>SHARES.reduce((t,s)=>t+(G.mkt.hold[s.id]||0)*G.mkt.p[s.id],0);
const tradeFee=()=>fact('market_reformed')||G.companion==='cordelia'?0:2;
function bubbleDrift(){
  const A=G.arc;if(!A||A.id!=='bubble')return 0;
  const ph=ARCS.bubble.phases[A.i].name;
  return ph==='Boom'?.045:ph==='Cracks'?-.025:0;
}
function marketDaily(){
  if(!G.mkt)marketInit();
  const bd=bubbleDrift();
  SHARES.forEach(s=>{
    const p=G.mkt.p[s.id],fair=s.base*s.fair();
    G.mkt.p[s.id]=clamp(p*(1+(Math.random()-.5)*.07+bd)+(fair-p)*.06,3,500);
  });
  if(fact('flack_contract_player')&&day()%7===0){G.cash+=70;flackAdd(1);facAdd('union',-1);news('Your FLACK installation contract pays $70. Another camera goes up.',1)}
}
function buyShare(id,q){
  const p=sharePrice(id),cost=Math.round(p*q)+tradeFee();
  if(G.cash<cost)return 'You cannot afford that.';
  G.cash-=cost;G.mkt.hold[id]=(G.mkt.hold[id]||0)+q;G.mkt.cost[id]=(G.mkt.cost[id]||0)+cost;advance(5);
  return `Bought ${q} for ${money(cost)}.`;
}
function sellShare(id,q){
  const h=G.mkt.hold[id]||0;q=Math.min(q,h);if(q<=0)return 'You hold none.';
  const get=Math.round(sharePrice(id)*q)-tradeFee(),per=(G.mkt.cost[id]||0)/h;
  G.cash+=get;G.mkt.hold[id]=h-q;G.mkt.cost[id]=Math.max(0,(G.mkt.cost[id]||0)-per*q);advance(5);
  return `Sold ${q} for ${money(get)}.`;
}
