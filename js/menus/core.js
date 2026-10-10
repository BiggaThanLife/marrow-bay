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
  if(poi.id==='foundry'&&fact('foundry_closed'))return ui(`<h2>${esc(poi.name)}</h2><p>Boarded up. A sign says CLOSED PENDING INQUIRY. Someone has added a second sign that says FOREVER.</p>`,[leaveBtn]);
  if(poi.id!==G.home&&!isOpen(poi.id))return ui(`<h2>${esc(poi.name)}</h2><p>Closed. Opens at ${fmtHr(OPEN[poi.id][0])}.</p>`,[leaveBtn]);
  if(n&&poi.id!==G.home&&tier(att(n))===0&&!OPEN_TO_ALL.includes(poi.id))return refuse(poi,n);
  if(poi.id!==G.home&&lawLocked(poi.id))return ui(`<h2>${esc(poi.name)}</h2><p>${n?esc(n.name.split(' ')[0]):'The doorman'} will not see you. Your name is on a list.</p><p class="muted">The records office at City Hall can help, for a price or some honest work.</p>`,[leaveBtn]);
  engageAdd(poi.d,1);
  if(arcHook(poi))return;
  (MENUS[poi.id]||info)(poi,n);
}
function info(poi){ui(`<h2>${esc(poi.name)}</h2><p>Residents live here. Nobody answers the door.</p>`,[leaveBtn])}
function gig(n,{hrs,base,mult=1,rep,label}){
  if(G.energy<hrs*7)return `You are too tired for ${hrs} hours of work.`;
  engageAdd(rep,2);
  const pay=Math.round(base*mult*(G.fx.gloves?1.1:1)*(n?payF(n):1)*(G.quirk==='iron-stomach'?.95:1));
  G.cash+=pay;advance(hrs*60);G.energy=clamp(G.energy-hrs*4,0,100);
  G.rep[rep]=clamp(G.rep[rep]+1,-100,100);
  return `You worked ${label} for ${hrs} hours and earned ${money(pay)}.`;
}
function sellScreen(mult,title,back,msg){
  const base={crops:6,radish:3,tomato:9,pumpkin:26,salad:22,soup:25,pie:26,meals:14,fish:9,smoked:18,trinkets:26,scrap:4},ev=G.ev&&G.ev.id;
  const pr=k=>{let v=base[k]*mult*G.mod.sell*(G.companion==='mina'?1.04:1)*(1-rumorPriceBias('mina'));if(CROP_KEYS.includes(k)){if(ev==='glut')v*=.6;v*=G.mod.crops}if(k==='fish')v*=fishMod()*(ev==='strike'?1.3:1);if(k==='smoked')v*=Math.min(1.5,fishMod());if(k==='scrap')v*=scrapMod();return Math.max(1,Math.round(v))};
  const items=Object.keys(base).filter(k=>G.inv[k]>0);
  const sell=(k,q)=>{const t=saleTotal(k,pr(k),q);G.cash+=t;G.inv[k]-=q;satSold(k,q);advance(10);return t};
  ui(`<h2>${esc(title)}</h2>${msgP(msg)}${items.length?'':'<p>You have nothing to sell.</p>'}<p class="muted small">Prices move with harvests, strikes, and how much the city has fished or scavenged. Selling a lot of one thing at once drives its price down; it recovers over the day.</p>`,
    [...items.flatMap(k=>[{label:`Sell some ${NAMES[k]}`,sub:`${money(Math.max(1,Math.round(pr(k)*satMul(k))))} each now.${satNote(k)} Choose how many.`,cls:'',fn:()=>qtyMenu({title:`Sell ${NAMES[k]}`,intro:'Each one sold fetches a little less.',price:Math.max(1,Math.round(pr(k)*satMul(k))),totalFn:q=>saleTotal(k,pr(k),q),max:G.inv[k],mode:'sell',onConfirm:q=>{const t=sell(k,q);return `Sold ${q} for ${money(t)}.`},back:m=>sellScreen(mult,title,back,m)})},{label:`Sell all ${NAMES[k]} (${G.inv[k]})`,sub:`${money(saleTotal(k,pr(k),G.inv[k]))} for the lot`,cls:'',fn:()=>{
      const t=sell(k,G.inv[k]);sellScreen(mult,title,back,`Sold for ${money(t)}.`)}}]),
     {label:'Back',cls:'quiet',fn:back}]);
}
const MENUS={};
