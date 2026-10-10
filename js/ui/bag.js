"use strict";
/* The Bag, in four tabs, and the town board. Carry is a grid of pixel icons (tap one to see what it is and what it is worth), Eat and use lists what you can use right now,
   You has who you are and your bills and clothes, and Standing has your standing in each district, your police file and what people are saying. */
/* ================= BAG / TOWN / BIZ OVERVIEW / GO ================= */
const BAG_OUT='#171a21';
/* 8x8 shapes: o outline, 1 main colour, 2 second colour, w highlight, . nothing */
const BAG_SHAPES={
  round:['...2o...','..oo2o..','.o1111o.','o11w111o','o111111o','o111111o','.o1111o.','..oooo..'],
  leaf:['.....oo.','....o11o','...o1w1o','..o111o.','.o111o2.','o111o.2.','o11o..2.','.oo...2.'],
  bottle:['...oo...','...o2o..','..o11o..','.o1w11o.','.o1111o.','.o1111o.','.o1111o.','..oooo..'],
  can:['.oooooo.','o2wwww2o','o111111o','o1w1111o','o111111o','o111111o','o222222o','.oooooo.'],
  bag:['o2o2o2o2','o111111o','o1w1111o','o111111o','o1ww111o','o111111o','o111111o','oooooooo'],
  bowl:['..1.1...','.1w11.1.','oooooooo','o222222o','o222222o','.o2222o.','..oooo..','........'],
  pie:['..oooo..','.o1111o.','o1w1111o','o111111o','o222222o','o2o2o2o.','.oooooo.','........'],
  fish:['........','..oooo.o','.o1111oo','o1w11o1o','o111111o','.o1111oo','..oooo.o','........'],
  cog:['...oo...','.o.11.o.','o.o11o.o','.o1111o.','o1o11o1o','.o1111o.','..o11o..','...oo...'],
  star:['...oo...','...11...','o111111o','.o1ww1o.','..o11o..','.o1oo1o.','.o1..1o.','..o..o..'],
  box:['.......2','......2.','.oooooo.','o111111o','o1w1111o','o111111o','o222222o','.oooooo.'],
  plaque:['oooooooo','o111111o','o1wwww1o','o122221o','o122221o','o111111o','oooooooo','........'],
  card:['........','oooooooo','o1o11o1o','o11oo11o','o111111o','o111111o','oooooooo','........'],
  flower:['...oo...','..o11o..','.o1w21o.','..o11o..','...22...','..2.2...','...2....','...2....'],
  cup:['..2..2..','.2..2...','oooooo..','o1111oo.','o1w11o.o','o1111oo.','.o11o...','..oo....'],
  shoe:['........','..oo....','..o1o...','..o1o...','.o11ooo.','.o11111o','oooooooo','........'],
  umbrella:['...oo...','.oo11oo.','o11w111o','o1o11o1o','...2....','...2....','...2.2..','....22..'],
  glove:['.o.o.o..','o1o1o1o.','o111111o','o111111o','.o1111o.','.o1111o.','..o22o..','..oooo..'],
  toolbox:['..oooo..','..o..o..','oooooooo','o111111o','o1w11w1o','o222222o','o111111o','oooooooo'],
  pill:['......oo','....o11o','...o1w1o','..o221o.','.o22o.o.','o22o....','.oo.....','........'],
  sandwich:['..oooo..','.o1111o.','oooooooo','o222222o','o2w2222o','oooooooo','.o1111o.','..oooo..'],
  candy:['........','o.oooo.o','oo1111oo','o.1w11.o','o.1111.o','oo1111oo','o.oooo.o','........'],
  coin:['..oooo..','.o1111o.','o1w1111o','o111121o','o111221o','o111111o','.o1111o.','..oooo..']
};
/* what each thing looks like: [shape, main colour, second colour] */
const BAG_ICON={
  crops:['leaf','#6fbf5a','#3f7a30'],radish:['round','#d86a8a','#4f9a4a'],tomato:['round','#d94a3a','#3f7a30'],pumpkin:['round','#e0891e','#4f7a30'],
  salad:['bowl','#7fc060','#e8e0c0'],soup:['bowl','#d9553a','#e8e0c0'],pie:['pie','#e0a040','#a86a30'],
  meals:['bowl','#c98a4a','#e8e0c0'],fish:['fish','#7ab0d0','#3a6a8a'],smoked:['fish','#c08a50','#7a5230'],scrap:['cog','#8a9098','#5f6770'],trinkets:['star','#e0c040','#a08020'],
  seeds:['bag','#e8dcc0','#6fbf5a'],seedRadish:['bag','#e8dcc0','#d86a8a'],seedTomato:['bag','#e8dcc0','#d94a3a'],seedPumpkin:['bag','#e8dcc0','#e0891e'],
  loot:['bag','#7a5a8a','#4a3a5a'],parts:['cog','#c0a060','#8a7040'],jammers:['box','#5a6a8a','#3a4a6a'],candy:['candy','#e87aa0','#ffffff'],plaque:['plaque','#c0a060','#6a5030'],
  water:['bottle','#9ad0e8','#ffffff'],coffee:['cup','#8a5a3a','#ffffff'],energy:['can','#4fd1b5','#2a8a78'],chips:['bag','#e0b040','#c24a3a'],candybar:['candy','#a0603a','#e0b040'],
  sandwich:['sandwich','#e0c080','#6fbf5a'],painkillers:['pill','#e8e4d6','#d94a3a'],sneakers:['shoe','#d94a3a','#ffffff'],umbrella:['umbrella','#3a7ab8','#5a5a60'],
  card:['card','#f4efe2','#d94a3a'],flowers:['flower','#e87aa0','#4f9a4a'],wine:['bottle','#7a2a4a','#4a1a2a'],gloves:['glove','#c0884a','#8a5a2a'],toolkit:['toolbox','#c24a3a','#7a2a1a']
};
const BAG_INFO={
  crops:'Plain crops from your plots. Cook them, eat them, or sell them at the market.',meals:'A packed meal. Eat it or sell it.',fish:'Fresh fish. Smoke it, put it in a stew or sell it.',
  smoked:'Smoked fish keeps and sells for more.',scrap:'Scrap from the flats. Feeds a workshop or makes trinkets.',trinkets:'Made from scrap. Some people will pay well for them.',
  seeds:'Mixed greens seeds. Plant them in a plot or Greenhouse.',loot:'Hot goods. They need a fence.',parts:'Parts for building jammers.',jammers:'A FLACK jammer. It blinds a camera.',
  candy:'Chalky candy. It clears a little heat and fixes nothing.',plaque:'A commemorative plaque. Place one in a district for standing.'
};
const BAG_WORTH={crops:6,radish:3,tomato:9,pumpkin:26,salad:22,soup:25,pie:26,meals:14,fish:9,smoked:18,trinkets:26,scrap:4};
function bagIcon(id,px){
  const ic=BAG_ICON[id]||['coin','#c0a060','#6a5030'],rows=BAG_SHAPES[ic[0]],col={o:BAG_OUT,'1':ic[1],'2':ic[2],w:'#ffffff'};
  let r='';rows.forEach((row,y)=>{for(let x=0;x<8;x++){const c=row[x];if(c!=='.')r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${col[c]}"${c==='w'?' fill-opacity=".7"':''}/>`}});
  return `<svg viewBox="0 0 8 8" width="${px||40}" height="${px||40}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}
/* everything you are carrying, as {id,name,count,info,worth,own} */
function bagThings(){
  const out=[];
  Object.keys(NAMES).forEach(k=>{
    const n=G.inv[k]||0;if(n<=0)return;
    let info=BAG_INFO[k]||'',name=NAMES[k];
    const cs=Object.values(CROPS).find(c=>c.seedKey===k),cr=Object.values(CROPS).find(c=>c.key===k);
    if(cs&&!info)info=`${cs.n} seeds. Ready in ${cs.days} day${cs.days>1?'s':''}.`;
    if(cr&&!info)info=`${cr.n}. Eat it for ${cr.eat} fullness or sell it.`;
    const dish=Object.values(DISHES).find(d=>d.key===k);if(dish)info=`Cooked at home. ${dish.fill} fullness, or sell it.`;
    out.push({id:k,name:name.charAt(0).toUpperCase()+name.slice(1),count:n,info,worth:BAG_WORTH[k]});
  });
  Object.keys(GOODS).forEach(id=>{
    const g=GOODS[id];
    if(g.fx){if(goodOwned(id))out.push({id,name:g.n,count:0,own:true,info:g.d});return}
    if(itemCount(id)>0)out.push({id,name:g.n,count:itemCount(id),info:g.d});
  });
  return out;
}
/* what you can do with things right now */
function bagActions(){
  const a=[],eat=(id,label,fill,extra)=>a.push({id,label,sub:`Restores ${fill} fullness`,fn:()=>{G.inv[id]--;G.hunger=clamp(G.hunger+fill,0,100);if(extra)advance(15,false,true);hud();bag('',bagTab,bagSel)}});
  if(G.inv.meals>0)eat('meals','Eat a meal',45,true);
  if(G.inv.smoked>0)eat('smoked','Eat smoked fish',35);
  if(G.inv.crops>0)eat('crops','Eat raw crops',12);
  Object.values(DISHES).forEach(d=>{if(G.inv[d.key]>0)eat(d.key,`Eat ${d.n.toLowerCase()}`,d.fill)});
  ['radish','tomato','pumpkin'].forEach(id=>{const c=CROPS[id];if(G.inv[c.key]>0)eat(c.key,`Eat a ${c.one}`,c.eat)});
  if(G.inv.candy>0)a.push({id:'candy',label:'Eat thoughts and prayers candy',sub:'Chalky. Clears a little heat, fixes nothing',fn:eatCandy});
  if(G.inv.plaque>0)a.push({id:'plaque',label:'Place a commemorative plaque',sub:`You have ${G.inv.plaque}`,fn:()=>plaqueMenu()});
  usableItems().forEach(id=>a.push({id,label:`Use ${GOODS[id].n.toLowerCase()}`,sub:`${GOODS[id].d} You have ${itemCount(id)}.`,fn:()=>{useItem(id);bag('',bagTab,bagSel)}}));
  return a;
}
let bagTab='carry',bagSel=null;
const BAG_TABS=[['carry','Carry'],['use','Eat and use'],['you','You'],['standing','Standing']];
function bag(msg,tab,sel){
  tab=tab||'carry';bagTab=tab;bagSel=sel!==undefined?sel:(tab==='carry'?bagSel:null);
  const b=BG[G.bg],tg=tagsNow(),hp=homePoi(),acts=bagActions();
  const tabs=`<div class="bagtabs">${BAG_TABS.map(([id,n])=>`<button type="button" class="bagtab${id===tab?' on':''}" data-tab="${id}">${n}</button>`).join('')}</div>`;
  const alerts=`${G.debt>0?`<p class="bad">Bank debt: ${money(G.debt)}</p>`:''}${G.arrears>0?`<p class="bad">Bills owed: ${money(G.arrears)}</p>`:''}`;
  const btns=[];let body='';
  if(tab==='carry'){
    const things=bagThings(),cur=things.find(t=>t.id===bagSel)||null;
    body=things.length?`<div class="bagrid">${things.map(t=>`<button type="button" class="bagcell${cur&&cur.id===t.id?' on':''}" data-sel="${esc(t.id)}">${bagIcon(t.id)}${t.own?'<b>owned</b>':`<b>${t.count}</b>`}<span>${esc(t.name)}</span></button>`).join('')}</div>`:'<p class="muted">Your bag is empty. Plots, the flats and the shops will fill it.</p>';
    if(cur){
      body=`<div class="bagdetail"><h3>${esc(cur.name)}${cur.own?'':' x'+cur.count}</h3><p>${esc(cur.info||'')}</p>${cur.worth?`<p class="muted small">Sells for about ${money(cur.worth)} at the market.</p>`:''}</div>`+body;
      const act=acts.find(x=>x.id===cur.id);if(act)btns.push({label:act.label,sub:act.sub,cls:'primary',fn:act.fn});
    }else if(things.length)body+='<p class="muted small">Tap something to see what it is.</p>';
    if(!btns.length)btns.push({label:'Close',cls:'primary',keep:true,fn:closeMenu});else btns.push({label:'Close',cls:'quiet',keep:true,fn:closeMenu});
  }else if(tab==='use'){
    body=`<div class="kv"><div><span>Energy</span><b>${Math.round(G.energy)}</b></div><div><span>Fullness</span><b>${Math.round(G.hunger)}</b></div></div>${acts.length?'':'<p class="muted">Nothing to eat or use right now.</p>'}`;
    acts.forEach((x,i)=>btns.push({label:x.label,sub:x.sub,cls:i?'':'primary',fn:x.fn}));
    btns.push({label:'Wait one hour',cls:acts.length?'':'primary',fn:()=>{advance(60);bag('',tab)}},{label:'Close',cls:'quiet',keep:true,fn:closeMenu});
  }else if(tab==='you'){
    body=`<p class="muted">${esc(b.n)}. ${G.quirk?esc(QUIRKS[G.quirk].n)+'. ':''}Day ${day()}.</p><div class="kv"><div><span>Home</span><b>${esc(hp.name)}</b></div><div><span>Monthly bill</span><b>${money(homeBill())}</b></div></div><p><b>How people see you:</b> ${tg.map(esc).join(', ')}</p>`;
    btns.push({label:'Wardrobe',sub:'Change into clothes you own',cls:'primary',fn:()=>wardrobeMenu(()=>bag('',tab))},{label:'Close',cls:'quiet',keep:true,fn:closeMenu},
      {label:'Quit to title',cls:'quiet',fn:()=>ask('Quit to title?','Your game is saved automatically.','Quit',()=>{save();title()},()=>bag('',tab))});
  }else{
    const st=Object.keys(G.rep).map(d=>`<div><span>${d}</span><b>${standing(G.rep[d])}</b></div>`).join('');
    const rum=G.rumors.map(r=>`<p>${esc(RUM[r.type].t)} <span class="muted">${r.knows.length} of ${NPCS.length} have heard.</span></p>`).join('')||'<p class="muted">Nobody is talking about you yet.</p>';
    body=`<div class="kv">${st}${dirtyRows()}</div><h3>What people say</h3>${rum}`;
    btns.push({label:'Town board',sub:'Conditions, rumors, projects',cls:'',fn:town},{label:'Close',cls:'quiet',keep:true,fn:closeMenu});
  }
  ui(`<h2>${esc(G.name)}</h2>${msgP(msg)}${alerts}${tabs}${body}`,btns);
  document.querySelectorAll('.bagtab').forEach(el=>el.addEventListener('click',()=>bag('',el.dataset.tab,null)));
  document.querySelectorAll('.bagcell').forEach(el=>el.addEventListener('click',()=>bag('','carry',bagSel===el.dataset.sel?null:el.dataset.sel)));
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
