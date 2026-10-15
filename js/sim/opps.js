"use strict";
/* Today's opportunities: up to three things worth a look, drawn from what the city is doing (the tide, a district doing well or badly, a rumor about you,
   someone you know who needs something). They sit at the top of the Bay-Watch feed with a button to act, last three days (until=day+2) and are never required.
   G.opps=[{id,kind,day,until,dist,t,act}] where act is plain data ({type:'walk'|'talk'|'bag',label,x,y,id}) so it saves; G.oppId counts, G.oppSeen is what you have looked at. */
const OPP_MAX=3,OPP_LIFE=2;
function oppNextLow(){for(let m=G.t;m<G.t+1440;m+=5)if(tideName(m)==='low'){const h=Math.floor(m/60)%24;if(h>=6&&h<=21)return m}return null}
function oppDockSpot(){
  const p=POIS.dock||Object.values(POIS)[0];let best=null,bd=1e9;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(map[y][x]===T.DOCK){const d=Math.hypot(x-p.ex,y-p.ey);if(d<bd){bd=d;best=[x,y]}}
  return best||[p.ex,p.ey];
}
const OPP_GEN={
  tide(){
    const m=oppNextLow();if(m==null)return null;
    const [x,y]=oppDockSpot();
    return{dist:'Dockside',t:`Low tide around ${fmtHr(Math.floor(m/60))}. The flats open up for scavenging, and the mud sometimes keeps a strongbox. The pier is awash at high tide.`,act:{type:'walk',label:'Walk to the waterfront',x,y}};
  },
  district(){
    const ds=Object.keys(METERS).filter(d=>DSTATE(d)!==1);if(!ds.length)return null;
    const d=ds[hash(day(),7)%ds.length],hi=DSTATE(d)===2,p=Object.values(POIS).find(q=>q.d===d);if(!p)return null;
    return{dist:d,t:`${DTIP[d][hi?'high':'low']} ${hi?'A good day to be there.':'A quiet day to take a look around.'}`,act:{type:'walk',label:`Walk to ${d}`,x:p.ex,y:p.ey}};
  },
  rumor(){
    const r=G.rumors.filter(x=>RUM[x.type]).sort((a,b)=>b.str-a.str)[0];if(!r)return null;
    return{dist:'',t:`${RUM[r.type].t} ${r.knows.length} of ${NPCS.length} have heard. It is worth knowing who.`,act:{type:'bag',label:'See who has heard'}};
  },
  person(){
    const c=NPCS.filter(n=>G.met[n.id]&&n.id!==G.companion&&(npcS(n).hunger<40||npcS(n).cash<15));if(!c.length)return null;
    const n=c[hash(day(),11)%c.length],hungry=npcS(n).hunger<40;
    return{dist:n.d,t:`${n.name} ${hungry?'looks hungry':'is short on cash'}. A meal or a bit of work would go a long way, and people remember who helped.`,act:{type:'talk',label:`Find ${shortName(n)}`,id:n.id}};
  },
  /* ---- task kinds: act is a walk and goal says what happens on arrival (see oppArrive). A goal is plain data so it saves. ---- */
  errand(){
    const d=OPP_DISTS[hash(day(),21)%OPP_DISTS.length],p=oppPoi(d,hash(day(),22));if(!p)return null;
    return{dist:d,t:`A stranger at the corner presses an envelope into your hand. "For whoever answers at ${p.name}. No name needed. They pay on arrival." It is light.`,
      act:{type:'walk',label:`Take the envelope to ${p.name}`,x:p.ex,y:p.ey},goal:{x:p.ex,y:p.ey,cash:14+hash(day(),23)%7,rep:[p.d,1],done:`Whoever answers at ${p.name} takes the envelope without a word and counts out the fee.`}};
  },
  lostitem(){
    const c=NPCS.filter(n=>G.met[n.id]&&POIS[n.home]);if(!c.length)return null;
    const n=c[hash(day(),31)%c.length],items=['a knitted glove','a house key on a fishing float','a library card','a pocket tide table, pencilled over'],item=items[hash(day(),32)%items.length],p=POIS[n.home];
    return{dist:n.d,t:`You find ${item} on a bench, with ${n.name}'s name inked inside. They live near ${p.name}. People remember who hands things back.`,
      act:{type:'walk',label:`Return it to ${shortName(n)}`,x:p.ex,y:p.ey},goal:{x:p.ex,y:p.ey,cash:5,att:[n.id,6],done:`${n.name} turns it over twice and says nothing for a moment. "Thank you." It is enough.`}};
  },
  delivery(){
    if(G.inv.scrap<2)return null;
    const p=oppPoi('Foundry Row',hash(day(),41));if(!p)return null;
    return{dist:'Foundry Row',t:`Iron Works is short a couple of pieces of scrap before the evening pour, and pays a bit over the Market's price on the spot. You are carrying some. It is across town.`,
      act:{type:'walk',label:`Deliver 2 scrap to ${p.name}`,x:p.ex,y:p.ey},goal:{x:p.ex,y:p.ey,need:{scrap:2},cash:28+hash(day(),42)%7,att:['ines',3],done:'A foreman weighs it, grunts, and pays in cash. "Good. Come again."'}};
  },
  dare(){
    const d=['Dockside','Neon Mile'][hash(day(),50)%2],p=oppPoi(d,hash(day(),51));if(!p)return null;
    return{dist:d,t:`Someone bets you cannot stand outside ${p.name} after dark and not blink when the lights go. Easy money, if no one is watching who should not be. It only counts between 9 pm and 4 am.`,
      act:{type:'walk',label:`Take the dare at ${p.name}`,x:p.ex,y:p.ey},goal:{x:p.ex,y:p.ey,hrs:[21,4],cash:36+hash(day(),52)%9,heat:.4,done:'You stand there until the sign flickers. A hand slides a folded bill into your pocket. Somewhere a camera clicks.'}};
  },
  tidejob(){
    const m=oppNextLow();if(m==null)return null;
    const [x,y]=oppDockSpot(),sp=tideCycle(m)==='spring';
    return{dist:'Dockside',t:`A dockhand needs somebody to clear a fouled line off the pilings, and only the low water makes it possible, around ${fmtHr(Math.floor(m/60))}.${sp?' It is a spring tide, so the flats will be bare and the pay is better.':''} It only works while the tide is out.`,
      act:{type:'walk',label:'Clear the line at low tide',x,y},goal:{x,y,tide:'low',cash:sp?38:28,scrap:sp?3:2,done:'You haul the fouled line free and the dockhand slaps the piling in thanks. The mud gives up some scrap as well.'}};
  },
  legend(){
    const d=DISTS[hash(day(),61)%DISTS.length],L=OPP_LEGENDS[d],p=oppPoi(d,hash(day(),62));if(!p||!L)return null;
    return{dist:d,t:`In ${d} they say that ${L[hash(day(),63)%L.length]} Probably a story. ${p.name} is where people tell it best.`,
      act:{type:'walk',label:`Hear it at ${p.name}`,x:p.ex,y:p.ey},goal:{x:p.ex,y:p.ey,cash:6,rep:[d,1],place:p.id,done:`You stand about at ${p.name} until someone tells it properly, with the bad ending left in.`}};
  },
  favour(){
    if(!(G.inv.meals>0))return null;
    const c=NPCS.filter(n=>G.met[n.id]&&POIS[n.home]);if(!c.length)return null;
    const n=c[hash(day(),71)%c.length],p=POIS[n.home];
    return{dist:n.d,t:`${n.name} has had a long week. A hot meal at their door would mean more than it costs. You have one in the Bag.`,
      act:{type:'walk',label:`Bring ${shortName(n)} a meal`,x:p.ex,y:p.ey},goal:{x:p.ex,y:p.ey,need:{meals:1},att:[n.id,8],done:`${n.name} eats on the step and does not say much. Later you hear it mentioned kindly.`}};
  },
  repair(){
    if(!(G.inv.parts>0))return null;
    const p=oppPoi('Grid',hash(day(),81));if(!p)return null;
    return{dist:'Grid',t:`A gate hinge near ${p.name} has seized, and the keeper will pay for a part to be fitted today. You have a part. It takes ten minutes.`,
      act:{type:'walk',label:`Fit the part at ${p.name}`,x:p.ex,y:p.ey},goal:{x:p.ex,y:p.ey,need:{parts:1},cash:32+hash(day(),82)%9,rep:['Grid',1],done:'The hinge swings clean. The keeper pays and tells three people.'}};
  }
};
const OPP_DISTS=['Greenbelt','Grid','Dockside','Highline','Neon Mile','Foundry Row'];
const OPP_LEGENDS={
  Greenbelt:["the scarecrow at Wren's fence is older than the Trust and has refused three offers.","if the crows leave the barley two days early, the Grid floods.","a farmer once paid his taxes in tomatoes, and HARBOR still has the receipt."],
  Highline:["a banker once jumped into the harbor to avoid an audit and was fined for littering.","the club has a room with no door, for people the Trust is considering.","Highline's clock is correct, and everyone else's is merely accurate."],
  Grid:["under the plaza there is a second plaza, and nobody has been invited.","the market's fish are caught by whoever last owed someone.","Constable Reyes has never lost a footrace and has never admitted to entering one."],
  Dockside:["the 44th name is on the wall, painted over in a colour that does not match.","a crate once washed in with exactly one boot, the right one.","on a still night you can hear the tide table read aloud from under the pier."],
  'Neon Mile':["the sign in the Velvet Room says OPEN and is the only honest thing on the street.","one barman makes a drink that tastes like the harbor, and charges extra for authenticity.","if you owe Vex, the tide runs for you. If you owe the Salt Kings, it runs at you."],
  'Foundry Row':["the oldest vat is called Big Margaret and nobody has been rude to her since.","on cold nights the tide gates make a sound like someone clearing their throat.","scrap that goes in the furnace sometimes comes out as a different scrap."]
};
/* a place with a menu in a district, picked by a number so the same day gives the same one */
function oppPoi(d,h){const a=Object.values(POIS).filter(q=>q.d===d&&MENUS[q.id]&&q.ex!=null);return a.length?a[h%a.length]:null}
/* arriving at an opportunity's goal: check the conditions (time of day, tide, items), then pay out and close it */
function oppArrive(o){
  if(!G.opps||!G.opps.includes(o)||!o.goal)return;
  const g=o.goal;
  if(g.hrs){const h=hourOf();if(!(h>=g.hrs[0]||h<g.hrs[1]))return notify('Too early. This only counts after dark.')}
  if(g.tide&&tideName()!==g.tide)return notify('The water is wrong for it. Come back at low tide.');
  if(g.need)for(const k in g.need)if((G.inv[k]||0)<g.need[k])return notify(`You need ${g.need[k]} ${NAMES[k]||k} for this.`);
  G.opps=G.opps.filter(x=>x!==o);
  if(g.need)for(const k in g.need)G.inv[k]-=g.need[k];
  if(g.cash)G.cash+=g.cash;
  if(g.scrap)G.inv.scrap+=g.scrap;
  if(g.att&&G.npcs[g.att[0]])G.npcs[g.att[0]].m+=g.att[1];
  if(g.rep&&G.rep[g.rep[0]]!=null)G.rep[g.rep[0]]=clamp(G.rep[g.rep[0]]+g.rep[1],-100,100);
  if(g.heat)G.heat+=g.heat;
  if(g.place){if(!G.log)logInit();if(!G.log.places[g.place]){G.log.places[g.place]=1;logSync()}}
  const bits=[g.cash?money(g.cash):'',g.scrap?g.scrap+' scrap':'',g.att?'they will remember it':''].filter(Boolean).join(', ');
  notify(g.done+(bits?` (${bits})`:''),true);
  if(o.kind==='legend'||o.kind==='dare')histAdd('opp:'+o.kind+':'+o.id,g.done,1);
  advance(10);
}
/* called each hour: a taken task whose place you are standing at completes even if you walked there some other way */
function oppGoalCheck(){
  (G.opps||[]).filter(o=>o.taken&&o.goal&&Math.hypot(o.goal.x-G.p.x,o.goal.y-G.p.y)<2.2).forEach(oppArrive);
}

/* each morning: drop what has run out, then add new ones of kinds not already showing until there are three; kinds that showed yesterday wait a day if anything else can fill the slot */
function oppsDaily(){
  G.opps=(G.opps||[]).filter(o=>o.until>=day());G.oppId=G.oppId||0;
  const prev=G.oppPrev||[];
  if(!G.flags||!G.flags.onboarded)return;
  const kinds=Object.keys(OPP_GEN),start=hash(day(),3)%kinds.length,todays=[];
  for(const pass of [0,1])for(let i=0;i<kinds.length&&G.opps.length<OPP_MAX;i++){
    const k=kinds[(start+i)%kinds.length];if(G.opps.some(o=>o.kind===k)||(pass===0&&prev.includes(k)))continue;
    const g=OPP_GEN[k]();if(!g)continue;
    G.oppId++;G.opps.push({id:G.oppId,kind:k,day:day(),until:day()+OPP_LIFE,dist:g.dist,t:g.t,act:g.act,...(g.goal?{goal:g.goal}:{})});todays.push(k);
  }
  G.oppPrev=todays;
}
function oppAct(o){
  closeMenu();const a=o.act;
  if(o.goal){o.taken=true;return walkTo(a.x,a.y,()=>oppArrive(o))} /* a task stays on the list until you finish it or it runs out */
  G.opps=G.opps.filter(x=>x!==o);
  if(a.type==='walk')return walkTo(a.x,a.y);
  if(a.type==='talk'){const n=NPC[a.id];return n?goTalk(n):undefined}
  if(a.type==='bag')return bag('','standing');
}
const oppUnread=()=>(G.opps||[]).filter(o=>o.id>(G.oppSeen||0)).length;
