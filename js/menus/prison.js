"use strict";
/* Prison, the records office at City Hall, and laundering buttons. Rules are in js/sim/law.js. */
function jailMenu(msg){
  const J=G.jail;if(!J)return worldPanel();
  const left=Math.max(0,J.until-G.t),days=left/1440,dLeft=days>=1?`${Math.ceil(days)} day${Math.ceil(days)>1?'s':''}`:`${Math.max(1,Math.round(left/60))} hours`;
  const lawyer=80+J.days*60,bribe=250+80*Math.ceil(days),canBribe=(G.dirty||0)+G.cash>=bribe;
  ui(`<h2>Marrow Bay Penitentiary</h2><p class="muted">${esc(JAIL_LINES[(Math.floor(G.t/1440)+J.days)%JAIL_LINES.length])}</p>${msgP(msg)}
    <div class="kv"><div><span>Time left</span><b>${dLeft}</b></div><div><span>Sentence</span><b>${J.days} day${J.days>1?'s':''}</b></div><div><span>Your cash</span><b>${money(G.cash)}</b></div><div><span>Dirty cash</span><b>${money(G.dirty||0)}</b></div></div>
    <p class="small muted">Your businesses keep running while you are inside. A manager means nobody empties the till for themselves.</p>`,[
    {label:'Sit it out for six hours',sub:'Time passes. Meals arrive.',cls:'primary',fn:()=>{jailTime(360);if(G.jail)jailMenu('Six hours later, nothing has changed except the light.')}},
    {label:'Work in the laundry',sub:`Four hours, ${money(JAIL_WORK_PAY)}. Every third shift takes a day off your sentence.`,fn:()=>{
      J.work++;G.cash+=JAIL_WORK_PAY;let t='You fold other people\'s sheets and are paid in something nearly like money.';
      if(J.work%3===0){J.until-=1440;t='Good behaviour. A day comes off your sentence.'}
      jailTime(240);if(G.jail)jailMenu(t)}},
    {label:'Walk the yard',sub:'Two hours. A little air and a lot of staring.',cls:'',fn:()=>{G.energy=clamp(G.energy+8,0,100);jailTime(120);if(G.jail)jailMenu('You walk in circles with eleven other people walking in circles.')}},
    {label:'Hire a lawyer',sub:J.appeal?'You have already appealed':`${money(lawyer)}. A good chance of cutting the sentence by 40%.`,off:J.appeal||G.cash<lawyer,cls:'',fn:()=>{
      G.cash-=lawyer;J.appeal=true;
      if(Math.random()<.65){const cut=Math.round((J.until-G.t)*.4);J.until-=cut;jailMenu('The lawyer finds a mistake in the paperwork. The sentence is cut.')}
      else jailMenu('The lawyer finds no mistake. He bills you for looking.')}},
    {label:'Bribe a guard',sub:`${money(bribe)}, dirty cash first. Out today, if nobody is watching.`,off:!canBribe,cls:'warn',fn:()=>{
      let pay=bribe;const d=Math.min(G.dirty||0,pay);G.dirty-=d;pay-=d;G.cash-=pay;
      if(Math.random()<.75){notorAdd(8);release(true)}
      else{J.until+=2*1440;notorAdd(10);jailMenu('The guard takes the money and then reports you. Two days are added to your sentence.')}}},
    {label:'Phone',sub:'Check on your businesses and your messages',cls:'quiet',fn:()=>phone()}],true,false);
}
MENUS.prison=(poi,n,msg)=>{
  if(G.jail)return jailMenu(msg);
  ui(`<h2>${esc(poi.name)}</h2><p class="muted">The gate is closed. A sign says VISITING HOURS ARE OVER, and has said so for years.</p>`,[leaveBtn]);
};
/* ----- the records office at City Hall ----- */
function recordsMenu(poi,n,msg){
  const t=lawTier(),nt=G.notor||0,fixer=100+Math.round(nt*6),bribe=150+Math.round(nt*3),cs=G.csDay===day(),inf=day()-(G.informDay||-99)<30;
  ui(`<h2>Records office</h2><p class="muted">A clerk slides a folder across the desk. It is yours, and it is thick.</p>${msgP(msg)}
    <div class="kv"><div><span>Police file</span><b>${LAW_TIERS[t].n}</b></div><div><span>Notoriety</span><b>${Math.round(nt)}/100</b></div></div><p class="small">${esc(LAW_TIERS[t].t)}</p>
    <p class="small muted">Your file fades on its own if you stay out of trouble. These ways make it faster.</p>`,[
    {label:'Community service',sub:cs?'Done for today':'Six hours. Takes 10 off your file. Once a day.',off:cs||nt<1,cls:'primary',fn:()=>{G.csDay=day();notorAdd(-10);G.energy=clamp(G.energy-10,0,100);advance(360);recordsMenu(poi,n,'You pick up litter under supervision. Several people thank you, mostly by not looking.')}},
    {label:'Pay a fixer to lose the paperwork',sub:`${money(fixer)}. Takes 25 off your file.`,off:G.cash<fixer||nt<1,cls:'',fn:()=>{G.cash-=fixer;notorAdd(-25);advance(60);recordsMenu(poi,n,'A man in a good coat takes an envelope and a folder. Only one of them comes back.')}},
    {label:'Bribe the clerk',sub:`${money(bribe)}, dirty cash first. Takes 30 off your file. Risky.`,off:(G.dirty||0)+G.cash<bribe||nt<1,cls:'warn',fn:()=>{
      let pay=bribe;const d=Math.min(G.dirty||0,pay);G.dirty-=d;pay-=d;G.cash-=pay;advance(30);
      if(Math.random()<.8){notorAdd(-30);recordsMenu(poi,n,'The clerk finds your file very interesting for a moment, and then misplaces it.')}
      else{notorAdd(8);G.heat=Math.max(G.heat,1.5);recordsMenu(poi,n,'The clerk is not the kind who can be bought. The clerk is the kind who calls someone.')}}},
    {label:'Inform on Vex\'s crew',sub:inf?'You have said your piece this month':'Takes 30 off your file. Vex will hear about it.',off:inf||nt<1,cls:'warn',fn:()=>{
      G.informDay=day();notorAdd(-30);npcS(NPC.vex).m-=25;G.rep['Neon Mile']=clamp(G.rep['Neon Mile']-8,-100,100);advance(45);
      news('Word is someone in the Neon Mile has been talking to the police.',2);
      recordsMenu(poi,n,'You give a statement. The constable writes slowly. Somewhere in the Neon Mile, a phone starts ringing.')}},
    {label:'Back',cls:'quiet',fn:()=>MENUS.cityhall(poi,n)}]);
}
/* ----- laundering ----- */
function launderButton(biz){
  if(!canLaunder(biz)||!(G.dirty>0||(G.laundered>0)))return[];
  const room=Math.max(0,washCap(biz)-washedToday(biz)),can=Math.min(room,G.dirty||0);
  return[{label:'Launder dirty cash',sub:`${money(G.dirty||0)} dirty. Cleans up to ${money(room)} more today through this place for a ${Math.round(washFee(biz)*100)}% cut.`,off:can<=0,cls:'',fn:()=>{
    const got=launder(biz,G.dirty||0);bizMenu(biz,got?`The books swallow the cash and return ${money(got)} of it clean.`:'There is nothing to wash.')}}];
}
function launderSummaryButton(){
  if(!(G.dirty>0))return[];
  return[{label:'Launder dirty cash',sub:`${money(G.dirty)} dirty. Washed through every business you own, up to each one's daily limit.`,cls:'',fn:()=>{
    const r=launderAll();bizOverview(r.used?`Washed ${money(r.used)} and got ${money(r.got)} back clean.`:'No business has room to wash any today.')}}];
}
function dirtyRows(){
  const t=lawTier();
  return `<div><span>Dirty cash</span><b>${money(G.dirty||0)}</b></div><div><span>Police file</span><b>${LAW_TIERS[t].n}</b></div>`;
}
