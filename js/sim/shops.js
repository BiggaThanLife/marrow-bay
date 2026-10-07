"use strict";
/* Expansion add-ons on your businesses, and the daily run of NPC shops you have bought. */
const addList=b=>((BT_ADD[b.type]||[]).filter(a=>(b.add||[]).includes(a.id))).slice(0,b.level);
const addMod=(b,k)=>addList(b).reduce((m,a)=>m*(a.eff[k]||1),1)*chainMod(b,k);
/* Owning several of one kind of business: each extra location is worth a little more foot traffic and cheaper supplies, up to four extras.
   A scandal at one location (an inspector's fine) puts off customers at all of them for a few days. */
const CHAIN_TYPES=['cafe','bar','workshop','pies','cages','wellness'];
const chainCount=b=>b.type?G.biz.filter(x=>x.type===b.type).length:0;
const chainScandal=b=>b.type&&G.scandal&&G.scandal[b.type]>day();
function chainMod(b,k){
  if(k!=='dem'&&k!=='cost')return 1;
  const n=chainCount(b);if(n<2||!CHAIN_TYPES.includes(b.type))return 1;
  const m=Math.min(n-1,4);
  return k==='cost'?1-.04*m:(1+.05*m)*(chainScandal(b)?.85:1);
}
function startScandal(b){
  const same=G.biz.filter(x=>x!==b&&x.type===b.type);
  if(!same.length||!CHAIN_TYPES.includes(b.type))return;
  G.scandal=G.scandal||{};G.scandal[b.type]=day()+5;
  same.forEach(x=>{G.rep[x.d]=clamp(G.rep[x.d]-1,-100,100)});
  news(`The ${BT[b.type].n.toLowerCase()} scandal reaches your other ${same.length} location${same.length>1?'s':''}. Customers are staying away for a few days.`,2);
}
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
