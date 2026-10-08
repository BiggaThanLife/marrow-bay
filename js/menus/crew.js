"use strict";
/* Menus for your crew, big jobs, rival crews and the casino cage. Rules are in js/sim/crew.js. Opened from the Velvet Room, the Territory page and the casino. */
const velvetBack={label:'Back',cls:'quiet',fn:()=>MENUS.velvet(POIS.velvet,NPC.vex)};
const stars=n=>'★'.repeat(n)+'☆'.repeat(3-n);
const loyWord=l=>l>=75?'loyal':l>=50?'content':l>=25?'restless':'ready to walk';
const JOB_N={idle:'Waiting for work',guard:'Guarding your rackets',hustle:'Working the corners'};
/* ----- the crew ----- */
function crewMenu(msg){
  const rows=crewAll().map(c=>`<p><b>${esc(c.n)}</b>, ${CREW_ROLES[c.role].n} ${stars(c.skill)}<br><span class="small muted">${crewFree(c)?esc(JOB_N[c.job]):'In a cell until day '+c.jail}, ${loyWord(c.loy)}</span></p>`).join('');
  const wages=G.crew.filter(crewFree).reduce((t,m)=>t+crewWage(crewDef(m.id)),0);
  ui(`<h2>Your crew</h2><p class="muted">${G.crew.length}/${CREW_MAX} people. Wages ${money(wages)} a day, paid from dirty cash first. Unpaid people get restless, and restless people talk.</p>${rows?rows:'<p>Nobody yet. Vex knows people who know people.</p>'}${msgP(msg)}`,[
    ...G.crew.map(m=>({label:`Manage ${crewDef(m.id).n.split(' ')[0]}`,sub:`${CREW_ROLES[crewDef(m.id).role].n}, loyalty ${Math.round(m.loy)}`,cls:'',fn:()=>crewMember(m.id)})),
    {label:'Recruit',sub:G.crew.length>=CREW_MAX?'Your crew is full':'New faces each week',off:G.crew.length>=CREW_MAX,cls:'',fn:()=>crewRecruit()},
    velvetBack]);
}
function crewMember(id,msg){
  const m=G.crew.find(c=>c.id===id);if(!m)return crewMenu(msg);
  const c=crewDef(id),free=crewFree(m);
  ui(`<h2>${esc(c.n)}</h2><p class="muted">${CREW_ROLES[c.role].n} ${stars(c.skill)}. ${esc(CREW_TRAITS[c.trait])}. ${money(crewWage(c))} a day.</p><p>${esc(c.bio)}</p><p class="small">${esc(CREW_ROLES[c.role].d)}</p><p class="small muted">Loyalty ${Math.round(m.loy)} (${loyWord(m.loy)}). ${free?esc(JOB_N[m.job])+'.':'In a cell until day '+m.jail+'.'}</p>${msgP(msg)}`,[
    ...(free?[
      {label:'Job: guard your rackets',sub:'Helps hold off rival hits. Each guard adds 5% to racket pay.',off:m.job==='guard',cls:'',fn:()=>{crewSetJob(id,'guard');crewMember(id,'On the door.')}},
      {label:'Job: work the corners',sub:`About ${money(10+c.skill*12)} dirty a day. Feeds your police file, and corners get raided.`,off:m.job==='hustle',cls:'',fn:()=>{crewSetJob(id,'hustle');crewMember(id,'Out on the corners.')}},
      {label:'Job: wait for work',sub:'Stays out of trouble until a big job.',off:m.job==='idle',cls:'',fn:()=>{crewSetJob(id,'idle');crewMember(id,'Waiting by the phone.')}}]:[
      {label:'Post bail',sub:`${money(crewBail(m))} clean. Loyalty up.`,off:G.cash<crewBail(m),cls:'',fn:()=>crewMember(id,crewBailOut(id))}]),
    {label:'Let them go',sub:'Unhappy people sometimes remember things for the police',cls:'warn',fn:()=>ask(`Let ${c.n} go?`,m.loy<30?'They are not happy with you. Some people take it badly.':'They will take it well enough.','Let them go',()=>crewMenu(crewFire(id)),()=>crewMember(id))},
    {label:'Back',cls:'quiet',fn:()=>crewMenu()}]);
}
function crewRecruit(msg){
  const list=crewCandidates();
  ui(`<h2>Recruit</h2><p class="muted">Vex's people put the word out. New faces come round each week. Hiring costs three days' wages up front.</p>${list.map(c=>`<p><b>${esc(c.n)}</b>, ${CREW_ROLES[c.role].n} ${stars(c.skill)}, ${esc(CREW_TRAITS[c.trait])}<br><span class="small muted">${esc(c.bio)}</span></p>`).join('')}${msgP(msg)}`,[
    ...list.map(c=>({label:`Hire ${c.n}`,sub:`${money(crewWage(c)*3)} up front, then ${money(crewWage(c))} a day`,off:G.crew.length>=CREW_MAX||(G.dirty||0)+G.cash<crewWage(c)*3,cls:'',fn:()=>crewMenu(crewHire(c.id))})),
    {label:'Back',cls:'quiet',fn:()=>crewMenu()}]);
}
/* ----- big jobs ----- */
function heistBoard(msg){
  if(G.heist)return heistPlanMenu(msg);
  const st=h=>(G.heistsDone||0)<h.unlock?`Locked: pull ${h.unlock} job${h.unlock>1?'s':''} first`:((G.heistCool||{})[h.id]>day())?`Too hot until day ${G.heistCool[h.id]}`:`${money(h.pay[0])} to ${money(h.pay[1])}. Needs ${h.roles.map(r=>CREW_ROLES[r].n.toLowerCase()).join(', ')}.`;
  ui(`<h2>Big jobs</h2><p class="muted">Bigger than a smash and grab. Case the place, get the gear, bring the right people, then go in one night. The crew takes a cut of what you bring out.</p>${msgP(msg)}`,[
    ...HEISTS.map(h=>({label:`Plan: ${h.n}`,sub:st(h),off:!heistOpen(h),cls:'',fn:()=>{heistPlan(h.id);heistPlanMenu()}})),
    velvetBack]);
}
const oddsWord=o=>o<.35?'a long shot':o<.55?'a coin toss':o<.75?'good':'very good';
function heistPlanMenu(msg){
  const H=G.heist;if(!H)return heistBoard(msg);
  const h=heistDef(H.id),poi=POIS[h.poi],miss=heistRolesMissing(),gearOk=heistGearReady();
  const ck=b=>b?'✓':'○';
  const gearRows=h.gear.map(g=>`${ck(heistGearHave(H,g))} ${esc(g.n)}: ${heistGearHave(H,g)?'have it':g.inv?`make at the crafting bench (${G.inv[g.inv]||0}/${g.q||1})`:money(g.p)}<br>`).join('');
  const ready=H.intel>=30&&!miss.length&&gearOk;
  ui(`<h2>${esc(h.n)}</h2><p class="muted">${esc(h.blurb)}</p>
    <p>${ck(H.intel>=30)} Case ${esc(poi.name)}: ${H.intel}% intel<br>${gearRows}${ck(!miss.length)} Crew: ${miss.length?'need a '+miss.map(r=>CREW_ROLES[r].n.toLowerCase()).join(' and a '):'ready'}</p>
    <p class="small">Right now the odds look ${oddsWord(heistOdds())}. More intel, the right people and low heat all help. Jobs happen at night.</p>${msgP(msg)}`,[
    {label:`Case ${poi.name}`,sub:'Walk there and watch for an hour. A lookout learns more.',off:!!G.mission||H.intel>=100,cls:'',fn:()=>{startMission({type:'case',title:`Case ${poi.name}`,stops:[h.poi],i:0,deadline:G.t+600,reward:0})}},
    ...h.gear.filter(g=>!g.inv&&!H.gear[g.id]).map(g=>({label:`Get ${g.n.toLowerCase()}`,sub:`${money(g.p)}, dirty cash first. ${HEIST_GEAR_SHOP}`,off:(G.dirty||0)+G.cash<g.p,cls:'',fn:()=>heistPlanMenu(heistBuy(g.id))})),
    ...(miss.length?[{label:'Recruit crew',sub:`Missing: ${miss.map(r=>CREW_ROLES[r].n).join(', ')}`,cls:'',fn:()=>crewRecruit()}]:[]),
    {label:'Pull the job tonight',sub:ready?`Be at ${poi.name} after dark. Odds look ${oddsWord(heistOdds())}.`:'Needs 30% intel, the gear and the crew',off:!ready||!!G.mission,cls:'warn',fn:()=>startMission({type:'bigjob',title:h.n,stops:[h.poi],i:0,deadline:G.t+1440,reward:0,night:true})},
    {label:'Drop the plan',cls:'quiet',fn:()=>ask('Drop this plan?','The intel and gear are lost.','Drop it',()=>{G.heist=null;heistBoard('You burn the notes.')},()=>heistPlanMenu())},
    velvetBack]);
}
/* at the place, at night: one complication, your call, then the result */
function heistGo(){
  const h=heistDef(G.heist.id),tw=pick(h.twists);
  ui(`<h2>${esc(h.n)}</h2><p>You are in. Then: ${esc(tw.t)}</p><p class="small muted">Odds before this: ${oddsWord(heistOdds())}.</p>`,tw.a.map(a=>({label:a.l,sub:a.abort?'Leave clean. The plan stays for another night.':a.role?(crewHas(a.role)?`Your ${CREW_ROLES[a.role].n.toLowerCase()} handles it`:`You have no ${CREW_ROLES[a.role].n.toLowerCase()}. Risky.`):a.pay>1?'More money, worse odds':a.pay<1?'Safer, smaller':'',cls:a.abort?'quiet':'warn',fn:()=>{
    const show=()=>{const r=heistResolve(a);hud();ui(`<h2>${r.ok?'Clean getaway':r.ok===false?'It went wrong':'Called off'}</h2><p>${esc(r.text)}</p>`,[{label:'Continue',fn:closeMenu}],true,false)};
    if(!a.abort&&!scenesOff())playScene({type:'sneaky',kit:'grab',cap:'Pulling the job'},show);else show();
  }})),true,false);
}
/* ----- rival crews (shown on the Territory page) ----- */
const rivalWord=s=>s>=75?'dangerous':s>=50?'strong':s>=25?'getting bolder':'weak';
function rivalBlock(){
  if(!playerRackets().length&&!(G.rival.hits>0))return '';
  const tr=(G.rival.truce||0)>day();
  return `<p class="small"><b>${esc(rivalName())}</b> look ${rivalWord(G.rival.str)}. ${tr?`They are paid off until day ${G.rival.truce}.`:`Your corners would hold a hit about ${Math.round(rivalDefense()*100)}% of the time. Guards and a lookout help.`}</p>`;
}
function rivalButtons(poi,n){
  if(!playerRackets().length)return [];
  return [
    {label:`Hit ${rivalName()}'s stash`,sub:'2 hours. Weakens them and pays dirty cash. Muscle helps. Raises heat.',off:G.energy<15,cls:'warn',fn:()=>territoryMenu(poi,n,rivalStrike())},
    {label:`Pay ${rivalName()} to stay away`,sub:`${money(tributeCost())}, dirty first. No hits for a week.`,off:(G.rival.truce||0)>day()||(G.dirty||0)+G.cash<tributeCost(),cls:'',fn:()=>territoryMenu(poi,n,rivalTribute())}];
}
/* ----- the casino cage ----- */
function cageMenu(poi,n,msg){
  const left=cageLeft(),fee=Math.round(cageFee()*100);
  ui(`<h2>The cage</h2><p class="muted">Buy chips with dirty cash, lose a little at the tables so it looks right, cash out clean. About ${fee}% goes to the house.${G.turf.casino==='player'?' Your skim man waves you through.':''}</p><p class="small">The cage takes ${money(left)} more today. It also catches the police file's eye.</p>${msgP(msg)}`,[
    ...[100,250].filter(a=>a<Math.min(left,G.dirty||0)).map(a=>({label:`Wash ${money(a)}`,sub:`Get back ${money(Math.round(a*(1-cageFee())))} clean`,cls:'',fn:()=>cageMenu(poi,n,`You walk out with ${money(cageWash(a))} clean.`)})),
    {label:`Wash ${money(Math.min(left,G.dirty||0))}`,sub:'As much as the cage will take today',off:Math.min(left,G.dirty||0)<=0,cls:'',fn:()=>cageMenu(poi,n,`You walk out with ${money(cageWash(left))} clean.`)},
    {label:'Back',cls:'quiet',fn:()=>MENUS.casino(poi,n)}]);
}
