"use strict";
/* Casino, pawn shop, garage, foundry, lofts. */
/* ----- Neon Mile and Foundry ----- */
MENUS.pawn=(poi,n,msg)=>{
  const cold=G.heat>=2;
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">No questions, no receipts.</p>${msgP(msg)}${cold?'<p class="bad">The owner will not deal with you while police are on your tail.</p>':''}`,[
    {label:'Fence hot goods',sub:`${G.inv.loot} items, $${fencePrice()} each${flackBand()>=2?'. Cameras make buyers nervous.':''}`,off:cold||G.inv.loot<1,fn:()=>{const t=G.inv.loot*fencePrice();G.cash+=t;G.inv.loot=0;advance(15);MENUS.pawn(poi,n,`You walk away with ${money(t)}.`)}},
    {label:'Sell trinkets',sub:`${G.inv.trinkets} items, $32 each`,off:G.inv.trinkets<1,cls:'',fn:()=>{const t=G.inv.trinkets*32;G.cash+=t;G.inv.trinkets=0;advance(10);MENUS.pawn(poi,n,`Sold for ${money(t)}.`)}},
    {label:'Buy a scarf and glasses',sub:G.fx.mask?'You already have them':'$25. FLACK cameras log you as "unidentified."',off:G.cash<25||G.fx.mask,cls:'',fn:()=>{G.cash-=25;G.fx.mask=true;G.stance.evade++;MENUS.pawn(poi,n,'You look like a very average stranger.')}},
    {label:'Buy a burglar kit',sub:G.fx.kit?'You already have one':'$90. Improves pickpocketing and heists.',off:G.cash<90||G.fx.kit,cls:'',fn:()=>{G.cash-=90;G.fx.kit=true;MENUS.pawn(poi,n,'You pocket a roll of tools.')}},
    {label:'Fence a stolen vehicle',sub:Object.keys(G.veh.stolen).some(k=>G.veh.stolen[k])?'$600':'You have none',off:cold||!Object.keys(G.veh.stolen).some(k=>G.veh.stolen[k]),cls:'',fn:()=>{
      const k=Object.keys(G.veh.stolen).find(x=>G.veh.stolen[x]);G.veh.owned[k]=false;G.veh.stolen[k]=false;if(G.veh.active===k)G.veh.active='none';G.cash+=600;MENUS.pawn(poi,n,'The car disappears and cash appears.')}},
    leaveBtn]);
};
MENUS.garage=(poi,n,msg)=>{
  const f=buyF(n);
  const btns=Object.keys(VEH).filter(k=>k!=='none').map(k=>{
    const price=Math.round(VEH[k].price*f);
    return{label:G.veh.owned[k]?`${VEH[k].n} (owned)`:`${VEH[k].n}, ${money(price)}`,sub:`Speed ${VEH[k].sp}${VEH[k].fuel?', fuel needed':', no fuel'}${VEH[k].ins?`, insurance ${money(VEH[k].ins)}/mo`:''}`,off:!!G.veh.owned[k]||G.cash<price,cls:'',fn:()=>ask(`Buy the ${VEH[k].n.toLowerCase()}?`,`It costs ${money(price)}.`,'Yes, buy',()=>{G.cash-=price;G.veh.owned[k]=true;G.veh.fuel[k]=100;G.veh.active=k;MENUS.garage(poi,n,`You ride off on the ${VEH[k].n.toLowerCase()}.`)},()=>MENUS.garage(poi,n))};
  });
  const a=G.veh.active,tank=VEH[a].fuel?Math.round(G.veh.fuel[a]||0):100,fuelCost=Math.round((100-tank)*.3);
  btns.push({label:'Refuel',sub:VEH[a].fuel?`${tank}% now, ${money(fuelCost)} to fill`:'Your ride does not need fuel',off:!VEH[a].fuel||tank>=100||G.cash<fuelCost,cls:'primary',fn:()=>{G.cash-=fuelCost;G.veh.fuel[a]=100;advance(10);MENUS.garage(poi,n,'Tank full.')}});
  btns.push({label:'Street race',sub:G.veh.active==='none'?'You need a ride':isNight()?'$30 entry, $110 to win. Nights only.':'Nights only',off:G.veh.active==='none'||!isNight()||G.cash<30,cls:'warn',fn:()=>streetRace(poi,n)});
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} wipes his hands.</p>${msgP(msg)}`,[...btns.slice(-2,-1),...btns.slice(0,-2),btns[btns.length-1],leaveBtn]);
};
MENUS.foundry=(poi,n,msg)=>{
  const mult=(has('strong')?1.3:1)*(has('working-class')?1.1:1);
  const price=Math.round(60*buyF(n));
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">${esc(n.name)} runs the furnace line.</p>${msgP(msg)}`,[
    {label:'Foundry shift',sub:`5 hours, about ${money(48*mult*payF(n))}`,fn:()=>MENUS.foundry(poi,n,gig(n,{hrs:5,base:48,mult,rep:'Foundry Row',label:'at the furnace'}))},
    {label:'Buy 10 scrap',sub:`${money(price)}. Feeds workshops and projects.`,off:G.cash<price,cls:'',fn:()=>{G.cash-=price;G.inv.scrap+=10;advance(15);MENUS.foundry(poi,n,'Ten pieces loaded.')}},
    leaveBtn]);
};
MENUS.loft=(poi)=>poi.id===G.home?homeMenu(poi):info(poi);

function streetRace(poi,n){
  const a=G.veh.active,sp=VEH[a].sp;
  G.cash-=30;advance(60);
  const win=Math.random()<clamp(.1+sp*.03,.15,.7);
  const seen=flackSeen(.7);
  meterAdd('Neon Mile',1);
  if(win){G.cash+=110;return MENUS.garage(poi,n,`You win by half a wheel. $110.${seen?' A FLACK camera logged the plate.':''}`)}
  if(VEH[a].fuel&&Math.random()<.2){G.cash=Math.max(0,G.cash-60);return MENUS.garage(poi,n,`You lose, and clip a bollard. Repairs cost $60.${seen?' A FLACK camera logged the plate.':''}`)}
  MENUS.garage(poi,n,`You lose. The crowd is not unkind about it.${seen?' A FLACK camera logged the plate.':''}`);
}
