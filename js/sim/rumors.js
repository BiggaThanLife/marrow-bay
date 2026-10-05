"use strict";
/* Rumor creation. */
function addRumor(type,ids){
  let r=G.rumors.find(x=>x.type===type);
  if(r){r.str=100;ids.forEach(i=>{if(!r.knows.includes(i))r.knows.push(i)})}
  else G.rumors.push({type,str:100,knows:[...ids]});
}
