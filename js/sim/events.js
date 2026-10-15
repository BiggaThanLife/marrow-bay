"use strict";
/* Running events, bridge, modifiers, news. */
function setBridge(closed){
  [17,27].forEach(y=>{for(let x=41;x<=44;x++)map[y][x]=closed?T.WATER:T.ROAD});
  if(closed&&G){
    const fix=e=>{if(e.x>=40.6&&e.x<=44.4&&(Math.abs(e.y-17)<1.6||Math.abs(e.y-27)<1.6)){e.x=e.x<42.5?40:45;e.y=Math.round(e.y)}};
    fix(G.p);G.p.path=[];NPCS.forEach(n=>{fix(n);n.path=[]});
  }
}
/* The low-tide walkway: the river mouth at the south end of the docks (x 41 to 44, y 33) dries out when the tide is well down, joining the two quays. Opens below -0.5, closes above -0.3, so spring tides keep it open longer. Derived from the tide each call, nothing is saved. */
const FLAT_X=[41,42,43,44],FLAT_Y=33;
let flatsOpen=false,flatsWarned=false;
const onFlatBand=e=>e.x>=40.6&&e.x<=44.4&&Math.abs(e.y-FLAT_Y)<1.6;
function applyFlatsWalk(){
  const v=tideV(),want=flatsOpen?v<-.3:v<-.5;
  if(want!==flatsOpen){
    flatsOpen=want;FLAT_X.forEach(x=>{map[FLAT_Y][x]=want?T.FLAT:T.WATER});
    if(want&&G&&Math.hypot(G.p.x-42.5,G.p.y-FLAT_Y)<12)notify('The tide is out. A walkway of mud and sand shows across the river mouth.');
    if(!want&&G&&G.p.path&&G.p.path.some(q=>q[1]===FLAT_Y&&q[0]>=41&&q[0]<=44)){G.p.path=[];G.p.onArrive=null}
    flatsWarned=false;
  }
  if(!G)return;
  if(flatsOpen&&v>-.4&&!flatsWarned&&onFlatBand(G.p)){flatsWarned=true;notify('The water is creeping back over the flats. Move!')}
  if(!flatsOpen){
    const fix=e=>{if(onFlatBand(e)){e.x=e.x<42.5?40:45;e.y=FLAT_Y;e.path=[]}};
    if(onFlatBand(G.p)){fix(G.p);G.p.onArrive=null;notify('The tide comes in and you wade back to dry ground.')}
    NPCS.forEach(fix);
  }
}
function applyBridge(c){if(c===bridgeOn)return;bridgeOn=c;setBridge(c)}
function recomputeMods(){
  const m={traffic:{},sell:1,crops:1,meal:1,fish:1,drain:1,vspeed:1,flood:[],tram:false,closed:[],cops:false,heist:0,bills:1,growth:0,yield:1,bridge:false,busk:1,names:{}};
  G.evs.forEach(e=>{
    const x=e.mod||{};
    for(const k in x){
      if(k==='traffic'){for(const d in x.traffic)m.traffic[d]=(m.traffic[d]||1)*x.traffic[d]}
      else if(['sell','crops','meal','fish','drain','vspeed','bills','yield','busk'].includes(k))m[k]*=x[k];
      else if(k==='heist'||k==='growth')m[k]+=x[k];
      else if(k==='flood'||k==='closed'){x[k].forEach(v=>{if(!m[k].includes(v))m[k].push(v);if(k==='closed')m.names[v]=e.name})}
      else if(x[k]===true)m[k]=true;
    }
  });
  const sI=seasonIdx();
  if(sI===1)m.yield*=1.1;else if(sI===3){m.yield*=.75;m.drain*=1.1;m.fish*=1.1}
  if(fact('greenbelt_sold'))m.yield*=.85;
  if(fact('buyout_compromise'))m.yield*=.95;
  if(fact('coop_owned'))m.yield*=1.1;
  if(G.companion==='wren')m.yield*=1.1;
  if(G.companion==='bell')m.drain*=.9;
  if(fact('foundry_coverup'))m.yield*=.95;
  G.mod=m;applyBridge(m.bridge);
}
function startEvent(t){
  const o=t.mk(),dur=ri(t.dur[0],t.dur[1]);
  G.evs.push({id:t.id,sev:t.sev,name:o.name,desc:o.desc,mod:o.mod||{},until:day()+dur});
  if(t.sev>=4)histAdd('ev:'+t.id,`Lived through: ${o.name}. HARBOR has you down as "present."`,10);
  recomputeMods();
  let extra='';
  if(o.start){const r=o.start();if(r)extra=r}
  if(t.id==='surge'||t.id==='flood'){const r=surgeRepairs(t.id==='flood'?['Dockside','Foundry Row']:['Dockside'],t.id==='flood'?.05:.03);if(r)extra=(extra?extra+' ':'')+r}
  if(o.follow&&Math.random()<o.follow[1])G.queue.push({id:o.follow[0],on:day()+1});
  news(`${SEVN[t.sev]}: ${o.name}. ${o.desc}${extra?' '+extra:''}`,t.sev);
  if(t.sev>=3)quip('disaster');
  if(t.sev>=3)alertQ.push({sev:t.sev,name:o.name,desc:o.desc,extra});
  else notify(`${o.name}. ${o.desc}`);
}
function rollEvent(){
  if(G.evs.length>=3||Math.random()>.55)return;
  const k=1+day()/60;
  /* the sea only floods the city on a spring tide: much likelier then (most of all with high water around dawn), rare otherwise */
  const seaMul=tideCycle()==='spring'?(tideV(G.t+180)>.45?6:3):.15;
  const pool=EVT.filter(t=>!G.evs.some(e=>e.id===t.id)).map(t=>({t,w:t.w*(t.sev>=4?k:1)*(t.id==='surge'||t.id==='flood'?seaMul:1)}));
  const tot=pool.reduce((s,x)=>s+x.w,0);let r=Math.random()*tot;
  for(const x of pool){r-=x.w;if(r<=0){startEvent(x.t);return}}
}
function dayNews(){
  if(G.ev)news(`${G.ev.name}. ${G.ev.desc}`,2);
  G.evs=G.evs.filter(e=>{if(day()>=e.until){news(`${e.name} is over.`,1);return false}return true});
  G.queue=G.queue.filter(q=>{
    if(day()>=q.on){const t=EVT.find(x=>x.id===q.id);if(t&&!G.evs.some(e=>e.id===t.id))startEvent(t);return false}
    return true;
  });
  rollEvent();
  recomputeMods();
  ambientNews();
}
function ambientNews(){
  const c=[`Tide table: ${tideName()} tide this morning.`,`Diner meals are ${money(mealPrice())} today.`];
  if(G.fishStock<35)c.push('Fishmongers report thin catches across the Dockside.');
  if(G.fishStock>70)c.push('Fish are plentiful and cheap at the piers.');
  if(G.heat>=2)c.push('Police are said to be hunting someone across the city.');
  const open=G.projects.filter(p=>!p.done);
  if(open.length){const p=pick(open),d=PROJECTS.find(x=>x.id===p.id);c.push(`${d.name} is ${projPct(p)}% funded.`)}
  news(pick(c),1);
}
function showAlert(){
  const a=alertQ.shift();
  popup(`${SEVN[a.sev]}: ${a.name}`,a.desc,a.extra);
}
