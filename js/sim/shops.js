"use strict";
/* Expansion add-ons on your businesses, and the daily run of NPC shops you have bought. */
const addList=b=>((BT_ADD[b.type]||[]).filter(a=>(b.add||[]).includes(a.id))).slice(0,b.level);
const addMod=(b,k)=>addList(b).reduce((m,a)=>m*(a.eff[k]||1),1);
const addSum=(b,k)=>addList(b).reduce((m,a)=>m+(a.eff[k]||0),0);
const shopOwned=id=>!!(G.shops&&G.shops[id]);
const shopMul=(id,m)=>shopOwned(id)?m:1;
const shopTills=()=>Object.values(G.shops||{}).reduce((s,x)=>s+x.till,0);
function shopsDaily(){
  Object.keys(G.shops).forEach(id=>{
    const s=G.shops[id],poi=POIS[id],def=SHOP_DEFS[id];if(!poi||!def){delete G.shops[id];return}
    const n=NPC[OWNER[id]],closed=G.mod.closed.includes(id);
    const rev=closed?0:Math.round(def.base*SHOP_LVL[s.level-1]*(TR[poi.d]/20)*clamp(1+G.rep[poi.d]/250,.7,1.3)*rnd(.85,1.15));
    const wage=Math.round((WAGE[n.id]||30)*.5*(1+.25*(s.level-1)));
    s.till+=rev-wage;s.last={rev,wage,profit:rev-wage};pushHist(s.hist=s.hist||[],rev-wage);
    if(s.till<-200)s.till=-200;
  });
}
