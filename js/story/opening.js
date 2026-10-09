"use strict";
/* The opening: a short scripted first two days for a new game, so the first 15 minutes have a person, a job, a surprise, a choice, a visible
   consequence and a reason to come back. It is built from things that already exist (the feed, rumors, memory, the tide) and nothing in it is locked:
   ignore any step and it moves on, and it times out after a few days. It never runs on a loaded save (cityInit marks those done).
   G.opening = {step, bg, npc, d0, offered, jobDone, readyAt, kept, at, meetAt, done}
   steps: intro (still in the HARBOR intro) > wait (8:10 on day 1) > tide (offer made; waiting for the first low tide) > crate (crate on the flats)
          > consequence (an hour after the choice) > tomorrow (a visit at 9 the next morning) > done. */
const OPEN_NPC={farm:'wren',dock:'duarte',banker:'cordelia',artist:'pip'};
const OPEN_JOB={
  farm:{ask:'"You are the new one in the barn. My gate has been open since the storm and the hens have opinions. Close it for me and I will pay you."',label:'Mend the fence',sub:'An hour. About $15 and two seeds.',
    run:n=>{G.cash+=15;G.inv.seeds=(G.inv.seeds||0)+2;advance(60);G.energy=clamp(G.energy-6,0,100);memAdd(n.id,6);return 'You close the gate and fix two slats. Wren pays you $15 and presses two seeds into your hand.'}},
  dock:{ask:'"Heard the union kid is back. We are a pair of hands short on pier four. Four hours, honest money."',label:'Haul cargo',sub:'Four hours. About $26.',need:28,
    run:n=>{G.cash+=26;advance(240);G.energy=clamp(G.energy-16,0,100);G.rep.Dockside=clamp(G.rep.Dockside+1,-100,100);memAdd(n.id,6);return 'Four hours of crates on pier four. Duarte pays you $26 and says nothing, which from him is a compliment.'}},
  banker:{ask:'"You used to work with numbers. I have a ledger that does not agree with itself. Two hours, and discretion."',label:'Check the ledger',sub:'Two hours. About $30.',
    run:n=>{G.cash+=30;advance(120);G.energy=clamp(G.energy-5,0,100);memAdd(n.id,6);return 'You find the transposed figure in twenty minutes and spend the rest looking busy. Cordelia pays you $30.'}},
  artist:{ask:'"You have the look. The fountain is best from ten to noon. Busk with me and I will show you where the tips are."',label:'Busk with Pip',sub:'Two hours. About $25.',need:14,
    run:n=>{const pay=Math.round(25*(has('creative')?1.4:1));G.cash+=pay;advance(120);G.energy=clamp(G.energy-8,0,100);G.rep.Grid=clamp(G.rep.Grid+1,-100,100);memAdd(n.id,6);return `Pip points at the right tile and the crowd does the rest. You split the tips and keep ${money(pay)}.`}}
};
const openingNpc=()=>NPC[G.opening.npc];
const openingFirst=()=>openingNpc().name.split(' ').slice(-1)[0];
function openingBegin(){
  const o=G.opening;if(!o||o.step!=='intro')return;
  G.opening={step:'wait',bg:G.bg,npc:OPEN_NPC[G.bg]||'wren',d0:day(),offered:false,jobDone:false,readyAt:0,kept:null};
}
function openingSkip(){G.opening={step:'done',done:true}}
const openingFree=()=>!modal&&!popOpen&&!G.jail&&!G.mission&&!sceneBusy&&!placing;
function openingTick(){
  const o=G&&G.opening;if(!o||o.done||o.step==='intro')return;
  if(day()>o.d0+3){o.step='done';o.done=true;return}
  if(o.step==='wait'&&G.t>=(o.d0-1)*1440+8*60+10&&openingFree())return openingArrive();
  if(o.step==='tide'&&G.t>=o.readyAt&&hourOf()>=9&&hourOf()<=19&&tideName()==='low'&&openingFree()){o.step='crate';notify('The tide is out. Something is half buried at the Dockside waterfront.')}
  if(o.step==='consequence'&&G.t>=o.at)openingConsequence();
  if(o.step==='tomorrow'&&G.t>=o.meetAt&&openingFree())openingVisit();
}
/* the neighbour walks up to your door and makes an offer */
function openingArrive(){
  const o=G.opening,n=openingNpc();
  G.met[n.id]=G.met[n.id]||day();
  n.indoors=false;n.path=[];n.x=G.p.x+.9;n.y=G.p.y;
  o.step='tide';o.offered=true;o.readyAt=G.t+30;
  openingOffer();
}
function openingOffer(msg){
  const o=G.opening,n=openingNpc(),j=OPEN_JOB[o.bg]||OPEN_JOB.farm;
  ui(`<h2>${esc(n.name)}</h2><p class="muted">${esc(n.role)}, ${n.d}.</p><p>${esc(j.ask)}</p>${msgP(msg)}`,[
    {label:j.label,sub:j.sub,need:j.need,fn:()=>openingDoJob()},
    {label:'Not now',sub:'The offer stays open. Talk to them any time.',cls:'quiet',keep:true,fn:closeMenu}]);
}
function openingDoJob(){
  const o=G.opening,n=openingNpc(),j=OPEN_JOB[o.bg]||OPEN_JOB.farm;
  const msg=j.run(n);o.jobDone=true;o.readyAt=G.t+30;
  ui(`<h2>${esc(n.name)}</h2><p>${esc(msg)}</p>`,[{label:'Continue',keep:true,fn:closeMenu}]);
}
/* the job offer stays on the neighbour's talk menu until it is done */
function openingTalkButtons(n){
  const o=G.opening;if(!o||o.done||!o.offered||o.jobDone||n.id!==o.npc)return [];
  const j=OPEN_JOB[o.bg]||OPEN_JOB.farm;
  return [{label:j.label,sub:j.sub,need:j.need,cls:'primary',fn:()=>openingDoJob()}];
}
/* the waterfront shows the crate once the tide has uncovered it */
function openingWaterfrontButtons(){
  const o=G.opening;if(!o||o.step!=='crate')return [];
  return [{label:'Look at the crate in the mud',sub:'Half buried near the pier. HARBOR is unsure whose it is.',cls:'primary',fn:openingCrate}];
}
function openingCrate(){
  const o=G.opening,n=openingNpc();
  ui(`<h2>A crate on the flats</h2><p>It is locked, salt-stained and heavier than it looks. Found property is a legal category. HARBOR is unsure which one.</p><p class="muted">Nobody is watching. For now.</p>`,[
    {label:'Break it open and keep what is inside',sub:'About $40 and a trinket. People may notice.',fn:()=>openingChoose(true)},
    {label:`Hand it in to ${n.name.split(' ')[0]}`,sub:'About $10, and they will remember.',cls:'',fn:()=>openingChoose(false)},
    {label:'Leave it for now',cls:'quiet',keep:true,fn:closeMenu}]);
}
function openingChoose(keep){
  const o=G.opening,n=openingNpc();
  advance(20);
  if(keep){G.cash+=40;G.inv.trinkets=(G.inv.trinkets||0)+1;memAdd(n.id,-3)}
  else{G.cash+=10;memAdd(n.id,8)}
  o.kept=keep;o.step='consequence';o.at=G.t+60;
  ui(`<h2>${keep?'Finders keepers':'Handed in'}</h2><p>${keep?'The lock gives on the third try. Inside: coins, a brass trinket and a smell like old harbour. You pocket it all.':`You carry it to ${esc(n.name.split(' ')[0])}, who turns it over twice. "Huh. Most people would not have."`}</p>`,[{label:'Continue',keep:true,fn:closeMenu}]);
}
/* an hour later: a rumor, a different line from the neighbour, and a reason to come back tomorrow */
function openingConsequence(){
  const o=G.opening,n=openingNpc(),keep=o.kept;
  o.step='tomorrow';o.meetAt=day()*1440+9*60;
  addRumor(keep?'crateKept':'crateReturned',keep?[n.id==='pip'?'reyes':'pip',n.id]:[n.id,'teo'],{dist:'Dockside',owner:n.name.split(' ')[0]});
  notify(keep?'People have noticed the crate.':`${n.name.split(' ')[0]} tells people you handed it in.`);
}
function openingVisit(){
  const o=G.opening,keep=o.kept,n=keep?NPC.pip:openingNpc();
  G.met[n.id]=G.met[n.id]||day();
  n.indoors=false;n.path=[];n.x=G.p.x+.9;n.y=G.p.y;
  const end=m=>()=>{o.step='done';o.done=true;m&&m();closeMenu()};
  if(keep)return ui(`<h2>${esc(n.name)}</h2><p>"People are talking about that crate. Vex Calloway hears everything, and he pays people who know when to stay quiet. Velvet Door, after dark, if you want a word."</p>`,[
    {label:'Maybe',sub:'Vex will hear you said so.',fn:end(()=>{memAdd('vex',3)})},{label:'Not for me',cls:'quiet',fn:end()}]);
  if(n.id==='pip')return ui(`<h2>${esc(n.name)}</h2><p>"You handed it in? The fountain crowd heard. Tips will be kinder this week."</p>`,[
    {label:'Good to know',sub:'About $15 from a happy crowd.',fn:end(()=>{G.cash+=15;G.rep.Grid=clamp(G.rep.Grid+2,-100,100)})}]);
  ui(`<h2>${esc(n.name)}</h2><p>"Word about the crate got around. In a good way. I have more work if you want it."</p>`,[
    {label:'Take the work',sub:'An hour. About $20.',fn:end(()=>{G.cash+=20;advance(60);memAdd(n.id,4)})},{label:'Later',cls:'quiet',fn:end()}]);
}
/* HARBOR's pinned suggestion for wherever the opening has got to */
function openingSuggestion(){
  const o=G&&G.opening;if(!o||o.done||o.step==='intro'||o.step==='wait')return null;
  const n=openingNpc(),fn=n.name.split(' ')[0];
  const say=t=>({id:'o:'+o.step+(o.jobDone?'j':''),kind:'suggest',dist:'',by:'HARBOR',t});
  if(o.step==='tide'&&!o.jobDone)return say(`${fn} has work for you. Talk to ${fn}, or tap them on the map.`);
  if(o.step==='crate')return say('The tide is out. Something is half buried at the Dockside waterfront. Tap the pier or the shore.');
  if(o.step==='tomorrow')return say(o.kept?'Pip says to be at your door tomorrow at 9. Somebody wants a word about the crate. He did not say who.':`${fn} has more work for you tomorrow at 9.`);
  return null;
}
