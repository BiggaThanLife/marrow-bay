"use strict";
/* One companion at a time. They trail behind you and bring a small perk. */
let compTrail=[];
const COMP_PERKS={
 pip:'Scavenging the flats yields one extra scrap.',gus:'Your wanted level fades 25% faster.',mack:'Vehicles use 15% less fuel.',wren:'Crop yield is 10% higher.',
 mina:'Market buyers pay you 4% more.',duarte:'Dock work pays 8% more.',ines:'Foundry shifts pay 10% more.',ashgrove:'Lobbying the council works 10% better.',
 vex:'Your rackets pay 10% more.',cordelia:'Share trades have no fee.',halloran:'Your monthly home bill is 10% lower.',lou:'Your monthly home bill is 5% lower.',
 bell:'You tire 10% slower.',teo:'Meals at the diner cost 10% less.',reyes:'Your wanted level fades 30% faster.'};
const hasComp=id=>G.companion===id;
function recruit(n){
  G.companion=n.id;n.indoors=true;n.path=[];compTrail=[];recomputeMods();
  news(`${n.name} is now travelling with you.`,1);histAdd('comp:'+n.id,`${n.name} is now travelling with you. HARBOR suspects a friendship.`,10);
}
function dismissComp(){
  const n=NPC[G.companion];G.companion=null;compTrail=[];recomputeMods();if(n)assign(n,true);
}
function companionMenu(msg){
  const n=NPC[G.companion];
  if(!n)return phone();
  ui(`<h2>${esc(n.name)}</h2><p class="muted">Travelling with you. ${esc(COMP_PERKS[n.id])}</p>${msgP(msg)}`,[
    {label:'Send them home',sub:'They return to their usual day.',cls:'quiet',fn:()=>{const nm=n.name;dismissComp();phone(`${nm} heads back.`)}},
    {label:'Back',cls:'quiet',fn:()=>phone()}]);
}
