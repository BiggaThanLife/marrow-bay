"use strict";
/* Home menu (sleep, cook, rest). */
function homeMenu(poi,msg){
  const sleepM=()=>{const tod=G.t%1440;let m=(7*60-tod+1440)%1440;if(m<360)m=360;return m};
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">Home. ${money(homeBill())} a month.</p>${msgP(msg)}${G.arrears>0?`<p class="bad">Bills owed: ${money(G.arrears)}</p>`:''}`,[
    {label:'Sleep until morning',sub:'Lowers your wanted level',fn:()=>{const m=sleepM();advance(m,true);G.energy=clamp(G.energy+m/60*14*(1+.05*decorPts('comfort')),0,100);G.heat=Math.max(0,G.heat-1-.15*decorPts('cheer'));hud();homeMenu(poi,`You slept ${Math.round(m/60)} hours.`)}},
    {label:'Nap for 2 hours',cls:'',fn:()=>{advance(120,true);G.energy=clamp(G.energy+25,0,100);hud();homeMenu(poi,'You napped.')}},
    {label:'Cook meals',sub:`2 crops make 1 meal. You have ${G.inv.crops} crops. Choose how many.`,off:G.inv.crops<2,cls:'',fn:()=>bulkMake({title:'Cook meals',intro:'2 crops make 1 meal.',max:Math.floor(G.inv.crops/2),base:60,confirm:'Cook these meals',allLabel:'As many as I can',
      sayFn:n=>`${n} meal${n>1?'s':''} from ${2*n} crops, about ${minText(bulkMin(60,n))}`,
      run:n=>{let got=n;for(let i=0;i<n;i++)if(Math.random()<.12*decorPts('cooking'))got++;G.inv.crops-=2*n;G.inv.meals+=got;advance(bulkMin(60,n));return `You cooked ${got} meal${got>1?'s':''}.`},back:m=>homeMenu(poi,m)})},
    {label:'Cook stew',sub:`1 fish and 1 crop make 2 meals. Choose how many.`,off:G.inv.fish<1||G.inv.crops<1,cls:'',fn:()=>bulkMake({title:'Cook fish stew',intro:'1 fish and 1 crop make 2 meals.',max:Math.min(G.inv.fish,G.inv.crops),base:60,confirm:'Cook this stew',allLabel:'As many as I can',
      sayFn:n=>`${n} pot${n>1?'s':''}: ${2*n} meals from ${n} fish and ${n} crop${n>1?'s':''}, about ${minText(bulkMin(60,n))}`,
      run:n=>{G.inv.fish-=n;G.inv.crops-=n;G.inv.meals+=2*n;advance(bulkMin(60,n));return `You made ${n} pot${n>1?'s':''} of stew. ${2*n} meals.`},back:m=>homeMenu(poi,m)})},
    {label:'Decorate',sub:`Comfort ${decorPts('comfort')}, cooking ${decorPts('cooking')}, cheer ${decorPts('cheer')}`,cls:'',fn:()=>decorMenu(poi)},
    {label:'Pay owed bills',sub:G.arrears>0?`Pay up to ${money(Math.min(G.cash,G.arrears))}`:'Nothing owed',off:G.arrears<=0||G.cash<1,cls:'',fn:()=>{const p=Math.min(G.cash,G.arrears);G.cash-=p;G.arrears-=p;homeMenu(poi,`You paid ${money(p)}.`)}},
    leaveBtn]);
}
RES.forEach(id=>MENUS[id]=(poi)=>poi.id===G.home?homeMenu(poi):info(poi));
