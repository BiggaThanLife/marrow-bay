"use strict";
/* Bay Log (collections) and gig ranks. Both are flavor and light rewards; nothing here gates anything. */
const FISH_SPECIES=[
 {n:'Pier perch',w:5,tide:'high'},{n:'Silver sprat',w:5},{n:'Tide mullet',w:4,tide:'high'},{n:'Mud eel',w:4,tide:'low'},
 {n:'Reed carp',w:3},{n:'Salt bream',w:3},{n:'Lantern herring',w:2},{n:'Ghost flounder',w:2,tide:'low'},
 {n:'Brine cod',w:2,boat:1},{n:'Moon bass',w:1,rare:1},{n:'Grey tunny',w:1,rare:1,boat:1},{n:'Hollow-eye',w:1,rare:1}
];
const LOG_DISHES={meals:'Plain meal',stew:'Fish stew',salad:'Radish salad',soup:'Tomato soup',pie:'Pumpkin pie',smoked:'Smoked fish'};
const LOG_RIBBONS={first:'First place ribbon',second:'Second place ribbon'};
const LOG_REWARD=120;
const LOG_FINDS=['Weed-line shell','Sand dollar','Snail','Moss ball','Starfish','Sea spider'];
function logInit(){
  const L=G.log=G.log||{};
  L.fish=L.fish||{};L.dishes=L.dishes||{};L.npcs=L.npcs||{};L.places=L.places||{};L.ribbons=L.ribbons||{};L.finds=L.finds||{};L.done=L.done||{};
  if(G.fairWins>0)L.ribbons.first=1;
}
function logPlaces(){return Object.keys(POIS).filter(id=>MENUS[id]&&POIS[id].d&&DISTS.includes(POIS[id].d))}
function logCats(){
  const L=G.log,pl=logPlaces();
  return[
   {id:'fish',n:'Fish caught',have:FISH_SPECIES.filter(f=>L.fish[f.n]).length,total:FISH_SPECIES.length,list:FISH_SPECIES.map(f=>[f.n,L.fish[f.n]?'caught '+L.fish[f.n]:''])},
   {id:'dishes',n:'Dishes cooked',have:Object.keys(LOG_DISHES).filter(k=>L.dishes[k]).length,total:Object.keys(LOG_DISHES).length,list:Object.keys(LOG_DISHES).map(k=>[LOG_DISHES[k],L.dishes[k]?'cooked '+L.dishes[k]:''])},
   {id:'npcs',n:'Close friends',have:NPCS.filter(x=>L.npcs[x.id]).length,total:NPCS.length,list:NPCS.map(x=>[x.name,L.npcs[x.id]?'close':''])},
   {id:'places',n:'Places visited',have:pl.filter(id=>L.places[id]).length,total:pl.length,list:DISTS.map(d=>{const a=pl.filter(id=>POIS[id].d===d);return[d,`${a.filter(id=>L.places[id]).length} of ${a.length}`]})},
   {id:'finds',n:'Shore finds',have:LOG_FINDS.filter(k=>L.finds[k]).length,total:LOG_FINDS.length,list:LOG_FINDS.map(k=>[k,L.finds[k]?'found '+L.finds[k]:''])},
   {id:'ribbons',n:'Fair ribbons',have:Object.keys(LOG_RIBBONS).filter(k=>L.ribbons[k]).length,total:2,list:Object.keys(LOG_RIBBONS).map(k=>[LOG_RIBBONS[k],L.ribbons[k]?'won':''])}
  ];
}
function logSync(){
  if(!G.log)logInit();
  NPCS.forEach(x=>{if(!G.log.npcs[x.id]&&G.npcs[x.id]&&tier(att(x))>=3)G.log.npcs[x.id]=1});
  logCats().forEach(c=>{
    if(c.have<c.total||G.log.done[c.id])return;
    G.log.done[c.id]=1;G.cash+=LOG_REWARD;
    news(`Bay Log complete: ${c.n}.`,2);notify(`Bay Log: ${c.n} complete. Bonus ${money(LOG_REWARD)}.`,true);
  });
}
function logSeen(poi){if(!G.log)logInit();if(poi&&poi.id&&!G.log.places[poi.id]){G.log.places[poi.id]=1;logSync()}}
function logDish(k){if(!G.log)logInit();G.log.dishes[k]=(G.log.dishes[k]||0)+1;logSync()}
function logRibbon(k){if(!G.log)logInit();G.log.ribbons[k]=1;logSync()}
/* each fish caught rolls a species; spring tides favour the rare ones */
function pickFishSpecies(boat,noBoat){
  const tn=tideName(),spring=tideCycle()==='spring';
  const ws=FISH_SPECIES.map(f=>f.w*(f.tide?(f.tide===tn?2:.5):1)*(f.rare?(spring?3:.4):1)*(f.boat&&!boat?(noBoat?0:.15):1));
  let r=Math.random()*ws.reduce((a,b)=>a+b,0),pk=FISH_SPECIES[0];
  for(let j=0;j<ws.length;j++){r-=ws[j];if(r<=0){pk=FISH_SPECIES[j];break}}
  return pk;
}
/* records one catch in the Bay Log; returns true the first time that species is caught */
function logFishOne(pk,quiet){
  if(!G.log)logInit();
  const first=!G.log.fish[pk.n];G.log.fish[pk.n]=(G.log.fish[pk.n]||0)+1;
  if(first&&!quiet)notify(`New in your Bay Log: ${pk.n}.`);
  return first;
}
/* a flavour find dug from the flats; true the first time (plastic bags are scrap, not logged) */
function logFindOne(n){
  if(!G.log)logInit();
  if(!LOG_FINDS.includes(n))return false;
  const first=!G.log.finds[n];G.log.finds[n]=(G.log.finds[n]||0)+1;logSync();
  return first;
}
function logFish(n,boat){
  if(!G.log)logInit();
  for(let i=0;i<n;i++)logFishOne(pickFishSpecies(boat));
  logSync();
}
function logMenu(){
  logSync();
  ui(`<h2>Bay Log</h2><p class="muted">Everything you have found, caught, cooked and earned. Finish a page for a small bonus.</p>`+
    logCats().map(c=>`<p class="small"><b>${esc(c.n)}</b> ${c.have} of ${c.total}${G.log.done[c.id]?' (done)':''}</p><div style="background:#2a2f38;height:8px;border-radius:4px;margin:2px 0 4px"><div style="background:#6bbf8a;height:8px;border-radius:4px;width:${Math.round(100*c.have/Math.max(1,c.total))}%"></div></div><p class="muted small">${c.list.map(([a,b])=>b?`${esc(a)} (${esc(b)})`:`<i style="opacity:.55">${esc(a)}</i>`).join(', ')}</p>`).join(''),
    [{label:'Back',cls:'quiet',fn:()=>careerMenu()},leaveBtn]);
}
/* ---- gig ranks ---- */
const JOB_RANKS=['New hand','Regular','Steady hand','Trusted','Foreman\u2019s pick'];
const JOB_STEPS=[0,4,10,20,34];
const JOB_NAMES={dock:'dock work',diner:'the diner kitchen',estate:'estate gardens',workshop:'the workshop'};
function jobCount(j){return (G.jobs&&G.jobs[j])||0}
function jobRank(j){const c=jobCount(j);let r=0;JOB_STEPS.forEach((s,i)=>{if(c>=s)r=i});return r}
const jobPayMul=j=>1+.1*jobRank(j);
function jobLine(j){
  const r=jobRank(j),c=jobCount(j);
  return `<p class="small muted">Rank: <b>${JOB_RANKS[r]}</b> (${c} shifts${r<4?`, ${JOB_STEPS[r+1]-c} to ${JOB_RANKS[r+1]}`:''}). Pay +${r*10}%.</p>`;
}
function jobDone(j){
  if(!G.jobs)G.jobs={};
  const before=jobRank(j);G.jobs[j]=jobCount(j)+1;const r=jobRank(j);
  if(r>before){news(`Promoted at ${JOB_NAMES[j]}: ${JOB_RANKS[r]}.`,2);notify(`${JOB_RANKS[r]} at ${JOB_NAMES[j]}. Pay up ${r*10}%.`,true)}
}
/* the harder shift unlocked at rank 2 */
function jobExtra(j,label,sub,cfg,back,n){
  if(jobRank(j)<2)return[];
  return[{label,sub:`${sub} Rank ${JOB_RANKS[2].toLowerCase()} shift.`,need:cfg.hrs*7,cls:'',fn:()=>back(gig(n||null,Object.assign({job:j},cfg)))}];
}
