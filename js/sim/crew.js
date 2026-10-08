"use strict";
/* Your crew, rival crew hits, big multi-step jobs and washing money through the casino cage.
   State: G.crew (hired members), G.rival ({str, truce, hits, held}), G.heist (the job you are planning), G.heistsDone, G.heistCool, G.cageDay/G.cageAmt. */
/* ----- the crew ----- */
const crewDef=id=>CREW_POOL.find(c=>c.id===id);
const crewFree=c=>!(c.jail>day());
const crewAll=()=>G.crew.map(c=>Object.assign({},crewDef(c.id),c));
/* total skill of free members in a role, optionally only those on a job */
const crewSkill=(role,job)=>G.crew.filter(c=>crewFree(c)&&crewDef(c.id).role===role&&(!job||c.job===job)).reduce((t,c)=>t+crewDef(c.id).skill,0);
const crewHas=role=>crewSkill(role)>0;
const crewGuards=()=>G.crew.filter(c=>crewFree(c)&&c.job==='guard');
/* three candidates a week, the same all week, never someone already hired */
function crewCandidates(){
  const wk=Math.floor(day()/7),left=CREW_POOL.filter(c=>!G.crew.some(m=>m.id===c.id));
  const out=[],a=left.slice();let h=hash(wk+3,(G.seed||0)+17);
  for(let i=0;i<3&&a.length;i++){out.push(a.splice(h%a.length,1)[0]);h=hash(h,i+1)}
  return out;
}
/* pay from dirty cash first, then clean. Returns true if it was covered. */
function payDirtyFirst(amt){
  const d=Math.min(G.dirty||0,amt);if(d+G.cash<amt)return false;
  G.dirty-=d;G.cash-=amt-d;return true;
}
function crewHire(id){
  const c=crewDef(id);if(!c)return 'Nobody by that name.';
  if(G.crew.length>=CREW_MAX)return `Your crew is full (${CREW_MAX}).`;
  const fee=crewWage(c)*3;if(!payDirtyFirst(fee))return `You need ${money(fee)} up front.`;
  G.crew.push({id,loy:55+c.skill*5,job:'idle',jail:0,since:day(),unpaid:0});
  advance(30);return `${c.n} is in. ${money(fee)} up front, ${money(crewWage(c))} a day after that.`;
}
function crewFire(id){
  const i=G.crew.findIndex(c=>c.id===id);if(i<0)return '';
  const m=G.crew[i],c=crewDef(id);G.crew.splice(i,1);
  if(m.loy<30&&(G.heistsDone||0)>0&&Math.random()<(c.trait==='loose'?.6:.3)){notorAdd(12);news(`An anonymous tip about the Neon Mile reaches City Hall. Somebody was fired recently.`,2);return `${c.n} leaves without a word. A day later your police file is thicker.`}
  return `${c.n} takes their coat and goes. No hard feelings, or at least none said out loud.`;
}
function crewSetJob(id,job){const m=G.crew.find(c=>c.id===id);if(m)m.job=job}
const crewBail=m=>150*crewDef(m.id).skill;
function crewBailOut(id){
  const m=G.crew.find(c=>c.id===id);if(!m||crewFree(m))return '';
  const cost=crewBail(m);if(G.cash<cost)return `Bail is ${money(cost)} in clean money.`;
  G.cash-=cost;m.jail=0;m.loy=Math.min(100,m.loy+15);return `You post ${money(cost)} bail. ${crewDef(id).n} is grateful in a way that will last about a week.`;
}
function crewJail(m,days,why){
  m.jail=day()+days;m.loy=Math.max(0,m.loy-6);
  const c=crewDef(m.id);news(`${c.n} was picked up by Constable Reyes${why?' '+why:''}.`,2);
  if(c.trait==='loose'&&Math.random()<.5){notorAdd(6);notify(`${c.n} talked in the cell. Your police file grows.`)}
}
/* once a day: wages, hustles, loyalty, quitting and informing */
function crewDaily(){
  if(!G.crew||!G.crew.length)return;
  let wages=0;G.crew.forEach(m=>{if(crewFree(m))wages+=crewWage(crewDef(m.id))});
  const paid=wages<=0||payDirtyFirst(wages);
  const gone=[];
  G.crew.forEach(m=>{
    const c=crewDef(m.id);
    if(!crewFree(m)){m.loy=Math.max(0,m.loy-2);return}
    if(paid){m.unpaid=0;m.loy=Math.min(100,m.loy+(c.trait==='steady'?2:1))}else{m.unpaid++;m.loy=Math.max(0,m.loy-12)}
    if(m.job==='hustle'){
      earnDirty(10+c.skill*12);notorAdd(c.trait==='flashy'?1.2:.6);
      if(Math.random()<.04)crewJail(m,3,'working a corner');
    }
    if(c.trait==='flashy')notorAdd(.3);
    if(m.loy<=10)gone.push(m);
    else if(m.loy<25&&!m.warned){m.warned=1;notify(`${c.n} is unhappy. Pay them on time and give them a cut, or they will walk.`)}
    if(m.loy>=35)m.warned=0;
  });
  gone.forEach(m=>{
    const c=crewDef(m.id);G.crew=G.crew.filter(x=>x!==m);
    if((c.trait==='loose'||m.loy<=4)&&(G.notor||0)>=20){notorAdd(12);news(`${c.n} has been seen going into City Hall through the side door.`,3);notify(`${c.n} quit, and went straight to the police.`)}
    else notify(`${c.n} quit. Unpaid and unimpressed.`);
  });
  if(!paid)notify(`You could not cover the crew's wages (${money(wages)}). Loyalty drops.`);
}
/* ----- rival crews ----- */
/* whoever holds the most rackets that are not yours; if nobody does, newcomers move in */
function rivalOwner(){
  const n={vex:0,salt:0,tide:0};RACKETS.forEach(r=>{if(n[G.turf[r.id]]!=null)n[G.turf[r.id]]++});
  const best=Object.keys(n).sort((a,b)=>n[b]-n[a])[0];
  return n[best]>0?best:'tide';
}
const rivalName=()=>OWNER_NAMES[rivalOwner()];
/* how likely your rackets are to hold off a hit */
function rivalDefense(){
  return clamp(.3+crewSkill('muscle','guard')*.12+crewGuards().length*.05+crewSkill('look')*.06-(G.rival.str||0)/250,.08,.92);
}
function rivalDaily(){
  const mine=playerRackets();
  if(!mine.length){G.rival.str=lerpN(G.rival.str,40,.05);return}
  if(G.arc&&G.arc.id==='turfwar')return;
  if((G.rival.truce||0)>day())return;
  G.rival.str=clamp(G.rival.str+1+.5*mine.length,0,100);
  const chance=.04+.03*mine.length+G.rival.str/1000;
  if(Math.random()>chance)return;
  const r=pick(mine),who=rivalOwner(),name=OWNER_NAMES[who];
  if(crewHas('look'))notify(`Your lookout spotted ${name} gathering near ${r.n}.`);
  G.rival.hits=(G.rival.hits||0)+1;
  if(Math.random()<rivalDefense()){
    G.rival.str=clamp(G.rival.str-8,0,100);G.rival.held=(G.rival.held||0)+1;
    crewGuards().forEach(m=>{m.loy=Math.min(100,m.loy+6)});G.rep['Neon Mile']=clamp(G.rep['Neon Mile']+2,-100,100);
    news(`A scuffle outside ${r.n}. ${name} left with less than they came with.`,2);
    notify(`${name} tried to take ${r.n}. Your people held it.`);
  }else{
    G.turf[r.id]=who;crewGuards().forEach(m=>{m.loy=Math.max(0,m.loy-4)});
    const g=crewGuards();if(g.length&&Math.random()<.15)crewJail(pick(g),2,'after the fight');
    news(`${name} took over ${r.n} overnight.`,3);
    notify(`${name} took ${r.n} from you. Put guards on your rackets, or take it back from the Territory page.`);
  }
}
const lerpN=(a,b,k)=>a+(b-a)*k;
/* hit the rival's stash: weakens them and pays a little dirty cash */
function rivalStrike(){
  if(G.energy<15)return 'You are too tired for this.';
  G.energy=clamp(G.energy-15,0,100);advance(120);
  const c=clamp(.4+crewSkill('muscle')*.07+crewSkill('look')*.04-(G.rival.str||0)/400,.15,.85),name=rivalName();
  if(Math.random()<c){const got=earnDirty(ri(80,160));G.rival.str=clamp(G.rival.str-15,0,100);G.heat=Math.min(5,G.heat+1.5);return `You hit ${name}'s stash house. ${money(got)} in dirty cash, and they are weaker for it.`}
  G.heat=Math.min(5,G.heat+2);G.rival.str=clamp(G.rival.str+5,0,100);return `${name} were waiting. You get out with bruises and nothing else. Heat is up.`;
}
const tributeCost=()=>150+Math.round((G.rival.str||0)*6);
function rivalTribute(){
  const cost=tributeCost();if(!payDirtyFirst(cost))return `It costs ${money(cost)}.`;
  G.rival.truce=day()+7;advance(30);return `${rivalName()} take the envelope and promise to leave your corners alone for a week. They count it in front of you.`;
}
/* ----- big jobs ----- */
const heistDef=id=>HEISTS.find(h=>h.id===id);
const heistOpen=h=>(G.heistsDone||0)>=h.unlock&&!((G.heistCool||{})[h.id]>day());
function heistPlan(id){
  if(G.heist)return 'You are already planning a job.';
  G.heist={id,intel:0,gear:{},start:day()};return `You start planning ${heistDef(id).n}.`;
}
const heistGearHave=(H,g)=>g.inv?(G.inv[g.inv]||0)>=(g.q||1):!!H.gear[g.id];
const heistGearReady=()=>{const h=heistDef(G.heist.id);return h.gear.every(g=>heistGearHave(G.heist,g))};
const heistRolesMissing=()=>heistDef(G.heist.id).roles.filter(r=>!crewHas(r));
function heistBuy(gid){
  const H=G.heist,g=heistDef(H.id).gear.find(x=>x.id===gid);if(!g||g.inv)return '';
  if(!payDirtyFirst(g.p))return `${g.n} costs ${money(g.p)}.`;
  H.gear[gid]=true;advance(30);return `${g.n}, no receipt.`;
}
/* casing happens when you reach the place: a little intel each visit, more with a lookout */
function heistCaseAt(){
  const H=G.heist;if(!H)return 0;
  const add=Math.round(30+crewSkill('look')*6+(has('smooth')?5:0));
  H.intel=Math.min(100,H.intel+add);advance(60);return add;
}
/* the chance of pulling it off, before the twist */
function heistOdds(){
  const H=G.heist,h=heistDef(H.id);
  let o=.15+H.intel/100*.4+(heistGearReady()?.15:0);
  h.roles.forEach(r=>{o+=Math.min(3,crewSkill(r))*.035});
  o+=(G.mod&&G.mod.heist||0)+(G.fx.kit?.04:0);
  o-=G.heat*.05+(G.notor||0)/400+flackBand()*.04;
  return clamp(o,.05,.92);
}
/* resolve a job. choice is one of the twist's answers. Returns {ok, text} */
function heistResolve(choice){
  const H=G.heist,h=heistDef(H.id);
  if(choice&&choice.abort){G.mission=null;return{ok:null,text:'You call it off. Nobody saw anything, which is the next best thing to a payday. The plan is still there for another night.'}}
  let o=heistOdds()+(choice?(choice.k||0)+(choice.role&&crewHas(choice.role)?.04:choice.role?-.08:0):0);
  o=clamp(o,.05,.95);
  const crew=G.crew.filter(crewFree);
  G.heist=null;G.heistCool=G.heistCool||{};
  if(Math.random()<o){
    const gross=Math.round(ri(h.pay[0],h.pay[1])*(choice&&choice.pay||1));
    const cutEach=Math.round(gross*.12),cuts=cutEach*crew.length,net=gross-cuts;
    earnDirty(net);if(h.loot)G.inv.loot+=ri(h.loot[0],h.loot[1]);
    crew.forEach(m=>{m.loy=Math.min(100,m.loy+(crewDef(m.id).trait==='greedy'?6:10))});
    G.heat=Math.min(5,G.heat+Math.max(1,h.heat-crewSkill('driver')*.5));notorAdd(6);
    G.heistsDone=(G.heistsDone||0)+1;G.heistCool[h.id]=day()+12;meterAdd('Neon Mile',2);
    news(`Overnight: ${h.n.replace(/^The /,'the ')} was hit. Police have "several leads," which means none.`,3);
    return{ok:true,text:`It works. ${money(gross)} in dirty cash${crew.length?`, ${money(cuts)} of it shared out as the crew's cut`:''}. You keep ${money(net)}.${h.loot?' Some goods too, for the fence.':''} Heat is up.`};
  }
  G.heat=Math.min(5,G.heat+4.5);notorAdd(10);G.heistCool[h.id]=day()+6;
  const caught=[];crew.forEach(m=>{if(Math.random()<clamp(.4-crewSkill('driver')*.08,.1,.4)){crewJail(m,3,'near '+POIS[h.poi].name);caught.push(crewDef(m.id).n)}});
  news(`An attempted job at ${POIS[h.poi].name} ends in alarms and running.`,3);
  return{ok:false,text:`It goes wrong. Alarms, torches, running.${caught.length?` ${caught.join(' and ')} ${caught.length>1?'are':'is'} picked up.`:''} Every constable in town wants a word with you.`};
}
/* ----- the casino cage: buy chips with dirty cash, lose a little at the tables, cash out clean ----- */
const cageCap=()=>(G.turf.casino==='player'?600:300);
const cageFee=()=>(G.turf.casino==='player'?.06:.12)+(flackBand()>=2?.05:0);
const cageLeft=()=>Math.max(0,cageCap()-(G.cageDay===day()?(G.cageAmt||0):0));
function cageWash(amt){
  amt=Math.min(amt,G.dirty||0,cageLeft());if(amt<=0)return 0;
  const clean=Math.round(amt*(1-cageFee()));
  G.dirty-=amt;G.cash+=clean;if(G.cageDay!==day()){G.cageDay=day();G.cageAmt=0}G.cageAmt+=amt;
  G.laundered=(G.laundered||0)+amt;notorAdd(amt/(G.turf.casino==='player'?240:120));advance(45);
  return clean;
}
function crimeDaily(){crewDaily();rivalDaily()}
