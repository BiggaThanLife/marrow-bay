"use strict";
/* District meters, factions, facts, FLACK meter, City menu. */
/* ================= CITY STATE: meters, factions, facts, FLACK ================= */
const METERS={Greenbelt:'Harvest',Highline:'Market',Grid:'Order',Dockside:'Catch and cargo','Neon Mile':'Underworld','Foundry Row':'Output'};
const FACTIONS={
  coop:{n:"Growers' Co-op",d:'Greenbelt'},trust:{n:'Marrow Bay Trust',d:'Highline'},hall:{n:'City Hall',d:'Grid'},
  union:{n:"Dockworkers' Union",d:'Dockside'},shipping:{n:'Harbor Freight Co.',d:'Dockside'},
  crew:{n:"Vex's crew",d:'Neon Mile'},guild:{n:'Foundry Guild',d:'Foundry Row'}};
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
}
const meterAdd=(d,n)=>{if(G.meters[d]!=null)G.meters[d]=clamp(G.meters[d]+n,0,100)};
const facAdd=(f,n)=>{if(G.fac[f]!=null)G.fac[f]=clamp(G.fac[f]+n,-100,100)};
const setFact=(k,v=true)=>{G.facts[k]=v};
const fact=k=>G.facts[k];
const flackBand=()=>G.flack>75?3:G.flack>50?2:G.flack>25?1:0;
const flackHeatMul=()=>1-.18*flackBand();
function flackAdd(n){
  const b=flackBand();G.flack=clamp(G.flack+n,0,100);const nb=flackBand();
  if(nb>b)alertNews(['','News: FLACK cameras go live on the main roads. HARBOR says it is "excited to see more of you."','News: FLACK now logs faces and plates citywide. A spokesperson calls this "a convenience."','News: FLACK coverage is complete. The city has no blind spots, officially.'][nb],3);
  else if(nb<b)alertNews('News: Cameras are being pulled down around the city. HARBOR declines to comment.',2);
}
function cityDaily(){
  for(const d in METERS){const m=G.meters[d];G.meters[d]=clamp(m+(50-m)*.06,0,100)}
  if(G.meters['Foundry Row']>60)meterAdd('Greenbelt',-1);
  if(flackBand()>=2){meterAdd('Grid',1);meterAdd('Neon Mile',-1)}
  if(G.flack<30&&Math.random()<.2)flackAdd(1);
}
const meterWord=v=>v<20?'collapsing':v<40?'low':v<60?'steady':v<80?'high':'booming';
function cityMenu(){
  const rows=Object.keys(METERS).map(d=>`<div><span>${d}: ${METERS[d]}</span><b>${meterWord(G.meters[d])} (${Math.round(G.meters[d])})</b></div>`).join('');
  const fr=Object.keys(FACTIONS).map(f=>`<div><span>${FACTIONS[f].n}</span><b>${standing(G.fac[f])}</b></div>`).join('');
  const fb=FLACK_BANDS[flackBand()];
  ui(`<h2>City</h2><p class="muted">How each district is doing, and who thinks what of you.</p>
    <h2>Districts</h2><div class="kv">${rows}</div>
    <h2>Factions</h2><div class="kv">${fr}</div>
    <h2>FLACK cameras</h2><p><b>${fb.n}</b> (${Math.round(G.flack)}/100). ${fb.t}</p>`,
    [{label:'Back',cls:'quiet',fn:()=>phone()},leaveBtn]);
}
