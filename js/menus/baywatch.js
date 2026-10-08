"use strict";
/* Phone > Bay-Watch Feed. A made-up neighbourhood app: a few petty posts a day, plus a line on where the patrols are thin. Pure flavor, nothing is saved. */
function baywatchPosts(){
  const d=day(),out=[];
  for(let i=0;i<5;i++){
    const h=hash(d,31+i)>>>0,dist=DISTS[h%DISTS.length];
    out.push({dist,t:BW_COMPLAINTS[(h>>>3)%BW_COMPLAINTS.length].replace('{s}',BW_STREETS[(h>>>7)%BW_STREETS.length]).replace('{n}',String(2+(h>>>11)%48)).replace('{d}',dist)});
  }
  return out;
}
function baywatchIntel(){
  const h=hash(day(),77)>>>0,dist=DISTS[h%DISTS.length];
  if(G.mod&&G.mod.cops)return BW_BUSY[h%BW_BUSY.length].replace('{d}',DISTS[(h>>>2)%DISTS.length]);
  if(G.heat>=2)return `Watchers say the constables are chasing someone and have forgotten about ${dist}.`;
  return BW_QUIET[h%BW_QUIET.length].replace('{d}',dist);
}
function baywatchMenu(){
  const posts=(G.bwExtra||[]).filter(p=>day()-p.day<=2).slice().reverse().concat(baywatchPosts());
  ui(`<h2>Bay-Watch Feed</h2><p class="muted">Posts from your neighbours. Nobody here has anything better to do.</p>
  <p class="amber"><b>Patrol watch:</b> ${esc(baywatchIntel())}</p>
  ${posts.map(p=>`<p><span class="muted small">${esc(p.dist)}</span><br>${esc(p.t)}</p>`).join('')}`,[{label:'Back',fn:()=>phone()}]);
}
