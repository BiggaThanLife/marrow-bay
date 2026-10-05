"use strict";
/* Home menu (sleep, cook, rest). */
function homeMenu(poi,msg){
  const sleepM=()=>{const tod=G.t%1440;let m=(7*60-tod+1440)%1440;if(m<360)m=360;return m};
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Home. ${money(homeBill())} a month.</p>${msgP(msg)}${G.arrears>0?`<p class="bad">Bills owed: ${money(G.arrears)}</p>`:''}`,[
    {label:'Sleep until morning',sub:'Lowers your wanted level',fn:()=>{const m=sleepM();advance(m,true);G.energy=clamp(G.energy+m/60*14*(1+.05*decorPts('comfort')),0,100);G.heat=Math.max(0,G.heat-1-.15*decorPts('cheer'));hud();homeMenu(poi,`You slept ${Math.round(m/60)} hours.`)}},
    {label:'Nap for 2 hours',cls:'',fn:()=>{advance(120,true);G.energy=clamp(G.energy+25,0,100);hud();homeMenu(poi,'You napped.')}},
    {label:'Cook a meal',sub:'2 crops make 1 meal',off:G.inv.crops<2,cls:'',fn:()=>{G.inv.crops-=2;G.inv.meals+=1+(Math.random()<.12*decorPts('cooking')?1:0);advance(60);homeMenu(poi,'You cooked a meal.')}},
    {label:'Cook fish stew',sub:'1 fish and 1 crop make 2 meals',off:G.inv.fish<1||G.inv.crops<1,cls:'',fn:()=>{G.inv.fish--;G.inv.crops--;G.inv.meals+=2;advance(60);homeMenu(poi,'You made a stew. Two meals.')}},
    {label:'Decorate',sub:`Comfort ${decorPts('comfort')}, cooking ${decorPts('cooking')}, cheer ${decorPts('cheer')}`,cls:'',fn:()=>decorMenu(poi)},
    {label:'Pay owed bills',sub:G.arrears>0?`Pay up to ${money(Math.min(G.cash,G.arrears))}`:'Nothing owed',off:G.arrears<=0||G.cash<1,cls:'',fn:()=>{const p=Math.min(G.cash,G.arrears);G.cash-=p;G.arrears-=p;homeMenu(poi,`You paid ${money(p)}.`)}},
    leaveBtn]);
}
RES.forEach(id=>MENUS[id]=(poi)=>poi.id===G.home?homeMenu(poi):info(poi));
