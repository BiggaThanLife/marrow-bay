"use strict";
/* Helpers used by story threads. */
/* ================= PERSONAL STORY THREADS ================= */
const repAdd=(d,n)=>{G.rep[d]=clamp(G.rep[d]+n,-100,100)};
const memAdd=(id,n)=>{npcS(NPC[id]).m+=n};
const heatAdd=n=>{G.heat=Math.min(5,G.heat+n)};
const bizPlain=()=>G.biz.filter(b=>b.type&&b.type!=='home'&&b.type!=='rental'&&b.type!=='farm');
function seizeProperty(){
  if(G.biz.length){const b=G.biz.slice().sort((a,c)=>a.price-c.price)[0];G.biz=G.biz.filter(x=>x!==b);if(G.home==='B:'+b.key)G.home='bunk';return `The bank seizes your ${b.type?BT[b.type].n.toLowerCase():'building'} in the ${b.d}.`}
  const s=G.structs.find(x=>x.type!=='house')||G.structs[0];
  if(s){G.structs=G.structs.filter(x=>x!==s);if(G.home==='S:'+s.id)G.home='bunk';return `They take your ${STRUCTS[s.type].n.toLowerCase()}.`}
  const lost=Math.round(G.cash*.4);G.cash-=lost;return `They take ${money(lost)} from you instead.`;
}
RUM.informant={d:-18,t:'They say you talk to the Constable.'};
const fmt=(th,s)=>s.replace(/\{(\w+)\}/g,(m,k)=>k==='name'?G.name:(th.roles[k]||m));
