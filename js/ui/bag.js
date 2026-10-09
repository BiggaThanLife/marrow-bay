"use strict";
/* Bag and town board. */
/* ================= BAG / TOWN / BIZ OVERVIEW / GO ================= */
function bag(msg){
  const b=BG[G.bg],tg=tagsNow();
  const inv=Object.keys(NAMES).filter(k=>!CROP_EXTRA.includes(k)||G.inv[k]>0).map(k=>`<div><span>${NAMES[k]}</span><b>${G.inv[k]}</b></div>`).join('')+Object.keys(GOODS).filter(id=>!GOODS[id].fx&&itemCount(id)>0).map(id=>`<div><span>${GOODS[id].n}</span><b>${itemCount(id)}</b></div>`).join('')+Object.keys(GOODS).filter(id=>goodOwned(id)).map(id=>`<div><span>${GOODS[id].n}</span><b>yes</b></div>`).join('');
  const st=Object.keys(G.rep).map(d=>`<div><span>${d}</span><b>${standing(G.rep[d])}</b></div>`).join('');
  const btns=[];
  if(G.inv.meals>0)btns.push({label:'Eat a meal',sub:'Restores 45 fullness',fn:()=>{G.inv.meals--;G.hunger=clamp(G.hunger+45,0,100);advance(15,false,true);hud();bag()}});
  if(G.inv.smoked>0)btns.push({label:'Eat smoked fish',sub:'Restores 35 fullness',cls:'',fn:()=>{G.inv.smoked--;G.hunger=clamp(G.hunger+35,0,100);hud();bag()}});
  if(G.inv.crops>0)btns.push({label:'Eat raw crops',sub:'Restores 12 fullness',cls:'',fn:()=>{G.inv.crops--;G.hunger=clamp(G.hunger+12,0,100);hud();bag()}});
  ['radish','tomato','pumpkin'].forEach(id=>{const c=CROPS[id];if(G.inv[c.key]>0)btns.push({label:`Eat a ${c.one}`,sub:`Restores ${c.eat} fullness`,cls:'',fn:()=>{G.inv[c.key]--;G.hunger=clamp(G.hunger+c.eat,0,100);hud();bag()}})});
  if(G.inv.candy>0)btns.push({label:'Eat thoughts and prayers candy',sub:'Chalky. Clears a little heat, fixes nothing',cls:'',fn:eatCandy});
  if(G.inv.plaque>0)btns.push({label:'Place a commemorative plaque',sub:`You have ${G.inv.plaque}`,cls:'',fn:()=>plaqueMenu()});
  if(usableItems().length)btns.push({label:'Use an item',sub:usableItems().map(id=>`${GOODS[id].n} ${itemCount(id)}`).join(', '),cls:'',fn:()=>itemsMenu()});
  btns.push({label:'Wait one hour',cls:btns.length?'':'primary',fn:()=>{advance(60);bag()}});
  btns.push({label:'Close',cls:'quiet',fn:closeMenu},{label:'Quit to title',cls:'quiet',fn:()=>ask('Quit to title?','Your game is saved automatically.','Quit',()=>{save();title()},bag)});
  const hp=homePoi();
  btns.splice(btns.length-2,0,{label:'Wardrobe',sub:'Change into clothes you own',cls:'',fn:()=>wardrobeMenu(bag)});
  ui(`<h2>${esc(G.name)}</h2><p class="muted">${esc(b.n)}. ${G.quirk?esc(QUIRKS[G.quirk].n)+'. ':''}Day ${day()}. Home: ${esc(hp.name)}, ${money(homeBill())} a month.</p>${msgP(msg)}
  ${G.debt>0?`<p class="bad">Bank debt: ${money(G.debt)}</p>`:''}${G.arrears>0?`<p class="bad">Bills owed: ${money(G.arrears)}</p>`:''}
  <p><b>How people see you:</b> ${tg.map(esc).join(', ')}</p>
  <h2>Standing</h2><div class="kv">${st}${dirtyRows()}</div><h2>Bag</h2><div class="kv">${inv}</div>`,btns);
}
function town(){
  const lv=(v,lo,hi)=>v<lo?'scarce':v>hi?'plentiful':'steady';
  const evl=G.evs.map(e=>`<p><b>${esc(e.name)}</b> <span class="muted">${Math.max(0,e.until-day())} day(s) left. ${esc(e.desc)}</span></p>`).join('');
  const rum=G.rumors.map(r=>`<p>${esc(RUM[r.type].t)} <span class="muted">${r.knows.length} of ${NPCS.length} have heard.</span></p>`).join('')||'<p class="muted">Nobody is talking about you yet.</p>';
  ui(`<h2>Town</h2><p><b>Today:</b> ${G.ev?esc(G.ev.name+'. '+G.ev.desc):'A quiet day.'}</p>${evl}
  <div class="kv"><div><span>Fish</span><b>${lv(G.fishStock,30,70)}</b></div><div><span>Scrap on the flats</span><b>${lv(G.flats,30,70)}</b></div>
  <div><span>Diner meal</span><b>${money(mealPrice())}</b></div><div><span>Tide</span><b>${tideName()}</b></div></div>
  <h2>Talk of the town</h2>${rum}`,
  [{label:'District projects',sub:'Fund repairs that help a whole district',fn:projects},...keepsakeButtons(town),{label:'Close',cls:'quiet',fn:closeMenu}]);
}
