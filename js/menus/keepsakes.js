"use strict";
/* Two small items sold on the Town board: Thoughts and prayers candy, and commemorative plaques. */
const CANDY_PRICE=4,PLAQUE_PRICE=60,PLAQUE_GAP=10;
const disasterOn=()=>G.evs.some(e=>e.sev>=3);
function eatCandy(){
  if(G.inv.candy<1)return;
  G.inv.candy--;sfx('good');
  if(G.heat>0&&G.heat<=1){G.heat=0;return bag('The candy is chalky and tastes of nothing. The police seem to forget you for a moment.')}
  bag('The candy is chalky and tastes of nothing. It fixes nothing at all, but you feel a little lighter.');
}
function plaqueMenu(msg){
  G.plaque=G.plaque||{};
  ui(`<h2>Commemorative plaque</h2><p class="muted">A bronze plate for the scene of a disaster. It reads: "In Memory of those lost to Corporate Mismanagement." You have ${G.inv.plaque}. A district can take one every ${PLAQUE_GAP} days.</p>${msgP(msg)}`,[
    ...DISTS.map(d=>{const wait=(G.plaque[d]||-99)+PLAQUE_GAP-day();return{label:d,sub:wait>0?`Already has a fresh one. Wait ${wait} more day${wait>1?'s':''}.`:`Standing ${standing(G.rep[d])}`,off:G.inv.plaque<1||wait>0,cls:'',fn:()=>{
      G.inv.plaque--;G.plaque[d]=day();G.rep[d]=clamp(G.rep[d]+4,-100,100);sfx('good');
      news(`A bronze plaque has appeared in ${d}. Nobody will say who put it there.`,1);
      plaqueMenu(`The plaque goes up in ${d}. Standing improves a little.`)}}}),
    {label:'Back',cls:'quiet',fn:bag}]);
}
function keepsakeButtons(back){
  return[
    ...(disasterOn()?[{label:`Thoughts and prayers candy, ${money(CANDY_PRICE)}`,sub:'On sale all week. It clears a small amount of heat and nothing else.',off:G.cash<CANDY_PRICE,cls:'',fn:()=>{G.cash-=CANDY_PRICE;G.inv.candy++;sfx('cash');back()}}]:[]),
    {label:`Commemorative plaque, ${money(PLAQUE_PRICE)}`,sub:'Cover up an accident site and win back a little goodwill',off:G.cash<PLAQUE_PRICE,cls:'',fn:()=>{G.cash-=PLAQUE_PRICE;G.inv.plaque++;sfx('cash');back()}}
  ];
}
