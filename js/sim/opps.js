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
    return{dist:n.d,t:`${n.name} ${hungry?'looks hungry':'is short on cash'}. A meal or a bit of work would go a long way, and people remember who helped.`,act:{type:'talk',label:`Find ${n.name.split(' ')[0]}`,id:n.id}};
  }
};
/* each morning: drop what has run out, then add new ones of kinds not already showing until there are three */
function oppsDaily(){
  G.opps=(G.opps||[]).filter(o=>o.until>=day());G.oppId=G.oppId||0;
  if(!G.flags||!G.flags.onboarded)return;
  const kinds=Object.keys(OPP_GEN),start=hash(day(),3)%kinds.length;
  for(let i=0;i<kinds.length&&G.opps.length<OPP_MAX;i++){
    const k=kinds[(start+i)%kinds.length];if(G.opps.some(o=>o.kind===k))continue;
    const g=OPP_GEN[k]();if(!g)continue;
    G.oppId++;G.opps.push({id:G.oppId,kind:k,day:day(),until:day()+OPP_LIFE,dist:g.dist,t:g.t,act:g.act});
  }
}
function oppAct(o){
  G.opps=G.opps.filter(x=>x!==o);closeMenu();
  const a=o.act;
  if(a.type==='walk')return walkTo(a.x,a.y);
  if(a.type==='talk'){const n=NPC[a.id];return n?goTalk(n):undefined}
  if(a.type==='bag')return bag();
}
const oppUnread=()=>(G.opps||[]).filter(o=>o.id>(G.oppSeen||0)).length;
