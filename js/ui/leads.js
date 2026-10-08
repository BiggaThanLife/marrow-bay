"use strict";
/* Leads: a short, optional list of things worth trying, so the first hour has a direction. Nothing here is required and nothing is saved
   except which lead the player has already seen. Each lead completes by itself when the game state shows it is done, and the list
   retires once every lead is done. Phone > Leads shows them all; a one-line reminder on the map shows the next one (Settings can hide it). */
const LEADS=[
  {id:'meet',t:'Talk to someone',b:'Tap a person on the map and choose Chat. People remember who was kind.',done:()=>Object.keys(G.met).length>=1},
  {id:'enter',t:'Walk into a building',b:'Tap any building. You walk to its door and go in. Shops, work and news all start there.',done:()=>Object.values(G.engage||{}).some(v=>v>0)},
  {id:'money',t:'Make your first $100',b:'Work a shift, fish from the pier, farm a Greenbelt plot or busk on the Plaza. Cash shows on the top bar.',done:()=>G.cash>=100||G.biz.length>0||(G.dirty||0)>0},
  {id:'friend',t:'Win someone over',b:'Chat once a day and give a meal now and then. A friendly shop owner will sell you their shop, and a friend will come along.',done:()=>NPCS.some(n=>npcS(n).m>=12)},
  {id:'own',t:'Save up for a building',b:'Tap a building marked FOR SALE. Greenbelt lots are the cheapest. Open Biz to see what you own.',done:()=>G.biz.length>0},
  {id:'fit',t:'Set up your business',b:'Open your building from Biz, pick a business, hire staff and keep it stocked. Then collect the till.',done:()=>G.biz.some(b=>b.type&&b.type!=='home')}
];
const leadNext=()=>G&&LEADS.find(l=>!l.done());
const leadUnseen=()=>{const n=leadNext();return !!n&&(G.leadSeen||'')!==n.id};
function leadsMenu(){
  const n=leadNext();if(n)G.leadSeen=n.id;
  const rows=LEADS.map(l=>{const d=l.done();return `<p class="${d?'muted':''}" style="margin:8px 0"><b>${d?'\u2713 ':''}${esc(l.t)}</b>${d?'':`<br><span class="small">${esc(l.b)}</span>`}</p>`}).join('');
  ui(`<h2>Leads</h2><p class="muted">Ideas, not orders. They tick off by themselves.</p>${n?'':'<p class="amber">That is every lead. The city is yours.</p>'}${rows}`,[
    {label:`Next-lead line on the map: ${SET.leadLine===false?'Off':'On'}`,sub:'Tap to switch',cls:'',fn:()=>{SET.leadLine=SET.leadLine===false;saveSettings();sfx('open');leadsMenu()}},
    {label:'Back',cls:'quiet',fn:()=>phone()}]);
}
