"use strict";
/* Entering buildings, shared menu helpers, MENUS registry. */
/* ================= POI MENUS ================= */
function refuse(poi,n){
  const neg=tagsNow().filter(t=>(n.aff[t]||0)<0);
  ui(`<h2>${esc(poi.name)}</h2><p>${esc(n.name)} will not deal with you.${neg.length?` They hold "${neg.map(esc).join('", "')}" against you.`:''}</p>
  <p class="muted">Build standing in ${n.d}, or earn their trust with gifts and good deeds. Rumors count too.</p>`,[leaveBtn]);
}
function openPOI(poi){
  const n=OWNER[poi.id]?NPC[OWNER[poi.id]]:null;
  if(n&&!G.met[n.id])G.met[n.id]=day();
  if(poi.id!==G.home&&G.mod.closed.includes(poi.id))return ui(`<h2>${esc(poi.name)}</h2><p>Closed: ${esc(G.mod.names[poi.id])}.</p>`,[leaveBtn]);
  if(poi.id!==G.home&&!isOpen(poi.id))return ui(`<h2>${esc(poi.name)}</h2><p>Closed. Opens at ${fmtHr(OPEN[poi.id][0])}.</p>`,[leaveBtn]);
  if(n&&poi.id!==G.home&&tier(att(n))===0)return refuse(poi,n);
  engageAdd(poi.d,1);
  if(arcHook(poi))return;
  (MENUS[poi.id]||info)(poi,n);
}
function info(poi){ui(`<h2>${esc(poi.name)}</h2><p>Residents live here. Nobody answers the door.</p>`,[leaveBtn])}
function gig(n,{hrs,base,mult=1,rep,label}){
  if(G.energy<hrs*7)return `You are too tired for ${hrs} hours of work.`;
  engageAdd(rep,2);
  const pay=Math.round(base*mult*(n?payF(n):1)*(G.quirk==='iron-stomach'?.95:1));
  G.cash+=pay;advance(hrs*60);G.energy=clamp(G.energy-hrs*4,0,100);
  G.rep[rep]=clamp(G.rep[rep]+1,-100,100);
  return `You worked ${label} for ${hrs} hours and earned ${money(pay)}.`;
}
function sellScreen(mult,title,back,msg){
  const base={crops:6,meals:14,fish:9,smoked:18,trinkets:26,scrap:4},ev=G.ev&&G.ev.id;
  const pr=k=>{let v=base[k]*mult*G.mod.sell;if(k==='crops'){if(ev==='glut')v*=.6;v*=G.mod.crops}if(k==='fish')v*=fishMod()*(ev==='strike'?1.3:1);if(k==='smoked')v*=Math.min(1.5,fishMod());if(k==='scrap')v*=scrapMod();return Math.max(1,Math.round(v))};
  const items=Object.keys(base).filter(k=>G.inv[k]>0);
  ui(`<h2>${esc(title)}</h2>${msgP(msg)}${items.length?'':'<p>You have nothing to sell.</p>'}<p class="muted small">Prices move with harvests, strikes, and how much the city has fished or scavenged.</p>`,
    [...items.flatMap(k=>[{label:`Sell some ${NAMES[k]}`,sub:`${money(pr(k))} each. Choose how many.`,cls:'',fn:()=>qtyMenu({title:`Sell ${NAMES[k]}`,intro:'',price:pr(k),max:G.inv[k],mode:'sell',onConfirm:q=>{G.cash+=Math.round(pr(k)*q);G.inv[k]-=q;advance(10);return `Sold ${q} for ${money(Math.round(pr(k)*q))}.`},back:m=>sellScreen(mult,title,back,m)})},{label:`Sell all ${NAMES[k]} (${G.inv[k]})`,sub:`${money(pr(k))} each, ${money(pr(k)*G.inv[k])} total`,fn:()=>{
      const tot=pr(k)*G.inv[k];G.cash+=tot;G.inv[k]=0;advance(10);sellScreen(mult,title,back,`Sold for ${money(tot)}.`)}}]),
     {label:'Back',cls:'quiet',fn:back}]);
}
const MENUS={};
