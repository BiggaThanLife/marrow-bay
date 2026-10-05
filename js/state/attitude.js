"use strict";
/* Player tags, NPC attitude, price factors, opening rules. */
function tagsNow(){
  const t=[...BG[G.bg].tags];
  if(G.debt>0||G.arrears>0)t.push('in-debt');
  if(known('thief')>=3)t.push('known-thief');
  if(G.structs.some(s=>s.type==='stall')||G.biz.some(b=>b.type&&b.type!=='home'&&b.type!=='rental'))t.push('shopkeeper');
  if(G.structs.length||G.biz.length||Object.keys(G.owned).length)t.push('landowner');
  if(G.biz.some(b=>b.workers.length))t.push('employer');
  if(known('generous')>=3)t.push('local-hero');
  if(G.quirk)t.push(G.quirk);
  return t;
}
const has=t=>tagsNow().includes(t);
const rumorDelta=n=>G.rumors.reduce((s,r)=>s+(r.knows.includes(n.id)?RUM[r.type].d*r.str/100:0),0);
const att=n=>{let a=0;for(const t of tagsNow())a+=n.aff[t]||0;return a+G.rep[n.d]*.35+npcS(n).m+rumorDelta(n)};
const tier=a=>a<-30?0:a<0?1:a<30?2:3;
const LAB=['hostile','cold','neutral','warm'];
const buyF=n=>[9,1.2,1,.9][tier(att(n))]*(has('smooth')?.92:1)*(G.quirk==='frugal'?.95:1);
const sellF=n=>[0,.85,1,1.1][tier(att(n))]*(G.quirk==='frugal'?.95:1);
const payF=n=>[0,.85,1,1.15][tier(att(n))];
const standing=v=>v<-30?'despised':v<-10?'distrusted':v<10?'unknown':v<30?'respected':'admired';
const isOpen=id=>{if(G.mod&&G.mod.closed.includes(id))return false;const o=OPEN[id];if(!o)return true;const h=hourOf();return(h>=o[0]&&h<o[1])||h<o[1]-24};
const fmtHr=h=>{h%=24;return (h%12||12)+(h<12?' am':' pm')};
const mealPrice=()=>Math.round(9*(1+Math.min(.6,G.demand*.05))*G.mod.meal);
const fishMod=()=>clamp(1+(50-G.fishStock)/80,.6,1.8)*G.mod.fish;
const scrapMod=()=>clamp(1+(60-G.flats)/60,.7,2);
const structAt=(x,y)=>G.structs.find(s=>s.x===x&&s.y===y);
const signNear=st=>G.structs.some(s=>s.type==='sign'&&Math.hypot(s.x-st.x,s.y-st.y)<=5);
