"use strict";
/* Phone > Bay-Watch Feed. A made-up neighbourhood app and the one place the city talks to the player: HARBOR's pinned suggestions, saved rumor and event posts (js/sim/feed.js), a few petty posts a day and a line on where the patrols are thin. */
function baywatchPosts(){
  const d=day(),out=[],usedC=new Set(),usedD=new Set();
  for(let i=0;i<5;i++){
    /* keep trying until the complaint and the district are both new, so the feed never says the same thing twice */
    let h,c,dist,k=0;
    do{h=hash(d,31+i+k*13)>>>0;c=(h>>>3)%BW_COMPLAINTS.length;dist=DISTS[h%DISTS.length];k++}while((usedC.has(c)||usedD.has(dist))&&k<40);
    usedC.add(c);usedD.add(dist);
    out.push({dist,t:BW_COMPLAINTS[c].replace('{s}',BW_STREETS[(h>>>7)%BW_STREETS.length]).replace('{n}',String(2+(h>>>11)%48)).replace('{d}',dist)});
  }
  return out;
}
function baywatchIntel(){
  const h=hash(day(),77)>>>0,dist=DISTS[h%DISTS.length];
  if(G.mod&&G.mod.cops)return BW_BUSY[h%BW_BUSY.length].replace('{d}',DISTS[(h>>>2)%DISTS.length]);
  if(G.heat>=2)return `Watchers say the constables are chasing someone and have forgotten about ${dist}.`;
  return BW_QUIET[h%BW_QUIET.length].replace('{d}',dist);
}
const feedWhen=d=>{const n=day()-d;return n<=0?'today':n===1?'yesterday':n+' days ago'};
function baywatchMenu(){
  const seen=G.feedSeen||0,sugSeen=G.sugSeen;
  const saved=(G.feed||[]).filter(p=>day()-p.day<=6).slice().reverse().slice(0,12);
  const opps=(G.opps||[]).filter(o=>o.until>=day()),oppSeen=G.oppSeen||0,sug=feedSuggestions(),chat=baywatchPosts().map(p=>({kind:'chatter',dist:p.dist,t:p.t,day:day()}));
  const row=(p,isNew)=>`<p><span class="muted small">${isNew?'<b class="amber">New</b> · ':''}${FEED_KINDS[p.kind]||'Post'}${p.by?' · '+esc(p.by):''}${p.dist?' · '+esc(p.dist):''}${p.kind==='suggest'?'':' · '+feedWhen(p.day)}</span><br>${esc(p.t)}</p>`;
  feedMarkRead();
  ui(`<h2>Bay-Watch Feed</h2><p class="muted">What the city is saying. Nobody here has anything better to do.</p>
  ${sug.map(p=>row(p,p.id!==sugSeen&&p===sug[0])).join('')}
  ${opps.map(o=>row({kind:'opp',dist:o.dist,t:o.t,day:o.day},o.id>oppSeen)).join('')}
  ${saved.map(p=>row(p,p.id>seen)).join('')}
  <p class="amber"><b>Patrol watch:</b> ${esc(baywatchIntel())}</p>
  ${chat.map(p=>row(p,false)).join('')}`,[...opps.map(o=>({label:o.act.label,sub:'Today. Optional.',cls:'',fn:()=>oppAct(o)})),{label:'Back',fn:()=>phone()}]);
}
