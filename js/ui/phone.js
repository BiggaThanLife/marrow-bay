"use strict";
/* Phone: GPS, news, contacts, calls. */
/* ----- phone ----- */
function phone(msg){
  const un=G.news.filter(x=>x.id>G.newsRead).length;
  ui(`<h2>Phone</h2><p class="muted">Day ${day()}, ${timeStr()}. ${G.gps?`GPS route: ${esc(G.gps.name)}.`:'No GPS route.'}</p>${msgP(msg)}`,[
    {label:'GPS',sub:'Pick a destination. Get a route or auto-walk.',fn:gpsMenu},
    {label:'News',sub:un?`${un} new`:'Today and earlier days',cls:'',fn:newsMenu},
    {label:'Contacts',sub:`${Object.keys(G.met).length} people`,cls:'',fn:contactsMenu},
    {label:'Threads',sub:G.threads.active.some(t=>t.pending)?'New message':`${G.threads.active.length} active`,cls:G.threads.active.some(t=>t.pending)?'primary':'',fn:()=>threadsMenu()},
    {label:'City',sub:'Districts and factions',cls:'',fn:cityMenu},
    {label:'FLACK',sub:`${FLACK_BANDS[flackBand()].n} coverage`,cls:'',fn:()=>flackMenu()},
    {label:'Town board',sub:'Conditions, rumors, projects',cls:'',fn:town},
    {label:'Citizen onboarding',sub:'Replay the HARBOR orientation',cls:'quiet',fn:()=>tutorial(0,true)},
    leaveBtn]);
}
function gpsList(){
  const p=G.p,list=[],hp=homePoi();
  list.push({name:'Home',x:hp.ex,y:hp.ey});
  if(G.mission){const t=POIS[G.mission.stops[G.mission.i]];list.push({name:`Job: ${t.name}`,x:t.ex,y:t.ey})}
  Object.values(POIS).forEach(q=>list.push({name:q.name,x:q.ex,y:q.ey}));
  STOPS.forEach(s=>list.push({name:s.name+' (tram stop)',x:s.x,y:s.y}));
  G.biz.forEach(b=>{const bl=blockByKey(b.key);if(bl)list.push({name:`Your ${b.type?BT[b.type].n.toLowerCase():'building'} (${b.d})`,x:bl.x+1,y:bl.y+4})});
  G.structs.filter(s=>s.type==='stall'||s.type==='house').forEach(s=>list.push({name:`Your ${STRUCTS[s.type].n.toLowerCase()}`,x:s.x,y:s.y}));
  return list.map(d=>({...d,dist:man(Math.round(p.x),Math.round(p.y),d.x,d.y)})).sort((a,b)=>a.dist-b.dist);
}
function gpsMenu(){
  const list=gpsList();
  ui(`<h2>GPS</h2><p class="muted">${G.gps?`Route to ${esc(G.gps.name)} is active.`:'Pick a destination. Nearest first.'}</p>`,[
    ...(G.gps?[{label:'Clear route',cls:'warn',fn:()=>{G.gps=null;gpsPath=[];gpsMenu()}}]:[]),
    ...list.map(d=>({label:d.name,sub:`${d.dist} tiles away`,cls:'',fn:()=>gpsDetail(d)})),
    {label:'Back',cls:'quiet',fn:()=>phone()}]);
}
function gpsDetail(d){
  const v=VEH[G.veh.active],sp=v.sp*G.mod.vspeed,min=Math.round(d.dist/sp*6),walk=Math.round(d.dist/4.8*6);
  ui(`<h2>${esc(d.name)}</h2><p>${d.dist} tiles away. About ${min} minutes with your ${v.n.toLowerCase()}${G.veh.active==='none'?'':`, or ${walk} minutes on foot`}.</p>`,[
    {label:'Guide me on the map',sub:'Shows a dotted route. You walk it yourself.',fn:()=>{G.gps={x:d.x,y:d.y,name:d.name};gpsTick();closeMenu();notify('GPS route set.')}},
    {label:'Auto-walk there',sub:'Your character follows the route',cls:'',fn:()=>{G.gps={x:d.x,y:d.y,name:d.name};closeMenu();walkTo(d.x,d.y)}},
    {label:'Back',cls:'quiet',fn:gpsMenu}]);
}
function gpsTick(){
  if(!G.gps){gpsPath=[];return}
  const p=G.p;
  if(Math.hypot(G.gps.x-p.x,G.gps.y-p.y)<=1.3){notify('GPS: you have arrived.');G.gps=null;gpsPath=[];return}
  gpsPath=bfs(Math.round(p.x),Math.round(p.y),G.gps.x,G.gps.y)||[];
}
function newsMenu(){
  G.newsRead=G.newsSeq;hud();
  const byDay={};G.news.forEach(x=>{(byDay[x.d]=byDay[x.d]||[]).push(x)});
  const days=Object.keys(byDay).map(Number).sort((a,b)=>b-a).slice(0,8);
  const cls=s=>s>=4?'bad':s>=3?'amber':'';
  const html=days.map(d=>`<h2>${d===day()?'Today':'Day '+d}</h2>${byDay[d].map(x=>`<p class="${cls(x.s)}">${esc(x.t)}</p>`).join('')}`).join('')||'<p class="muted">Nothing yet.</p>';
  ui(`<h2>News</h2>${html}`,[{label:'Back',fn:()=>phone()},leaveBtn]);
}
function contactsMenu(){
  const ids=Object.keys(G.met);
  ui(`<h2>Contacts</h2>${ids.length?'':'<p class="muted">You have not met anyone yet. Talk to people and they will show up here.</p>'}`,
    [...ids.map(id=>{const n=NPC[id],tr=tier(att(n));return{label:n.name,sub:`${n.role}, ${LAB[tr]}`,cls:'',fn:()=>callMenu(n)}}),{label:'Back',cls:'quiet',fn:()=>phone()}]);
}
function whereIs(n){
  if(n.indoors)return{text:'at home',x:POIS[n.home].ex,y:POIS[n.home].ey};
  let best=null,bd=1e9;
  Object.values(POIS).forEach(p=>{const d=Math.hypot(p.ex-n.x,p.ey-n.y);if(d<bd){bd=d;best=p}});
  return{text:bd<=4?`near ${best.name}`:`in ${district(Math.round(n.x),Math.round(n.y))}`,x:Math.round(n.x),y:Math.round(n.y)};
}
function callMenu(n,msg){
  const tr=tier(att(n)),s=npcS(n);
  if(tr===0)return ui(`<h2>${esc(n.name)}</h2><p>The call rings out. They are not picking up.</p>`,[{label:'Back',fn:contactsMenu}]);
  const w=whereIs(n),sp=[];
  if(n.id==='teo'){const cost=Math.round(mealPrice()*buyF(n))+3;sp.push({label:'Order delivery',sub:`${money(cost)}. A meal arrives in 30 minutes.`,off:G.cash<cost||!isOpen('diner'),cls:'',fn:()=>{G.cash-=cost;G.hunger=clamp(G.hunger+45,0,100);G.demand+=1;advance(30);callMenu(n,'A hot meal arrives at your door.')}})}
  if(n.id==='bell'){const free=tr>=2&&(has('broke')||G.cash<20);sp.push({label:'Phone consult',sub:free?'Free for you':'$10. Restores a little energy.',off:!free&&G.cash<10,cls:'',fn:()=>{if(!free)G.cash-=10;G.energy=clamp(G.energy+15,0,100);advance(20);callMenu(n,'Good advice and a firm order to rest.')}})}
  if(n.id==='lou')sp.push({label:'Ask for new listings',cls:'',fn:buildingList});
  if(n.id==='vex')sp.push({label:'Ask for work',sub:tr>=2?'Jobs from the fixer':'Vex does not trust you yet',off:tr<2,cls:'',fn:()=>openPOI(POIS.velvet)});
  if(n.id==='cordelia')sp.push({label:'Repay debt by phone',sub:G.debt>0?`You owe ${money(G.debt)}`:'You owe nothing',off:G.debt<=0||G.cash<1,cls:'',fn:()=>{const p=Math.min(G.cash,G.debt);G.cash-=p;G.debt-=p;if(G.debt<=0)G.flags.defRum=0;callMenu(n,`You pay ${money(p)}.`)}});
  if(n.id==='duarte')sp.push({label:'Ask about dock work',cls:'',fn:()=>callMenu(n,(G.mod.closed.includes('dock')||(G.ev&&G.ev.id==='strike'))?'"Piers are shut. Check back later."':'"The hauling line is open. Come down."')});
  ui(`<h2>${esc(n.name)}</h2><p class="muted">${esc(n.role)}. Attitude: ${LAB[tr]}.</p>${msgP(msg)}`,[
    {label:'Chat',sub:s.chat===day()?'You already chatted today':'Keep in touch',off:s.chat===day(),fn:()=>{s.chat=day();s.m+=2;advance(5);callMenu(n,n.topic)}},
    {label:'Find them on GPS',sub:`They are ${w.text}`,cls:'',fn:()=>{G.gps={x:w.x,y:w.y,name:n.name};gpsTick();phone(`GPS route set to ${n.name}.`)}},
    {label:'Ask for news',sub:tr>=2?'Rumors and tips':'They will not share that yet',off:tr<2,cls:'',fn:()=>{advance(5);callMenu(n,`"${pick(worldLines())}"`)}},
    ...sp,{label:'Back',cls:'quiet',fn:contactsMenu}]);
}
