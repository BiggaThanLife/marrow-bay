"use strict";
/* Dirty money, laundering, the police file, raids and prison. Menus for all of it are in js/menus/prison.js. */
const lawTier=()=>{let t=0;LAW_TIERS.forEach((x,i)=>{if((G.notor||0)>=x.min)t=i});return t};
const lawLocked=id=>lawTier()>=3&&LAW_LOCKED.includes(id);
function notorAdd(n){G.notor=clamp((G.notor||0)+n,0,100)}
/* called every game hour: being wanted feeds the file, lying low starves it */
function lawHourly(){
  if(G.jail)return;
  if(G.heat>0)G.notor=Math.min(100,(G.notor||0)+G.heat*.5);
  else G.notor=Math.max(0,(G.notor||0)-.05);
  const t=lawTier();
  if(t>(G.lawSeen||0)){G.lawSeen=t;news(`The police file on you grows: ${LAW_TIERS[t].n}. ${LAW_TIERS[t].t}`,3);popup(`Police file: ${LAW_TIERS[t].n}`,LAW_TIERS[t].t,'City Hall has a records office if you want it fixed.')}
  else if(t<(G.lawSeen||0)){G.lawSeen=t;news(`Your police file shrinks: ${LAW_TIERS[t].n}.`,1)}
}
/* called once a day: at Wanted list or worse the police go through places that look like yours */
function lawDaily(){
  if(G.jail)return;
  const t=lawTier();
  if(t<2||Math.random()>(t>=3?.14:.07))return;
  const pool=G.biz.filter(b=>b.type&&b.type!=='home'&&!(b.shut>day()));
  if(!pool.length)return;
  const b=pick(pool),fine=Math.min(400,60+Math.round((G.notor||0)*3)),seized=Math.round((G.dirty||0)*.25);
  payOut(b,fine);G.dirty=Math.max(0,(G.dirty||0)-seized);b.shut=day()+2;
  news(`Police raid ${bizName(b)} in the ${b.d}. The doors are shut for two days.`,3);
  notify(`Raid at ${bizName(b)}. Fined ${money(fine)}${seized?`, ${money(seized)} of dirty cash seized`:''}.`);
}
/* ----- dirty money ----- */
const earnDirty=amt=>{amt=Math.round(amt);G.dirty=(G.dirty||0)+amt;return amt};
const canLaunder=b=>!!(b.type&&b.type!=='home'&&b.type!=='farm');
const washFee=b=>(['bar','pies','wellness'].includes(b.type)?.15:.25)+(b.mgr?.1:0);
const washCap=b=>Math.round(60+(b.last?b.last.rev:20)*.8)*(b.level||1);
const washedToday=b=>b.washedDay===day()?(b.washed||0):0;
function launder(b,want){
  const a=Math.min(want,G.dirty||0,washCap(b)-washedToday(b));
  if(!canLaunder(b)||a<=0)return 0;
  const clean=Math.round(a*(1-washFee(b)));
  G.dirty-=a;G.cash+=clean;G.laundered=(G.laundered||0)+a;
  if(b.washedDay!==day()){b.washedDay=day();b.washed=0}
  b.washed+=a;notorAdd(a/200);
  return clean;
}
function launderAll(){let got=0,used=0;G.biz.forEach(b=>{const before=G.dirty||0;got+=launder(b,G.dirty||0);used+=before-(G.dirty||0)});return{got,used}}
/* ----- prison ----- */
const sentenceDays=()=>Math.min(14,Math.max(1,Math.round(G.heat*.8+(G.notor||0)/20)));
function goToJail(days){
  const R=NPC.reyes,fine=50*Math.ceil(G.heat),pay=Math.min(G.cash,fine),seized=Math.round((G.dirty||0)*(days>=2?.5:0));
  G.cash-=pay;G.arrears+=fine-pay;G.inv.loot=0;G.dirty=Math.max(0,(G.dirty||0)-seized);G.heat=0;G.mission=null;R.chasing=false;
  Object.keys(G.veh.stolen).forEach(k=>{if(G.veh.stolen[k]){G.veh.owned[k]=false;G.veh.stolen[k]=false;if(G.veh.active===k)G.veh.active='none'}});
  addRumor('thief',['reyes']);notorAdd(8);
  const pr=POIS.prison||POIS.plaza;G.p.x=pr.ex;G.p.y=pr.ey;G.p.path=[];G.p.onArrive=null;assign(R,true);
  G.jail={start:G.t,until:G.t+days*1440,days,work:0,appeal:false,fine,seized};
  news(`Constable Reyes made an arrest. The court gave ${G.name} ${days} day${days>1?'s':''}.`,3);quip('bust');
  hud();jailMenu();
}
function release(early){
  const J=G.jail;if(!J)return;
  G.jail=null;G.heat=0;notorAdd(early?-8:-20);
  const pr=POIS.prison||POIS.plaza;G.p.x=pr.ex;G.p.y=pr.ey;G.p.path=[];
  news(`${G.name} walks out of the Penitentiary after ${Math.max(1,Math.round((G.t-J.start)/1440))} day${Math.round((G.t-J.start)/1440)>1?'s':''}.`,2);
  hud();worldPanel();
  popup(early?'Out early':'Released',early?'The guard holds the door and looks at a wall. Nobody asks how.':'The gate opens. The city has carried on without you, mostly badly.',`Your police file is now ${LAW_TIERS[lawTier()].n}.`);
}
function jailTime(min){
  advance(min,true,true);
  G.hunger=Math.max(G.hunger,50);
  if(G.t>=G.jail.until)release(false);
}
