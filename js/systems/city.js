"use strict";
/* District meters, factions, facts, FLACK meter, City menu. */
/* ================= CITY STATE: meters, factions, facts, FLACK ================= */
const METERS={Greenbelt:'Harvest',Highline:'Market',Grid:'Order',Dockside:'Catch and cargo','Neon Mile':'Underworld','Foundry Row':'Output'};
const FACTIONS={
  coop:{n:"Growers' Co-op",d:'Greenbelt'},trust:{n:'Marrow Bay Trust',d:'Highline'},hall:{n:'City Hall',d:'Grid'},
  union:{n:"Dockworkers' Union",d:'Dockside'},shipping:{n:'Harbor Freight Co.',d:'Dockside'},
  crew:{n:"Vex's crew",d:'Neon Mile'},salt:{n:'The Salt Kings',d:'Neon Mile'},guild:{n:'Foundry Guild',d:'Foundry Row'}};
const NPC_FAC={cordelia:'trust',halloran:'trust',lou:'trust',mina:'hall',teo:'hall',pip:'hall',reyes:'hall',ashgrove:'hall',bell:'hall',
  wren:'coop',duarte:'shipping',gus:'union',vex:'crew',mack:'guild',ines:'guild'};
NPCS.forEach(n=>{n.fac=NPC_FAC[n.id]||null});
const FLACK_BANDS=[
  {n:'Sleepy',t:'A few cameras, mostly pointed at the wrong things.'},
  {n:'Main roads',t:'Cameras on the main roads. Crimes that get seen get remembered.'},
  {n:'Logged',t:'Faces and plates are logged. Heat lingers and fences get nervous.'},
  {n:'Saturated',t:'Every corner has an eye. HARBOR has started editing itself.'}];
function cityInit(){
  G.meters=G.meters||{};for(const d in METERS)if(typeof G.meters[d]!=='number')G.meters[d]=50;
  G.fac=G.fac||{};for(const f in FACTIONS)if(typeof G.fac[f]!=='number')G.fac[f]=0;
  G.facts=G.facts||{};if(typeof G.flack!=='number')G.flack=10;
  G.stance=G.stance||{};for(const k of ['coop','evade','sab','harbor'])if(typeof G.stance[k]!=='number')G.stance[k]=0;
  G.blind=G.blind||{};G.fx=G.fx||{};
  if(G.facts.mayor===undefined)G.facts.mayor='voss';
  G.council=G.council||{cur:null,hist:[],last:0,vetoDay:-99};
  if(!G.mkt)marketInit();
  if(typeof G.seed!=='number')G.seed=0;
  G.veh.mods=G.veh.mods||{};G.inv.parts=G.inv.parts||0;G.inv.jammers=G.inv.jammers||0;G.tips=G.tips||{};G.dirty=G.dirty||0;G.notor=G.notor||0;G.lawSeen=G.lawSeen||0;G.laundered=G.laundered||0;if(G.jail===undefined)G.jail=null;G.scandal=G.scandal||{};G.inv.candy=G.inv.candy||0;NPCS.forEach(n=>{if(!G.npcs[n.id])G.npcs[n.id]={m:0,chat:-1,cash:n.wage*2+10,hunger:70}});G.inv.plaque=G.inv.plaque||0;G.plaque=G.plaque||{};
  G.titles=G.titles||[];G.decor=G.decor||{};if(G.companion===undefined)G.companion=null;
  G.engage=G.engage||{};G.hookCool=G.hookCool||{};G.hookBusy=G.hookBusy||{};
  G.favs=G.favs||[];if(G.veh)G.veh.paint=G.veh.paint||{};
  G.turf=G.turf||{door:'vex',pawn:'vex',casino:'vex',loft:'vex'};
  G.sat=G.sat||{};G.cl=G.cl||{start:typeof day==='function'&&G.t!=null?day():1,th:{},blocks:0,burnDay:-1,burnIdx:0,harbor:0,hlog:[]};G.bwExtra=G.bwExtra||[];feedInit();if(G.opening===undefined)G.opening={step:'done',done:true};G.inv.radish=G.inv.radish||0;G.inv.tomato=G.inv.tomato||0;G.inv.pumpkin=G.inv.pumpkin||0;G.inv.seedRadish=G.inv.seedRadish||0;G.inv.seedTomato=G.inv.seedTomato||0;G.inv.seedPumpkin=G.inv.seedPumpkin||0;G.opps=G.opps||[];G.oppId=G.oppId||0;if(G.oppSeen===undefined)G.oppSeen=G.oppId;G.crew=G.crew||[];G.crew.forEach(m=>{if(m.id==='lou')m.id='moe'});G.rival=G.rival||{str:35,truce:0,hits:0,held:0};if(G.heist===undefined)G.heist=null;G.heistsDone=G.heistsDone||0;G.heistCool=G.heistCool||{};
  G.biz.forEach(b=>{if(b.type==='rental')ensureRental(b)});
  G.shops=G.shops||{};
  G.arc=G.arc||null;G.arcsDone=G.arcsDone||[];G.arcLast=G.arcLast||0;
}
const meterAdd=(d,n)=>{if(G.meters[d]!=null)G.meters[d]=clamp(G.meters[d]+n,0,100)};
const facAdd=(f,n)=>{if(G.fac[f]!=null)G.fac[f]=clamp(G.fac[f]+n,-100,100)};
const setFact=(k,v=true)=>{G.facts[k]=v};
const fact=k=>G.facts[k];
const flackBand=()=>G.flack>75?3:G.flack>50?2:G.flack>25?1:0;
const flackHeatMul=()=>(1-.18*flackBand())*(fact('mayor')==='reyes'?.85:1)*(fact('harbor_free')?1.2:1)*(G.companion==='gus'?1.25:G.companion==='reyes'?1.3:1);
function flackAdd(n){
  const b=flackBand();G.flack=clamp(G.flack+n,0,fact('flack_removed')?30:100);const nb=flackBand();
  if(nb>b)alertNews(['','News: FLACK cameras go live on the main roads. HARBOR says it is "excited to see more of you."','News: FLACK now logs faces and plates citywide. A spokesperson calls this "a convenience."','News: FLACK coverage is complete. The city has no blind spots, officially.'][nb],3);
  else if(nb<b)alertNews('News: Cameras are being pulled down around the city. HARBOR declines to comment.',2);
}
function cityDaily(){
  for(const d in METERS){const m=G.meters[d],tg=fact('harbor_merged')?60:50;G.meters[d]=clamp(m+(tg-m)*(fact('harbor_free')?.09:.06),0,100)}
  if(G.meters['Foundry Row']>60)meterAdd('Greenbelt',-1);
  if(flackBand()>=2){meterAdd('Grid',1);meterAdd('Neon Mile',-1)}
  if(G.flack<30&&Math.random()<.2)flackAdd(1);
  dockDaily();
  seasonsDaily();
  careerDaily();
  marketDaily();
  neonDaily();
  councilDaily();
  districtTipCheck();
  oppsDaily();
  arcsDaily();
  if(G.arc&&G.arc.waitThread)arcThread(G.arc.waitThread);
}
const meterWord=v=>v<20?'collapsing':v<40?'low':v<60?'steady':v<80?'high':'booming';
function cityMenu(){
  const rows=Object.keys(METERS).map(d=>`<div><span>${d}: ${METERS[d]}</span><b>${meterWord(G.meters[d])} (${Math.round(G.meters[d])})</b></div>`).join('');
  const fr=Object.keys(FACTIONS).map(f=>`<div><span>${FACTIONS[f].n}</span><b>${standing(G.fac[f])}</b></div>`).join('');
  const fb=FLACK_BANDS[flackBand()];
  ui(`<h2>City</h2><p class="muted">How each district is doing, and who thinks what of you.</p>
    <h2>Districts</h2><div class="kv">${rows}</div>
    <h2>Factions</h2><div class="kv">${fr}</div>
    <h2>City Hall</h2><p>Mayor: <b>${esc(mayorName())}</b>.</p>
    <p class="muted small">City layout: ${G.seed?'#'+G.seed:'classic'}.</p>
    <h2>FLACK cameras</h2><p><b>${fb.n}</b> (${Math.round(G.flack)}/100). ${fb.t}</p>${arcSummaryHtml()}`,
    [{label:'Back',cls:'quiet',fn:()=>phone()},leaveBtn]);
}
