"use strict";
/* Rare one-off "found" moments (docs/LORE.md section 6). Each fires at most once per save (G.found[id]=day), never more than one a day, only after the opening.
   Flat moments roll after a mudflat scavenge (foundFlats); the rest roll each hour while you stand in the right district (foundHourly).
   Together that is roughly one every five to ten days at first, thinning out as the list is used up. Each reveals in a popup and writes a line to Your story. */
const FOUND_FLATS_CHANCE=.15,FOUND_HOUR_CHANCE=.012;
const FOUND=[
 {id:'boot',w:'flats',title:'A boot, upright',text:'One work boot stands in the mud, laces tied, as if its owner stepped out of it politely. There is $12 folded inside.',hist:'Found a work boot standing upright in the mud, laces tied. HARBOR has no record of an owner.',fx:()=>{G.cash+=12}},
 {id:'tablescrap',w:'flats',title:'A tide-table scrap',text:'Waterlogged, with pencil corrections in a hand that is not HARBOR\'s.',hist:'Found a waterlogged tide-table scrap with pencilled corrections.',fx:()=>{const c=clueNext(true);if(c)clueShow(c)}},
 {id:'brasstag',w:'flats',title:'A brass tag',text:'Stamped MB, no number. Someone at the Market would take it as a trinket, for about $25.',hist:'Found a brass tag stamped MB, with no number. Nobody was issued it.',fx:()=>{G.inv.trinkets=(G.inv.trinkets||0)+1}},
 {id:'sluicewheel',w:'hour',d:'Grid',title:'A rusted sluice wheel',text:'Half-buried by the seawall. It is heavy, ugly, and exactly what the Foundry likes. You carry off some scrap, and Foundry Row will hear who dug it out.',hist:'Dug a rusted sluice wheel out of the Grid seawall and sent the scrap to Foundry Row.',fx:()=>{G.inv.scrap+=3;G.rep['Foundry Row']=clamp(G.rep['Foundry Row']+2,-100,100)}},
 {id:'chalktally',w:'hour',d:'Dockside',day:true,title:'Chalk marks on a pier',text:'Somebody\'s tally, one mark for every day the board ran early. Pip would say she did not draw it. It is her hand. You mention it to a dockhand, and a rumour begins to run.',hist:'Found a chalk tally on a Dockside pier. Pip\'s handwriting. Pip has not been asked.',fx:()=>{news('A chalk tally on a Dockside pier counts the days the tide board ran early. Nobody admits to it.',1);if(G.npcs.pip)G.npcs.pip.m+=1}},
 {id:'saltjar',w:'flats',title:'A sealed jar of salt',text:'Labelled "return to sender". You take the deposit on the lid and the jar goes back in the mud.',hist:'Found a sealed jar of salt labelled "return to sender". Left it where it was.',fx:()=>{if(Math.random()<.5)G.cash+=8;else facAdd('salt',3)}},
 {id:'drawing',w:'hour',d:['Greenbelt','Grid'],day:true,title:'A child\'s drawing of the tide',text:'Pinned to a post: blue crayon, a very large moon, and a tide that goes up and down on a ladder. You feel lighter than you did a minute ago.',hist:'Found a child\'s crayon drawing of the tide, pinned to a post. Left it up.',fx:()=>{G.energy=clamp(G.energy+8,0,100)}},
 {id:'coldfire',w:'flats',early:true,title:'A cold fire',text:'An ash circle on the flats, still warm underneath. Somebody camps out here when the water is gone, and leaves before the water comes back.',hist:'Found a still-warm ash circle on the flats. Someone camps out here.',fx:()=>{}},
 {id:'footprints',w:'flats',spring:true,title:'A second set of footprints',text:'Your own boot print, going the other way. You are not sure what to do about that. You do nothing. The water starts to come back.',hist:'Found a second set of footprints on the flats. They were mine, going the other way.',fx:()=>{}},
 {id:'oldcoin',w:'flats',spring:true,title:'An old coin',text:'Stamped HARBOR, with a date from before there was a HARBOR. A dealer on the Grid would pay $40 for it. HARBOR declines to comment.',hist:'Found an old coin stamped HARBOR. HARBOR declines to comment.',fx:()=>{G.cash+=40}}
];
function foundReady(){return G&&G.flags&&G.flags.onboarded&&(!G.opening||G.opening.done)&&G.found&&G.found.last!==day()}
function foundFire(f){
  G.found[f.id]=day();G.found.last=day();
  f.fx();histAdd('found:'+f.id,f.hist);
  popup(f.title,f.text);
}
/* after a scavenge on the flats; spring-only ones need the spring tide, the cold fire needs early morning or night */
function foundFlats(){
  if(!foundReady()||Math.random()>FOUND_FLATS_CHANCE)return;
  const h=hourOf(),sp=tideCycle()==='spring';
  const a=FOUND.filter(f=>f.w==='flats'&&!G.found[f.id]&&(!f.spring||sp)&&(!f.early||h<9||h>=21));
  if(a.length)foundFire(a[Math.floor(Math.random()*a.length)]);
}
function foundHourly(h){
  if(!foundReady()||Math.random()>FOUND_HOUR_CHANCE||isNight())return;
  const d=district(Math.round(G.p.x),Math.round(G.p.y));
  const a=FOUND.filter(f=>f.w==='hour'&&!G.found[f.id]&&[].concat(f.d).includes(d));
  if(a.length)foundFire(a[Math.floor(Math.random()*a.length)]);
}
