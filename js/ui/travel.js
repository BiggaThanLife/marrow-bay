"use strict";
/* Go menu, vehicles, taxi, tram stops. */
const TAXI=[['Home','home'],["Lou's Realty",'realty'],['Market Hall','market'],['Marrow Bank','bank'],['Dock Office','dock'],['Lucky Tide Casino','casino'],["Mack's Garage",'garage'],['Briar Barn','barn'],['Central Plaza','plaza']];
function goMenu(){
  const p=G.p,near=STOPS.map(s=>({s,d:man(Math.round(p.x),Math.round(p.y),s.x,s.y)})).sort((a,b)=>a.d-b.d)[0];
  const veh=Object.keys(G.veh.owned).filter(k=>G.veh.owned[k]);
  const btns=[];
  if(near.d<=2)btns.push({label:`Ride the tram from ${near.s.name}`,sub:G.passUntil>day()?'Your pass is active':'$2 per ride',fn:()=>stopMenu(near.s)});
  else btns.push({label:`Walk to ${near.s.name}`,sub:`${near.d} tiles away. Trams are cheap and fast.`,fn:()=>{worldPanel();walkTo(near.s.x,near.s.y,()=>stopMenu(near.s))}});
  btns.push({label:'Call a taxi',sub:G.heat>=2?'Drivers will not stop for you right now':'Door to door, any destination',off:G.heat>=2,cls:'',fn:taxiMenu});
  btns.push({label:`Ride: ${VEH[G.veh.active].n}`,sub:veh.length?'Switch vehicle':'Buy wheels at Mack\'s Garage on the Foundry Row',cls:'',off:!veh.length,fn:vehMenu});
  btns.push({label:'Close',cls:'quiet',fn:closeMenu});
  ui(`<h2>Get around</h2><p class="muted">Walking is slow. A bike, the tram, or a taxi saves hours.</p>`,btns);
}
function vehMenu(){
  const ks=['none',...Object.keys(G.veh.owned).filter(k=>G.veh.owned[k])];
  ui(`<h2>Choose your ride</h2>`,[...ks.map(k=>({label:VEH[k].n+(G.veh.active===k?' (current)':''),sub:VEH[k].fuel&&k!=='none'?`Speed ${VEH[k].sp}, fuel ${Math.round(G.veh.fuel[k]||0)}%`:`Speed ${VEH[k].sp}`,cls:G.veh.active===k?'primary':'',fn:()=>{G.veh.active=k;closeMenu();notify(VEH[k].n+'.')}})),{label:'Back',cls:'quiet',fn:goMenu}]);
}
function teleport(x,y,minutes,msg){
  advance(minutes);G.p.x=x;G.p.y=y;G.p.path=[];G.p.onArrive=null;closeMenu();notify(msg);
}
function taxiMenu(){
  const p=G.p;
  ui(`<h2>Taxi</h2><p class="muted">Cabs charge by distance.</p>`,[...TAXI.map(([n,id])=>{
    const t=id==='home'?homePoi():POIS[id],d=man(Math.round(p.x),Math.round(p.y),t.ex,t.ey),cost=Math.round(4+d*.3);
    return{label:n,sub:`${money(cost)}, about ${Math.round(5+d*.2)} min`,off:G.cash<cost,cls:'',fn:()=>{G.cash-=cost;teleport(t.ex,t.ey,Math.round(5+d*.2),`The cab drops you at ${n}.`)}};
  }),{label:'Back',cls:'quiet',fn:goMenu}]);
}
function stopMenu(s){
  if(G.mod.tram)return ui(`<h2>${esc(s.name)}</h2><p>The trams are not running.</p>`,[leaveBtn]);
  const pass=G.passUntil>day()||G.freeTramUntil>day();
  ui(`<h2>${esc(s.name)}</h2><p class="muted">Trams run all day.${pass?` Your pass is valid for ${G.passUntil-day()} more days.`:''}</p>`,[
    ...STOPS.filter(t=>t.id!==s.id).map(t=>{const d=man(s.x,s.y,t.x,t.y);return{label:`To ${t.name}`,sub:`${pass?'Free':'$2'}, about ${Math.round(10+d*.35)} min`,off:!pass&&G.cash<2,cls:'',fn:()=>{if(!pass)G.cash-=2;teleport(t.x,t.y,Math.round(10+d*.35),`You step off at ${t.name}.`)}}}),
    {label:'Buy a 30-day pass',sub:'$40. Unlimited rides.',off:G.cash<40||pass,cls:'quiet',fn:()=>{G.cash-=40;G.passUntil=day()+30;stopMenu(s)}},
    leaveBtn]);
}
