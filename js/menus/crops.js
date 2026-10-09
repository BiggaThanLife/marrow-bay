"use strict";
/* Crops: choosing a seed, planting, harvesting and buying seeds. The data is CROPS in js/data/goods.js; plots (G.plots) and greenhouses (G.structs, type planter)
   remember what is growing in `c` (missing means mixed greens, the original crop). */
const cropOf=t=>CROPS[t.c||'greens']||CROPS.greens;
const seedsOwned=()=>Object.keys(CROPS).filter(id=>G.inv[CROPS[id].seedKey]>0);
/* days until ripe: the crop's own time, a day less in a greenhouse, a day less with irrigation, never under one */
const cropDays=(id,planter)=>Math.max(1,CROPS[id].days-(planter?1:0)-(G.fx.irrig?1:0)+G.mod.growth);
const seedLine=()=>{const o=seedsOwned();return o.length?o.map(id=>`${G.inv[CROPS[id].seedKey]} ${CROPS[id].n.toLowerCase()}`).join(', '):'You have no seeds.'};
function plantCrop(t,id,planter,done){
  const c=CROPS[id];G.inv[c.seedKey]--;t.s=1;t.c=id;t.d=cropDays(id,planter);advance(20);
  done(`You planted ${c.n.toLowerCase()}. Ready in ${t.d} day${t.d>1?'s':''}.`);
}
/* one kind of seed plants straight away; several ask which */
function plantMenu(t,planter,done,back){
  const own=seedsOwned();
  if(!own.length)return done('You have no seeds.');
  if(own.length===1)return plantCrop(t,own[0],planter,done);
  ui(`<h2>Which seed?</h2><p class="muted">${esc(seedLine())}.</p>`,[
    ...own.map((id,i)=>({label:`Plant a seed: ${CROPS[id].n}`,sub:`${G.inv[CROPS[id].seedKey]} in your bag. Ready in ${cropDays(id,planter)} day${cropDays(id,planter)>1?'s':''}. About ${CROPS[id].yield[0]} to ${CROPS[id].yield[1]} a harvest.`,cls:i?'':'primary',fn:()=>plantCrop(t,id,planter,done)})),
    {label:'Back',cls:'quiet',fn:back}]);
}
/* how many a plot gives: the crop's own range, a farmhand's 50%, the season and events; a greenhouse gives the middle of the range, rounded up */
function harvestCrop(t,planter){
  const c=cropOf(t),n=Math.round((planter?Math.ceil((c.yield[0]+c.yield[1])/2):ri(c.yield[0],c.yield[1]))*(has('rural')?1.5:1)*G.mod.yield);
  G.inv[c.key]+=n;t.s=0;t.c=null;
  return `You harvested ${n} ${n===1?c.one:c.many}.`;
}
/* the market's seed rack */
function seedShop(poi,n,f){
  const price=id=>Math.round(CROPS[id].seedPrice*f*shopMul('market',.75));
  ui(`<h2>Seeds</h2><p class="muted">${esc(n.name)} keeps the packets under the counter. Slower crops pay more. ${esc(seedLine())}</p>`,[
    ...Object.keys(CROPS).map((id,i)=>{const c=CROPS[id],p=price(id);return {label:`${c.n} seeds, ${money(p)}`,sub:`Ready in ${c.days} day${c.days>1?'s':''}. ${c.yield[0]} to ${c.yield[1]} a harvest, about ${money(c.price)} each. You have ${G.inv[c.seedKey]}.`,cls:i?'':'primary',off:G.cash<p,
      fn:()=>qtyMenu({title:`${c.n} seeds`,intro:'Plant them in a plot or Greenhouse.',price:p,max:99,mode:'buy',onConfirm:q=>{G.cash-=Math.round(p*q);G.inv[c.seedKey]+=q;advance(5);return `You bought ${q} packet${q>1?'s':''} of ${c.n.toLowerCase()} seeds.`},back:m=>{m?MENUS.market(poi,n,m):seedShop(poi,n,f)}})}}),
    {label:'Back',cls:'quiet',fn:()=>MENUS.market(poi,n)}]);
}
