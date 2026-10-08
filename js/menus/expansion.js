"use strict";
/* Expansion menus for your businesses, and buying out NPC-run shops. */
function expansionButton(biz){
  const list=BT_ADD[biz.type];if(!list)return[];
  return[{label:`Expansions (${addList(biz).length}/${biz.level})`,sub:'Add-ons that boost this business. Each uses a slot.',cls:'',fn:()=>expansionMenu(biz)}];
}
function expansionMenu(biz,msg){
  const list=BT_ADD[biz.type],have=addList(biz),slots=biz.level;
  ui(`<h2>Expansions</h2><p class="muted">${BT[biz.type].n}, level ${biz.level}. ${have.length} of ${slots} slot${slots===1?'':'s'} used.${slots<3?' Upgrading the building adds a slot.':''}</p>${msgP(msg)}`,[
    ...list.map(a=>{
      const on=have.includes(a);
      return{label:on?`${a.n} (installed)`:`${a.n}, ${money(a.cost)}`,sub:on?`${a.d} Tap to remove for a 40% refund.`:a.d,off:!on&&(have.length>=slots||G.cash<a.cost),cls:'',
        fn:()=>on?ask(`Remove ${a.n.toLowerCase()}?`,`You get ${money(a.cost*.4)} back.`,'Yes, remove',()=>{G.cash+=Math.round(a.cost*.4);biz.add=(biz.add||[]).filter(x=>x!==a.id);expansionMenu(biz,'Removed.')},()=>expansionMenu(biz))
          :ask(`Install ${a.n.toLowerCase()}?`,`It costs ${money(a.cost)} and uses a slot.`,'Yes, install',()=>{G.cash-=a.cost;biz.paid=(biz.paid||biz.price)+a.cost;biz.add=[...(biz.add||[]),a.id];advance(60);news(`Work starts on a ${a.n.toLowerCase()} in ${biz.d}.`,1);expansionMenu(biz,`${a.n} installed.`)},()=>expansionMenu(biz))};
    }),
    {label:'Back',cls:'quiet',fn:()=>bizMenu(biz)}]);
}
/* ----- NPC shops ----- */
function shopPrice(id,n){return Math.round(SHOP_DEFS[id].price*(tier(att(n))>=3?.9:1))}
function shopBtn(poi,n){
  const def=SHOP_DEFS[poi.id];if(!def||!n)return[];
  if(shopOwned(poi.id))return[{label:'Your shop',sub:`Takings ${money(G.shops[poi.id].till)}. Level ${G.shops[poi.id].level}.`,cls:'primary',fn:()=>shopMenu(poi,n)}];
  const ok=tier(att(n))>=2;
  return[{label:'Make an offer for the shop',sub:ok?`${n.name} would sell for ${money(shopPrice(poi.id,n))}`:`${n.name} does not trust you enough to sell`,off:!ok,cls:'',fn:()=>offerMenu(poi,n)}];
}
function offerMenu(poi,n,msg){
  const def=SHOP_DEFS[poi.id],price=shopPrice(poi.id,n);
  ui(`<h2>Buy ${esc(poi.name)}</h2><p>${esc(n.name)} looks around the place for a long moment. "I would stay on and run it for you, if the wage is fair."</p><p class="muted">${esc(def.perk)} About ${money(def.base*(TR[poi.d]/20))} a day in takings before ${esc(n.name.split(' ')[0])}'s wage. Monthly tax about ${money(def.price*.008)}.</p>${msgP(msg)}`,[
    {label:`Buy for ${money(price)}`,off:G.cash<price,fn:()=>ask(`Buy ${poi.name}?`,`It costs ${money(price)}. ${n.name} stays on as manager.`,'Yes, buy',()=>{
      G.cash-=price;G.shops[poi.id]={level:1,till:0,paid:price,since:day(),last:null};npcS(n).m+=8;addRumor('owner',[n.id,...knowersNear(poi.d,1)],{dist:poi.d,shop:poi.name,owner:n.name.split(' ')[0]});
      news(`${n.name} sells ${poi.name} to a newcomer.`,2);G.rep[poi.d]=clamp(G.rep[poi.d]+3,-100,100);advance(30);quip('buy');shopMenu(poi,n,'It is yours. The staff look at you, then at each other.')},()=>offerMenu(poi,n))},
    {label:'Not now',cls:'quiet',fn:()=>openPOI(poi)}]);
}
function shopMenu(poi,n,msg){
  const s=G.shops[poi.id],def=SHOP_DEFS[poi.id],up=900*s.level,L=s.last;
  ui(`<h2>${esc(poi.name)}, level ${s.level}</h2><p class="muted">${esc(n.name)} manages it for you. ${esc(def.perk)}</p>${msgP(msg)}
  <div class="kv"><div><span>Takings</span><b>${money(s.till)}</b></div><div><span>Manager wage</span><b>${money((WAGE[n.id]||30)*.5*(1+.25*(s.level-1)))} a day</b></div>${L?`<div><span>Last day</span><b>${L.profit>=0?'+':''}${money(L.profit)}</b></div><div><span>Sold</span><b>${money(L.rev)}</b></div>`:''}</div>${lineChart(s.hist,{title:'Profit per day, last 30 days',zero:true})}`,[
    {label:'Collect takings',sub:money(s.till),off:s.till<=0,cls:'primary',fn:()=>{G.cash+=s.till;s.till=0;advance(5);shopMenu(poi,n,'Cash collected.')}},
    ...(s.level<3?[{label:`Expand to level ${s.level+1}`,sub:`${money(up)}. About ${Math.round((SHOP_LVL[s.level]/SHOP_LVL[s.level-1]-1)*100)}% more takings.`,off:G.cash<up,cls:'',fn:()=>ask(`Expand to level ${s.level+1}?`,`It costs ${money(up)}. The manager asks for a small raise.`,'Yes, expand',()=>{G.cash-=up;s.paid+=up;s.level++;shopMenu(poi,n,'Expanded.')},()=>shopMenu(poi,n))}]:[]),
    {label:'Use the shop',sub:'Buy and sell like any customer, with your perk',cls:'',fn:()=>(MENUS[poi.id]||info)(poi,n)},
    {label:'Sell the shop',sub:`Get ${money(s.paid*.7+Math.max(0,s.till))}`,cls:'quiet',fn:()=>ask(`Sell ${poi.name}?`,`You get ${money(s.paid*.7+Math.max(0,s.till))}. ${n.name} goes back to running it.`,'Yes, sell',()=>{G.cash+=Math.round(s.paid*.7+Math.max(0,s.till));delete G.shops[poi.id];advance(20);(MENUS[poi.id]||info)(poi,n,'Sold. The sign over the door is the old one again.')},()=>shopMenu(poi,n))},
    leaveBtn]);
  sceneCtx({bkey:poi.id,level:s.level});
}
function shopButtons(){
  return Object.keys(G.shops).map(id=>({label:`${POIS[id].name} (shop)`,sub:`Takings ${money(G.shops[id].till)}, level ${G.shops[id].level}`,cls:'',fn:()=>shopMenu(POIS[id],NPC[OWNER[id]])}));
}
