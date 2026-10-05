"use strict";
/* Community project progress. */
function projPct(p){const d=PROJECTS.find(x=>x.id===p.id),k=Object.keys(d.need);return Math.round(k.reduce((s,x)=>s+Math.min(1,(p.have[x]||0)/d.need[x]),0)/k.length*100)}
function checkProject(p){
  const d=PROJECTS.find(x=>x.id===p.id);
  if(!p.done&&Object.keys(d.need).every(k=>(p.have[k]||0)>=d.need[k])){p.done=true;G.fx[p.id]=true;notify(`Project complete: ${d.name}. ${d.desc}`);news(`Project complete: ${d.name}. ${d.desc}`,3);return true}
  return false;
}
