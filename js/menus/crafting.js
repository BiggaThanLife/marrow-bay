"use strict";
/* Crafting bench: parts from scrap, then jammers and vehicle mods. Used at Iron Works and Tinker Works. */
function craftMenu(back,msg){
  const sc=partScrap(),sur=craftSurcharge(),own=Object.keys(VEH).filter(k=>k!=='none'&&G.veh.owned[k]);
  const jamCost=Math.round(60*sur),turboCost=Math.round(120*sur),tankCost=Math.round(80*sur);
  const modBtn=(key,label,partsN,cost,txt)=>own.filter(k=>key!=='tank'||VEH[k].fuel).map(k=>({label:`${label}: ${VEH[k].n}`,sub:G.veh.mods[k]&&G.veh.mods[k][key]?'Already fitted':`${partsN} parts and ${money(cost)}. ${txt}`,off:!!(G.veh.mods[k]&&G.veh.mods[k][key])||G.inv.parts<partsN||G.cash<cost,cls:'',fn:()=>{G.inv.parts-=partsN;G.cash-=cost;G.veh.mods[k]=G.veh.mods[k]||{};G.veh.mods[k][key]=true;advance(120);G.energy=clamp(G.energy-6,0,100);craftMenu(back,`The ${VEH[k].n.toLowerCase()} now has a ${label.toLowerCase()}.`)}}));
  ui(`<h2>Crafting bench</h2><p class="muted">Scrap becomes parts, parts become trouble. ${G.inv.scrap} scrap, ${G.inv.parts} parts, ${G.inv.jammers} jammers.${sur>1?' Inspectors have raised the bench fees.':''}</p>${msgP(msg)}`,[
    {label:'Make a part',sub:`${sc} scrap, 1 hour. Output ${meterWord(G.meters['Foundry Row'])} so it costs ${sc}.`,off:G.inv.scrap<sc,cls:'',fn:()=>{G.inv.scrap-=sc;G.inv.parts++;advance(60);G.energy=clamp(G.energy-3,0,100);craftMenu(back,'You made a part.')}},
    {label:'Build a FLACK jammer',sub:`2 parts and ${money(jamCost)}. Blinds cameras around you, or one camera for good.`,off:G.inv.parts<2||G.cash<jamCost,cls:'',fn:()=>{G.inv.parts-=2;G.cash-=jamCost;G.inv.jammers++;advance(120);G.energy=clamp(G.energy-6,0,100);craftMenu(back,'You built a jammer. It hums disapprovingly.')}},
    ...modBtn('turbo','Turbo kit',3,turboCost,'Ride 15% faster.'),
    ...modBtn('tank','Big tank',2,tankCost,'Uses 25% less fuel.'),
    {label:'Back',cls:'quiet',fn:back}]);
}
